import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { generateText } from "@/services/llmService";
import { currentLanguageAtom } from "@/store/languageAtoms";
import {
	addAiMessageAtom,
	addUserMessageAtom,
	aiResponseAtom,
	chatHistoryAtom,
	processingStateAtom,
	setProcessingStateAtom,
	setVrmThinkingStateAtom,
	vrmIsThinkingAtom,
} from "@/store/voiceChatAtoms";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { VoiceChatView } from "./VoiceChatView";
import { useVoiceChat } from "./useVoiceChat";

type VoiceChatProps = {
	onClose?: () => void;
	vrmWrapperRef: React.RefObject<VRMWrapperHandle | null>;
};

export const VoiceChat = ({ onClose, vrmWrapperRef }: VoiceChatProps) => {
	// カスタムフックから音声認識機能を取得
	const { isListening, transcript, startListening, stopListening } =
		useVoiceChat();
	const { speak } = useTextToSpeech({ vrmWrapperRef });

	const [aiResponse] = useAtom(aiResponseAtom);
	const [processingState] = useAtom(processingStateAtom);
	const [chatHistory] = useAtom(chatHistoryAtom);
	const [vrmIsThinking] = useAtom(vrmIsThinkingAtom);
	const [currentLanguage] = useAtom(currentLanguageAtom);

	// Atomを更新するためのセッター関数
	const setProcessingState = useSetAtom(setProcessingStateAtom);
	const setVrmThinkingState = useSetAtom(setVrmThinkingStateAtom);
	const addUserMessage = useSetAtom(addUserMessageAtom);
	const addAiMessage = useSetAtom(addAiMessageAtom);

	// タイマー参照を保持
	const responseTimerRef = useRef<NodeJS.Timeout | null>(null);
	const [lastSpokenTime, setLastSpokenTime] = useState<number | null>(null);
	const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// transcriptが更新されるたびに最終発話時刻を記録
	useEffect(() => {
		if (isListening && transcript) {
			setLastSpokenTime(Date.now());
		}
	}, [transcript, isListening]);

	// isListening中は無音監視タイマーを動かす
	useEffect(() => {
		if (!isListening) {
			if (silenceTimeoutRef.current) {
				clearInterval(silenceTimeoutRef.current);
			}
			return;
		}
		setLastSpokenTime(Date.now());
		silenceTimeoutRef.current = setInterval(() => {
			if (lastSpokenTime && Date.now() - lastSpokenTime > 1500) {
				// 1.5秒無音なら自動停止
				stopListening();
			}
		}, 300);
		return () => {
			if (silenceTimeoutRef.current) {
				clearInterval(silenceTimeoutRef.current);
			}
		};
	}, [isListening, lastSpokenTime, stopListening]);

	// コンポーネントがマウントされたら、モーションをStandingIdleに設定する
	useEffect(() => {
		// 音声チャット表示時に最初からStandingIdleモーションに変更
		if (vrmWrapperRef.current?.crossFadeAnimation) {
			vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
		}

		return () => {
			// タイマーをクリア
			if (responseTimerRef.current) {
				clearTimeout(responseTimerRef.current);
			}

			// VRMの思考モードを必ず終了
			if (vrmWrapperRef.current?.isThinking && vrmIsThinking) {
				setVrmThinkingState(false);
			}
		};
	}, [vrmWrapperRef, vrmIsThinking, setVrmThinkingState]);

	// 音声処理が完了した時の処理
	useEffect(() => {
		if (!isListening && transcript) {
			// 音声認識が停止し、かつトランスクリプトがある場合は処理中状態に
			setProcessingState("processing");

			// ユーザーメッセージを保存
			addUserMessage(transcript);

			// 1秒後に思考中状態に変更
			const processingTimer = setTimeout(() => {
				setProcessingState("thinking");

				// 思考状態に遷移するが、モーションはStandingIdleのままにする
				if (vrmWrapperRef.current) {
					setVrmThinkingState(true);

					// StandingIdleモーションを維持
					vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
				}

				// AIの返答を生成（実際はAPIを呼び出す）
				generateAIResponse(transcript);
			}, 1000);

			return () => clearTimeout(processingTimer);
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else if (isListening) {
			// 録音中の状態
			setProcessingState("recording");

			// 録音中も必ずStandingIdleモーションを維持
			if (vrmWrapperRef.current?.crossFadeAnimation) {
				vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
			}
		}
	}, [
		isListening,
		transcript,
		vrmWrapperRef,
		setProcessingState,
		setVrmThinkingState,
		addUserMessage,
	]);

	// AIの応答を生成する関数（APIとの通信部分）
	const generateAIResponse = async (userInput: string) => {
		try {
			// 応答を保存
			const response = await generateText(
				userInput,
				undefined,
				undefined,
				3,
				"/voice_mode_answer",
				currentLanguage,
			);

			addAiMessage(response);

			// 応答状態に変更
			setProcessingState("responding");

			// TTSで音声再生
			await speak(response);
			setProcessingState("initial");
		} catch (error) {
			console.error("AI応答生成エラー:", error);
			setProcessingState("initial");

			setVrmThinkingState(false);
		}
	};

	// 音声認識の開始ハンドラー
	const handleStartListening = () => {
		setProcessingState("recording");

		// VRMのモーションをStandingIdleに変更
		if (vrmWrapperRef.current?.crossFadeAnimation) {
			vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
		}

		startListening();
	};

	// 音声認識の停止ハンドラー
	const handleStopListening = () => {
		stopListening();

		// 停止時もStandingIdleモーションを維持
		if (vrmWrapperRef.current?.crossFadeAnimation) {
			vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
		}
	};

	return (
		<VoiceChatView
			isListening={isListening}
			transcript={transcript}
			aiResponse={aiResponse}
			processingState={processingState}
			chatHistory={chatHistory}
			onStartListening={handleStartListening}
			onStopListening={handleStopListening}
			onClose={onClose}
		/>
	);
};
