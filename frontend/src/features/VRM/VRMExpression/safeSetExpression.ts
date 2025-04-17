import type { VRM } from "@pixiv/three-vrm";

/**
 * 表情の値を安全に設定する（VRM1.0モデル専用）
 */
export const safeSetExpression = (
	vrm: VRM | null,
	expressionName: string,
	value: number,
): boolean => {
	if (!vrm) return false;

	// VRM1.0 モデルの場合のみ対応
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

	return false;
};
