import { atom } from "jotai";

// 入力値を保持するatom
export const inputValueAtom = atom<string>("");

// 検索結果の入力値に関連する状態をまとめて取得するatom
export const searchResultStateAtom = atom((get) => {
	return {
		inputValue: get(inputValueAtom),
	};
});
