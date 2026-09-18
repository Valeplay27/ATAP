// Utilidad universal para resolver rutas de assets tanto en desarrollo local como en producción (GitHub Pages con prefijo /ATAP/)

const KNOWN_ASSET_CASING = {
  'evento.png': 'Evento.png',
  'logo platino.png': 'Logo Platino.png',
  'hero1.png': 'hero1.png',
  'logo.png': 'logo.png',
  'redes.png': 'Redes.png'
};

export function getAssetUrl(path) {
  if (!path || typeof path !== 'string') return '';

  // Si ya es una URL absoluta de internet, base64 data URI o blob, retornar tal cual
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Obtener la base configurada por Vite (ej. '/ATAP/' en GitHub Pages, o '/' en local)
  const base = import.meta.env?.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Si la ruta ya incluye la base configurada (ej. 'ATAP/assets/...'), removerla para normalizar
  const prefixNoSlash = cleanBase.replace(/^\/+|\/+$/g, '');
  if (prefixNoSlash && cleanPath.startsWith(prefixNoSlash + '/')) {
    cleanPath = cleanPath.slice(prefixNoSlash.length + 1);
  }

  // Normalizar mayúsculas/minúsculas exactas para Linux (GitHub Pages es sensible a mayúsculas)
  const lowerPath = cleanPath.toLowerCase();
  for (const [key, correctName] of Object.entries(KNOWN_ASSET_CASING)) {
    if (lowerPath === `assets/${key}`) {
      cleanPath = `assets/${correctName}`;
      break;
    }
  }

  return `${cleanBase}${cleanPath}`;
}

export function handleImageFallback(e, fallbackPath = '/assets/logo.png') {
  if (e && e.target) {
    e.target.onerror = null;
    e.target.src = getAssetUrl(fallbackPath);
  }
}

export default getAssetUrl;
