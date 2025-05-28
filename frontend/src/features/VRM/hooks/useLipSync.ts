import { useEffect, useRef, useState, useMemo } from "react";
import type { VRM } from "@pixiv/three-vrm";
import { LipSync } from "../LipSync/lipSync";
import { ExpressionManager } from "../VRMExpression/ExpressionManager";
import { VRM_EXPRESSION_CONFIG } from "../constants/vrmExpressions";

/**
 * 日本語文字から音素への変換テーブル
 */
const KANA_TO_PHONEME: Record<string, string> = {
	あ: "a",
	い: "i",
	う: "u",
	え: "e",
	お: "o",
	か: "a",
	き: "i",
	く: "u",
	け: "e",
	こ: "o",
	さ: "a",
	し: "i",
	す: "u",
	せ: "e",
	そ: "o",
	た: "a",
	ち: "i",
	つ: "u",
	て: "e",
	と: "o",
	な: "a",
	に: "i",
	ぬ: "u",
	ね: "e",
	の: "o",
	は: "a",
	ひ: "i",
	ふ: "u",
	へ: "e",
	ほ: "o",
	ま: "a",
	み: "i",
	む: "u",
	め: "e",
	も: "o",
	や: "a",
	ゆ: "u",
	よ: "o",
	ら: "a",
	り: "i",
	る: "u",
	れ: "e",
	ろ: "o",
	わ: "a",
	を: "o",
	ん: "n",
	が: "a",
	ぎ: "i",
	ぐ: "u",
	げ: "e",
	ご: "o",
	ざ: "a",
	じ: "i",
	ず: "u",
	ぜ: "e",
	ぞ: "o",
	だ: "a",
	ぢ: "i",
	づ: "u",
	で: "e",
	ど: "o",
	ば: "a",
	び: "i",
	ぶ: "u",
	べ: "e",
	ぼ: "o",
	ぱ: "a",
	ぴ: "i",
	ぷ: "u",
	ぺ: "e",
	ぽ: "o",
} as const;

/**
 * VRMモデルのリップシンク制御を行うフック
 * @param vrm VRMモデルインスタンス
 * @param isMuted 音声ミュート状態
 * @returns リップシンク制御のための関数と状態
 */
export const useLipSync = (vrm: VRM | null, isMuted: boolean) => {
	const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
	const lipSyncRef = useRef<LipSync | null>(null);
	const isPlayingAudioRef = useRef<boolean>(false);

	// ExpressionManagerのインスタンスを作成・管理
	const expressionManager = useMemo(() => new ExpressionManager(vrm), [vrm]);

	// VRMが変更された時にExpressionManagerを更新
	useEffect(() => {
		expressionManager.setVRM(vrm);
	}, [vrm, expressionManager]);

	// AudioContextの初期化
	useEffect(() => {
		const initializeAudioContext = () => {
			if (!audioContext) {
				const newAudioContext = new AudioContext();
				setAudioContext(newAudioContext);
				lipSyncRef.current = new LipSync(newAudioContext);
			}
		};

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
			if (audioContext) {
				audioContext.close();
			}
		};
	}, [audioContext]);

	/**
	 * テキストから音素配列への変換
	 * @param text - 変換するテキスト
	 * @returns 音素の配列
	 */
	const textToPhonemes = (text: string): string[] => {
		return Array.from(text)
			.map((char) => KANA_TO_PHONEME[char] || "")
			.filter(Boolean);
	};

	/**
	 * 音声再生関数
	 */
	const playAudio = async (
		url: string,
		text?: string,
		onEnded?: () => void,
	) => {
		if (!lipSyncRef.current || isMuted) {
			if (onEnded) onEnded();
			return;
		}

		try {
			isPlayingAudioRef.current = true;

			if (text && expressionManager) {
				// テキストベースのリップシンク
				const phonemes = textToPhonemes(text);
				const phonemeDuration = Math.max(
					(text.length * 60) / (phonemes.length || 1),
					80,
				);

				// 音声再生開始
				lipSyncRef.current.playFromURL(url, undefined, () => {
					isPlayingAudioRef.current = false;
					expressionManager.setLipSyncActive(false);
					if (onEnded) onEnded();
				});

				// テキストベースのリップシンクアニメーション
				(async () => {
					for (
						let i = 0;
						i < phonemes.length && isPlayingAudioRef.current;
						i++
					) {
						const phoneme = phonemes[i];

						// 音素に対応する表情を設定
						expressionManager.setLipSyncByPhoneme(
							phoneme,
							VRM_EXPRESSION_CONFIG.WEIGHTS.LIP_SYNC * 0.4, // テキストベースは控えめに
						);

						await new Promise((resolve) =>
							setTimeout(resolve, phonemeDuration),
						);

						if (!isPlayingAudioRef.current) break;

						// 音素間の小休止
						expressionManager.resetLipSyncExpressions();
						await new Promise((resolve) =>
							setTimeout(resolve, phonemeDuration * 0.2),
						);
					}
				})();
			} else {
				// テキストなしの場合は音声再生のみ
				await lipSyncRef.current.playFromURL(url, undefined, () => {
					isPlayingAudioRef.current = false;
					if (onEnded) onEnded();
				});
			}
		} catch (error) {
			console.error("音声再生に失敗しました:", error);
			isPlayingAudioRef.current = false;
			if (expressionManager) {
				expressionManager.setLipSyncActive(false);
			}
			if (onEnded) onEnded();
		}
	};

	return {
		playAudio,
		isAudioInitialized: !!audioContext,
		expressionManager,
	};
};
