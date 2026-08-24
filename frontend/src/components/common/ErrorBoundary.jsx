import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "../ui/Button";
import { logger } from "../../utils/logger.util";

/**
 * Enterprise Production React Error Boundary
 * Catches unhandled component rendering crashes and presents a user-friendly recovery UI.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("[React ErrorBoundary] Unhandled Exception Caught in Render Tree", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-[#131B2A] border border-[#2C384E] rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold font-heading text-white">Something Went Wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected application error occurred while rendering this component. You can reload the page or return to your Dashboard to restore your session.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-[#0B0F17] border border-rose-500/20 text-left">
                <p className="text-[11px] font-mono text-rose-300 break-words">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={this.handleReload}
                className="w-full justify-center text-sm py-2.5 font-bold"
              >
                Reload Page & Restore Session
              </Button>
              <Button
                variant="outline"
                icon={Home}
                onClick={this.handleGoHome}
                className="w-full justify-center text-sm py-2 text-slate-300"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
