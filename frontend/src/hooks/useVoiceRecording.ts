import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import {
	isRecordingAtom,
	recordingTimerAtom,
	updateRecordingTimerAtom,
	recordingIntervalAtom,
	toggleRecordingAtom,
	randomTextGeneratorAtom,
} from "@/store/recordingAtoms";

type UseVoiceRecordingProps = {
	onRecognizedText: (text: string) => void;
	getRandomText: () => string;
	recordingDuration?: number;
};

/**
 * 音声録音機能を提供するカスタムフック
 */
export const useVoiceRecording = ({
	onRecognizedText,
	getRandomText,
}: UseVoiceRecordingProps) => {
	const [isRecording] = useAtom(isRecordingAtom);
	const [recordingTimer] = useAtom(recordingTimerAtom);
	const intervalMs = useAtomValue(recordingIntervalAtom);
	const toggleRecording = useSetAtom(toggleRecordingAtom);
	const updateRecordingTimer = useSetAtom(updateRecordingTimerAtom);
	const setRandomTextGenerator = useSetAtom(randomTextGeneratorAtom);

	// ランダムテキスト生成関数を設定
	useEffect(() => {
		setRandomTextGenerator(getRandomText);
	}, [getRandomText, setRandomTextGenerator]);

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
