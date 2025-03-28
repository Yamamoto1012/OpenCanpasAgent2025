"use client";
import type React from "react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Category } from "../CategorySelection/CategoryCard";

type SearchResultsProps = {
	query: string;
	category?: Category;
	isQuestion?: boolean;
	onBack: () => void;
};

export const SearchResults: React.FC<SearchResultsProps> = ({
	query,
	category,
	isQuestion = false,
	onBack,
}) => {
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// AIからの回答テキスト（実際のアプリではAPIから取得）
	const mockResponse = isQuestion
		? `${query}についてはこちらです。\n別の質問をしたい場合は、質問を入力してくださいね。`
		: `「${category?.title || ""}」についての情報はこちらです。\n別の質問をしたい場合は、質問を入力してくださいね。`;

	// 詳細情報（実際のアプリではAPIから取得）
	const mockDetails = isQuestion
		? `SX・GX・DXは持続可能な社会への変革を表す3つの概念です。

SX（サステナビリティ・トランスフォーメーション）
・環境保全を重視した経営変革
・社会課題解決と企業価値向上の両立
・長期的な持続可能性を追求する取り組み

GX（グリーン・トランスフォーメーション）
・脱炭素社会実現に向けた産業変革
・再生可能エネルギーへの転換促進
・環境負荷低減技術の開発と普及

DX（デジタル・トランスフォーメーション）
・デジタル技術による業務・組織の変革
・AIやIoTなどの先端技術活用
・新たな価値創造とビジネスモデル革新

KITでは、これら3つの変革を統合的に推進し、次世代の社会課題解決に貢献できる人材育成を目指しています。`
		: `「${category?.title || ""}」に関する情報：

KITでは、SX・GX・DXの3つの変革を重点的に推進しています。

・文理融合型の教育プログラム
・産学連携による実践的な学び
・最先端技術を活用した研究活動
・持続可能な社会の実現に向けた取り組み

詳細については、各分野別の情報をご覧ください。`;

	// 新しい質問を送信する処理
	const handleSendQuestion = () => {
		if (inputValue.trim()) {
			// 実際のアプリではここでAPIリクエストを行う
			console.log("新しい質問:", inputValue);
			setInputValue("");
		}
	};

	// キーボードイベント処理
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.nativeEvent.isComposing) {
			handleSendQuestion();
		}
	};

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
					<h2 className="text-xl font-semibold">
						{isQuestion
							? `「${query}」の回答`
							: `「${category?.title || ""}」の検索結果`}
					</h2>
				</motion.div>
			</div>

			{/* AIの回答表示エリア */}
			<div className="space-y-4">
				{/* 回答の吹き出し */}
				<motion.div
					className="relative"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm relative">
						<div className="text-gray-800 whitespace-pre-line">
							{mockResponse}
						</div>
						{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
						<div className="absolute top-5 right-0 w-4 h-4 bg-white border-t border-r border-blue-100 transform rotate-45 translate-x-2"></div>
					</div>
				</motion.div>

				{/* 詳細情報カード */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
				>
					<Card className="p-5 border-0 shadow-sm bg-white">
						<div className="whitespace-pre-line text-gray-700">
							{mockDetails}
						</div>
					</Card>
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
					onChange={(e) => setInputValue(e.target.value)}
					placeholder="質問を入力してください"
					className="flex-1 bg-white border-gray-200"
					onKeyDown={handleKeyDown}
				/>
				<Button
					onClick={handleSendQuestion}
					disabled={!inputValue.trim()}
					className="bg-blue-600 hover:bg-blue-700 text-white"
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
