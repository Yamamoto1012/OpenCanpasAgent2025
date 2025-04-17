import { useAtom } from "jotai";
import { showVoiceChatAtom } from "@/store/appStateAtoms";
import { useEffect, type FC, type RefObject } from "react";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { VoiceChatDialogView } from "./VoiceChatDialogView";

type VoiceChatDialogProps = {
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
export const VoiceChatDialog: FC<Omit<VoiceChatDialogProps, "isVisible" | "onClose">> = ({ vrmWrapperRef }) => {
	// グローバルな音声チャット表示状態を参照
	const [showVoiceChat, setShowVoiceChat] = useAtom(showVoiceChatAtom);

	// ダイアログを閉じる
	const handleClose = () => {
		setShowVoiceChat(false);
	};

	  // 音声チャット表示用のモーション制御
		useEffect(() => {
			if (showVoiceChat && vrmWrapperRef.current?.crossFadeAnimation) {
				vrmWrapperRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
			}
		}, [showVoiceChat, vrmWrapperRef]);

	return (
		<VoiceChatDialogView
			isVisible={showVoiceChat}
			onClose={handleClose}
			vrmWrapperRef={vrmWrapperRef}
		/>
	);
};
