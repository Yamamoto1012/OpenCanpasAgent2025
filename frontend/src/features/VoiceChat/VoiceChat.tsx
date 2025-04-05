import { useState, useEffect, useRef } from "react";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { VoiceChatView } from "./VoiceChatView";
import { useVoiceChat } from "./useVoiceChat";
import { useAudioContext } from "../VRM/hooks/useAudioContext";

// 思考中の状態を表す型
export type ProcessingState =
	| "initial" // 初期状態
	| "recording" // ユーザー発話中
	| "processing" // 音声認識処理中
	| "thinking" // AI思考中
	| "responding" // AI応答中
	| "waiting" // ユーザー入力待ち
	| "complete"; // 完了

// 会話メッセージの型
type ChatMessage = {
	role: "user" | "assistant";
	content: string;
};
type VoiceChatProps = {
	onClose?: () => void;
	vrmWrapperRef: React.RefObject<VRMWrapperHandle | null>;
};

export const VoiceChat = ({ onClose, vrmWrapperRef }: VoiceChatProps) => {
	const { isListening, transcript, startListening, stopListening } =
		useVoiceChat();
	const { playAudio } = useAudioContext();

	// 会話履歴（コンポーネント内で保持）
	const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

	// 現在の応答テキスト
	const [aiResponse, setAIResponse] = useState<string>("");

	// 処理状態を詳細に管理
	const [processingState, setProcessingState] =
		useState<ProcessingState>("initial");

	// タイマー参照を保持
	const responseTimerRef = useRef<NodeJS.Timeout | null>(null);

	// VRMの思考状態を参照
	const vrmIsThinking = useRef<boolean>(false);

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
			if (vrmWrapperRef.current?.isThinking && vrmIsThinking.current) {
				vrmIsThinking.current = false;
			}
		};
	}, [vrmWrapperRef]);

	// 音声処理が完了した時の処理
	useEffect(() => {
		if (!isListening && transcript) {
			// 音声認識が停止し、かつトランスクリプトがある場合は処理中状態に
			setProcessingState("processing");

			// ユーザーメッセージを保存
			const userMessage = {
				role: "user" as const,
				content: transcript,
			};
			setChatHistory((prev) => [...prev, userMessage]);

			// 1秒後に思考中状態に変更
			const processingTimer = setTimeout(() => {
				setProcessingState("thinking");

				// 思考状態に遷移するが、モーションはStandingIdleのままにする
				if (vrmWrapperRef.current) {
					vrmIsThinking.current = true;

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
	}, [isListening, transcript, vrmWrapperRef]);

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
			setAIResponse(response);
			setChatHistory((prev) => [
				...prev,
				{
					role: "assistant",
					content: response,
				},
			]);

			// 思考状態を終了するが、モーションは変更しない
			if (vrmIsThinking.current) {
				vrmIsThinking.current = false;

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

			vrmIsThinking.current = false;
		}
	};

	// 音声認識の開始ハンドラー
	const handleStartListening = () => {
		setProcessingState("recording");
		setAIResponse("");

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
