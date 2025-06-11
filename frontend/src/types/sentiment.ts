/**
 * 感情分析関連の型定義
 */

// 感情カテゴリの定義
export type SentimentCategory =
	| "strong_positive"
	| "mild_positive"
	| "neutral"
	| "mild_negative"
	| "strong_negative";

// 感情分析リクエストとレスポンスの型定義
export type SentimentRequest = {
	text: string;
};

// 感情分析APIのレスポンス型
export type SentimentResponse = {
	score: number; // 0-100の感情スコア
	category: SentimentCategory;
};

// 感情分析結果の型定義
export type SentimentAnalysisResult = {
	score: number;
	category: SentimentCategory;
	timestamp: number;
};

// 感情分析の状態管理用の型
export type SentimentState = {
	data: SentimentAnalysisResult | null;
	isLoading: boolean;
	error: Error | null;
	lastAnalyzedText: string | null;
};

// 感情カテゴリから表情プリセットへのマッピング用の型
export type EmotionMapping = {
	preset: string; // VRM表情プリセット名
	weight: number; // 表情の重み (0-1)
	duration?: number; // 表情の持続時間 (ミリ秒)
};
