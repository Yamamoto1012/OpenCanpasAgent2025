import { atom } from "jotai";

/**
 * メッセージの型定義
 * id: 一意のメッセージID
 * text: メッセージ内容
 * isUser: ユーザーからのメッセージかどうか
 * speakText: 読み上げるテキスト
 */
export type Message = {
	id: number;
	text: string;
	isUser: boolean;
	speakText?: string;
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
 * メッセージを追加するアトムファミリー（派生アトム）
 * Jotaiのwrite-onlyアトムとして実装
 */
export const addMessageAtom = atom(
	null,
	(
		get,
		set,
		payload: { text: string; isUser: boolean; speakText?: string },
	) => {
		const currentMessages = get(messagesAtom);
		const newMessage: Message = {
			id: currentMessages.length + 1,
			text: payload.text,
			isUser: payload.isUser,
			speakText: payload.speakText,
		};
		set(messagesAtom, [...currentMessages, newMessage]);
	},
);

/**
 * チャットをリセットするアトム
 */
export const resetChatAtom = atom(null, (_get, set) => {
	set(messagesAtom, initialMessages);
	set(isThinkingAtom, false);
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
