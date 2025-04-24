import type { FC, RefObject } from "react";
import { ChatSectionView } from "./ChatSectionView";
import type { ChatInterfaceHandle } from "./ChatInterface";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";

type ChatSectionProps = {
	isVisible: boolean;
	chatInterfaceRef: RefObject<ChatInterfaceHandle | null>;
	vrmWrapperRef: RefObject<VRMWrapperHandle | null>;
};

/**
 * チャットインターフェースの表示を管理するコンテナコンポーネント
 *
 * チャットインターフェースの状態管理とロジックを担当
 */
export const ChatSection: FC<ChatSectionProps> = ({
	isVisible,
	chatInterfaceRef,
	vrmWrapperRef,
}) => {
	// 将来的にチャットに関する追加のロジックや状態管理

	return (
		<ChatSectionView
			isVisible={isVisible}
			chatInterfaceRef={chatInterfaceRef}
			vrmWrapperRef={vrmWrapperRef}
		/>
	);
};
