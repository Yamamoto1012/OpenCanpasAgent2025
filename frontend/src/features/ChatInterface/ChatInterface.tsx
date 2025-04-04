import {
	type ChangeEvent,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
	type KeyboardEvent,
} from "react";
import { ChatInterfaceView } from "./ChatInterfaceView";

export type Message = {
	id: number;
	text: string;
	isUser: boolean;
};

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
	const [messages, setMessages] = useState<Message[]>([
		{ id: 1, text: "金沢工業大学へようこそ!!", isUser: false },
		{ id: 2, text: "なんでも質問してください!!", isUser: false },
	]);
	const [inputValue, setInputValue] = useState("");
	const [isThinking, setIsThinking] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// メッセージ更新時にスクロールするための処理
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// 外部から呼び出し可能なメソッドを定義
	useImperativeHandle(ref, () => ({
		addMessage: (text: string, isUser = false) => {
			setMessages((currentMessages) => [
				...currentMessages,
				{
					id: currentMessages.length + 1,
					text,
					isUser,
				},
			]);
		},
	}));

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// 入力欄からの値更新
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	// マイク録音の開始/停止を切り替える
	const toggleRecording = () => {
		if (isRecording) {
			// 録音停止処理
			stopRecording();
		} else {
			// 録音開始処理
			startRecording();
		}
	};

	// 録音開始
	const startRecording = async () => {
		try {
			// マイクへのアクセス許可を取得
			await navigator.mediaDevices.getUserMedia({ audio: true });
			setIsRecording(true);
			console.log("録音を開始しました");

			// TODO: 実際の音声認識APIと連携する場合はここで処理
			// モックとして5秒後に録音停止とテキスト反映
			const mockTimeout = setTimeout(() => {
				const randomQuestions = [
					"金沢工業大学の学部について教えてください",
					"キャンパスの施設について知りたいです",
					"学食のおすすめメニューは何ですか？",
					"金沢工業大学の就職率はどのくらいですか？",
					"プロジェクト活動について教えてください",
				];
				const randomIndex = Math.floor(Math.random() * randomQuestions.length);
				stopRecording(randomQuestions[randomIndex]);
			}, 5000);

			// クリーンアップ関数
			return () => clearTimeout(mockTimeout);
		} catch (error) {
			console.error("マイクの使用許可が得られませんでした:", error);
			alert("マイクへのアクセスを許可してください。");
			setIsRecording(false);
		}
	};

	// 録音停止
	const stopRecording = (recognizedText?: string) => {
		setIsRecording(false);
		console.log("録音を停止しました");

		// 認識テキストがある場合は入力欄に反映
		if (recognizedText) {
			setInputValue(recognizedText);
		}
	};

	// メッセージ送信処理（空白のみは送信しない）
	const handleSend = () => {
		if (inputValue.trim()) {
			setMessages([
				...messages,
				{
					id: messages.length + 1,
					text: inputValue,
					isUser: true,
				},
			]);
			// 親コンポーネントに質問を通知
			if (props.onSendQuestion) {
				props.onSendQuestion(inputValue.trim());
			} else {
				// 既存の自動応答ロジックはバックアップとして使用
				setIsThinking(true);
				setTimeout(() => {
					setIsThinking(false);
					setMessages((currentMessages) => [
						...currentMessages,
						{
							id: currentMessages.length + 1,
							text: "ご質問ありがとうございます。お答えします！",
							isUser: false,
						},
					]);
				}, 3000);
			}

			setInputValue("");
		}
	};

	// Enter キー送信
	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleSelect = (value: string) => {
		setInputValue((prev) => prev + value);
	};

	const handleReset = () => {
		setMessages([
			{ id: 1, text: "金沢工業大学へようこそ!!", isUser: false },
			{ id: 2, text: "なんでも質問してください!!", isUser: false },
		]);
		setIsThinking(false);
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
			onToggleRecording={toggleRecording}
			messagesEndRef={messagesEndRef}
		/>
	);
});
