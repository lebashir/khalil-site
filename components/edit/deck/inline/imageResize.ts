// Browser-only utility: read a File, draw it into a canvas at a capped
// max dimension, return a JPEG Blob at ~82% quality. Caps both file size
// (less bandwidth on upload) and the visual fidelity needed for the
// hero portrait / book cover / video thumbnail slots — none of which
// need to be more than ~1024px on the long edge.

const DEFAULT_MAX = 1024;
const DEFAULT_QUALITY = 0.82;

interface ResizeOptions {
  maxDimension?: number;
  quality?: number;
}

// Reads a File into an Image element via Object URL so we can draw it
// onto a canvas. Object URLs are revoked once the image is loaded to
// avoid leaking memory across multiple uploads.
const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err instanceof Event ? new Error('Failed to decode image.') : err);
    };
    img.src = url;
  });

// Convert the resized canvas back to a Blob. The canvas API resolves
// `toBlob` with null on extremely rare encoding failures — we treat
// that as fatal and surface a clear error.
const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Canvas could not encode image.'));
        else resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });

// Main entrypoint. If the source image is already smaller than the cap
// on both axes, we still re-encode through the canvas — the JPEG quality
// drop saves bandwidth, and we always upload .jpg so the upload route
// has a stable extension across image sources.
export const resizeImageFile = async (
  file: File,
  options: ResizeOptions = {}
): Promise<Blob> => {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX;
  const quality = options.quality ?? DEFAULT_QUALITY;

  const img = await loadImage(file);
  const longEdge = Math.max(img.width, img.height);
  const ratio = longEdge > maxDimension ? maxDimension / longEdge : 1;
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable.');
  ctx.drawImage(img, 0, 0, width, height);

  return canvasToBlob(canvas, quality);
};
