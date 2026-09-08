import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandKitApi } from '../services/brandkit.api';
import { frameApi } from '../services/frame.api';
import { templateApi } from '../services/template.api';
import { postApi } from '../services/post.api';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Custom Hook for Post Studio & Post Creator data fetching and post saving
 */
export function usePostCreator(isOpen = true) {
  const queryClient = useQueryClient();
  const [saveSuccess, setSaveSuccess] = useState('');

  // Fetch User's BrandKit from DB
  const { data: brandKitResponse, isLoading: isLoadingBrandKit } = useQuery({
    queryKey: QUERY_KEYS.BRANDKIT.MINE,
    queryFn: () => brandKitApi.getBrandKit(),
    enabled: isOpen,
  });

  // Fetch Available Transparent PNG Frames from DB
  const { data: framesResponse, isLoading: isLoadingFrames } = useQuery({
    queryKey: QUERY_KEYS.FRAMES.ALL,
    queryFn: () => frameApi.getFrames(),
    enabled: isOpen,
  });

  // Fetch Available Graphic Templates from DB
  const { data: templatesResponse, isLoading: isLoadingTemplates } = useQuery({
    queryKey: QUERY_KEYS.TEMPLATES.ALL,
    queryFn: () => templateApi.getTemplates(),
    enabled: isOpen,
  });

  const brandKit = brandKitResponse?.data?.brandKit || brandKitResponse?.brandKit;
  const frames = framesResponse?.data?.frames || framesResponse?.frames || [];
  const templates = templatesResponse?.data?.templates || templatesResponse?.templates || [];

  // Save Generated Post Mutation
  const savePostMutation = useMutation({
    mutationFn: (postData) => postApi.createPost(postData),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
      setSaveSuccess('🎉 Final composited post saved to Cloudinary, DB & Vault!');
      setTimeout(() => setSaveSuccess(''), 4000);
      return res;
    },
  });

  return {
    brandKit,
    frames,
    templates,
    isLoading: isLoadingBrandKit || isLoadingFrames || isLoadingTemplates,
    saveSuccess,
    setSaveSuccess,
    savePost: savePostMutation.mutateAsync,
    isSaving: savePostMutation.isPending,
    saveError: savePostMutation.error,
  };
}
