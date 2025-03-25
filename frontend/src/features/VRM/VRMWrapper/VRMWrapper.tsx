import { Suspense } from "react";
import VRMAsset from "../VRMRender/VRMRender";

export default function VRMWrapper() {
  const vrmOptions = {
    vrmUrl: "/Model/KIT_VRM0.0.vrm",
    vrmaUrl: "/Motion/VRMA_02.vrma",
    autoPlay: true
  }
  return (
    <Suspense>
      <VRMAsset {...vrmOptions} />
    </Suspense>
  );
}
