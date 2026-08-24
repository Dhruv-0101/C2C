import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

/**
 * ThemeToggle Component
 * Header action toggle for switching between Dark & Light themes with smooth micro-animations.
 */
export const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 group ${
        isDark
          ? "bg-[#131B2A] border-[#2C384E] text-amber-400 hover:bg-slate-800 hover:border-amber-500/50 shadow-md"
          : "bg-white border-slate-200 text-indigo-600 hover:bg-slate-100 hover:border-indigo-400 shadow-sm"
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300 fill-amber-400/20" />
          <span className="text-xs font-bold text-slate-200 group-hover:text-white hidden sm:inline">
            Light Mode
          </span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300 fill-indigo-600/20" />
          <span className="text-xs font-bold text-slate-800 group-hover:text-slate-950 hidden sm:inline">
            Dark Mode
          </span>
        </>
      )}
    </button>
  );
};
