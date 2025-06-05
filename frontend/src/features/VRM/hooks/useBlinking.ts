import type { VRM } from "@pixiv/three-vrm";
import { useRef } from "react";
import { safeSetExpression } from "../VRMExpression/safeSetExpression";
import { VRM_EXPRESSION_CONFIG } from "../constants/vrmExpressions";

/**
 * VRMモデルの瞬き制御を行うフック
 * @param vrm - VRMモデルインスタンス
 * @returns 瞬き更新関数
 */
export const useBlinking = (vrm: VRM | null) => {
	// 瞬きの位相（0〜2π）
	const blinkPhaseRef = useRef<number>(0);
	// 瞬きの間隔
	const blinkIntervalRef = useRef<number>(3);

	/**
	 * 瞬き処理の更新
	 * @param deltaTime 前フレームからの経過時間（秒）
	 */
	const updateBlink = (deltaTime: number) => {
		if (!vrm) return;

		// 瞬きの位相を更新
		blinkPhaseRef.current += deltaTime;

		// 瞬きの発生タイミング（ランダムな間隔）
		if (blinkPhaseRef.current >= blinkIntervalRef.current) {
			// 瞬きの実行
			performBlink();

			// 次の瞬きまでの間隔をランダムに設定（2〜5秒）
			blinkIntervalRef.current = Math.random() * 3 + 2;
			blinkPhaseRef.current = 0;
		}
	};

	/**
	 * 瞬きを実行する
	 */
	const performBlink = () => {
		if (!vrm) return;

		const blinkDuration = 0.15; // 瞬きの持続時間（秒）
		let blinkProgress = 0;

		// 瞬きアニメーション
		const animateBlink = () => {
			blinkProgress += 0.016; // 約60FPSでの更新間隔

			const blinkValue =
				blinkProgress < blinkDuration / 2
					? (blinkProgress / (blinkDuration / 2)) *
						VRM_EXPRESSION_CONFIG.WEIGHTS.BLINK
					: ((blinkDuration - blinkProgress) / (blinkDuration / 2)) *
						VRM_EXPRESSION_CONFIG.WEIGHTS.BLINK;

			// まず汎用的な瞬き表情を試す
			const blinkSuccess = safeSetExpression(
				vrm,
				"blink",
				Math.max(0, blinkValue),
			);

			// 汎用瞬きが無い場合は左右別々に設定
			if (!blinkSuccess) {
				safeSetExpression(vrm, "blinkLeft", Math.max(0, blinkValue));
				safeSetExpression(vrm, "blinkRight", Math.max(0, blinkValue));
			}

			if (blinkProgress < blinkDuration) {
				requestAnimationFrame(animateBlink);
			} else {
				// 瞬き終了時にリセット
				const resetSuccess = safeSetExpression(vrm, "blink", 0);

				if (!resetSuccess) {
					safeSetExpression(vrm, "blinkLeft", 0);
					safeSetExpression(vrm, "blinkRight", 0);
				}
			}
		};

		animateBlink();
	};

	return { updateBlink };
};
