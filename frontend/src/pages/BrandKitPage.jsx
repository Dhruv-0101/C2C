import React from "react";
import { BrandKitContainer } from "../features/brandkit/containers/BrandKitContainer";

/**
 * BrandKitPage Wrapper
 * Delegates rendering to BrandKitContainer for clean container/presentational separation.
 */
export const BrandKitPage = () => {
  return <BrandKitContainer />;
};

export default BrandKitPage;
