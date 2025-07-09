import type { VRMWrapperHandle } from "@/features/VRM/VRMWrapper/VRMWrapper";
import { AudioMutexManager } from "@/lib/AudioMutexManager";
import {
	type AudioFormat,
	type TTSRequest,
	createAudioURL,
	estimateAudioDuration,
	requestTTS,
	revokeObjectURL,
} from "@/lib/utils/audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * 音声キューのアイテム
 */
export type AudioQueueItem = {
	id: string;
	text: string;
	audioURL?: string;
	isGenerating: boolean;
	isPlaying: boolean;
	error?: Error;
};

/**
 * ストリーミングTTSフックの設定オプション
 */
export type UseStreamingTTSOptions = {
	defaultSpeakerId?: number;
	defaultFormat?: AudioFormat;
	vrmWrapperRef?: React.RefObject<VRMWrapperHandle | null>;
	maxQueueSize?: number;
	splitPattern?: RegExp;
};

/**
 * ストリーミングTTSフックの状態
 */
export type StreamingTTSState = {
	isGenerating: boolean;
	isPlaying: boolean;
	currentQueueItem: AudioQueueItem | null;
	queue: AudioQueueItem[];
	error: Error | null;
	isStreamingStarted: boolean; // ストリーミングが開始されたかを示すフラグ
};

/**
 * ストリーミングTTSフックの返却値の型
 */
export interface UseStreamingTTSReturn {
	readonly state: StreamingTTSState;
	readonly addToQueue: (text: string) => void;
	readonly startStreaming: () => void;
	readonly stopStreaming: () => void;
	readonly clearQueue: () => void;
	readonly isReady: boolean;
}

/**
 * ストリーミング対応のテキスト音声合成フック
 * 部分的なテキストを順次音声化し、リアルタイムで再生する
 * @param options - ストリーミングTTSの設定オプション
 * @returns ストリーミングTTSの状態とアクションを提供するオブジェクト
 */
