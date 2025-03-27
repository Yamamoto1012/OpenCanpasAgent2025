import { Canvas } from "@react-three/fiber";
import "./App.css";
import VRMWrapper from "./features/VRM/VRMWrapper/VRMWrapper";
import { ChatInterface } from "./features/ChatInterface/ChatInterface";
import { useState } from "react";
import { Info, Volume2, VolumeX } from "lucide-react";
import { InfoPanel } from "./features/InfoPanel/InfoPanel";
import { IconButton } from "./features/IconButton/IconButton";
import { CategoryNavigator } from "./features/CategorySelection/CategoryNavigator";
import { motion, AnimatePresence } from "framer-motion";

function App() {
	const [showInfo, setShowInfo] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [categoryDepth, setCategoryDepth] = useState(0);
	const [showChat, setShowChat] = useState(true);

	// サブサブカテゴリーが選択されたときのハンドラー
	const handleCategorySelect = (depth: number) => {
		setCategoryDepth(depth);
		// サブサブカテゴリーが選択されたらチャットを非表示にする
		setShowChat(depth < 2);
	};

	return (
		<div className="relative w-screen h-screen overflow-hidden">
			<div className="absolute inset-0">
				<Canvas
					flat
					camera={{
						fov: 45,
						near: 0.1,
						far: 2000,
						position: [0, 1.4, categoryDepth >= 2 ? -0.5 : 1],
						rotation: [0, categoryDepth >= 2 ? Math.PI / 8 : 0, 0],
					}}
				>
					<gridHelper />
					<VRMWrapper categoryDepth={categoryDepth} />
					<ambientLight />
					<directionalLight position={[5, 5, 5]} intensity={2} />
				</Canvas>
			</div>

			<div className="absolute top-1/11 right-2">
				<CategoryNavigator onCategoryDepthChange={handleCategorySelect} />
			</div>

			<AnimatePresence>
				{showChat && (
					<motion.div
						className="absolute top-1/11 left-2 p-4 z-10"
						initial={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -100 }}
						transition={{ duration: 0.3 }}
					>
						<ChatInterface />
					</motion.div>
				)}
			</AnimatePresence>

			<div className="absolute bottom-1/12 right-2 p-4 z-10">
				<IconButton icon={Info} onClick={() => setShowInfo(!showInfo)} />
			</div>
			<div className="absolute bottom-2/12 right-2 p-4 z-10">
				<IconButton
					icon={isMuted ? VolumeX : Volume2}
					onClick={() => setIsMuted(!isMuted)}
				/>
			</div>
			{showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}
		</div>
	);
}

export default App;
