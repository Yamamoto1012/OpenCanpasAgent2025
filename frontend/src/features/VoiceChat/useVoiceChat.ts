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
	const [audioLevel, setAudioLevel] = useState(0);

	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const micStreamRef = useRef<MediaStream | null>(null);
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const dataArrayRef = useRef<Uint8Array | null>(null);

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

	// 音声の再生レベルを取得する関数
	const setupAudio = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			micStreamRef.current = stream;

			audioContextRef.current = new AudioContext();
			analyserRef.current = audioContextRef.current.createAnalyser();
			analyserRef.current.fftSize = 256;

			const source = audioContextRef.current.createMediaStreamSource(stream);
			source.connect(analyserRef.current);

			dataArrayRef.current = new Uint8Array(
				analyserRef.current.frequencyBinCount,
			);

			updateAudioLevel();
		} catch (error) {
			console.error("Error accessing microphone:", error);
		}
	};

	// 音声レベルを更新する関数
	const updateAudioLevel = () => {
		if (!analyserRef.current || !dataArrayRef.current) return;

		analyserRef.current.getByteFrequencyData(dataArrayRef.current);

		// 平均音量レベルを計算
		const average =
			dataArrayRef.current.reduce((acc, val) => acc + val, 0) /
			dataArrayRef.current.length;

		// 0-1の範囲に正規化してスケーリング
		const normalizedLevel = Math.min(1, average / 128) * 0.7;
		setAudioLevel(normalizedLevel);

		animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
	};

	// 音声認識を開始する関数
	const startListening = async () => {
		setIsListening(true);
		setTranscript("");

		await setupAudio();

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

		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}

		const micStream = micStreamRef.current;
		if (micStream) {
			// forEach を for...of に置き換える
			for (const track of micStream.getTracks()) {
				track.stop();
			}
		}

		const audioContext = audioContextRef.current;
		if (audioContext && audioContext.state !== "closed") {
			audioContext.close();
		}
	};

	return {
		isListening,
		transcript,
		audioLevel,
		startListening,
		stopListening,
	};
};
