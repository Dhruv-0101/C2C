import React from "react";
import { FrameManagerContainer } from "../../../frames/containers/FrameManagerContainer";

/**
 * AdminFramesTab Component
 * Tab viewport rendering Canva Vector Frames Studio Manager.
 */
export const AdminFramesTab = () => {
  return (
    <div className="animate-in fade-in duration-200 w-full">
      <FrameManagerContainer />
    </div>
  );
};
