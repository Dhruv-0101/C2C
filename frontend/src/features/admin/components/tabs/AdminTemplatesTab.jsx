import React from "react";
import { BaseTemplateManagerContainer } from "../../../templates/containers/BaseTemplateManagerContainer";

/**
 * AdminTemplatesTab Component
 * Tab viewport rendering AI Base Templates Manager.
 */
export const AdminTemplatesTab = () => {
  return (
    <div className="animate-in fade-in duration-200 w-full">
      <BaseTemplateManagerContainer />
    </div>
  );
};
