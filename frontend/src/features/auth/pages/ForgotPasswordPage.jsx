import React from "react";
import { ForgotPasswordContainer } from "../containers/ForgotPasswordContainer";

/**
 * ForgotPasswordPage Wrapper
 * Delegates rendering to ForgotPasswordContainer for clean separation of concerns.
 */
export const ForgotPasswordPage = () => {
  return <ForgotPasswordContainer />;
};

export default ForgotPasswordPage;
