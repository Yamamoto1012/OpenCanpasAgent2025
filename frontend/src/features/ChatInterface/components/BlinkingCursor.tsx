import type React from "react";

export type BlinkingCursorProps = {
	className?: string;
};

/**
 * ストリーミング中に表示される点滅カーソルコンポーネント
 */
export const BlinkingCursor: React.FC<BlinkingCursorProps> = ({
	className = "",
}) => {
	return (
		<span
			className={`inline-block w-0.5 h-5 bg-gray-600 ml-0.5 animate-pulse ${className}`}
			style={{
				animation: "blink 1s infinite step-end",
			}}
		/>
	);
};
