import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/features/auth/validations/auth.validation";
import { useRegister } from "../hooks/useRegister";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { RegisterForm } from "../components/RegisterForm";
import { OtpVerificationModal } from "../components/OtpVerificationModal";

/**
 * RegisterPage
 * Canonical Page component handling form state, Zod validation, and two-step OTP account registration.
 */
export const RegisterPage = () => {
  const {
    initiateRegistration,
    verifyAndRegister,
    resendOtp,
    closeOtpModal,
    isOtpModalOpen,
    pendingEmail,
    isSendingOtp,
    isRegistering,
    sendOtpError,
    registerError,
    resendSuccessMessage,
    successMessage: regSuccess,
    devOtp,
  } = useRegister();

  const {
    mutate: googleAuth,
    isPending: isGooglePending,
    error: googleError,
    successMessage: googleSuccess,
  } = useGoogleAuth();

  const successMessage = regSuccess || googleSuccess;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data) => {
    initiateRegistration(data);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      sessionStorage.setItem("just_authenticated", "register");
      googleAuth({ idToken: credentialResponse.credential });
    }
  };

  const activeError = sendOtpError || googleError;
  const isCreating = isSendingOtp || isGooglePending;

  return (
    <>
      <RegisterForm
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        onSubmit={onSubmit}
        handleGoogleSuccess={handleGoogleSuccess}
        activeError={activeError}
        isCreating={isCreating}
        successMessage={successMessage}
      />

      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        email={pendingEmail}
        onVerify={verifyAndRegister}
        onResend={resendOtp}
        onClose={closeOtpModal}
        isVerifying={isRegistering}
        isResending={isSendingOtp}
        verifyError={registerError}
        resendSuccessMessage={resendSuccessMessage}
        initialCooldown={120}
        devOtp={devOtp}
      />
    </>
  );
};

export default RegisterPage;

