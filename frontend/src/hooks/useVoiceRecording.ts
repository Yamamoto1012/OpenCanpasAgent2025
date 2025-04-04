import { useRef, useState, useEffect } from "react";

type UseVoiceRecordingProps = {
	onRecognizedText: (text: string) => void;
	getRandomText: () => string;
	recordingDuration?: number;
};

/**
 * 音声録音機能を提供するカスタムフック
 */
export const useVoiceRecording = ({
	onRecognizedText,
	getRandomText,
	recordingDuration = 5000,
}: UseVoiceRecordingProps) => {
	const [isRecording, setIsRecording] = useState(false);
	const mockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// 音声録音の開始/停止を切り替える
	const toggleRecording = () => {
		if (isRecording) {
			// 録音停止処理
			stopRecording();
		} else {
			// 録音開始処理
			startRecording();
		}
	};

	// 録音開始
	const startRecording = async () => {
		try {
			// マイクへのアクセス許可を取得
			await navigator.mediaDevices.getUserMedia({ audio: true });
			setIsRecording(true);
			console.log("録音を開始しました");

			// 前回のタイマーが残っていたらクリア
			if (mockTimeoutRef.current) {
				clearTimeout(mockTimeoutRef.current);
			}

			// TODO: 実際の音声認識APIと連携する場合はここで処理
			// モックとして設定時間後に録音停止とテキスト反映
			mockTimeoutRef.current = setTimeout(() => {
				const randomText = getRandomText();
				stopRecording(randomText);
			}, recordingDuration);
		} catch (error) {
			console.error("マイクの使用許可が得られませんでした:", error);
			alert("マイクへのアクセスを許可してください。");
			setIsRecording(false);
		}
	};

	// 録音停止
	const stopRecording = (recognizedText?: string) => {
		// タイマーをクリア
		if (mockTimeoutRef.current) {
			clearTimeout(mockTimeoutRef.current);
			mockTimeoutRef.current = null;
		}
		setIsRecording(false);
		console.log("録音を停止しました");

		// 認識テキストがある場合は処理
		if (recognizedText) {
			onRecognizedText(recognizedText);
		}
	};

	// コンポーネントのアンマウント時にタイマーをクリア
	useEffect(() => {
		return () => {
			if (mockTimeoutRef.current) {
				clearTimeout(mockTimeoutRef.current);
			}
		};
	}, []);

	return {
		isRecording,
		toggleRecording,
		startRecording,
		stopRecording,
	};
};
