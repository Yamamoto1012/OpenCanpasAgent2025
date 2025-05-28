import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	type KeyboardEvent,
	type ChangeEvent,
	useCallback,
	useState,
} from "react";
import { useAtom, useSetAtom } from "jotai";
import { ChatInterfaceView } from "./ChatInterfaceView";
import { messagesAtom, addMessageAtom, resetChatAtom } from "@/store/chatAtoms";
import { isRecordingAtom, toggleRecordingAtom } from "@/store/recordingAtoms";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { generateText } from "@/services/llmService";
import type { VRMWrapperHandle } from "@/features/VRM/VRMWrapper/VRMWrapper";

export type ChatInterfaceProps = {
	vrmWrapperRef?: React.RefObject<VRMWrapperHandle | null>;
};

export type ChatInterfaceHandle = {
	sendMessage: (message: string) => void;
	stopGeneration: () => void;
};

export const ChatInterface = forwardRef<
	ChatInterfaceHandle,
	React.PropsWithChildren<ChatInterfaceProps>
>((props, ref) => {
	const [messages] = useAtom(messagesAtom);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isRecording] = useAtom(isRecordingAtom);
	const toggleRecording = useSetAtom(toggleRecordingAtom);
	const addMessage = useSetAtom(addMessageAtom);
	const resetChat = useSetAtom(resetChatAtom);

	// TTS関連フック
	const { speak, stop } = useTextToSpeech({
		vrmWrapperRef: props.vrmWrapperRef,
	});

	const messagesEndRef = useRef<HTMLDivElement>(null);

	// メッセージIDを採番
	const createId = () => Date.now() + Math.random();

	// メッセージを入れる
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const pushMessage = useCallback(
		(msg: { text: string; isUser: boolean; speakText?: string }) => {
			const enriched = { ...msg, id: createId() };
			addMessage(enriched);
			if (!enriched.isUser && enriched.speakText) {
				stop();
				speak(enriched.speakText);
			}
		},
		[addMessage, speak, stop],
	);

	// 外部から呼び出し可能なメソッドを定義
	useImperativeHandle(ref, () => ({
		// biome-ignore lint/style/useDefaultParameterLast: <explanation>
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

	return (
		<ChatInterfaceView
			messages={messages}
			inputValue={input}
			isThinking={isLoading}
			isRecording={isRecording}
			onInputChange={handleInputChange}
			onKeyDown={handleKeyDown}
			onSend={handleSend}
			onSelect={handleSelect}
			onReset={handleReset}
			onToggleRecording={handleToggleRecording}
			onStop={() => {
				abortRef.current?.abort();
				stop();
				setIsLoading(false);
			}}
			messagesEndRef={messagesEndRef}
		/>
	);
});
