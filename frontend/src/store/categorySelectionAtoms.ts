import { atom } from "jotai";
import type { Category } from "../features/CategoryNagigator/components/CategoryCard";

// カテゴリ選択の深さを表すatom
export const categoryDepthAtom = atom<number>(0);

// 選択されたカテゴリを表すatom
export const selectedCategoryAtom = atom<Category | null>(null);

// アクションプロンプトの表示状態を表すatom
export const showActionPromptAtom = atom<boolean>(false);

// チャット表示状態を表すatom
export const showChatAtom = atom<boolean>(true);

// 検索結果表示状態を表すatom
export const showSearchResultAtom = atom<boolean>(false);

// 検索クエリを表すatom
export const searchQueryAtom = atom<string>("");

// 質問モードかどうかを表すatom
export const isQuestionAtom = atom<boolean>(false);

// 派生atom: カテゴリ選択関連の状態をまとめて提供する
export const categorySelectionStateAtom = atom((get) => {
	return {
		categoryDepth: get(categoryDepthAtom),
		selectedCategory: get(selectedCategoryAtom),
		showActionPrompt: get(showActionPromptAtom),
		showChat: get(showChatAtom),
		showSearchResult: get(showSearchResultAtom),
		searchQuery: get(searchQueryAtom),
		isQuestion: get(isQuestionAtom),
	};
});
