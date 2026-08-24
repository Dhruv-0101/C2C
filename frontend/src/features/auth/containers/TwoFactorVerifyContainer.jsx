import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authApi } from "../../../services/auth.api";
import { setCredentials } from "../../../store/slices/authSlice";
import { TwoFactorVerifyView } from "../components/TwoFactorVerifyView";

/**
 * TwoFactorVerifyContainer
 * Container component handling 2FA OTP/backup code verification, keyboard input listeners, and Redux credentials dispatch.
 */
export const TwoFactorVerifyContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const mfaToken = location.state?.mfaToken;
  const [isBackupMode, setIsBackupMode] = useState(false);

  const codeLength = isBackupMode ? 8 : 6;
  const [codeSlots, setCodeSlots] = useState(Array(codeLength).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    setCodeSlots(Array(codeLength).fill(""));
    inputRefs.current = inputRefs.current.slice(0, codeLength);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [isBackupMode, codeLength]);

  const verifyMutation = useMutation({
    mutationFn: (payload) => authApi.verifyLogin2FA(payload),
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      dispatch(setCredentials({ user, accessToken }));

      if (user?.isSuperAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else if (user?.isSubAdmin) {
        navigate("/subadmin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
  });

  const fullCode = codeSlots.join("");

  const handleInputChange = (index, value) => {
    const val = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!val && value !== "") return;

    const newSlots = [...codeSlots];
    newSlots[index] = val.slice(-1);
    setCodeSlots(newSlots);

    if (val && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!codeSlots[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newSlots = [...codeSlots];
        newSlots[index - 1] = "";
        setCodeSlots(newSlots);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (!pastedText) return;

    const newSlots = [...codeSlots];
    for (let i = 0; i < codeLength; i++) {
      if (pastedText[i]) {
        newSlots[i] = pastedText[i];
      }
    }
    setCodeSlots(newSlots);

    const focusIndex = Math.min(pastedText.length, codeLength - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (fullCode.length < codeLength || !mfaToken) return;

    verifyMutation.mutate({
      mfaToken,
      code: fullCode,
    });
  };

  return (
    <TwoFactorVerifyView
      mfaToken={mfaToken}
      isBackupMode={isBackupMode}
      setIsBackupMode={setIsBackupMode}
      codeLength={codeLength}
      codeSlots={codeSlots}
      inputRefs={inputRefs}
      fullCode={fullCode}
      verifyMutation={verifyMutation}
      handleInputChange={handleInputChange}
      handleKeyDown={handleKeyDown}
      handlePaste={handlePaste}
      handleVerify={handleVerify}
    />
  );
};
