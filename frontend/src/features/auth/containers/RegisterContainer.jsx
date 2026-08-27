import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../../validations/auth.validation";
import { useRegister } from "../hooks/useRegister";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { RegisterView } from "../components/RegisterView";

/**
 * RegisterContainer
 * Container component handling form state, Zod validation, and account registration mutations.
 */
export const RegisterContainer = () => {
  const {
    mutate: registerUser,
    isPending,
    error: apiError,
    successMessage: regSuccess,
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
    sessionStorage.setItem("just_authenticated", "register");
    registerUser(data);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      googleAuth({ idToken: credentialResponse.credential });
    }
  };

  const activeError = apiError || googleError;
  const isCreating = isPending || isGooglePending;

  return (
    <RegisterView
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      onSubmit={onSubmit}
      handleGoogleSuccess={handleGoogleSuccess}
      activeError={activeError}
      isCreating={isCreating}
      successMessage={successMessage}
    />
  );
};
