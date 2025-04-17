import type { FC, RefObject } from "react";
import { ChatSectionView } from "./ChatSectionView";
import type { ChatInterfaceHandle } from "./ChatInterface";

type ChatSectionProps = {
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
 * チャットインターフェースの表示を管理するコンテナコンポーネント
 *
 * チャットインターフェースの状態管理とロジックを担当
 */
export const ChatSection: FC<ChatSectionProps> = ({
	isVisible,
	chatInterfaceRef,
}) => {
	// 将来的にチャットに関する追加のロジックや状態管理

	return (
		<ChatSectionView
			isVisible={isVisible}
			chatInterfaceRef={chatInterfaceRef}
		/>
	);
};
