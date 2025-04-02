import { useRef } from "react";
import type { VRM } from "@pixiv/three-vrm";
import { getRandomBlinkInterval } from "../VRMExpression/getRandomBlinkInterval";
import { safeSetExpression } from "../VRMExpression/safeSetExpression";

/**
 * VRMモデルの瞬き制御を行うフック
 */
export const useBlinking = (vrm: VRM | null) => {
	const blinkStateRef = useRef<"open" | "closing" | "opening">("open");
	const nextBlinkTimeRef = useRef<number>(getRandomBlinkInterval());
	const timeCounterRef = useRef<number>(0);

	/**
	 * 瞬き処理の更新
	 * @param deltaTime 前フレームからの経過時間（秒）
	 */
	const updateBlink = (deltaTime: number) => {
		if (!vrm) return;

		const deltaMs = deltaTime * 1000; // ミリ秒に変換
		timeCounterRef.current += deltaMs;

		// 瞬きの状態に応じた処理
		if (blinkStateRef.current === "open") {
			// 開いた状態で、次の瞬きの時間に達したら閉じ始める
			if (timeCounterRef.current >= nextBlinkTimeRef.current) {
				blinkStateRef.current = "closing";
				timeCounterRef.current = 0;
			}
		} else if (blinkStateRef.current === "closing") {
			// 閉じる過程（100ms）
			const blinkValue = Math.min(timeCounterRef.current / 100, 1);

			// 両目まばたき
			const blinkSuccess = safeSetExpression(vrm, "blink", blinkValue);

			// 両目まばたきがサポートされていなければ左右個別に試す
			if (!blinkSuccess) {
				safeSetExpression(vrm, "blinkLeft", blinkValue);
				safeSetExpression(vrm, "blinkRight", blinkValue);
			}

			if (timeCounterRef.current >= 100) {
				blinkStateRef.current = "opening";
				timeCounterRef.current = 0;
			}
		} else if (blinkStateRef.current === "opening") {
			// 開く過程（150ms）
			const blinkValue = Math.max(1 - timeCounterRef.current / 150, 0);

			// 両目まばたき
			const blinkSuccess = safeSetExpression(vrm, "blink", blinkValue);

			// 両目まばたきがサポートされていなければ左右個別に試す
			if (!blinkSuccess) {
				safeSetExpression(vrm, "blinkLeft", blinkValue);
				safeSetExpression(vrm, "blinkRight", blinkValue);
			}

			if (timeCounterRef.current >= 150) {
				blinkStateRef.current = "open";
				timeCounterRef.current = 0;
				nextBlinkTimeRef.current = getRandomBlinkInterval();
			}
		}
	};

	return { updateBlink };
};
