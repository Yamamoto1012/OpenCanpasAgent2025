import { useEffect, useRef, useState } from "react";
import type { VRM } from "@pixiv/three-vrm";
import { LipSync } from "../LipSync/lipSync";
import type { LipSyncAnalyzeResult } from "../LipSync/types";
import { safeSetExpression } from "../VRMExpression/safeSetExpression";

/**
 * VRMモデルのリップシンク制御を行うフック
 */
export const useLipSync = (vrm: VRM | null, isMuted: boolean) => {
	const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
	const lipSyncRef = useRef<LipSync | null>(null);
	const [lipSyncResult, setLipSyncResult] = useState<LipSyncAnalyzeResult>({
		volume: 0,
	});
	const frameRef = useRef<number | null>(null);

	// AudioContextの初期化
	useEffect(() => {
		const initializeAudioContext = () => {
			if (!audioContext) {
				const newAudioContext = new AudioContext();
				setAudioContext(newAudioContext);
				lipSyncRef.current = new LipSync(newAudioContext);
			}
		};

		// ページ内のクリックやタッチでAudioContextを初期化する
		const handleUserInteraction = () => {
			initializeAudioContext();

			window.removeEventListener("click", handleUserInteraction);
			window.removeEventListener("touchstart", handleUserInteraction);
		};

		window.addEventListener("click", handleUserInteraction);
		window.addEventListener("touchstart", handleUserInteraction);

		return () => {
			window.removeEventListener("click", handleUserInteraction);
			window.removeEventListener("touchstart", handleUserInteraction);
			if (frameRef.current) {
				cancelAnimationFrame(frameRef.current);
			}
			// AudioContextがあれば閉じる
			if (audioContext) {
				audioContext.close();
			}
		};
	}, [audioContext]);

	// アニメーションフレームでリップシンク更新
	useEffect(() => {
		if (!lipSyncRef.current || isMuted) {
			return;
		}

		// リップシンク更新用フレーム処理関数
		const updateLipSyncFrame = () => {
			if (!lipSyncRef.current || isMuted) {
				return;
			}

			const result = lipSyncRef.current.update();
			setLipSyncResult(result);

			// VRMモデルのタイプを確認してリップシンクを適用
			if (vrm && result.volume > 0.01) {
				// 表情をすべてリセット（口以外）
				// biome-ignore lint/complexity/noForEach: <explanation>
				["sad", "angry", "surprised"].forEach((exp) => {
					safeSetExpression(vrm, exp, 0);
				});

				// VRM1.0モデル
				if (vrm.expressionManager) {
					try {
						// 音量に応じて複数の口関連表情を組み合わせる
						const volume = Math.min(result.volume * 5, 1.0);

						// 口関連の表情をすべてリセット
						// biome-ignore lint/complexity/noForEach: <explanation>
						["aa", "ee", "ih", "oh", "ou"].forEach((exp) => {
							safeSetExpression(vrm, exp, 0);
						});

						// 音量レベルに応じて異なる表情の組み合わせを使用
						if (volume > 0.7) {
							// 大きな音量 - 大きく口を開ける「あ」の形
							safeSetExpression(vrm, "aa", volume);
						} else if (volume > 0.4) {
							// 中程度の音量 - 「お」と「あ」の混合
							safeSetExpression(vrm, "aa", volume * 0.7);
							safeSetExpression(vrm, "oh", volume * 0.3);
						} else if (volume > 0.1) {
							// 小さな音量 - 小さく「い」か「う」
							safeSetExpression(vrm, "ih", volume * 0.8);
							safeSetExpression(vrm, "ou", volume * 0.2);
						}

						if (volume > 0.1) {
							console.log(`リップシンク: 音量=${volume.toFixed(2)}`);
						}
					} catch (e) {
						console.error("リップシンクエラー:", e);
					}
				}
			} else {
				// 音量が小さい場合、口を閉じる
				if (vrm) {
					safeSetExpression(vrm, "a", 0);
					safeSetExpression(vrm, "aa", 0);
					safeSetExpression(vrm, "oh", 0);
				}
			}

			// 次のフレームで再度実行
			frameRef.current = requestAnimationFrame(updateLipSyncFrame);
		};

		// 初回実行
		frameRef.current = requestAnimationFrame(updateLipSyncFrame);

		return () => {
			if (frameRef.current) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, [isMuted, vrm]);

	/**
	 * リップシンク処理の更新
	 */
	const updateLipSync = () => {
		if (!lipSyncRef.current || isMuted) {
			// ミュート時はボリュームを0に設定
			setLipSyncResult({ volume: 0 });
			return;
		}

		const result = lipSyncRef.current.update();
		setLipSyncResult(result);

		// リップシンクの結果を表情に反映
		if (vrm) {
			safeSetExpression(vrm, "aa", result.volume); // "a"の口の形をボリュームに合わせる
		}
	};

	/**
	 * 音声再生関数
	 */
	const playAudio = async (url: string, onEnded?: () => void) => {
		if (!lipSyncRef.current || isMuted) {
			if (onEnded) onEnded();
			return;
		}

		try {
			await lipSyncRef.current.playFromURL(url, onEnded);
		} catch (error) {
			console.error("音声再生に失敗しました", error);
			// エラー時もコールバック実行
			if (onEnded) onEnded();
		}
	};

	return {
		updateLipSync,
		playAudio,
		isAudioInitialized: !!audioContext,
		lipSyncResult,
	};
};
