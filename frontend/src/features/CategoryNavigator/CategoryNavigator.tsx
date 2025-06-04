import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { CategoryNavigatorView } from "./CategroyNavigatorView";
import type { Category } from "./components/CategoryCard";
import {
	categoryDepthAtom,
	currentCategoriesAtom,
	selectedMainCategoryIdAtom,
	selectedSubCategoryIdAtom,
	categoryPathAtom,
	selectCategoryAtom,
	navigateBackAtom,
	selectedSubSubCategoryIdAtom,
} from "@/store/categoryAtoms";
import { showBottomNavigationAtom } from "@/store/navigationAtoms";
import { mainCategories, subCategories, subSubCategories } from "./constants";

type CategoryNavigatorProps = {
	onCategoryDepthChange?: (depth: number, category?: Category) => void;
};

/**
 * カテゴリーナビゲーターコンポーネント
 * モバイル環境（showBottomNavigation=true）では非表示になります
 * @param onCategoryDepthChange - カテゴリーの深さが変わったときに呼ばれるコールバック関数
 */
export const CategoryNavigator: React.FC<CategoryNavigatorProps> = ({
	onCategoryDepthChange,
}) => {
	const [categoryDepth] = useAtom(categoryDepthAtom);
	const displayedCategories = useAtomValue(currentCategoriesAtom);
	const [selectedMainId] = useAtom(selectedMainCategoryIdAtom);
	const [selectedSubId] = useAtom(selectedSubCategoryIdAtom);
	const [selectedSubSubId] = useAtom(selectedSubSubCategoryIdAtom);
	const selectCategory = useSetAtom(selectCategoryAtom);
	const navigateBack = useSetAtom(navigateBackAtom);
	const categoryPath = useAtomValue(categoryPathAtom);
	const [showBottomNavigation] = useAtom(showBottomNavigationAtom);

	// 親コンポーネントに現在のカテゴリー深さを通知
	useEffect(() => {
		if (!onCategoryDepthChange) return;

		let selectedCategory: Category | undefined;

		if (categoryDepth === 1 && selectedMainId && !selectedSubId) {
			selectedCategory = mainCategories.find((c) => c.id === selectedMainId);
		} else if (categoryDepth === 1 && selectedMainId && selectedSubId) {
			selectedCategory = subCategories[selectedMainId]?.find(
				(c) => c.id === selectedSubId,
			);
		} else if (categoryDepth === 2 && selectedSubSubId && selectedSubId) {
			// サブサブカテゴリーが選択されているとき
			selectedCategory = subSubCategories[selectedSubId]?.find(
				(c) => c.id === selectedSubSubId,
			);
		}

		onCategoryDepthChange(categoryDepth, selectedCategory);
	}, [
		categoryDepth,
		onCategoryDepthChange,
		selectedMainId,
		selectedSubId,
		selectedSubSubId,
	]);

	// モバイル環境では何も表示しない
	if (showBottomNavigation) {
		return null;
	}

	// カテゴリークリック時の処理
	const handleCategoryClick = (category: Category) => {
		if (!category.id) return;

		// カテゴリー選択アクション
		selectCategory({ categoryId: category.id, depth: categoryDepth });
	};

	// バックボタンで一段階上に戻る
	const handleBackClick = () => {
		navigateBack();
	};

	// パンくずリスト形式でタイトル要素を取得
	const getBreadcrumbs = () => {
		if (categoryPath.length === 0) {
			return <span className="font-semibold text-xl">カテゴリーを選択</span>;
		}

		// デスクトップ向けパンくずリスト
		return (
			<div className="flex flex-wrap items-center text-xl">
				<span className="font-semibold text-gray-500">カテゴリーを選択</span>

				{categoryPath.map((item) => (
					<div key={item.id} className="flex items-center">
						<ChevronRight className="mx-1 h-5 w-5 text-gray-500" />
						<span className="font-semibold">{item.title}</span>
					</div>
				))}
			</div>
		);
	};

	return (
		<CategoryNavigatorView
			breadcrumbs={getBreadcrumbs()}
			displayedCategories={displayedCategories}
			showBackButton={categoryDepth > 0}
			onCategoryClick={handleCategoryClick}
			onBackClick={handleBackClick}
		/>
	);
};
