import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type React from "react";

export type ChatHeaderProps = {
	onReset: () => void;
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onReset }) => {
	return (
		<div
			style={{ backgroundColor: "#b3cfad" }}
			className="p-3 flex items-center"
		>
			<Button
				variant="ghost"
				size="icon"
				className="rounded-full text-gray-700 hover:bg-white/20"
				onClick={onReset}
			>
				<RefreshCw className="h-5 w-5" />
			</Button>
			<span className="ml-2 font-medium text-gray-800">
				会話を最初からやり直す
			</span>
		</div>
	);
};
