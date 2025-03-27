import { Canvas } from "@react-three/fiber";
import "./App.css";
import VRMWrapper from "./features/VRM/VRMWrapper/VRMWrapper";
import { ChatInterface } from "./features/ChatInterface/ChatInterface";
import { useState } from "react";
import { Info, Volume2 } from "lucide-react";
import { InfoPanel } from "./features/InfoPanel/InfoPanel";
import { CategoryButton } from "./features/CategoryButton/CategoryButton";
import { IconButton } from "./features/IconButton/IconButton";

function App() {
	const [showInfo, setShowInfo] = useState(false);

	return (
		<div className="relative w-screen h-screen overflow-hidden">
			<div className="absolute inset-0">
				<Canvas
					flat
					camera={{
						fov: 45, //画角
						near: 0.1, //描画距離（最小）
						far: 2000, //描画距離（最大）
						position: [0, 1.4, 1], //位置を調整する
						rotation: [0, 0, 0],
					}}
				>
					<gridHelper />
					<VRMWrapper />
					<ambientLight />
					<directionalLight position={[5, 5, 5]} intensity={2} />
				</Canvas>
			</div>

			<div className="absolute top-1/11 right-2">
				<CategoryButton />
			</div>
			<div className="absolute top-1/11 left-2 p-4 z-10">
				<ChatInterface />
			</div>
			<div className="absolute bottom-1/12 right-2 p-4 z-10">
				<IconButton icon={Info} onClick={() => setShowInfo(!showInfo)} />
			</div>
			<div className="absolute bottom-2/12 right-2 p-4 z-10">
				<IconButton
					icon={Volume2}
					onClick={() => console.log("音声ボタン押下")}
				/>
			</div>
			{showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}
		</div>
	);
}

export default App;
