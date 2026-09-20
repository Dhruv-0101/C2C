import { useMutation } from '@tanstack/react-query';
import { generateAiCaption } from '../services/ai.api';

/**
 * Hook for generating AI captions and hashtags tailored to brand context.
 */
export function useAiCaption() {
  const generateCaptionMutation = useMutation({
    mutationFn: generateAiCaption,
  });

  return {
    generateCaption: generateCaptionMutation.mutateAsync,
    isGenerating: generateCaptionMutation.isPending,
    captionError: generateCaptionMutation.error,
    captionData: generateCaptionMutation.data?.data,
  };
}
