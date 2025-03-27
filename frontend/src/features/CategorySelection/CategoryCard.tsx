"use client";
import React from "react";
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
		>
			<Card className="p-4 flex items-start gap-3 cursor-pointer bg-gray-50/50 hover:bg-gray-100 transition-colors border-0 shadow-sm">
				<div className={`${category.color} mt-1`}>
					<IconComponent className="w-6 h-6" />
				</div>
				<div className="flex flex-col">
					<h3 className="font-medium text-lg">{category.title}</h3>
					<p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
				</div>
			</Card>
		</motion.div>
	);
};
