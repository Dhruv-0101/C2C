import { useState, useEffect, useRef, useCallback } from 'react';
import { getAiJobStatus } from '../api/ai.api';

/**
 * ⏱️ useAiJobTracker Hook
 * Manages real-time polling, dynamic queue positioning, and ticking countdown timer
 * for BullMQ asynchronous AI jobs.
 *
 * @param {Object} options
 * @param {'image' | 'caption'} [options.type='image']
 * @param {(result: any) => void} [options.onCompleted]
 * @param {(err: any) => void} [options.onError]
 */
export function useAiJobTracker({ type = 'image', onCompleted, onError } = {}) {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'FAILED'
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedWaitSeconds, setEstimatedWaitSeconds] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('IN_QUEUE'); // 'IN_QUEUE' | 'GENERATING_AI' | 'UPLOADING_CDN' | 'COMPLETED' | 'FAILED'
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const isCompletedRef = useRef(false);

  // Clear all background timers cleanly
  const clearAllTimers = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearAllTimers();
    setJobId(null);
    setStatus('IDLE');
    setQueuePosition(0);
    setEstimatedWaitSeconds(0);
    setCountdownSeconds(0);
    setProgress(0);
    setStep('IN_QUEUE');
    setResult(null);
    setError(null);
    isCompletedRef.current = false;
  }, [clearAllTimers]);

  // Poll server for latest job status
  const pollStatus = useCallback(
    async (targetJobId) => {
      if (!targetJobId || isCompletedRef.current) return;

      try {
        const response = await getAiJobStatus(targetJobId, type);
        const data = response?.data || response;

        if (!data) return;

        setStatus(data.status);
        if (data.progress !== undefined) setProgress(data.progress);
        if (data.step) setStep(data.step);

        if (data.status === 'WAITING') {
          setQueuePosition(data.queuePosition || 1);
          if (data.estimatedWaitSeconds !== undefined) {
            setEstimatedWaitSeconds(data.estimatedWaitSeconds);
            // Smoothly synchronize local countdown if drift exceeds 3 seconds
            setCountdownSeconds((prev) => {
              if (Math.abs(prev - data.estimatedWaitSeconds) > 3) {
                return data.estimatedWaitSeconds;
              }
              return prev > 0 ? prev : data.estimatedWaitSeconds;
            });
          }
        } else if (data.status === 'ACTIVE') {
          setQueuePosition(0);
          setEstimatedWaitSeconds(Math.max(1, data.estimatedWaitSeconds || 2));
        } else if (data.status === 'COMPLETED') {
          isCompletedRef.current = true;
          clearAllTimers();
          setProgress(100);
          setStep('COMPLETED');
          setResult(data.result);
          if (typeof onCompleted === 'function') {
            onCompleted(data.result);
          }
        } else if (data.status === 'FAILED') {
          isCompletedRef.current = true;
          clearAllTimers();
          const errObj = new Error(data.error || 'AI generation failed');
          setError(errObj);
          setStep('FAILED');
          if (typeof onError === 'function') {
            onError(errObj);
          }
        }
      } catch (err) {
        // If 404 or network blip, continue polling until server responds
        console.warn('[useAiJobTracker] Polling status warning:', err.message);
      }
    },
    [type, onCompleted, onError, clearAllTimers]
  );

  // Start tracking a newly enqueued BullMQ job
  const startTracking = useCallback(
    (initialJobData) => {
      reset();
      const targetJobId = initialJobData?.jobId;
      if (!targetJobId) return;

      setJobId(targetJobId);
      setStatus(initialJobData.status || 'WAITING');
      const initialPos = initialJobData.queuePosition || 1;
      const initialWait = initialJobData.estimatedWaitSeconds || 4;

      setQueuePosition(initialPos);
      setEstimatedWaitSeconds(initialWait);
      setCountdownSeconds(initialWait);
      setProgress(10);
      setStep(initialJobData.step || 'IN_QUEUE');

      // 1. Start ticking local countdown every 1s
      countdownIntervalRef.current = setInterval(() => {
        setCountdownSeconds((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);

      // 2. Start polling server status every 2s
      pollIntervalRef.current = setInterval(() => {
        pollStatus(targetJobId);
      }, 2000);

      // Immediate initial poll
      pollStatus(targetJobId);
    },
    [reset, pollStatus]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    jobId,
    status,
    isTracking: status === 'WAITING' || status === 'ACTIVE',
    queuePosition,
    estimatedWaitSeconds,
    countdownSeconds,
    progress,
    step,
    result,
    error,
    startTracking,
    stopTracking: clearAllTimers,
    reset,
  };
}

export default useAiJobTracker;
