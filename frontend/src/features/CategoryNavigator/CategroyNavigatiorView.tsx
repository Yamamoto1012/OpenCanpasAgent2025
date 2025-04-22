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

export const CategoryNavigatorView: React.FC<CategoryNavigatorViewProps> = ({
	breadcrumbs,
	displayedCategories,
	showBackButton,
	onCategoryClick,
	onBackClick,
}) => {
	return (
		<div className="min-w-2xl max-w-2xl mx-auto p-4">
			<div className="flex items-center justify-between mb-4">
				<motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
					{breadcrumbs}
				</motion.div>
				{showBackButton && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
					>
						<IconButton
							icon={ArrowLeft}
							onClick={onBackClick}
							className="bg-gray-200 text-gray-700 hover:bg-gray-300"
						/>
					</motion.div>
				)}
			</div>
			{/* カテゴリーグリッド */}
			<CategoryGrid
				categories={displayedCategories}
				onCategoryClick={onCategoryClick}
			/>
		</div>
	);
};
