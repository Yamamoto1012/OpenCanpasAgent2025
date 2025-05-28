import { useState, useCallback, useRef, useEffect } from "react";
import type { VRMWrapperHandle } from "@/features/VRM/VRMWrapper/VRMWrapper";
import {
	requestTTS,
	createAudioURL,
	revokeObjectURL,
	estimateAudioDuration,
	type TTSRequest,
	type AudioFormat,
} from "@/lib/utils/audio";

/**
 * TTS フックの設定オプション
 */
export type UseTTSOptions = {
	defaultSpeakerId?: number;
	defaultFormat?: AudioFormat;
	vrmWrapperRef?: React.RefObject<VRMWrapperHandle | null>;
};

/**
 * TTS フックの状態
 */
export type TTSState = {
	isLoading: boolean;
	error: Error | null;
	isPlaying: boolean;
	currentText: string | null;
};

/**
 * TTS フックの返却値の型
 */
export interface UseTTSReturn {
	readonly state: TTSState;
	readonly speak: (text: string, speakerId?: number) => Promise<void>;
	readonly stop: () => void;
	readonly isReady: boolean;
}

/**
 * テキスト音声合成（TTS）を扱うためのカスタムフック（
 * 副作用を分離し、適切なエラーハンドリングとクリーンアップを実装
 * @param options - TTSの設定オプション
 * @returns TTSの状態とアクションを提供するオブジェクト
 */
export const useTextToSpeech = (options: UseTTSOptions = {}): UseTTSReturn => {
	const {
		defaultSpeakerId = 888753760,
		defaultFormat = "wav",
		vrmWrapperRef,
	} = options;

	// 状態管理
	const [state, setState] = useState<TTSState>({
		isLoading: false,
		error: null,
		isPlaying: false,
		currentText: null,
	});

	// 現在再生中の音声とURLを管理
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const currentURLRef = useRef<string | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	/**
	 * 状態を安全に更新する
	 * @param updates - 更新内容
	 */
	const updateState = useCallback((updates: Partial<TTSState>) => {
		setState((prev) => ({ ...prev, ...updates }));
	}, []);

	/**
	 * リソースのクリーンアップを行う
	 */
	const cleanup = useCallback(() => {
		// 音声停止
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.removeEventListener("ended", handleAudioEnded);
			audioRef.current.removeEventListener("error", handleAudioError);
			audioRef.current = null;
		}

		// URL解放
		if (currentURLRef.current) {
			revokeObjectURL(currentURLRef.current);
			currentURLRef.current = null;
		}

		// 通信キャンセル
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}

		updateState({ isPlaying: false, currentText: null });
	}, [updateState]);

	/**
	 * 音声再生終了時のハンドラ
	 */
	const handleAudioEnded = useCallback(() => {
		cleanup();
	}, [cleanup]);

	/**
	 * 音声エラー時のハンドラ
	 * @param event - エラーイベント
	 */
	const handleAudioError = useCallback(
		(event: Event) => {
			const audio = event.target as HTMLAudioElement;
			const error = new Error(
				`音声再生エラー: ${audio.error?.message || "Unknown error"}`,
			);
			updateState({ error, isLoading: false });
			cleanup();
		},
		[cleanup, updateState],
	);

	/**
	 * VRM経由での音声再生
	 * @param audioURL - 音声ファイルのURL
	 * @param text - 音声化するテキスト
	 */
	const playWithVRM = useCallback(
		(audioURL: string, text: string) => {
			if (!vrmWrapperRef?.current?.playAudio) {
				throw new Error("VRM playAudio機能が利用できません");
			}

			vrmWrapperRef.current.playAudio(audioURL, text);

			// VRM再生完了の推定時間後にクリーンアップ
			const estimatedDuration = estimateAudioDuration(text);
			setTimeout(() => {
				cleanup();
			}, estimatedDuration);
		},
		[vrmWrapperRef, cleanup],
	);

	/**
	 * 通常の音声再生
	 * @param audioURL - 音声ファイルのURL
	 */
	const playWithAudio = useCallback(
		(audioURL: string) => {
			const audio = new Audio(audioURL);

			audio.addEventListener("ended", handleAudioEnded);
			audio.addEventListener("error", handleAudioError);

			audioRef.current = audio;

			return audio.play();
		},
		[handleAudioEnded, handleAudioError],
	);

	/**
	 * テキストを音声に変換して再生する
	 * @param text - 音声化するテキスト
	 * @param speakerId - 使用するスピーカーのID（デフォルトは888753760）
	 * @returns 再生のPromise
	 */
	const speak = useCallback(
		async (
			text: string,
			speakerId: number = defaultSpeakerId,
		): Promise<void> => {
			if (!text.trim()) {
				updateState({ error: new Error("テキストが入力されていません") });
				return;
			}

			// 既存の再生を停止
			cleanup();

			try {
				updateState({
					isLoading: true,
					error: null,
					currentText: text.trim(),
				});

				// AbortControllerを作成
				abortControllerRef.current = new AbortController();

				// TTS リクエスト
				const ttsRequest: TTSRequest = {
					text: text.trim(),
					speakerId,
					format: defaultFormat,
				};

				const audioBlob = await requestTTS(ttsRequest);

				// キャンセルされていないかチェック
				if (abortControllerRef.current?.signal.aborted) {
					return;
				}

				const audioURL = createAudioURL(audioBlob);
				currentURLRef.current = audioURL;

				updateState({ isLoading: false, isPlaying: true });

				// VRMまたは通常の音声再生
				if (vrmWrapperRef?.current?.playAudio) {
					playWithVRM(audioURL, text.trim());
				} else {
					await playWithAudio(audioURL);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error : new Error(String(error));
				updateState({
					error: errorMessage,
					isLoading: false,
					isPlaying: false,
					currentText: null,
				});
				cleanup();
			}
		},
		[
			defaultSpeakerId,
			defaultFormat,
			updateState,
			cleanup,
			playWithVRM,
			playWithAudio,
			vrmWrapperRef,
		],
	);

	/**
	 * 再生中の音声を停止
	 */
	const stop = useCallback(() => {
		cleanup();
		updateState({ error: null });
	}, [cleanup, updateState]);

	// コンポーネントアンマウント時のクリーンアップ
	useEffect(() => {
		return () => {
			cleanup();
		};
	}, [cleanup]);

	return {
		state,
		speak,
		stop,
		isReady: !state.isLoading && !state.error,
	} as const;
};
