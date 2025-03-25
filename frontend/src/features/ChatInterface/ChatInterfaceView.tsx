"use client";
import * as React from "react";
import { RefreshCw, Send } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message } from "./ChatInterface";

export type ChatInterfaceViewProps = {
  messages: Message[];
  inputValue: string;
  onInputChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  onSend: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export const ChatInterfaceView: React.FC<ChatInterfaceViewProps> = ({
  messages,
  inputValue,
  onInputChange,
  onKeyDown,
  onSend,
  messagesEndRef,
}) => {
  return (
    <div className="w-md max-w-md h-[80vh] max-h-[700px] flex flex-col rounded-lg overflow-hidden shadow-xl">
      {/* ヘッダー */}
      <div
        style={{ backgroundColor: "#b3cfad" }}
        className="p-3 flex items-center"
      >
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-gray-700 hover:bg-white/20"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
        <span className="ml-2 font-medium text-gray-800">
          会話を最初からやり直す
        </span>
      </div>

      {/* チャット本文 */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-center gap-3 ${message.isUser ? "flex-row-reverse" : ""}`}
            >
              <div className="flex-shrink-0">
                {message.isUser ? (
                  <Avatar
                    className="h-10 w-10 rounded-full border-2 border-white"
                    style={{ backgroundColor: "#f0f0f0" }}
                  >
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar
                    className="h-10 w-10 rounded-full border-2 border-white"
                    style={{ backgroundColor: "#d9ca77" }}
                  >
                    <AvatarImage src="/chatIcon.png" />
                    <AvatarFallback>KIT</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div
                className={`rounded-2xl p-3 px-4 max-w-[80%] shadow-sm ${
                  message.isUser
                    ? "bg-green-100 text-right"
                    : "bg-white text-left"
                }`}
              >
                <p className="text-gray-800">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 選択ボタン */}
      <div
        style={{ backgroundColor: "#b3cfad" }}
        className="p-2 flex gap-2 overflow-x-auto"
      >
        <Button
          variant="outline"
          className="whitespace-nowrap rounded-full text-sm border-0 hover:text-gray-800"
          style={{ backgroundColor: "white", color: "#9f9579" }}
        >
          学校生活
        </Button>
        <Button
          variant="outline"
          className="whitespace-nowrap rounded-full text-sm border-0 hover:text-gray-800"
          style={{ backgroundColor: "white", color: "#9f9579" }}
        >
          おすすめの学部学科
        </Button>
        <Button
          variant="outline"
          className="whitespace-nowrap rounded-full text-sm border-0 hover:text-gray-800"
          style={{ backgroundColor: "white", color: "#9f9579" }}
        >
          就職実績
        </Button>
      </div>

      {/* 入力エリア */}
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
        />
        <Button
          onClick={onSend}
          size="icon"
          className="text-white rounded-md"
          style={{ backgroundColor: "#9f9579", borderColor: "#9f9579" }}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
