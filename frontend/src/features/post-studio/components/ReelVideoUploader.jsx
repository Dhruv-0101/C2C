import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Smartphone,
  Clock,
  HardDrive,
  FileVideo,
  ChevronDown,
  ChevronUp,
  Info,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { postApi } from '../api/post.api';

/**
 * Maximum video file size supported across platforms:
 * Instagram allows up to 1GB.
 */
export const MAX_VIDEO_SIZE_BYTES = 1024 * 1024 * 1024; // 1 GB (1024MB)

/**
 * Maximum custom cover image size (Instagram allows up to 8MB)
 */
export const MAX_COVER_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Platform Video Specifications:
 * 1. Instagram Reels: .mp4, .mov (H.264 / AAC) | 9:16 (1080x1920) | 3 sec to 15 min | 1 GB
 * 2. Facebook Reels:  .mp4                       | 9:16             | 3 sec to 90 sec  | 500 MB
 * 3. LinkedIn Video:  .mp4                       | 1:1, 16:9, 9:16  | 3 sec to 10 min  | 200 MB
 */
export const PLATFORM_VIDEO_SPECS = [
  {
    id: 'INSTAGRAM',
    name: 'Instagram Reels',
    badge: 'Meta Reels API',
    icon: '📸',
    color: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-500/30',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-300',
    formatDisplay: '.mp4, .mov (H.264 / AAC)',
    allowedExtensions: ['.mp4', '.mov'],
    aspectRatioDisplay: '9:16 (1080x1920)',
    aspectTarget: '9:16',
    durationDisplay: '3 sec to 15 min',
    minDuration: 3,
    maxDuration: 900, // 15 mins
    maxSizeDisplay: '1 GB',
    maxSizeBytes: 1024 * 1024 * 1024,
  },
  {
    id: 'FACEBOOK',
    name: 'Facebook Reels',
    badge: 'Meta Reels API',
    icon: '📘',
    color: 'from-blue-600 to-blue-800',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-300',
    formatDisplay: '.mp4',
    allowedExtensions: ['.mp4'],
    aspectRatioDisplay: '9:16',
    aspectTarget: '9:16',
    durationDisplay: '3 sec to 90 sec',
    minDuration: 3,
    maxDuration: 90, // 90 secs
    maxSizeDisplay: '500 MB',
    maxSizeBytes: 500 * 1024 * 1024,
  },
  {
    id: 'LINKEDIN',
    name: 'LinkedIn Video',
    badge: 'LinkedIn Video API',
    icon: '💼',
    color: 'from-blue-500 to-indigo-700',
    borderColor: 'border-indigo-500/30',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-300',
    formatDisplay: '.mp4',
    allowedExtensions: ['.mp4'],
    aspectRatioDisplay: '1:1, 16:9, or 9:16',
    aspectTarget: 'MULTI', // 1:1, 16:9, or 9:16
    durationDisplay: '3 sec to 10 min',
    minDuration: 3,
    maxDuration: 600, // 10 mins
    maxSizeDisplay: '200 MB',
    maxSizeBytes: 200 * 1024 * 1024,
  },
];

/**
 * Format seconds to MM:SS
 * @param {number} sec
 */
