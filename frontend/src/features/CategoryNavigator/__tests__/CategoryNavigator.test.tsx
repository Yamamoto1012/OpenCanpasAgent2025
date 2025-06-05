import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { CategoryNavigator } from "../CategoryNavigator";
import { showBottomNavigationAtom } from "@/store/navigationAtoms";

describe("CategoryNavigator", () => {
	const mockOnCategoryDepthChange = vi.fn();

	beforeEach(() => {
		mockOnCategoryDepthChange.mockClear();
	});

	describe("デスクトップ環境（showBottomNavigation: false）", () => {
		it("カテゴリーナビゲーターが表示される", () => {
			const store = createStore();
			store.set(showBottomNavigationAtom, false);

			render(
				<Provider store={store}>
					<CategoryNavigator
						onCategoryDepthChange={mockOnCategoryDepthChange}
					/>
				</Provider>,
			);

			// 「カテゴリーを選択」というタイトルが表示される
			expect(screen.getByText("カテゴリーを選択")).toBeInTheDocument();
		});
	});

	describe("モバイル環境（showBottomNavigation: true）", () => {
		it("何も表示されない（nullが返される）", () => {
			const store = createStore();
			store.set(showBottomNavigationAtom, true);

			const { container } = render(
				<Provider store={store}>
					<CategoryNavigator
						onCategoryDepthChange={mockOnCategoryDepthChange}
					/>
				</Provider>,
			);

			// コンテナが空であることを確認
			expect(container.firstChild).toBeNull();

			// 「カテゴリーを選択」というタイトルが表示されない
			expect(screen.queryByText("カテゴリーを選択")).not.toBeInTheDocument();
		});

		it("状態に関係なく何も表示されない", () => {
			const store = createStore();
			store.set(showBottomNavigationAtom, true);

			const { container } = render(
				<Provider store={store}>
					<CategoryNavigator
						onCategoryDepthChange={mockOnCategoryDepthChange}
					/>
				</Provider>,
			);

			// コンテナが空であることを確認
			expect(container.firstChild).toBeNull();
		});
	});
});
