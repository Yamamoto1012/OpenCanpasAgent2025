import {
	isActionPromptQuestionAtom,
	isDirectChatQuestionAtom,
} from "@/store/appStateAtoms";
import { useAtom } from "jotai";
import type { FC } from "react";
import type { Category } from "../CategoryNavigator/components/CategoryCard";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { CategorySectionView } from "./CategorySectionView";

type CategorySectionProps = {
	/**
	 * カテゴリの深さ
	 */
	categoryDepth: number;

	/**
	 * 選択されたカテゴリ情報
	 */
	selectedCategory: Category | null;

	/**
	 * アクションプロンプトの表示状態
	 */
	showActionPrompt: boolean;

	/**
	 * 検索結果の表示状態
	 */
	showSearchResult: boolean;

	/**
	 * 検索キーワード
	 */
	searchQuery: string;

	/**
	 * 質問形式かどうか
	 */
	isQuestion: boolean;

	/**
	 * カテゴリ選択時のハンドラー
	 */
	onCategorySelect: (depth: number, category?: Category) => void;

	/**
	 * 検索処理のハンドラー
	 */
	onSearch: () => void;

	/**
	 * 質問処理のハンドラー
	 */
	onAskQuestion: (question: string) => void;

	/**
	 * 検索結果からの戻るボタン処理のハンドラー
	 */
	onBackFromSearch: () => void;

	/**
	 * VRMWrapperの参照
	 */
	vrmWrapperRef?: React.RefObject<VRMWrapperHandle | null>;
};

/**
 * カテゴリナビゲーションと検索結果表示を管理するコンテナコンポーネント
 *
 * ユーザーの操作に応じたロジックと状態管理を担当
 */
export const CategorySection: FC<CategorySectionProps> = ({
	categoryDepth,
	selectedCategory,
	showActionPrompt,
	showSearchResult,
	searchQuery,
	isQuestion,
	onCategorySelect,
	onSearch,
	onAskQuestion,
	onBackFromSearch,
	vrmWrapperRef,
}) => {
	// グローバル状態の取得
	const [isDirectChatQuestion] = useAtom(isDirectChatQuestionAtom);
	const [isActionPromptQuestion] = useAtom(isActionPromptQuestionAtom);

	/**
	 * 検索結果の表示条件を満たすかどうかを判定
	 * - 検索結果表示フラグがONかつ直接質問モードでない場合
	 * - または、アクションプロンプトからの質問モードである場合
	 */
	const shouldShowSearchResults =
		(showSearchResult && !isDirectChatQuestion) || isActionPromptQuestion;

	return (
		<CategorySectionView
			selectedCategory={selectedCategory}
			showActionPrompt={showActionPrompt}
			shouldShowSearchResults={shouldShowSearchResults}
			searchQuery={searchQuery}
			isQuestion={isQuestion}
			onCategorySelect={onCategorySelect}
			onSearch={onSearch}
			onAskQuestion={onAskQuestion}
			onBackFromSearch={onBackFromSearch}
			vrmWrapperRef={vrmWrapperRef}
		/>
	);
};
