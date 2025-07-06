import type { VRMWrapperHandle } from "@/features/VRM/VRMWrapper/VRMWrapper";
import * as audioUtils from "@/lib/utils/audio";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTextToSpeech } from "./useTextToSpeech";

// モック設定
vi.mock("@/lib/utils/audio", () => ({
	requestTTS: vi.fn(),
	createAudioURL: vi.fn(),
	revokeObjectURL: vi.fn(),
	estimateAudioDuration: vi.fn(),
	validateTTSRequest: vi.fn(),
}));

// HTMLAudioElementのモック
class MockAudio {
	public autoplay = false;
	public volume = 1;
	public loop = false;
	public src = "";
	public error: MediaError | null = null;
	private eventListeners: { [key: string]: EventListener[] } = {};

	constructor(src?: string) {
		if (src) this.src = src;
	}

	addEventListener(type: string, listener: EventListener) {
		if (!this.eventListeners[type]) {
			this.eventListeners[type] = [];
		}
		this.eventListeners[type].push(listener);
	}

	removeEventListener(type: string, listener: EventListener) {
		if (this.eventListeners[type]) {
			const index = this.eventListeners[type].indexOf(listener);
			if (index > -1) {
				this.eventListeners[type].splice(index, 1);
			}
		}
	}

	async play(): Promise<void> {
		return Promise.resolve();
	}

	pause() {
		// モック実装
	}

	// テスト用のイベント発火メソッド
	fireEvent(type: string) {
		if (this.eventListeners[type]) {
			for (const listener of this.eventListeners[type]) {
				listener({ target: this, type } as unknown as Event);
			}
		}
	}
}

// グローバルなAudioをモック
global.Audio = MockAudio as unknown as typeof Audio;

describe("useTextToSpeech", () => {
	const mockRequestTTS = vi.mocked(audioUtils.requestTTS);
	const mockCreateAudioURL = vi.mocked(audioUtils.createAudioURL);
	const mockRevokeObjectURL = vi.mocked(audioUtils.revokeObjectURL);
	const mockEstimateAudioDuration = vi.mocked(audioUtils.estimateAudioDuration);

	beforeEach(() => {
		vi.clearAllMocks();

		// デフォルトのモック動作
		mockRequestTTS.mockResolvedValue(
			new Blob(["audio-data"], { type: "audio/wav" }),
		);
		mockCreateAudioURL.mockReturnValue("blob:audio-url");
		mockEstimateAudioDuration.mockReturnValue(5000);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("初期状態", () => {
		it("初期状態が正しく設定される", () => {
			const { result } = renderHook(() => useTextToSpeech());

			expect(result.current.state).toEqual({
				isLoading: false,
				error: null,
				isPlaying: false,
				currentText: null,
			});
			expect(result.current.isReady).toBe(true);
		});
	});

	describe("speak関数", () => {
		it("正常にテキストを音声に変換して再生する", async () => {
			const { result } = renderHook(() => useTextToSpeech());

			await act(async () => {
				await result.current.speak("こんにちは");
			});

			await waitFor(() => {
				expect(result.current.state.isLoading).toBe(false);
			});

			expect(mockRequestTTS).toHaveBeenCalledWith(
				{
					text: "こんにちは",
					speakerId: 888753760,
					format: "wav",
				},
				expect.any(Function),
			);
			expect(mockCreateAudioURL).toHaveBeenCalled();
			expect(result.current.state.currentText).toBe("こんにちは");
		});

		it("空のテキストでエラーが発生する", async () => {
			const { result } = renderHook(() => useTextToSpeech());

			await act(async () => {
				await result.current.speak("");
			});

			expect(result.current.state.error).toEqual(
				new Error("テキストが入力されていません"),
			);
		});

		it("カスタム話者IDで音声合成を実行する", async () => {
			const { result } = renderHook(() =>
				useTextToSpeech({
					defaultSpeakerId: 123456,
				}),
			);

			await act(async () => {
				await result.current.speak("テスト", 654321);
			});

			await waitFor(() => {
				expect(mockRequestTTS).toHaveBeenCalledWith(
					{
						text: "テスト",
						speakerId: 654321,
						format: "wav",
					},
					expect.any(Function),
				);
			});
		});

		it("TTS APIエラー時に適切にエラーハンドリングする", async () => {
			const error = new Error("TTS API エラー");
			mockRequestTTS.mockRejectedValue(error);

			const { result } = renderHook(() => useTextToSpeech());

			await act(async () => {
				await result.current.speak("エラーテスト");
			});

			await waitFor(() => {
				expect(result.current.state.error).toEqual(error);
				expect(result.current.state.isLoading).toBe(false);
				expect(result.current.state.isPlaying).toBe(false);
			});
		});
	});

	describe("stop関数", () => {
		it("再生を停止してクリーンアップを実行する", async () => {
			const { result } = renderHook(() => useTextToSpeech());

			// まず音声を開始
			await act(async () => {
				await result.current.speak("停止テスト");
			});

			// 停止
			act(() => {
				result.current.stop();
			});

			expect(result.current.state.isPlaying).toBe(false);
			expect(result.current.state.currentText).toBe(null);
			expect(mockRevokeObjectURL).toHaveBeenCalled();
		});
	});

	describe("VRM連携", () => {
		it("VRMWrapperRefが提供されている場合はVRM経由で再生する", async () => {
			const mockPlayAudio = vi.fn();
			const mockVRMRef = {
				current: {
					playAudio: mockPlayAudio,
				},
			};

			const { result } = renderHook(() =>
				useTextToSpeech({
					vrmWrapperRef:
						mockVRMRef as unknown as React.RefObject<VRMWrapperHandle>,
				}),
			);

			await act(async () => {
				await result.current.speak("VRMテスト");
			});

			await waitFor(() => {
				expect(mockPlayAudio).toHaveBeenCalledWith(
					"blob:audio-url",
					"VRMテスト",
				);
			});
		});

		it("VRMの機能が利用できない場合は通常の音声再生にフォールバック", async () => {
			const mockVRMRef = { current: null };

			const { result } = renderHook(() =>
				useTextToSpeech({
					vrmWrapperRef: mockVRMRef as React.RefObject<null>,
				}),
			);

			await act(async () => {
				await result.current.speak("フォールバックテスト");
			});

			await waitFor(() => {
				expect(result.current.state.isPlaying).toBe(true);
			});
		});
	});

	describe("クリーンアップ", () => {
		it("コンポーネントアンマウント時にリソースをクリーンアップする", async () => {
			const { result, unmount } = renderHook(() => useTextToSpeech());

			// まず音声を開始してURLを作成する
			await act(async () => {
				await result.current.speak("クリーンアップテスト");
			});

			// 音声が作成されたことを確認
			expect(mockCreateAudioURL).toHaveBeenCalled();

			// アンマウント
			unmount();

			// クリーンアップでrevokeObjectURLが呼ばれることを確認
			expect(mockRevokeObjectURL).toHaveBeenCalled();
		});
	});

	describe("オプション設定", () => {
		it("デフォルト設定がカスタムオプションで上書きされる", () => {
			const { result } = renderHook(() =>
				useTextToSpeech({
					defaultSpeakerId: 999999,
					defaultFormat: "mp3",
				}),
			);

			expect(result.current.isReady).toBe(true);
		});
	});
});
