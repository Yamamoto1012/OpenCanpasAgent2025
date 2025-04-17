import type { FC, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatInterface, type ChatInterfaceHandle } from "./ChatInterface";

export type ChatSectionViewProps = {
	/**
	 * チャットの表示状態
	 */
	isVisible: boolean;

	/**
	 * ChatInterfaceへの参照
	 * nullableな参照を許容する
	 */
	chatInterfaceRef: RefObject<ChatInterfaceHandle | null>;
};

/**
 * チャットインターフェースの表示を担当するプレゼンテーションコンポーネント
 *
 * 画面左側のチャットUIの表示と非表示、およびアニメーション効果の表示のみを担当
 */
export const ChatSectionView: FC<ChatSectionViewProps> = ({
	isVisible,
	chatInterfaceRef,
}) => {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="absolute top-1/7 left-4 p-4 z-10"
					initial={{ opacity: 0, x: -100 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -100 }}
					transition={{ duration: 0.3 }}
				>
					<ChatInterface ref={chatInterfaceRef} />
				</motion.div>
			)}
		</AnimatePresence>
	);
};
