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
			className={`inline-block w-0.5 h-4 bg-gray-600 ml-0.5 animate-blink ${className}`}
		/>
	);
};
