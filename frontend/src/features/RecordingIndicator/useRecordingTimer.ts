"use client";

import { useState, useEffect } from "react";

/**
 * 時間計測のためのカスタムフック
 * - isRecording が true の場合、タイマーを開始し、1秒ごとに時間を更新
 * - isRecording が false の場合、タイマーをリセットし、不要な再レンダリングを防止
 *
 * @param isRecording - 録音が開始されているかどうかのフラグ
 * @returns {string} - 経過時間のフォーマット済み文字列 (mm:ss)
 */
export const useRecordingTimer = (isRecording: boolean): string => {
	const [recordingTime, setRecordingTime] = useState(0);

	useEffect(() => {
		let interval: NodeJS.Timeout | undefined;

		// 録音中のみタイマーを開始し、不要な入れ子を避ける
		if (isRecording) {
			setRecordingTime(0);
			interval = setInterval(() => {
				setRecordingTime((prevTime) => prevTime + 1);
			}, 1000);
		} else {
			setRecordingTime(0);
		}

		// コンポーネントアンマウントまたは isRecording 変更時にタイマーをクリア
		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [isRecording]);

	const minutes = Math.floor(recordingTime / 60);
	const seconds = recordingTime % 60;

	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
