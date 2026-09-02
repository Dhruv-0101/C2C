import React from "react";
import { FrameManagerContainer } from "../../features/frames/containers/FrameManagerContainer";

/**
 * FrameManager Wrapper
 * Transparently renders FrameManagerContainer for backward-compatibility.
 */
export const FrameManager = () => {
  return <FrameManagerContainer />;
};

export default FrameManager;
