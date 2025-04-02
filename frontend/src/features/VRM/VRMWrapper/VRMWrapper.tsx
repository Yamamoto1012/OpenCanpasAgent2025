import {
	Suspense,
	useEffect,
	useState,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";
import { VRMRender } from "../VRMRender/VRMRender";

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

// リップシンク関連の型定義
type LipSyncAnalysisResult = {
	volume: number;
};

type ExpressionPattern = {
	exp: string;
	val: number;
};

/**
 * VRMRenderコンポーネントをラップし、カテゴリ深度に応じた設定を提供する
 * @param categoryDepth カテゴリの深さ（0: トップ、1: メイン、2以上: 詳細）
 */
export const VRMWrapper = forwardRef<VRMWrapperHandle, VRMWrapperProps>(
	({ categoryDepth = 0, isMuted }, ref) => {
		// アニメーション一時停止用の状態
		const [isPaused, setIsPaused] = useState(false);

		// 前回のカテゴリ深度を追跡し、変更があった場合のみ処理を行うための参照
		const prevDepthRef = useRef<number>(categoryDepth);

		// VRMRenderコンポーネントへの参照（アニメーション制御に使用）
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const vrmRenderRef = useRef<any>(null);

		// 現在のモーションファイル（カテゴリ深度に応じて変更）
		const [motionFile, setMotionFile] = useState(
			getDefaultMotionForDepth(categoryDepth),
		);

		// 音声終了後に再開するためのモーション保存
		const lastMotionRef = useRef<string>(
			getDefaultMotionForDepth(categoryDepth),
		);

		/**
		 * カテゴリ深度に応じたデフォルトモーションのパスを返す
		 */
		function getDefaultMotionForDepth(depth: number): string {
			return depth >= 2 ? "/Motion/StandingIdle.vrma" : "/Motion/VRMA_01.vrma";
		}

		/**
		 * モデルの表情テスト - すべての表情を順番に適用
		 */
		function testModelExpressions(): void {
			if (!vrmRenderRef.current?.vrm) return;

			const expressions = [
				"aa",
				"ih",
				"ou",
				"ee",
				"oh",
				"happy",
				"sad",
				"angry",
				"surprised",
			];

			for (const exp of expressions) {
				if (vrmRenderRef.current?.setExpression) {
					vrmRenderRef.current.setExpression(exp, 1.0);
					setTimeout(() => {
						vrmRenderRef.current?.setExpression(exp, 0);
					}, 500);
				}
			}
		}

		/**
		 * 口の表情（リップシンク用ブレンドシェイプ）をリセット
		 */
		function resetLipExpressions(): void {
			if (!vrmRenderRef.current?.setExpression) return;

			const lipExpressions = ["aa", "ih", "oh", "ou", "ee"];

			for (const e of lipExpressions) {
				vrmRenderRef.current?.setExpression(e, 0);
			}
		}

		/**
		 * アニメーションを新しいモーションにクロスフェード
		 */
		function crossFadeToMotion(vrmaUrl: string): void {
			if (vrmRenderRef.current?.crossFadeAnimation) {
				vrmRenderRef.current.crossFadeAnimation(vrmaUrl);
			}
		}

		/**
		 * 手動でリップシンクをシミュレーション
		 */
		function simulateLipSync(): void {
			console.log("手動リップシンクシミュレーション開始");

			// 会話らしい口の動きパターンを定義（母音を変えながら）
			const pattern: ExpressionPattern[] = [
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
					resetLipExpressions();

					// 新しい表情を設定
					console.log(`口の表情: ${exp}, 強度: ${val.toFixed(2)}`);
					vrmRenderRef.current.setExpression(exp, val);
				}
			}, 180); // 少し早めに切り替え

			// 3秒後にシミュレーション終了
			setTimeout(() => {
				clearInterval(lipInterval);
				resetLipExpressions();
			}, 3000);
		}

		/**
		 * 音声分析結果に基づくリップシンク適用
		 */
		function handleAudioAnalysis(result: LipSyncAnalysisResult): void {
			if (result.volume > 0.05 && vrmRenderRef.current?.setExpression) {
				// 閾値を低めに設定
				const lipValue = Math.min(result.volume * 8, 1.0); // より強い増幅
				vrmRenderRef.current.setExpression("aa", lipValue);
				console.log(`リップシンク適用: ${lipValue.toFixed(2)}`);
			}
		}

		/**
		 * 音声再生完了時の処理
		 */
		function handleAudioComplete(): void {
			console.log("音声再生完了");
			// 音声終了後、元のモーションに戻る
			setIsPaused(false);
			crossFadeToMotion(lastMotionRef.current);
		}

		/**
		 * 音声再生とリップシンク処理の開始
		 */
		function playAudioWithLipSync(audioUrl: string): void {
			testModelExpressions();

			// 音声再生前にモーションを一時停止
			setIsPaused(true);

			// 完全に静止したモーションに切り替え
			crossFadeToMotion("/Motion/StandingIdle.vrma");

			// デバッグ情報
			console.log("音声再生システム状態:", {
				AudioContext: vrmRenderRef.current?.isAudioInitialized
					? "初期化済"
					: "未初期化",
			});

			if (!vrmRenderRef.current?.playAudio) return;

			console.log(`音声再生開始: ${audioUrl}`);

			// 表情をニュートラルにリセット
			if (vrmRenderRef.current?.setExpression) {
				vrmRenderRef.current.setExpression("neutral", 0);
			}

			// 最初に手動シミュレーションを開始
			simulateLipSync();

			// 実際の音声再生を少し遅らせて開始
			setTimeout(() => {
				vrmRenderRef.current.playAudio(
					audioUrl,
					handleAudioAnalysis,
					handleAudioComplete,
				);
			}, 300);
		}

		/**
		 * カテゴリ深度の変更に応じたモーション更新
		 */
		function updateMotionForCategoryDepth(depth: number): void {
			const newMotion = getDefaultMotionForDepth(depth);

			// アニメーションを切り替え
			crossFadeToMotion(newMotion);

			// 最後に再生したモーションを更新
			lastMotionRef.current = newMotion;

			// 表情も一緒に変更（少し遅延させて滑らかな遷移に）
			setTimeout(() => {
				if (vrmRenderRef.current?.setExpressionForMotion) {
					vrmRenderRef.current.setExpressionForMotion(newMotion);
				}
			}, 200);

			// 処理済みのカテゴリ深度を記録
			prevDepthRef.current = depth;
		}

		/**
		 * カテゴリ深度に応じた位置を計算
		 */
		function getPositionForDepth(depth: number): [number, number, number] {
			return depth >= 2 ? [-0.3, 0, 0] : [0, 0, 0];
		}

		/**
		 * カテゴリ深度に応じた回転を計算
		 */
		function getRotationForDepth(depth: number): [number, number, number] {
			return depth >= 2 ? [0, Math.PI / 12, 0] : [0, 0, 0];
		}

		// 親コンポーネントに公開するメソッド
		useImperativeHandle(ref, () => ({
			crossFadeAnimation: (vrmaUrl: string) => {
				lastMotionRef.current = vrmaUrl;
				if (!isPaused) {
					crossFadeToMotion(vrmaUrl);
				}
			},

			playAudio: (audioUrl: string) => {
				playAudioWithLipSync(audioUrl);
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

		/**
		 * カテゴリ深度変更時の処理
		 */

		// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
		useEffect(() => {
			// カテゴリ深度が変わった場合のみ処理
			if (categoryDepth !== prevDepthRef.current) {
				updateMotionForCategoryDepth(categoryDepth);
			}
		}, [categoryDepth]);

		/**
		 * VRMRenderに渡す設定オプション
		 */
		const vrmOptions = {
			vrmUrl: "/Model/KIT_2.0.vrm", // VRMモデルのパス
			vrmaUrl: motionFile, // アニメーションファイルのパス
			position: getPositionForDepth(categoryDepth),
			rotation: getRotationForDepth(categoryDepth),
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
