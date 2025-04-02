import type { VRM } from "@pixiv/three-vrm";

/**
 * VRMモデルの使用可能な表情一覧をコンソールに出力
 */
export const debugExpressions = (vrm: VRM | null): void => {
	if (!vrm) return;

	console.log("VRMモデル読み込み完了");

	// VRM1.0 の表情
	if (vrm.expressionManager) {
		console.log("利用可能な表情一覧 (VRM1.0):");
		try {
			// VRM1.0の表情リストを列挙
			const expressions = vrm.expressionManager;
			const presetNames = [
				"neutral",
				"happy",
				"angry",
				"sad",
				"relaxed",
				"surprised",
				"aa",
				"ih",
				"ou",
				"ee",
				"oh",
				"a",
				"i",
				"u",
				"e",
				"o",
				"blink",
				"blinkLeft",
				"blinkRight",
				"lookUp",
				"lookDown",
				"lookLeft",
				"lookRight",
			];

			const availableExpressions: string[] = [];

			// biome-ignore lint/complexity/noForEach: <explanation>
			presetNames.forEach((name) => {
				try {
					if (expressions.getValue(name) !== undefined) {
						availableExpressions.push(name);
					}
				} catch (e) {
					// エラーは無視
				}
			});

			if (availableExpressions.length > 0) {
				// biome-ignore lint/complexity/noForEach: <explanation>
				availableExpressions.forEach((name) => {
					console.log(`- ${name}`);
				});
			} else {
				console.log("利用可能な表情が見つかりません");
			}
		} catch (error) {
			console.error("表情情報の取得に失敗:", error);
		}
	}
};
