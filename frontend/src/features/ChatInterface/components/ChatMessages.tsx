"use client";
import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "../ChatInterface";

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
				{isThinking && (
					<div className="flex items-start gap-3">
						<div className="flex-shrink-0">
							<Avatar
								className="h-10 w-10 rounded-full border-2 border-white"
								style={{ backgroundColor: "#d9ca77" }}
							>
								<AvatarImage src="./chatIcon.png" />
								<AvatarFallback>AI</AvatarFallback>
							</Avatar>
						</div>
						<div className="bg-white rounded-2xl p-3 px-4 shadow-sm flex items-center">
							<motion.div className="flex space-x-1">
								{[0, 1, 2].map((dot) => (
									<motion.div
										key={dot}
										className="w-2 h-2 bg-gray-400 rounded-full"
										animate={{ y: ["0%", "-50%", "0%"] }}
										transition={{
											duration: 0.8,
											repeat: Number.POSITIVE_INFINITY,
											repeatType: "loop",
											ease: "easeInOut",
											delay: dot * 0.2,
										}}
									/>
								))}
							</motion.div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
};
