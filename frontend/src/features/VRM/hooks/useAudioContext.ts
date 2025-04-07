import { useState, useRef, useCallback, useEffect } from "react";
import type { VRMWrapperHandle } from "../VRMWrapper/VRMWrapper";

/**
 * AudioContextの初期化と音声再生を管理するカスタムフック
 */
export const useAudioContext = () => {
	const [audioInitialized, setAudioInitialized] = useState(false);
	const audioContextRef = useRef<AudioContext | null>(null);
	const vrmWrapperRef = useRef<VRMWrapperHandle>(null);

	// AudioContextを初期化する関数
	const initializeAudioContext = useCallback(() => {
		if (!audioContextRef.current) {
			try {
				audioContextRef.current = new AudioContext();
				setAudioInitialized(true);
			} catch (error) {}
		}
		return audioContextRef.current;
	}, []);

	// ユーザーインタラクション時に実行する関数
	const handleUserInteraction = useCallback(() => {
		initializeAudioContext();
	}, [initializeAudioContext]);

	// コンポーネントのマウント時にイベントリスナーを設定
	useEffect(() => {
		// ページのどこかをクリックしたときにAudioContextを初期化
		document.addEventListener("click", handleUserInteraction, { once: true });
		return () => {
			document.removeEventListener("click", handleUserInteraction);
		};
	}, [handleUserInteraction]);

	/**
	 * AudioContextを初期化し、音声を再生する関数
	 */
	const handleTestLipSync = () => {
		// AudioContextを初期化（最初のクリックで）
		if (!audioInitialized) {
			const audioCtx = new AudioContext();

			// AudioContextの状態を確認（デバッグ用）
			if (audioCtx.state === "running") {
			} else {
				console.warn(
					"AudioContext initialized but not running:",
					audioCtx.state,
				);
			}

			setAudioInitialized(true);
			// 少し待ってから音声再生
			setTimeout(() => {
				if (vrmWrapperRef.current?.playAudio) {
					vrmWrapperRef.current.playAudio("/audio/test.mp3");
				}
			}, 300);
		} else {
			// すでに初期化済みなら直接再生
			if (vrmWrapperRef.current?.playAudio) {
				vrmWrapperRef.current.playAudio("/audio/test.mp3");
			}
		}
	};

	/**
	 * 指定したURLの音声を再生する
	 */
	const playAudio = (audioUrl: string) => {
		if (!audioInitialized) {
			const audioCtx = new AudioContext();
			setAudioInitialized(true);

			setTimeout(() => {
				if (vrmWrapperRef.current?.playAudio) {
					vrmWrapperRef.current.playAudio(audioUrl);
				}
			}, 300);
		} else {
			if (vrmWrapperRef.current?.playAudio) {
				vrmWrapperRef.current.playAudio(audioUrl);
			}
		}
	};

	return {
		audioInitialized,
		vrmWrapperRef,
		handleTestLipSync,
		playAudio,
		initializeAudioContext,
	};
};