export function formatDuration(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/**
 * Format bytes to readable MB / GB
 * @param {number} bytes
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 MB';
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Evaluates video compliance against a specific platform specification
 * @param {Object} spec
 * @param {Object} video { duration, width, height, format, fileName, fileSize }
 * @returns {{ isCompliant: boolean, issues: string[], checks: { format: boolean, aspect: boolean, duration: boolean, size: boolean } }}
 */
export function checkVideoCompliance(spec, video) {
  if (!video) {
    return {
      isCompliant: false,
      issues: ['No video selected'],
      checks: { format: false, aspect: false, duration: false, size: false },
    };
  }

  const issues = [];
  const checks = { format: true, aspect: true, duration: true, size: true };

  // 1. Format check
  const filename = (video.fileName || video.videoUrl || '').toLowerCase();
  const format = (video.format || '').toLowerCase();
  const isMov = filename.endsWith('.mov') || format.includes('mov') || format.includes('quicktime');

  if (spec.allowedExtensions.includes('.mp4') && !spec.allowedExtensions.includes('.mov') && isMov) {
    checks.format = false;
    issues.push(`Requires .mp4 (.mov not supported on ${spec.name})`);
  }

  // 2. Aspect Ratio check
  if (video.width && video.height) {
    const ratio = video.width / video.height;
    // Modern smartphones range from 20:9 (0.45) to 16:9 (0.5625) vertical, up to 4:5 (0.80)
    const isVerticalReel = ratio >= 0.40 && ratio <= 0.65;
    const is11 = ratio >= 0.90 && ratio <= 1.10;
    const is169 = ratio >= 1.60 && ratio <= 1.90;

    if (spec.aspectTarget === '9:16') {
      if (!isVerticalReel) {
        checks.aspect = false;
        issues.push('Recommended 9:16 vertical (1080x1920)');
      }
    } else if (spec.aspectTarget === 'MULTI') {
      // LinkedIn Video API officially supports 1:2.4 (0.416) up to 2.4:1 (2.4)
      const isLinkedInAllowed = ratio >= 0.40 && ratio <= 2.45;
      if (!isLinkedInAllowed) {
        checks.aspect = false;
        issues.push('Aspect ratio must be 1:1, 16:9, or 9:16');
      }
    }
  }

  // 3. Duration check
  const dur = video.duration || 0;
  if (dur < spec.minDuration) {
    checks.duration = false;
    issues.push(`Duration must be at least 3 sec (current: ${dur}s)`);
  } else if (dur > spec.maxDuration) {
    checks.duration = false;
    issues.push(`Exceeds max ${spec.durationDisplay} (current: ${formatDuration(dur)})`);
  }

  // 4. File Size check
  const size = video.fileSize || 0;
  if (size > spec.maxSizeBytes) {
    checks.size = false;
    issues.push(`Exceeds max ${spec.maxSizeDisplay} (current: ${formatFileSize(size)})`);
  }

  const isCompliant = issues.length === 0;
  return { isCompliant, issues, checks };
}

/**
 * ReelVideoUploader Component (Option B: Auto + Custom Cover Upload & Video Frame Picker)
 * Provides drag-and-drop video upload for Instagram Reels, Facebook Reels, and LinkedIn Video (.mp4 / .mov up to 1GB).
 * Handles video metadata extraction, automated Cloudinary poster generation,
 * an interactive Video Frame Picker (Scrubber), Custom Cover Image upload (JPG/PNG up to 8MB),
 * and live Platform Video Requirements compliance verification.
 */
export const ReelVideoUploader = ({
  activeVideo,
  onSelectVideo,
  onClearVideo,
  onOpenCaptionGenerator,
}) => {
  const fileInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const videoPlayerRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showSpecsTable, setShowSpecsTable] = useState(true);

  // Cover customizer state
  const [isCustomizingCover, setIsCustomizingCover] = useState(false);
  const [coverTab, setCoverTab] = useState('FRAME'); // 'FRAME' | 'UPLOAD'
  const [scrubTimestamp, setScrubTimestamp] = useState(1.0);
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const [coverSuccessMessage, setCoverSuccessMessage] = useState('');

  // Synchronize playing state with HTML5 video player
  useEffect(() => {
    const video = videoPlayerRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
      if (video.duration && scrubTimestamp > video.duration) {
        setScrubTimestamp(Math.min(1.0, video.duration / 2));
      }
    };
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeVideo?.videoUrl]);

  /**
   * Helper to generate a high-res Cloudinary frame transformation URL at any timestamp
   */
  const getCloudinaryVideoFrameUrl = (videoUrl, timestampInSec) => {
    if (!videoUrl || typeof videoUrl !== 'string') return null;
    if (!videoUrl.includes('/video/upload/')) return null;

    const timeOffset = Math.max(0, timestampInSec || 0).toFixed(1);
    return videoUrl
      .replace('/video/upload/', `/video/upload/so_${timeOffset},f_jpg,q_auto/`)
      .replace(/\.[a-zA-Z0-9]+$/, '.jpg');
  };

  /**
   * Capture a client-side thumbnail frame snapshot at current or given time
   */
  const captureThumbnailFromVideo = (videoElement) => {
    try {
      if (!videoElement) return null;
      const width = videoElement.videoWidth || 720;
      const height = videoElement.videoHeight || 1280;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, width, height);
      return canvas.toDataURL('image/jpeg', 0.90);
    } catch (err) {
      console.warn('Canvas frame capture bypassed (cross-origin / tainted canvas in Safari):', err.message);
      return null;
    }
  };

  /**
   * Handle raw video file upload
   */
  const handleFileProcess = async (file) => {
    if (!file) return;

    setErrorMessage('');
    setCoverSuccessMessage('');

    // 1. File Type Validation (.mp4, .mov, .webm)
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
    const hasValidType =
      allowedTypes.includes(file.type) ||
      file.name.toLowerCase().endsWith('.mp4') ||
      file.name.toLowerCase().endsWith('.mov') ||
      file.name.toLowerCase().endsWith('.webm');

    if (!hasValidType) {
      setErrorMessage('Unsupported file format. Please upload an MP4 or MOV video file.');
      return;
    }

    // 2. File Size Validation (1GB Max)
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setErrorMessage(
        `Video size (${formatFileSize(file.size)}) exceeds the maximum allowed limit of 1 GB.`
      );
      return;
    }

    // 3. Extract Metadata via temporary HTML5 Video Element
    const tempUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = tempUrl;
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    tempVideo.onloadedmetadata = async () => {
      const duration = tempVideo.duration || 0;
      // Seek to 1s or midpoint to capture a preview thumbnail
      tempVideo.currentTime = Math.min(1.0, duration / 2);
    };

    tempVideo.onseeked = async () => {
      const clientThumbnail = captureThumbnailFromVideo(tempVideo);
      URL.revokeObjectURL(tempUrl);

      // 4. Upload to Cloudinary Video Storage with real-time progress
      try {
        setIsUploading(true);
        setUploadProgress(5);

        const formData = new FormData();
        formData.append('video', file);

        const result = await postApi.uploadVideo(formData, (percent) => {
          setUploadProgress(Math.max(5, percent));
        });

        const detectedFormat = file.name.toLowerCase().endsWith('.mov') ? 'mov' : (result.format || 'mp4');
        const defaultPoster = result.thumbnailUrl || clientThumbnail;

        // 5. Notify Parent State
        onSelectVideo({
          videoUrl: result.videoUrl,
          thumbnailUrl: defaultPoster,
          defaultThumbnailUrl: defaultPoster,
          coverType: 'AUTO',
          duration: result.duration || Math.round(tempVideo.duration || 0),
          width: result.width || tempVideo.videoWidth,
          height: result.height || tempVideo.videoHeight,
          format: detectedFormat,
          fileSize: file.size,
          fileName: file.name,
          isVertical: (result.height || tempVideo.videoHeight) >= (result.width || tempVideo.videoWidth),
          postType: 'REEL',
        });

        setUploadProgress(100);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to upload video to Cloud CDN. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };

    tempVideo.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      setErrorMessage('Could not process video file. The file may be corrupt.');
    };
  };

  /**
   * Action 1: Capture current video frame from timeline scrubber and set as Reel cover
   */
  const handleSetFrameAsCover = async () => {
    const video = videoPlayerRef.current;
    if (!video && !activeVideo?.videoUrl) return;

    try {
      setIsProcessingCover(true);
      setErrorMessage('');
      setCoverSuccessMessage('');

      if (video) {
        video.pause();
        setIsPlaying(false);

        // If video is still seeking across the network, wait for seeked event
        if (video.seeking) {
          await new Promise((resolve) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              resolve();
            };
            video.addEventListener('seeked', onSeeked, { once: true });
            setTimeout(resolve, 350);
          });
        }
      }

      let finalThumbnailUrl = null;

      // Strategy 1: Client-Side Canvas Capture (if video element is available & not tainted)
      if (video) {
        const frameBase64 = captureThumbnailFromVideo(video);
        if (frameBase64) {
          try {
            const result = await postApi.uploadThumbnail({
              base64Graphic: frameBase64,
            });
            finalThumbnailUrl = result?.thumbnailUrl || frameBase64;
          } catch (uploadErr) {
            console.warn('Could not upload canvas snapshot, falling back to Cloudinary video frame transformation:', uploadErr.message);
          }
        }
      }

      // Strategy 2: High-Resolution Cloudinary Video Engine Frame Extraction Fallback
      // Completely avoids browser canvas CORS / tainted issues in Safari
      if (!finalThumbnailUrl && activeVideo?.videoUrl) {
        const cdnFrameUrl = getCloudinaryVideoFrameUrl(activeVideo.videoUrl, scrubTimestamp);
        if (cdnFrameUrl) {
          try {
            const result = await postApi.uploadThumbnail({
              thumbnailUrl: cdnFrameUrl,
              fileUrl: cdnFrameUrl,
            });
            finalThumbnailUrl = result?.thumbnailUrl || cdnFrameUrl;
          } catch {
            finalThumbnailUrl = cdnFrameUrl;
          }
        }
      }

      if (!finalThumbnailUrl) {
        throw new Error('Unable to extract frame. Please try another frame or upload a custom image.');
      }

      onSelectVideo({
        ...activeVideo,
        thumbnailUrl: finalThumbnailUrl,
        coverType: 'FRAME',
        coverTimestamp: scrubTimestamp,
      });

      setCoverSuccessMessage(`Cover frame set at ${formatDuration(scrubTimestamp)}!`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to set video frame as cover.');
    } finally {
      setIsProcessingCover(false);
    }
  };

  /**
   * Action 2: Upload custom image file (JPG/PNG up to 8MB) as Reel cover
   */
  const handleCustomCoverImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setCoverSuccessMessage('');

    // Format check (JPG / PNG / WEBP)
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (.jpg, .jpeg, or .png).');
      return;
    }

    // Size check (Max 8MB per Meta guidelines)
    if (file.size > MAX_COVER_IMAGE_SIZE_BYTES) {
      setErrorMessage(`Cover image (${formatFileSize(file.size)}) exceeds maximum allowed size of 8 MB.`);
      return;
    }

    try {
      setIsProcessingCover(true);

      const formData = new FormData();
      formData.append('thumbnail', file);

      const result = await postApi.uploadThumbnail(formData);

      onSelectVideo({
        ...activeVideo,
        thumbnailUrl: result.thumbnailUrl,
        coverType: 'CUSTOM_IMAGE',
        coverFileName: file.name,
      });

      setCoverSuccessMessage('Custom branded cover image uploaded successfully!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload custom cover image.');
    } finally {
      setIsProcessingCover(false);
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = '';
      }
    }
  };

  /**
   * Action 3: Reset cover photo back to default Cloudinary video poster frame
   */
  const handleResetToDefaultCover = () => {
    const defaultUrl = activeVideo.defaultThumbnailUrl || activeVideo.videoUrl?.replace(/\.[a-zA-Z0-9]+$/, '.jpg');
    onSelectVideo({
      ...activeVideo,
      thumbnailUrl: defaultUrl,
      coverType: 'AUTO',
    });
    setCoverSuccessMessage('Reset to default automated video poster.');
  };

  const handleTogglePlay = () => {
    const video = videoPlayerRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    const video = videoPlayerRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="space-y-4">
      {/* HEADER BANNER */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-pink-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-white leading-tight">
                Multi-Platform Reels & Video Studio
              </h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-500/20 border border-purple-500/40 text-purple-300">
                Instagram • Facebook • LinkedIn
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Upload once and publish or schedule across Meta Reels and LinkedIn Video (up to 1 GB).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSpecsTable((prev) => !prev)}
          className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-amber-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <Info className="w-3 h-3 text-amber-400" />
          <span>Platform Requirements</span>
          {showSpecsTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* PLATFORM VIDEO REQUIREMENTS TABLE */}
      {showSpecsTable && (
        <div className="rounded-xl bg-[#0B0F17] border border-[#2C384E] overflow-hidden animate-in fade-in duration-200">
          <div className="p-2.5 bg-slate-900/80 border-b border-[#2C384E] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                Platforms Video Requirements Matrix
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Official API Guidelines</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3">Aspect Ratio</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3 text-right">Max File Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {PLATFORM_VIDEO_SPECS.map((spec) => (
                  <tr key={spec.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{spec.icon}</span>
                        <div>
                          <span className="font-bold text-white text-[11px]">{spec.name}</span>
                          <span className="block text-[9px] text-slate-400">{spec.badge}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">
                        {spec.formatDisplay}
                      </code>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-semibold">
                        <Smartphone className="w-3 h-3" />
                        {spec.aspectRatioDisplay}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-slate-200 text-[11px]">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {spec.durationDisplay}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        <HardDrive className="w-3 h-3" />
                        {spec.maxSizeDisplay}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* SUCCESS ALERT (COVER UPDATE) */}
      {coverSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{coverSuccessMessage}</span>
          <button
            type="button"
            onClick={() => setCoverSuccessMessage('')}
            className="text-emerald-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* UPLOAD PROGRESS BAR */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-amber-500/30 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-white font-bold">Uploading Reel / Video to Cloud CDN...</span>
            </div>
            <span className="font-extrabold text-amber-400">{uploadProgress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-400">
            Generating high-resolution poster frame and preparing video streams for multi-platform dispatch...
          </p>
        </div>
      )}

      {/* IF NO VIDEO UPLOADED: DROPZONE */}
      {!activeVideo?.videoUrl && !isUploading && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            handleFileProcess(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
            isDragging
              ? 'border-purple-400 bg-purple-500/15 scale-[1.01]'
              : 'border-[#2C384E] hover:border-purple-500/50 bg-[#0B0F17]/80 hover:bg-[#0B0F17]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleFileProcess(file);
            }}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              Drag & Drop Reel / Video here, or{' '}
              <span className="text-amber-400 underline decoration-amber-400/40">Browse</span>
            </h4>
            <p className="text-xs text-slate-400 max-w-md">
              Supports <strong className="text-slate-200">.MP4 and .MOV (H.264 / AAC)</strong> up to{' '}
              <strong className="text-slate-200">1 GB</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3 h-3 text-purple-400" />
              <span>9:16 Vertical for Reels (1080x1920)</span>
            </span>
            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>3 sec to 15 min duration</span>
            </span>
            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <HardDrive className="w-3 h-3 text-emerald-400" />
              <span>Max 1 GB</span>
            </span>
          </div>
        </div>
      )}

      {/* IF VIDEO UPLOADED: ACTIVE VIDEO CARD, THUMBNAIL MANAGER & LIVE COMPLIANCE MATRIX */}
      {activeVideo?.videoUrl && (
        <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-4 animate-in fade-in">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#2C384E] pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">
                  {activeVideo.fileName || 'Reel Video Ready'}
                </h4>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                  <span className="text-emerald-400 font-semibold uppercase">{activeVideo.format || 'mp4'}</span>
                  <span>•</span>
                  <span>{formatFileSize(activeVideo.fileSize)}</span>
                  <span>•</span>
                  <span>{formatDuration(activeVideo.duration || videoDuration)}</span>
                  {activeVideo.width && activeVideo.height && (
                    <>
                      <span>•</span>
                      <span>{activeVideo.width}x{activeVideo.height}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs border-[#2C384E] text-slate-300 hover:text-white min-h-[32px]"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                <span>Replace</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  handleFileProcess(file);
                }}
                className="hidden"
              />

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onClearVideo}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 min-h-[32px]"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>Remove</span>
              </Button>
            </div>
          </div>

          {/* PLAYER & LIVE COMPLIANCE CHECKER */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* MINI VIDEO PLAYER */}
            <div className="md:col-span-4 space-y-2">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[300px] mx-auto border border-slate-800 shadow-xl group">
                <video
                  ref={videoPlayerRef}
                  src={activeVideo.videoUrl}
                  poster={activeVideo.thumbnailUrl}
                  playsInline
                  loop
                  crossOrigin="anonymous"
                  muted={isMuted}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={handleTogglePlay}
                />

                {/* OVERLAY PLAY/PAUSE */}
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className={`absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all ${
                    isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100 shadow-glow'
                  }`}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                {/* MUTE TOGGLE */}
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {/* DURATION BADGE */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white/90">
                  {formatDuration(currentTime)} / {formatDuration(activeVideo.duration || videoDuration)}
                </div>
              </div>

              {/* COVER STATUS PILL & CUSTOMIZE BUTTON */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-purple-400" />
                    <span>Reel Cover:</span>
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    activeVideo.coverType === 'CUSTOM_IMAGE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : activeVideo.coverType === 'FRAME'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {activeVideo.coverType === 'CUSTOM_IMAGE'
                      ? 'Custom Upload'
                      : activeVideo.coverType === 'FRAME'
                      ? `Frame @ ${formatDuration(activeVideo.coverTimestamp || 0)}`
                      : 'Auto Video Poster'}
                  </span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCustomizingCover((prev) => !prev)}
                  className="w-full text-xs font-bold border-purple-500/40 text-purple-300 hover:text-white hover:bg-purple-500/20 min-h-[32px] flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isCustomizingCover ? 'Close Cover Settings' : 'Customize Cover / Thumbnail'}</span>
                  {isCustomizingCover ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {/* LIVE PLATFORM COMPLIANCE MATRIX */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Platform Readiness & Verification
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDuration(activeVideo.duration || videoDuration)} • {formatFileSize(activeVideo.fileSize)}
                </span>
              </div>

              {/* 3 PLATFORM STATUS CARDS */}
              <div className="space-y-2">
                {PLATFORM_VIDEO_SPECS.map((spec) => {
                  const compliance = checkVideoCompliance(spec, {
                    ...activeVideo,
                    duration: activeVideo.duration || videoDuration,
                  });

                  return (
                    <div
                      key={spec.id}
                      className={`p-3 rounded-xl border transition-all ${
                        compliance.isCompliant
                          ? 'bg-slate-900/70 border-emerald-500/30 hover:border-emerald-500/50'
                          : 'bg-slate-900/70 border-amber-500/30 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{spec.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-white">{spec.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2">
                              {spec.formatDisplay} • {spec.aspectRatioDisplay} • max {spec.durationDisplay}
                            </span>
                          </div>
                        </div>

                        {compliance.isCompliant ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>100% Ready</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            <span>Incompatible</span>
                          </span>
                        )}
                      </div>

                      {/* If incompatible, show reason tags */}
                      {!compliance.isCompliant && compliance.issues.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-amber-300/90 flex flex-wrap gap-1.5 items-center">
                          <span className="font-semibold text-amber-400">Notice:</span>
                          {compliance.issues.map((issue, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {onOpenCaptionGenerator && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenCaptionGenerator}
                  className="w-full text-xs font-bold border-amber-500/30 text-amber-300 hover:bg-amber-500/10 min-h-[34px] flex items-center justify-center gap-1.5 mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate Reel Caption & Hashtags with AI</span>
                </Button>
              )}
            </div>
          </div>

          {/* OPTION B: INTERACTIVE COVER PHOTO & THUMBNAIL CUSTOMIZER PANEL */}
          {isCustomizingCover && (
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-3.5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                    Reel Cover & Thumbnail Customizer (Option B)
                  </h5>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCoverTab('FRAME')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1.5 ${
                      coverTab === 'FRAME'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Pick Video Frame</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverTab('UPLOAD')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1.5 ${
                      coverTab === 'UPLOAD'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Upload Custom Image</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: PICK VIDEO FRAME VIA SCRUBBER */}
              {coverTab === 'FRAME' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">
                        Scrub timeline to pick cover frame:
                      </span>
                      <span className="font-mono text-purple-300 font-bold">
                        {formatDuration(scrubTimestamp)} / {formatDuration(activeVideo.duration || videoDuration)}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={activeVideo.duration || videoDuration || 10}
                      step={0.1}
                      value={scrubTimestamp}
                      onChange={(e) => {
                        const newTime = parseFloat(e.target.value);
                        setScrubTimestamp(newTime);
                        if (videoPlayerRef.current) {
                          videoPlayerRef.current.currentTime = newTime;
                        }
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      Slide to view live video frame preview above, then click below to set that frame as the official Reel cover.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSetFrameAsCover}
                      disabled={isProcessingCover}
                      className="text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white min-h-[34px] flex items-center gap-1.5"
                    >
                      {isProcessingCover ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Capturing & Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" />
                          <span>Set This Frame as Reel Cover</span>
                        </>
                      )}
                    </Button>

                    {activeVideo.coverType !== 'AUTO' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleResetToDefaultCover}
                        className="text-xs text-slate-400 hover:text-white min-h-[34px] flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Default Poster</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD CUSTOM COVER IMAGE (.jpg, .png) */}
              {coverTab === 'UPLOAD' && (
                <div className="space-y-3">
                  <div
                    onClick={() => coverImageInputRef.current?.click()}
                    className="p-4 sm:p-5 rounded-xl border border-dashed border-slate-700 hover:border-purple-500 bg-slate-900/60 hover:bg-slate-900 cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition"
                  >
                    <input
                      ref={coverImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCustomCoverImageUpload}
                      className="hidden"
                    />

                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <ImageIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">
                        Click to upload custom cover image, or{' '}
                        <span className="text-purple-400 underline">Browse</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Supports <strong className="text-slate-300">JPG, PNG</strong> (Recommended 9:16 vertical 1080×1920, max 8 MB).
                      </p>
                    </div>
                  </div>

                  {activeVideo.coverType !== 'AUTO' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleResetToDefaultCover}
                      className="text-xs text-slate-400 hover:text-white min-h-[32px] flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Default Poster</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReelVideoUploader;
