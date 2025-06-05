import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { beforeAll, vi } from "vitest";

export const user = userEvent.setup();

// ブラウザAPIのモック設定
beforeAll(() => {
	// Navigator.clipboard API のモック
	Object.defineProperty(navigator, "clipboard", {
		value: {
			writeText: vi.fn().mockResolvedValue(undefined),
			readText: vi.fn().mockResolvedValue(""),
		},
		writable: true,
	});

	// getUserMedia API のモック
	Object.defineProperty(navigator, "mediaDevices", {
		value: {
			getUserMedia: vi
				.fn()
				.mockRejectedValue(
					new Error("getUserMedia not available in test environment"),
				),
		},
		writable: true,
	});

	// Web Speech API のモック
	const mockSpeechRecognition = vi.fn(() => ({
		continuous: false,
		interimResults: false,
		lang: "ja-JP",
		onresult: null,
		onerror: null,
		onend: null,
		start: vi.fn(),
		stop: vi.fn(),
		abort: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}));

	Object.defineProperty(window, "SpeechRecognition", {
		value: mockSpeechRecognition,
		writable: true,
	});

	Object.defineProperty(window, "webkitSpeechRecognition", {
		value: mockSpeechRecognition,
		writable: true,
	});

	// window.alert のモック
	Object.defineProperty(window, "alert", {
		value: vi.fn(),
		writable: true,
	});

	// URL.revokeObjectURL のモック
	Object.defineProperty(URL, "revokeObjectURL", {
		value: vi.fn(),
		writable: true,
	});

	// URL.createObjectURL のモック
	Object.defineProperty(URL, "createObjectURL", {
		value: vi.fn().mockReturnValue("blob:mock-url"),
		writable: true,
	});
});

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});
