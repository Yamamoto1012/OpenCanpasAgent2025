import type { VRM } from "@pixiv/three-vrm";
import type { VRMExpressionName } from "../constants/vrmExpressions";

/**
 * VRMモデルの表情を安全に設定する関数
 * @param vrm - VRMモデルインスタンス
 * @param expressionName - 設定する表情名
 * @param weight - 表情の重み（0-1）
 * @returns 設定が成功したかどうか
 */
export const safeSetExpression = (
	vrm: VRM,
	expressionName: VRMExpressionName,
	weight: number,
): boolean => {
	if (!vrm?.expressionManager) {
		console.warn(
			`ExpressionManagerが見つかりません: ${expressionName}`,
		);
		return false;
	}

	try {
		const expression = vrm.expressionManager.getExpression(expressionName);
		if (!expression) {
			console.warn(
				`表情が見つかりません: ${expressionName}`,
			);
			return false;
		}

		expression.weight = Math.max(0, Math.min(1, weight));
		return true;
	} catch {
		// エラーハンドリング：予期しないエラーをキャッチして継続実行
		console.warn(
			`表情設定中にエラーが発生しました: ${expressionName}, weight: ${weight}`,
		);
		return false;
	}
};
