import React from 'react';
import clsx from 'clsx';
import { 
  Server, 
  Database, 
  Cpu, 
  Sparkles, 
  Share2, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Activity
} from 'lucide-react';

const CATEGORY_ICONS = {
  API: Server,
  DATABASE: Database,
  QUEUE: Cpu,
  AI_SERVICES: Sparkles,
  INTEGRATIONS: Share2,
  STORAGE: HardDrive,
};

/**
 * 🩺 ServiceHealthCard
 * Displays individual component status, response time, and purpose.
 */
export const ServiceHealthCard = ({ service }) => {
  const IconComponent = CATEGORY_ICONS[service.category] || Activity;
  const isOperational = service.status === 'OPERATIONAL';
  const isDegraded = service.status === 'DEGRADED';
  const isDown = service.status === 'DOWN';

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-[#2C384E] bg-[#131B2A]/90 hover:border-slate-600 transition-all duration-200 flex flex-col justify-between gap-3 shadow-lg">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-white line-clamp-1">
                {service.name}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {service.category.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={clsx(
              'px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shrink-0 border',
              isOperational && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
              isDegraded && 'bg-amber-500/10 text-amber-400 border-amber-500/30',
              isDown && 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            )}
          >
            {isOperational && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Operational</span>
              </>
            )}
            {isDegraded && (
              <>
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Degraded</span>
              </>
            )}
            {isDown && (
              <>
                <XCircle className="w-3 h-3 text-rose-400" />
                <span>Outage</span>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {service.description}
        </p>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-slate-500" />
          <span>Latency:</span>
          <strong className="text-slate-200 font-semibold">{service.latencyMs}ms</strong>
        </span>

        {service.version && (
          <span className="px-1.5 py-0.5 rounded bg-slate-800/70 text-slate-400 font-mono text-[10px]">
            {service.version}
          </span>
        )}
      </div>
    </div>
  );
};
