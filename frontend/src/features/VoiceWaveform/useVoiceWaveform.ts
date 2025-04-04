"use client";
import { useEffect, useRef } from "react";

type WindowWithWebkitAudio = Window & {
	webkitAudioContext?: typeof AudioContext;
};

/**
 *
 * 録音状態に応じて、AudioContext と AnalyserNode をセットアップし、波形を描画。
 *
 * @param isRecording - 録音中かどうかのフラグ
 * @param canvasRef - 波形表示用の canvas 要素の参照
 */
export const useVoiceWaveform = (
	isRecording: boolean,
	canvasRef: React.RefObject<HTMLCanvasElement>,
): void => {
	const animationRef = useRef<number | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const dataArrayRef = useRef<Uint8Array | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);

	useEffect(() => {
		let audioContext: AudioContext | null = null;

		const setupAudio = async () => {
			if (!isRecording) return;

			try {
				// マイクアクセスの取得
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				mediaStreamRef.current = stream;
				const windowWithWebkit = window as WindowWithWebkitAudio;
				const AudioContextClass =
					window.AudioContext || windowWithWebkit.webkitAudioContext;
				if (!AudioContextClass) {
					throw new Error("AudioContextはお使いのブラウザで対応していません");
				}
				audioContext = new AudioContextClass();
				const source = audioContext.createMediaStreamSource(stream);
				const analyser = audioContext.createAnalyser();
				analyser.fftSize = 256;
				source.connect(analyser);

				// 波形描画用のデータ配列をセットアップ
				const bufferLength = analyser.frequencyBinCount;
				const dataArray = new Uint8Array(bufferLength);

				analyserRef.current = analyser;
				dataArrayRef.current = dataArray;

				// 波形の描画を開始
				startVisualization();
			} catch (error) {
				console.error("マイクへのアクセスエラー:", error);
			}
		};

		const startVisualization = () => {
			if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current)
				return;

			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const analyser = analyserRef.current;
			const dataArray = dataArrayRef.current;

			const draw = () => {
				const WIDTH = canvas.width;
				const HEIGHT = canvas.height;

				analyser.getByteFrequencyData(dataArray);

				// 背景の描画
				ctx.clearRect(0, 0, WIDTH, HEIGHT);
				ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
				ctx.fillRect(0, 0, WIDTH, HEIGHT);

				// 波形（バー）の描画
				const barWidth = (WIDTH / dataArray.length) * 2.5;
				let x = 0;
				for (let i = 0; i < dataArray.length; i++) {
					const barHeight = ((dataArray[i] / 255) * HEIGHT) / 2;
					// 振幅に応じた緑から赤へのグラデーション
					const hue = 120 - (dataArray[i] / 255) * 120;
					ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

					// 中央を基準に上下対称に描画
					const centerY = HEIGHT / 2;
					ctx.fillRect(x, centerY - barHeight, barWidth, barHeight);
					ctx.fillRect(x, centerY, barWidth, barHeight);

					x += barWidth + 1;
				}

				animationRef.current = requestAnimationFrame(draw);
			};

			draw();
		};

		const cleanup = () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
			if (mediaStreamRef.current) {
				// すべてのトラックを停止
				// biome-ignore lint/complexity/noForEach: <explanation>
				mediaStreamRef.current.getTracks().forEach((track) => track.stop());
				mediaStreamRef.current = null;
			}
			if (audioContext) {
				audioContext.close();
			}
		};

		if (isRecording) {
			setupAudio();
		} else {
			cleanup();
		}

		return cleanup;
	}, [isRecording, canvasRef]);
};
