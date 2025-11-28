/**
 * Image utility functions for production-ready image handling
 * Provides branded fallbacks and image processing
 */

// Cloudinary configuration - replace with your actual Cloudinary settings
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Branded fallback images by type
const FALLBACK_IMAGES = {
  event: {
    light: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM4QjAwMDAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxODAiIHk9IjEzMCI+CjxwYXRoIGQ9Ik04IDdWMTJMMTMgMTdMMTggMTJWN0g4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNUI2QjZCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPkV2ZW50PC90ZXh0Pgo8L3N2Zz4=',
    dark: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMkIyQjJCIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM4QjAwMDAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxODAiIHk9IjEzMCI+CjxwYXRoIGQ9Ik04IDdWMTJMMTMgMTdMMTggMTJWN0g4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRjVGNUY1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPkV2ZW50PC90ZXh0Pgo8L3N2Zz4='
  },
  post: {
    light: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM4QjAwMDAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxODAiIHk9IjEzMCI+CjxwYXRoIGQ9Ik0xOSA1SDVWMThIMTlWNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xOSA4SDlWMTBIMTlWOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xOSAxMkg5VjE0SDE5VjEyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNUI2QjZCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPk5ld3M8L3RleHQ+Cjwvc3ZnPg==',
    dark: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMkIyQjJCIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM4QjAwMDAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxODAiIHk9IjEzMCI+CjxwYXRoIGQ9Ik0xOSA1SDVWMThIMTlWNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xOSA4SDlWMTBIMTlWOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xOSAxMkg5VjE0SDE5VjEyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRjVGNUY1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPk5ld3M8L3RleHQ+Cjwvc3ZnPg=='
  },
  gallery: {
    light: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iNTAiIGZpbGw9IiM4QjAwMDAiLz4KPHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNzUiIHk9IjE3NSI+CjxwYXRoIGQ9Ik0yMSAyMVwtNy01LTcgNXYxNGgxNHYtMTR6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPHRleHQgeD0iMjAwIiB5PSIzMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM1QjZCNkIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCI+R2FsbGVyeTwvdGV4dD4KPC9zdmc+',
    dark: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMkIyQjJCIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iNTAiIGZpbGw9IiM4QjAwMDAiLz4KPHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNzUiIHk9IjE3NSI+CjxwYXRoIGQ9Ik0yMSAyMVwtNy01LTcgNXYxNGgxNHYtMTR6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPHRleHQgeD0iMjAwIiB5PSIzMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGNUY1RjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCI+R2FsbGVyeTwvdGV4dD4KPC9zdmc+'
  },
  member: {
    light: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE4MCIgcj0iNTAiIGZpbGw9IiM4QjAwMDAiLz4KPHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNzUiIHk9IjE1NSI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMSAxMiAxNiAxMC4yMSAxNiA4UzE0LjIxIDQgMTIgNCA4IDEwLjIxIDggOFM5Ljc5IDEyIDEyIDEyWk0xMiAxNEM5Ljc5IDE0IDggMTUuNzkgOCAxOFM5Ljc5IDIyIDEyIDIyIDE2IDIwLjIxIDE2IDE4UzE0LjIxIDE0IDEyIDE0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjx0ZXh0IHg9IjIwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNUI2QjZCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPlRlYW0gTWVtYmVyPC90ZXh0Pgo8L3N2Zz4=',
    dark: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMkIyQjJCIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE4MCIgcj0iNTAiIGZpbGw9IiM4QjAwMDAiLz4KPHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNzUiIHk9IjE1NSI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMSAxMiAxNiAxMC4yMSAxNiA4UzE0LjIxIDQgMTIgNCA4IDEwLjIxIDggOVM5Ljc5IDEyIDEyIDEyWk0xMiAxNEM5Ljc5IDE0IDggMTUuNzkgOCAxOFM5Ljc5IDIyIDEyIDIyIDE2IDIwLjIxIDE2IDE4UzE0LjIxIDE0IDEyIDE0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjx0ZXh0IHg9IjIwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRjVGNUY1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPlRlYW0gTWVtYmVyPC90ZXh0Pgo8L3N2Zz4='
  },
  default: {
    light: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM4QjAwMDAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxODAiIHk9IjEzMCI+CjxwYXRoIGQ9Ik00IDE2bDQuNTg2LTQuNTg2YTIgMiAwIDAxMi44MjggMEwxNiAxNmwtNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE2bC00LjU4NiA0LjU4NmEyIDIgMCAwMS0yLjgyOCAwTDggMTZsLTQtNHoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzVCNkI2QiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2Ij5JbWFnZTwvdGV4dD4KPC9zdmc+',
    dark: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMkIyQjJCIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM4QjAwMDAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxODAiIHk9IjEzMCI+CjxwYXRoIGQ9Ik00IDE2bDQuNTg2LTQuNTg2YTIgMiAwIDAxMi44MjggMEwxNiAxNmwtNC41ODYtNC41ODZhMiAyIDAgMTEyLjgyOCAwTDIwIDE2bC00LjU4NiA0LjU4NmEyIDIgMCAwMS0yLjgyOCAwTDggMTZsLTQtNHoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0Y1RjVGNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2Ij5JbWFnZTwvdGV4dD4KPC9zdmc+'
  }
};

/**
 * Get processed image URL with Cloudinary optimizations
 */
export const getImageUrl = (src, options = {}) => {
  if (!src) return null;
  
  // If it's already a data URL or external URL, return as-is
  if (src.startsWith('data:') || src.startsWith('http')) {
    return src;
  }
  
  // If Cloudinary is configured and it's a relative path
  if (CLOUDINARY_CLOUD_NAME !== 'demo' && !src.startsWith('http')) {
    const transformations = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    
    const transformationString = transformations.length > 0 ? transformations.join(',') : 'auto';
    return `${CLOUDINARY_BASE_URL}/${transformationString}/${src}`;
  }
  
  return src;
};

/**
 * Get branded fallback image based on type and dimensions
 */
export const getFallbackImage = (type = 'default', width = 400, height = 300) => {
  const isDark = window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false;
  const theme = isDark ? 'dark' : 'light';
  
  const fallbackSet = FALLBACK_IMAGES[type] || FALLBACK_IMAGES.default;
  return fallbackSet[theme] || fallbackSet.light;
};

/**
 * Validate image URL
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate optimized image srcset for responsive images
 */
export const generateSrcSet = (baseSrc, sizes = [400, 800, 1200]) => {
  if (!baseSrc || baseSrc.startsWith('data:')) return '';
  
  return sizes
    .map(size => `${getImageUrl(baseSrc, { width: size })} ${size}w`)
    .join(', ');
};

/**
 * Preload image for better performance
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};
