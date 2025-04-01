import type { VRM } from "@pixiv/three-vrm";
import { useEffect, useRef, useState } from "react";
import { LipSync } from "../LipSync/lipSync";
import type { LipSyncAnalyzeResult } from "../LipSync/types";

type ExpressionPreset =
	| "neutral"
	| "happy"
	| "sad"
	| "angry"
	| "surprised"
	| "relaxed";

type VRM0BlendShapeProxy = {
	setValue: (presetIndex: number, weight: number) => void;
	getValue?: (presetIndex: number) => number;
};

/**
 * VRMモデルに自然な表情や動きを追加するためのフック
 */
export const useVRMExpression = (vrm: VRM | null, isMuted: boolean) => {
	// 瞬きのタイマー参照
	const blinkTimerRef = useRef<number | null>(null);
	// 瞬きの状態
	const blinkStateRef = useRef<"open" | "closing" | "opening">("open");
	// 次の瞬きまでの時間
	const nextBlinkTimeRef = useRef<number>(getRandomBlinkInterval());
	// 現在の経過時間
	const timeCounterRef = useRef<number>(0);

	// 呼吸の位相（0〜2π）
	const breathPhaseRef = useRef<number>(0);
	// 最初のデバッグ出力フラグ
	const debugLoggedRef = useRef<boolean>(false);

	// リップシンク関連の状態と参照
	const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
	const lipSyncRef = useRef<LipSync | null>(null);
	const [lipSyncResult, setLipSyncResult] = useState<LipSyncAnalyzeResult>({
		volume: 0,
	});
	const frameRef = useRef<number | null>(null);

	// 現在の表情プリセットと強度
	const currentExpressionRef = useRef<{
		preset: ExpressionPreset;
		weight: number;
	}>({
		preset: "neutral",
		weight: 0,
	});

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

			// デバッグ出力 - 音量が検出されているかを確認
			if (result.volume > 0.01) {
				console.log(`リップシンク音量: ${result.volume.toFixed(2)}`);

				// VRMモデルのタイプを確認してリップシンクを適用
				if (vrm) {
					// 表情をすべてリセット（口以外）
					// biome-ignore lint/complexity/noForEach: <explanation>
					["sad", "angry", "surprised"].forEach((exp) => {
						safeSetExpression(exp, 0);
					});

					// VRM0.0モデル（BlendShapeProxy経由で適用）
					if ("blendShapeProxy" in vrm) {
						try {
							// 明示的な型アサーション
							const proxy =
								vrm.blendShapeProxy as unknown as VRM0BlendShapeProxy;

							if (proxy) {
								// 音量に応じて「あ」の口の形を設定（最大5倍に増幅）
								proxy.setValue(1, Math.min(result.volume * 5, 1.0));
								console.log(
									`VRM0.0リップシンク: ${Math.min(result.volume * 5, 1.0)}`,
								);
							}
						} catch (e) {
							console.error("VRM0.0リップシンクエラー", e);
						}
					}
					// VRM1.0モデル
					else if (vrm.expressionManager) {
						try {
							// 音量に応じて複数の口関連表情を組み合わせる
							const volume = Math.min(result.volume * 5, 1.0);

							// 口関連の表情をすべてリセット
							// biome-ignore lint/complexity/noForEach: <explanation>
							["aa", "ee", "ih", "oh", "ou"].forEach((exp) => {
								safeSetExpression(exp, 0);
							});

							// 音量レベルに応じて異なる表情の組み合わせを使用
							if (volume > 0.7) {
								// 大きな音量 - 大きく口を開ける「あ」の形
								safeSetExpression("aa", volume);
							} else if (volume > 0.4) {
								// 中程度の音量 - 「お」と「あ」の混合
								safeSetExpression("aa", volume * 0.7);
								safeSetExpression("oh", volume * 0.3);
							} else if (volume > 0.1) {
								// 小さな音量 - 小さく「い」か「う」
								safeSetExpression("ih", volume * 0.8);
								safeSetExpression("ou", volume * 0.2);
							}

							if (volume > 0.1) {
								console.log(`リップシンク: 音量=${volume.toFixed(2)}`);
							}
						} catch (e) {
							console.error("リップシンクエラー:", e);
						}
					}
				}
			} else {
				// 音量が小さい場合、口を閉じる
				safeSetExpression("a", 0);
				safeSetExpression("aa", 0);
				safeSetExpression("oh", 0);
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

	// 音声再生関数
	const playAudio = async (url: string, onEnded?: () => void) => {
		if (!lipSyncRef.current || isMuted) return;

		try {
			await lipSyncRef.current.playFromURL(url, onEnded);
		} catch (error) {
			console.error("音声再生に失敗しました", error);
			// エラー時もコールバック実行
			if (onEnded) onEnded();
		}
	};

	/**
	 * 表情プリセットを設定する
	 * @param preset 表情プリセット名
	 * @param weight 強度（0.0～1.0）
	 */
	const setExpression = (preset: ExpressionPreset, weight = 0.7) => {
		if (!vrm) return;

		// 笑顔を設定する前に一旦すべての表情をリセット
		// biome-ignore lint/complexity/noForEach: <explanation>
		["neutral", "happy", "sad", "angry", "surprised", "relaxed"].forEach(
			(exp) => {
				safeSetExpression(exp, 0);
			},
		);

		// 指定された表情を設定
		safeSetExpression(preset, weight);

		// 表情状態を更新
		currentExpressionRef.current = { preset, weight };

		// デバッグ出力
		console.log(`表情を設定: ${preset}, 強度: ${weight}`);
	};

	/**
	 * モーションに合わせた表情を設定する
	 * @param motionName モーションファイル名（パスを含む）
	 */
	const setExpressionForMotion = (motionName: string) => {
		// モーション名から適切な表情を選択
		if (motionName.includes("VRMA_01") || motionName.includes("Walking")) {
			// 通常の動き - 軽い笑顔
			setExpression("happy", 0.2);
		} else if (motionName.includes("VRMA_02")) {
			// 静止状態 - リラックス
			setExpression("relaxed", 0.3);
		} else if (motionName.includes("VRMA_02")) {
			// 会話状態 - より明るい笑顔
			setExpression("happy", 0.8);
		} else if (motionName.includes("VRMA_02")) {
			// 驚き
			setExpression("surprised", 0.8);
		} else {
			// デフォルト - 軽い笑顔
			setExpression("happy", 0.3);
		}
	};

	/**
	 * ランダムな瞬きの間隔を取得（2〜6秒）
	 */
	function getRandomBlinkInterval(): number {
		// 2〜6秒のランダムな間隔
		return 2000 + Math.random() * 4000;
	}

	/**
	 * 表情の値を安全に設定する（モデルの互換性を考慮）
	 */
	const safeSetExpression = (
		expressionName: string,
		value: number,
	): boolean => {
		if (!vrm) return false;

		// VRM1.0 モデルの場合
		if (vrm.expressionManager) {
			try {
				const expressionManager = vrm.expressionManager as {
					getValue: (name: string) => number | undefined;
					setValue: (name: string, value: number) => void;
				};

				// 指定された表情が存在するか確認
				if (
					typeof expressionManager.getValue === "function" &&
					expressionManager.getValue(expressionName) !== undefined
				) {
					expressionManager.setValue(expressionName, value);
					return true;
				}
			} catch (error) {
				// エラーは無視
				return false;
			}
		}
		// VRM0.0 モデルの場合
		else if ("blendShapeProxy" in vrm) {
			try {
				// @ts-ignore - VRM0.0の型定義
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const proxy = (vrm as any).blendShapeProxy as {
					setValue: (presetIndex: number, weight: number) => void;
				};

				// 表情名から対応するVRM0.0のプリセットインデックスを取得
				let presetIndex: number | null = null;

				switch (expressionName) {
					case "blink":
					case "blinkLeft":
					case "blinkRight":
						presetIndex = 0; // "まばたき"
						break;
					case "aa":
					case "a":
						presetIndex = 1; // "あ"
						break;
					case "ih":
					case "i":
						presetIndex = 2; // "い"
						break;
					case "ou":
					case "u":
						presetIndex = 3; // "う"
						break;
					case "ee":
					case "e":
						presetIndex = 4; // "え"
						break;
					case "oh":
					case "o":
						presetIndex = 5; // "お"
						break;
					case "happy":
						presetIndex = 6; // "喜び"
						break;
					case "angry":
						presetIndex = 7; // "怒り"
						break;
					case "sad":
						presetIndex = 8; // "悲しみ"
						break;
				}

				if (
					presetIndex !== null &&
					proxy &&
					typeof proxy.setValue === "function"
				) {
					proxy.setValue(presetIndex, value);
					return true;
				}
			} catch (error) {
				// エラーは無視
				return false;
			}
		}

		return false;
	};

	/**
	 * 表情デバッグ情報の出力（初回のみ）
	 */
	const debugExpressions = () => {
		if (debugLoggedRef.current || !vrm) return;

		console.log("VRMモデル読み込み完了");

		// VRM1.0 の表情
		if (vrm.expressionManager) {
			console.log("利用可能な表情一覧 (VRM1.0):");
			try {
				// VRM1.0の表情リストを列挙
				const expressions = vrm.expressionManager;
				const presetNames = [
					"neutral",
					"happy",
					"angry",
					"sad",
					"relaxed",
					"surprised",
					"aa",
					"ih",
					"ou",
					"ee",
					"oh",
					"a",
					"i",
					"u",
					"e",
					"o",
					"blink",
					"blinkLeft",
					"blinkRight",
					"lookUp",
					"lookDown",
					"lookLeft",
					"lookRight",
				];

				const availableExpressions: string[] = [];

				// biome-ignore lint/complexity/noForEach: <explanation>
				presetNames.forEach((name) => {
					try {
						if (expressions.getValue(name) !== undefined) {
							availableExpressions.push(name);
						}
					} catch (e) {
						// エラーは無視
					}
				});

				if (availableExpressions.length > 0) {
					// biome-ignore lint/complexity/noForEach: <explanation>
					availableExpressions.forEach((name) => {
						console.log(`- ${name}`);
					});
				} else {
					console.log("利用可能な表情が見つかりません");
				}
			} catch (error) {
				console.error("表情情報の取得に失敗:", error);
			}
		}
		// VRM0.0 の表情
		else if ("blendShapeProxy" in vrm) {
			console.log("利用可能な表情一覧 (VRM0.0):");
			try {
				// @ts-ignore - VRM0.0 の型定義
				const proxy = vrm.blendShapeProxy;
				if (proxy) {
					// VRM0.0 のブレンドシェイプ
					const presetNames = [
						"まばたき",
						"あ",
						"い",
						"う",
						"え",
						"お",
						"喜び",
						"怒り",
						"悲しみ",
					];
					presetNames.forEach((name, index) => {
						console.log(`- ${index}: ${name}`);
					});
				}
			} catch (error) {
				console.error("表情情報の取得に失敗:", error);
			}
		}

		debugLoggedRef.current = true;
	};

	/**
	 * 瞬き処理の更新
	 * @param deltaTime 前フレームからの経過時間（秒）
	 */
	const updateBlink = (deltaTime: number) => {
		if (!vrm) return;

		const deltaMs = deltaTime * 1000; // ミリ秒に変換
		timeCounterRef.current += deltaMs;

		// 瞬きの状態に応じた処理
		if (blinkStateRef.current === "open") {
			// 開いた状態で、次の瞬きの時間に達したら閉じ始める
			if (timeCounterRef.current >= nextBlinkTimeRef.current) {
				blinkStateRef.current = "closing";
				timeCounterRef.current = 0;
			}
		} else if (blinkStateRef.current === "closing") {
			// 閉じる過程（100ms）
			const blinkValue = Math.min(timeCounterRef.current / 100, 1);

			// 両目まばたき
			const blinkSuccess = safeSetExpression("blink", blinkValue);

			// 両目まばたきがサポートされていなければ左右個別に試す
			if (!blinkSuccess) {
				safeSetExpression("blinkLeft", blinkValue);
				safeSetExpression("blinkRight", blinkValue);
			}

			if (timeCounterRef.current >= 100) {
				blinkStateRef.current = "opening";
				timeCounterRef.current = 0;
			}
		} else if (blinkStateRef.current === "opening") {
			// 開く過程（150ms）
			const blinkValue = Math.max(1 - timeCounterRef.current / 150, 0);

			// 両目まばたき
			const blinkSuccess = safeSetExpression("blink", blinkValue);

			// 両目まばたきがサポートされていなければ左右個別に試す
			if (!blinkSuccess) {
				safeSetExpression("blinkLeft", blinkValue);
				safeSetExpression("blinkRight", blinkValue);
			}

			if (timeCounterRef.current >= 150) {
				blinkStateRef.current = "open";
				timeCounterRef.current = 0;
				nextBlinkTimeRef.current = getRandomBlinkInterval();
			}
		}
	};

	/**
	 * 呼吸処理の更新
	 * @param deltaTime 前フレームからの経過時間（秒）
	 */
	const updateBreath = (deltaTime: number) => {
		if (!vrm || !vrm.humanoid) return;

		// 呼吸の速さ（周期5秒）
		breathPhaseRef.current =
			(breathPhaseRef.current + deltaTime * 1.25) % (Math.PI * 2);

		// 胸と肩のボーン（存在する場合）を取得
		const chest = vrm.humanoid.getNormalizedBoneNode("chest");
		const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
		const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");

		if (chest) {
			// サインカーブで上下に微妙に動かす（元の位置から±0.005の範囲）
			const breathValue = Math.sin(breathPhaseRef.current) * 0.005;
			// チェストを使った呼吸表現
			chest.position.y += breathValue;

			// 肩の動きも連動させる（もし存在すれば）
			if (leftShoulder) leftShoulder.position.y += breathValue * 0.7;
			if (rightShoulder) rightShoulder.position.y += breathValue * 0.7;
		}

		// 呼吸に合わせて口も微妙に動かす
		const breathMouth = Math.sin(breathPhaseRef.current) * 0.1 + 0.1;

		// 「あ」の口の形を試す（複数の可能性を試す）
		const mouthSuccess =
			safeSetExpression("aa", breathMouth * 0.2) ||
			safeSetExpression("a", breathMouth * 0.2);

		// 口の表情がサポートされていない場合、「お」や他の表情も試す
		if (!mouthSuccess) {
			safeSetExpression("oh", breathMouth * 0.15) ||
				safeSetExpression("o", breathMouth * 0.15);
		}
	};

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
		safeSetExpression("aa", result.volume); // "a"の口の形をボリュームに合わせる
	};

	/**
	 * フレーム更新時の処理
	 * @param deltaTime 前フレームからの経過時間（秒）
	 */
	const update = (deltaTime: number) => {
		if (vrm && !debugLoggedRef.current) {
			debugExpressions();
		}

		updateBlink(deltaTime);
		updateBreath(deltaTime);
		updateLipSync();
	};

	// クリーンアップ処理
	useEffect(() => {
		return () => {
			if (blinkTimerRef.current !== null) {
				clearTimeout(blinkTimerRef.current);
			}
		};
	}, []);

	return {
		update,
		setExpression,
		setExpressionForMotion,
		currentExpression: currentExpressionRef.current,
		playAudio,
		isAudioInitialized: !!audioContext,
	};
};
