import { useState, useRef, useCallback, useEffect } from "react";
import type { VRMWrapperHandle } from "../VRMWrapper/VRMWrapper";

/**
 * AudioContext(Web Audio API)の状態を表す型
 */
export type AudioState = {
	readonly isInitialized: boolean;
	readonly context: AudioContext | null;
	readonly contextState: AudioContextState | null;
	readonly error: Error | null;
};

/**
 * AudioContextのアクション群の型
 */
export type AudioActions = {
	readonly initialize: () => Promise<AudioContext>;
	readonly resume: () => Promise<void>;
	readonly suspend: () => Promise<void>;
	readonly close: () => Promise<void>;
	readonly playAudio: (audioUrl: string, text?: string) => void;
};

/**
 * useAudioContextの返却値の型
 */
export type UseAudioContextReturn = {
	readonly state: AudioState;
	readonly actions: AudioActions;
	readonly vrmWrapperRef: React.RefObject<VRMWrapperHandle | null>;
	readonly isReady: boolean;
};

/**
 * AudioContextの初期化オプション
 */
export type AudioContextOptions = {
	sampleRate?: number;
	latencyHint?: AudioContextLatencyCategory;
	autoInitialize?: boolean;
};

/**
 * AudioContextの初期化と音声再生を管理するカスタムフック（
 * @param options - AudioContextの初期化オプション
 * @returns AudioContextの状態とアクションを提供するオブジェクト
 */
