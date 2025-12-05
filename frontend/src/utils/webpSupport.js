/**
 * WebP Image Support
 * Automatically converts and serves WebP images when supported
 */

class WebPSupport {
  constructor() {
    this.supported = false;
    this.fallbackCache = new Map();
    this.conversionCache = new Map();
  }

  /**
   * Check WebP support
   */
  async checkSupport() {
    if (this.supported !== null) return this.supported;

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        this.supported = (webP.height === 2);
        resolve(this.supported);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Get WebP version of image
   */
  async getWebPImage(originalSrc) {
    if (!this.supported) {
      return originalSrc;
    }

    // Check cache first
    if (this.conversionCache.has(originalSrc)) {
      return this.conversionCache.get(originalSrc);
    }

    // Generate WebP URL
    const webpSrc = this.convertToWebP(originalSrc);
    
    // Cache and return
    this.conversionCache.set(originalSrc, webpSrc);
    return webpSrc;
  }

  /**
   * Convert image URL to WebP
   */
  convertToWebP(src) {
    // If already WebP, return as-is
    if (src.includes('.webp')) {
      return src;
    }

    // For external images, use a conversion service
    if (src.startsWith('http')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(src)}&output=webp`;
    }

    // For local images, replace extension
    return src.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
  }

  /**
   * Create picture element with WebP support
   */
  createPictureElement(src, alt, className = '', sizes = null) {
    const picture = document.createElement('picture');
    
    // WebP source
    const webpSource = document.createElement('source');
    webpSource.type = 'image/webp';
    webpSource.srcset = this.generateSrcSet(this.convertToWebP(src));
    if (sizes) {
      webpSource.sizes = sizes;
    }
    
    // Original format source
    const originalSource = document.createElement('source');
    originalSource.type = this.getMimeType(src);
    originalSource.srcset = this.generateSrcSet(src);
    if (sizes) {
      originalSource.sizes = sizes;
    }
    
    // Fallback img
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.className = className;
    img.loading = 'lazy';
    
    picture.appendChild(webpSource);
    picture.appendChild(originalSource);
    picture.appendChild(img);
    
    return picture;
  }

  /**
   * Generate responsive srcset
   */
  generateSrcSet(src) {
    const widths = [320, 640, 768, 1024, 1280, 1536];
    const srcset = [];
    
    widths.forEach(width => {
      const sizedSrc = this.addSizeToSrc(src, width);
      srcset.push(`${sizedSrc} ${width}w`);
    });
    
    return srcset.join(', ');
  }

  /**
   * Add size parameter to image URL
   */
  addSizeToSrc(src, width) {
    if (src.includes('unsplash.com')) {
      return `${src}&w=${width}&q=80&auto=format`;
    }
    
    if (src.startsWith('http')) {
      return `${src}?w=${width}`;
    }
    
    return src;
  }

  /**
   * Get MIME type from file extension
   */
  getMimeType(src) {
    const extension = src.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    
    return mimeTypes[extension] || 'image/jpeg';
  }

  /**
   * Process all images on page
   */
  async processPageImages() {
    await this.checkSupport();
    
    const images = document.querySelectorAll('img[data-webp]');
    
    images.forEach(img => {
      const originalSrc = img.src || img.getAttribute('data-src');
      const alt = img.alt || '';
      const className = img.className || '';
      const sizes = img.getAttribute('sizes') || null;
      
      const picture = this.createPictureElement(originalSrc, alt, className, sizes);
      
      // Replace img with picture
      img.parentNode.replaceChild(picture, img);
    });
  }

  /**
   * Convert canvas to WebP
   */
  async canvasToWebP(canvas, quality = 0.8) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/webp', quality);
    });
  }

  /**
   * Convert file to WebP
   */
  async fileToWebP(file, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp'
          }));
        }, 'image/webp', quality);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Initialize WebP support
   */
  async init() {
    await this.checkSupport();
    
    // Add WebP class to html for CSS targeting
    if (this.supported) {
      document.documentElement.classList.add('webp');
    } else {
      document.documentElement.classList.add('no-webp');
    }
    
    // Process images with data-webp attribute
    this.processPageImages();
  }
}

export const webpSupport = new WebPSupport();

// Auto-initialize
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      webpSupport.init();
    });
  } else {
    webpSupport.init();
  }
}

export default webpSupport;
