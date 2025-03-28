"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { mainCategories, subCategories, subSubCategories } from "./constants";
import { CategoryNavigatorView } from "./CategroyNavigatiorView";
import type { Category } from "./components/CategoryCard";

type CategoryNavigatorProps = {
	onCategoryDepthChange?: (depth: number, category?: Category) => void;
};

export const CategoryNavigator: React.FC<CategoryNavigatorProps> = ({
	onCategoryDepthChange,
}) => {
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

	// 親コンポーネントに現在のカテゴリー深さを通知
	useEffect(() => {
		if (onCategoryDepthChange) {
			onCategoryDepthChange(selectedPath.length);
		}
	}, [selectedPath, onCategoryDepthChange]);

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
			if (onCategoryDepthChange) {
				onCategoryDepthChange(1, category);
			}
		} else if (
			selectedPath.length === 1 &&
			category.id &&
			subSubCategories[category.id]
		) {
			// サブカテゴリー→サブサブカテゴリーへ
			setSelectedPath([...selectedPath, category.id]);
			if (onCategoryDepthChange) {
				onCategoryDepthChange(2, category);
			}
		} else {
			console.log("最終選択:", category);

			// 最終選択時にも選択されたことを伝える
			if (selectedPath.length === 2 && onCategoryDepthChange) {
				onCategoryDepthChange(3, category); // 選択したカテゴリ情報も渡す
			}
		}
	};

	// バックボタンで一段階上に戻る
	const handleBackClick = () => {
		setSelectedPath((prev) => prev.slice(0, prev.length - 1));
	};

	// パンくずリスト形式でタイトル要素を取得
	const getBreadcrumbs = () => {
		if (selectedPath.length === 0) {
			return <span className="text-xl font-semibold">カテゴリーを選択</span>;
		}

		// メインカテゴリーの名前を取得
		const mainCategory = mainCategories.find((c) => c.id === selectedPath[0]);

		// サブカテゴリーの場合
		if (selectedPath.length === 1) {
			return (
				<div className="flex items-center text-xl">
					<span className="font-semibold text-gray-500">カテゴリーを選択</span>
					<ChevronRight className="mx-1 h-5 w-5 text-gray-500" />
					<span className="font-semibold">
						{mainCategory?.title || "カテゴリー"}
					</span>
				</div>
			);
		}

		// サブサブカテゴリーの場合
		if (selectedPath.length === 2) {
			const subCategory = subCategories[selectedPath[0]]?.find(
				(c) => c.id === selectedPath[1],
			);
			return (
				<div className="flex items-center text-xl">
					<span className="font-semibold text-gray-500">カテゴリーを選択</span>
					<ChevronRight className="mx-1 h-5 w-5 text-gray-500" />
					<span className="font-semibold">
						{mainCategory?.title || "カテゴリー"}
					</span>
					<ChevronRight className="mx-1 h-5 w-5 text-gray-500" />
					<span className="font-semibold">
						{subCategory?.title || "サブカテゴリー"}
					</span>
				</div>
			);
		}

		return null;
	};

	return (
		<CategoryNavigatorView
			breadcrumbs={getBreadcrumbs()}
			displayedCategories={displayedCategories}
			showBackButton={selectedPath.length > 0}
			onCategoryClick={handleCategoryClick}
			onBackClick={handleBackClick}
		/>
	);
};
