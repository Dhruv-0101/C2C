import { useMutation } from '@tanstack/react-query';
import { generateAiPostImage } from '@/features/post-studio/api/ai.api';

/**
 * 🍌 useAiPostImage Hook
 * TanStack Query Mutation hook for generating commercial AI post visuals via Nano Banana 2.1.
 */
export function useAiPostImage() {
  const generateImageMutation = useMutation({
    mutationFn: generateAiPostImage,
  });

  return {
    generatePostImage: generateImageMutation.mutateAsync,
    isGeneratingImage: generateImageMutation.isPending,
    imageError: generateImageMutation.error,
    imageData: generateImageMutation.data?.data,
    resetImageGeneration: generateImageMutation.reset,
  };
}

export default useAiPostImage;
