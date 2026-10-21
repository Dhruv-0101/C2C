import { useMutation } from '@tanstack/react-query';
import { generateAiCarousel } from '@/features/post-studio/api/ai.api';

/**
 * 🎠 Hook for generating AI-powered multi-slide carousels
 * Returns mutation caller, loading state, error, and structured slide data.
 */
export function useAiCarousel() {
  const generateCarouselMutation = useMutation({
    mutationFn: generateAiCarousel,
  });

  return {
    generateCarousel: generateCarouselMutation.mutateAsync,
    isGenerating: generateCarouselMutation.isPending,
    error: generateCarouselMutation.error,
    carouselData: generateCarouselMutation.data?.data,
  };
}

export default useAiCarousel;
