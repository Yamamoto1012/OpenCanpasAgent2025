import { showBottomNavigationAtom } from "@/store/navigationAtoms";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import type React from "react";
import { CategoryCard } from "./CategoryCard";
import type { Category } from "./CategoryCard";

export type CategoryGridProps = {
	categories: Category[];
	onCategoryClick: (category: Category) => void;
};

/**
 * カテゴリーグリッドコンポーネント
 * モバイル環境（showBottomNavigation=true）では何も表示しません
 * @param categories - カテゴリー
 * @param onCategoryClick - カテゴリーがクリックされたときのハンドラ
 */
export const CategoryGrid: React.FC<CategoryGridProps> = ({
	categories,
	onCategoryClick,
}) => {
	const [showBottomNavigation] = useAtom(showBottomNavigationAtom);

	// モバイル環境では何も表示しない
	if (showBottomNavigation) {
		return null;
	}

	// コンテナのバリアント設定
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
				delayChildren: 0.1,
			},
		},
		exit: {
			opacity: 0,
			transition: {
				staggerChildren: 0.05,
				staggerDirection: -1,
			},
		},
	};

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key="category-grid"
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				exit="exit"
			>
				{categories.map((category, index) => {
					return (
						<CategoryCard
							key={category.title}
							category={category}
							delay={index * 0.03}
							onClick={() => onCategoryClick(category)}
						/>
					);
				})}
			</motion.div>
		</AnimatePresence>
	);
};
