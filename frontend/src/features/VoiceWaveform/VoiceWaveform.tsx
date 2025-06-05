import { useRef } from "react";
import { VoiceWaveformView } from "./VoiceWaveformView";
import { useVoiceWaveform } from "./useVoiceWaveform";

export type VoiceWaveformProps = {
	isRecording: boolean;
};

/**
 * 録音状態に基づいて音声波形描画
 */
export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
	isRecording,
}) => {
	if (!isRecording) return null;

	const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));

	useVoiceWaveform(isRecording, canvasRef);

	return <VoiceWaveformView canvasRef={canvasRef} />;
};
