import { useMutation } from '@tanstack/react-query';
import { generateAiCaption, getSuggestedHashtags } from '../services/ai.api';

export function useAiCaption() {
  const generateCaptionMutation = useMutation({
    mutationFn: generateAiCaption,
  });

  const suggestHashtagsMutation = useMutation({
    mutationFn: getSuggestedHashtags,
  });

  return {
    generateCaption: generateCaptionMutation.mutateAsync,
    isGenerating: generateCaptionMutation.isPending,
    captionError: generateCaptionMutation.error,
    captionData: generateCaptionMutation.data?.data,

    suggestHashtags: suggestHashtagsMutation.mutateAsync,
    isSuggestingHashtags: suggestHashtagsMutation.isPending,
    hashtagsData: suggestHashtagsMutation.data?.data,
  };
}
