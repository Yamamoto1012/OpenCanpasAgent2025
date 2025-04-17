import { useAtom } from "jotai";
import type { Category } from "../features/CategoryNagigator/components/CategoryCard";
import {
	categoryDepthAtom,
	selectedCategoryAtom,
	showActionPromptAtom,
	showChatAtom,
	showSearchResultAtom,
	searchQueryAtom,
	isQuestionAtom,
	categorySelectionStateAtom,
} from "../store/categorySelectionAtoms";

/**
 * カテゴリー選択、検索、質問の状態とロジックを管理するカスタムフック
 */
export const useCategorySelection = () => {
	const [, setCategoryDepth] = useAtom(categoryDepthAtom);
	const [, setSelectedCategory] = useAtom(selectedCategoryAtom);
	const [, setShowActionPrompt] = useAtom(showActionPromptAtom);
	const [, setShowChat] = useAtom(showChatAtom);
	const [showSearchResult, setShowSearchResult] = useAtom(showSearchResultAtom);
	const [, setSearchQuery] = useAtom(searchQueryAtom);
	const [, setIsQuestion] = useAtom(isQuestionAtom);

	// 全体の状態を読み取り専用で取得
	const categorySelectionState = useAtom(categorySelectionStateAtom)[0];

	// カテゴリー選択が変更されたときのハンドラー
	const handleCategorySelect = (depth: number, category?: Category) => {
		setCategoryDepth(depth);

		// 検索結果表示中なら閉じる
		if (showSearchResult) {
			setShowSearchResult(false);
		}

		// サブサブカテゴリーが選択されたら
		if (depth >= 2) {
			setShowChat(false);

			if (category) {
				setSelectedCategory(category);
				setShowActionPrompt(true);
			}
		} else {
			setShowChat(true);
			setShowActionPrompt(false);
		}
	};

	// カテゴリで検索するボタンが押されたとき
	const handleSearch = () => {
		if (!categorySelectionState.selectedCategory) return;
		setShowActionPrompt(false);
		setShowChat(false);

		// 検索結果を表示
		setIsQuestion(false);
		setSearchQuery("");
		setShowSearchResult(true);
	};

	// 質問が入力されたとき
	const handleAskQuestion = (question: string, _answer?: string | null) => {
		if (!categorySelectionState.selectedCategory) return;

		setShowActionPrompt(false);
		setShowChat(false);

		// 質問として検索結果を表示
		setIsQuestion(true);
		setSearchQuery(question);
		setShowSearchResult(true);
	};

	// 検索結果から戻るときの処理
	const handleBackFromSearch = () => {
		setShowSearchResult(false);
		setShowChat(true);
		setCategoryDepth(0); // カテゴリ選択をリセット
	};

	return {
		...categorySelectionState,
		handleCategorySelect,
		handleSearch,
		handleAskQuestion,
		handleBackFromSearch,
	};
};
