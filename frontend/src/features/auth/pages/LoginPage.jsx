import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/features/auth/validations/auth.validation";
import { STORAGE_KEYS } from "@/shared/constants";
import { useLogin } from "../hooks/useLogin";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { LoginForm } from "../components/LoginForm";

/**
 * LoginPage
 * Canonical Page component managing form state, Zod validation, and login/Google auth mutations.
 */
export const LoginPage = () => {
  const {
    mutate: login,
    isPending,
    error: apiError,
    successMessage: loginSuccess,
  } = useLogin();

  const {
    mutate: googleAuth,
    isPending: isGooglePending,
    error: googleError,
    successMessage: googleSuccess,
  } = useGoogleAuth();

  const successMessage = loginSuccess || googleSuccess;

  const savedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: savedEmail,
      password: "",
      rememberMe: Boolean(savedEmail),
    },
  });

  const onSubmit = (data) => {
    if (data.rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, data.email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    }
    sessionStorage.setItem("just_authenticated", "login");
    login(data);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      googleAuth({ idToken: credentialResponse.credential });
    }
  };

  const activeError = apiError || googleError;
  const isAuthenticating = isPending || isGooglePending;

  return (
    <LoginForm
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      onSubmit={onSubmit}
      handleGoogleSuccess={handleGoogleSuccess}
      activeError={activeError}
      isAuthenticating={isAuthenticating}
      successMessage={successMessage}
    />
  );
};

export default LoginPage;
