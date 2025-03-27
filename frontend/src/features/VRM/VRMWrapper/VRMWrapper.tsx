import { Suspense, useEffect, useState, useRef } from "react";
import VRMRender from "../VRMRender/VRMRender";

type VRMWrapperProps = {
	categoryDepth?: number; // 現在のカテゴリの深さ
};

/**
 * VRMRenderコンポーネントをラップし、カテゴリ深度に応じた設定を提供する
 * @param categoryDepth カテゴリの深さ（0: トップ、1: メイン、2以上: 詳細）
 */
export default function VRMWrapper({ categoryDepth = 0 }: VRMWrapperProps) {
	// 前回のカテゴリ深度を追跡し、変更があった場合のみ処理を行うための参照
	const prevDepthRef = useRef<number>(categoryDepth);

	// VRMRenderコンポーネントへの参照（アニメーション制御に使用）
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const vrmRenderRef = useRef<any>(null);

	// 現在のモーションファイル（カテゴリ深度に応じて変更）
	const [motionFile, setMotionFile] = useState(
		categoryDepth >= 2 ? "/Motion/StandingIdle.vrma" : "/Motion/VRMA_01.vrma",
	);

	// モデルの基本Y軸回転値（180度 = πラジアン）
	const baseRotationY = Math.PI;

	/**
	 * カテゴリ深度変更時の処理
	 * アニメーションを切り替えてモデルの状態を更新
	 */
	useEffect(() => {
		// カテゴリ深度が変わった場合のみ処理
		if (categoryDepth !== prevDepthRef.current) {
			const newMotion =
				categoryDepth >= 2
					? "/Motion/StandingIdle.vrma" // 詳細画面用モーション
					: "/Motion/VRMA_01.vrma"; // 通常画面用モーション

			// VRMRenderコンポーネントの参照が有効ならクロスフェードでアニメーション切替
			if (vrmRenderRef.current?.crossFadeAnimation) {
				vrmRenderRef.current.crossFadeAnimation(newMotion);
			} else {
				// 参照が無効な場合は単純に状態を更新
				setMotionFile(newMotion);
			}

			// 処理済みのカテゴリ深度を記録
			prevDepthRef.current = categoryDepth;
		}
	}, [categoryDepth]);

	/**
	 * VRMRenderに渡す設定オプション
	 * カテゴリ深度に応じて位置と回転を調整
	 */
	const vrmOptions = {
		vrmUrl: "/Model/KIT_VRM0.0.vrm", // VRMモデルのパス
		vrmaUrl: motionFile, // アニメーションファイルのパス
		position:
			categoryDepth >= 2
				? ([-0.3, 0, 0] as [number, number, number]) // 詳細画面で少し左に配置
				: ([0, 0, 0] as [number, number, number]), // 通常位置
		rotation:
			categoryDepth >= 2
				? // 詳細画面では少し右を向く（ベース回転 + 15度）
					([0, baseRotationY + Math.PI / 12, 0] as [number, number, number])
				: // 通常は正面を向く
					([0, baseRotationY, 0] as [number, number, number]),
		lookAtCamera: true, // カメラ目線を有効化
		ref: vrmRenderRef, // コンポーネントの参照
	};
	return (
		<Suspense>
			<VRMRender {...vrmOptions} />
		</Suspense>
	);
}
