import type React from "react";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatThinkingIndicator } from "./ChatThinkingIndicator";
import type { Message } from "@/store/chatAtoms";

export type ChatMessagesProps = {
	messages: Message[];
	isThinking: boolean;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * チャットメッセージの表示コンポーネント
 * @param messages - チャットメッセージの配列
 * @param isThinking - 応答中かどうかのフラグ
 * @param messagesEndRef - メッセージの末尾を参照するためのRef
 */
export const ChatMessages: React.FC<ChatMessagesProps> = ({
	messages,
	isThinking,
	messagesEndRef,
}) => {
	return (
		<div
			className="
				flex-1 
				overflow-y-auto 
				p-3 md:p-4 
				overscroll-contain
				scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
			"
			style={{
				backgroundSize: "cover",
				backgroundPosition: "center",
				WebkitOverflowScrolling: "touch",
			}}
		>
			<div className="flex flex-col space-y-3 md:space-y-4 min-h-full">
				{messages.length === 0 && (
					<div className="flex-1 flex items-center justify-center text-gray-500 text-center px-4">
						<p className="text-sm md:text-base">
							メッセージを送信して会話を始めましょう
						</p>
					</div>
				)}
				{messages.map((message) => (
					<ChatMessageItem key={message.id} message={message} />
				))}
				{isThinking && <ChatThinkingIndicator />}
				<div ref={messagesEndRef} className="h-1" />
			</div>
		</div>
	);
};
