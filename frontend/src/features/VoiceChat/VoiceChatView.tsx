import { motion } from "framer-motion";
import { Mic, Info, Loader2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useRef } from "react";
import type { ProcessingState } from "./VoiceChat";

type ChatMessage = {
	role: "user" | "assistant";
	content: string;
};

export type VoiceChatViewProps = {
	isListening: boolean;
	transcript: string;
	aiResponse: string;
	circleSize: number;
	audioLevel: number;
	processingState: ProcessingState;
	chatHistory: ChatMessage[];
	onStartListening: () => void;
	onStopListening: () => void;
	onClose?: () => void;
};

export const VoiceChatView = ({
	isListening,
	transcript,
	aiResponse,
	audioLevel,
	processingState,
	chatHistory,
	onStartListening,
	onStopListening,
}: VoiceChatViewProps) => {
	const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	// チャット履歴が更新されたらスクロールを一番下に
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}, [chatHistory]);

	// Canvas波形のアニメーション
	useEffect(() => {
		if (!isListening || !waveformCanvasRef.current) return;

		const drawWaveform = () => {
			const canvas = waveformCanvasRef.current;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const width = canvas.width;
			const height = canvas.height;

			ctx.clearRect(0, 0, width, height);
			ctx.lineWidth = 2;
			ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
			ctx.beginPath();

			// 簡易的な波形生成
			const sliceWidth = width / 50;
			let x = 0;

			for (let i = 0; i < 50; i++) {
				const v = 0.5 + Math.random() * audioLevel * 0.5;
				const y = v * height;

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}

				x += sliceWidth;
			}

			ctx.lineTo(width, height / 2);
			ctx.stroke();
		};

		const animationId = setInterval(drawWaveform, 50);
		return () => clearInterval(animationId);
	}, [isListening, audioLevel]);

	// 処理状態に応じたメッセージを取得
	const getStatusMessage = () => {
		switch (processingState) {
			case "recording":
				return "音声を認識しています...";
			case "processing":
				return "音声を処理しています...";
			case "thinking":
				return "回答を考えています...";
			case "responding":
				return "応答中...";
			case "waiting":
				return "マイクをクリックして続けてください";
			default:
				return "マイクボタンをクリックして話しかけてください";
		}
	};

	// 会話表示の切り替え
	const renderChat = () => {
		// 会話履歴がある場合は最新メッセージのみを表示
		if (chatHistory.length > 0) {
			const latestUserMessage = [...chatHistory]
				.reverse()
				.find((message) => message.role === "user");

			const latestAIMessage = [...chatHistory]
				.reverse()
				.find((message) => message.role === "assistant");

			return (
				<div className="flex flex-col w-full h-full justify-between">
					{/* AIの返答 */}
					{latestAIMessage && (
						<div className="w-full max-w-md mx-auto pt-4 pb-2">
							<div className="bg-[#b3cfad] text-gray-100 px-4 py-2 rounded-lg">
								{latestAIMessage.content}
							</div>
						</div>
					)}

					{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
					<div className="flex-1"></div>

					{/* ユーザーの入力 */}
					{latestUserMessage && (
						<div className="w-full max-w-md mx-auto pb-4">
							<div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
								{latestUserMessage.content}
							</div>
						</div>
					)}

					{/* 現在入力中のテキスト */}
					{isListening && transcript && (
						<div className="w-full max-w-md mx-auto pb-2">
							<div className="bg-gray-700 text-white px-4 py-2 rounded-lg opacity-70">
								{transcript}
							</div>
						</div>
					)}
				</div>
			);
		}

		return (
			<div className="flex-1 flex flex-col items-center justify-center">
				{/* 波形の可視化 */}
				{isListening && (
					<div className="w-full max-w-[280px]">
						<canvas
							ref={waveformCanvasRef}
							width={280}
							height={80}
							className="w-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg opacity-80"
						/>
					</div>
				)}

				{/* テキスト表示エリア */}
				<motion.div
					className="text-center px-10 pt-3"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					{processingState === "processing" ||
					processingState === "thinking" ? (
						<div className="flex flex-col items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin text-purple-500" />
							<span className="text-sm text-gray-400">
								{getStatusMessage()}
							</span>
						</div>
					) : isListening ? (
						<p className="text-md font-medium text-gray-500">
							{transcript || "話しかけてください..."}
						</p>
					) : (
						<div className="flex flex-col items-center w-full">
							<p className="text-gray-500">{getStatusMessage()}</p>
						</div>
					)}
				</motion.div>
			</div>
		);
	};

	return (
		<div className="flex flex-col items-center justify-between w-full h-full py-8 px-6 relative rounded-2xl">
			{/* 録音インジケーター - 点滅する赤い丸 */}
			{isListening && (
				<motion.div
					className="absolute top-4 right-4 h-3 w-3 rounded-full bg-red-500"
					animate={{
						opacity: [0.5, 1, 0.5],
						scale: [0.8, 1.2, 0.8],
					}}
					transition={{
						repeat: Number.POSITIVE_INFINITY,
						duration: 1.5,
						ease: "easeInOut",
					}}
				/>
			)}

			{/* 中央部分 - チャット表示または音声入力表示 */}
			{renderChat()}

			{/* 下部エリア - 説明とボタン */}
			<div className="mt-auto flex flex-col items-center gap-6 w-full pb-6">
				<div className="flex items-center justify-center gap-2 text-sm text-gray-300">
					<span>{getStatusMessage()}</span>
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full h-6 w-6 text-gray-300 hover:text-white"
							>
								<Info className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>音声チャットについて</DialogTitle>
								<DialogDescription>
									このインターフェースでは、マイクボタンをクリックして音声入力を開始できます。
									音声は自動的にテキストに変換され、AIが応答します。
									停止ボタンをクリックするか、一定の間隔の後自動的に音声認識が停止します。
								</DialogDescription>
							</DialogHeader>
						</DialogContent>
					</Dialog>
				</div>

				<div className="flex gap-4">
					<Button
						onClick={onStartListening}
						disabled={
							isListening ||
							processingState === "thinking" ||
							processingState === "responding"
						}
						className="bg-[#b3cfad] hover:bg-[#c3e6d8] text-white rounded-full h-14 w-14 flex items-center justify-center"
					>
						<Mic className="h-6 w-6" />
					</Button>

					<Button
						onClick={onStopListening}
						disabled={!isListening}
						className="bg-gray-800 hover:bg-gray-700 text-white rounded-full h-14 w-14 flex items-center justify-center font-bold"
					>
						<StopCircle className="h-6 w-6" />
					</Button>
				</div>
			</div>
		</div>
	);
};
