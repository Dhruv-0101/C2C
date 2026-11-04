/**
 * Media detection and download utility functions for Image and Video Reel assets
 */

/**
 * Checks whether an item or URL represents a video / reel asset
 * @param {Object|string} item
 * @returns {boolean}
 */
export const isVideoAsset = (item) => {
  if (!item) return false;
  if (typeof item === 'string') {
    const lower = item.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm') || lower.includes('/video/upload/');
  }

  const post = item.post || item;
  if (post.videoUrl) return true;
  if (post.postType === 'REEL' || post.postType === 'VIDEO') return true;

  const url = post.finalGraphicUrl || post.customImageUrl || item.graphicUrl || item.imageUrl;
  if (typeof url === 'string') {
    const lower = url.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm') || lower.includes('/video/upload/');
  }

  return false;
};

/**
 * Normalizes post media object returning poster, video URL, and format tags
 * @param {Object|string} item
 * @returns {{
 *   mediaUrl: string|null,
 *   posterUrl: string|null,
 *   videoUrl: string|null,
 *   isVideo: boolean,
 *   duration: number|null,
 *   postType: string,
 * }}
 */
export const getPostMedia = (item) => {
  if (!item) {
    return {
      mediaUrl: null,
      posterUrl: null,
      videoUrl: null,
      isVideo: false,
      duration: null,
      postType: 'SINGLE',
    };
  }

  if (typeof item === 'string') {
    const isVideo = isVideoAsset(item);
    return {
      mediaUrl: item,
      posterUrl: isVideo ? item.replace(/\.[a-zA-Z0-9]+$/, '.jpg').replace('/video/upload/', '/video/upload/so_1.0,f_jpg,q_auto/') : item,
      videoUrl: isVideo ? item : null,
      isVideo,
      duration: null,
      postType: isVideo ? 'REEL' : 'SINGLE',
    };
  }

  const post = item.post || item;
  const isVideo = isVideoAsset(post);
  const videoUrl = post.videoUrl || (isVideo ? (post.finalGraphicUrl || item.graphicUrl) : null);
  const posterUrl =
    post.thumbnailUrl ||
    (isVideo
      ? (videoUrl?.includes('/video/upload/')
          ? videoUrl.replace(/\.[a-zA-Z0-9]+$/, '.jpg').replace('/video/upload/', '/video/upload/so_1.0,f_jpg,q_auto/')
          : post.finalGraphicUrl)
      : (post.finalGraphicUrl || post.customImageUrl || item.graphicUrl || item.imageUrl));

  const mediaUrl = videoUrl || post.finalGraphicUrl || posterUrl;

  return {
    mediaUrl,
    posterUrl,
    videoUrl,
    isVideo,
    duration: post.durationSeconds || null,
    postType: post.postType || (isVideo ? 'REEL' : 'SINGLE'),
  };
};

/**
 * Universal browser file downloader with proper extension detection (.mp4 vs .png)
 * @param {string} mediaUrl
 * @param {string} [title='BrandFlow-Asset']
 */
export const downloadMediaAsset = (mediaUrl, title = 'BrandFlow-Asset') => {
  if (!mediaUrl) return;

  const isVideo = isVideoAsset(mediaUrl);
  const isMov = typeof mediaUrl === 'string' && mediaUrl.toLowerCase().endsWith('.mov');
  const extension = isVideo ? (isMov ? 'mov' : 'mp4') : 'png';
  const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');

  const link = document.createElement('a');
  link.href = mediaUrl;
  link.download = `${cleanTitle}.${extension}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
