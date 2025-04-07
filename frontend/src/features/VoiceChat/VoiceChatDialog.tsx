import type { FC, RefObject } from "react";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { VoiceChatDialogView } from "./VoiceChatDialogView";

type VoiceChatDialogProps = {
	/**
	 * ダイアログの表示状態
	 */
	isVisible: boolean;

	/**
	 * ダイアログを閉じるハンドラー
	 */
	onClose: () => void;

	/**
	 * VRMWrapperへの参照
	 * モーション制御に使用
	 */
	vrmWrapperRef: RefObject<VRMWrapperHandle | null>;
};

/**
 * 音声チャットのダイアログUIコンテナコンポーネント
 *
 * 音声チャット機能の状態管理とロジックを担当
 */
export const VoiceChatDialog: FC<VoiceChatDialogProps> = ({
	isVisible,
	onClose,
	vrmWrapperRef,
}) => {
	// 将来的にダイアログ固有のロジックや状態管理が必要

	return (
		<VoiceChatDialogView
			isVisible={isVisible}
			onClose={onClose}
			vrmWrapperRef={vrmWrapperRef}
		/>
	);
};
