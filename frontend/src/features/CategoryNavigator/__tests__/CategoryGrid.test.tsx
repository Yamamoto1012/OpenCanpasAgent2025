import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { CategoryGrid } from "../components/CategoryGrid";
import { showBottomNavigationAtom } from "@/store/navigationAtoms";
import type { Category } from "../components/CategoryCard";

// モックアイコンコンポーネント
const MockIcon = () => <div data-testid="mock-icon">📱</div>;

// テスト用のカテゴリデータ
const mockCategories: Category[] = [
	{
		id: "1",
		title: "テストカテゴリ1",
		description: "テストカテゴリ1の説明",
		icon: MockIcon,
		color: "text-blue-500",
	},
	{
		id: "2",
		title: "テストカテゴリ2",
		description: "テストカテゴリ2の説明",
		icon: MockIcon,
		color: "text-red-500",
	},
];

describe("CategoryGrid", () => {
	const mockOnCategoryClick = vi.fn();

	beforeEach(() => {
		mockOnCategoryClick.mockClear();
	});

	describe("デスクトップ環境（showBottomNavigation: false）", () => {
		it("CategoryCardコンポーネントが表示される", () => {
			const store = createStore();
			store.set(showBottomNavigationAtom, false);

			render(
				<Provider store={store}>
					<CategoryGrid
						categories={mockCategories}
						onCategoryClick={mockOnCategoryClick}
					/>
				</Provider>,
			);

			// CategoryCardが表示されることを確認（説明文が含まれている）
			expect(screen.getByText("テストカテゴリ1の説明")).toBeInTheDocument();
			expect(screen.getByText("テストカテゴリ2の説明")).toBeInTheDocument();
		});

		it("カテゴリクリックでハンドラが呼ばれる", () => {
			const store = createStore();
			store.set(showBottomNavigationAtom, false);

			render(
				<Provider store={store}>
					<CategoryGrid
						categories={mockCategories}
						onCategoryClick={mockOnCategoryClick}
					/>
				</Provider>,
			);

			fireEvent.click(screen.getByText("テストカテゴリ1"));
			expect(mockOnCategoryClick).toHaveBeenCalledWith(mockCategories[0]);
		});
	});

	describe("モバイル環境（showBottomNavigation: true）", () => {
		it("何も表示されない（nullが返される）", () => {
			const store = createStore();
			store.set(showBottomNavigationAtom, true);

			const { container } = render(
				<Provider store={store}>
					<CategoryGrid
						categories={mockCategories}
						onCategoryClick={mockOnCategoryClick}
					/>
				</Provider>,
			);

			// コンテナが空であることを確認
			expect(container.firstChild).toBeNull();

			// カテゴリタイトルや説明文が表示されていないことを確認
			expect(screen.queryByText("テストカテゴリ1")).not.toBeInTheDocument();
			expect(screen.queryByText("テストカテゴリ2")).not.toBeInTheDocument();
			expect(
				screen.queryByText("テストカテゴリ1の説明"),
			).not.toBeInTheDocument();
			expect(
				screen.queryByText("テストカテゴリ2の説明"),
			).not.toBeInTheDocument();
		});

		it("アイコンも表示されない", () => {
			const store = createStore();
			store.set(showBottomNavigationAtom, true);

			render(
				<Provider store={store}>
					<CategoryGrid
						categories={mockCategories}
						onCategoryClick={mockOnCategoryClick}
					/>
				</Provider>,
			);

			// アイコンが表示されていないことを確認
			expect(screen.queryByTestId("mock-icon")).not.toBeInTheDocument();
		});
	});
});
