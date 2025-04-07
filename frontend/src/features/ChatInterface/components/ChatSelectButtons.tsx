import type React from "react";
import { Button } from "@/components/ui/button";

export type ChatSelectButtonsProps = {
	onSelect: (value: string) => void;
};

export const ChatSelectButtons: React.FC<ChatSelectButtonsProps> = ({
	onSelect,
}) => {
	return (
		<div
			style={{ backgroundColor: "#b3cfad" }}
			className="p-2 flex gap-1 overflow-x-auto"
		>
			<Button
				variant="outline"
				className="whitespace-nowrap rounded-full text-sm border-0 hover:scale-95 transition-transform"
				style={{ backgroundColor: "white", color: "#9f9579" }}
				onClick={() => onSelect("学校生活")}
			>
				学校生活
			</Button>
			<Button
				variant="outline"
				className="whitespace-nowrap rounded-full text-sm border-0 hover:scale-95 transition-transform"
				style={{ backgroundColor: "white", color: "#9f9579" }}
				onClick={() => onSelect("おすすめの学部学科")}
			>
				おすすめの学部学科
			</Button>
			<Button
				variant="outline"
				className="whitespace-nowrap rounded-full text-sm border-0 hover:scale-95 transition-transform"
				style={{ backgroundColor: "white", color: "#9f9579" }}
				onClick={() => onSelect("就職実績")}
			>
				就職実績
			</Button>
		</div>
	);
};
