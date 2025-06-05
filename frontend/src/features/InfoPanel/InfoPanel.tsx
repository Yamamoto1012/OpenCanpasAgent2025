import { showBottomNavigationAtom } from "@/store/navigationAtoms";
import { useAtom } from "jotai";
import type { FC } from "react";
import { InfoPanelView } from "./InfoPanelView";

type InfoPanelProps = {
	onClose: () => void;
};

/**
 * 情報パネルのコンテナコンポーネント
 * @param onClose - パネルを閉じるためのコールバック関数
 */
export const InfoPanel: FC<InfoPanelProps> = ({ onClose }) => {
	const [showBottomNavigation] = useAtom(showBottomNavigationAtom);

	return <InfoPanelView onClose={onClose} isMobile={showBottomNavigation} />;
};
