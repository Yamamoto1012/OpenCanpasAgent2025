"use client";
import React from "react";
import type { Message } from "../ChatInterface";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatThinkingIndicator } from "./ChatThinkingIndicator";

export type ChatMessagesProps = {
  messages: Message[];
  isThinking: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isThinking,
  messagesEndRef,
}) => {
  return (
    <div
      className="flex-1 overflow-y-auto p-4"
      style={{ backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="flex flex-col space-y-4">
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}
        {isThinking && <ChatThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
