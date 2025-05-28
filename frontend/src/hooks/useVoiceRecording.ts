import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useCallback } from "react";
import {
	isRecordingAtom,
	recordingTimerAtom,
	updateRecordingTimerAtom,
	recordingIntervalAtom,
	toggleRecordingAtom,
} from "@/store/recordingAtoms";

/**
 * 音声録音フックのプロパティの型
 */
export type UseVoiceRecordingProps = {
	onRecognizedText: (text: string) => void;
	recordingDuration?: number;
}

/**
 * 音声録音フックの状態の型
 */
export type VoiceRecordingState ={
	readonly isRecording: boolean;
	readonly recordingTimer: number;
	readonly recordingInterval: number;
}

/**
 * 音声録音フックのアクション群の型
 */
export type VoiceRecordingActions = {
	readonly toggleRecording: () => void;
}

/**
 * useVoiceRecordingの返却値の型
 */
export type UseVoiceRecordingReturn ={
	readonly state: VoiceRecordingState;
	readonly actions: VoiceRecordingActions;
	readonly isReady: boolean;
}

/**
 * 音声録音機能を提供するカスタムフック
 * @param onRecoginizedText - 音声認識結果を受け取るコールバック関数
 * @returns 音声録音の状態とアクションを提供するオブジェクト
 */
export const useVoiceRecording = ({
	onRecognizedText,
}: UseVoiceRecordingProps): UseVoiceRecordingReturn => {
	const [isRecording] = useAtom(isRecordingAtom); // 録音中かどうかの状態
	const [recordingTimer] = useAtom(recordingTimerAtom); // 録音時時間
	const recordingInterval = useAtomValue(recordingIntervalAtom); // 録音間隔
	const toggleRecordingAction = useSetAtom(toggleRecordingAtom); // 録音の開始/停止を切り替える
	const updateRecordingTimer = useSetAtom(updateRecordingTimerAtom); // 録音タイマーを更新する

	/**
	 * 録音の開始/停止を切り替える
	 */
	const toggleRecording = useCallback(() => {
		toggleRecordingAction(onRecognizedText);
	}, [toggleRecordingAction, onRecognizedText]);

	// 録音中はタイマーを更新
	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;

		if (isRecording) {
			// 定期的にタイマーを更新
			intervalId = setInterval(() => {
				updateRecordingTimer();
			}, recordingInterval);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [isRecording, recordingInterval, updateRecordingTimer]);

	// 状態オブジェクト（現在の録音状態)
	const state: VoiceRecordingState = {
		isRecording,
		recordingTimer,
		recordingInterval,
	};

	// アクションオブジェクト(録音開始、・停止を切り替える)
	const actions: VoiceRecordingActions = {
		toggleRecording,
	};

	return {
		state,
		actions,
		isReady: true,
	} as const;
};
