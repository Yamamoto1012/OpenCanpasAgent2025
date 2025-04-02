import type { VRM } from "@pixiv/three-vrm";
import { useRef } from "react";
import { useBlinking } from "./useBlinking";
import { useBreathing } from "./useBreathing";
import { useLipSync } from "./useLipSync";
import type {
	ExpressionPreset,
	VRMExpressionState,
} from "../VRMExpression/types";
import { safeSetExpression } from "../VRMExpression/safeSetExpression";
import { debugExpressions } from "../VRMExpression/debugExpressions";

/**
 * VRMモデルに自然な表情や動きを追加するためのフック
 */
export const useVRMExpression = (vrm: VRM | null, isMuted: boolean) => {
	// デバッグ用フラグ
	const debugLoggedRef = useRef<boolean>(false);

	// 現在の表情プリセットと強度
	const currentExpressionRef = useRef<VRMExpressionState>({
		preset: "neutral",
		weight: 0,
	});

	// 各サブシステムのフック
	const { updateBlink } = useBlinking(vrm);
	const { updateBreath } = useBreathing(vrm);
	const { updateLipSync, playAudio, isAudioInitialized } = useLipSync(
		vrm,
		isMuted,
	);

	/**
	 * 表情プリセットを設定する
	 */
	const setExpression = (preset: ExpressionPreset, weight = 0.7) => {
		if (!vrm) return;

		// 笑顔を設定する前に一旦すべての表情をリセット
		// biome-ignore lint/complexity/noForEach: <explanation>
		["neutral", "happy", "sad", "angry", "surprised", "relaxed"].forEach(
			(exp) => {
				safeSetExpression(vrm, exp, 0);
			},
		);

		// 指定された表情を設定
		safeSetExpression(vrm, preset, weight);

		// 表情状態を更新
		currentExpressionRef.current = { preset, weight };

		// デバッグ出力
		console.log(`表情を設定: ${preset}, 強度: ${weight}`);
	};

	/**
	 * モーションに合わせた表情を設定する
	 */
	const setExpressionForMotion = (motionName: string) => {
		// モーション名から適切な表情を選択
		if (motionName.includes("VRMA_01") || motionName.includes("Walking")) {
			// 通常の動き - 軽い笑顔
			setExpression("happy", 0.2);
		} else if (motionName.includes("VRMA_02")) {
			// 静止状態 - リラックス
			setExpression("relaxed", 0.3);
		} else if (motionName.includes("VRMA_02")) {
			// 会話状態 - より明るい笑顔
			setExpression("happy", 0.8);
		} else if (motionName.includes("VRMA_02")) {
			// 驚き
			setExpression("surprised", 0.8);
		} else {
			// デフォルト - 軽い笑顔
			setExpression("happy", 0.3);
		}
	};

	/**
	 * フレーム更新時の処理
	 */
	const update = (deltaTime: number) => {
		if (vrm && !debugLoggedRef.current) {
			debugExpressions(vrm);
			debugLoggedRef.current = true;
		}

		updateBlink(deltaTime);
		updateBreath(deltaTime);
		updateLipSync();
	};

	return {
		update,
		setExpression,
		setExpressionForMotion,
		currentExpression: currentExpressionRef.current,
		playAudio,
		isAudioInitialized,
	};
};
