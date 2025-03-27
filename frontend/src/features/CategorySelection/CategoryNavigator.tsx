"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";
import { mainCategories, subCategories, subSubCategories } from "./constants";
import type { Category } from "./CategoryCard";
import { CategoryGrid } from "./CategoryGrid";
import { useState } from "react";

export const CategoryNavigator: React.FC = () => {
    const [selectedPath, setSelectedPath] = useState<string[]>([]);

    // 現在表示するカテゴリーを決定
    let displayedCategories: Category[] = [];
    if (selectedPath.length === 0) {
        displayedCategories = mainCategories;
    } else if (selectedPath.length === 1) {
        displayedCategories = subCategories[selectedPath[0]] || [];
    } else if (selectedPath.length === 2) {
        displayedCategories = subSubCategories[selectedPath[1]] || [];
    }

    // カテゴリークリック時の処理
    const handleCategoryClick = (category: Category) => {
        // 次の階層が存在するかチェック
        if (
            selectedPath.length === 0 &&
            category.id &&
            subCategories[category.id]
        ) {
            // メインカテゴリー→サブカテゴリーへ
            setSelectedPath([category.id]);
        } else if (
            selectedPath.length === 1 &&
            category.id &&
            subSubCategories[category.id]
        ) {
            // サブカテゴリー→サブサブカテゴリーへ
            setSelectedPath([...selectedPath, category.id]);
        } else {
            console.log("最終選択:", category);
        }
    };

    // バックボタンで一段階上に戻る
    const handleBackClick = () => {
        setSelectedPath((prev) => prev.slice(0, prev.length - 1));
    };

    // パンくずリスト形式でタイトル要素を取得
    const getBreadcrumbs = () => {
        if (selectedPath.length === 0) {
            return (
                <span className="text-xl font-semibold">カテゴリーを選択</span>
            );
        }

        // メインカテゴリーの名前を取得
        const mainCategory = mainCategories.find(c => c.id === selectedPath[0]);
        
        // サブカテゴリーの場合
        if (selectedPath.length === 1) {
            return (
                <div className="flex items-center text-xl">
                    <span className="font-semibold">{mainCategory?.title || "カテゴリー"}</span>
                </div>
            );
        }
        
        // サブサブカテゴリーの場合
        if (selectedPath.length === 2) {
            const subCategory = subCategories[selectedPath[0]]?.find(c => c.id === selectedPath[1]);
            return (
                <div className="flex items-center text-xl">
                    <span className="font-semibold">{mainCategory?.title || "カテゴリー"}</span>
                    <ChevronRight className="mx-1 h-5 w-5 text-gray-500" />
                    <span className="font-semibold">{subCategory?.title || "サブカテゴリー"}</span>
                </div>
            );
        }
    };

    return (
        <div className="min-w-2xl max-w-2xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {getBreadcrumbs()}
                </motion.div>
                {selectedPath.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <IconButton
                            icon={ArrowLeft}
                            onClick={handleBackClick}
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                        />
                    </motion.div>
                )}
            </div>
            {/* カテゴリーグリッド */}
            <CategoryGrid
                categories={displayedCategories}
                onCategoryClick={handleCategoryClick}
            />
        </div>
    );
};