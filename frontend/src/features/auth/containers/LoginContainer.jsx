import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../../validations/auth.validation";
import { useLogin } from "../hooks/useLogin";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { LoginView } from "../components/LoginView";

/**
 * LoginContainer
 * Container component managing form state, Zod validation, and login/Google auth mutations.
 */
export const LoginContainer = () => {
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

  const savedEmail = localStorage.getItem("rememberedEmail") || "";

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
      localStorage.setItem("rememberedEmail", data.email);
    } else {
      localStorage.removeItem("rememberedEmail");
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
    <LoginView
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
