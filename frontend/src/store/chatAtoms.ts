import { atom } from "jotai";

/**
 * メッセージの型定義
 * id: 一意のメッセージID
 * text: メッセージ内容
 * isUser: ユーザーからのメッセージかどうか
 * speakText: 読み上げるテキスト
 * isStreaming: ストリーミング中かどうか
 */
export type Message = {
	id: number;
	text: string;
	isUser: boolean;
	speakText?: string;
	isStreaming?: boolean;
};

/**
 * 音声ストリーミング状態の型定義
 */
export type AudioStreamingState = {
	isStreamingActive: boolean;
	currentPlayingMessageId: number | null;
	queuedMessageIds: number[];
	isGeneratingAudio: boolean;
	isPlayingAudio: boolean;
	audioError: string | null;
};

/**
 * 初期メッセージ - アプリケーション起動時の最初の挨拶メッセージ
 */
const initialMessages: Message[] = [
	{ id: 1, text: "金沢工業大学へようこそ!!", isUser: false },
	{ id: 2, text: "なんでも質問してください!!", isUser: false },
];

/**
 * チャットメッセージを管理するアトム
 * メッセージの追加・削除などの操作はこのアトムを通じて行う
 */
export const messagesAtom = atom<Message[]>(initialMessages);

/**
 * 入力フィールドの値を管理するアトム
 */
export const inputValueAtom = atom<string>("");

/**
 * AI思考中の状態を管理するアトム
 */
export const isThinkingAtom = atom<boolean>(false);

/**
 * 音声ストリーミング状態を管理するアトム
 */
export const audioStreamingStateAtom = atom<AudioStreamingState>({
	isStreamingActive: false,
	currentPlayingMessageId: null,
	queuedMessageIds: [],
	isGeneratingAudio: false,
	isPlayingAudio: false,
	audioError: null,
});

/**
 * メッセージを追加するアトムファミリー（派生アトム）
 * Jotaiのwrite-onlyアトムとして実装
 */
export const addMessageAtom = atom(
	null,
	(
		get,
		set,
		payload: {
			text: string;
			isUser: boolean;
			speakText?: string;
			isStreaming?: boolean;
		},
	) => {
		const currentMessages = get(messagesAtom);
		const newMessage: Message = {
			id: currentMessages.length + 1,
			text: payload.text,
			isUser: payload.isUser,
			speakText: payload.speakText,
			isStreaming: payload.isStreaming,
		};
		set(messagesAtom, [...currentMessages, newMessage]);
	},
);

/**
 * 指定したIDのメッセージを更新するアトム（ストリーミング対応）
 */
export const updateMessageAtom = atom(
	null,
	(
		get,
		set,
		payload: { id: number; updates: Partial<Omit<Message, "id">> },
	) => {
		const currentMessages = get(messagesAtom);
		const updatedMessages = currentMessages.map((message) =>
			message.id === payload.id ? { ...message, ...payload.updates } : message,
		);
		set(messagesAtom, updatedMessages);
	},
);

/**
 * チャットをリセットするアトム
 */
export const resetChatAtom = atom(null, (_get, set) => {
	set(messagesAtom, initialMessages);
	set(isThinkingAtom, false);
	set(audioStreamingStateAtom, {
		isStreamingActive: false,
		currentPlayingMessageId: null,
		queuedMessageIds: [],
		isGeneratingAudio: false,
		isPlayingAudio: false,
		audioError: null,
	});
});

/**
 * 音声ストリーミング状態を更新するアトム
 */
export const updateAudioStreamingStateAtom = atom(
	null,
	(get, set, updates: Partial<AudioStreamingState>) => {
		const currentState = get(audioStreamingStateAtom);
		set(audioStreamingStateAtom, { ...currentState, ...updates });
	},
);

/**
 * 音声ストリーミングを開始するアトム
 */
export const startAudioStreamingAtom = atom(
	null,
	(_get, set, messageId: number) => {
		set(updateAudioStreamingStateAtom, {
			isStreamingActive: true,
			currentPlayingMessageId: messageId,
			audioError: null,
		});
	},
);

/**
 * 音声ストリーミングを停止するアトム
 */
export const stopAudioStreamingAtom = atom(null, (_get, set) => {
	set(updateAudioStreamingStateAtom, {
		isStreamingActive: false,
		currentPlayingMessageId: null,
		queuedMessageIds: [],
		isGeneratingAudio: false,
		isPlayingAudio: false,
	});
});

/**
 * ランダムな質問テキストを生成する関数
 * @returns ランダムな質問文字列
 */
export const getRandomText = () => {
	const randomQuestions = [
		"金沢工業大学の学部について教えてください",
		"キャンパスの施設について知りたいです",
		"学食のおすすめメニューは何ですか？",
		"金沢工業大学の就職率はどのくらいですか？",
		"プロジェクト活動について教えてください",
	];
	return randomQuestions[Math.floor(Math.random() * randomQuestions.length)];
};
