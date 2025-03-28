"use client";
import type React from "react";
import { MessageCircle, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export type ActionPromptViewProps = {
	categoryTitle: string;
	showQuestionInput: boolean;
	question: string;
	onQuestionClick: () => void;
	onQuestionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onQuestionKeyDown: (e: React.KeyboardEvent) => void;
	onSendQuestion: () => void;
	onSearch: () => void;
};

export const ActionPromptView: React.FC<ActionPromptViewProps> = ({
	categoryTitle,
	showQuestionInput,
	question,
	onQuestionClick,
	onQuestionChange,
	onQuestionKeyDown,
	onSendQuestion,
	onSearch,
}) => {
	return (
		<motion.div
			className="w-xl z-40"
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: 100, opacity: 0 }}
			transition={{ type: "spring", damping: 25, stiffness: 300 }}
		>
			<div className="bg-white rounded-lg shadow-lg overflow-hidden">
				<div className="bg-[#b3cfad] text-[#333333] p-3">
					<h3 className="font-bold text-center">「{categoryTitle}」について</h3>
				</div>

				<div className="p-3 space-y-2">
					{!showQuestionInput ? (
						<>
							<Button
								variant="outline"
								className="w-full flex items-center text-center hover:bg-[#d9ca77]/20 hover:text-[#9f9579] hover:border-[#9f9579]"
								onClick={onSearch}
							>
								<Search className="w-4 h-4" />
								このカテゴリで検索する
							</Button>

							<Button
								variant="outline"
								className="w-full flex items-center text-center hover:bg-[#d9ca77]/20 hover:text-[#9f9579] hover:border-[#9f9579]"
								onClick={onQuestionClick}
							>
								<MessageCircle className="w-2 h-2" />
								質問を入力して検索する
							</Button>
						</>
					) : (
						<div className="flex gap-2">
							<Input
								value={question}
								onChange={onQuestionChange}
								placeholder={`${categoryTitle}について質問...`}
								className="flex-1"
								autoFocus
								onKeyDown={onQuestionKeyDown}
							/>
							<Button
								onClick={onSendQuestion}
								disabled={!question.trim()}
								className="bg-[#9f9579] hover:bg-[#9f9579]/90 text-white"
							>
								<Send className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
};
