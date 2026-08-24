import React from "react";
import { RegisterContainer } from "../containers/RegisterContainer";

/**
 * RegisterForm Wrapper
 * Delegates rendering to RegisterContainer for clean container/presentational separation.
 */
export const RegisterForm = () => {
  return <RegisterContainer />;
};

export default RegisterForm;
