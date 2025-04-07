import type React from "react";
import { MessageCircle, Search, Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { VoiceWaveform } from "@/features/VoiceWaveform/VoiceWaveform";
import { RecordingIndicator } from "@/features/RecordingIndicator/RecordingIndicator";

export type ActionPromptViewProps = {
	categoryTitle: string;
	showQuestionInput: boolean;
	question: string;
	isRecording: boolean;
	onQuestionClick: () => void;
	onQuestionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onQuestionKeyDown: (e: React.KeyboardEvent) => void;
	onSendQuestion: () => void;
	onToggleRecording: () => void;
	onSearch: () => void;
};

export const ActionPromptView: React.FC<ActionPromptViewProps> = ({
	categoryTitle,
	showQuestionInput,
	question,
	isRecording,
	onQuestionClick,
	onQuestionChange,
	onQuestionKeyDown,
	onSendQuestion,
	onToggleRecording,
	onSearch,
}) => {
	return (
		<motion.div
			className="w-xl z-40"
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: 100, opacity: 0 }}
			transition={{ type: "spring", damping: 25, stiffness: 300 }}
		>
			<div className="bg-white rounded-lg shadow-lg overflow-hidden">
				<div className="bg-[#b3cfad] text-[#333333] p-3">
					<h3 className="font-bold text-center">「{categoryTitle}」について</h3>
				</div>

				<div className="p-3 space-y-2">
					{!showQuestionInput ? (
						<>
							<Button
								variant="outline"
								className="w-full flex items-center text-center hover:bg-[#d9ca77]/20 hover:text-[#9f9579] hover:border-[#9f9579]"
								onClick={onSearch}
							>
								<Search className="w-4 h-4" />
								このカテゴリで検索する
							</Button>

							<Button
								variant="outline"
								className="w-full flex items-center text-center hover:bg-[#d9ca77]/20 hover:text-[#9f9579] hover:border-[#9f9579]"
								onClick={onQuestionClick}
							>
								<MessageCircle className="w-2 h-2" />
								質問を入力して検索する
							</Button>
						</>
					) : (
						<>
							{/* 録音中の波形表示 */}
							{isRecording && <VoiceWaveform isRecording={isRecording} />}

							<div className="flex gap-2">
								<Input
									value={question}
									onChange={onQuestionChange}
									placeholder={
										isRecording
											? "音声を認識しています..."
											: `${categoryTitle}について質問...`
									}
									className={
										isRecording ? "bg-red-50 border-0" : "bg-white border-0"
									}
									autoFocus
									onKeyDown={onQuestionKeyDown}
									disabled={isRecording}
								/>

								{/* マイクボタン */}
								<Button
									variant={isRecording ? "destructive" : "outline"}
									size="icon"
									onClick={onToggleRecording}
									className={`flex-shrink-0 ${isRecording ? "animate-pulse" : ""}`}
									title={isRecording ? "録音を停止" : "音声で質問"}
								>
									{isRecording ? (
										<MicOff className="h-4 w-4" />
									) : (
										<Mic className="h-4 w-4" />
									)}
								</Button>

								<Button
									onClick={onSendQuestion}
									disabled={!question.trim() || isRecording}
									className="bg-[#9f9579] hover:bg-[#9f9579]/90 text-white"
								>
									<Send className="h-4 w-4" />
								</Button>
							</div>

							{/* 録音時間インジケーター */}
							{isRecording && (
								<div className="mt-2 flex justify-center">
									<RecordingIndicator />
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</motion.div>
	);
};
