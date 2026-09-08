import React from "react";
import { AdminFestivalManagerView } from "../AdminFestivalManagerView";

/**
 * AdminFestivalsTab Component
 * Tab viewport rendering Festival & Special Days Calendar Manager.
 */
export const AdminFestivalsTab = () => {
  return (
    <div className="animate-in fade-in duration-200 w-full">
      <AdminFestivalManagerView />
    </div>
  );
};
