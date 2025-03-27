"use client";
import React from "react";
import { Info, Cpu, Database, Volume2 } from "lucide-react";

type InfoSectionProps = {
	iconType: "info" | "cpu" | "database" | "volume2";
	title: string;
	iconColor?: string;
	children: React.ReactNode;
};

const iconMap = {
	info: <Info className="h-5 w-5 mr-2" />,
	cpu: <Cpu className="h-5 w-5 mr-2" />,
	database: <Database className="h-5 w-5 mr-2" />,
	volume2: <Volume2 className="h-5 w-5 mr-2" />,
};

export const InfoSection: React.FC<InfoSectionProps> = ({
	iconType,
	title,
	iconColor,
	children,
}) => {
	return (
		<section>
			<h3
				className={`text-lg font-semibold mb-3 flex items-center ${iconColor ? iconColor : ""}`}
			>
				{iconMap[iconType]}
				{title}
			</h3>
			{children}
		</section>
	);
};
