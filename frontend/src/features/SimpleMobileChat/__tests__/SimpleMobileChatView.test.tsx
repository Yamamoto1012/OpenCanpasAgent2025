import type { SimpleChatMessage } from "@/store/simpleChatAtoms";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SimpleMobileChatView } from "../SimpleMobileChatView";

// モックのprops
const mockProps = {
	messages: [] as SimpleChatMessage[],
	inputValue: "",
	isThinking: false,
	onInputChange: vi.fn(),
	onKeyDown: vi.fn(),
	onCompositionStart: vi.fn(),
	onCompositionEnd: vi.fn(),
	onSend: vi.fn(),
	messagesEndRef: { current: null },
};

describe("SimpleMobileChatView", () => {
	it("初期状態でヘッダーと入力欄が表示される", () => {
		render(<SimpleMobileChatView {...mockProps} />);

		expect(screen.getByText("AI チャット")).toBeInTheDocument();
		expect(screen.getByText("いつでもお話しできます")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("メッセージを入力..."),
		).toBeInTheDocument();
	});

	it("メッセージがない場合は初期メッセージが表示される", () => {
		render(<SimpleMobileChatView {...mockProps} />);

		expect(screen.getByText("AIとチャットを始めましょう")).toBeInTheDocument();
		expect(
			screen.getByText(/何でもお気軽にお聞きください/),
		).toBeInTheDocument();
	});

	it("メッセージがある場合はメッセージリストが表示される", () => {
		const messagesWithData = [
			{
				id: "1",
				text: "こんにちは",
				isUser: true,
				timestamp: new Date("2025-01-01T12:00:00"),
			},
			{
				id: "2",
				text: "こんにちは！何かお手伝いできることはありますか？",
				isUser: false,
				timestamp: new Date("2025-01-01T12:00:01"),
			},
		];

		render(<SimpleMobileChatView {...mockProps} messages={messagesWithData} />);

		expect(screen.getByText("こんにちは")).toBeInTheDocument();
		expect(
			screen.getByText("こんにちは！何かお手伝いできることはありますか？"),
		).toBeInTheDocument();
		expect(screen.getByText("2件のメッセージ")).toBeInTheDocument();
	});

	it("送信ボタンクリック時にonSendが呼ばれる", () => {
		const mockOnSend = vi.fn();
		render(<SimpleMobileChatView {...mockProps} onSend={mockOnSend} />);

		const sendButton = screen.getByLabelText("メッセージを送信");
		fireEvent.click(sendButton);

		expect(mockOnSend).toHaveBeenCalledTimes(1);
	});

	it("思考中はローディングインジケーターが表示される", () => {
		render(<SimpleMobileChatView {...mockProps} isThinking={true} />);

		expect(screen.getByText("AIが考えています...")).toBeInTheDocument();
	});

	it("入力値変更時にonInputChangeが呼ばれる", () => {
		const mockOnInputChange = vi.fn();
		render(
			<SimpleMobileChatView {...mockProps} onInputChange={mockOnInputChange} />,
		);

		const textArea = screen.getByPlaceholderText("メッセージを入力...");
		fireEvent.change(textArea, { target: { value: "テストメッセージ" } });

		expect(mockOnInputChange).toHaveBeenCalled();
	});

	it("思考中は送信ボタンが無効化される", () => {
		render(<SimpleMobileChatView {...mockProps} isThinking={true} />);

		const sendButton = screen.getByLabelText("メッセージを送信");
		expect(sendButton).toBeDisabled();
	});

	it("入力値が空の場合は送信ボタンが無効化される", () => {
		render(<SimpleMobileChatView {...mockProps} inputValue="" />);

		const sendButton = screen.getByLabelText("メッセージを送信");
		expect(sendButton).toBeDisabled();
	});
});
