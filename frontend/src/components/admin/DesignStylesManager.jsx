import React from "react";
import { DesignStylesManagerContainer } from "../../features/design-styles/containers/DesignStylesManagerContainer";

/**
 * DesignStylesManager Wrapper
 * Delegates rendering to DesignStylesManagerContainer for clean separation of concerns.
 */
export const DesignStylesManager = () => {
  return <DesignStylesManagerContainer />;
};

export default DesignStylesManager;
