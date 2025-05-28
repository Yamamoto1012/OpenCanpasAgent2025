import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, MessageCircle, Mic, Info } from "lucide-react";
import type { NavigationScreen } from "@/store/navigationAtoms";

export type BottomNavigationViewProps = {
	/**
	 * 現在アクティブな画面
	 */
	currentScreen: NavigationScreen;

	/**
	 * ナビゲーションの表示/非表示
	 */
	isVisible: boolean;

	/**
	 * 画面切り替えのハンドラー
	 */
	onScreenChange: (screen: NavigationScreen) => void;
};

/**
 * ナビゲーションアイテムの定義
 */
const navigationItems = [
	{
		id: "home" as NavigationScreen,
		label: "ホーム",
		icon: Home,
		color: "text-green-600",
		activeColor: "text-green-700",
	},
	{
		id: "chat" as NavigationScreen,
		label: "チャット",
		icon: MessageCircle,
		color: "text-blue-600",
		activeColor: "text-blue-700",
	},
	{
		id: "voice" as NavigationScreen,
		label: "音声",
		icon: Mic,
		color: "text-purple-600",
		activeColor: "text-purple-700",
	},
	{
		id: "info" as NavigationScreen,
		label: "情報",
		icon: Info,
		color: "text-orange-600",
		activeColor: "text-orange-700",
	},
];

/**
 * モバイル用ボトムナビゲーションのプレゼンテーションコンポーネント
 * @param currentScreen - 現在アクティブな画面
 * @param isVisible - ナビゲーションの表示状態
 * @param onScreenChange - 画面切り替えのハンドラー
 */
export const BottomNavigationView: FC<BottomNavigationViewProps> = ({
	currentScreen,
	isVisible,
	onScreenChange,
}) => {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="fixed bottom-0 left-0 right-0 z-50"
					initial={{ y: 100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 100, opacity: 0 }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
				>
					<div
						className="
            bg-white/95 backdrop-blur-md border-t border-gray-200/50
            shadow-lg
            px-2 py-1
          "
					>
						<div className="flex justify-around items-center">
							{navigationItems.map((item) => {
								const Icon = item.icon;
								const isActive = currentScreen === item.id;

								return (
									// biome-ignore lint/a11y/useButtonType: <explanation>
									<button
										key={item.id}
										onClick={() => onScreenChange(item.id)}
										className="
                      flex flex-col items-center justify-center
                      min-h-[64px] min-w-[64px] px-2 py-1
                      rounded-lg
                      transition-all duration-200
                      touch-manipulation
                      hover:bg-gray-100/50
                      active:scale-95
                    "
										aria-label={item.label}
									>
										<div className="relative">
											<Icon
												className={`
                          h-6 w-6 transition-all duration-200
                          ${isActive ? item.activeColor : item.color}
                          ${isActive ? "scale-110" : "scale-100"}
                        `}
											/>

											{/* アクティブインジケーター */}
											{isActive && (
												<motion.div
													className={`
                            absolute -bottom-1 left-1/2 transform -translate-x-1/2
                            w-1 h-1 rounded-full
                            ${item.activeColor.replace("text-", "bg-")}
                          `}
													layoutId="activeIndicator"
													transition={{
														type: "spring",
														damping: 25,
														stiffness: 300,
													}}
												/>
											)}
										</div>

										<span
											className={`
                      text-xs font-medium mt-1 transition-all duration-200
                      ${isActive ? item.activeColor : "text-gray-600"}
                      ${isActive ? "font-semibold" : "font-medium"}
                    `}
										>
											{item.label}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
