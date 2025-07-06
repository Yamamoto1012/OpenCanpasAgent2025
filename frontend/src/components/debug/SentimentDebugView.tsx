import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { BarChart3, Bug, Clock, Trash2, X } from "lucide-react";
/**
 * 感情分析結果デバッグ表示コンポーネント
 */
import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import {
	SENTIMENT_COLORS,
	SENTIMENT_LABELS,
	clearSentimentHistoryAtom,
	sentimentDebugAtom,
	toggleSentimentDebugAtom,
} from "../../store/sentimentDebugStore";
import type { SentimentAnalysisResult } from "../../types/sentiment";
import { ScrollArea } from "../ui/scroll-area";

export type SentimentDebugViewProps = {
	className?: string;
};

/**
 * デバッグトグルボタンコンポーネント
 */
export const SentimentDebugToggle: React.FC<{ className?: string }> = ({
	className = "",
}) => {
	const [isVisible, toggleDebug] = useAtom(toggleSentimentDebugAtom);
	const { t } = useTranslation("debug");

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={toggleDebug}
			className={`fixed top-4 right-4 z-50 ${className}`}
		>
			<Bug className="w-4 h-4 mr-2" />
			{isVisible ? t("sentiment.toggleShow") : t("sentiment.toggleHide")}
		</Button>
	);
};

/**
 * 感情分析履歴アイテムコンポーネント
 */
const SentimentHistoryItem: React.FC<{
	analysis: SentimentAnalysisResult;
	isLatest?: boolean;
}> = ({ analysis, isLatest = false }) => {
	const { t } = useTranslation("debug");
	const timestamp = new Date(analysis.timestamp).toLocaleTimeString("ja-JP");
	const sentimentColor = SENTIMENT_COLORS[analysis.category];
	const sentimentLabel = SENTIMENT_LABELS[analysis.category];

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.3 }}
			className={`p-3 rounded-lg border ${
				isLatest ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
			}`}
		>
			<div className="flex justify-between items-start mb-2">
				<span
					className={`px-2 py-1 rounded-full text-xs font-medium ${sentimentColor} bg-gray-100`}
				>
					{sentimentLabel}
				</span>
				<span className="text-xs text-gray-500 flex items-center">
					<Clock className="w-3 h-3 mr-1" />
					{timestamp}
				</span>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-sm font-mono">
					{t("sentiment.scoreLabel")} {analysis.score.toFixed(1)}
				</span>
				{isLatest && (
					<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
						{t("sentiment.latest")}
					</span>
				)}
			</div>

			{/* スコアバー */}
			<div className="mt-2 w-full bg-gray-200 rounded-full h-2">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${analysis.score}%` }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className={`h-2 rounded-full ${
						analysis.score >= 70
							? "bg-green-500"
							: analysis.score >= 50
								? "bg-yellow-500"
								: analysis.score >= 30
									? "bg-orange-500"
									: "bg-red-500"
					}`}
				/>
			</div>
		</motion.div>
	);
};

/**
 * メイン感情デバッグビューコンポーネント
 */
export const SentimentDebugView: React.FC<SentimentDebugViewProps> = ({
	className = "",
}) => {
	const [debugState] = useAtom(sentimentDebugAtom);
	const [, clearHistory] = useAtom(clearSentimentHistoryAtom);
	const [, toggleDebug] = useAtom(toggleSentimentDebugAtom);
	const { t } = useTranslation("debug");

	if (!debugState.isVisible) {
		return null;
	}

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.3 }}
				className={`fixed bottom-4 right-4 w-96 max-h-96 z-40 ${className}`}
			>
				<Card className="shadow-lg border-2">
					<CardHeader className="pb-2">
						<div className="flex justify-between items-center">
							<CardTitle className="text-lg flex items-center">
								<BarChart3 className="w-5 h-5 mr-2" />
								{t("sentiment.title")}
							</CardTitle>
							<div className="flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={clearHistory}
									disabled={debugState.history.length === 0}
								>
									<Trash2 className="w-4 h-4" />
								</Button>
								<Button variant="ghost" size="sm" onClick={toggleDebug}>
									<X className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</CardHeader>

					<CardContent className="pt-0">
						{/* 統計情報 */}
						<div className="grid grid-cols-2 gap-4 mb-4">
							<div className="text-center p-2 bg-blue-50 rounded-lg">
								<div className="text-2xl font-bold text-blue-600">
									{debugState.totalAnalyses}
								</div>
								<div className="text-xs text-blue-600">
									{t("sentiment.totalAnalyses")}
								</div>
							</div>
							<div className="text-center p-2 bg-green-50 rounded-lg">
								<div className="text-2xl font-bold text-green-600">
									{debugState.averageScore}
								</div>
								<div className="text-xs text-green-600">
									{t("sentiment.averageScore")}
								</div>
							</div>
						</div>

						<div className="my-3 border-t border-gray-200" />

						{/* 最新の結果 */}
						{debugState.lastAnalysis && (
							<div className="mb-4">
								<h4 className="text-sm font-semibold mb-2">
									{t("sentiment.latestAnalysis")}
								</h4>
								<SentimentHistoryItem
									analysis={debugState.lastAnalysis}
									isLatest={true}
								/>
							</div>
						)}

						{/* 履歴 */}
						{debugState.history.length > 1 && (
							<div>
								<h4 className="text-sm font-semibold mb-2">
									{t("sentiment.historyCount", {
										count: debugState.history.length - 1,
									})}
								</h4>
								<ScrollArea className="h-32">
									<div className="space-y-2">
										{debugState.history
											.slice(0, -1) // 最新を除く
											.reverse()
											.map((analysis, index) => (
												<SentimentHistoryItem
													key={`${analysis.timestamp}-${index}`}
													analysis={analysis}
												/>
											))}
									</div>
								</ScrollArea>
							</div>
						)}

						{debugState.history.length === 0 && (
							<div className="text-center py-8 text-gray-500">
								<BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
								<p className="text-sm">{t("sentiment.noResults")}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</AnimatePresence>
	);
};
