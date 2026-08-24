import React from "react";
import { TwoFactorVerifyContainer } from "../containers/TwoFactorVerifyContainer";

/**
 * TwoFactorVerifyPage Wrapper
 * Delegates rendering to TwoFactorVerifyContainer for clean separation of concerns.
 */
export const TwoFactorVerifyPage = () => {
  return <TwoFactorVerifyContainer />;
};

export default TwoFactorVerifyPage;
