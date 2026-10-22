/**
 * Computer Vision (CV) Image Utilities for SafeBite
 * Handles video frame capture, canvas downscaling, and Base64 preparation for AI Vision APIs.
 */

/**
 * Snaps a frame from an active HTML5 video stream onto an offscreen canvas.
 * @param {HTMLVideoElement} videoElement
 * @param {number} maxWidth Maximum width constraint for the captured frame
 * @returns {Promise<{ dataUrl: string, base64Data: string, mimeType: string }>}
 */
export async function captureVideoFrame(videoElement, maxWidth = 1200) {
  if (!videoElement) {
    throw new Error('Video stream element not found.');
  }

  // If video is still initializing or buffering, wait briefly for frame data to become available
  if (videoElement.readyState < 2) {
    await new Promise((resolve, reject) => {
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          if (videoElement.readyState >= 2) {
            resolve();
          } else {
            reject(new Error('Video stream is not ready for frame capture. Please ensure camera is active and try again.'));
          }
        }
      }, 1500);

      videoElement.onloadeddata = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve();
        }
      };
    });
  }

  const origWidth = videoElement.videoWidth || 640;
  const origHeight = videoElement.videoHeight || 480;

  // Calculate scaled dimensions to optimize AI API payload size
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (targetWidth > maxWidth) {
    const scale = maxWidth / targetWidth;
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable.');
  }

  // Draw frame
  ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);

  const mimeType = 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, 0.88);
  const base64Data = dataUrl.split(',')[1];

  return {
    dataUrl,
    base64Data,
    mimeType
  };
}

/**
 * Converts a browser File (from input or dropzone) into a resized Base64 payload.
 * @param {File} file
 * @param {number} maxWidth
 * @returns {Promise<{ dataUrl: string, base64Data: string, mimeType: string }>}
 */
export async function fileToDataUrl(file, maxWidth = 1200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result;
      if (typeof rawDataUrl !== 'string') {
        return reject(new Error('Invalid image result.'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for processing.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const scale = maxWidth / width;
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            dataUrl: rawDataUrl,
            base64Data: rawDataUrl.split(',')[1],
            mimeType: file.type || 'image/jpeg'
          });
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.88);
        const base64Data = dataUrl.split(',')[1];

        resolve({
          dataUrl,
          base64Data,
          mimeType
        });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}
