import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Zap, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { postApi } from "../../../services/post.api";
import { QUERY_KEYS } from "../../../constants/queryKeys";

/**
 * ScheduledPostsQueueView
 * Renders user's scheduled post queue with real-time test trigger controls.
 */
export const ScheduledPostsQueueView = () => {
  const queryClient = useQueryClient();
  const [testResult, setTestResult] = useState(null);

  const { data: responseData, isLoading, error } = useQuery({
    queryKey: ["scheduledPosts"],
    queryFn: () => postApi.getScheduledPosts(),
  });

  const scheduledPosts = responseData?.scheduledPosts || responseData?.data?.scheduledPosts || [];

  const triggerMutation = useMutation({
    mutationFn: () => postApi.triggerScheduledJobs(),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["scheduledPosts"]);
      queryClient.invalidateQueries(QUERY_KEYS.POSTS.ALL);
      setTestResult(res.message || `Dispatched ${res.data?.count || 0} scheduled jobs!`);
      setTimeout(() => setTestResult(null), 5000);
    },
  });

  return (
    <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-6">
      {/* Header with Test Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-white">
              Scheduled Posts Queue & Cron Dispatcher
            </h3>
            <p className="text-xs text-slate-400">
              Posts queued for automated publication across social platforms.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          icon={Zap}
          isLoading={triggerMutation.isPending}
          onClick={() => triggerMutation.mutate()}
          className="bg-amber-500 text-slate-950 hover:bg-amber-400 border-0 font-bold"
        >
          ⚡ Test Trigger Now
        </Button>
      </div>

      {testResult && <Alert variant="success" message={testResult} />}
      {error && <Alert variant="error" message="Failed to load scheduled queue." />}

      {isLoading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading scheduled queue...</div>
      ) : scheduledPosts.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-2">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-sm">No Scheduled Posts Queued</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use the Post Creator or Festival Studio to schedule posts for future dates!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledPosts.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                {item.post?.finalGraphicUrl && (
                  <img
                    src={item.post.finalGraphicUrl}
                    alt="Scheduled Graphic"
                    className="w-12 h-12 rounded-lg object-cover border border-[#2C384E]"
                  />
                )}
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {item.post?.occasionName || item.post?.customText || "Scheduled Social Post"}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Scheduled for:{" "}
                    <strong className="text-amber-400">
                      {new Date(item.scheduledAt).toLocaleString()}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  {item.targetPlatforms?.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    item.status === "SUCCESS"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : item.status === "PROCESSING"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
