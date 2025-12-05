/**
 * Font Loading Optimization
 * Implements font loading strategies for better performance
 */

class FontOptimizer {
  constructor() {
    this.loadedFonts = new Set();
    this.fontFaceSet = new Set();
    this.criticalFonts = [
      'Inter:wght@400;500;600;700',
      'system-ui'
    ];
  }

  /**
   * Initialize font optimization
   */
  async init() {
    this.preloadCriticalFonts();
    this.setupFontFaceObserver();
    this.optimizeFontLoading();
    this.setupFontSwap();
  }

  /**
   * Preload critical fonts
   */
  preloadCriticalFonts() {
    this.criticalFonts.forEach(fontFamily => {
      this.preloadFont(fontFamily);
    });
  }

  /**
   * Preload font with proper strategy
   */
  preloadFont(fontFamily) {
    if (this.loadedFonts.has(fontFamily)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    
    // Generate font URL
    const fontUrl = this.generateFontUrl(fontFamily);
    link.href = fontUrl;
    
    // Add error handling
    link.onerror = () => {
      console.warn(`Failed to preload font: ${fontFamily}`);
      this.loadFallbackFont(fontFamily);
    };
    
    link.onload = () => {
      this.loadedFonts.add(fontFamily);
      console.log(`Font preloaded: ${fontFamily}`);
    };
    
    document.head.appendChild(link);
  }

  /**
   * Generate font URL (Google Fonts example)
   */
  generateFontUrl(fontFamily) {
    if (fontFamily.includes('Inter')) {
      return 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2';
    }
    
    // Handle other fonts
    return `/fonts/${fontFamily.replace(':', '-').replace(';', '')}.woff2`;
  }

  /**
   * Load fallback font
   */
  loadFallbackFont(fontFamily) {
    const systemFonts = [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif'
    ];
    
    document.documentElement.style.setProperty(
      `--font-${fontFamily.replace(':', '-')}`,
      systemFonts.join(', ')
    );
  }

  /**
   * Setup Font Face Observer
   */
  setupFontFaceObserver() {
    if ('fonts' in document) {
      // const fontObserver = new FontFaceObserver();
      
      // Observe critical fonts
      this.criticalFonts.forEach(fontFamily => {
        const fontFace = new FontFace(
          fontFamily.split(':')[0],
          `url(${this.generateFontUrl(fontFamily)})`
        );
        
        fontFace.load().then(() => {
          document.fonts.add(fontFace);
          this.fontFaceSet.add(fontFamily);
          console.log(`Font face loaded: ${fontFamily}`);
        }).catch(error => {
          console.error(`Font face failed: ${fontFamily}`, error);
        });
      });
    }
  }

  /**
   * Optimize font loading strategy
   */
  optimizeFontLoading() {
    // Add font-display: swap to all @font-face rules
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap;
      }
    `;
    document.head.appendChild(style);

    // Setup font loading states
    this.setupFontLoadingStates();
  }

  /**
   * Setup font loading states
   */
  setupFontLoadingStates() {
    // Add loading class to html
    document.documentElement.classList.add('fonts-loading');
    
    // Remove loading class when fonts are loaded
    const checkFontsLoaded = () => {
      if (this.fontFaceSet.size >= this.criticalFonts.length) {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
        console.log('All critical fonts loaded');
      }
    };

    // Check periodically
    const checkInterval = setInterval(() => {
      checkFontsLoaded();
      if (this.fontFaceSet.size >= this.criticalFonts.length) {
        clearInterval(checkInterval);
      }
    }, 100);

    // Fallback timeout
    setTimeout(() => {
      clearInterval(checkInterval);
      document.documentElement.classList.remove('fonts-loading');
      document.documentElement.classList.add('fonts-timeout');
    }, 3000);
  }

  /**
   * Setup font swap for FOUT/FOIT prevention
   */
  setupFontSwap() {
    // Create font swap CSS
    const swapStyle = document.createElement('style');
    swapStyle.textContent = `
      .fonts-loading .font-inter {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .fonts-loaded .font-inter {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      /* Font loading transitions */
      .font-inter {
        transition: font-family 0.3s ease;
      }
    `;
    document.head.appendChild(swapStyle);
  }

  /**
   * Load variable fonts efficiently
   */
  loadVariableFont(fontFamily, weights = [400, 500, 600, 700]) {
    const variationSettings = weights.map(weight => `'wght' ${weight}`).join(', ');
    
    const fontFace = new FontFace(
      fontFamily,
      `url(${this.generateVariableFontUrl(fontFamily)})`,
      {
        weight: weights.join(' '),
        variationSettings: variationSettings
      }
    );
    
    fontFace.load().then(() => {
      document.fonts.add(fontFace);
      console.log(`Variable font loaded: ${fontFamily}`);
    });
  }

  /**
   * Generate variable font URL
   */
  generateVariableFontUrl(fontFamily) {
    // Implementation for variable font URLs
    return `/fonts/${fontFamily}-variable.woff2`;
  }

  /**
   * Subset fonts for better performance
   */
  async subsetFont(fontFamily, characters) {
    // This would typically be done server-side
    // Here's a client-side approach using Font Subsetter
    try {
      const response = await fetch(`/api/fonts/subset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fontFamily,
          characters
        })
      });
      
      if (response.ok) {
        const subsetFont = await response.blob();
        const fontUrl = URL.createObjectURL(subsetFont);
        
        const fontFace = new FontFace(fontFamily + '-subset', `url(${fontUrl})`);
        await fontFace.load();
        document.fonts.add(fontFace);
        
        return fontFace;
      }
    } catch (error) {
      console.error('Font subsetting failed:', error);
    }
    
    return null;
  }

  /**
   * Get font loading metrics
   */
  getFontMetrics() {
    return {
      loadedFonts: Array.from(this.loadedFonts),
      fontFaceSet: Array.from(this.fontFaceSet),
      criticalFonts: this.criticalFonts,
      allLoaded: this.fontFaceSet.size >= this.criticalFonts.length
    };
  }

  /**
   * Preload font variants
   */
  preloadFontVariants(baseFont, variants = ['italic', 'bold']) {
    variants.forEach(variant => {
      const fontName = `${baseFont}-${variant}`;
      this.preloadFont(fontName);
    });
  }

  /**
   * Setup font performance monitoring
   */
  setupFontPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource' && 
              entry.name.includes('.woff') || 
              entry.name.includes('.ttf')) {
            console.log(`Font loaded: ${entry.name} in ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }
}

export const fontOptimizer = new FontOptimizer();

// Auto-initialize
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fontOptimizer.init();
    });
  } else {
    fontOptimizer.init();
  }
}

export default fontOptimizer;
