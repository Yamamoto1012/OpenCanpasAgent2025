import { useEffect, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { VoiceChatView } from "./VoiceChatView";
import { useVoiceChat } from "./useVoiceChat";
import { useAudioContext } from "../VRM/hooks/useAudioContext";
import {
	aiResponseAtom,
	processingStateAtom,
	chatHistoryAtom,
	vrmIsThinkingAtom,
	addUserMessageAtom,
	addAiMessageAtom,
	setProcessingStateAtom,
	setVrmThinkingStateAtom,
} from "@/store/voiceChatAtoms";

type VoiceChatProps = {
	onClose?: () => void;
	vrmWrapperRef: React.RefObject<VRMWrapperHandle | null>;
};

export const VoiceChat = ({ onClose, vrmWrapperRef }: VoiceChatProps) => {
	// カスタムフックから音声認識機能を取得
	const { isListening, transcript, startListening, stopListening } =
		useVoiceChat();
	const { playAudio } = useAudioContext();

	const [aiResponse] = useAtom(aiResponseAtom);
	const [processingState] = useAtom(processingStateAtom);
	const [chatHistory] = useAtom(chatHistoryAtom);
	const [vrmIsThinking] = useAtom(vrmIsThinkingAtom);

	// Atomを更新するためのセッター関数
	const setProcessingState = useSetAtom(setProcessingStateAtom);
	const setVrmThinkingState = useSetAtom(setVrmThinkingStateAtom);
	const addUserMessage = useSetAtom(addUserMessageAtom);
	const addAiMessage = useSetAtom(addAiMessageAtom);

	// タイマー参照を保持
	const responseTimerRef = useRef<NodeJS.Timeout | null>(null);

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
		// 簡易的なレスポンスをシミュレーション
		try {
			// 応答生成を模擬（2〜3秒程度）
			await new Promise((resolve) =>
				setTimeout(resolve, 2000 + Math.random() * 1000),
			);

			// サンプルレスポンス（実際はAPIから取得）
			const response = `「${userInput}」というご質問ですね。承りました。こちらについて回答いたします。
この内容については詳しく調べる必要がありますが、一般的には以下のように考えられています...`;

			// 応答を保存
			addAiMessage(response);

			// 思考状態を終了するが、モーションは変更しない
			if (vrmIsThinking) {
				setVrmThinkingState(false);

				// StandingIdleモーションを維持
				if (vrmWrapperRef.current?.crossFadeAnimation) {
					vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
				}
			}

			// 応答状態に変更
			setProcessingState("responding");

			// 音声再生（実際は生成した音声URLを使用）
			playAudio("/audio/test.mp3");

			// 応答完了後、ユーザー入力待ち状態に
			responseTimerRef.current = setTimeout(() => {
				setProcessingState("waiting");

				// 待機状態でもStandingIdleモーションを維持
				if (vrmWrapperRef.current?.crossFadeAnimation) {
					vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
				}
			}, 5000); // 音声再生想定時間
		} catch (error) {
			console.error("AI応答生成エラー:", error);
			setProcessingState("waiting");

			// エラー発生時もStandingIdleモーションを維持
			if (vrmWrapperRef.current?.crossFadeAnimation) {
				vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
			}

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
