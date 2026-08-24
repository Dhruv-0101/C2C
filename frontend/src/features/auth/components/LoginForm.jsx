import React from "react";
import { LoginContainer } from "../containers/LoginContainer";

/**
 * LoginForm Wrapper
 * Delegates rendering to LoginContainer for clean container/presentational separation.
 */
export const LoginForm = () => {
  return <LoginContainer />;
};

export default LoginForm;
