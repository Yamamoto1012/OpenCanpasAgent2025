import type { FC } from "react";
import { useAtom } from "jotai";
import { BottomNavigationView } from "./BottomNavigationView";
import {
	currentScreenAtom,
	showBottomNavigationAtom,
} from "@/store/navigationAtoms";

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