export const useStreamingTTS = (
	options: UseStreamingTTSOptions = {},
): UseStreamingTTSReturn => {
	const {
		defaultSpeakerId = 888753760,
		defaultFormat = "wav",
		vrmWrapperRef,
		maxQueueSize = 10,
		splitPattern = /[。！？\n]/,
	} = options;

	const { t } = useTranslation("voice");

	// 状態管理
	const [state, setState] = useState<StreamingTTSState>({
		isGenerating: false,
		isPlaying: false,
		currentQueueItem: null,
		queue: [],
		error: null,
		isStreamingStarted: false,
	});

	// 音声再生とストリーミング制御用のRef
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const isStreamingActiveRef = useRef<boolean>(false);
	const abortControllerRef = useRef<AbortController | null>(null);
	const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const stateRef = useRef<StreamingTTSState>(state);
	const generateAudioRef = useRef<typeof generateAudio | null>(null);
	const playAudioRef = useRef<typeof playAudio | null>(null);
	const processQueueRef = useRef<typeof processQueue | null>(null);
	const playNextItemRef = useRef<typeof playNextItem | null>(null);

	/**
	 * 状態を安全に更新する
	 */
	const updateState = useCallback((updates: Partial<StreamingTTSState>) => {
		setState((prev) => ({ ...prev, ...updates }));
	}, []);

	/**
	 * テキストを文に分割する
	 */
	const splitTextIntoSentences = useCallback(
		(text: string): string[] => {
			return text
				.split(splitPattern)
				.map((sentence) => sentence.trim())
				.filter((sentence) => sentence.length > 0);
		},
		[splitPattern],
	);

	/**
	 * キューに音声アイテムを追加する
	 */
	const addToQueue = useCallback(
		(text: string) => {
			if (!text.trim()) return;

			const sentences = splitTextIntoSentences(text);
			const newItems: AudioQueueItem[] = sentences.map((sentence) => ({
				id: `${Date.now()}-${Math.random()}`,
				text: sentence,
				isGenerating: false,
				isPlaying: false,
			}));

			setState((prev) => {
				const updatedQueue = [...prev.queue, ...newItems].slice(-maxQueueSize);
				return {
					...prev,
					queue: updatedQueue,
					isStreamingStarted: true, // キューにアイテムが追加された時点でストリーミング開始とみなす
				};
			});
		},
		[splitTextIntoSentences, maxQueueSize],
	);

	/**
	 * 音声生成を実行する（エラーハンドリング強化版）
	 */
	const generateAudio = useCallback(
		async (item: AudioQueueItem): Promise<AudioQueueItem> => {
			const maxRetries = 2;
			let retryCount = 0;

			while (retryCount <= maxRetries) {
				try {
					// AbortControllerを作成
					const controller = new AbortController();
					abortControllerRef.current = controller;

					// ネットワークタイムアウトを設定
					const timeoutId = setTimeout(() => {
						controller.abort();
					}, 10000); // 10秒でタイムアウト

					const ttsRequest: TTSRequest = {
						text: item.text,
						speakerId: defaultSpeakerId,
						format: defaultFormat,
					};

					const audioBuffer = await requestTTS(ttsRequest, t);
					const audioURL = createAudioURL(audioBuffer);

					clearTimeout(timeoutId);

					return {
						...item,
						audioURL,
						isGenerating: false,
					};
				} catch (error) {
					retryCount++;

					// AbortErrorの場合は再試行しない
					if (error instanceof Error && error.name === "AbortError") {
						return {
							...item,
							isGenerating: false,
							error: new Error("音声生成がキャンセルされました"),
						};
					}

					// 最大再試行回数に達した場合
					if (retryCount > maxRetries) {
						console.error(`音声生成エラー (テキスト: "${item.text}")`, error);
						return {
							...item,
							isGenerating: false,
							error:
								error instanceof Error ? error : new Error("音声生成エラー"),
						};
					}

					// 再試行前に少し待機
					await new Promise((resolve) =>
						setTimeout(resolve, 1000 * retryCount),
					);
				}
			}

			// ここには到達しないはずだが、型安全性のため
			return {
				...item,
				isGenerating: false,
				error: new Error("音声生成エラー"),
			};
		},
		[defaultSpeakerId, defaultFormat, t],
	);

	/**
	 * 音声を再生する
	 */
	const playAudio = useCallback(
		async (item: AudioQueueItem): Promise<void> => {
			if (!item.audioURL) {
				throw new Error("音声URLが設定されていません");
			}

			return new Promise((resolve, reject) => {
				// VRM経由での再生を優先
				if (vrmWrapperRef?.current?.playAudio && item.audioURL) {
					vrmWrapperRef.current.playAudio(item.audioURL, item.text);
					const estimatedDuration = estimateAudioDuration(item.text);
					setTimeout(resolve, estimatedDuration);
					return;
				}

				// 通常の音声再生
				const audio = new Audio(item.audioURL);
				audioRef.current = audio;

				audio.addEventListener("ended", () => {
					resolve();
				});

				audio.addEventListener("error", (event) => {
					const audioElement = event.target as HTMLAudioElement;
					reject(
						new Error(
							`音声再生エラー: ${audioElement.error?.message || "Unknown error"}`,
						),
					);
				});

				audio.play().catch(reject);
			});
		},
		[vrmWrapperRef],
	);

	/**
	 * キューを処理する（音声生成のみ）
	 */
	const processQueue = useCallback(() => {
		const currentState = stateRef.current;
		const nextItem = currentState.queue.find(
			(item) =>
				!item.isGenerating && !item.isPlaying && !item.audioURL && !item.error,
		);

		if (!nextItem || currentState.isGenerating) return;

		// 音声生成開始前にログ出力（デバッグ用）
		console.log("ストリーミング音声生成開始:", nextItem.text);

		// アイテムを生成中に設定
		setState((prev) => {
			const updatedQueue = prev.queue.map((item) =>
				item.id === nextItem.id ? { ...item, isGenerating: true } : item,
			);
			return {
				...prev,
				queue: updatedQueue,
				isGenerating: true,
			};
		});

		// 音声生成を非同期で実行
		if (generateAudioRef.current) {
			generateAudioRef
				.current(nextItem)
				.then((generatedItem) => {
					console.log("ストリーミング音声生成完了:", generatedItem.text);
					setState((prevState) => {
						const updatedQueue = prevState.queue.map((item) =>
							item.id === generatedItem.id ? generatedItem : item,
						);

						// 他に生成が必要なアイテムがあるかチェック
						const hasMoreToGenerate = updatedQueue.some(
							(item) => !item.isGenerating && !item.audioURL && !item.error,
						);

						return {
							...prevState,
							queue: updatedQueue,
							isGenerating: hasMoreToGenerate, // 次に生成すべきアイテムがある場合は生成状態を維持
						};
					});
				})
				.catch((error) => {
					console.error("ストリーミング音声生成エラー:", error);
					setState((prevState) => {
						const updatedQueue = prevState.queue.map((item) =>
							item.id === nextItem.id
								? {
										...item,
										isGenerating: false,
										error:
											error instanceof Error
												? error
												: new Error("音声生成エラー"),
									}
								: item,
						);
						return {
							...prevState,
							queue: updatedQueue,
							isGenerating: false,
							error:
								error instanceof Error ? error : new Error("音声生成エラー"),
						};
					});
				});
		}
	}, []);

	/**
	 * 次の音声アイテムを再生する（AudioMutexManager統合版）
	 */
	const playNextItem = useCallback(() => {
		const currentState = stateRef.current;
		const nextPlayableItem = currentState.queue.find(
			(item) => item.audioURL && !item.isPlaying && !item.error,
		);

		if (!nextPlayableItem || currentState.isPlaying) return;

		// 音声再生開始前にログ出力（デバッグ用）
		console.log("ストリーミング音声再生開始:", nextPlayableItem.text);

		// アイテムを再生中に設定（より早期に状態を更新）
		setState((prev) => ({
			...prev,
			isPlaying: true,
			currentQueueItem: nextPlayableItem,
			queue: prev.queue.map((item) =>
				item.id === nextPlayableItem.id ? { ...item, isPlaying: true } : item,
			),
		}));

		// AudioMutexManagerの排他制御を使用して音声を再生
		const audioMutex = AudioMutexManager.getInstance();
		audioMutex
			.playAudio("streaming", "streaming-tts", async () => {
				if (playAudioRef.current) {
					await playAudioRef.current(nextPlayableItem);
				}
			})
			.then(() => {
				console.log("ストリーミング音声再生完了:", nextPlayableItem.text);
				setState((finalState) => {
					// 次に再生可能なアイテムがあるかチェック
					const remainingQueue = finalState.queue.filter(
						(item) => item.id !== nextPlayableItem.id,
					);
					const hasMorePlayable = remainingQueue.some(
						(item) => item.audioURL && !item.error,
					);

					return {
						...finalState,
						queue: remainingQueue,
						isPlaying: hasMorePlayable, // 次に再生可能なアイテムがある場合はisPlayingを維持
						currentQueueItem: hasMorePlayable
							? finalState.currentQueueItem
							: null,
					};
				});
			})
			.catch((error) => {
				console.error("ストリーミング音声再生エラー:", error);
				setState((finalState) => ({
					...finalState,
					queue: finalState.queue.filter(
						(item) => item.id !== nextPlayableItem.id,
					),
					isPlaying: false,
					currentQueueItem: null,
					error: error instanceof Error ? error : new Error("音声再生エラー"),
				}));
			});
	}, []);

	/**
	 * ストリーミング処理を開始する
	 */
	const startStreaming = useCallback(() => {
		if (isStreamingActiveRef.current) return;

		isStreamingActiveRef.current = true;
		updateState({ error: null });

		// 定期的にキューを処理
		processingIntervalRef.current = setInterval(() => {
			if (isStreamingActiveRef.current) {
				// 現在の状態をチェックして必要な処理を実行
				const currentState = stateRef.current;

				// 音声生成が必要な場合のみprocessQueueを実行
				const needsGeneration = currentState.queue.some(
					(item) => !item.isGenerating && !item.audioURL && !item.error,
				);
				if (
					needsGeneration &&
					!currentState.isGenerating &&
					processQueueRef.current
				) {
					processQueueRef.current();
				}

				// 再生可能なアイテムがある場合のみplayNextItemを実行
				const canPlay = currentState.queue.some(
					(item) => item.audioURL && !item.isPlaying && !item.error,
				);
				if (canPlay && !currentState.isPlaying && playNextItemRef.current) {
					playNextItemRef.current();
				}
			}
		}, 300); // 300ms間隔でチェック（より頻繁に）
	}, [updateState]);

	/**
	 * ストリーミング処理を停止する
	 */
	const stopStreaming = useCallback(() => {
		console.log("ストリーミング音声停止処理開始");

		isStreamingActiveRef.current = false;

		// 処理間隔をクリア
		if (processingIntervalRef.current) {
			clearInterval(processingIntervalRef.current);
			processingIntervalRef.current = null;
		}

		// 進行中の音声生成をキャンセル
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}

		// 現在の音声再生を停止
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current = null;
		}

		// より確実な状態リセット
		updateState({
			isGenerating: false,
			isPlaying: false,
			currentQueueItem: null,
			isStreamingStarted: false,
			error: null, // エラー状態もリセット
		});

		console.log("ストリーミング音声停止処理完了");
	}, [updateState]);

	/**
	 * キューをクリアする
	 */
	const clearQueue = useCallback(() => {
		// 生成済み音声URLを解放
		for (const item of stateRef.current.queue) {
			if (item.audioURL) {
				revokeObjectURL(item.audioURL);
			}
		}

		updateState({
			queue: [],
			currentQueueItem: null,
			isStreamingStarted: false,
		});
	}, [updateState]);

	// stateRefを最新のstateで更新
	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	// 関数refを最新の関数で更新
	useEffect(() => {
		generateAudioRef.current = generateAudio;
		playAudioRef.current = playAudio;
		processQueueRef.current = processQueue;
		playNextItemRef.current = playNextItem;
	}, [generateAudio, playAudio, processQueue, playNextItem]);

	// クリーンアップ
	useEffect(() => {
		return () => {
			// ストリーミング停止処理を直接実装
			isStreamingActiveRef.current = false;

			// 処理間隔をクリア
			if (processingIntervalRef.current) {
				clearInterval(processingIntervalRef.current);
				processingIntervalRef.current = null;
			}

			// 進行中の音声生成をキャンセル
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
				abortControllerRef.current = null;
			}

			// 現在の音声再生を停止
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}

			// 生成済み音声URLを解放
			const currentQueue = stateRef.current.queue;
			for (const item of currentQueue) {
				if (item.audioURL) {
					revokeObjectURL(item.audioURL);
				}
			}
		};
	}, []); // 依存配列を空にして循環参照を回避

	return {
		state,
		addToQueue,
		startStreaming,
		stopStreaming,
		clearQueue,
		isReady: true,
	};
};
