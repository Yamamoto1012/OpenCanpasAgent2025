import { useState, useCallback } from "react";
import type { VRMWrapperHandle } from "@/features/VRM/VRMWrapper/VRMWrapper";

/**
 * テキスト音声合成（TTS）を扱うためのカスタムフック
 * バックエンドのTTSエンドポイントを使用して音声を生成し再生する
 */
export function useTextToSpeech(
	vrmWrapperRef?: React.RefObject<VRMWrapperHandle | null>,
) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

	/**
	 * テキストを音声に変換して再生する
	 * @param text 音声に変換するテキスト
	 * @param speakerId 話者ID (デフォルト: 888753760)
	 * @returns Promise<void>
	 */
	const speak = useCallback(
		async (text: string, speakerId: number = 888753760): Promise<void> => {
			if (!text) return;
			try {
				setIsLoading(true);
				setError(null);
				if (audio) {
					audio.pause();
					audio.currentTime = 0;
				}
				// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
				const response = await fetch(`http://localhost:8000/tts`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text, speaker_id: speakerId, format: "wav" }),
				});
				if (!response.ok)
					throw new Error(`音声生成に失敗しました: ${response.status}`);
				const audioBlob = await response.blob();
				const audioUrl = URL.createObjectURL(audioBlob);

				// VRMWrapperがあればtext付きでplayAudio
				if (vrmWrapperRef?.current?.playAudio) {
					vrmWrapperRef.current.playAudio(audioUrl, text);
					const handleEnded = () => {
						URL.revokeObjectURL(audioUrl);
					};
					setTimeout(handleEnded, text.length * 200);
				} else {
					// 通常の音声再生（VRMがない場合）
					const newAudio = new Audio(audioUrl);
					setAudio(newAudio);
					newAudio.addEventListener("ended", () => {
						URL.revokeObjectURL(audioUrl);
					});
					await newAudio.play();
				}
			} catch (err) {
				setError(err instanceof Error ? err : new Error(String(err)));
			} finally {
				setIsLoading(false);
			}
		},
		[audio, vrmWrapperRef],
	);

	/**
	 * 再生中の音声を停止
	 */
	const stop = useCallback(() => {
		if (audio) {
			audio.pause();
			audio.currentTime = 0;
		}
	}, [audio]);

	return {
		speak,
		stop,
		isLoading,
		error,
	};
}
