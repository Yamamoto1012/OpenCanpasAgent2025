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

// Web Speech API のモック型定義
interface MockSpeechRecognition extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	onresult: ((event: MockSpeechRecognitionEvent) => void) | null;
	onerror: ((event: MockSpeechRecognitionErrorEvent) => void) | null;
	onend: (() => void) | null;
	start: () => void;
	stop: () => void;
	abort: () => void;
}

interface MockSpeechRecognitionEvent {
	results: {
		length: number;
		[index: number]: {
			[index: number]: {
				transcript: string;
			};
		};
	};
}

interface MockSpeechRecognitionErrorEvent {
	error: string;
}

// グローバルモック
const mockRecognition: MockSpeechRecognition = {
	continuous: false,
	interimResults: false,
	lang: "",
	onresult: null,
	onerror: null,
	onend: null,
	start: vi.fn(),
	stop: vi.fn(),
	abort: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn(),
};

const mockSpeechRecognitionConstructor = vi.fn(() => mockRecognition);

// Window オブジェクトのモック
Object.defineProperty(globalThis, "window", {
	value: {
		SpeechRecognition: mockSpeechRecognitionConstructor,
		webkitSpeechRecognition: mockSpeechRecognitionConstructor,
	},
	writable: true,
});

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

		// SpeechRecognition のモックをリセット
		mockRecognition.onresult = null;
		mockRecognition.onerror = null;
		mockRecognition.onend = null;
		vi.clearAllMocks();
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
		it("SpeechRecognition がサポートされていない場合は何もしないこと", () => {
			// SpeechRecognition を削除
			Object.defineProperty(globalThis, "window", {
				value: {},
				writable: true,
			});

			const { result } = renderHook(() => useVoiceChat());

			act(() => {
				result.current.startListening();
			});

			expect(mockInitiateStartListening).toHaveBeenCalledTimes(1);
		});

		it("webkitSpeechRecognition がサポートされている場合は使用すること", () => {
			Object.defineProperty(globalThis, "window", {
				value: {
					webkitSpeechRecognition: mockSpeechRecognitionConstructor,
				},
				writable: true,
			});

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

			expect(mockSpeechRecognitionConstructor).toHaveBeenCalled();
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

		it("isListening が true になったときに SpeechRecognition を初期化すること", () => {
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

			expect(mockSpeechRecognitionConstructor).toHaveBeenCalled();
			expect(mockRecognition.continuous).toBe(true);
			expect(mockRecognition.interimResults).toBe(true);
			expect(mockRecognition.lang).toBe("ja-JP");
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
		it("stopListening が呼ばれたときに initiateStopListening を実行すること", () => {
			const { result } = renderHook(() => useVoiceChat());

			act(() => {
				result.current.stopListening();
			});

			expect(mockInitiateStopListening).toHaveBeenCalledTimes(1);
		});

		it("isListening が false になったときに recognition を停止すること", () => {
			// 最初は true で開始
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

			// false に変更
			isListening = false;
			rerender();

			expect(mockRecognition.abort).toHaveBeenCalled();
		});
	});

	describe("音声認識結果の処理", () => {
		it("音声認識結果を受け取ったときに transcript を更新すること", () => {
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

			// onresult イベントをシミュレート
			const mockEvent: MockSpeechRecognitionEvent = {
				results: {
					length: 1,
					0: {
						0: {
							transcript: "こんにちは",
						},
					},
				},
			};

			act(() => {
				if (mockRecognition.onresult) {
					mockRecognition.onresult(mockEvent);
				}
			});

			expect(mockSetTranscript).toHaveBeenCalledWith("こんにちは");
		});

		it("複数の結果がある場合は最新の結果を使用すること", () => {
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

			// 複数の結果をシミュレート
			const mockEvent: MockSpeechRecognitionEvent = {
				results: {
					length: 3,
					0: { 0: { transcript: "古い結果1" } },
					1: { 0: { transcript: "古い結果2" } },
					2: { 0: { transcript: "最新の結果" } },
				},
			};

			act(() => {
				if (mockRecognition.onresult) {
					mockRecognition.onresult(mockEvent);
				}
			});

			expect(mockSetTranscript).toHaveBeenCalledWith("最新の結果");
		});
	});

	describe("エラーハンドリング", () => {
		it("音声認識エラーが発生したときに適切に処理すること", () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

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

			// onerror イベントをシミュレート
			const mockErrorEvent: MockSpeechRecognitionErrorEvent = {
				error: "network",
			};

			act(() => {
				if (mockRecognition.onerror) {
					mockRecognition.onerror(mockErrorEvent);
				}
			});

			expect(consoleSpy).toHaveBeenCalledWith(
				"Speech recognition error",
				"network",
			);
			expect(mockInitiateStopListening).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("abort エラーの場合は stopListening を呼ばないこと", () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

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

			// abort エラーをシミュレート
			const mockErrorEvent: MockSpeechRecognitionErrorEvent = {
				error: "aborted",
			};

			act(() => {
				if (mockRecognition.onerror) {
					mockRecognition.onerror(mockErrorEvent);
				}
			});

			expect(consoleSpy).toHaveBeenCalledWith(
				"Speech recognition error",
				"aborted",
			);
			expect(mockInitiateStopListening).not.toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("クリーンアップ", () => {
		it("コンポーネントのアンマウント時に recognition を停止すること", () => {
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

			const { unmount } = renderHook(() => useVoiceChat());

			unmount();

			expect(mockRecognition.abort).toHaveBeenCalled();
		});
	});

	describe("認識の開始失敗処理", () => {
		it("recognition.start() が失敗した場合に適切に処理すること", () => {
			// start メソッドでエラーを発生させる
			mockRecognition.start = vi.fn(() => {
				throw new Error("Recognition start failed");
			});

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

			// エラーが発生してもクラッシュしないことを確認
			expect(() => {
				renderHook(() => useVoiceChat());
			}).not.toThrow();
		});
	});
});
