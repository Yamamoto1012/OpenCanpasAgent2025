import type { FC } from "react";
import { useAtom } from "jotai";
import { showInfoAtom, isMutedAtom } from "@/store/appStateAtoms";
import { ControlButtonsView } from "./ControlButtonsView";

type ControlButtonsProps = {
	/**
	 * 音声チャットを開くハンドラー
	 */
	onOpenVoiceChat: () => void;
};

/**
 * 画面右下に配置されるコントロールボタン群のコンテナコンポーネント
 *
 * 情報表示、音声ON/OFF、音声チャット起動などのグローバル操作の状態管理とロジックを担当
 */
export const ControlButtons: FC<ControlButtonsProps> = ({
	onOpenVoiceChat,
}) => {
	// グローバル状態の管理
	const [showInfo, setShowInfo] = useAtom(showInfoAtom);
	const [isMuted, setIsMuted] = useAtom(isMutedAtom);

	/**
	 * 情報パネルの表示状態を切り替える
	 */
	const handleToggleInfo = () => setShowInfo(!showInfo);

	/**
	 * 音声のミュート状態を切り替える
	 */
	const handleToggleMute = () => setIsMuted(!isMuted);

	/**
	 * 情報パネルを閉じる
	 */
	const handleCloseInfo = () => setShowInfo(false);

	return (
		<ControlButtonsView
			showInfo={showInfo}
			isMuted={isMuted}
			onToggleInfo={handleToggleInfo}
			onToggleMute={handleToggleMute}
			onOpenVoiceChat={onOpenVoiceChat}
			onCloseInfo={handleCloseInfo}
		/>
	);
};
