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
import { generateText } from "@/services/llmService";
import { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";

export type ChatInterfaceHandle = {
	addMessage: (text: string, isUser?: boolean, speakText?: string) => void;
};

export type ChatInterfaceProps = {
	onSendQuestion?: (question: string) => void;
	vrmWrapperRef?: React.RefObject<VRMWrapperHandle | null>;
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
	const { speak, stop } = useTextToSpeech(props.vrmWrapperRef);

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
	const handleSend = async () => {
		const trimmedInput = inputValue.trim();
		if (!trimmedInput) return;

		// ユーザーメッセージを追加
		addMessage({ text: trimmedInput, isUser: true });

		// 思考中状態に設定
		setIsThinking(true);

		// 親コンポーネントに質問を通知
		if (props.onSendQuestion) {
			props.onSendQuestion(trimmedInput);
			setInputValue("");
			return;
		}

		try {
			// LLM APIを使用して回答を生成
			const answer = await generateText(trimmedInput);
			// 思考中状態を解除
			setIsThinking(false);
			// 回答メッセージを追加（音声合成用のテキストも同じものを使用）
			addMessage({
				text: answer,
				isUser: false,
				speakText: answer,
			});
		} catch (error) {
			console.error("Error generating response:", error);
			setIsThinking(false);
			addMessage({
				text: "すみません、応答の生成中にエラーが発生しました。もう一度お試しください。",
				isUser: false,
			});
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
