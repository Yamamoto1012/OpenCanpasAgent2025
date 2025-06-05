import {
	useEffect,
	useRef,
	useCallback,
	type KeyboardEvent,
	type ChangeEvent,
} from "react";
import { useAtom, useSetAtom } from "jotai";
import { SimpleMobileChatView } from "./SimpleMobileChatView";
import {
	simpleChatMessagesAtom,
	simpleChatInputAtom,
	simpleChatIsThinkingAtom,
	addSimpleChatMessageAtom,
} from "@/store/simpleChatAtoms";
import { generateText } from "@/services/llmService";

/**
 * SimpleMobileChatのコンテナコンポーネント
 * ビジネスロジックとAPI連携を管理
 */
export const SimpleMobileChat: React.FC = () => {
	const [messages] = useAtom(simpleChatMessagesAtom);
	const [inputValue, setInputValue] = useAtom(simpleChatInputAtom);
	const [isThinking, setIsThinking] = useAtom(simpleChatIsThinkingAtom);
	const addMessage = useSetAtom(addSimpleChatMessageAtom);

	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	// メッセージ末尾へのスクロール
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "end",
		});
	}, []);

	// メッセージ追加時に自動スクロール
	useEffect(() => {
		scrollToBottom();
	}, [messages, isThinking, scrollToBottom]);

	// AI応答の処理
	const handleAIResponse = useCallback(
		async (userMessage: string) => {
			setIsThinking(true);

			// AbortControllerで中断可能にする
			abortRef.current = new AbortController();

			try {
				const response = await generateText(
					userMessage,
					{}, // 空のcontextオブジェクト
					abortRef.current.signal,
				);

				if (!abortRef.current.signal.aborted) {
					addMessage({
						text: response,
						isUser: false,
					});
				}
			} catch (error) {
				if (!abortRef.current?.signal.aborted) {
					console.error("AI応答の生成に失敗しました:", error);
					addMessage({
						text: "申し訳ございません。エラーが発生しました。もう一度お試しください。",
						isUser: false,
					});
				}
			} finally {
				if (!abortRef.current?.signal.aborted) {
					setIsThinking(false);
				}
				abortRef.current = null;
			}
		},
		[addMessage, setIsThinking],
	);

	// メッセージ送信処理
	const handleSend = useCallback(() => {
		const message = inputValue.trim();
		if (!message || isThinking) return;

		// ユーザーメッセージを追加
		addMessage({
			text: message,
			isUser: true,
		});

		// 入力欄をクリア
		setInputValue("");

		// AI応答を開始
		handleAIResponse(message);
	}, [inputValue, isThinking, addMessage, setInputValue, handleAIResponse]);

	// 入力値変更ハンドラ
	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			setInputValue(e.target.value);
		},
		[setInputValue],
	);

	// キーボード入力ハンドラ（Enterで送信）
	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSend();
			}
		},
		[handleSend],
	);

	// コンポーネントアンマウント時にAPI呼び出しを中断
	useEffect(() => {
		return () => {
			abortRef.current?.abort();
		};
	}, []);

	return (
		<SimpleMobileChatView
			messages={messages}
			inputValue={inputValue}
			isThinking={isThinking}
			onInputChange={handleInputChange}
			onKeyDown={handleKeyDown}
			onSend={handleSend}
			messagesEndRef={messagesEndRef}
		/>
	);
};
