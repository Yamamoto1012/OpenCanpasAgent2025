import { useState, useRef, useEffect } from "react";

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

export const useVoiceChat = () => {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState("");

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
					const transcript = result[0].transcript;
					setTranscript(transcript);
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
	}, []);

	// 音声認識を開始する関数
	const startListening = async () => {
		setIsListening(true);
		setTranscript("");

		const recognition = recognitionRef.current;
		if (recognition) {
			recognition.start();
		}
	};

	// 音声認識を停止する関数
	const stopListening = () => {
		setIsListening(false);

		const recognition = recognitionRef.current;
		if (recognition) {
			recognition.stop();
		}
	};

	return {
		isListening,
		transcript,
		startListening,
		stopListening,
	};
};
