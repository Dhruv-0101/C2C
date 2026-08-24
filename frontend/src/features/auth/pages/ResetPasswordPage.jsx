import React from "react";
import { ResetPasswordContainer } from "../containers/ResetPasswordContainer";

/**
 * ResetPasswordPage Wrapper
 * Delegates rendering to ResetPasswordContainer for clean separation of concerns.
 */
export const ResetPasswordPage = () => {
  return <ResetPasswordContainer />;
};

export default ResetPasswordPage;
