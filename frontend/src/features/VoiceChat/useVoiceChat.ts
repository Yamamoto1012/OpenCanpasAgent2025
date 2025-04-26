import { useRef, useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
	isListeningAtom,
	transcriptAtom,
	setTranscriptAtom,
	startListeningAtom,
	stopListeningAtom,
} from "@/store/voiceChatAtoms";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export const useVoiceChat = () => {
	const [isListening] = useAtom(isListeningAtom);
	const [transcript] = useAtom(transcriptAtom);
	const setTranscript = useSetAtom(setTranscriptAtom);
	const initiateStartListening = useSetAtom(startListeningAtom);
	const initiateStopListening = useSetAtom(stopListeningAtom);

	const recognitionRef = useRef<any>(null);
	const { stop: stopTTS } = useTextToSpeech();

	useEffect(() => {
		if (typeof window === "undefined") return;
		const SpeechRecognition =
			(window as any).SpeechRecognition ||
			(window as any).webkitSpeechRecognition;

		if (!SpeechRecognition) return;

		console.log("useVoiceChat effect: isListening =", isListening);

		if (isListening) {
			// 既存インスタンスがあればabortしてnull
			if (recognitionRef.current) {
				try {
					recognitionRef.current.abort();
				} catch {}
				recognitionRef.current = null;
			}
			stopTTS?.();

			const recognition = new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = "ja-JP";

			recognition.onresult = (event: any) => {
				const result = event.results[event.results.length - 1];
				const transcriptText = result[0].transcript;
				setTranscript(transcriptText);
			};
			recognition.onerror = (event: any) => {
				console.error("Speech recognition error", event.error);
				recognitionRef.current = null;
				if (isListening && event.error !== "aborted") initiateStopListening();
			};
			recognition.onend = () => {
				recognitionRef.current = null;
			};

			recognitionRef.current = recognition;
			try {
				recognition.start();
			} catch (e) {
				recognitionRef.current = null;
			}
		} else {
			if (recognitionRef.current) {
				try {
					recognitionRef.current.abort();
				} catch {}
				recognitionRef.current = null;
			}
		}

		return () => {
			if (recognitionRef.current) {
				try {
					recognitionRef.current.abort();
				} catch {}
				recognitionRef.current = null;
			}
		};
		// isListeningだけでなくstopTTSも依存に入れる
	}, [isListening, setTranscript, initiateStopListening, stopTTS]);

	const startListening = async () => {
		console.log("startListening called");
		initiateStartListening();
	};

	const stopListening = () => {
		console.log("stopListening called");
		initiateStopListening();
	};

	return {
		isListening,
		transcript,
		startListening,
		stopListening,
	};
};
