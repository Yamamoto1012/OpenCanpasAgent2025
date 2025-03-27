"use client";
import { useState } from "react";
import { Search, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

type ActionPromptProps = {
	categoryTitle: string;
	onSearch: () => void;
	onAskQuestion: (question: string) => void;
};

export const ActionPrompt: React.FC<ActionPromptProps> = ({
	categoryTitle,
	onSearch,
	onAskQuestion,
}) => {
	const [showChatInput, setShowChatInput] = useState(false);
	const [question, setQuestion] = useState("");

	// 質問送信処理
	const handleSubmitQuestion = () => {
		if (question.trim()) {
			onAskQuestion(question);
			setQuestion("");
		}
	};

	return (
		<motion.div
			className="bg-white rounded-lg p-4 shadow-lg min-w-full"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
		>
			<div className="text-center mb-4">
				<h3 className="text-lg font-medium text-gray-800">
					「{categoryTitle}」について
				</h3>
				<p className="text-sm text-gray-600">どのように調べますか？</p>
			</div>

			<div className="space-y-3">
				{!showChatInput ? (
					<>
						<Button
							className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
							onClick={onSearch}
						>
							<Search className="w-4 h-4" />
							このカテゴリで検索する
						</Button>
						<Button
							className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
							onClick={() => setShowChatInput(true)}
						>
							<MessageCircle className="w-4 h-4" />
							質問を入力する
						</Button>
					</>
				) : (
					<div className="flex gap-2">
						<Input
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							placeholder={`${categoryTitle}について質問する...`}
							className="flex-1"
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.nativeEvent.isComposing)
									handleSubmitQuestion();
							}}
						/>
						<Button
							onClick={handleSubmitQuestion}
							disabled={!question.trim()}
							className="bg-blue-600 hover:bg-blue-700"
						>
							<Send className="w-4 h-4" />
						</Button>
					</div>
				)}
			</div>
		</motion.div>
	);
};
