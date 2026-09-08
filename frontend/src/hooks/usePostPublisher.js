import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../services/post.api";
import { QUERY_KEYS } from "../constants/queryKeys";

/**
 * Custom Hook for immediate publishing or scheduling social posts across platforms
 */
export function usePostPublisher(onSuccess) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [publishResult, setPublishResult] = useState(null);

  const publishNowMutation = useMutation({
    mutationFn: (payload) => postApi.publishNow(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
      const result = res.data?.publishResult || res.publishResult;
      setPublishResult(result);
      if (onSuccess) onSuccess(res);
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to publish post immediately.");
    },
  });

  const schedulePostMutation = useMutation({
    mutationFn: (payload) => postApi.schedulePost(payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.SCHEDULED });
      setPublishResult({ scheduled: true, scheduledAt: variables.scheduledAt });
      if (onSuccess) onSuccess(res);
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to schedule post.");
    },
  });

  const handlePublishOrSchedule = async ({
    postData,
    selectedPlatforms,
    publishMode,
    scheduledAt,
  }) => {
    setErrorMsg("");

    if (publishMode === "SCHEDULE") {
      if (!scheduledAt) {
        setErrorMsg("Please select a valid future date and time for scheduling.");
        return;
      }
      const chosenTime = new Date(scheduledAt).getTime();
      if (chosenTime <= Date.now()) {
        setErrorMsg("Scheduled time must be in the future!");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...postData,
        targetPlatforms: selectedPlatforms,
        scheduledAt: publishMode === "SCHEDULE" ? new Date(scheduledAt).toISOString() : undefined,
      };

      if (publishMode === "NOW") {
        await publishNowMutation.mutateAsync(payload);
      } else {
        await schedulePostMutation.mutateAsync(payload);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to process post execution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    errorMsg,
    setErrorMsg,
    publishResult,
    setPublishResult,
    handlePublishOrSchedule,
  };
}
