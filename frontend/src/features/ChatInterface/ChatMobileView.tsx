import type React from "react";
import { motion } from "framer-motion";
import { Send, Mic, MicOff } from "lucide-react";
import type { Message } from "@/store/chatAtoms";

export type ChatMobileViewProps = {
	messages: Message[];
	inputValue: string;
	isThinking: boolean;
	isRecording: boolean;
	onInputChange: React.ChangeEventHandler<HTMLTextAreaElement>;
	onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
	onSend: () => void;
	onToggleRecording: () => void;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * モバイル専用チャットUI
 * @param messages - メッセージの配列
 * @param inputValue - 入力値の値
 * @param isThinking - 応答中かどうかのフラグ
 * @param isRecording - 音声入力中かどうかのフラグ
 * @param onInputChange - 入力値変更時のハンドラ
 * @param onKeyDown - キー入力時のハンドラ
 * @param onSend - 送信ボタン押下時のハンドラ
 * @param onToggleRecording - 音声入力のトグルハンドラ
 * @param messagesEndRef - メッセージの末尾を参照するためのRef
 */
export const ChatMobileView: React.FC<ChatMobileViewProps> = ({
	messages,
	inputValue,
	isThinking,
	isRecording,
	onInputChange,
	onKeyDown,
	onSend,
	onToggleRecording,
	messagesEndRef,
}) => {
	// メッセージがある場合のみメッセージエリアを表示
	const hasMessages = messages.length > 0;

	return (
		<div className="w-full h-full flex flex-col bg-transparent relative">
			{/* メッセージエリア */}
			<div className="absolute bottom-0 left-0 right-0">
				{/* メッセージ履歴 */}
				{hasMessages && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="px-4 pb-4 max-h-80 overflow-y-auto"
					>
						<div className="space-y-3">
							{messages.slice(-5).map((message) => (
								<motion.div
									key={message.id}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className={`flex ${
										message.isUser ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`
										max-w-[85%] px-4 py-3 rounded-2xl shadow-lg
										${
											message.isUser
												? "bg-white text-gray-800 rounded-br-md border border-gray-200"
												: "bg-[#b3cfad] text-white rounded-bl-md"
										}
									`}
									>
										<p className="text-sm leading-relaxed">{message.text}</p>
									</div>
								</motion.div>
							))}
							{isThinking && (
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className="flex justify-start"
								>
									<div className="bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-200 px-4 py-3 shadow-lg">
										<div className="flex space-x-1">
											<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
											<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
											<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
										</div>
									</div>
								</motion.div>
							)}
							<div ref={messagesEndRef} />
						</div>
					</motion.div>
				)}

				{/* 入力エリア */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="px-4"
				>
					<div className="bg-white rounded-full shadow-lg border border-gray-200 p-2">
						<div className="flex items-end gap-2">
							{/* メッセージ入力欄 */}
							<div className="flex-1">
								<textarea
									value={inputValue}
									onChange={onInputChange}
									onKeyDown={onKeyDown}
									placeholder={
										isRecording
											? "音声を認識しています..."
											: hasMessages
												? "メッセージを入力..."
												: "キャラクターと会話を始めましょう"
									}
									disabled={isThinking || isRecording}
									rows={1}
									className="
										w-full px-4 py-3 bg-transparent border-0 outline-none resize-none
										text-gray-800 placeholder-gray-500
										max-h-20 overflow-y-auto
									"
									style={{
										minHeight: 48,
										lineHeight: 1.5,
									}}
								/>
							</div>

							{/* 音声入力ボタン */}
							<motion.button
								whileTap={{ scale: 0.95 }}
								onClick={onToggleRecording}
								disabled={isThinking}
								className={`
									p-3 rounded-full flex-shrink-0 touch-manipulation
									${
										isRecording
											? "bg-red-500 text-white animate-pulse"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200"
									}
									disabled:opacity-50
								`}
							>
								{isRecording ? (
									<MicOff className="h-5 w-5" />
								) : (
									<Mic className="h-5 w-5" />
								)}
							</motion.button>

							{/* 送信ボタン */}
							<motion.button
								whileTap={{ scale: 0.95 }}
								onClick={onSend}
								disabled={isThinking || !inputValue.trim() || isRecording}
								className="
									bg-[#b3cfad] text-white p-3 rounded-full flex-shrink-0 touch-manipulation
									disabled:opacity-50 disabled:bg-gray-300
									hover:bg-[#9f9579] transition-colors
								"
							>
								<Send className="h-5 w-5" />
							</motion.button>
						</div>
					</div>
				</motion.div>

				{/* 初回ガイド - メッセージがない場合 */}
				{!hasMessages && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className="px-4 pt-4"
					>
						<div className="text-center text-white/80">
							<p className="text-sm mb-2">こんにちは！</p>
							<p className="text-xs">
								メッセージを入力するか、マイクボタンで音声入力してください
							</p>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
};
