import {
	currentScreenAtom,
	showBottomNavigationAtom,
} from "@/store/navigationAtoms";
import { useAtom } from "jotai";
import type { FC } from "react";
import { BottomNavigationView } from "./BottomNavigationView";

/**
 * ボトムナビゲーションのコンテナコンポーネント
 */
export const BottomNavigation: FC = () => {
	const [currentScreen, setCurrentScreen] = useAtom(currentScreenAtom);
	const [showBottomNavigation] = useAtom(showBottomNavigationAtom);

	return (
		<BottomNavigationView
			currentScreen={currentScreen}
			isVisible={showBottomNavigation}
			onScreenChange={setCurrentScreen}
		/>
	);
};
