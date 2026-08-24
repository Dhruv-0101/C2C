import React from "react";
import { PostStudioContainer } from "../features/post-studio/containers/PostStudioContainer";

/**
 * CreatePostPage Wrapper
 * Renders PostStudioContainer for clean container/presentational separation.
 */
export const CreatePostPage = () => {
  return <PostStudioContainer />;
};

export default CreatePostPage;
