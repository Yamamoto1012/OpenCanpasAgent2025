import { act, renderHook } from "@testing-library/react";
import { Provider } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Category } from "../features/CategoryNavigator/components/CategoryCard";
import { useCategorySelection } from "./useCategorySelection";

// テスト用のカテゴリデータ
const mockCategory: Category = {
	id: "1",
	title: "テストカテゴリ",
	description: "テスト用のカテゴリです",
	icon: () => null,
	color: "text-blue-500",
};

// テスト用のWrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
	<Provider>{children}</Provider>
);

describe("useCategorySelection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("初期状態", () => {
		it("初期状態が正しく設定される", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			expect(result.current.state).toEqual({
				categoryDepth: 0,
				selectedCategory: null,
				showActionPrompt: false,
				showChat: true,
				showSearchResult: false,
				searchQuery: "",
				isQuestion: false,
			});

			expect(result.current.isSelectionComplete).toBe(false);
			expect(result.current.canProceedToSearch).toBe(false);
		});
	});

	describe("カテゴリ選択", () => {
		it("深度1でカテゴリを選択するとチャット表示が有効になる", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			act(() => {
				result.current.actions.handleCategorySelect(1);
			});

			expect(result.current.state.categoryDepth).toBe(1);
			expect(result.current.state.showChat).toBe(true);
			expect(result.current.state.showActionPrompt).toBe(false);
			expect(result.current.isSelectionComplete).toBe(false);
		});

		it("深度2でカテゴリを選択すると選択完了状態になる", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			act(() => {
				result.current.actions.handleCategorySelect(2, mockCategory);
			});

			expect(result.current.state.categoryDepth).toBe(2);
			expect(result.current.state.selectedCategory).toEqual(mockCategory);
			expect(result.current.state.showChat).toBe(false);
			expect(result.current.state.showActionPrompt).toBe(true);
			expect(result.current.isSelectionComplete).toBe(true);
			expect(result.current.canProceedToSearch).toBe(true);
		});

		it("検索結果表示中にカテゴリ選択すると検索結果が閉じる", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			// まず検索結果を表示状態にする
			act(() => {
				result.current.actions.handleCategorySelect(2, mockCategory);
			});

			act(() => {
				result.current.actions.handleSearch();
			});

			expect(result.current.state.showSearchResult).toBe(true);

			// 新しいカテゴリを選択
			act(() => {
				result.current.actions.handleCategorySelect(1);
			});

			expect(result.current.state.showSearchResult).toBe(false);
		});
	});

	describe("検索機能", () => {
		it("カテゴリが選択されている場合は検索実行", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			// カテゴリを選択
			act(() => {
				result.current.actions.handleCategorySelect(2, mockCategory);
			});

			// 検索実行
			act(() => {
				result.current.actions.handleSearch();
			});

			expect(result.current.state.showSearchResult).toBe(true);
			expect(result.current.state.showActionPrompt).toBe(false);
			expect(result.current.state.showChat).toBe(false);
			expect(result.current.state.isQuestion).toBe(false);
			expect(result.current.state.searchQuery).toBe("");
		});

		it("カテゴリが選択されていない場合は検索実行されない", () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			act(() => {
				result.current.actions.handleSearch();
			});

			expect(result.current.state.showSearchResult).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith("選択されたカテゴリがありません");

			consoleSpy.mockRestore();
		});
	});

	describe("質問機能", () => {
		it("質問を入力すると検索結果に質問が設定される", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			// カテゴリを選択
			act(() => {
				result.current.actions.handleCategorySelect(2, mockCategory);
			});

			// 質問を入力
			act(() => {
				result.current.actions.handleAskQuestion("これは質問です");
			});

			expect(result.current.state.showSearchResult).toBe(true);
			expect(result.current.state.isQuestion).toBe(true);
			expect(result.current.state.searchQuery).toBe("これは質問です");
			expect(result.current.state.showActionPrompt).toBe(false);
			expect(result.current.state.showChat).toBe(false);
		});

		it("空の質問は受け付けない", () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			// カテゴリを選択
			act(() => {
				result.current.actions.handleCategorySelect(2, mockCategory);
			});

			// 空の質問を入力
			act(() => {
				result.current.actions.handleAskQuestion("   ");
			});

			expect(result.current.state.showSearchResult).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith("質問が入力されていません");

			consoleSpy.mockRestore();
		});

		it("質問時に前後の空白が除去される", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			// カテゴリを選択
			act(() => {
				result.current.actions.handleCategorySelect(2, mockCategory);
			});

			// 前後に空白がある質問を入力
			act(() => {
				result.current.actions.handleAskQuestion("  質問テキスト  ");
			});

			expect(result.current.state.searchQuery).toBe("質問テキスト");
		});
	});

	describe("戻る機能", () => {
		it("検索結果から戻ると初期状態にリセットされる", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			// 検索結果を表示状態にする
			act(() => {
				result.current.actions.handleCategorySelect(2, mockCategory);
			});

			act(() => {
				result.current.actions.handleSearch();
			});

			expect(result.current.state.showSearchResult).toBe(true);

			// 戻る
			act(() => {
				result.current.actions.handleBackFromSearch();
			});

			expect(result.current.state.showSearchResult).toBe(false);
			expect(result.current.state.showChat).toBe(true);
			expect(result.current.state.categoryDepth).toBe(0);
		});
	});

	describe("リセット機能", () => {
		it("リセットですべての状態が初期値に戻る", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			// 複数の状態を設定
			act(() => {
				result.current.actions.handleCategorySelect(2, mockCategory);
			});

			act(() => {
				result.current.actions.handleAskQuestion("テスト質問");
			});

			// リセット実行
			act(() => {
				result.current.actions.resetSelection();
			});

			expect(result.current.state).toEqual({
				categoryDepth: 0,
				selectedCategory: null,
				showActionPrompt: false,
				showChat: true,
				showSearchResult: false,
				searchQuery: "",
				isQuestion: false,
			});

			expect(result.current.isSelectionComplete).toBe(false);
			expect(result.current.canProceedToSearch).toBe(false);
		});
	});

	describe("派生状態", () => {
		it("選択完了状態が正しく計算される", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			// 初期状態
			expect(result.current.isSelectionComplete).toBe(false);

			// 深度1では未完了
			act(() => {
				result.current.actions.handleCategorySelect(1);
			});
			expect(result.current.isSelectionComplete).toBe(false);

			// 深度2でカテゴリ選択済みで完了
			act(() => {
				result.current.actions.handleCategorySelect(2, mockCategory);
			});
			expect(result.current.isSelectionComplete).toBe(true);
		});

		it("検索実行可能状態が正しく計算される", () => {
			const { result } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			// 初期状態
			expect(result.current.canProceedToSearch).toBe(false);

			// 選択完了状態
			act(() => {
				result.current.actions.handleCategorySelect(2, mockCategory);
			});
			expect(result.current.canProceedToSearch).toBe(true);

			// 検索結果表示中は実行不可
			act(() => {
				result.current.actions.handleSearch();
			});
			expect(result.current.canProceedToSearch).toBe(false);
		});
	});

	describe("アクションの安定性", () => {
		it("アクション関数が再レンダリング間で安定している", () => {
			const { result, rerender } = renderHook(() => useCategorySelection(), {
				wrapper: TestWrapper,
			});

			const firstActions = result.current.actions;

			rerender();

			const secondActions = result.current.actions;

			// 各アクション関数が同じ参照を保持していることを確認
			expect(firstActions.handleCategorySelect).toBe(
				secondActions.handleCategorySelect,
			);
			expect(firstActions.handleSearch).toBe(secondActions.handleSearch);
			expect(firstActions.handleAskQuestion).toBe(
				secondActions.handleAskQuestion,
			);
			expect(firstActions.handleBackFromSearch).toBe(
				secondActions.handleBackFromSearch,
			);
			expect(firstActions.resetSelection).toBe(secondActions.resetSelection);
		});
	});
});
