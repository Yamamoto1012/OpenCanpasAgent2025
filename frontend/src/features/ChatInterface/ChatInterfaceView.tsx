"use client";
import type React from "react";
import type { Message } from "./ChatInterface";
import { ChatHeader } from "./components/ChatHeader";

import { ChatSelectButtons } from "./components/ChatSelectButtons";
import { ChatInputArea } from "./components/ChatInputArea";
import { ChatMessages } from "./components/ChatMessages";


export type ChatInterfaceViewProps = {
	messages: Message[];
	inputValue: string;
	isThinking: boolean;
	onInputChange: React.ChangeEventHandler<HTMLInputElement>;
	onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
	onSend: () => void;
	onSelect: (value: string) => void;
	onReset: () => void;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export const ChatInterfaceView: React.FC<ChatInterfaceViewProps> = ({
	messages,
	inputValue,
	isThinking,
	onInputChange,
	onKeyDown,
	onSend,
	onSelect,
	onReset,
	messagesEndRef,
}) => {
	return (
		<div className="w-md max-w-md h-[80vh] max-h-[700px] flex flex-col rounded-lg overflow-hidden shadow-xl">
			<ChatHeader onReset={onReset} />
			<ChatMessages
				messages={messages}
				isThinking={isThinking}
				messagesEndRef={messagesEndRef}
			/>
			<ChatSelectButtons onSelect={onSelect} />
			<ChatInputArea
				inputValue={inputValue}
				isThinking={isThinking}
				onInputChange={onInputChange}
				onKeyDown={onKeyDown}
				onSend={onSend}
			/>
		</div>
	);
};
