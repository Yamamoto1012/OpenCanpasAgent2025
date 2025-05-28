import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { VRM } from "@pixiv/three-vrm";
import { LipSync } from "../LipSync/lipSync";
import { ExpressionManager } from "../VRMExpression/ExpressionManager";
import { VRM_EXPRESSION_CONFIG } from "../constants/vrmExpressions";

/**
 * 日本語文字から音素への変換テーブル
 */
const KANA_TO_PHONEME_MAP: Record<string, string> = {
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
 * 音素からリップシンク用の表情重みへの変換設定
 */
const PHONEME_WEIGHT_CONFIG = {
	a: { weight: 0.8, duration: 120 },
	i: { weight: 0.6, duration: 100 },
	u: { weight: 0.7, duration: 110 },
	e: { weight: 0.5, duration: 100 },
	o: { weight: 0.9, duration: 130 },
	n: { weight: 0.3, duration: 80 },
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
	// ユーザーのインタラクション後に初期化される
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
	 * ひらがな・カタカナから対応する音素を抽出する
	 * @param text - 変換するテキスト
	 * @returns 音素の配列
	 */
	const convertTextToPhonemes = useCallback((text: string): string[] => {
		return Array.from(text)
			.map((character) => KANA_TO_PHONEME_MAP[character] || "")
			.filter(Boolean);
	}, []);

	/**
	 * テキストベースのリップシンクアニメーションを実行
	 * @param text - リップシンクに使用するテキスト
	 * @param baseDuration - 基本的な音素あたりの時間（ミリ秒）
	 */
	const executeTextLipSync = useCallback(
		async (text: string, baseDuration: number): Promise<void> => {
			if (!expressionManager || !text) {
				return;
			}

			const phonemes = convertTextToPhonemes(text);

			for (
				let index = 0;
				index < phonemes.length && isPlayingAudioRef.current;
				index++
			) {
				const phoneme = phonemes[index];
				const config =
					PHONEME_WEIGHT_CONFIG[phoneme as keyof typeof PHONEME_WEIGHT_CONFIG];

				if (config) {
					// 音素に対応する表情を設定
					expressionManager.setLipSyncByPhoneme(
						phoneme,
						VRM_EXPRESSION_CONFIG.WEIGHTS.LIP_SYNC * config.weight,
					);

					// 音素の持続時間だけ待機
					await new Promise((resolve) => setTimeout(resolve, config.duration));
				} else {
					// 設定のない音素は短時間の休止
					await new Promise((resolve) =>
						setTimeout(resolve, baseDuration * 0.5),
					);
				}

				if (!isPlayingAudioRef.current) {
					break;
				}

				// 音素間の小休止
				await new Promise((resolve) => setTimeout(resolve, baseDuration * 0.1));
			}
		},
		[expressionManager, convertTextToPhonemes],
	);

	/**
	 * 音声再生とテキストベースリップシンクの実行
	 * @param audioUrl - 再生する音声のURL
	 * @param lipSyncText - リップシンクに使用するテキスト（オプション）
	 * @param onAudioEnded - 音声再生終了時のコールバック
	 */
	const playAudioWithLipSync = useCallback(
		async (
			audioUrl: string,
			lipSyncText?: string,
			onAudioEnded?: () => void,
		): Promise<void> => {
			if (!lipSyncRef.current || isMuted) {
				onAudioEnded?.();
				return;
			}

			try {
				isPlayingAudioRef.current = true;

				if (lipSyncText && expressionManager) {
					// テキストの長さに基づいて基本時間を計算
					const baseDurationPerCharacter = Math.max(
						(lipSyncText.length * 60) /
							(convertTextToPhonemes(lipSyncText).length || 1),
						80,
					);

					// 音声再生を開始
					const audioPlayPromise = lipSyncRef.current.playFromURL(
						audioUrl,
						undefined, // 音量解析コールバックは使用しない
						() => {
							isPlayingAudioRef.current = false;
							expressionManager.setLipSyncActive(false);
							onAudioEnded?.();
						},
					);

					// テキストベースのリップシンクを並行実行
					await Promise.all([
						audioPlayPromise,
						executeTextLipSync(lipSyncText, baseDurationPerCharacter),
					]);
				} else {
					// テキストなしの場合は音声再生のみ
					await lipSyncRef.current.playFromURL(audioUrl, undefined, () => {
						isPlayingAudioRef.current = false;
						expressionManager?.setLipSyncActive(false);
						onAudioEnded?.();
					});
				}
			} catch (error) {
				console.error("音声再生またはリップシンクに失敗しました:", error);
				isPlayingAudioRef.current = false;
				expressionManager?.setLipSyncActive(false);
				onAudioEnded?.();
			}
		},
		[
			lipSyncRef,
			isMuted,
			expressionManager,
			executeTextLipSync,
			convertTextToPhonemes,
		],
	);

	return {
		playAudio: playAudioWithLipSync,
		isAudioInitialized: !!audioContext,
		expressionManager,
	};
};
