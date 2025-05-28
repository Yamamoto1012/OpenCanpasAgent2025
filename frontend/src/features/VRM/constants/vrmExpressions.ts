/**
 * VRM表情制御に関する定数とEnum定義
 */

// 表情プリセット名の型定義
export type ExpressionPreset =
	| "neutral"
	| "happy"
	| "sad"
	| "angry"
	| "surprised"
	| "relaxed"
	| "blink"
	| "blinkLeft"
	| "blinkRight";

// 口形素（リップシンク）用の表情名
export type LipSyncExpression = "aa" | "ih" | "ou" | "ee" | "oh" | "a" | "o";

// すべての表情名を統合した型
export type VRMExpressionName = ExpressionPreset | LipSyncExpression;

// 表情制御の設定値
export const VRM_EXPRESSION_CONFIG = {
	// デフォルトの表情強度
	DEFAULT_WEIGHT: 0.7,

	// 各種表情の推奨強度
	WEIGHTS: {
		BLINK: 1.0,
		BREATHING: 0.2,
		LIP_SYNC: 0.6,
		EMOTION_LIGHT: 0.3,
		EMOTION_NORMAL: 0.7,
		EMOTION_STRONG: 0.8,
	},

	// アニメーション時間（秒）
	TRANSITION_DURATION: 0.3,
} as const;

// 基本表情のリスト
export const BASIC_EXPRESSIONS: readonly ExpressionPreset[] = [
	"neutral",
	"happy",
	"sad",
	"angry",
	"surprised",
	"relaxed",
] as const;

// 瞬き関連表情のリスト
export const BLINK_EXPRESSIONS: readonly ExpressionPreset[] = [
	"blink",
	"blinkLeft",
	"blinkRight",
] as const;

// リップシンク用表情のリスト
export const LIP_SYNC_EXPRESSIONS: readonly LipSyncExpression[] = [
	"aa",
	"ih",
	"ou",
	"ee",
	"oh",
	"a",
	"o",
] as const;

// 音素から表情へのマッピング
export const PHONEME_TO_EXPRESSION: Record<string, LipSyncExpression> = {
	a: "aa",
	i: "ih",
	u: "ou",
	e: "ee",
	o: "oh",
} as const;

// モーション名から表情への推奨マッピング
export const MOTION_TO_EXPRESSION: Record<
	string,
	{ preset: ExpressionPreset; weight: number }
> = {
	Walking: {
		preset: "neutral",
		weight: VRM_EXPRESSION_CONFIG.WEIGHTS.EMOTION_LIGHT,
	},
	StandingIdle: {
		preset: "neutral",
		weight: VRM_EXPRESSION_CONFIG.WEIGHTS.EMOTION_LIGHT,
	},
	Thinking: {
		preset: "neutral",
		weight: VRM_EXPRESSION_CONFIG.WEIGHTS.EMOTION_NORMAL,
	},
	VRMA_01: {
		preset: "neutral",
		weight: VRM_EXPRESSION_CONFIG.WEIGHTS.EMOTION_LIGHT,
	},
	VRMA_02: {
		preset: "relaxed",
		weight: VRM_EXPRESSION_CONFIG.WEIGHTS.EMOTION_LIGHT,
	},
} as const;
