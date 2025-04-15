import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
	isRecordingAtom,
	recordingTimerAtom,
	updateRecordingTimerAtom,
	recordingIntervalAtom,
	toggleRecordingAtom,
} from "@/store/recordingAtoms";

type UseVoiceRecordingProps = {
	onRecognizedText: (text: string) => void;
	recordingDuration?: number;
};

/**
 * 音声録音機能を提供するカスタムフック
 */
export const useVoiceRecording = ({
	onRecognizedText,
}: UseVoiceRecordingProps) => {
	const [isRecording] = useAtom(isRecordingAtom);
	const [recordingTimer] = useAtom(recordingTimerAtom);
	const intervalMs = useAtomValue(recordingIntervalAtom); // 録音間隔
	const toggleRecording = useSetAtom(toggleRecordingAtom);
	const updateRecordingTimer = useSetAtom(updateRecordingTimerAtom);

	// 録音中はタイマーを更新
	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;

		if (isRecording) {
			// 定期的にタイマーを更新
			intervalId = setInterval(() => {
				updateRecordingTimer();
			}, intervalMs);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [isRecording, intervalMs, updateRecordingTimer]);

	// 録音の開始/停止を切り替える
	const handleToggleRecording = () => {
		toggleRecording(onRecognizedText);
	};

	return {
		isRecording,
		recordingTimer,
		toggleRecording: handleToggleRecording,
	};
};
