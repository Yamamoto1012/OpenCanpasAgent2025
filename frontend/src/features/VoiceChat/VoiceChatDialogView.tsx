import { useResponsive } from "@/hooks/useResponsive";
import { currentScreenAtom } from "@/store/navigationAtoms";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { X } from "lucide-react";
import type { FC, RefObject } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { VoiceChat } from "./VoiceChat";

export type VoiceChatDialogViewProps = {
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
 * 音声チャットのダイアログUIプレゼンテーションコンポーネント
 * @param isVisible - ダイアログの表示状態
 * @param onClose - ダイアログを閉じるためのコールバック関数
 * @param vrmWrapperRef - VRMWrapperコンポーネントへの参照
 */
export const VoiceChatDialogView: FC<VoiceChatDialogViewProps> = ({
	isVisible,
	onClose,
	vrmWrapperRef,
}) => {
	const { isMobile } = useResponsive();
	const [currentScreen] = useAtom(currentScreenAtom);
	const { t } = useTranslation("voice");

	// モバイル時にナビゲーションで他の画面が選択された場合、ダイアログを閉じる
	useEffect(() => {
		if (isMobile && isVisible && currentScreen !== "voice") {
			onClose();
		}
	}, [currentScreen, isMobile, isVisible, onClose]);

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="absolute inset-0 flex items-center justify-center bg-transparent z-50"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<motion.div
						className="rounded-xl p-6 mx-4 h-full w-full max-w-2xl"
						initial={{ scale: 0.9, y: 20 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.9, y: 20 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
					>
						{/* デスクトップでのみバツボタンを表示 */}
						{!isMobile && (
							<div className="flex justify-end mb-2">
								<button
									onClick={onClose}
									className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
									aria-label={t("closeVoiceChat")}
									type="button"
								>
									<X className="h-5 w-5 text-white" />
								</button>
							</div>
						)}

						<VoiceChat onClose={onClose} vrmWrapperRef={vrmWrapperRef} />
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