export const useAudioContext = (
	options: AudioContextOptions = {},
): UseAudioContextReturn => {
	const {
		sampleRate,
		latencyHint = "interactive",
		autoInitialize = true,
	} = options;

	// 状態管理
	const [state, setState] = useState<AudioState>({
		isInitialized: false,
		context: null,
		contextState: null,
		error: null,
	});

	const audioContextRef = useRef<AudioContext | null>(null);
	const vrmWrapperRef = useRef<VRMWrapperHandle | null>(null);
	const hasUserInteracted = useRef<boolean>(false);

	/**
	 * 状態を安全に更新する
	 * @param updates - 更新する状態の部分的なオブジェクト
	 * @returns 更新された状態
	 */
	const updateState = useCallback((updates: Partial<AudioState>) => {
		setState((prev) => ({ ...prev, ...updates }));
	}, []);

	/**
	 * AudioContextを初期化する
	 */
	const initialize = useCallback(async (): Promise<AudioContext> => {
		// すでに初期化済みならそのまま返す
		if (audioContextRef.current && audioContextRef.current.state !== "closed") {
			return audioContextRef.current;
		}

		try {
			const contextOptions: AudioContextOptions = {};

			if (sampleRate) {
				contextOptions.sampleRate = sampleRate;
			}

			if (latencyHint) {
				contextOptions.latencyHint = latencyHint;
			}

			// AudioContextを新規作成
			const audioCtx = new AudioContext(contextOptions);
			audioContextRef.current = audioCtx;

			// 状態変更イベントリスナーを設定
			const handleStateChange = () => {
				updateState({
					contextState: audioCtx.state,
					isInitialized: audioCtx.state === "running",
				});
			};

			// 状態が変わった時に、状態を更新するリスナーを登録
			audioCtx.addEventListener("statechange", handleStateChange);

			updateState({
				context: audioCtx,
				contextState: audioCtx.state,
				isInitialized: audioCtx.state === "running",
				error: null,
			});

			// ユーザーインタラクションが必要な場合は自動でレジューム
			if (audioCtx.state === "suspended" && hasUserInteracted.current) {
				await audioCtx.resume();
			}

			return audioCtx;
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			updateState({ error: err });
			throw err;
		}
	}, [sampleRate, latencyHint, updateState]);

	/**
	 * AudioContextをレジューム(再開)する
	 */
	const resume = useCallback(async (): Promise<void> => {
		if (
			audioContextRef.current &&
			audioContextRef.current.state === "suspended"
		) {
			try {
				await audioContextRef.current.resume();
				updateState({
					isInitialized: true,
					contextState: audioContextRef.current.state,
					error: null,
				});
			} catch (error) {
				const err = error instanceof Error ? error : new Error(String(error));
				updateState({ error: err });
				throw err;
			}
		}
	}, [updateState]);

	/**
	 * AudioContextをサスペンド(一時停止)する
	 */
	const suspend = useCallback(async (): Promise<void> => {
		if (
			audioContextRef.current &&
			audioContextRef.current.state === "running"
		) {
			try {
				await audioContextRef.current.suspend();
				updateState({
					isInitialized: false,
					contextState: audioContextRef.current.state,
				});
			} catch (error) {
				const err = error instanceof Error ? error : new Error(String(error));
				updateState({ error: err });
				throw err;
			}
		}
	}, [updateState]);

	/**
	 * AudioContextを閉じる
	 */
	const close = useCallback(async (): Promise<void> => {
		if (audioContextRef.current && audioContextRef.current.state !== "closed") {
			try {
				await audioContextRef.current.close();
				audioContextRef.current = null;
				updateState({
					context: null,
					isInitialized: false,
					contextState: "closed",
				});
			} catch (error) {
				const err = error instanceof Error ? error : new Error(String(error));
				updateState({ error: err });
				throw err;
			}
		}
	}, [updateState]);

	/**
	 * 音声を再生する（
	 * @param audioUrl - 再生する音声のURL
	 * @param text - 音声に関連付けるテキスト（オプション）
	 */
	const playAudio = useCallback(
		(audioUrl: string, text?: string) => {
			if (!vrmWrapperRef.current?.playAudio) {
				console.warn("VRM playAudio機能が利用できません");
				return;
			}

			// AudioContextが未初期化の場合は初期化を試行
			if (!state.isInitialized) {
				initialize()
					.then(() => {
						// 初期化完了後に少し待ってから再生
						setTimeout(() => {
							// VRMモデルの方に音声再生を委譲
							if (vrmWrapperRef.current?.playAudio) {
								vrmWrapperRef.current.playAudio(audioUrl, text);
							}
						}, 100);
					})
					.catch((error) => {
						console.error("AudioContext初期化に失敗:", error);
					});
			} else {
				vrmWrapperRef.current.playAudio(audioUrl, text);
			}
		},
		[state.isInitialized, initialize],
	);

	/**
	 * ユーザーインタラクションハンドラー
	 * ユーザーが何らかの操作を行ったことを検出し、必要に応じてAudioContextを初期化する
	 */
	const handleUserInteraction = useCallback(() => {
		hasUserInteracted.current = true;

		if (autoInitialize) {
			initialize().catch((error) => {
				console.error("自動初期化に失敗:", error);
			});
		}
	}, [autoInitialize, initialize]);

	// 自動初期化とユーザーインタラクション検出の設定
	useEffect(() => {
		if (autoInitialize) {
			const events = ["click", "touchstart", "keydown"] as const;

			const handleInteraction = () => {
				handleUserInteraction();
				// 一度だけ実行したらリスナーを削除
				for (const event of events) {
					document.removeEventListener(event, handleInteraction);
				}
			};

			for (const event of events) {
				document.addEventListener(event, handleInteraction, { once: true });
			}

			return () => {
				for (const event of events) {
					document.removeEventListener(event, handleInteraction);
				}
			};
		}
	}, [autoInitialize, handleUserInteraction]);

	// コンポーネントアンマウント時のクリーンアップ
	useEffect(() => {
		return () => {
			if (
				audioContextRef.current &&
				audioContextRef.current.state !== "closed"
			) {
				audioContextRef.current.close().catch(console.error);
			}
		};
	}, []);

	// アクションオブジェクト
	const actions: AudioActions = {
		initialize,
		resume,
		suspend,
		close,
		playAudio,
	};

	return {
		state,
		actions,
		vrmWrapperRef,
		isReady: state.isInitialized && !state.error,
	} as const;
};
