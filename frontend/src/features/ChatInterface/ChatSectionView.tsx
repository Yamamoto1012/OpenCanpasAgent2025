import type { FC, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatInterface, type ChatInterfaceHandle } from "./ChatInterface";
import { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";

export type ChatSectionViewProps = {
	isVisible: boolean;
	chatInterfaceRef: RefObject<ChatInterfaceHandle | null>;
	vrmWrapperRef: RefObject<VRMWrapperHandle | null>;
};

export const ChatSectionView: FC<ChatSectionViewProps> = ({
	isVisible,
	chatInterfaceRef,
	vrmWrapperRef,
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
					<ChatInterface ref={chatInterfaceRef} vrmWrapperRef={vrmWrapperRef} />
				</motion.div>
			)}
		</AnimatePresence>
	);
};
