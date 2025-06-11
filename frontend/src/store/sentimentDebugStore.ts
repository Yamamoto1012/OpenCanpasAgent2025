/**
 * 感情分析デバッグ用のJotaiストア
 */
import { atom } from "jotai";
import type {
	SentimentAnalysisResult,
	SentimentCategory,
} from "../types/sentiment";

/**
 * 感情分析結果の状態
 */
export type SentimentDebugState = {
	lastAnalysis: SentimentAnalysisResult | null;
	isVisible: boolean;
	history: SentimentAnalysisResult[];
	averageScore: number;
	totalAnalyses: number;
};

/**
 * 初期状態
 */
const initialState: SentimentDebugState = {
	lastAnalysis: null,
	isVisible: false,
	history: [],
	averageScore: 0,
	totalAnalyses: 0,
};

/**
 * 感情分析デバッグ状態のAtom
 */
export const sentimentDebugAtom = atom<SentimentDebugState>(initialState);

/**
 * デバッグパネルの表示/非表示を切り替えるAtom
 */
export const toggleSentimentDebugAtom = atom(
	(get) => get(sentimentDebugAtom).isVisible,
	(get, set) => {
		const current = get(sentimentDebugAtom);
		set(sentimentDebugAtom, {
			...current,
			isVisible: !current.isVisible,
		});
	},
);

/**
 * 新しい感情分析結果を追加するAtom
 */
export const addSentimentAnalysisAtom = atom(
	null,
	(get, set, newAnalysis: SentimentAnalysisResult) => {
		const current = get(sentimentDebugAtom);
		const newHistory = [...current.history, newAnalysis].slice(-10); // 最新10件のみ保持

		// 平均スコアの計算
		const totalScore = newHistory.reduce(
			(sum, analysis) => sum + analysis.score,
			0,
		);
		const averageScore = totalScore / newHistory.length;

		set(sentimentDebugAtom, {
			lastAnalysis: newAnalysis,
			isVisible: current.isVisible,
			history: newHistory,
			averageScore: Math.round(averageScore * 100) / 100, // 小数点以下2桁
			totalAnalyses: current.totalAnalyses + 1,
		});
	},
);

/**
 * 感情分析履歴をクリアするAtom
 */
export const clearSentimentHistoryAtom = atom(null, (_get, set) => {
	set(sentimentDebugAtom, initialState);
});

/**
 * 感情カテゴリの日本語ラベル
 */
export const SENTIMENT_LABELS: Record<SentimentCategory, string> = {
	strong_positive: "とても良い",
	mild_positive: "良い",
	neutral: "普通",
	mild_negative: "悪い",
	strong_negative: "とても悪い",
} as const;

/**
 * 感情カテゴリの色分け
 */
export const SENTIMENT_COLORS: Record<SentimentCategory, string> = {
	strong_positive: "text-green-600",
	mild_positive: "text-green-400",
	neutral: "text-gray-500",
	mild_negative: "text-orange-400",
	strong_negative: "text-red-500",
} as const;
