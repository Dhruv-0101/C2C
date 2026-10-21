import React, { useState, useEffect, useRef } from "react";
import { Mail, Clock, RefreshCw, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";

/**
 * OtpVerificationModal
 * Modern 4-digit OTP verification modal for user registration.
 * Features 4 auto-advancing PIN input boxes, 120-second resend countdown, and paste support.
 */
export const OtpVerificationModal = ({
  isOpen,
  email,
  onVerify,
  onResend,
  onClose,
  isVerifying,
  isResending,
  verifyError,
  resendSuccessMessage,
  initialCooldown = 120,
  devOtp,
}) => {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [cooldown, setCooldown] = useState(initialCooldown);
  const inputRefs = useRef([]);

  // Auto-focus first input box when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", ""]);
      setCooldown(initialCooldown);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen, initialCooldown]);

  // 120-second countdown timer interval
  useEffect(() => {
    if (!isOpen || cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  if (!isOpen) return null;

  const fullCode = digits.join("");
  const isComplete = fullCode.length === 4;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleDigitChange = (index, value) => {
    // Only accept numeric characters
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    const digit = cleanValue.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);

    // Auto-advance focus to next slot
    if (index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Auto-backtrack on backspace if current slot is empty
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pastedData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 4; i++) {
      if (pastedData[i]) {
        nextDigits[i] = pastedData[i];
      }
    }
    setDigits(nextDigits);

    // Focus last filled digit or 4th digit
    const focusIndex = Math.min(pastedData.length, 3);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isComplete && !isVerifying) {
      onVerify(fullCode);
    }
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || isResending) return;
    await onResend();
    setCooldown(initialCooldown);
    setDigits(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="w-full max-w-md bg-[#131B2A] border border-[#2C384E] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-modal-title"
      >
        {/* Top Icon Badge & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-glow">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h3 id="otp-modal-title" className="font-heading text-xl sm:text-2xl font-extrabold text-white">
            Verify Your Email
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
            We sent a 4-digit verification code to
            <br />
            <span className="font-semibold text-slate-200 break-all">{email}</span>
          </p>
        </div>

        {/* Development Mode Helper Badge */}
        {devOtp && (
          <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs text-center font-mono animate-in fade-in">
            ⚡ <strong>Dev Mode Code:</strong> <span className="font-bold text-white tracking-widest text-sm bg-black/40 px-2 py-0.5 rounded border border-amber-500/40">{devOtp}</span>
          </div>
        )}

        {/* Resend Success Banner */}
        {resendSuccessMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resendSuccessMessage}</span>
          </div>
        )}

        {/* Verification Error Alert */}
        {verifyError && (
          <Alert
            variant="error"
            title="Verification Failed"
            message={verifyError.message || "Invalid or expired code. Please try again."}
          />
        )}

        {/* 4-Digit Input Boxes */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                disabled={isVerifying}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl sm:text-3xl font-extrabold font-mono rounded-2xl border transition-all duration-200 outline-none select-all ${
                  digit
                    ? "bg-[#1E293B] border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10 scale-105"
                    : "bg-[#0B0F17] border-[#2C384E] text-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15"
                } ${isVerifying ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            ))}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={!isComplete || isVerifying}
            isLoading={isVerifying}
            className="w-full py-3 text-sm font-bold shadow-lg shadow-amber-500/20"
          >
            {isVerifying ? "Verifying & Creating Account..." : "Verify & Complete Registration ✨"}
          </Button>

          {/* Resend Cooldown Counter & Action */}
          <div className="flex flex-col items-center gap-2 pt-1 border-t border-[#2C384E]/70 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {cooldown > 0 ? (
                <span>
                  Resend code in <strong className="text-amber-400 font-mono">{formatTime(cooldown)}</strong>
                </span>
              ) : (
                <span className="text-slate-300">Didn't receive the code?</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResendClick}
              disabled={cooldown > 0 || isResending || isVerifying}
              className={`inline-flex items-center gap-1.5 font-semibold text-xs transition-colors ${
                cooldown > 0 || isResending || isVerifying
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
              {isResending ? "Sending New Code..." : "Resend Verification Code"}
            </button>
          </div>

          {/* Back / Change Email Option */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Entered the wrong email? Edit details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
