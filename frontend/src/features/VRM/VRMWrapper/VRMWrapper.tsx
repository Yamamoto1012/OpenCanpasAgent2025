import { VRMRender } from "../VRMRender/VRMRender";
import {
	useRef,
	useState,
	useEffect,
	forwardRef,
	useImperativeHandle,
} from "react";

export type VRMWrapperHandle = {
	playAudio: (audioUrl: string) => void; // 音声再生（リップシンク含む）
	crossFadeAnimation: (vrmaUrl: string) => void; // モーション切り替え
	setExpression?: (preset: string, weight: number) => void; // 表情設定
	setExpressionForMotion?: (motionName: string) => void; // モーションに応じた表情設定
	startThinking: () => void; // 思考モード開始
	stopThinking: () => void; // 思考モード終了
	isThinking: boolean; // 現在の思考状態
	getLastMotion: () => string; // 現在のモーション名取得
	restoreLastMotion: () => void; // 直前のモーションに戻す
};

type VRMWrapperProps = {
	categoryDepth?: number;
	isMuted: boolean;
	onThinkingStateChange?: (isThinking: boolean) => void;
};

export const VRMWrapper = forwardRef<VRMWrapperHandle, VRMWrapperProps>(
	({ categoryDepth = 0, isMuted, onThinkingStateChange }, ref) => {
		// アニメーション一時停止状態
		const [isPaused, setIsPaused] = useState(false);
		// 思考中状態
		const [isThinking, setIsThinking] = useState(false);
		// 前回のカテゴリ深度を記録
		const prevDepthRef = useRef<number>(categoryDepth);
		// VRMRenderへのref（低レベルAPI呼び出し用）
		const vrmRenderRef = useRef<any>(null);
		// 直近のモーション名
		const lastMotionRef = useRef<string>("/Motion/StandingIdle.vrma");

		// モーション切り替え
		function crossFadeToMotion(vrmaUrl: string): void {
			if (vrmRenderRef.current?.crossFadeAnimation) {
				vrmRenderRef.current.crossFadeAnimation(vrmaUrl);
			}
		}

		// カテゴリ深度変更時のモーション・表情更新
		function updateMotionForCategoryDepth(depth: number): void {
			const newMotion = "/Motion/StandingIdle.vrma";
			crossFadeToMotion(newMotion);
			lastMotionRef.current = newMotion;
			setTimeout(() => {
				if (vrmRenderRef.current?.setExpressionForMotion) {
					vrmRenderRef.current.setExpressionForMotion(newMotion);
				}
			}, 200);
			prevDepthRef.current = depth;
		}

		// カテゴリ深度によるモデル位置調整
		function getPositionForDepth(depth: number): [number, number, number] {
			return depth >= 2 ? [-0.3, 0, 0] : [0, 0, 0];
		}
		// カテゴリ深度によるモデル回転調整
		function getRotationForDepth(depth: number): [number, number, number] {
			return depth >= 2 ? [0, Math.PI / 12, 0] : [0, 0, 0];
		}

		// 思考状態変化時に親へ通知
		useEffect(() => {
			if (onThinkingStateChange) {
				onThinkingStateChange(isThinking);
			}
		}, [isThinking, onThinkingStateChange]);

		// 親コンポーネントに公開するAPI群
		useImperativeHandle(ref, () => ({
			crossFadeAnimation: (vrmaUrl: string) => {
				lastMotionRef.current = vrmaUrl;
				if (!isPaused) {
					crossFadeToMotion(vrmaUrl);
				}
			},
			playAudio: (audioUrl: string) => {
				vrmRenderRef.current?.playAudio(audioUrl);
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
			startThinking: () => {
				setIsThinking(true);
				setIsPaused(false);
				crossFadeToMotion("/Motion/Thinking.vrma");
				lastMotionRef.current = "/Motion/Thinking.vrma";
				// ダミーリップシンク（フォールバック）が必要な場合はref経由で呼ぶ
				if (vrmRenderRef.current?.simulateLipSync) {
					vrmRenderRef.current.simulateLipSync();
				}
			},
			stopThinking: () => {
				setIsThinking(false);
				const defaultMotion = "/Motion/StandingIdle.vrma";
				crossFadeToMotion(defaultMotion);
				lastMotionRef.current = defaultMotion;
			},
			isThinking,
			getLastMotion: () => lastMotionRef.current,
			restoreLastMotion: () => {
				crossFadeToMotion(lastMotionRef.current);
			},
		}));

		// カテゴリ深度変更時の処理
		useEffect(() => {
			if (categoryDepth !== prevDepthRef.current) {
				updateMotionForCategoryDepth(categoryDepth);
			}
		}, [categoryDepth]);

		// VRMモデル表示用オプション
		const vrmOptions = {
			vrmUrl: "/Model/KIT_2.0.vrm",
			vrmaUrl: "/Motion/StandingIdle.vrma",
			position: getPositionForDepth(categoryDepth),
			rotation: getRotationForDepth(categoryDepth),
			lookAtCamera: true,
			ref: vrmRenderRef,
			isMuted: isMuted,
		};

		// VRMモデルの描画
		return <VRMRender {...vrmOptions} />;
	},
);
