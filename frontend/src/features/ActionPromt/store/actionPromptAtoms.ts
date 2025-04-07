import { atom } from "jotai";

// 質問入力フォームの表示状態を管理するatom
export const showQuestionInputAtom = atom<boolean>(false);

// 質問内容を管理するatom
export const questionAtom = atom<string>("");

// ActionPromptの状態をまとめて取得するatom
export const actionPromptStateAtom = atom((get) => {
	return {
		showQuestionInput: get(showQuestionInputAtom),
		question: get(questionAtom),
	};
});
