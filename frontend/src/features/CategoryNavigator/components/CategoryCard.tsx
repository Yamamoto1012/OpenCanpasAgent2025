import type React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export type Category = {
	id?: string;
	title: string;
	description: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	color: string;
};

export type CategoryCardProps = {
	category: Category;
	delay: number;
	onClick?: () => void;
};

/**
 * デスクトップ専用カテゴリーカード
 * モバイル環境（showBottomNavigation=true）では使用されません
 * @param category - カテゴリー情報
 * @param delay - アニメーションの遅延時間
 * @param onClick - カードクリック時のハンドラ
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({
	category,
	delay,
	onClick,
}) => {
	const IconComponent = category.icon;
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
			transition={{ duration: 0.3, delay }}
			whileHover={{ scale: 1.03 }}
			whileTap={{ scale: 0.98 }}
			onClick={onClick}
			layout
			className="w-full"
		>
			<Card
				className="
				p-4 md:p-4 
				flex items-start gap-3 
				cursor-pointer 
				bg-gray-50/50 hover:bg-gray-100 active:bg-gray-200 
				transition-colors 
				border-0 shadow-sm hover:shadow-md
				min-h-[80px] md:min-h-[auto]
				touch-manipulation
			"
			>
				<div className={`${category.color} mt-1 flex-shrink-0`}>
					<IconComponent className="w-7 h-7 md:w-6 md:h-6" />
				</div>
				<div className="flex flex-col flex-1 min-w-0">
					<h3 className="font-medium text-lg md:text-lg leading-tight mb-1">
						{category.title}
					</h3>
					<p className="text-sm md:text-sm text-gray-500 leading-relaxed line-clamp-2">
						{category.description}
					</p>
				</div>
			</Card>
		</motion.div>
	);
};
