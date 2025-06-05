import { isMutedAtom, isThinkingAtom } from "@/store/appStateAtoms";
import { useAtom } from "jotai";
import type { FC } from "react";
import type { RefObject } from "react";
import type { VRMWrapperHandle } from "../VRMWrapper/VRMWrapper";
import { VRMContainerView } from "./VRMContainerView";

type VRMContainerProps = {
	/**
	 * カテゴリの深さ (カメラ位置の調整に使用)
	 */
	categoryDepth: number;

	/**
	 * VRMWrapperへの参照
	 * 親コンポーネントからVRMの制御を可能にする
	 */
	vrmWrapperRef: RefObject<VRMWrapperHandle | null>;
};

/**
 * VRMモデルを表示するためのコンテナコンポーネント
 *
 * 状態管理とロジック処理を担当
 */
export const VRMContainer: FC<VRMContainerProps> = ({
	categoryDepth,
	vrmWrapperRef,
}) => {
	// グローバル状態へのアクセス
	const [isThinking, setIsThinking] = useAtom(isThinkingAtom);
	const [isMuted] = useAtom(isMutedAtom);

	return (
		<VRMContainerView
			categoryDepth={categoryDepth}
			vrmWrapperRef={vrmWrapperRef}
			isThinking={isThinking}
			isMuted={isMuted}
			onThinkingStateChange={setIsThinking}
		/>
	);
};
