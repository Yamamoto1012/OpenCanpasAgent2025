import { useRef, useEffect } from "react";
import type React from "react";
import { Mic, MicOff, Send, SquareSlash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceWaveform } from "@/features/VoiceWaveform/VoiceWaveform";

export type ChatInputAreaProps = {
	inputValue: string;
	isThinking: boolean;
	isRecording: boolean;
	onInputChange: React.ChangeEventHandler<HTMLTextAreaElement>;
	onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
	onSend: () => void;
	onToggleRecording: () => void;
	onStop: () => void;
};

/**
 * チャット入力エリアコンポーネント
 * @param inputValue - 入力フィールドの値
 * @param isThinking - 応答中かどうかのフラグ
 * @param isRecording - 音声入力中かどうかのフラグ
 * @param onInputChange - 入力値変更時のハンドラ
 * @param onKeyDown - キー入力時のハンドラ
 * @param onSend - 送信ボタン押下時のハンドラ
 * @param onToggleRecording - 音声入力のトグルハンドラ
 * @param onStop - 音声入力停止時のハンドラ
 */

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
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// 入力内容に応じて高さを自動調整
	const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
		const textarea = e.currentTarget;
		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	// valueが変わるたびに高さを再計算
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	}, [inputValue]);

	return (
		<div
			style={{ backgroundColor: "#b3cfad" }}
			className="px-3 py-2 md:px-3 md:py-2"
		>
			{/* 録音中の波形表示 */}
			{isRecording && <VoiceWaveform isRecording={isRecording} />}

			{/* 入力エリア */}
			<div className="flex items-end gap-2">
				<textarea
					ref={textareaRef}
					value={inputValue}
					onChange={onInputChange}
					onKeyDown={onKeyDown}
					onInput={handleInput}
					placeholder={
						isRecording ? "音声を認識しています..." : "質問を入力..."
					}
					disabled={isThinking || isRecording}
					rows={1}
					className={`
						resize-none w-full rounded-md border-0 
						px-3 py-3 md:px-3 md:py-2 
						text-base md:text-base 
						bg-white 
						focus-visible:ring-2 focus-visible:ring-[#9f9579] 
						focus-visible:outline-none 
						transition-all
						touch-manipulation
						${isRecording ? "bg-red-50" : ""}
					`}
					style={{
						minHeight: 48,
						maxHeight: 200,
						lineHeight: 1.5,
						overflow: "hidden",
					}}
				/>

				{/* ボタンコンテナ */}
				<div className="flex gap-2 flex-shrink-0">
					{/* マイクボタン */}
					<Button
						variant={isRecording ? "destructive" : "outline"}
						size="icon"
						onClick={onToggleRecording}
						className={`
							flex-shrink-0 
							h-12 w-12 md:h-11 md:w-11 
							touch-manipulation
							${isRecording ? "animate-pulse" : ""}
						`}
						disabled={isThinking}
						title={isRecording ? "録音を停止" : "音声で質問"}
					>
						{isRecording ? (
							<MicOff className="h-5 w-5 md:h-4 md:w-4" />
						) : (
							<Mic className="h-5 w-5 md:h-4 md:w-4" />
						)}
					</Button>

					{/* 送信ボタン */}
					<Button
						variant="default"
						size="icon"
						onClick={onSend}
						disabled={isThinking || !inputValue.trim() || isRecording}
						className="
							text-white rounded-md hover:scale-95 duration-150 
							h-12 w-12 md:h-11 md:w-11
							touch-manipulation
						"
						style={{ backgroundColor: "#9f9579", borderColor: "#9f9579" }}
						title="送信"
					>
						<Send className="h-5 w-5 md:h-4 md:w-4" />
					</Button>

					{/* 停止ボタン */}
					<Button
						variant="outline"
						size="icon"
						onClick={onStop}
						disabled={!isThinking}
						className="
							h-12 w-12 md:h-11 md:w-11
							touch-manipulation
						"
						title="生成を停止"
					>
						<SquareSlash className="h-5 w-5 md:h-4 md:w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
};
