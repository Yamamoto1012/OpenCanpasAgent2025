"use client";
import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ChatInputAreaProps = {
	inputValue: string;
	isThinking: boolean;
	onInputChange: React.ChangeEventHandler<HTMLInputElement>;
	onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
	onSend: () => void;
};

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
	inputValue,
	isThinking,
	onInputChange,
	onKeyDown,
	onSend,
}) => {
	return (
		<div
			style={{ backgroundColor: "#b3cfad" }}
			className="p-2 flex items-center gap-2"
		>
			<Input
				value={inputValue}
				onChange={onInputChange}
				onKeyDown={onKeyDown}
				placeholder="入力する"
				className="flex-1 bg-white rounded-md border-0"
				disabled={isThinking}
			/>
			<Button
				onClick={onSend}
				size="icon"
				className="text-white rounded-md"
				style={{ backgroundColor: "#9f9579", borderColor: "#9f9579" }}
				disabled={isThinking || !inputValue.trim()}
			>
				<Send className="h-5 w-5" />
			</Button>
		</div>
	);
};
