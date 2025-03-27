import type { VRM } from "@pixiv/three-vrm";
import { useEffect, useRef } from "react";

/**
 * VRMモデルに自然な表情や動きを追加するためのフック
 */
export const useVRMExpression = (vrm: VRM | null) => {
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
	 * フレーム更新時の処理
	 * @param deltaTime 前フレームからの経過時間（秒）
	 */
	const update = (deltaTime: number) => {
		if (vrm && !debugLoggedRef.current) {
			debugExpressions();
		}

		updateBlink(deltaTime);
		updateBreath(deltaTime);
	};

	// クリーンアップ処理
	useEffect(() => {
		return () => {
			if (blinkTimerRef.current !== null) {
				clearTimeout(blinkTimerRef.current);
			}
		};
	}, []);

	return { update };
};
