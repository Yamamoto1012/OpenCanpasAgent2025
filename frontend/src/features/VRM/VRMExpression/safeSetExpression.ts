import type { VRM } from "@pixiv/three-vrm";

/**
 * 表情の値を安全に設定する（モデルの互換性を考慮）
 */
export const safeSetExpression = (
	vrm: VRM | null,
	expressionName: string,
	value: number,
): boolean => {
	if (!vrm) return false;

	// VRM1.0 モデルの場合
	if (vrm.expressionManager) {
		try {
			const expressionManager = vrm.expressionManager as {
				getValue: (name: string) => number | undefined;
				setValue: (name: string, value: number) => void;
			};

			// 指定された表情が存在するか確認
			if (
				typeof expressionManager.getValue === "function" &&
				expressionManager.getValue(expressionName) !== undefined
			) {
				expressionManager.setValue(expressionName, value);
				return true;
			}
		} catch (error) {
			// エラーは無視
			return false;
		}
	}
	// VRM0.0 モデルの場合
	else if ("blendShapeProxy" in vrm) {
		try {
			// @ts-ignore - VRM0.0の型定義
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const proxy = (vrm as any).blendShapeProxy as {
				setValue: (presetIndex: number, weight: number) => void;
			};

			// 表情名から対応するVRM0.0のプリセットインデックスを取得
			let presetIndex: number | null = null;

			switch (expressionName) {
				case "blink":
				case "blinkLeft":
				case "blinkRight":
					presetIndex = 0; // "まばたき"
					break;
				case "aa":
				case "a":
					presetIndex = 1; // "あ"
					break;
				case "ih":
				case "i":
					presetIndex = 2; // "い"
					break;
				case "ou":
				case "u":
					presetIndex = 3; // "う"
					break;
				case "ee":
				case "e":
					presetIndex = 4; // "え"
					break;
				case "oh":
				case "o":
					presetIndex = 5; // "お"
					break;
				case "happy":
					presetIndex = 6; // "喜び"
					break;
				case "angry":
					presetIndex = 7; // "怒り"
					break;
				case "sad":
					presetIndex = 8; // "悲しみ"
					break;
			}

			if (
				presetIndex !== null &&
				proxy &&
				typeof proxy.setValue === "function"
			) {
				proxy.setValue(presetIndex, value);
				return true;
			}
		} catch (error) {
			// エラーは無視
			return false;
		}
	}

	return false;
};
