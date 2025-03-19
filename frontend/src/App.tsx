import { Canvas } from '@react-three/fiber'
import './App.css'
import VRMWrapper from './features/VRM/VRMWrapper/VRMWrapper'

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh"}}>
      <Canvas flat camera={{
         fov: 45,  //画角
         near: 0.1,//描画距離（最小）
         far: 2000,//描画距離（最大）
         position: [0, 1.4, 1],//位置を調整する
         rotation: [0, 0, 0]
      }}>
        <gridHelper />
        <VRMWrapper />
        <ambientLight />
        <directionalLight position={[5, 5, 5]} intensity={2} />
      </Canvas>
    </div>
  )
}

export default App
