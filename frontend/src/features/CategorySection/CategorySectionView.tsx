import { showBottomNavigationAtom } from "@/store/navigationAtoms";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import type { FC } from "react";
import { ActionPrompt } from "../ActionPromt/ActionPromt";
import { CategoryNavigator } from "../CategoryNavigator/CategoryNavigator";
import type { Category } from "../CategoryNavigator/components/CategoryCard";
import { SearchResults } from "../SearchResult/SearchResult";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";

export type CategorySectionViewProps = {
	/**
	 * 選択されたカテゴリ情報
	 */
	selectedCategory: Category | null;

	/**
	 * アクションプロンプトの表示状態
	 */
	showActionPrompt: boolean;

	/**
	 * 検索結果を表示するかどうか
	 */
	shouldShowSearchResults: boolean;

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
 * カテゴリナビゲーションと検索結果表示を担当するプレゼンテーションコンポーネント
 * @param selectedCategory - 現在選択されているカテゴリ
 * @param showActionPrompt - アクションプロンプトの表示状態
 * @param shouldShowSearchResults - 検索結果を表示するかどうか
 * @param searchQuery - 検索キーワード
 * @param isQuestion - 質問形式かどうか
 * @param onCategorySelect - カテゴリ選択時のハンドラー
 * @param onSearch - 検索処理のハンドラー
 * @param onAskQuestion - 質問処理のハンドラー
 * @param onBackFromSearch - 検索結果からの戻るボタン処理のハンドラー
 * @param vrmWrapperRef - VRMWrapperの参照
 */
export const CategorySectionView: FC<CategorySectionViewProps> = ({
	selectedCategory,
	showActionPrompt,
	shouldShowSearchResults,
	searchQuery,
	isQuestion,
	onCategorySelect,
	onSearch,
	onAskQuestion,
	onBackFromSearch,
	vrmWrapperRef,
}) => {
	const [showBottomNavigation] = useAtom(showBottomNavigationAtom);

	return (
		<div
			className={`
			${
				showBottomNavigation
					? "w-full h-full flex flex-col"
					: "absolute top-16 left-2 right-2 md:top-1/7 md:right-2 md:left-auto flex flex-col items-center md:items-end z-10" // デスクトップ：絶対位置
			}
		`}
		>
			<div
				className={`
				${
					showBottomNavigation
						? "flex-1 w-full"
						: "relative w-full md:w-auto min-h-[300px] md:min-h-[400px] flex justify-center md:justify-end" // デスクトップ：従来通り
				}
			`}
			>
				<AnimatePresence mode="wait">
					{shouldShowSearchResults ? (
						<motion.div
							key="search-results"
							className="w-full max-w-lg md:max-w-xl md:-translate-x-24"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
						>
							<SearchResults
								query={searchQuery}
								category={selectedCategory ?? undefined}
								isQuestion={isQuestion}
								onBack={onBackFromSearch}
								onNewQuestion={onAskQuestion}
								vrmWrapperRef={vrmWrapperRef}
							/>
						</motion.div>
					) : (
						<motion.div
							key="category-navigator"
							className="w-full md:w-auto"
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							transition={{ duration: 0.3 }}
						>
							<CategoryNavigator onCategoryDepthChange={onCategorySelect} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* アクションプロンプト */}
			<AnimatePresence>
				{showActionPrompt && selectedCategory && (
					<motion.div
						className={`
							${
								showBottomNavigation
									? "fixed bottom-20 left-4 right-4 z-50"
									: "mt-4 w-full max-w-lg md:max-w-none flex items-center justify-center md:justify-end" // デスクトップ：従来通り
							}
						`}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.3 }}
					>
						<ActionPrompt
							categoryTitle={selectedCategory?.title ?? "カテゴリーを選択"}
							onSearch={onSearch}
							onAskQuestion={onAskQuestion}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
