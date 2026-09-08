import React from "react";
import { DesignStylesManagerContainer } from "../../../design-styles/containers/DesignStylesManagerContainer";

/**
 * AdminStylesTab Component
 * Tab viewport rendering Design System & Color Tokens Manager.
 */
export const AdminStylesTab = () => {
  return (
    <div className="animate-in fade-in duration-200 w-full">
      <DesignStylesManagerContainer />
    </div>
  );
};
