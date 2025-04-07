"use client";

import { useAtomValue } from "jotai";
import { recordingTimerAtom } from "@/store/recordingAtoms";

/**
 * 録音時間をフォーマットするカスタムフック
 *
 * @returns {string} - 経過時間のフォーマット済み文字列 (mm:ss)
 */
export const useRecordingTimer = (): string => {
	const recordingTime = useAtomValue(recordingTimerAtom);

	// 分と秒に変換
	const minutes = Math.floor(recordingTime / 60);
	const seconds = Math.floor(recordingTime % 60);

	// mm:ss 形式でフォーマット
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
