/**
 * API client for SkoolMe backend
 * Handles file upload, analysis, and progress tracking
 */

class SkoolMeAPI {
  constructor(baseURL = 'https://skoolmebackend-695368262076.europe-west1.run.app') {
    this.baseURL = baseURL;
    this.currentSessionId = null;
  }

  /**
   * Upload files to the backend
   * @param {File[]} files - Array of files to upload
   * @returns {Promise<Object>} Upload response with session ID
   */
  async uploadFiles(files) {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const result = await response.json();
    this.currentSessionId = result.session_id;
    return result;
  }

  /**
   * Start analysis of uploaded files
   * @param {string} sessionId - Session ID from upload
   * @returns {Promise<Object>} Analysis start response
   */
  async startAnalysis(sessionId) {
    const response = await fetch(`${this.baseURL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ session_id: sessionId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis failed to start');
    }

    return await response.json();
  }

  /**
   * Get analysis progress
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Progress information
   */
  async getProgress(sessionId) {
    const response = await fetch(`${this.baseURL}/api/progress/${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get progress');
    }

    return await response.json();
  }

  /**
   * Clean up session files
   * @param {string} sessionId - Session ID to cleanup
   * @returns {Promise<Object>} Cleanup response
   */
  async cleanupSession(sessionId) {
    const response = await fetch(`${this.baseURL}/api/cleanup/${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Cleanup failed');
    }

    return await response.json();
  }

  /**
   * Check backend health
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const response = await fetch(`${this.baseURL}/api/health`);

    if (!response.ok) {
      throw new Error('Backend unavailable');
    }

    return await response.json();
  }

  /**
   * Poll for analysis completion
   * @param {string} sessionId - Session ID
   * @param {Function} onProgress - Progress callback
   * @param {number} pollInterval - Polling interval in ms (default: 2000)
   * @returns {Promise<Object>} Final analysis results
   */
  async pollAnalysis(sessionId, onProgress, pollInterval = 2000) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const progress = await this.getProgress(sessionId);
          
          if (onProgress) {
            onProgress(progress);
          }

          if (progress.status === 'completed') {
            resolve(progress);
          } else if (progress.status === 'error') {
            reject(new Error(progress.error || 'Analysis failed'));
          } else {
            setTimeout(poll, pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  static validateFile(file) {
    const documentTypes = ['txt', 'pdf', 'docx', 'png', 'jpg', 'jpeg', 'bmp'];
    const audioTypes = ['mp3', 'wav', 'm4a'];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension) {
      return {
        valid: false,
        error: 'File must have an extension'
      };
    }

    const isDocument = documentTypes.includes(fileExtension);
    const isAudio = audioTypes.includes(fileExtension);
    
    if (!isDocument && !isAudio) {
      return {
        valid: false,
        error: `Unsupported file type: .${fileExtension}`
      };
    }

    // Check file size
    const maxSize = isAudio ? 50 * 1024 * 1024 : 100 * 1024 * 1024; // 50MB for audio, 100MB for documents
    
    if (file.size > maxSize) {
      const maxSizeText = isAudio ? '50MB' : '100MB';
      return {
        valid: false,
        error: `File size exceeds ${maxSizeText} limit`
      };
    }

    return {
      valid: true,
      fileType: isDocument ? 'document' : 'audio',
      size: file.size
    };
  }

  /**
   * Validate multiple files
   * @param {File[]} files - Files to validate
   * @returns {Object} Validation results
   */
  static validateFiles(files) {
    const results = {
      valid: [],
      invalid: []
    };

    files.forEach(file => {
      const validation = this.validateFile(file);
      
      if (validation.valid) {
        results.valid.push({
          file,
          ...validation
        });
      } else {
        results.invalid.push({
          file,
          error: validation.error
        });
      }
    });

    return results;
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size string
   */
  static formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Get status color based on score
   * @param {number} score - Analysis score (0-100)
   * @returns {string} Color class name
   */
  static getStatusColor(score) {
    if (score >= 80) return 'green';
    if (score >= 30) return 'yellow';
    return 'red';
  }

  /**
   * Get status text based on score
   * @param {number} score - Analysis score (0-100)
   * @returns {string} Status text
   */
  static getStatusText(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 30) return 'Good';
    return 'Poor';
  }

  /**
   * Get file type icon
   * @param {string} filename - File name
   * @returns {string} Icon emoji
   */
  static getFileIcon(filename) {
    const extension = filename.split('.').pop()?.toLowerCase();
    const audioTypes = ['mp3', 'wav', 'm4a'];
    
    if (audioTypes.includes(extension)) {
      return '🎵';
    }
    
    return '📄';
  }
}

// Export for use in modules
export { SkoolMeAPI };

// Also make available globally
window.SkoolMeAPI = SkoolMeAPI;
