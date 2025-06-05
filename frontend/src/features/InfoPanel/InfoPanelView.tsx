import { ScrollArea } from "@/components/ui/scroll-area";
import type { FC } from "react";
import { ContentSection } from "./components/ContentSection";
import { InfoPanelHeader } from "./components/InfoPanelHeader";
import { InfoSection } from "./components/InfoSection";
import { TechSection } from "./components/TechSection";
import { UsageSection } from "./components/UsageSection";

export type InfoPanelViewProps = {
	/**
	 * パネルを閉じるハンドラー
	 */
	onClose: () => void;

	/**
	 * モバイル表示かどうか
	 */
	isMobile?: boolean;
};

/**
 * 情報パネルのプレゼンテーションコンポーネント
 * @param onClose - パネルを閉じるためのコールバック関数
 * @param isMobile - モバイル表示かどうかのフラグ
 */
export const InfoPanelView: FC<InfoPanelViewProps> = ({
	onClose,
	isMobile = false,
}) => {
	if (isMobile) {
		// モバイル版：全画面表示
		return (
			<div className="fixed inset-0 bg-black/95 backdrop-blur-xl text-white z-[60]">
				<div className="h-full flex flex-col">
					{/* ヘッダー部分（固定） */}
					<div className="flex-shrink-0 p-4 border-b border-white/10">
						<InfoPanelHeader onClose={onClose} />
					</div>

					{/* スクロール可能なコンテンツ部分 */}
					<div
						className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-24"
						style={{
							WebkitOverflowScrolling: "touch",
							scrollbarWidth: "thin",
							scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
							transform: "translateZ(0)",
							willChange: "scroll-position",
						}}
					>
						<div className="space-y-6 py-4">
							<InfoSection
								iconType="info"
								title="KIT Virtual Navigatorについて"
								iconColor="text-blue-400"
							>
								<p className="text-white/80 leading-relaxed text-sm">
									KIT Virtual
									Navigatorは、AIを活用した次世代型の検索システムです。テキストで質問すると、AIアシスタントがリアルタイムで回答し、3DキャラクターがAI音声で応答します。金沢工業大学に関するPDFやドキュメントをベクトルデータベース化し、RAG（検索拡張生成）を活用しています。
								</p>
							</InfoSection>
							<TechSection />
							<UsageSection />
							<ContentSection />
						</div>
					</div>
				</div>
			</div>
		);
	}

	// デスクトップ版：右側パネル表示
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
