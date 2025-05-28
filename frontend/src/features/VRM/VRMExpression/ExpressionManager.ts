import type { VRM } from "@pixiv/three-vrm";
import { safeSetExpression } from "./safeSetExpression";
import {
	type ExpressionPreset,
	type LipSyncExpression,
	VRM_EXPRESSION_CONFIG,
	BASIC_EXPRESSIONS,
	LIP_SYNC_EXPRESSIONS,
	MOTION_TO_EXPRESSION,
} from "../constants/vrmExpressions";

/**
 * VRM表情制御を一元管理するクラス
 * 表情の競合を防ぎ、統一的な制御を提供する
 */
export class ExpressionManager {
	private vrm: VRM | null = null;
	private currentExpression: ExpressionPreset = "neutral";
	private currentWeight = 0;
	private isLipSyncActive = false;

	constructor(vrm: VRM | null = null) {
		this.vrm = vrm;
		// 初期表情をneutralに設定
		if (vrm) {
			this.setExpression("neutral", 0);
		}
	}

	/**
	 * VRMモデルを設定する
	 */
	setVRM(vrm: VRM | null): void {
		this.vrm = vrm;
	}

	/**
	 * 基本表情をリセットする（リップシンク表情は除く）
	 */
	resetBasicExpressions(): void {
		if (!this.vrm) return;

		for (const expression of BASIC_EXPRESSIONS) {
			safeSetExpression(this.vrm, expression, 0);
		}
	}

	/**
	 * リップシンク表情をリセットする
	 */
	resetLipSyncExpressions(): void {
		if (!this.vrm) return;

		for (const expression of LIP_SYNC_EXPRESSIONS) {
			safeSetExpression(this.vrm, expression, 0);
		}
	}

	/**
	 * すべての表情をリセットする
	 */
	resetAllExpressions(): void {
		this.resetBasicExpressions();
		this.resetLipSyncExpressions();
		this.currentExpression = "neutral";
		this.currentWeight = 0;
	}

	/**
	 * 基本表情を設定する（リップシンクとは独立）
	 */
	setExpression(
		preset: ExpressionPreset,
		weight: number = VRM_EXPRESSION_CONFIG.DEFAULT_WEIGHT,
	): boolean {
		if (!this.vrm) return false;

		// 基本表情のみリセット（リップシンクは維持）
		this.resetBasicExpressions();

		// 新しい表情を設定
		const success = safeSetExpression(this.vrm, preset, weight);

		if (success) {
			this.currentExpression = preset;
			this.currentWeight = weight;
		}

		return success;
	}

	/**
	 * リップシンク表情を設定する（基本表情とは独立）
	 */
	setLipSyncExpression(expression: LipSyncExpression, weight: number): boolean {
		if (!this.vrm) return false;

		return safeSetExpression(this.vrm, expression, weight);
	}

	/**
	 * 複数のリップシンク表情を同時に設定する
	 */
	setMultipleLipSyncExpressions(
		expressions: Array<{ name: LipSyncExpression; weight: number }>,
	): void {
		if (!this.vrm) return;

		// まずリップシンク表情をリセット
		this.resetLipSyncExpressions();

		// 指定された表情を設定
		for (const { name, weight } of expressions) {
			this.setLipSyncExpression(name, weight);
		}
	}

	/**
	 * モーション名に基づいて適切な表情を設定する
	 */
	setExpressionForMotion(motionName: string): boolean {
		const motionConfig = MOTION_TO_EXPRESSION[motionName];

		if (motionConfig) {
			return this.setExpression(motionConfig.preset, motionConfig.weight);
		}

		// デフォルトの表情（neutral）
		return this.setExpression(
			"neutral",
			VRM_EXPRESSION_CONFIG.WEIGHTS.EMOTION_LIGHT,
		);
	}

	/**
	 * 音素に基づくリップシンクを設定する
	 * テキストベースのリップシンクで使用される
	 */
	setLipSyncByPhoneme(
		phoneme: string,
		weight: number = VRM_EXPRESSION_CONFIG.WEIGHTS.LIP_SYNC,
	): void {
		if (!this.vrm) return;

		// 現在のリップシンク表情をリセット
		this.resetLipSyncExpressions();

		// 音素に対応する表情を取得
		const expressionName = this.getExpressionForPhoneme(phoneme);
		if (expressionName) {
			this.setLipSyncExpression(expressionName, weight);
			this.isLipSyncActive = true;
		}
	}

	/**
	 * 音素から対応する表情名を取得する
	 */
	private getExpressionForPhoneme(phoneme: string): LipSyncExpression | null {
		switch (phoneme) {
			case "a":
				return "aa";
			case "i":
				return "ih";
			case "u":
				return "ou";
			case "e":
				return "ee";
			case "o":
				return "oh";
			default:
				return null;
		}
	}

	/**
	 * 現在の表情状態を取得する
	 */
	getCurrentState() {
		return {
			expression: this.currentExpression,
			weight: this.currentWeight,
			isLipSyncActive: this.isLipSyncActive,
		};
	}

	/**
	 * リップシンクが有効かどうかを確認する
	 */
	isLipSyncActiveState(): boolean {
		return this.isLipSyncActive;
	}

	/**
	 * リップシンク状態を手動で制御する
	 */
	setLipSyncActive(active: boolean): void {
		this.isLipSyncActive = active;
		if (!active) {
			this.resetLipSyncExpressions();
		}
	}
}
