import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import type React from "react";

export const ChatThinkingIndicator: React.FC = () => {
	return (
		<div className="flex items-start gap-3">
			<div className="flex-shrink-0">
				<Avatar
					className="h-10 w-10 rounded-full border-2 border-white"
					style={{ backgroundColor: "#d9ca77" }}
				>
					<AvatarImage src="./chatIcon.png" />
					<AvatarFallback>AI</AvatarFallback>
				</Avatar>
			</div>
			<div className="bg-white rounded-2xl p-3 px-4 shadow-sm flex items-center">
				<motion.div className="flex space-x-1">
					{[0, 1, 2].map((dot) => (
						<motion.div
							key={dot}
							className="w-2 h-2 bg-gray-400 rounded-full"
							animate={{ y: ["0%", "-50%", "0%"] }}
							transition={{
								duration: 0.8,
								repeat: Number.POSITIVE_INFINITY,
								repeatType: "loop",
								ease: "easeInOut",
								delay: dot * 0.2,
							}}
						/>
					))}
				</motion.div>
			</div>
		</div>
	);
};
