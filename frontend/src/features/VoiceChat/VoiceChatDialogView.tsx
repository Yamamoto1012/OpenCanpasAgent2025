import type { FC, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { VoiceChat } from "./VoiceChat";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";

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
 *
 * 画面中央に表示される音声チャット機能のUI表示のみを担当
 */
export const VoiceChatDialogView: FC<VoiceChatDialogViewProps> = ({
	isVisible,
	onClose,
	vrmWrapperRef,
}) => {
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
						<div className="flex justify-end mb-2">
							<button
								onClick={onClose}
								className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
								aria-label="音声チャットを閉じる"
								type="button"
							>
								<X className="h-5 w-5 text-white" />
							</button>
						</div>
						<VoiceChat onClose={onClose} vrmWrapperRef={vrmWrapperRef} />
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
