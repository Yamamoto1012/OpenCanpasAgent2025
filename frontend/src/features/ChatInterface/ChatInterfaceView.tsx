import type { Message } from "@/store/chatAtoms";
import type React from "react";
import { ChatHeader } from "./components/ChatHeader";

import { ChatInputArea } from "./components/ChatInputArea";
import { ChatMessages } from "./components/ChatMessages";
import { ChatSelectButtons } from "./components/ChatSelectButtons";

export type ChatInterfaceViewProps = {
	messages: Message[];
	inputValue: string;
	isThinking: boolean;
	isRecording: boolean;
	isStreamingMode: boolean;
	onInputChange: React.ChangeEventHandler<HTMLTextAreaElement>;
	onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
	onSend: () => void;
	onSelect: (value: string) => void;
	onReset: () => void;
	onToggleRecording: () => void;
	onStop: () => void;
	onToggleStreamingMode: () => void;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * チャットインターフェースのプレゼンテーションコンポーネント
 * @param messages - チャットメッセージの配列
 * @param inputValue - 入力フィールドの値
 * @param isThinking - 応答中かどうかのフラグ
 * @param isRecording - 音声入力中かどうかのフラグ
 * @param onInputChange - 入力値変更時のハンドラ
 * @param onKeyDown - キー入力時のハンドラ
 * @param onSend - 送信ボタン押下時のハンドラ
 * @param onSelect - 候補テキスト選択時のハンドラ
 * @param onReset - チャットリセット時のハンドラ
 * @param onToggleRecording - 音声入力のトグルハンドラ
 * @param onStop - 音声入力停止時のハンドラ
 * @param messagesEndRef - メッセージの末尾を参照するためのRef
 */
export const ChatInterfaceView: React.FC<ChatInterfaceViewProps> = ({
	messages,
	inputValue,
	isThinking,
	isRecording,
	isStreamingMode,
	onInputChange,
	onKeyDown,
	onSend,
	onSelect,
	onReset,
	onToggleRecording,
	onStop,
	onToggleStreamingMode,
	messagesEndRef,
}) => {
	return (
		<div
			className="
			w-md h-full 
			md:max-w-lg md:h-[70vh] 
			lg:h-[75vh] 
			xl:h-[80vh] 
			md:max-h-[600px] lg:max-h-[650px] xl:max-h-[700px] 
			flex flex-col 
			rounded-none md:rounded-lg 
			overflow-hidden 
			shadow-none md:shadow-xl
		"
		>
			<ChatHeader
				onReset={onReset}
				isStreamingMode={isStreamingMode}
				onToggleStreamingMode={onToggleStreamingMode}
			/>
			<ChatMessages
				messages={messages}
				isThinking={isThinking}
				messagesEndRef={messagesEndRef}
			/>
			<ChatSelectButtons onSelect={onSelect} />
			<ChatInputArea
				inputValue={inputValue}
				isThinking={isThinking}
				isRecording={isRecording}
				onInputChange={onInputChange}
				onKeyDown={onKeyDown}
				onSend={onSend}
				onToggleRecording={onToggleRecording}
				onStop={onStop}
			/>
		</div>
	);
};
