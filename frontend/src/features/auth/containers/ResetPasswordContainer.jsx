import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "../../../services/auth.api";
import { ResetPasswordView } from "../components/ResetPasswordView";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * ResetPasswordContainer
 * Container component handling reset password token validation and submission logic.
 */
export const ResetPasswordContainer = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    if (!token) {
      setErrorMessage(
        "Invalid or missing password reset token. Please request a new link.",
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      await authApi.resetPassword({
        token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reset password. The link may be expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResetPasswordView
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      onSubmit={onSubmit}
      token={token}
      isLoading={isLoading}
      isSuccess={isSuccess}
      errorMessage={errorMessage}
      navigate={navigate}
    />
  );
};
