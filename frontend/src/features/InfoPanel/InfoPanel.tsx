"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InfoPanelHeader } from "./InfoPanelHeader";
import { InfoSection } from "./InfoSection";
import { TechSection } from "./TechSection";
import { UsageSection } from "./UsageSection";
import { ContentSection } from "./ContentSection";

type InfoPanelProps = {
	onClose: () => void;
};

export const InfoPanel: React.FC<InfoPanelProps> = ({ onClose }) => {
	return (
		<div className="absolute top-0 right-0 h-full w-96 bg-black/80 backdrop-blur-xl p-6 shadow-xl border-r border-white/20 text-white overflow-hidden z-20">
			<InfoPanelHeader onClose={onClose} />
			<ScrollArea className="h-[calc(100vh-100px)]">
				<div className="space-y-8">
					<InfoSection
						iconType="info"
						title="KIT Virtual Navigatorについて"
						iconColor="text-blue-400"
					>
						<p className="text-white/80 leading-relaxed">
							KIT Virtual
							Navigatorは、AIを活用した次世代型の検索システムです。テキストで質問すると、AIアシスタントがリアルタイムで回答し、3DキャラクターがAI音声で応答します。金沢工業大学に関するPDFやドキュメントをベクトルデータベース化し、RAG（検索拡張生成）を活用しています。
						</p>
					</InfoSection>
					<TechSection />
					<UsageSection />
					<ContentSection />
				</div>
			</ScrollArea>
		</div>
	);
};
