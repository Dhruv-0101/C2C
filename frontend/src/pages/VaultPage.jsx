import React from "react";
import { VaultContainer } from "../features/vault/containers/VaultContainer";

/**
 * VaultPage Wrapper
 * Delegates rendering to VaultContainer for clean separation of concerns.
 */
export const VaultPage = () => {
  return <VaultContainer />;
};

export default VaultPage;
