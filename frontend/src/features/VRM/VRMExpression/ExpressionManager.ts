import type { VRM } from "@pixiv/three-vrm";
import {
	BASIC_EXPRESSIONS,
	type ExpressionPreset,
	LIP_SYNC_EXPRESSIONS,
	type LipSyncExpression,
	MOTION_TO_EXPRESSION,
	VRM_EXPRESSION_CONFIG,
} from "../constants/vrmExpressions";
import { safeSetExpression } from "./safeSetExpression";

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

	/**
	 * 音響データに基づくリアルタイムリップシンク制御
	 * 音量レベルと推定音素に応じて表情の重みを動的に調整
	 * @param volume 音量レベル（0-1）
	 * @param phoneme 推定された音素
	 * @param confidence 音素推定の信頼度（0-1）
	 */
	setLipSyncByAcousticData(
		volume: number,
		phoneme: string,
		confidence: number,
	): void {
		if (!this.vrm) return;

		// 音量が非常に小さい場合は段階的に口を閉じる
		if (volume <= 0.05) {
			this.resetLipSyncExpressions();
			this.isLipSyncActive = false;
			return;
		}

		// 音素に対応する表情を取得
		const expressionName = this.getExpressionForPhoneme(phoneme);
		if (!expressionName) {
			// 認識できない音素の場合は軽く口を開ける（「あ」音）
			this.setLipSyncExpression("aa", volume * 0.4);
			this.isLipSyncActive = true;
			return;
		}

		// 音量と信頼度に基づいて重みを計算（ぱくぱく動作のため調整）
		const baseWeight = VRM_EXPRESSION_CONFIG.WEIGHTS.LIP_SYNC;

		// 音量による重み調整（非線形変換でより動的に）
		const volumeWeight = volume ** 0.7 * 1.2; // べき乗で非線形調整

		// 信頼度による重み調整（最低20%保証）
		const confidenceWeight = Math.max(0.2, Math.min(1.0, confidence));

		// 最終的な重み計算（ぱくぱく効果のため最小値を設定）
		let finalWeight = baseWeight * volumeWeight * confidenceWeight;
		finalWeight = Math.max(0.15, Math.min(1.0, finalWeight)); // 最小15%、最大100%

		// 現在のリップシンク表情をリセット
		this.resetLipSyncExpressions();

		// 新しい表情を設定（補間機能付き）
		this.setLipSyncWithInterpolation(expressionName, finalWeight, 0.6);
		this.isLipSyncActive = true;

		// 周期的な微調整でぱくぱく効果を強化
		const timeOffset = Date.now() * 0.008; // より滑らかな周期
		const pulse = Math.sin(timeOffset) * 0.08 + 1.0; // 8%の変動
		const adjustedWeight = finalWeight * pulse;

		this.setLipSyncExpression(expressionName, Math.max(0.1, adjustedWeight));
	}

	/**
	 * 滑らかな表情変化のための補間機能
	 * 急激な表情変化を抑制し、自然なアニメーションを実現
	 * @param targetExpression 目標の表情
	 * @param targetWeight 目標の重み
	 * @param interpolationSpeed 補間速度（0-1、高いほど速い）
	 */
	setLipSyncWithInterpolation(
		targetExpression: LipSyncExpression,
		targetWeight: number,
		interpolationSpeed = 0.3,
	): void {
		if (!this.vrm) return;

		// 現在の重みを取得（VRMからの直接取得は複雑なため、簡易実装）
		const currentWeight = this.getCurrentLipSyncWeight(targetExpression);

		// 線形補間による滑らかな重み変化
		const interpolatedWeight =
			currentWeight + (targetWeight - currentWeight) * interpolationSpeed;

		this.setLipSyncExpression(targetExpression, interpolatedWeight);
	}

	/**
	 * 現在のリップシンク表情の重みを取得（簡易実装）
	 * @param expression 対象の表情
	 * @returns 現在の重み
	 */
	private getCurrentLipSyncWeight(expression: LipSyncExpression): number {
		if (!this.vrm?.expressionManager) return 0;

		try {
			// VRMの表情システムから現在の重みを取得
			const currentValue = this.vrm.expressionManager.getValue(expression);
			return currentValue || 0;
		} catch (error) {
			console.warn(`表情 ${expression} の重み取得エラー:`, error);
			return 0;
		}
	}

	/**
	 * デバッグ用：現在の音響リップシンク状態を取得
	 */
	getAcousticLipSyncDebugInfo() {
		return {
			isLipSyncActive: this.isLipSyncActive,
			currentExpression: this.currentExpression,
			currentWeight: this.currentWeight,
			vrmAvailable: !!this.vrm,
		};
	}
}
