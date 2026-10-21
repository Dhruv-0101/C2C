import React from 'react';
import {
  Clock,
  Sparkles,
  Layers,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Flame,
} from 'lucide-react';

/**
 * ⏱️ AiQueueTrackerCard Component
 * High-end enterprise queue progress card featuring dynamic countdown timer,
 * live queue positioning, animated glowing progress bar, and 4-step milestone tracker.
 *
 * @param {Object} props
 * @param {string} props.status - 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'FAILED'
 * @param {number} props.queuePosition - Position ahead in queue (1, 2, 3...)
 * @param {number} props.countdownSeconds - Current ticking countdown seconds
 * @param {number} props.progress - 0 to 100 percentage
 * @param {string} props.step - 'IN_QUEUE' | 'GENERATING_AI' | 'UPLOADING_CDN' | 'COMPLETED' | 'FAILED'
 * @param {string} [props.title] - Optional custom title
 * @param {() => void} [props.onMinimize] - Optional handler to minimize / run in background
 */
export const AiQueueTrackerCard = ({
  status,
  queuePosition = 1,
  countdownSeconds = 5,
  progress = 15,
  step = 'IN_QUEUE',
  title = 'AI Generation Queue',
  onMinimize,
}) => {
  const isWaiting = status === 'WAITING';
  const isActive = status === 'ACTIVE';
  const isCompleted = status === 'COMPLETED';
  const isFailed = status === 'FAILED';

  // Determine active step index (0: Queued, 1: AI Generating, 2: CDN Upload, 3: Completed)
  let activeStepIndex = 0;
  if (step === 'GENERATING_AI' || (isActive && progress < 75)) activeStepIndex = 1;
  else if (step === 'UPLOADING_CDN' || (isActive && progress >= 75)) activeStepIndex = 2;
  else if (isCompleted || step === 'COMPLETED') activeStepIndex = 3;

  const STEPS = [
    { label: 'In Queue', icon: Layers },
    { label: 'AI Generating', icon: Sparkles },
    { label: 'CDN Optimize', icon: CloudUpload },
    { label: 'Ready', icon: CheckCircle2 },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#162032] via-[#0F1726] to-[#0A0E17] border border-amber-500/30 p-4 sm:p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      {/* Background ambient glow effect */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Badge & Live Countdown Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#243147]/80">
        <div className="flex items-center gap-2">
          {isWaiting ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Position #{queuePosition} in Queue</span>
            </span>
          ) : isActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Processing with AI Engine</span>
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Asset Generation Complete</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Generation Stopped</span>
            </span>
          )}

          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            {title}
          </span>
        </div>

        {/* Dynamic Countdown Timer */}
        {!isCompleted && !isFailed && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#090D15] border border-[#243147] text-amber-300/90 shadow-inner self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span className="text-[11px] font-bold text-slate-400">Estimated Wait:</span>
            <span className="text-xs font-extrabold font-mono text-amber-300">
              ~{countdownSeconds}s
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar with Glow & Shimmer */}
      <div className="py-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isWaiting
                ? `Waiting behind ${queuePosition - 1 > 0 ? `${queuePosition - 1} creator(s)` : 'other jobs'}`
                : isActive
                ? 'Synthesizing visual details...'
                : isCompleted
                ? 'Ready for canvas!'
                : 'Process error'}
            </span>
          </span>
          <span className="font-mono text-amber-300 text-xs font-bold">
            {progress}%
          </span>
        </div>

        <div className="relative w-full h-2.5 bg-[#090D15] rounded-full overflow-hidden border border-[#243147]">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-emerald'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-glow'
            }`}
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
      </div>

      {/* 4-Step Milestone Progress Tracker */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1 pb-2">
        {STEPS.map((stepItem, idx) => {
          const Icon = stepItem.icon;
          const isDone = idx < activeStepIndex || isCompleted;
          const isCurrent = idx === activeStepIndex && !isCompleted;

          return (
            <div
              key={stepItem.label}
              className={`flex flex-col items-center text-center p-2 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : isCurrent
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm animate-pulse'
                  : 'bg-[#090D15]/60 border-[#243147]/50 text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4 mb-1 shrink-0" />
              <span className="text-[10px] font-bold leading-tight truncate w-full">
                {stepItem.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Minimize / Background Notice */}
      {onMinimize && !isCompleted && !isFailed && (
        <div className="pt-2 flex items-center justify-between border-t border-[#243147]/60 text-[11px] text-slate-400">
          <span className="truncate pr-2">
            💡 Safe to close modal or switch tabs; processing continues in background.
          </span>
          <button
            type="button"
            onClick={onMinimize}
            className="text-amber-300 hover:text-amber-200 font-bold shrink-0 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <EyeOff className="w-3 h-3" />
            <span>Minimize</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AiQueueTrackerCard;
