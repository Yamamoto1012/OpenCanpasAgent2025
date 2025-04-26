import { Mic, MicOff, Send, SquareSlash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceWaveform } from "@/features/VoiceWaveform/VoiceWaveform";

export type ChatInputAreaProps = {
	inputValue: string;
	isThinking: boolean;
	isRecording: boolean;
	onInputChange: React.ChangeEventHandler<HTMLInputElement>;
	onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
	onSend: () => void;
	onToggleRecording: () => void;
	onStop: () => void;
};

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
	inputValue,
	isThinking,
	isRecording,
	onInputChange,
	onKeyDown,
	onSend,
	onToggleRecording,
	onStop,
}) => {
	return (
		<div style={{ backgroundColor: "#b3cfad" }} className="px-3 py-2">
			{/* 録音中の波形表示 */}
			{isRecording && <VoiceWaveform isRecording={isRecording} />}

			{/* 入力エリア */}
			<div className="flex items-center gap-2">
				<Input
					value={inputValue}
					onChange={onInputChange}
					onKeyDown={onKeyDown}
					placeholder={
						isRecording ? "音声を認識しています..." : "質問を入力..."
					}
					disabled={isThinking || isRecording}
					className={isRecording ? "bg-red-50 border-0" : "bg-white border-0"}
				/>

				{/* マイクボタン */}
				<Button
					variant={isRecording ? "destructive" : "outline"}
					size="icon"
					onClick={onToggleRecording}
					className={`flex-shrink-0 ${isRecording ? "animate-pulse" : ""}`}
					disabled={isThinking}
					title={isRecording ? "録音を停止" : "音声で質問"}
				>
					{isRecording ? (
						<MicOff className="h-4 w-4" />
					) : (
						<Mic className="h-4 w-4" />
					)}
				</Button>

				{/* 送信ボタン */}
				<Button
					variant="default"
					size="icon"
					onClick={onSend}
					disabled={isThinking || !inputValue.trim() || isRecording}
					className="text-white rounded-md hover:scale-95 duration-150"
					style={{ backgroundColor: "#9f9579", borderColor: "#9f9579" }}
					title="送信"
				>
					<Send className="h-4 w-4" />
				</Button>

				{/* 停止 */}
				<Button
					variant="outline"
					size="icon"
					onClick={onStop}
					disabled={!isThinking}
					title="生成を停止"
				>
					<SquareSlash className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};
