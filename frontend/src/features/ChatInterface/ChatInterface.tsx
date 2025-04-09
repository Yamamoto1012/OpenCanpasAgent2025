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
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export type ChatInterfaceHandle = {
	addMessage: (text: string, isUser?: boolean, speakText?: string) => void;
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

	// 音声合成フックを使用
	const { speak, stop } = useTextToSpeech();

	// 最後に再生したメッセージのIDを保存するための参照
	const lastSpokenMessageIdRef = useRef<number | null>(null);

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
		addMessage: (text: string, isUser = false, speakText?: string) => {
			addMessage({ text, isUser, speakText });
		},
	}));

	// メッセージ更新時のスクロール処理と音声合成
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// スクロール処理
		scrollToBottom();

		// 最新のメッセージを取得
		const latestMessage = messages[messages.length - 1];

		// 最新のメッセージが存在し、ユーザーからのメッセージでなく、speakTextが設定されている場合
		if (
			latestMessage &&
			!latestMessage.isUser &&
			latestMessage.speakText &&
			latestMessage.id !== lastSpokenMessageIdRef.current // 以前に再生したメッセージでないことを確認
		) {
			// 再生前に以前の音声を停止
			stop();

			// 少し遅延を入れて音声合成を実行（UIの更新が完了してから）
			setTimeout(() => {
				speak(latestMessage.speakText || "");
				// 再生したメッセージのIDを記録
				lastSpokenMessageIdRef.current = latestMessage.id;
			}, 100);
		}
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
