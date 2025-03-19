import { Suspense } from "react";
import VRMAsset from "../VRMRender/VRMRender"

export default function VRMWrapper() {
  return (
    <Suspense >
      <VRMAsset url="../../../../public/Model/KIT_VRM0.0.vrm" />
    </Suspense>
  )
}