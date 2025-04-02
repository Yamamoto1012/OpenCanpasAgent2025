import { useState } from "react";
import type { Category } from "../features/CategoryNagigator/components/CategoryCard";

/**
 * カテゴリー選択、検索、質問の状態とロジックを管理するカスタムフック
 */
export const useCategorySelection = () => {
	const [categoryDepth, setCategoryDepth] = useState(0);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null,
	);
	const [showActionPrompt, setShowActionPrompt] = useState(false);
	const [showChat, setShowChat] = useState(true);

	// 検索結果の表示状態を管理する変数
	const [showSearchResult, setShowSearchResult] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isQuestion, setIsQuestion] = useState(false);

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
		if (!selectedCategory) return;

		console.log(`「${selectedCategory.title}」で検索実行`);
		setShowActionPrompt(false);
		setShowChat(false);

		// 検索結果を表示
		setIsQuestion(false);
		setSearchQuery("");
		setShowSearchResult(true);
	};

	// 質問が入力されたとき
	const handleAskQuestion = (question: string) => {
		if (!selectedCategory) return;

		console.log(`「${selectedCategory.title}」について質問: ${question}`);
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
		categoryDepth,
		selectedCategory,
		showActionPrompt,
		showChat,
		showSearchResult,
		searchQuery,
		isQuestion,
		handleCategorySelect,
		handleSearch,
		handleAskQuestion,
		handleBackFromSearch,
	};
};
