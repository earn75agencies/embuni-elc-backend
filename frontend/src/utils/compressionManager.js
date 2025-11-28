/**
 * Compression Middleware and Utilities
 * Implements various compression algorithms and optimization
 */

class CompressionManager {
  constructor() {
    this.compressionMethods = ['gzip', 'br', 'deflate'];
    this.supportedMethods = new Set();
    this.compressionCache = new Map();
  }

  /**
   * Check browser compression support
   */
  async checkCompressionSupport() {
    if (typeof CompressionStream === 'undefined') {
      return ['gzip']; // Fallback assumption
    }

    const supported = [];
    
    for (const method of this.compressionMethods) {
      try {
        const stream = new CompressionStream(method);
        supported.push(method);
        this.supportedMethods.add(method);
      } catch (error) {
        console.warn(`Compression method ${method} not supported:`, error);
      }
    }
    
    return supported;
  }

  /**
   * Compress data using available method
   */
  async compress(data, method = 'gzip') {
    if (!this.supportedMethods.has(method)) {
      method = Array.from(this.supportedMethods)[0] || 'gzip';
    }

    // Check cache first
    const cacheKey = `${method}_${typeof data === 'string' ? data.length : data.byteLength}`;
    if (this.compressionCache.has(cacheKey)) {
      return this.compressionCache.get(cacheKey);
    }

    try {
      let compressed;
      
      if (typeof data === 'string') {
        compressed = await this.compressString(data, method);
      } else {
        compressed = await this.compressArrayBuffer(data, method);
      }
      
      // Cache result
      this.compressionCache.set(cacheKey, compressed);
      
      return compressed;
    } catch (error) {
      console.error(`Compression failed for method ${method}:`, error);
      return data; // Return original data
    }
  }

  /**
   * Compress string data
   */
  async compressString(str, method) {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(str);
    return this.compressArrayBuffer(uint8Array, method);
  }

  /**
   * Compress array buffer
   */
  async compressArrayBuffer(buffer, method) {
    if (typeof CompressionStream !== 'undefined') {
      const compressionStream = new CompressionStream(method);
      const writer = compressionStream.writable.getWriter();
      const reader = compressionStream.readable.getReader();
      
      // Write data to compression stream
      writer.write(buffer);
      writer.close();
      
      // Read compressed data
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result;
    }
    
    // Fallback for browsers without CompressionStream
    return this.fallbackCompression(buffer, method);
  }

  /**
   * Fallback compression using pako or similar library
   */
  fallbackCompression(buffer, method) {
    // This would use a library like pako in real implementation
    console.warn('Using fallback compression - consider adding pako library');
    return buffer;
  }

  /**
   * Decompress data
   */
  async decompress(compressedData, method = 'gzip') {
    try {
      if (typeof DecompressionStream !== 'undefined') {
        const decompressionStream = new DecompressionStream(method);
        const writer = decompressionStream.writable.getWriter();
        const reader = decompressionStream.readable.getReader();
        
        writer.write(compressedData);
        writer.close();
        
        const chunks = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            chunks.push(value);
          }
        }
        
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        return result;
      }
      
      // Fallback decompression
      return this.fallbackDecompression(compressedData, method);
    } catch (error) {
      console.error(`Decompression failed for method ${method}:`, error);
      return compressedData;
    }
  }

  /**
   * Fallback decompression
   */
  fallbackDecompression(compressedData, method) {
    console.warn('Using fallback decompression');
    return compressedData;
  }

  /**
   * Get compression ratio
   */
  getCompressionRatio(original, compressed) {
    const originalSize = typeof original === 'string' ? 
      new Blob([original]).size : original.byteLength;
    const compressedSize = compressed.byteLength;
    
    return {
      ratio: compressedSize / originalSize,
      savings: ((originalSize - compressedSize) / originalSize) * 100,
      originalSize,
      compressedSize
    };
  }

  /**
   * Compress API response
   */
  async compressResponse(response, method = 'gzip') {
    if (!response.body) {
      return response;
    }

    const reader = response.body.getReader();
    const chunks = [];
    
    // Read all chunks
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        chunks.push(value);
      }
    }
    
    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Compress
    const compressed = await this.compress(buffer, method);
    
    // Create new response
    return new Response(compressed, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Content-Encoding': method,
        'Content-Length': compressed.length.toString()
      }
    });
  }

  /**
   * Optimize JSON before compression
   */
  optimizeJSON(data) {
    // Remove unnecessary whitespace
    const jsonString = JSON.stringify(data);
    
    // Additional optimizations could be added here:
    // - Remove null values
    // - Optimize number formats
    // - Use shorter property names
    
    return jsonString;
  }

  /**
   * Cache management
   */
  clearCache() {
    this.compressionCache.clear();
  }

  getCacheSize() {
    return this.compressionCache.size;
  }

  /**
   * Initialize compression system
   */
  async init() {
    await this.checkCompressionSupport();
    
    // Add compression info to page
    this.addCompressionInfo();
    
    // Setup compression for API calls
    this.setupAPICompression();
  }

  /**
   * Add compression info to page
   */
  addCompressionInfo() {
    const info = {
      supportedMethods: Array.from(this.supportedMethods),
      cacheSize: this.getCacheSize()
    };
    
    console.log('Compression Support:', info);
    
    // Add to window for debugging
    if (typeof window !== 'undefined') {
      window.compressionInfo = info;
    }
  }

  /**
   * Setup compression for API calls
   */
  setupAPICompression() {
    if (typeof window === 'undefined') return;
    
    // Override fetch for compression
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options = {}] = args;
      
      // Add compression header
      options.headers = {
        ...options.headers,
        'Accept-Encoding': Array.from(this.supportedMethods).join(', ')
      };
      
      const response = await originalFetch(url, options);
      
      // Handle compressed response
      const contentEncoding = response.headers.get('content-encoding');
      
      if (contentEncoding && this.supportedMethods.has(contentEncoding)) {
        return this.decompressResponse(response, contentEncoding);
      }
      
      return response;
    };
  }

  /**
   * Decompress API response
   */
  async decompressResponse(response, method) {
    const compressedData = await response.arrayBuffer();
    const decompressedData = await this.decompress(compressedData, method);
    
    return new Response(decompressedData, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }
}

export const compressionManager = new CompressionManager();

// Auto-initialize
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      compressionManager.init();
    });
  } else {
    compressionManager.init();
  }
}

export default compressionManager;
