export type ExpressionPreset =
	| "neutral"
	| "happy"
	| "sad"
	| "angry"
	| "surprised"
	| "relaxed";

export type VRMExpressionState = {
	preset: ExpressionPreset;
	weight: number;
};
