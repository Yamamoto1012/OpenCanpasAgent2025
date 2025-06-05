import { Info, Mic2, Volume2, VolumeX } from "lucide-react";
import type { FC } from "react";
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
 * @param showInfo - 情報パネルの表示状態
 * @param isMuted - ミュート状態
 * @param onToggleInfo - 情報パネル表示切替のハンドラー
 * @param onToggleMute - ミュート状態切替のハンドラー
 * @param onOpenVoiceChat - 音声チャットを開くハンドラー
 * @param onCloseInfo - 情報パネルを閉じるハンドラー
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
			{/* デスクトップ: 右下に縦に配置、モバイル: 右下に横に配置 */}
			<div
				className="absolute 
				bottom-4 right-2 
				flex flex-row md:flex-col gap-2 md:gap-4 
				p-2 md:p-4 z-10"
			>
				{/* 音声チャットボタン */}
				<div className="order-3 md:order-1">
					<IconButton
						icon={Mic2}
						onClick={onOpenVoiceChat}
						aria-label="音声チャットを開く"
						className="h-11 w-11 md:h-12 md:w-12" // タッチターゲット44px以上
					/>
				</div>

				{/* 音声コントロールボタン */}
				<div className="order-2 md:order-2">
					<IconButton
						icon={isMuted ? VolumeX : Volume2}
						onClick={onToggleMute}
						aria-label={isMuted ? "音声をオンにする" : "音声をミュートする"}
						className="h-11 w-11 md:h-12 md:w-12"
					/>
				</div>

				{/* 情報ボタン */}
				<div className="order-1 md:order-3">
					<IconButton
						icon={Info}
						onClick={onToggleInfo}
						aria-label="情報を表示"
						className="h-11 w-11 md:h-12 md:w-12"
					/>
				</div>
			</div>

			{/* 情報パネル */}
			{showInfo && <InfoPanel onClose={onCloseInfo} />}
		</>
	);
};
