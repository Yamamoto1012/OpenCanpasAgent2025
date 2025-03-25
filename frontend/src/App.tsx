import { Canvas } from "@react-three/fiber";
import "./App.css";
import VRMWrapper from "./features/VRM/VRMWrapper/VRMWrapper";
import { ChatInterface } from "./features/ChatInterface/ChatInterface";

function App() {
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

      <div className="absolute top-0 left-0 p-4 z-10">
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;