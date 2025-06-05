import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";
import type { Category } from "./components/CategoryCard";
import { CategoryGrid } from "./components/CategoryGrid";

export type CategoryNavigatorViewProps = {
	breadcrumbs: React.ReactNode;
	displayedCategories: Category[];
	showBackButton: boolean;
	onCategoryClick: (category: Category) => void;
	onBackClick: () => void;
};

/**
 * カテゴリーナビゲーターの表示コンポーネント
 * @param breadcrumbs - カテゴリーナビゲーションのパンくずリスト
 * @param displayedCategories - 現在表示中のカテゴリーリスト
 * @param showBackButton - 戻るボタンを表示するかどうか
 * @param onCategoryClick - カテゴリーがクリックされたときのハンドラ
 * @param onBackClick - 戻るボタンがクリックされたときのハンドラ
 */
export const CategoryNavigatorView: React.FC<CategoryNavigatorViewProps> = ({
	breadcrumbs,
	displayedCategories,
	showBackButton,
	onCategoryClick,
	onBackClick,
}) => {
	return (
		<div className="w-full h-full">
			{/* モバイル・デスクトップ共通ヘッダー */}
			<div className="flex items-center justify-between mb-4 px-4 md:px-0">
				<motion.div
					layout
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex-1 min-w-0" // 長いテキスト対応
				>
					{breadcrumbs}
				</motion.div>
				{showBackButton && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="ml-2 flex-shrink-0"
					>
						<IconButton
							icon={ArrowLeft}
							onClick={onBackClick}
							className="
								bg-gray-200 text-gray-700 hover:bg-gray-300
								h-12 w-12 md:h-10 md:w-10
								touch-manipulation
							"
						/>
					</motion.div>
				)}
			</div>

			{/* カテゴリーグリッド */}
			<div
				className={`
					px-2 md:px-4
					}
				`}
			>
				<ScrollArea className="h-full">
					<div className="h-full">
						<CategoryGrid
							categories={displayedCategories}
							onCategoryClick={onCategoryClick}
						/>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
