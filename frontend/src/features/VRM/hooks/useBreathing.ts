import { useRef } from "react";
import type { VRM } from "@pixiv/three-vrm";
import { safeSetExpression } from "../VRMExpression/safeSetExpression";

/**
 * VRMモデルの呼吸制御を行うフック
 */
export const useBreathing = (vrm: VRM | null) => {
	// 呼吸の位相（0〜2π）
	const breathPhaseRef = useRef<number>(0);

	/**
	 * 呼吸処理の更新
	 * @param deltaTime 前フレームからの経過時間（秒）
	 */
	const updateBreath = (deltaTime: number) => {
		if (!vrm || !vrm.humanoid) return;

		// 呼吸の速さ（周期5秒）
		breathPhaseRef.current =
			(breathPhaseRef.current + deltaTime * 1.25) % (Math.PI * 2);

		// 胸と肩のボーン（存在する場合）を取得
		const chest = vrm.humanoid.getNormalizedBoneNode("chest");
		const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
		const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");

		if (chest) {
			// サインカーブで上下に微妙に動かす（元の位置から±0.005の範囲）
			const breathValue = Math.sin(breathPhaseRef.current) * 0.005;
			// チェストを使った呼吸表現
			chest.position.y += breathValue;

			// 肩の動きも連動させる（もし存在すれば）
			if (leftShoulder) leftShoulder.position.y += breathValue * 0.7;
			if (rightShoulder) rightShoulder.position.y += breathValue * 0.7;
		}

		// 呼吸に合わせて口も微妙に動かす
		const breathMouth = Math.sin(breathPhaseRef.current) * 0.1 + 0.1;

		// 「あ」の口の形を試す（複数の可能性を試す）
		const mouthSuccess =
			safeSetExpression(vrm, "aa", breathMouth * 0.2) ||
			safeSetExpression(vrm, "a", breathMouth * 0.2);

		// 口の表情がサポートされていない場合、「お」や他の表情も試す
		if (!mouthSuccess) {
			safeSetExpression(vrm, "oh", breathMouth * 0.15) ||
				safeSetExpression(vrm, "o", breathMouth * 0.15);
		}
	};

	return { updateBreath };
};
