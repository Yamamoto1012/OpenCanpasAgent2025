import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStreamingTTS } from "../useStreamingTTS";

// モック設定
const mockRequestTTS = vi.fn();
const mockCreateAudioURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

// audio utilのモック
vi.mock("@/lib/utils/audio", () => ({
	requestTTS: (...args: unknown[]) => mockRequestTTS(...args),
	createAudioURL: (...args: unknown[]) => mockCreateAudioURL(...args),
	revokeObjectURL: (...args: unknown[]) => mockRevokeObjectURL(...args),
	estimateAudioDuration: () => 1000,
}));

// useTranslationのモック
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// HTMLAudioElementのモック
const mockAudio = {
	play: vi.fn().mockResolvedValue(undefined),
	pause: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
};

// global Audioコンストラクタのモック
global.Audio = vi.fn().mockImplementation(() => mockAudio);

describe("useStreamingTTS", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestTTS.mockResolvedValue(new Blob());
		mockCreateAudioURL.mockReturnValue("mock-audio-url");
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("初期状態が正しく設定される", () => {
		const { result } = renderHook(() => useStreamingTTS());

		expect(result.current.state).toEqual({
			isGenerating: false,
			isPlaying: false,
			currentQueueItem: null,
			queue: [],
			error: null,
		});
		expect(result.current.isReady).toBe(true);
	});

	it("テキストをキューに追加できる", () => {
		const { result } = renderHook(() => useStreamingTTS());

		act(() => {
			result.current.addToQueue("こんにちは。元気ですか？");
		});

		expect(result.current.state.queue).toHaveLength(2);
		expect(result.current.state.queue[0].text).toBe("こんにちは");
		expect(result.current.state.queue[1].text).toBe("元気ですか");
	});

	it("文の分割が正しく動作する", () => {
		const { result } = renderHook(() => useStreamingTTS());

		act(() => {
			result.current.addToQueue("今日は良い天気です！明日も晴れでしょう。");
		});

		expect(result.current.state.queue).toHaveLength(2);
		expect(result.current.state.queue[0].text).toBe("今日は良い天気です");
		expect(result.current.state.queue[1].text).toBe("明日も晴れでしょう");
	});

	it("空のテキストは無視される", () => {
		const { result } = renderHook(() => useStreamingTTS());

		act(() => {
			result.current.addToQueue("");
			result.current.addToQueue("   ");
		});

		expect(result.current.state.queue).toHaveLength(0);
	});

	it("ストリーミングを開始できる", () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useStreamingTTS());

		act(() => {
			result.current.startStreaming();
		});

		// タイマーが設定されているかチェック
		expect(vi.getTimerCount()).toBeGreaterThan(0);

		vi.useRealTimers();
	});

	it("ストリーミングを停止できる", () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useStreamingTTS());

		act(() => {
			result.current.startStreaming();
		});

		act(() => {
			result.current.stopStreaming();
		});

		// タイマーがクリアされているかチェック
		expect(vi.getTimerCount()).toBe(0);

		vi.useRealTimers();
	});

	it("キューをクリアできる", () => {
		const { result } = renderHook(() => useStreamingTTS());

		act(() => {
			result.current.addToQueue("テストメッセージ。");
		});

		expect(result.current.state.queue).toHaveLength(1);

		act(() => {
			result.current.clearQueue();
		});

		expect(result.current.state.queue).toHaveLength(0);
	});

	it("maxQueueSizeが正しく機能する", () => {
		const { result } = renderHook(() => useStreamingTTS({ maxQueueSize: 3 }));

		act(() => {
			result.current.addToQueue(
				"メッセージ1。メッセージ2。メッセージ3。メッセージ4。メッセージ5。",
			);
		});

		// maxQueueSize=3なので、最新の3つのアイテムのみ保持される
		expect(result.current.state.queue).toHaveLength(3);
		expect(result.current.state.queue[0].text).toBe("メッセージ3");
		expect(result.current.state.queue[1].text).toBe("メッセージ4");
		expect(result.current.state.queue[2].text).toBe("メッセージ5");
	});

	it("カスタム分割パターンが機能する", () => {
		const { result } = renderHook(() =>
			useStreamingTTS({ splitPattern: /[,，]/ }),
		);

		act(() => {
			result.current.addToQueue("りんご,バナナ，オレンジ");
		});

		expect(result.current.state.queue).toHaveLength(3);
		expect(result.current.state.queue[0].text).toBe("りんご");
		expect(result.current.state.queue[1].text).toBe("バナナ");
		expect(result.current.state.queue[2].text).toBe("オレンジ");
	});

	it("VRMとの連携オプションが正しく設定される", () => {
		const mockVRMRef = {
			current: {
				playAudio: vi.fn(),
				crossFadeAnimation: vi.fn(),
				setExpression: vi.fn(),
				setExpressionForMotion: vi.fn(),
				setExpressionBySentiment: vi.fn(),
				startThinking: vi.fn(),
				stopThinking: vi.fn(),
				isThinking: false,
				getLastMotion: vi.fn().mockReturnValue(""),
				restoreLastMotion: vi.fn(),
			},
		};

		const { result } = renderHook(() =>
			useStreamingTTS({ vrmWrapperRef: mockVRMRef }),
		);

		expect(result.current.isReady).toBe(true);
	});

	it("音声再生の排他制御が機能する", async () => {
		vi.useFakeTimers();
		mockRequestTTS.mockResolvedValue(new Blob());
		mockCreateAudioURL.mockReturnValue("mock-audio-url");

		const { result } = renderHook(() => useStreamingTTS());

		act(() => {
			result.current.addToQueue("テスト1。テスト2。");
			result.current.startStreaming();
		});

		// 最初の音声が生成されるまで待機
		act(() => {
			vi.advanceTimersByTime(2000);
		});

		// 同時に複数の音声が再生されないことを確認
		await waitFor(() => {
			const playingItems = result.current.state.queue.filter(
				(item) => item.isPlaying,
			);
			expect(playingItems).toHaveLength(0); // まだ生成中なので再生は開始されていない
		});

		vi.useRealTimers();
	});
});
