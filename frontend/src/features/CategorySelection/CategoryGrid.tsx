"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryCard } from "./CategoryCard";
import type { Category } from "./CategoryCard";

export type CategoryGridProps = {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryClick }) => {
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
        className="grid grid-cols-2 sm:grid-cols-2 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {categories.map((category, index) => (
          <CategoryCard
            key={category.title}
            category={category}
            delay={index * 0.05}
            onClick={() => onCategoryClick(category)}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
