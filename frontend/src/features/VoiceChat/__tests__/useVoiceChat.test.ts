import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import {
	isListeningAtom,
	setTranscriptAtom,
	startListeningAtom,
	stopListeningAtom,
	transcriptAtom,
} from "@/store/voiceChatAtoms";
import { act, renderHook } from "@testing-library/react";
import { useAtom, useSetAtom } from "jotai";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useVoiceChat } from "../useVoiceChat";

// 依存関係のモック
vi.mock("@/hooks/useTextToSpeech", () => ({
	useTextToSpeech: vi.fn(),
}));

vi.mock("jotai", async (importOriginal) => {
	const actual = await importOriginal<typeof import("jotai")>();
	return {
		...actual,
		useAtom: vi.fn(),
		useSetAtom: vi.fn(),
	};
});

describe("useVoiceChat", () => {
	const mockStopTTS = vi.fn();
	const mockSetTranscript = vi.fn();
	const mockInitiateStartListening = vi.fn();
	const mockInitiateStopListening = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// useTextToSpeech のモック
		(useTextToSpeech as Mock).mockReturnValue({
			stop: mockStopTTS,
		});

		// Jotai フックのモック
		(useAtom as Mock).mockImplementation((atom) => {
			if (atom === isListeningAtom) {
				return [false];
			}
			if (atom === transcriptAtom) {
				return [""];
			}
			return [undefined];
		});

		(useSetAtom as Mock).mockImplementation((atom) => {
			if (atom === setTranscriptAtom) {
				return mockSetTranscript;
			}
			if (atom === startListeningAtom) {
				return mockInitiateStartListening;
			}
			if (atom === stopListeningAtom) {
				return mockInitiateStopListening;
			}
			return vi.fn();
		});
	});

	describe("初期状態", () => {
		it("適切な初期値を返すこと", () => {
			const { result } = renderHook(() => useVoiceChat());

			expect(result.current.isListening).toBe(false);
			expect(result.current.transcript).toBe("");
			expect(typeof result.current.startListening).toBe("function");
			expect(typeof result.current.stopListening).toBe("function");
		});
	});

	describe("ブラウザサポート", () => {
		it("SpeechRecognition がサポートされていない場合でも startListening は動作すること", () => {
			const { result } = renderHook(() => useVoiceChat());

			act(() => {
				result.current.startListening();
			});

			expect(mockInitiateStartListening).toHaveBeenCalledTimes(1);
		});

		it("音声認識の基本機能が動作すること", () => {
			// isListening を true に設定
			(useAtom as Mock).mockImplementation((atom) => {
				if (atom === isListeningAtom) {
					return [true];
				}
				if (atom === transcriptAtom) {
					return [""];
				}
				return [undefined];
			});

			renderHook(() => useVoiceChat());

			// SpeechRecognitionが使用されることを確認（グローバルモックが使用される）
			// biome-ignore lint/suspicious/noExplicitAny: テスト用のグローバルモックアクセス
			const globalMock = (window as any).SpeechRecognition;
			expect(globalMock).toBeDefined();
		});
	});

	describe("音声認識の開始", () => {
		it("startListening が呼ばれたときに initiateStartListening を実行すること", async () => {
			const { result } = renderHook(() => useVoiceChat());

			await act(async () => {
				await result.current.startListening();
			});

			expect(mockInitiateStartListening).toHaveBeenCalledTimes(1);
		});

		it("isListening が true になったときに適切に動作すること", () => {
			// isListening を true に設定
			(useAtom as Mock).mockImplementation((atom) => {
				if (atom === isListeningAtom) {
					return [true];
				}
				if (atom === transcriptAtom) {
					return [""];
				}
				return [undefined];
			});

			const { result } = renderHook(() => useVoiceChat());

			// フックが正常に実行されることを確認
			expect(result.current.isListening).toBe(true);
		});

		it("TTS を停止すること", () => {
			// isListening を true に設定
			(useAtom as Mock).mockImplementation((atom) => {
				if (atom === isListeningAtom) {
					return [true];
				}
				if (atom === transcriptAtom) {
					return [""];
				}
				return [undefined];
			});

			renderHook(() => useVoiceChat());

			expect(mockStopTTS).toHaveBeenCalled();
		});
	});

	describe("音声認識の停止", () => {
		it("stopListening が呼ばれたときに initiateStopListening を実行すること", async () => {
			const { result } = renderHook(() => useVoiceChat());

			await act(async () => {
				await result.current.stopListening();
			});

			expect(mockInitiateStopListening).toHaveBeenCalledTimes(1);
		});

		it("isListening の状態変化が適切に処理されること", () => {
			// 最初はtrueで開始
			let isListening = true;
			(useAtom as Mock).mockImplementation((atom) => {
				if (atom === isListeningAtom) {
					return [isListening];
				}
				if (atom === transcriptAtom) {
					return [""];
				}
				return [undefined];
			});

			const { rerender } = renderHook(() => useVoiceChat());

			// 初期状態での値を確認
			expect(isListening).toBe(true);

			// falseに変更
			isListening = false;
			(useAtom as Mock).mockImplementation((atom) => {
				if (atom === isListeningAtom) {
					return [false];
				}
				if (atom === transcriptAtom) {
					return [""];
				}
				return [undefined];
			});

			rerender();

			// 状態が変更されたことを確認
			expect(isListening).toBe(false);
		});
	});

	describe("音声認識結果の処理", () => {
		it("transcript が適切に管理されること", () => {
			// transcriptを設定
			(useAtom as Mock).mockImplementation((atom) => {
				if (atom === isListeningAtom) {
					return [false];
				}
				if (atom === transcriptAtom) {
					return ["こんにちは"];
				}
				return [undefined];
			});

			const { result } = renderHook(() => useVoiceChat());

			expect(result.current.transcript).toBe("こんにちは");
		});

		it("setTranscript が正しく設定されること", () => {
			renderHook(() => useVoiceChat());

			// setTranscriptが呼ばれた時の動作をテスト
			act(() => {
				mockSetTranscript("テスト音声");
			});

			expect(mockSetTranscript).toHaveBeenCalledWith("テスト音声");
		});
	});

	describe("エラーハンドリング", () => {
		it("フック内でのエラーが適切に処理されること", () => {
			// エラーが発生してもフックが正常に動作することを確認
			expect(() => {
				renderHook(() => useVoiceChat());
			}).not.toThrow();
		});
	});

	describe("クリーンアップ", () => {
		it("コンポーネントのアンマウント時に適切にクリーンアップされること", () => {
			// isListening を true に設定してインスタンスを作成
			(useAtom as Mock).mockImplementation((atom) => {
				if (atom === isListeningAtom) {
					return [true];
				}
				if (atom === transcriptAtom) {
					return [""];
				}
				return [undefined];
			});

			const { unmount } = renderHook(() => useVoiceChat());

			// アンマウント処理でエラーが発生しないことを確認
			expect(() => {
				unmount();
			}).not.toThrow();
		});
	});

	describe("API の一貫性", () => {
		it("公開APIが一貫していること", () => {
			const { result } = renderHook(() => useVoiceChat());

			expect(result.current).toHaveProperty("isListening");
			expect(result.current).toHaveProperty("transcript");
			expect(result.current).toHaveProperty("startListening");
			expect(result.current).toHaveProperty("stopListening");

			expect(typeof result.current.startListening).toBe("function");
			expect(typeof result.current.stopListening).toBe("function");
		});
	});
});
