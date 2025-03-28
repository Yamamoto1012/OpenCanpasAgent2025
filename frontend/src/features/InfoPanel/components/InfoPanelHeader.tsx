"use client";
import type React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type InfoPanelHeaderProps = {
	onClose: () => void;
};

export const InfoPanelHeader: React.FC<InfoPanelHeaderProps> = ({
	onClose,
}) => {
	return (
		<div className="flex justify-between items-center mb-6">
			<h2 className="text-xl font-bold">システム情報</h2>
			<Button
				variant="ghost"
				size="icon"
				onClick={onClose}
				className="text-white hover:bg-white/10"
			>
				<X className="h-5 w-5" />
			</Button>
		</div>
	);
};
