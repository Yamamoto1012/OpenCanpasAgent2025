import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	type KeyboardEvent,
	type ChangeEvent,
} from "react";
import { useAtom, useSetAtom } from "jotai";
import { ChatInterfaceView } from "./ChatInterfaceView";
import {
	messagesAtom,
	inputValueAtom,
	isThinkingAtom,
	addMessageAtom,
	resetChatAtom,
	getRandomText,
} from "@/store/chatAtoms";
import {
	isRecordingAtom,
	toggleRecordingAtom,
	randomTextGeneratorAtom,
} from "@/store/recordingAtoms";

export type ChatInterfaceHandle = {
	addMessage: (text: string, isUser?: boolean) => void;
};

export type ChatInterfaceProps = {
	onSendQuestion?: (question: string) => void;
};

export const ChatInterface = forwardRef<
	ChatInterfaceHandle,
	React.PropsWithChildren<ChatInterfaceProps>
>((props, ref) => {
	const [messages, setMessages] = useAtom(messagesAtom);
	const [inputValue, setInputValue] = useAtom(inputValueAtom);
	const [isThinking, setIsThinking] = useAtom(isThinkingAtom);
	const [isRecording] = useAtom(isRecordingAtom);
	const toggleRecording = useSetAtom(toggleRecordingAtom);
	const addMessage = useSetAtom(addMessageAtom);
	const resetChat = useSetAtom(resetChatAtom);
	const setRandomTextGenerator = useSetAtom(randomTextGeneratorAtom);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	// ランダムテキスト生成関数を設定
	useEffect(() => {
		setRandomTextGenerator(getRandomText);
	}, [setRandomTextGenerator]);

	// メッセージ更新時にスクロールするための処理
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// 外部から呼び出し可能なメソッドを定義
	useImperativeHandle(ref, () => ({
		addMessage: (text: string, isUser = false) => {
			addMessage({ text, isUser });
		},
	}));

	// メッセージ更新時のスクロール処理
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// 入力欄からの値更新
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	// メッセージ送信処理
	const handleSend = () => {
		const trimmedInput = inputValue.trim();
		if (!trimmedInput) return;

		// ユーザーメッセージを追加
		addMessage({ text: trimmedInput, isUser: true });

		// 親コンポーネントに質問を通知
		if (props.onSendQuestion) {
			props.onSendQuestion(trimmedInput);
		} else {
			// 既存の自動応答ロジックはバックアップとして使用
			setIsThinking(true);
			setTimeout(() => {
				setIsThinking(false);
				addMessage({
					text: "ご質問ありがとうございます。お答えします！",
					isUser: false,
				});
			}, 3000);
		}

		// 入力欄をクリア
		setInputValue("");
	};

	// Enter キー送信
	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
			e.preventDefault();
			handleSend();
		}
	};

	// 候補テキスト選択時の処理
	const handleSelect = (value: string) => {
		setInputValue((prev) => prev + value);
	};

	// チャットリセット処理
	const handleReset = () => {
		resetChat();
	};

	// 音声録音のトグル
	const handleToggleRecording = () => {
		toggleRecording((text) => {
			if (text) {
				setInputValue(text);
			}
		});
	};

	return (
		<ChatInterfaceView
			messages={messages}
			inputValue={inputValue}
			isThinking={isThinking}
			isRecording={isRecording}
			onInputChange={handleInputChange}
			onKeyDown={handleKeyDown}
			onSend={handleSend}
			onSelect={handleSelect}
			onReset={handleReset}
			onToggleRecording={handleToggleRecording}
			messagesEndRef={messagesEndRef}
		/>
	);
});

// MessageタイプはchatAtoms.tsに移動したため、ここではexportしない
