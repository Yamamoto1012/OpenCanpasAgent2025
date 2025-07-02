import type { VRMWrapperHandle } from "@/features/VRM/VRMWrapper/VRMWrapper";
import { useResponsive } from "@/hooks/useResponsive";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { generateText } from "@/services/llmService";
import { sentimentService } from "@/services/sentimentService";
import { addMessageAtom, messagesAtom, resetChatAtom } from "@/store/chatAtoms";
import { currentLanguageAtom } from "@/store/languageAtoms";
import { isRecordingAtom, toggleRecordingAtom } from "@/store/recordingAtoms";
import { addSentimentAnalysisAtom } from "@/store/sentimentDebugStore";
import { useAtom, useSetAtom } from "jotai";
import {
	type ChangeEvent,
	type KeyboardEvent,
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { ChatInterfaceView } from "./ChatInterfaceView";
import { ChatMobileView } from "./ChatMobileView";

export type ChatInterfaceProps = {
	vrmWrapperRef?: React.RefObject<VRMWrapperHandle | null>;
};

export type ChatInterfaceHandle = {
	sendMessage: (message: string) => void;
	stopGeneration: () => void;
};

/**
 * @param props - チャットインターフェースのプロパティ
 * @param ref - 外部からの参照を受け取るためのref
 */

export const ChatInterface = forwardRef<
	ChatInterfaceHandle,
	React.PropsWithChildren<ChatInterfaceProps>
>((props, ref) => {
	const { isMobile } = useResponsive();
	const [messages] = useAtom(messagesAtom);
	const [currentLanguage] = useAtom(currentLanguageAtom);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isRecording] = useAtom(isRecordingAtom);
	const toggleRecording = useSetAtom(toggleRecordingAtom);
	const addMessage = useSetAtom(addMessageAtom);
	const resetChat = useSetAtom(resetChatAtom);
	const addSentimentAnalysis = useSetAtom(addSentimentAnalysisAtom);

	// TTS関連フック
	const { speak, stop } = useTextToSpeech({
		vrmWrapperRef: props.vrmWrapperRef,
	});

	const messagesEndRef = useRef<HTMLDivElement>(null);

	// メッセージIDを採番
	const createId = () => Date.now() + Math.random();

	// 感情分析を実行する関数
	const performSentimentAnalysis = useCallback(
		async (text: string) => {
			if (!text.trim() || text.length < 3) {
				return;
			}

			try {
				const response = await sentimentService.analyzeSentiment(text);
				// 感情分析結果をストアに追加
				addSentimentAnalysis({
					score: response.score,
					category: response.category,
					timestamp: Date.now(),
				});
			} catch (error) {
				console.warn("感情分析実行中にエラーが発生しました:", error);
			}
		},
		[addSentimentAnalysis],
	);

	// メッセージを入れる
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const pushMessage = useCallback(
		(msg: { text: string; isUser: boolean; speakText?: string }) => {
			const enriched = { ...msg, id: createId() };
			addMessage(enriched);

			// AIの返答の場合は感情分析を実行
			if (!enriched.isUser && enriched.text) {
				performSentimentAnalysis(enriched.text);
			}

			if (!enriched.isUser && enriched.speakText) {
				stop();
				speak(enriched.speakText);
			}
		},
		[addMessage, speak, stop, performSentimentAnalysis],
	);

	// 外部から呼び出し可能なメソッドを定義
	useImperativeHandle(ref, () => ({
		sendMessage: (text) => pushMessage({ text, isUser: true }),
		stopGeneration: () => {
			abortRef.current?.abort();
			stop();
			setIsLoading(false);
		},
	}));

	// メッセージ更新時のスクロール処理
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// 入力欄からの値更新
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	// 入力欄の値が変わったとき
	const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
	};

	// メッセージ送信中断用のref
	const abortRef = useRef<AbortController | null>(null);

	// メッセージ送信処理
	const handleSend = async () => {
		const trimmed = input.trim();
		if (!trimmed) return;

		// ユーザーメッセージを追加
		pushMessage({ text: trimmed, isUser: true });

		// 送信中のメッセージをキャンセル
		const controller = new AbortController();
		abortRef.current = controller;

		// 思考中状態に設定
		setIsLoading(true);

		try {
			const answer = await generateText(
				trimmed,
				undefined,
				controller.signal,
				undefined,
				"/query",
				currentLanguage,
			);
			setIsLoading(false);
			pushMessage({ text: answer, isUser: false, speakText: answer });
		} catch (err) {
			if (err instanceof Error && err.name === "AbortError") {
				pushMessage({ text: "（生成を停止しました）", isUser: false });
			} else {
				setIsLoading(false);
				pushMessage({
					text: "すみません、応答の生成中にエラーが発生しました。もう一度お試しください。",
					isUser: false,
				});
			}
		}
		setInput("");
	};

	// Enter キー送信
	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
			e.preventDefault();
			handleSend();
		}
	};

	// 候補テキスト選択時の処理
	const handleSelect = (value: string) => {
		setInput((prev) => prev + value);
	};

	// チャットリセット処理
	const handleReset = () => {
		resetChat();
	};

	// 音声録音のトグル
	const handleToggleRecording = () => {
		toggleRecording((recognizedText: string) => {
			if (recognizedText) {
				setInput(recognizedText);
			}
		});
	};

	// 共通のprops
	const commonProps = {
		messages,
		inputValue: input,
		isThinking: isLoading,
		isRecording,
		onInputChange: handleInputChange,
		onKeyDown: handleKeyDown,
		onSend: handleSend,
		onToggleRecording: handleToggleRecording,
		messagesEndRef,
	};

	// デスクトップ専用のprops
	const desktopProps = {
		...commonProps,
		onSelect: handleSelect,
		onReset: handleReset,
		onStop: () => {
			abortRef.current?.abort();
			stop();
			setIsLoading(false);
		},
	};

	// デバイスに応じて適切なViewを選択
	return isMobile ? (
		<ChatMobileView {...commonProps} />
	) : (
		<ChatInterfaceView {...desktopProps} />
	);
});
