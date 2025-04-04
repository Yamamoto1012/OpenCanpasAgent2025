"use client";

export interface VoiceWaveformViewProps {
	canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const VoiceWaveformView: React.FC<VoiceWaveformViewProps> = ({
	canvasRef,
}) => (
	<div className="w-full h-16 bg-black/5 rounded-md overflow-hidden">
		<canvas ref={canvasRef} width={300} height={64} className="w-full h-full" />
	</div>
);
