import { useState, useEffect } from "react";
import { VoiceChatView } from "./VoiceChatView";
import { useVoiceChat } from "./useVoiceChat";

type VoiceChatProps = {
	onClose?: () => void;
	onSendQuestion?: (question: string) => void;
};

export const VoiceChat = ({ onClose, onSendQuestion }: VoiceChatProps) => {
	const { isListening, transcript, startListening, stopListening, audioLevel } =
		useVoiceChat();

	const [isProcessing, setIsProcessing] = useState(false);

	// 音声処理が完了した時の処理
	useEffect(() => {
		if (!isListening && transcript) {
			// 音声認識が停止し、かつトランスクリプトがある場合は処理中状態に
			setIsProcessing(true);

			// 処理完了を模擬
			const timer = setTimeout(() => {
				setIsProcessing(false);

				// 処理完了後に質問を送信（onSendQuestionが提供されている場合）
				if (onSendQuestion && transcript) {
					onSendQuestion(transcript);
				}
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [isListening, transcript, onSendQuestion]);

	// 音量に基づいて円のサイズを計算
	const circleSize = 250 + audioLevel * 80;

	// 音声認識の開始ハンドラー
	const handleStartListening = () => {
		startListening();
	};

	// 音声認識の停止ハンドラー
	const handleStopListening = () => {
		stopListening();

		// トランスクリプトが空の場合はすぐに閉じる
		if (!transcript && onClose) {
			setTimeout(onClose, 300);
		}
	};

	return (
		<VoiceChatView
			isListening={isListening}
			transcript={transcript}
			circleSize={circleSize}
			audioLevel={audioLevel}
			isProcessing={isProcessing}
			onStartListening={handleStartListening}
			onStopListening={handleStopListening}
		/>
	);
};
