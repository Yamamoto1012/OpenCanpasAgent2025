import { showBottomNavigationAtom } from "@/store/navigationAtoms";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import type { FC, RefObject } from "react";
import type { VRMWrapperHandle } from "../VRM/VRMWrapper/VRMWrapper";
import { ChatInterface, type ChatInterfaceHandle } from "./ChatInterface";

export type ChatSectionViewProps = {
	isVisible: boolean;
	chatInterfaceRef: RefObject<ChatInterfaceHandle | null>;
	vrmWrapperRef: RefObject<VRMWrapperHandle | null>;
};

/**
 * チャットセクションのプレゼンテーションコンポーネント
 * @param isVisible - チャットセクションの表示状態
 * @param chatInterfaceRef - ChatInterfaceコンポーネントへの参照
 * @param vrmWrapperRef - VRMWrapperコンポーネントへの参照
 */
export const ChatSectionView: FC<ChatSectionViewProps> = ({
	isVisible,
	chatInterfaceRef,
	vrmWrapperRef,
}) => {
	const [showBottomNavigation] = useAtom(showBottomNavigationAtom);

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className={`
						${
							showBottomNavigation
								? "w-full h-full"
								: "absolute bottom-4 left-4 right-4 md:bottom-auto md:top-1/7 md:left-4 md:right-auto p-2 md:p-4"
						}
						z-10 
						flex justify-center md:justify-start
					`}
					initial={{
						opacity: 0,
						y: showBottomNavigation ? 0 : 100,
						x: 0,
					}}
					animate={{
						opacity: 1,
						y: 0,
						x: 0,
					}}
					exit={{
						opacity: 0,
						y: showBottomNavigation ? 0 : 100,
						x: 0,
					}}
					transition={{ duration: 0.3 }}
				>
					<ChatInterface ref={chatInterfaceRef} vrmWrapperRef={vrmWrapperRef} />
				</motion.div>
			)}
		</AnimatePresence>
	);
};
