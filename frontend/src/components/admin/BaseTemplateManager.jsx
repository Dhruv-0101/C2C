import React from "react";
import { BaseTemplateManagerContainer } from "../../features/templates/containers/BaseTemplateManagerContainer";

/**
 * BaseTemplateManager Wrapper
 * Delegates rendering to BaseTemplateManagerContainer for clean separation of concerns.
 */
export const BaseTemplateManager = () => {
  return <BaseTemplateManagerContainer />;
};

export default BaseTemplateManager;
