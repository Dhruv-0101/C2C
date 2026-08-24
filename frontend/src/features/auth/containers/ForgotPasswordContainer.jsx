import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "../../../services/auth.api";
import { ForgotPasswordView } from "../components/ForgotPasswordView";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

/**
 * ForgotPasswordContainer
 * Container component handling password reset email submission logic.
 */
export const ForgotPasswordContainer = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await authApi.forgotPassword(data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to send reset link. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ForgotPasswordView
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      onSubmit={onSubmit}
      isSubmitted={isSubmitted}
      setIsSubmitted={setIsSubmitted}
      submittedEmail={submittedEmail}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
};
