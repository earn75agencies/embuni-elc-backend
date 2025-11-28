/**
 * Resource Hints Utility
 * Implements preload, prefetch, and other performance optimizations
 */

class ResourceHints {
  constructor() {
    this.preloadedResources = new Set();
    this.prefetchedResources = new Set();
  }

  /**
   * Preload critical resources
   */
  preload(href, as = 'script', crossorigin = null) {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }

    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  /**
   * Prefetch resources for future navigation
   */
  prefetch(href, as = null) {
    if (this.prefetchedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    
    if (as) {
      link.as = as;
    }

    document.head.appendChild(link);
    this.prefetchedResources.add(href);
  }

  /**
   * Preconnect to external domains
   */
  preconnect(href, crossorigin = null) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }

    document.head.appendChild(link);
  }

  /**
   * DNS prefetch for external domains
   */
  dnsPrefetch(href) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * Initialize critical resource hints
   */
  initCriticalHints() {
    // Preconnect to external APIs
    this.preconnect('https://api.example.com', 'anonymous');
    this.preconnect('https://cdn.example.com', 'anonymous');
    
    // DNS prefetch for external domains
    this.dnsPrefetch('//fonts.googleapis.com');
    this.dnsPrefetch('//fonts.gstatic.com');
    this.dnsPrefetch('//www.google-analytics.com');
    
    // Preload critical fonts
    this.preload(
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'style'
    );
    
    // Preload critical scripts
    this.preload('/js/critical.js', 'script');
    
    // Prefetch likely next pages
    this.prefetch('/about');
    this.prefetch('/programs');
    this.prefetch('/events');
  }

  /**
   * Prefetch based on user behavior
   */
  prefetchOnHover(element, href) {
    let timeout;
    
    const handleMouseEnter = () => {
      timeout = setTimeout(() => {
        this.prefetch(href);
      }, 100);
    };
    
    const handleMouseLeave = () => {
      clearTimeout(timeout);
    };
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
  }

  /**
   * Intersection Observer for lazy prefetching
   */
  setupIntersectionPrefetch() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const href = entry.target.getAttribute('data-prefetch');
          if (href) {
            this.prefetch(href);
            observer.unobserve(entry.target);
          }
        }
      });
    }, { rootMargin: '50px' });

    // Observe elements with data-prefetch attribute
    document.querySelectorAll('[data-prefetch]').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Preload images in viewport
   */
  preloadViewportImages() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            this.preload(src, 'image');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }
}

export const resourceHints = new ResourceHints();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      resourceHints.initCriticalHints();
      resourceHints.setupIntersectionPrefetch();
      resourceHints.preloadViewportImages();
    });
  } else {
    resourceHints.initCriticalHints();
    resourceHints.setupIntersectionPrefetch();
    resourceHints.preloadViewportImages();
  }
}

export default resourceHints;
