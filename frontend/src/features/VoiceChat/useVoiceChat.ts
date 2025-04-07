import { useRef, useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
	isListeningAtom,
	transcriptAtom,
	setTranscriptAtom,
	startListeningAtom,
	stopListeningAtom,
} from "@/store/voiceChatAtoms";

type SpeechRecognitionEvent = Event & {
	results: SpeechRecognitionResultList;
};

type SpeechRecognitionErrorEvent = Event & {
	error: string;
	message?: string;
};

type SpeechRecognitionResult = {
	isFinal: boolean;
} & {
	[index: number]: {
		confidence: number;
		transcript: string;
	};
};

type SpeechRecognitionResultList = {
	length: number;
} & {
	[index: number]: SpeechRecognitionResult;
};

type SpeechRecognition = EventTarget & {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start(): void;
	stop(): void;
	onresult: (event: SpeechRecognitionEvent) => void;
	onerror: (event: SpeechRecognitionErrorEvent) => void;
};

declare global {
	interface Window {
		SpeechRecognition?: new () => SpeechRecognition;
		webkitSpeechRecognition?: new () => SpeechRecognition;
	}
}

/**
 * 音声認識機能を提供するカスタムフック
 * Jotaiアトムを使用して状態管理を行う
 */
export const useVoiceChat = () => {
	const [isListening] = useAtom(isListeningAtom);
	const [transcript] = useAtom(transcriptAtom);
	const setTranscript = useSetAtom(setTranscriptAtom);
	const initiateStartListening = useSetAtom(startListeningAtom);
	const initiateStopListening = useSetAtom(stopListeningAtom);

	const recognitionRef = useRef<SpeechRecognition | null>(null);

	// SpeechRecognitionの初期化
	useEffect(() => {
		if (typeof window !== "undefined") {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;

			if (SpeechRecognition) {
				const recognition = new SpeechRecognition();
				recognition.continuous = true;
				recognition.interimResults = true;
				recognition.lang = "ja-JP"; // 日本語に設定

				recognition.onresult = (event: SpeechRecognitionEvent) => {
					const result = event.results[event.results.length - 1];
					const transcriptText = result[0].transcript;
					setTranscript(transcriptText);
				};

				recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
					console.error("Speech recognition error", event.error);
					stopListening();
				};

				recognitionRef.current = recognition;
			}
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, [setTranscript]);

	// isListeningの変更を検出し、実際の音声認識APIを制御
	useEffect(() => {
		const recognition = recognitionRef.current;
		if (!recognition) return;

		if (isListening) {
			try {
				recognition.start();
			} catch (error) {
				console.error("Failed to start speech recognition:", error);
			}
		} else {
			try {
				recognition.stop();
			} catch (error) {
				console.error("Failed to stop speech recognition:", error);
			}
		}
	}, [isListening]);

	// 音声認識を開始する関数
	const startListening = async () => {
		initiateStartListening();
	};

	// 音声認識を停止する関数
	const stopListening = () => {
		initiateStopListening();
	};

	return {
		isListening,
		transcript,
		startListening,
		stopListening,
	};
};
