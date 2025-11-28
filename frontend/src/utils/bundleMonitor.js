/**
 * Bundle Size Monitor
 * Tracks and analyzes bundle sizes for performance optimization
 */

class BundleSizeMonitor {
  constructor() {
    this.bundleData = new Map();
    this.thresholds = {
      critical: 500 * 1024, // 500KB
      warning: 250 * 1024,  // 250KB
      good: 100 * 1024      // 100KB
    };
  }

  /**
   * Analyze bundle sizes from manifest
   */
  analyzeBundleSizes(manifest) {
    const bundles = {};
    
    Object.entries(manifest).forEach(([key, entry]) => {
      if (key.endsWith('.js') || key.endsWith('.css')) {
        const size = this.estimateSize(entry.file);
        const type = key.includes('vendor') ? 'vendor' : 
                   key.includes('chunk') ? 'chunk' : 'main';
        
        bundles[key] = {
          file: entry.file,
          size: size,
          type: type,
          status: this.getStatus(size)
        };
        
        this.bundleData.set(key, bundles[key]);
      }
    });

    return bundles;
  }

  /**
   * Estimate file size (in production, this would be actual file size)
   */
  estimateSize(filename) {
    // This would be replaced with actual file size in production
    const sizeMap = {
      'index.js': 54 * 1024,
      'react-vendor.js': 256 * 1024,
      'charts-vendor.js': 259 * 1024,
      'vendor.js': 168 * 1024,
      'i18n-vendor.js': 55 * 1024
    };
    
    return sizeMap[filename.split('/').pop()] || 50 * 1024;
  }

  /**
   * Get size status
   */
  getStatus(size) {
    if (size > this.thresholds.critical) return 'critical';
    if (size > this.thresholds.warning) return 'warning';
    if (size > this.thresholds.good) return 'good';
    return 'excellent';
  }

  /**
   * Generate bundle report
   */
  generateReport() {
    const bundles = Array.from(this.bundleData.values());
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
    
    const report = {
      timestamp: new Date().toISOString(),
      totalSize: totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      bundles: bundles,
      summary: {
        total: bundles.length,
        critical: bundles.filter(b => b.status === 'critical').length,
        warning: bundles.filter(b => b.status === 'warning').length,
        good: bundles.filter(b => b.status === 'good').length,
        excellent: bundles.filter(b => b.status === 'excellent').length
      },
      recommendations: this.getRecommendations(bundles)
    };

    return report;
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(bundles) {
    const recommendations = [];
    
    bundles.forEach(bundle => {
      if (bundle.status === 'critical') {
        recommendations.push({
          type: 'critical',
          bundle: bundle.file,
          message: `Bundle ${bundle.file} is too large (${this.formatBytes(bundle.size)}). Consider code splitting.`,
          action: 'split'
        });
      } else if (bundle.status === 'warning') {
        recommendations.push({
          type: 'warning',
          bundle: bundle.file,
          message: `Bundle ${bundle.file} could be optimized (${this.formatBytes(bundle.size)}).`,
          action: 'optimize'
        });
      }
    });

    // Add general recommendations
    const vendorBundles = bundles.filter(b => b.type === 'vendor');
    if (vendorBundles.length > 3) {
      recommendations.push({
        type: 'info',
        message: 'Consider merging vendor bundles to reduce HTTP requests.',
        action: 'merge'
      });
    }

    return recommendations;
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Monitor bundle changes
   */
  monitorChanges() {
    if (typeof window === 'undefined') return;

    // Monitor performance entries
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          this.recordLoadTime(entry);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Record load times
   */
  recordLoadTime(entry) {
    const loadTime = entry.duration;
    const size = entry.transferSize || 0;
    
    console.log(`Bundle ${entry.name}: ${this.formatBytes(size)} loaded in ${loadTime.toFixed(2)}ms`);
    
    // Store for analysis
    this.bundleData.set(entry.name, {
      ...this.bundleData.get(entry.name),
      loadTime: loadTime,
      transferSize: size
    });
  }

  /**
   * Generate performance score
   */
  calculatePerformanceScore() {
    const bundles = Array.from(this.bundleData.values());
    let score = 100;
    
    bundles.forEach(bundle => {
      switch (bundle.status) {
        case 'critical':
          score -= 20;
          break;
        case 'warning':
          score -= 10;
          break;
        case 'good':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Export report to JSON
   */
  exportReport() {
    const report = this.generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bundle-report-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Display bundle analysis in console
   */
  displayConsoleReport() {
    const report = this.generateReport();
    
    console.group('📊 Bundle Size Analysis');
    console.log(`Total Size: ${report.totalSizeFormatted}`);
    console.log(`Performance Score: ${this.calculatePerformanceScore()}/100`);
    
    console.table(report.bundles.map(bundle => ({
      File: bundle.file,
      Size: this.formatBytes(bundle.size),
      Type: bundle.type,
      Status: bundle.status.toUpperCase()
    })));
    
    if (report.recommendations.length > 0) {
      console.group('💡 Recommendations');
      report.recommendations.forEach(rec => {
        console.log(`${rec.type.toUpperCase()}: ${rec.message}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }
}

export const bundleMonitor = new BundleSizeMonitor();

// Auto-initialize and monitor
if (typeof window !== 'undefined') {
  // Wait for page load to analyze bundles
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        bundleMonitor.monitorChanges();
        bundleMonitor.displayConsoleReport();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      bundleMonitor.monitorChanges();
      bundleMonitor.displayConsoleReport();
    }, 1000);
  }
}

export default bundleMonitor;
