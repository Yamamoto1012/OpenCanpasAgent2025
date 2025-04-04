"use client";

export interface RecordingIndicatorViewProps {
	formattedTime: string;
}

export const RecordingIndicatorView: React.FC<RecordingIndicatorViewProps> = ({
	formattedTime,
}) => (
	<div className="flex items-center justify-center gap-2 text-red-600 font-medium">
		<div className="relative">
			{/* 録音中を示す赤いインジケータ */}
			{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
			<div className="h-3 w-3 rounded-full bg-red-600"></div>
			{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
			<div className="absolute inset-0 h-3 w-3 rounded-full bg-red-600 animate-ping"></div>
		</div>
		<span>{formattedTime}</span>
	</div>
);
