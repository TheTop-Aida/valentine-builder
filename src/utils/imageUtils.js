/**
 * Compress an image file using canvas before converting to base64
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width in pixels (default 1200)
 * @param {number} quality - JPEG quality 0-1 (default 0.78)
 * @returns {Promise<string>} - Compressed base64 data URL
 */
export function compressImage(file, maxWidth = 1200, quality = 0.78) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round(h * maxWidth / w);
          w = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}
