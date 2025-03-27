import { Suspense } from "react";
import VRMAsset from "../VRMRender/VRMRender";

type VRMWrapperProps = {
	categoryDepth?: number;
};

export default function VRMWrapper({ categoryDepth = 0 }: VRMWrapperProps) {
	// カテゴリ深さに応じてモーションを変える
	const motionFile = "/Motion/VRMA_01.vrma";
	// categoryDepth >= 2
	//   ? "/Motion/VRMA_02.vrma" // 詳細モードのモーション
	//   : "/Motion/VRMA_01.vrma"; // デフォルトモーション
	const baseRotationY = Math.PI;

	const vrmOptions = {
		vrmUrl: "/Model/KIT_VRM0.0.vrm",
		vrmaUrl: motionFile,
		autoPlay: true,
		position:
			categoryDepth >= 2
				? ([-0.3, 0, 0] as [number, number, number])
				: ([0, 0, 0] as [number, number, number]),
		rotation:
			categoryDepth >= 2
				? ([0, baseRotationY + Math.PI / 12, 0] as [number, number, number]) // カテゴリが深いとき、少し右向きに
				: ([0, baseRotationY, 0] as [number, number, number]), // 常に正面向き（180度回転）
		lookAtCamera: true, // カメラ目線を有効化
	};

	return (
		<Suspense>
			<VRMAsset {...vrmOptions} />
		</Suspense>
	);
}
