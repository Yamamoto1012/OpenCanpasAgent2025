import type { FC, RefObject } from "react";
import { useAtom } from "jotai";
import { ScreenManagerView } from "./ScreenManagerView";
import {
	currentScreenAtom,
	showBottomNavigationAtom,
} from "@/store/navigationAtoms";
import type { Category } from "@/features/CategoryNavigator/components/CategoryCard";
import type { ChatInterfaceHandle } from "@/features/ChatInterface/ChatInterface";
import type { VRMWrapperHandle } from "@/features/VRM/VRMWrapper/VRMWrapper";

export type ScreenManagerProps = {
	categoryDepth: number;
	selectedCategory: Category | null;
	showActionPrompt: boolean;
	showSearchResult: boolean;
	searchQuery: string;
	isQuestion: boolean;
	onCategorySelect: (depth: number, category?: Category) => void;
	onSearch: () => void;
	onAskQuestion: (question: string) => void;
	onBackFromSearch: () => void;

	// ChatSection関連
	showChat: boolean;
	chatInterfaceRef: RefObject<ChatInterfaceHandle | null>;

	// VRM関連
	vrmWrapperRef: RefObject<VRMWrapperHandle | null>;

	// InfoPanel関連
	onCloseInfo: () => void;
};

/**
 * 画面管理のコンテナコンポーネント
 * @param props - 各種プロパティを含むオブジェクト
 */
export const ScreenManager: FC<ScreenManagerProps> = (props) => {
	const [currentScreen] = useAtom(currentScreenAtom);
	const [showBottomNavigation] = useAtom(showBottomNavigationAtom);

	return (
		<ScreenManagerView
			currentScreen={currentScreen}
			showBottomNavigation={showBottomNavigation}
			{...props}
		/>
	);
};
