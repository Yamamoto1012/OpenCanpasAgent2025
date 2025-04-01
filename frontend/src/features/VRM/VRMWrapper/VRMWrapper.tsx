import {
	Suspense,
	useEffect,
	useState,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";
import VRMRender from "../VRMRender/VRMRender";

export type VRMWrapperHandle = {
	playAudio: (audioUrl: string) => void;
	crossFadeAnimation: (vrmaUrl: string) => void;
	setExpression?: (preset: string, weight: number) => void;
	setExpressionForMotion?: (motionName: string) => void;
};

type VRMWrapperProps = {
	categoryDepth?: number; // 現在のカテゴリの深さ
	isMuted: boolean; // 音声ミュートの状態
};

/**
 * VRMRenderコンポーネントをラップし、カテゴリ深度に応じた設定を提供する
 * @param categoryDepth カテゴリの深さ（0: トップ、1: メイン、2以上: 詳細）
 */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const VRMWrapper = forwardRef<any, VRMWrapperProps>(
	({ categoryDepth = 0, isMuted }, ref) => {
		// アニメーション一時停止用の状態
		const [isPaused, setIsPaused] = useState(false);
		// 音声終了後に再開するためのモーション保存
		const lastMotionRef = useRef<string>(
			categoryDepth >= 2 ? "/Motion/StandingIdle.vrma" : "/Motion/VRMA_01.vrma",
		);
		// 前回のカテゴリ深度を追跡し、変更があった場合のみ処理を行うための参照
		const prevDepthRef = useRef<number>(categoryDepth);

		// VRMRenderコンポーネントへの参照（アニメーション制御に使用）
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const vrmRenderRef = useRef<any>(null);

		const checkModelBlendShapes = () => {
			if (vrmRenderRef.current?.vrm) {
				// 全ての表情を試す
				// biome-ignore lint/complexity/noForEach: <explanation>
				[
					"aa",
					"ih",
					"ou",
					"ee",
					"oh",
					"happy",
					"sad",
					"angry",
					"surprised",
				].forEach((exp) => {
					if (vrmRenderRef.current?.setExpression) {
						vrmRenderRef.current.setExpression(exp, 1.0);
						setTimeout(() => {
							vrmRenderRef.current?.setExpression(exp, 0);
						}, 500);
					}
				});
			}
		};

		// 親コンポーネント（App.tsx）にVRMRenderの関数を公開
		useImperativeHandle(ref, () => ({
			crossFadeAnimation: (vrmaUrl: string) => {
				lastMotionRef.current = vrmaUrl;
				if (!isPaused && vrmRenderRef.current?.crossFadeAnimation) {
					vrmRenderRef.current.crossFadeAnimation(vrmaUrl);
				}
			},

			playAudio: (audioUrl: string) => {
				checkModelBlendShapes();
				// 音声再生前にモーションを一時停止
				setIsPaused(true);

				// 完全に静止したモーションに切り替え
				if (vrmRenderRef.current?.crossFadeAnimation) {
					vrmRenderRef.current.crossFadeAnimation("/Motion/StandingIdle.vrma");
				}

				// デバッグ情報
				console.log("音声再生システム状態:", {
					AudioContext: vrmRenderRef.current?.isAudioInitialized
						? "初期化済"
						: "未初期化",
				});

				if (vrmRenderRef.current?.playAudio) {
					// biome-ignore lint/style/useTemplate: <explanation>
					console.log("音声再生開始: " + audioUrl);

					// 表情をニュートラルにリセット
					if (vrmRenderRef.current?.setExpression) {
						vrmRenderRef.current.setExpression("neutral", 0);
					}

					// デバッグ用: 手動でリップシンクをシミュレーション
					const simulateLipSync = () => {
						console.log("手動リップシンクシミュレーション開始");

						// 会話らしい口の動きパターンを定義（母音を変えながら）
						const pattern = [
							{ exp: "aa", val: 0.3 },
							{ exp: "aa", val: 0.7 },
							{ exp: "oh", val: 0.5 },
							{ exp: "ee", val: 0.4 },
							{ exp: "ih", val: 0.6 },
							{ exp: "ou", val: 0.5 },
							{ exp: "aa", val: 0.8 },
							{ exp: "ee", val: 0.3 },
							{ exp: "aa", val: 0.2 },
						];
						let index = 0;

						const lipInterval = setInterval(() => {
							if (index >= pattern.length) {
								clearInterval(lipInterval);
								return;
							}

							const { exp, val } = pattern[index++];
							if (vrmRenderRef.current?.setExpression) {
								// 前の表情をリセット（口関連のみ）
								// biome-ignore lint/complexity/noForEach: <explanation>
								["aa", "ih", "oh", "ou", "ee"].forEach((e) => {
									vrmRenderRef.current?.setExpression(e, 0);
								});

								// 新しい表情を設定
								console.log(`口の表情: ${exp}, 強度: ${val.toFixed(2)}`);
								vrmRenderRef.current.setExpression(exp, val);
							}
						}, 180); // 少し早めに切り替え

						// 3秒後にシミュレーション終了
						setTimeout(() => {
							clearInterval(lipInterval);
							if (vrmRenderRef.current?.setExpression) {
								// biome-ignore lint/complexity/noForEach: <explanation>
								["aa", "ih", "oh", "ou", "ee"].forEach((e) => {
									vrmRenderRef.current?.setExpression(e, 0);
								});
							}
						}, 3000);
					};

					// 音声解析結果を受け取るコールバック
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					const handleAnalysis = (result: any) => {
						if (result.volume > 0.05) {
							// 閾値を低めに設定
							if (vrmRenderRef.current?.setExpression) {
								const lipValue = Math.min(result.volume * 8, 1.0); // より強い増幅
								vrmRenderRef.current.setExpression("aa", lipValue);
								console.log(`リップシンク適用: ${lipValue.toFixed(2)}`);
							}
						}
					};

					// 最初に手動シミュレーションを開始
					simulateLipSync();

					// 実際の音声再生を少し遅らせて開始
					setTimeout(() => {
						vrmRenderRef.current.playAudio(audioUrl, handleAnalysis, () => {
							console.log("音声再生完了");
							// 音声終了後、元のモーションに戻る
							setIsPaused(false);
							if (vrmRenderRef.current?.crossFadeAnimation) {
								vrmRenderRef.current.crossFadeAnimation(lastMotionRef.current);
							}
						});
					}, 300);
				}
			},
			setExpression: (preset: string, weight: number) => {
				if (vrmRenderRef.current?.setExpression) {
					vrmRenderRef.current.setExpression(preset, weight);
				}
			},
			setExpressionForMotion: (motionName: string) => {
				if (!isPaused && vrmRenderRef.current?.setExpressionForMotion) {
					vrmRenderRef.current.setExpressionForMotion(motionName);
				}
			},
		}));

		// 現在のモーションファイル（カテゴリ深度に応じて変更）
		const [motionFile, setMotionFile] = useState(
			categoryDepth >= 2 ? "/Motion/StandingIdle.vrma" : "/Motion/VRMA_01.vrma",
		);


		/**
		 * カテゴリ深度変更時の処理
		 * アニメーションを切り替えてモデルの状態を更新
		 */
		useEffect(() => {
			// カテゴリ深度が変わった場合のみ処理
			if (categoryDepth !== prevDepthRef.current) {
				const newMotion =
					categoryDepth >= 2
						? "/Motion/StandingIdle.vrma" // 詳細画面用モーション
						: "/Motion/VRMA_01.vrma"; // 通常画面用モーション

				// VRMRenderコンポーネントの参照が有効ならクロスフェードでアニメーション切替
				if (vrmRenderRef.current?.crossFadeAnimation) {
					vrmRenderRef.current.crossFadeAnimation(newMotion);
				} else {
					// 参照が無効な場合は単純に状態を更新
					setMotionFile(newMotion);
				}

				// 表情も一緒に変更（少し遅延させて滑らかな遷移に）
				setTimeout(() => {
					if (vrmRenderRef.current?.setExpressionForMotion) {
						vrmRenderRef.current.setExpressionForMotion(newMotion);
					}
				}, 200);

				// 処理済みのカテゴリ深度を記録
				prevDepthRef.current = categoryDepth;
			}
		}, [categoryDepth]);

		/**
		 * VRMRenderに渡す設定オプション
		 * カテゴリ深度に応じて位置と回転を調整
		 */
		const vrmOptions = {
			vrmUrl: "/Model/KIT_2.0.vrm", // VRMモデルのパス
			vrmaUrl: motionFile, // アニメーションファイルのパス
			position:
				categoryDepth >= 2
					? ([-0.3, 0, 0] as [number, number, number]) // 詳細画面で少し左に配置
					: ([0, 0, 0] as [number, number, number]), // 通常位置
			rotation:
				categoryDepth >= 2
					? // 詳細画面では少し右を向く（ベース回転 + 15度）
						([0, Math.PI / 12, 0] as [number, number, number])
					: // 通常は正面を向く
						([0, 0, 0] as [number, number, number]),
			lookAtCamera: true, // カメラ目線を有効化
			ref: vrmRenderRef, // コンポーネントの参照
			isMuted: isMuted, // 音声ミュートの状態
		};
		return (
			<Suspense>
				<VRMRender {...vrmOptions} />
			</Suspense>
		);
	},
);

export default VRMWrapper;
