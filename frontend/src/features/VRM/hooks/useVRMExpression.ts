import type { VRM } from "@pixiv/three-vrm";
import { useRef, useEffect } from "react";
import { useBlinking } from "./useBlinking";
import { useBreathing } from "./useBreathing";
import { useLipSync } from "./useLipSync";

import type { ExpressionPreset } from "../constants/vrmExpressions";

/**
 * VRM表情状態の型定義
 */
export type VRMExpressionState = {
	preset: ExpressionPreset;
	weight: number;
};

/**
 * VRMモデルに自然な表情や動きを追加するためのフック
 * @param vrm - VRMモデルインスタンス
 * @param isMuted - 音声がミュートされているかどうか
 * @returns 表情制御のための関数と状態
 */
export const useVRMExpression = (vrm: VRM | null, isMuted: boolean) => {
	// デバッグ用フラグ
	const debugLoggedRef = useRef<boolean>(false);

	// 各サブシステムのフック
	const { updateBlink } = useBlinking(vrm);
	const { updateBreath } = useBreathing(vrm);
	const { playAudio, isAudioInitialized, expressionManager } = useLipSync(
		vrm,
		isMuted,
	);

	// ExpressionManagerが更新された時の処理
	useEffect(() => {
		if (vrm && !debugLoggedRef.current) {
			debugLoggedRef.current = true;
		}
	}, [vrm]);

	/**
	 * 表情プリセットを設定する
	 * @param preset - 設定する表情プリセット
	 * @param weight - 表情の重み（オプション、デフォルトは1.0）
	 */
	const setExpression = (preset: ExpressionPreset, weight?: number) => {
		if (!expressionManager) return;
		expressionManager.setExpression(preset, weight);
	};

	/**
	 * モーションに合わせた表情を設定する
	 * @param motionName - モーション名
	 */
	const setExpressionForMotion = (motionName: string) => {
		if (!expressionManager) return;
		expressionManager.setExpressionForMotion(motionName);
	};

	/**
	 * フレーム更新時の処理
	 * 基本的なアニメーション（瞬き、呼吸）のみを更新
	 * @param deltaTime - 前フレームからの経過時間（秒）
	 */
	const update = (deltaTime: number) => {
		// 基本的なアニメーション（瞬き、呼吸）を更新
		updateBlink(deltaTime);
		updateBreath(deltaTime);

		// リップシンクはテキストベースのみなので、ここでの更新は不要
	};

	/**
	 * 現在の表情状態を取得する
	 */
	const getCurrentExpression = (): VRMExpressionState => {
		if (!expressionManager) {
			return { preset: "neutral", weight: 0 };
		}

		const state = expressionManager.getCurrentState();
		return {
			preset: state.expression,
			weight: state.weight,
		};
	};

	return {
		update,
		setExpression,
		setExpressionForMotion,
		currentExpression: getCurrentExpression(),
		playAudio,
		isAudioInitialized,
		expressionManager,
	};
};
