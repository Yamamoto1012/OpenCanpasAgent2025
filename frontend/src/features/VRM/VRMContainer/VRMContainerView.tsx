import { Canvas } from "@react-three/fiber";
import { AnimatePresence } from "framer-motion";
import type { FC, RefObject } from "react";
import { ThinkingIndicator } from "../../ThinkingIndicator/ThinkingIndicator";
import { VRMWrapper } from "../VRMWrapper/VRMWrapper";
import type { VRMWrapperHandle } from "../VRMWrapper/VRMWrapper";

/**
 * VRMContainerViewのProps
 */
export type VRMContainerViewProps = {
	/**
	 * カテゴリの深さ (カメラ位置の調整に使用)
	 */
	categoryDepth: number;

	/**
	 * VRMWrapperへの参照
	 * 親コンポーネントからVRMの制御を可能にする
	 */
	vrmWrapperRef: RefObject<VRMWrapperHandle | null>;

	/**
	 * 思考中の状態
	 */
	isThinking: boolean;

	/**
	 * ミュート状態
	 */
	isMuted: boolean;

	/**
	 * 思考状態が変化した際に呼び出されるハンドラ
	 */
	onThinkingStateChange: (isThinking: boolean) => void;
};

// レスポンシブカメラ設定を計算する関数
const getCameraSettings = (categoryDepth: number, isMobile = false) => {
	if (isMobile) {
		// モバイル用カメラ設定
		return {
			fov: 40,
			position: [0.04, 1.35, categoryDepth >= 2 ? -0.3 : 1.2] as [
				number,
				number,
				number,
			],
			rotation: [0, categoryDepth >= 2 ? Math.PI / 8 : 0, 0] as [
				number,
				number,
				number,
			],
		};
	}

	// デスクトップ用カメラ設定（従来通り）
	return {
		fov: 40,
		position: [0.04, 1.45, categoryDepth >= 2 ? -0.5 : 1] as [
			number,
			number,
			number,
		],
		rotation: [0, categoryDepth >= 2 ? Math.PI / 8 : 0, 0] as [
			number,
			number,
			number,
		],
	};
};

/**
 * VRMモデルを表示するためのプレゼンテーションコンポーネント
 * レスポンシブデザインに対応し、モバイルとデスクトップで適切なカメラ設定を適用
 */
export const VRMContainerView: FC<VRMContainerViewProps> = ({
	categoryDepth,
	vrmWrapperRef,
	isThinking,
	isMuted,
	onThinkingStateChange,
}) => {
	// 画面サイズを動的に検出（簡易版）
	// より正確にはuseMediaQueryなどのフックを使用することもできます
	const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
	const cameraSettings = getCameraSettings(categoryDepth, isMobile);

	return (
		<>
			{/* 3Dモデル表示エリア */}
			<div className="absolute inset-0">
				<Canvas
					flat
					camera={{
						fov: cameraSettings.fov,
						near: 0.01,
						far: 2000,
						position: cameraSettings.position,
						rotation: cameraSettings.rotation,
					}}
				>
					<gridHelper />
					<VRMWrapper
						categoryDepth={categoryDepth}
						isMuted={isMuted}
						ref={vrmWrapperRef}
						onThinkingStateChange={onThinkingStateChange}
					/>
					<ambientLight />
					<directionalLight position={[5, 5, 5]} intensity={2} />
				</Canvas>
			</div>

			{/* 思考中インジケーター */}
			<AnimatePresence>
				{isThinking && (
					<ThinkingIndicator visible={true} categoryDepth={categoryDepth} />
				)}
			</AnimatePresence>
		</>
	);
};
