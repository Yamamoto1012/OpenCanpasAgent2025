"use client";

import { RecordingIndicatorView } from "./RecordingIndicatorView";
import { useRecordingTimer } from "./useRecordingTimer";
import type { FC } from "react";

export type RecordingIndicatorProps = {
	isRecording: boolean;
};

/**
 * 録音状態を表示するインジケーターコンポーネント
 */
export const RecordingIndicator: FC<RecordingIndicatorProps> = ({
	isRecording,
}) => {
	// 録音時間を計測するカスタムフック
	const formattedTime = useRecordingTimer(isRecording);

	if (!isRecording) {
		return null;
	}

	return <RecordingIndicatorView formattedTime={formattedTime} />;
};
