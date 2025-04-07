import type { FC, RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence } from "framer-motion";
import { VRMWrapper } from "../VRMWrapper/VRMWrapper";
import { ThinkingIndicator } from "../../ThinkingIndicator/ThinkingIndicator";
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

/**
 * VRMモデルを表示するためのプレゼンテーションコンポーネント
 */
export const VRMContainerView: FC<VRMContainerViewProps> = ({
	categoryDepth,
	vrmWrapperRef,
	isThinking,
	isMuted,
	onThinkingStateChange,
}) => {
	return (
		<>
			{/* 3Dモデル表示エリア */}
			<div className="absolute inset-0">
				<Canvas
					flat
					camera={{
						fov: 40,
						near: 0.01,
						far: 2000,
						position: [0.04, 1.45, categoryDepth >= 2 ? -0.5 : 1],
						rotation: [0, categoryDepth >= 2 ? Math.PI / 8 : 0, 0],
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
				{isThinking && <ThinkingIndicator visible={true} />}
			</AnimatePresence>
		</>
	);
};
