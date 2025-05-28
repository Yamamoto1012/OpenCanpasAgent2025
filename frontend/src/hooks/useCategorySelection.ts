import { useAtom } from "jotai";
import { useCallback } from "react";
import type { Category } from "../features/CategoryNavigator/components/CategoryCard";
import {
	categoryDepthAtom,
	selectedCategoryAtom,
	showActionPromptAtom,
	showChatAtom,
	showSearchResultAtom,
	searchQueryAtom,
	isQuestionAtom,
} from "../store/categorySelectionAtoms";

/**
 * カテゴリー選択の状態を表す型
 */
export type CategorySelectionState = {
	readonly categoryDepth: number;
	readonly selectedCategory: Category | null;
	readonly showActionPrompt: boolean;
	readonly showChat: boolean;
	readonly showSearchResult: boolean;
	readonly searchQuery: string;
	readonly isQuestion: boolean;
};

/**
 * カテゴリー選択のアクション群の型
 */
export type CategorySelectionActions = {
	readonly handleCategorySelect: (depth: number, category?: Category) => void;
	readonly handleSearch: () => void;
	readonly handleAskQuestion: (question: string) => void;
	readonly handleBackFromSearch: () => void;
	readonly resetSelection: () => void;
};

/**
 * useCategorySelectionの返却値の型
 */
export type UseCategorySelectionReturn = {
	readonly state: CategorySelectionState;
	readonly actions: CategorySelectionActions;
	readonly isSelectionComplete: boolean;
	readonly canProceedToSearch: boolean;
};

/**
 * カテゴリー選択、検索、質問の状態とロジックを管理するカスタムフック（改良版）
 * 再レンダリング数を最小化し、アクションをメモ化して最適化
 */
export const useCategorySelection = (): UseCategorySelectionReturn => {
	const [categoryDepth, setCategoryDepth] = useAtom(categoryDepthAtom); // カテゴリが何層目まで選択されているか
	const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom); // 最初に選択されたカテゴリ
	const [showActionPrompt, setShowActionPrompt] = useAtom(showActionPromptAtom); // アクションプロンプトの表示状態
	const [showChat, setShowChat] = useAtom(showChatAtom); // チャット画面を表示するかどうか
	const [showSearchResult, setShowSearchResult] = useAtom(showSearchResultAtom); // 検索結果や質問の回答を表示するかどうか
	const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom); // 検索したり質問したりするためのクエリ
	const [isQuestion, setIsQuestion] = useAtom(isQuestionAtom); // 今表示し値得るのが、質問に対する回答か検索結果なのかどうか

	/**
	 * カテゴリー選択変更のハンドラー
	 * @param depth - カテゴリの深度（0: メインカテゴリ, 1: サブカテゴリ, 2: サブサブカテゴリ）
	 * @param category - 選択されたカテゴリ（オプション）
	 */
	const handleCategorySelect = useCallback(
		(depth: number, category?: Category) => {
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
		},
		[
			showSearchResult,
			setCategoryDepth,
			setShowSearchResult,
			setShowChat,
			setSelectedCategory,
			setShowActionPrompt,
		],
	);

	/**
	 * カテゴリ検索のハンドラー(検索するボタンを押したとき)
	 * @param selectedCategory - 選択されたカテゴリ
	 */
	const handleSearch = useCallback(() => {
		if (!selectedCategory) {
			console.warn("選択されたカテゴリがありません");
			return;
		}

		setShowActionPrompt(false);
		setShowChat(false);

		// 検索結果を表示
		setIsQuestion(false);
		setSearchQuery("");
		setShowSearchResult(true);
	}, [
		selectedCategory,
		setShowActionPrompt,
		setShowChat,
		setIsQuestion,
		setSearchQuery,
		setShowSearchResult,
	]);

	/**
	 * 質問入力のハンドラー(ユーザーが質問を入力して送信したとき)
	 * @param question - ユーザーが入力した質問
	 */
	const handleAskQuestion = useCallback(
		(question: string) => {
			if (!selectedCategory) {
				console.warn("選択されたカテゴリがありません");
				return;
			}

			if (!question.trim()) {
				console.warn("質問が入力されていません");
				return;
			}

			setShowActionPrompt(false);
			setShowChat(false);

			// 質問として検索結果を表示
			setIsQuestion(true);
			setSearchQuery(question.trim());
			setShowSearchResult(true);
		},
		[
			selectedCategory,
			setShowActionPrompt,
			setShowChat,
			setIsQuestion,
			setSearchQuery,
			setShowSearchResult,
		],
	);

	/**
	 * 検索結果から戻る処理
	 * ユーザーが検索結果から戻るときに呼ばれる
	 */
	const handleBackFromSearch = useCallback(() => {
		setShowSearchResult(false);
		setShowChat(true);
		setCategoryDepth(0); // カテゴリ選択をリセット
	}, [setShowSearchResult, setShowChat, setCategoryDepth]);

	/**
	 * 選択状態を完全リセット
	 */
	const resetSelection = useCallback(() => {
		setCategoryDepth(0);
		setSelectedCategory(null);
		setShowActionPrompt(false);
		setShowChat(true);
		setShowSearchResult(false);
		setSearchQuery("");
		setIsQuestion(false);
	}, [
		setCategoryDepth,
		setSelectedCategory,
		setShowActionPrompt,
		setShowChat,
		setShowSearchResult,
		setSearchQuery,
		setIsQuestion,
	]);

	// 状態オブジェクト（JotaiのAtomから取得した現在の状態)
	const state: CategorySelectionState = {
		categoryDepth,
		selectedCategory,
		showActionPrompt,
		showChat,
		showSearchResult,
		searchQuery,
		isQuestion,
	};

	// アクションオブジェクト（メモ化された操作関数をまとめたオブジェクト）
	const actions: CategorySelectionActions = {
		handleCategorySelect,
		handleSearch,
		handleAskQuestion,
		handleBackFromSearch,
		resetSelection,
	};

	// 派生状態(他のAtomの値を組み合わせて計算しているもの)
	const isSelectionComplete = categoryDepth >= 2 && selectedCategory !== null;
	const canProceedToSearch = isSelectionComplete && !showSearchResult;

	return {
		state,
		actions,
		isSelectionComplete,
		canProceedToSearch,
	} as const;
};
