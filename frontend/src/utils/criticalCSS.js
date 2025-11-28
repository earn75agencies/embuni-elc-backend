/**
 * Critical CSS Generator and Inliner
 * Extracts and inlines critical CSS for above-the-fold content
 */

import { extractCritical } from 'critters-webpack-plugin';

class CriticalCSS {
  constructor() {
    this.criticalCSS = '';
    this.nonCriticalCSS = '';
  }

  /**
   * Generate critical CSS for a given HTML
   */
  async generateCriticalCSS(html, cssPath) {
    try {
      const result = await extractCritical({
        html,
        cssPath,
        width: 1200,
        height: 900,
        inlineThreshold: 0,
        minify: true,
        preload: true,
        pruneSource: false,
        mergeStylesheets: true,
        additionalStylesheets: [],
        fonts: true,
        keyframes: true,
        compress: true,
        include: [/\.css$/],
        exclude: [],
        ignore: [],
        logLevel: 'info'
      });

      this.criticalCSS = result.css;
      this.nonCriticalCSS = result.uncritical;
      
      return {
        critical: this.criticalCSS,
        nonCritical: this.nonCriticalCSS,
        html: result.html
      };
    } catch (error) {
      console.error('Error generating critical CSS:', error);
      return { critical: '', nonCritical: '', html };
    }
  }

  /**
   * Inline critical CSS into HTML
   */
  inlineCriticalCSS(html) {
    const styleTag = `<style id="critical-css">${this.criticalCSS}</style>`;
    const preloadLink = `<link rel="preload" href="/styles/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">`;
    const noScriptFallback = `<noscript><link rel="stylesheet" href="/styles/non-critical.css"></noscript>`;
    
    return html
      .replace('</head>', `${styleTag}${preloadLink}${noScriptFallback}</head>`);
  }

  /**
   * Extract critical CSS manually for development
   */
  extractCriticalManually() {
    // Critical CSS for above-the-fold content
    return `
      /* Critical CSS - Above the fold */
      body{margin:0;font-family:'Inter',system-ui,-apple-system,sans-serif;line-height:1.6;color:#1a1a1a;background:#fff}
      .container{max-width:1200px;margin:0 auto;padding:0 1rem}
      .header{position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid #e5e7eb}
      .nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 0}
      .logo{font-size:1.5rem;font-weight:700;color:#1e40af}
      .nav-links{display:flex;gap:2rem;list-style:none;margin:0;padding:0}
      .nav-link{text-decoration:none;color:#6b7280;font-weight:500;transition:color .2s}
      .nav-link:hover{color:#1e40af}
      .hero{padding:4rem 0;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
      .hero h1{font-size:3rem;font-weight:700;margin-bottom:1rem}
      .hero p{font-size:1.25rem;margin-bottom:2rem;opacity:.9}
      .btn{display:inline-block;padding:.75rem 2rem;background:#1e40af;color:#fff;text-decoration:none;border-radius:.5rem;font-weight:500;transition:all .2s}
      .btn:hover{background:#1e3a8a;transform:translateY(-1px)}
      .loading{display:flex;align-items:center;justify-content:center;min-height:200px}
      .spinner{width:2rem;height:2rem;border:2px solid #e5e7eb;border-top:2px solid #1e40af;border-radius:50%;animation:spin 1s linear infinite}
      @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      @media (max-width:768px){
        .hero h1{font-size:2rem}
        .hero p{font-size:1rem}
        .nav-links{display:none}
        .mobile-menu-btn{display:block}
      }
    `;
  }

  /**
   * Create non-critical CSS file
   */
  createNonCriticalFile() {
    // This would be handled by build tools in production
    return `
      /* Non-critical CSS - Below the fold */
      .features{padding:4rem 0;background:#f9fafb}
      .feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;margin-top:2rem}
      .feature-card{background:#fff;padding:2rem;border-radius:.5rem;box-shadow:0 1px 3px rgba(0,0,0,.1)}
      .feature-icon{width:3rem;height:3rem;background:#1e40af;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;margin-bottom:1rem}
      .feature-title{font-size:1.25rem;font-weight:600;margin-bottom:1rem}
      .feature-description{color:#6b7280;line-height:1.6}
      .footer{background:#1f2937;color:#fff;padding:3rem 0;margin-top:4rem}
      .footer-content{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem}
      .footer-section h3{margin-bottom:1rem}
      .footer-links{list-style:none;padding:0}
      .footer-links li{margin-bottom:.5rem}
      .footer-links a{color:#9ca3af;text-decoration:none}
      .footer-links a:hover{color:#fff}
      .footer-bottom{border-top:1px solid #374151;margin-top:2rem;padding-top:2rem;text-align:center}
    `;
  }

  /**
   * Initialize critical CSS system
   */
  init() {
    if (typeof window === 'undefined') return;

    // Add critical CSS to head immediately
    const criticalStyle = document.createElement('style');
    criticalStyle.id = 'critical-css';
    criticalStyle.textContent = this.extractCriticalManually();
    document.head.appendChild(criticalStyle);

    // Load non-critical CSS asynchronously
    const nonCriticalLink = document.createElement('link');
    nonCriticalLink.rel = 'preload';
    nonCriticalLink.href = '/styles/non-critical.css';
    nonCriticalLink.as = 'style';
    nonCriticalLink.onload = () => {
      nonCriticalLink.rel = 'stylesheet';
    };
    document.head.appendChild(nonCriticalLink);

    // Fallback for no-JS
    const noScriptFallback = document.createElement('noscript');
    const fallbackLink = document.createElement('link');
    fallbackLink.rel = 'stylesheet';
    fallbackLink.href = '/styles/non-critical.css';
    noScriptFallback.appendChild(fallbackLink);
    document.head.appendChild(noScriptFallback);
  }
}

export const criticalCSS = new CriticalCSS();

// Auto-initialize
if (typeof window !== 'undefined') {
  criticalCSS.init();
}

export default criticalCSS;
