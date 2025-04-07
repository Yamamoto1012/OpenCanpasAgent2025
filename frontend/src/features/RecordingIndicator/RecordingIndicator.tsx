"use client";

import { useAtom } from "jotai";
import { RecordingIndicatorView } from "./RecordingIndicatorView";
import { useRecordingTimer } from "./useRecordingTimer";
import type { FC } from "react";
import { isRecordingAtom, recordingTimerAtom } from "@/store/recordingAtoms";

/**
 * 録音状態を表示するインジケーターコンポーネント
 */
export const RecordingIndicator: FC = () => {
	const [isRecording] = useAtom(isRecordingAtom);
	const [recordingTimer] = useAtom(recordingTimerAtom);

	// フォーマット済みの時間を取得
	const formattedTime = useRecordingTimer();

	if (!isRecording) {
		return null;
	}

	return <RecordingIndicatorView formattedTime={formattedTime} />;
};
