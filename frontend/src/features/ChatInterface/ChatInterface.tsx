"use client";
import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { ChatInterfaceView } from "./ChatInterfaceView";

export type Message = {
  id: number;
  text: string;
  isUser: boolean;
};

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "金沢工業大学へようこそ!!", isUser: false },
    { id: 2, text: "なんでも質問してください!!", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージ更新時にスクロールするための処理
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 入力欄からの値更新
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // メッセージ送信処理（空白のみは送信しない）
  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: inputValue,
          isUser: true,
        },
      ]);
      setInputValue("");

      // 簡易的な応答
      setTimeout(() => {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: currentMessages.length + 1,
            text: "ご質問ありがとうございます。お答えします！",
            isUser: false,
          },
        ]);
      }, 1000);
    }
  };

  // Enter キー送信
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatInterfaceView
      messages={messages}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onSend={handleSend}
      messagesEndRef={messagesEndRef}
    />
  );
};
