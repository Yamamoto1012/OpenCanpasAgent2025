import { useState, useEffect } from "react";
import { VoiceChatView } from "./VoiceChatView";
import { useVoiceChat } from "./useVoiceChat";

// 思考中の状態を表す型
export type ProcessingState =
	| "initial"
	| "recording"
	| "processing"
	| "thinking"
	| "complete";

type VoiceChatProps = {
	onClose?: () => void;
	onSendQuestion?: (question: string) => void;
};

export const VoiceChat = ({ onClose, onSendQuestion }: VoiceChatProps) => {
	const { isListening, transcript, startListening, stopListening, audioLevel } =
		useVoiceChat();

	// 処理状態を詳細に管理
	const [processingState, setProcessingState] =
		useState<ProcessingState>("initial");

	// 音声処理が完了した時の処理
	useEffect(() => {
		if (!isListening && transcript) {
			// 音声認識が停止し、かつトランスクリプトがある場合は処理中状態に
			setProcessingState("processing");

			// 1秒後に思考中状態に変更
			const processingTimer = setTimeout(() => {
				setProcessingState("thinking");

				// 処理完了後に質問を送信（onSendQuestionが提供されている場合）
				if (onSendQuestion && transcript) {
					onSendQuestion(transcript);
				}

				// 一定時間後に完了状態(仮)
				const thinkingTimer = setTimeout(() => {
					setProcessingState("complete");
				}, 3000);

				return () => clearTimeout(thinkingTimer);
			}, 1000);

			return () => clearTimeout(processingTimer);
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else if (isListening) {
			// 録音中の状態
			setProcessingState("recording");
		}
	}, [isListening, transcript, onSendQuestion]);

	// 音量に基づいて円のサイズを計算
	const circleSize = 250 + audioLevel * 80;

	// 音声認識の開始ハンドラー
	const handleStartListening = () => {
		setProcessingState("recording");
		startListening();
	};

	// 音声認識の停止ハンドラー
	const handleStopListening = () => {
		stopListening();
	};

	return (
		<VoiceChatView
			isListening={isListening}
			transcript={transcript}
			circleSize={circleSize}
			audioLevel={audioLevel}
			isProcessing={
				processingState === "processing" || processingState === "thinking"
			}
			onStartListening={handleStartListening}
			onStopListening={handleStopListening}
		/>
	);
};
