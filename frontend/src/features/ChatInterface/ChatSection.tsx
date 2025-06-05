import type { FC, RefObject } from "react";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import type { ChatInterfaceHandle } from "./ChatInterface";
import { ChatSectionView } from "./ChatSectionView";

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
	return (
		<ChatSectionView
			isVisible={isVisible}
			chatInterfaceRef={chatInterfaceRef}
			vrmWrapperRef={vrmWrapperRef}
		/>
	);
};
