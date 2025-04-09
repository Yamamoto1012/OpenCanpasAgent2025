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

				// 前回の音声があれば停止
				if (audio) {
					audio.pause();
					audio.currentTime = 0;
				}

				// バックエンドのURLを直接指定
				const response = await fetch(`http://localhost:8000/tts`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						text,
						speaker_id: speakerId,
						format: "wav",
					}),
				});

				if (!response.ok) {
					throw new Error(`音声生成に失敗しました: ${response.status}`);
				}

				// 音声データをBlobとして取得
				const audioBlob = await response.blob();
				// BlobからオブジェクトURLを作成
				const audioUrl = URL.createObjectURL(audioBlob);

				// VRMWrapperがあればリップシンクで再生
				if (vrmWrapperRef?.current?.playAudio) {
					vrmWrapperRef.current.playAudio(audioUrl);
					// リップシンク再生が完了したときにURLを破棄するためのイベントリスナー
					const handleEnded = () => {
						URL.revokeObjectURL(audioUrl);
					};
					// 時間経過後にクリーンアップ（推定再生時間後）
					setTimeout(handleEnded, text.length * 200);
				} else {
					// 通常の音声再生（VRMがない場合）
					const newAudio = new Audio(audioUrl);
					setAudio(newAudio);

					// 音声再生完了時にリソース解放
					newAudio.addEventListener("ended", () => {
						URL.revokeObjectURL(audioUrl);
					});

					// 音声再生
					await newAudio.play();
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err
						: new Error("音声生成中にエラーが発生しました"),
				);
				console.error("Text-to-Speech error:", err);
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
