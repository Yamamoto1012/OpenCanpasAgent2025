import { useEffect, useRef, useState } from "react";
import { LipSync } from "../LipSync/lipSync";
import type { LipSyncAnalyzeResult } from "../LipSync/types";

export const useLipSync = (isMuted: boolean) => {
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
			// ミュート時はボリュームを0に設定
			setLipSyncResult({ volume: 0 });
			return;
		}

		const updateLipSync = () => {
			if (lipSyncRef.current) {
				const result = lipSyncRef.current.update();
				setLipSyncResult(result);
			}
			frameRef.current = requestAnimationFrame(updateLipSync);
		};

		frameRef.current = requestAnimationFrame(updateLipSync);

		return () => {
			if (frameRef.current) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, [isMuted]);

	// 音声再生関数
	const playAudio = async (url: string, onEnded?: () => void) => {
		if (!lipSyncRef.current || isMuted) return;

		try {
			await lipSyncRef.current.playFromURL(url, onEnded);
		} catch (error) {
			console.error("音声再生に失敗しました", error);
		}
	};

	return {
		lipSyncResult,
		playAudio,
		isAudioInitialized: !!audioContext,
	};
};
