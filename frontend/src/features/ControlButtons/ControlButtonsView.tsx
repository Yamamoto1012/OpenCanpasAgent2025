import type { FC } from "react";
import { Info, Mic2, Volume2, VolumeX } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";
import { InfoPanel } from "../InfoPanel/InfoPanel";

export type ControlButtonsViewProps = {
	/**
	 * 情報パネルの表示状態
	 */
	showInfo: boolean;

	/**
	 * ミュート状態
	 */
	isMuted: boolean;

	/**
	 * 情報パネル表示切替のハンドラー
	 */
	onToggleInfo: () => void;

	/**
	 * ミュート状態切替のハンドラー
	 */
	onToggleMute: () => void;

	/**
	 * 音声チャットを開くハンドラー
	 */
	onOpenVoiceChat: () => void;

	/**
	 * 情報パネルを閉じるハンドラー
	 */
	onCloseInfo: () => void;
};

/**
 * 画面右下に配置されるコントロールボタン群のプレゼンテーションコンポーネント
 */
export const ControlButtonsView: FC<ControlButtonsViewProps> = ({
	showInfo,
	isMuted,
	onToggleInfo,
	onToggleMute,
	onOpenVoiceChat,
	onCloseInfo,
}) => {
	return (
		<>
			{/* 情報ボタン */}
			<div className="absolute bottom-1/12 right-2 p-4 z-10">
				<IconButton
					icon={Info}
					onClick={onToggleInfo}
					aria-label="情報を表示"
				/>
			</div>

			{/* 音声コントロールボタン */}
			<div className="absolute bottom-2/12 right-2 p-4 z-10">
				<IconButton
					icon={isMuted ? VolumeX : Volume2}
					onClick={onToggleMute}
					aria-label={isMuted ? "音声をオンにする" : "音声をミュートする"}
				/>
			</div>

			{/* 音声チャットボタン */}
			<div className="absolute bottom-3/12 right-2 p-4 z-10">
				<IconButton
					icon={Mic2}
					onClick={onOpenVoiceChat}
					aria-label="音声チャットを開く"
				/>
			</div>

			{/* 情報パネル */}
			{showInfo && <InfoPanel onClose={onCloseInfo} />}
		</>
	);
};
