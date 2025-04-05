import { motion } from "framer-motion";

type ThinkingIndicatorProps = {
	visible: boolean;
};

/**
 * VRMモデルの思考中を示す三点リードアニメーション
 */
export const ThinkingIndicator = ({ visible }: ThinkingIndicatorProps) => {
	if (!visible) return null;

	return (
		<motion.div
			className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
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
