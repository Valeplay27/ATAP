// Utilidad para comprimir y redimensionar imágenes del lado del cliente
// Previene QuotaExceededError en localStorage garantizando que fotos/logos pesen < 30KB

/**
 * Comprime un archivo de imagen (File / Blob) a un DataURL en base64 liviano.
 * @param {File|Blob} file Archivo seleccionado por el usuario
 * @param {number} maxWidth Ancho máximo en px (default 300)
 * @param {number} maxHeight Alto máximo en px (default 300)
 * @param {number} quality Calidad JPEG entre 0.1 y 1.0 (default 0.78)
 * @returns {Promise<string>} Data URL comprimido
 */
export function compressImageFile(file, maxWidth = 300, maxHeight = 300, quality = 0.78) {
  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob)) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => resolve('');
    reader.onload = (e) => {
      const src = e.target?.result;
      if (!src) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // En caso de error al cargar el elemento Image, retornar el resultado original si no es gigante
        resolve(typeof src === 'string' && src.length < 100000 ? src : '');
      };
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width <= 0 || height <= 0) {
            resolve(src);
            return;
          }

          // Redimensionar proporcionalmente
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(src);
            return;
          }

          // Dibujar con suavizado
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Determinar formato: JPEG para fotos/logos sin canal alfa para máxima compresión
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          console.warn('[ATAP] Error al procesar canvas de compresión:', err);
          resolve(typeof src === 'string' && src.length < 150000 ? src : '');
        }
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Comprime un DataURL existente si excede un tamaño prudente (> 40 KB).
 * @param {string} dataUrl 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @param {number} quality 
 * @returns {Promise<string>}
 */
export function compressBase64Image(dataUrl, maxWidth = 300, maxHeight = 300, quality = 0.78) {
  if (!dataUrl || typeof dataUrl !== 'string') return Promise.resolve('');
  // Si no es un data URL o ya es pequeño (< 40 KB de texto ~ 30 KB binario), no necesita recomprimir
  if (!dataUrl.startsWith('data:image') || dataUrl.length < 40000) {
    return Promise.resolve(dataUrl);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (e) {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}
