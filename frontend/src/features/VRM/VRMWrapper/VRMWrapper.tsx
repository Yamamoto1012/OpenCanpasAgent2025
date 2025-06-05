import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { VRMRender } from "../VRMRender/VRMRender";

export type VRMWrapperHandle = {
	playAudio: (audioUrl: string, text?: string) => void; // 音声再生（リップシンク含む）
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

/**
 * カテゴリ深度に応じたVRMモデルの位置を計算する関数
 * @param _depth - カテゴリの深度
 * @return - VRMモデルの位置座標
 */
const getPositionForDepth = (_depth: number): [number, number, number] => {
	const basePosition: [number, number, number] = [0, -1, 0];
	// 位置は固定にして、カテゴリ深度による変更を無効化
	return basePosition;
};

/**
 * カテゴリ深度に応じたVRMモデルの回転を計算する関数
 * @param _depth - カテゴリの深度
 * @return - VRMモデルの回転角度（オイラー角）
 */
const getRotationForDepth = (): [number, number, number] => {
	return [0, 0, 0]; // 現在は固定値、
};

export const VRMWrapper = forwardRef<VRMWrapperHandle, VRMWrapperProps>(
	({ categoryDepth = 0, isMuted, onThinkingStateChange }, ref) => {
		// アニメーション一時停止状態
		const [isPaused, setIsPaused] = useState<boolean>(false);

		// 思考状態の管理
		const [isThinking, setIsThinking] = useState<boolean>(false);

		// VRMRenderコンポーネントへの参照
		const vrmRenderRef = useRef<{
			crossFadeAnimation?: (vrmaUrl: string) => void;
			playAudio?: (audioUrl: string, text?: string) => void;
			setExpression?: (preset: string, weight: number) => void;
			setExpressionForMotion?: (motionName: string) => void;
		} | null>(null);

		// 直前のモーション名を保持
		const lastMotionRef = useRef<string>("/Motion/StandingIdle.vrma");

		// 前回の深度を追跡
		const prevDepthRef = useRef<number>(categoryDepth);

		// 思考状態変更時の親への通知
		useEffect(() => {
			if (onThinkingStateChange) {
				onThinkingStateChange(isThinking);
			}
		}, [isThinking, onThinkingStateChange]);

		// モーション切り替えを実行する関数
		const crossFadeToMotion = useCallback((vrmaUrl: string) => {
			if (vrmRenderRef.current?.crossFadeAnimation) {
				vrmRenderRef.current.crossFadeAnimation(vrmaUrl);
			}
		}, []);

		// 親コンポーネントに公開するAPI群
		useImperativeHandle(ref, () => ({
			crossFadeAnimation: (vrmaUrl: string) => {
				lastMotionRef.current = vrmaUrl;
				if (!isPaused) {
					crossFadeToMotion(vrmaUrl);
				}
			},
			playAudio: (audioUrl: string, text?: string) => {
				if (vrmRenderRef.current?.playAudio) {
					vrmRenderRef.current.playAudio(audioUrl, text);
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
			startThinking: () => {
				setIsThinking(true);
				setIsPaused(false);
				crossFadeToMotion("/Motion/Thinking.vrma");
				lastMotionRef.current = "/Motion/Thinking.vrma";
				// 思考中の表情を設定
				if (vrmRenderRef.current?.setExpression) {
					vrmRenderRef.current.setExpression("neutral", 0.5);
				}
			},
			stopThinking: () => {
				setIsThinking(false);
				// 思考終了時は常にStandingIdleに戻る
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

		// カテゴリ深度変更時の処理（モーション変更は無効化）
		useEffect(() => {
			// カテゴリ選択時はモーションを変更せず、StandingIdleを維持
			if (!isThinking) {
				const defaultMotion = "/Motion/StandingIdle.vrma";
				if (lastMotionRef.current !== defaultMotion) {
					crossFadeToMotion(defaultMotion);
					lastMotionRef.current = defaultMotion;
				}
			}
			prevDepthRef.current = categoryDepth;
		}, [categoryDepth, isThinking, crossFadeToMotion]);

		// VRMモデル表示用オプション
		const vrmOptions = {
			vrmUrl: "/Model/KIT_2.0.vrm",
			vrmaUrl: "/Motion/StandingIdle.vrma",
			position: getPositionForDepth(categoryDepth),
			rotation: getRotationForDepth(),
			lookAtCamera: true,
			ref: vrmRenderRef,
			isMuted: isMuted,
		};

		// VRMモデルの描画
		return <VRMRender {...vrmOptions} />;
	},
);
