import type React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export type SearchResultsViewProps = {
	title: string;
	responseText: string;
	detailText: string;
	inputValue: string;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
	onSendQuestion: () => void;
	onBack: () => void;
	inputRef: React.RefObject<HTMLInputElement>;
};

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
	title,
	responseText,
	detailText,
	inputValue,
	onInputChange,
	onKeyDown,
	onSendQuestion,
	onBack,
	inputRef,
}) => {
	return (
		<div className="w-full max-w-2xl mx-auto">
			{/* ヘッダー部分 */}
			<div className="flex items-center justify-between mb-4">
				<motion.div
					className="flex items-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<Button
						variant="ghost"
						size="sm"
						className="text-gray-500 hover:text-gray-700 p-0 mr-2"
						onClick={onBack}
					>
						<ArrowLeft className="h-4 w-4 mr-1" />
						戻る
					</Button>
					<h2 className="text-xl font-semibold">{title}</h2>
				</motion.div>
			</div>

			{/* AIの回答表示エリア */}
			<div className="space-y-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
				>
					<Card className="p-5 border-0 shadow-sm bg-white">
						<ScrollArea className="h-[300px]">
							<div className="whitespace-pre-line text-gray-700">
								{detailText}
							</div>
						</ScrollArea>
					</Card>
				</motion.div>

				{/* 回答の吹き出し */}
				<motion.div
					className="relative"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm relative">
						<div className="text-gray-800 whitespace-pre-line">
							{responseText}
						</div>
						{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
						<div className="absolute top-5 right-0 w-4 h-4 bg-white border-t border-r border-blue-100 transform rotate-45 translate-x-2"></div>
					</div>
				</motion.div>
			</div>

			{/* 質問入力エリア */}
			<motion.div
				className="mt-6 flex gap-2"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.4 }}
			>
				<Input
					ref={inputRef}
					value={inputValue}
					onChange={onInputChange}
					placeholder="質問を入力してください"
					className="flex-1 bg-white border-gray-200"
					onKeyDown={onKeyDown}
				/>
				<Button
					onClick={onSendQuestion}
					disabled={!inputValue.trim()}
					style={{ backgroundColor: "#9f9579", borderColor: "#9f9579" }}
				>
					<Send className="h-4 w-4" />
				</Button>
			</motion.div>

			{/* 最初に戻るボタン */}
			<motion.div
				className="mt-6 flex justify-end"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3, delay: 0.5 }}
			>
				<Button
					variant="outline"
					size="sm"
					onClick={onBack}
					className="text-gray-500 hover:text-gray-700 rounded-full px-4"
				>
					最初に戻る
				</Button>
			</motion.div>
		</div>
	);
};
