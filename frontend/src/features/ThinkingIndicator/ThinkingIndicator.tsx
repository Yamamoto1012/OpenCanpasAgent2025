import { motion } from "framer-motion";

type ThinkingIndicatorProps = {
	visible: boolean;
	categoryDepth?: number;
};

/**
 * VRMモデルの思考中を示す三点リードアニメーション
 */
export const ThinkingIndicator = ({
	visible,
	categoryDepth = 0,
}: ThinkingIndicatorProps) => {
	if (!visible) return null;

	// カテゴリの深さに応じて位置を調整する
	const topPosition = categoryDepth >= 2 ? "top-1/6" : "top-1/4";

	// カテゴリの深さに応じてX軸方向の位置を調整
	let xPosition: string;
	let xTransform: string;

	if (categoryDepth >= 2) {
		// カテゴリの深さが2以上の場合、やや左に寄せる
		xPosition = "left-[25%]";
		xTransform = "-translate-x-1/2"; // 中心を基準に
	} else {
		// カテゴリの深さが0の場合、中央に配置
		xPosition = "left-1/2";
		xTransform = "-translate-x-1/2";
	}

	const zIndex = "z-50";

	return (
		<motion.div
			className={`absolute ${topPosition} ${xPosition} transform ${xTransform} ${zIndex}`}
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
		>
			<div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full flex items-center">
				<motion.div
					className="flex gap-2"
					animate={{
						opacity: [1, 0.5, 1],
						transition: { repeat: Number.POSITIVE_INFINITY, duration: 1.8 },
					}}
				>
					<motion.div
						animate={{
							y: [0, -6, 0],
							transition: {
								repeat: Number.POSITIVE_INFINITY,
								duration: 1.2,
								delay: 0,
							},
						}}
						className="w-3 h-3 rounded-full bg-white"
					/>
					<motion.div
						animate={{
							y: [0, -6, 0],
							transition: {
								repeat: Number.POSITIVE_INFINITY,
								duration: 1.2,
								delay: 0.2,
							},
						}}
						className="w-3 h-3 rounded-full bg-white"
					/>
					<motion.div
						animate={{
							y: [0, -6, 0],
							transition: {
								repeat: Number.POSITIVE_INFINITY,
								duration: 1.2,
								delay: 0.4,
							},
						}}
						className="w-3 h-3 rounded-full bg-white"
					/>
				</motion.div>
				<span className="ml-3 text-white font-medium">思考中...</span>
			</div>
		</motion.div>
	);
};
