import { Canvas } from "@react-three/fiber";
import "./App.css";
import VRMWrapper from "./features/VRM/VRMWrapper/VRMWrapper";
import { ChatInterface } from "./features/ChatInterface/ChatInterface";
import { useState } from "react";

import { Button } from "./components/ui/button";
import { Info } from "lucide-react";
import { InfoPanel } from "./features/InfoPanel/InfoPanel";

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

      <div className="absolute top-1/11 left-2 p-4 z-10">
        <ChatInterface />
      </div>
      <div className="absolute top-1/11 right-2 p-4 z-10">
        <Button
          onClick={() => setShowInfo(!showInfo)}
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 bg-[#b3cfad] backdrop-blur-md border-white/20 text-white hover:bg-white/20"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>
      {showInfo && <InfoPanel onClose={() => setShowInfo(false)} />}
    </div>
  );
}

export default App;
