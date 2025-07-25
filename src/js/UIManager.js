import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import { Document, Paragraph, HeadingLevel, TableOfContents, TextRun } from 'docx';
import { SkoolMeAPI } from './SkoolMeAPI.js';

export class UIManager {
  constructor(aiManager = null) {
    this.app = document.getElementById('app')
    this.isDarkMode = localStorage.getItem('darkMode') === 'true'
    this.aiManager = aiManager
    this.isSidebarOpen = false;
    this.api = new SkoolMeAPI();
  }

  init() {
    this.applyTheme()
    this.createHeader()
  }

  applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode
    localStorage.setItem('darkMode', this.isDarkMode)
    this.applyTheme()
  }

  showLoadingScreen() {
    this.app.innerHTML = `
      <div class="loading-screen">
        <div class="logo-container">
          <div class="logo">🎓 SkoolMe!</div>
          <div class="tagline">AI-Powered Learning Experience</div>
        </div>
        <div class="loading-spinner"></div>
      </div>
    `
  }

  hideLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen')
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out')
      setTimeout(() => {
        loadingScreen.remove()
      }, 500)
    }
  }

  createHeader() {
    const header = document.createElement('header')
    header.className = 'header'
    header.innerHTML = `
      <div class="container">
        <div class="header-content">
          <button class="btn btn-icon hamburger-menu" id="hamburger-menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div class="header-logo" id="header-logo" style="cursor:pointer;">🎓 SkoolMe!</div>
          <div class="header-actions">
            <button class="btn btn-icon" id="theme-toggle">
              ${this.isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    `
    
    document.body.insertBefore(header, this.app)

    // Add event listeners
    document.getElementById('theme-toggle').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('toggle-theme'))
      document.getElementById('theme-toggle').innerHTML = this.isDarkMode ? '🌙' : '☀️'
    })

    document.getElementById('hamburger-menu').addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Reload page when logo is clicked
    document.getElementById('header-logo').addEventListener('click', () => {
      window.location.reload();
    });
  }

  toggleSidebar() {
    const sidebar = document.getElementById('course-sidebar');
    const hamburger = document.getElementById('hamburger-menu');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) {
      this.isSidebarOpen = !this.isSidebarOpen;
      if (this.isSidebarOpen) {
        sidebar.classList.add('open');
        hamburger.classList.add('open');
        overlay.classList.add('open');
      } else {
        sidebar.classList.remove('open');
        hamburger.classList.remove('open');
        overlay.classList.remove('open');
      }
    }
  }


  showWelcomeScreen() {
    this.app.innerHTML = `
      <div class="main-content">
        <div class="container">
          <div class="welcome-screen fade-in">
            <h1 class="welcome-title">Welcome to SkoolMe! 🎓</h1>
            <p class="welcome-subtitle">
              Transform your learning materials into an AI-guided educational experience. 
              Upload recordings, notes, or let our AI create courses from scratch!
            </p>
            <div class="welcome-actions">
              <button class="btn btn-primary" id="get-started-btn">
                🚀 Get Started
              </button>
              <button class="btn btn-secondary" id="learn-more-btn">
                📖 Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    document.getElementById('hamburger-menu').style.display = 'none';
    document.querySelector('.header-content').classList.add('no-hamburger');


    document.getElementById('get-started-btn').addEventListener('click', () => {
      this.showLoginModal()
    })

    document.getElementById('learn-more-btn').addEventListener('click', () => {
      this.showAboutModal()
    })
  }

  showLoginModal() {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Welcome Back! 👋</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="login-form">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">
              Login
            </button>
          </form>
          <div class="text-center mt-4">
            <p>Don't have an account? <a href="#" id="signup-link">Sign up</a></p>
          </div>
        </div>
      </div>
    `

    // Add modal styles
    const style = document.createElement('style')
    style.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal {
        background: var(--secondary-white);
        border-radius: var(--radius-lg);
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: var(--shadow-lg);
      }
      body.dark .modal {
        background: #1E293B;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #64748B;
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(modal)

    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove()
      style.remove()
    })

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
        style.remove()
      }
    })

    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault()
      // Simulate login
      document.dispatchEvent(new CustomEvent('user-login', {
        detail: { email: 'user@example.com', name: 'Student' }
      }))
      modal.remove()
      style.remove()
    })
  }

  showDashboard() {
    this.app.innerHTML = `
      <div class="main-content">
        <div class="container">
          <div class="dashboard fade-in">
            <div class="dashboard-header">
              <h1>Welcome to SkoolMe! 👋</h1>
              <p>Ready to continue your learning journey?</p>
            </div>
            <div class="dashboard-actions">
              <button class="btn btn-primary" id="new-course-btn">
                ➕ Create New Course
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    // Add dashboard styles
    const style = document.createElement('style')
    style.textContent = `
      .dashboard {
        text-align: center;
        max-width: 600px;
        margin: 4rem auto;
        padding: 2rem;
      }
      .dashboard-header h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .dashboard-header p {
        font-size: 1.25rem;
        color: #64748B;
        margin-bottom: 3rem;
      }
      .dashboard-actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 300px;
        margin: 0 auto;
      }
    `
    document.head.appendChild(style)
    document.getElementById('hamburger-menu').style.display = 'none';
    document.querySelector('.header-content').classList.add('no-hamburger');



    document.getElementById('new-course-btn').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('start-new-course'))
    })
  }

  showApiKeyModal() {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>🔑 Gemini API Key</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 1rem; color: #64748B;">
            To use SkoolMe!, you need a Gemini API key from Google.
          </p>
          <form id="api-key-form">
            <div class="form-group">
              <label class="form-label">API Key</label>
              <input type="password" class="form-input" placeholder="Enter your Gemini API key" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">
              Save API Key
            </button>
          </form>
          <div class="text-center mt-4">
            <a href="https://makersuite.google.com/app/apikey" target="_blank" class="btn btn-secondary">
              Get API Key from Google
            </a>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove()
    })

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })

    document.getElementById('api-key-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const apiKey = e.target.querySelector('input').value
      localStorage.setItem('gemini-api-key', apiKey)
      modal.remove()
      alert('API Key saved successfully! 🎉')
    })
  }

  showCourseCreation() {
    this.app.innerHTML = `
      <div class="main-content">
        <div class="container">
          <div class="course-creation fade-in">
            <div class="creation-step">
              <h2 class="step-title">📚 Create Your Course</h2>
              
              <!-- Course Creation Method Selection -->
              <div class="creation-method-selector">
                <h3>How would you like to create your course?</h3>
                <div class="method-options">
                  <div class="method-option" data-method="title">
                    <div class="method-icon">✏️</div>
                    <h4>Title Only</h4>
                    <p>Create a course with just a title</p>
                  </div>
                  <div class="method-option" data-method="upload">
                    <div class="method-icon">📁</div>
                    <h4>Upload Files</h4>
                    <p>Upload documents and audio files for analysis</p>
                  </div>
                </div>
              </div>

              <!-- Course Form -->
              <form id="course-form" style="display: none;">
                <!-- Course Title Input -->
                <div class="form-group">
                  <label class="form-label">Course Title</label>
                  <input type="text" 
                         id="course-title-input" 
                         class="form-input" 
                         placeholder="e.g., Introduction to Physics" 
                         required>
                </div>

                <!-- School/Institution Input -->
                <div class="form-group">
                  <label class="form-label">School/Institution (Optional)</label>
                  <input type="text" 
                         id="school-input" 
                         class="form-input" 
                         placeholder="e.g., MIT, Harvard University">
                </div>

                <!-- File Upload Section (for upload method) -->
                <div class="form-group" id="file-upload-section" style="display: none;">
                  <label class="form-label">Learning Materials</label>
                  <div class="file-upload" id="file-upload">
                    <div class="file-upload-icon">📁</div>
                    <p><strong>Click to upload</strong> or drag and drop</p>
                    <p style="font-size: 0.875rem; color: #64748B;">
                      Documents: .txt, .pdf, .docx, .png, .jpg, .jpeg, .bmp (max 100MB)<br>
                      Audio: .mp3, .wav, .m4a (max 50MB)
                    </p>
                  </div>
                  <input type="file" 
                         id="file-input" 
                         multiple 
                         accept=".txt,.pdf,.docx,.png,.jpg,.jpeg,.bmp,.mp3,.wav,.m4a" 
                         style="display: none;">
                  
                  <!-- Uploaded Files Display -->
                  <div id="uploaded-files-display" style="display: none;">
                    <h4>Uploaded Files:</h4>
                    <div id="files-list"></div>
                  </div>
                </div>

                <!-- Extracted Content Section (for upload method) - Always visible when upload method is selected -->
                <div class="form-group" id="content-display-section" style="display: none;">
                  <label class="form-label">Extracted Content</label>
                  <div class="content-display-container">
                    <textarea id="content-display" 
                              class="content-display-textarea" 
                              readonly 
                              placeholder="Content will be extracted and displayed here after analysis..."></textarea>
                  </div>
                </div>

                <!-- Additional Notes Section (for upload method) - Always visible when upload method is selected -->
                <div class="form-group" id="additional-notes-section" style="display: none;">
                  <label class="form-label">Additional Notes (Optional)</label>
                  <textarea id="course-notes" 
                            class="form-input form-textarea" 
                            placeholder="Any specific focus areas or additional context for course generation..."></textarea>
                </div>

                <!-- Course Title Section (for upload method) - Shows after analysis -->
                <div class="form-group" id="course-title-section" style="display: none;">
                  <label class="form-label">Course Title *</label>
                  <input type="text" 
                         id="manual-course-title" 
                         class="form-input" 
                         placeholder="Enter your course title..." 
                         required>
                </div>

                <!-- Analysis Section -->
                <div id="analysis-section" style="display: none;">
                  <div class="analysis-header">
                    <h4>File Analysis</h4>
                    <p>Analyzing your uploaded files to generate course content...</p>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="progress-container">
                    <div class="progress-bar">
                      <div class="progress-fill" id="progress-fill"></div>
                    </div>
                    <div class="progress-text" id="progress-text">Preparing analysis...</div>
                  </div>
                  
                  <!-- Analysis Results -->
                  <div id="analysis-results" style="display: none;">
                    <div class="analysis-summary">
                      <h5>Analysis Summary</h5>
                      <div id="overall-score" class="score-display"></div>
                    </div>

                    <!-- Course Generation Section -->
                    <div id="course-generation-section" style="display: none;">
                      <h5>Generate Course</h5>
                      <div class="course-generation-container">
                        <button id="generate-course-btn" class="btn btn-primary">
                          <span class="btn-text">Generate Course Structure</span>
                          <div class="btn-loader" style="display: none;"></div>
                        </button>
                      </div>
                    </div>

                    <!-- Course Structure Display -->
                    <div id="course-structure-section" style="display: none;">
                      <h5>Generated Course Structure</h5>
                      <div id="course-structure-display"></div>
                    </div>
                    
                    <div class="files-analysis">
                      <h5>Individual File Results</h5>
                      <div id="file-results"></div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="form-actions">
                  <button type="button" 
                          id="analyze-btn" 
                          class="btn btn-secondary" 
                          style="display: none;">
                    🔍 Analyze Files
                  </button>
                  <button type="submit" 
                          id="create-course-btn" 
                          class="btn btn-primary">
                    🚀 Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `
    document.getElementById('hamburger-menu').style.display = 'none';
    document.querySelector('.header-content').classList.add('no-hamburger');

    // Add CSS to force visibility of analysis sections
    const analysisStyles = document.createElement('style');
    analysisStyles.textContent = `
      #content-display-section.visible,
      #content-display-section[style*="display: block"] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      #additional-notes-section.visible,
      #additional-notes-section[style*="display: block"] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      #course-title-section.visible,
      #course-title-section[style*="display: block"] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      #course-generation-section.visible,
      #course-generation-section[style*="display: block"] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      #analysis-results.visible,
      #analysis-results[style*="display: block"] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      .content-display-textarea {
        width: 100%;
        min-height: 120px;
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.5;
        resize: vertical;
      }
      
      .course-generation-container {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        margin: 15px 0;
      }
      
      .course-generation-container .form-group {
        margin-bottom: 15px;
      }
      
      .course-generation-container .form-label {
        font-weight: 600;
        margin-bottom: 8px;
        color: #374151;
      }
      
      .course-generation-container .form-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
      }
      
      .course-generation-container .form-textarea {
        min-height: 100px;
        resize: vertical;
      }
      
      .form-textarea {
        min-height: 100px;
        resize: vertical;
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.5;
      }
    `;
    document.head.appendChild(analysisStyles);

    // Initialize course creation functionality
    this.initializeCourseCreation();
  }

  initializeCourseCreation() {
    let currentMethod = null;
    let uploadedFiles = [];
    let sessionId = null;
    let analysisComplete = false;

    // Method selection
    const methodOptions = document.querySelectorAll('.method-option');
    const courseForm = document.getElementById('course-form');
    const fileUploadSection = document.getElementById('file-upload-section');
    const courseTitleInput = document.getElementById('course-title-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const createCourseBtn = document.getElementById('create-course-btn');

    methodOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove previous selection
        methodOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Select current option
        option.classList.add('selected');
        currentMethod = option.dataset.method;
        
        // Show form
        courseForm.style.display = 'block';
        
        // Configure form based on method
        const manualCourseTitleInput = document.getElementById('manual-course-title');
        if (currentMethod === 'title') {
          // Hide upload-related sections
          fileUploadSection.style.display = 'none';
          document.getElementById('content-display-section').style.display = 'none';
          document.getElementById('additional-notes-section').style.display = 'none';
          document.getElementById('course-title-section').style.display = 'none';
          
          // Show title input section
          courseTitleInput.parentElement.style.display = 'block';
          courseTitleInput.disabled = false;
          courseTitleInput.required = true;
          
          // Fix: Make manual-course-title not required
          if (manualCourseTitleInput) manualCourseTitleInput.required = false;
          
          // Configure buttons
          analyzeBtn.style.display = 'none';
          createCourseBtn.style.display = 'block';
          createCourseBtn.textContent = '🚀 Create Course';
          createCourseBtn.disabled = false;
        } else if (currentMethod === 'upload') {
          // Show upload-related sections
          fileUploadSection.style.display = 'block';
          document.getElementById('content-display-section').style.display = 'block';
          document.getElementById('additional-notes-section').style.display = 'block';
          
          // Hide title input section initially (shows after analysis)
          document.getElementById('course-title-section').style.display = 'none';
          courseTitleInput.parentElement.style.display = 'none';
          courseTitleInput.disabled = true;
          courseTitleInput.required = false;
          courseTitleInput.placeholder = 'Title will be generated after analysis';
          
          // Fix: Make manual-course-title required
          if (manualCourseTitleInput) manualCourseTitleInput.required = true;
          
          // Configure buttons
          analyzeBtn.style.display = 'block';
          createCourseBtn.style.display = 'none';
        }
      });
    });

    // File upload handling
    const fileUpload = document.getElementById('file-upload');
    const fileInput = document.getElementById('file-input');
    const uploadedFilesDisplay = document.getElementById('uploaded-files-display');
    const filesList = document.getElementById('files-list');

    fileUpload.addEventListener('click', () => {
      if (currentMethod === 'upload') {
        fileInput.click();
      }
    });

    fileUpload.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (currentMethod === 'upload') {
        fileUpload.classList.add('drag-over');
      }
    });

    fileUpload.addEventListener('dragleave', () => {
      fileUpload.classList.remove('drag-over');
    });

    fileUpload.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUpload.classList.remove('drag-over');
      
      if (currentMethod === 'upload') {
        const files = Array.from(e.dataTransfer.files);
        handleFileSelection(files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      handleFileSelection(files);
    });

    function handleFileSelection(files) {
      if (files.length === 0) return;

      // Validate files using API client
      const validation = SkoolMeAPI.validateFiles(files);
      
      if (validation.invalid.length > 0) {
        const errors = validation.invalid.map(item => 
          `${item.file.name}: ${item.error}`
        ).join('\n');
        
        alert('File validation errors:\n' + errors);
        return;
      }

      uploadedFiles = validation.valid.map(item => item.file);
      displayUploadedFiles();
      
      // Update upload area
      fileUpload.innerHTML = `
        <div class="file-upload-icon">✅</div>
        <p><strong>${uploadedFiles.length} file(s) selected</strong></p>
        <p style="font-size: 0.875rem; color: #64748B;">
          Click to change selection
        </p>
      `;
      
      // Show uploaded files and enable analyze button
      uploadedFilesDisplay.style.display = 'block';
      analyzeBtn.disabled = false;
      
      // Reset analysis state
      analysisComplete = false;
      document.getElementById('analysis-section').style.display = 'none';
    }

    function displayUploadedFiles() {
      filesList.innerHTML = uploadedFiles.map(file => {
        const fileSize = SkoolMeAPI.formatFileSize(file.size);
        const fileIcon = SkoolMeAPI.getFileIcon(file.name);
        
        return `
          <div class="file-item">
            <div class="file-info">
              <span class="file-icon">${fileIcon}</span>
              <span class="file-name">${file.name}</span>
              <span class="file-size">${fileSize}</span>
            </div>
            <div class="file-status">⏳ Ready</div>
          </div>
        `;
      }).join('');
    }

    // Clear previous analysis function
    function clearPreviousAnalysis() {
      // Clear analysis results
      const analysisResults = document.getElementById('analysis-results');
      if (analysisResults) {
        analysisResults.innerHTML = '';
      }
      
      // Reset course structure section
      const courseStructureSection = document.getElementById('course-structure-section');
      if (courseStructureSection) {
        courseStructureSection.style.display = 'none';
      }
      
      // Reset course structure display
      const courseStructureDisplay = document.getElementById('course-structure-display');
      if (courseStructureDisplay) {
        courseStructureDisplay.innerHTML = '';
      }
      
      // Reset progress bar
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');
      if (progressFill) {
        progressFill.style.width = '0%';
      }
      if (progressText) {
        progressText.textContent = 'Starting analysis...';
      }
      
      // Reset course title inputs
      const manualCourseTitleInput = document.getElementById('manual-course-title');
      if (manualCourseTitleInput) {
        manualCourseTitleInput.value = '';
      }
      
      // Reset course notes
      const courseNotesInput = document.getElementById('course-notes');
      if (courseNotesInput) {
        courseNotesInput.value = '';
      }
      
      // Reset create course button
      const createCourseBtn = document.getElementById('create-course-btn');
      if (createCourseBtn) {
        createCourseBtn.style.display = 'none';
        createCourseBtn.disabled = true;
      }
      
      // Remove processing note if it exists
      const processingNote = document.querySelector('.processing-note');
      if (processingNote) {
        processingNote.remove();
      }
    }

    // Analysis button handler
    analyzeBtn.addEventListener('click', async () => {
      if (uploadedFiles.length === 0) {
        alert('Please select files to analyze');
        return;
      }

      analyzeBtn.disabled = true;
      analyzeBtn.textContent = 'Analyzing...';
      
      try {
        // Clear previous analysis results and UI
        clearPreviousAnalysis();
        analysisComplete = false;
        
        // Show analysis section
        document.getElementById('analysis-section').style.display = 'block';
        
        // Add processing note
        const analysisSection = document.getElementById('analysis-section');
        const processingNote = document.createElement('div');
        processingNote.className = 'processing-note';
        processingNote.innerHTML = `
          <strong>⏱️ Processing Time Note:</strong><br>
          • Documents: Usually 10-30 seconds<br>
          • Audio files: 1-2 minutes per minute of audio<br>
          • Larger files may take longer - progress is tracked in real-time
        `;
        analysisSection.appendChild(processingNote);
        
        // Upload files first
        const uploadResult = await this.api.uploadFiles(uploadedFiles);
        sessionId = uploadResult.session_id;
        
        // Update file status
        const fileItems = document.querySelectorAll('.file-item .file-status');
        fileItems.forEach(item => {
          item.textContent = '✅ Uploaded';
          item.style.color = 'green';
        });
        
        // Start analysis
        await this.api.startAnalysis(sessionId);
        
        // Poll for progress
        await this.api.pollAnalysis(sessionId, (progress) => {
          updateProgress(progress);
        });
        
      } catch (error) {
        console.error('Analysis failed:', error);
        alert('Analysis failed: ' + error.message);
        
        // Reset analysis section
        document.getElementById('analysis-section').style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🔍 Analyze Files';
      }
    });

    const updateProgress = (progress) => {
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');
      const analysisResults = document.getElementById('analysis-results');
      
      // Update progress bar
      progressFill.style.width = `${progress.progress}%`;
      progressText.textContent = progress.message;
      
      // Update file status
      if (progress.results) {
        updateFileResults(progress.results);
      }
      
      if (progress.status === 'completed') {
        analysisComplete = true;
        
        // Show results
        displayAnalysisResults(progress);
        
        // Enable course creation
        createCourseBtn.style.display = 'block';
        createCourseBtn.disabled = false;
        createCourseBtn.textContent = '🚀 Create Course';
        
        // Auto-fill title
        if (progress.generated_title) {
          courseTitleInput.value = progress.generated_title;
        }
        
        // Reset analyze button
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🔍 Re-analyze Files';
        
      } else if (progress.status === 'error') {
        throw new Error(progress.error || 'Analysis failed');
      }
    };

    function updateFileResults(results) {
      const fileItems = document.querySelectorAll('.file-item');
      
      results.forEach((result, index) => {
        if (fileItems[index]) {
          const statusElement = fileItems[index].querySelector('.file-status');
          const statusText = result.status === 'error' ? '❌ Error' : '🔄 Processing';
          statusElement.textContent = statusText;
          statusElement.style.color = result.status === 'error' ? 'red' : 'orange';
        }
      });
    }

    const uiManager = this; // Store reference to the UI manager instance

    // Make displayAnalysisResults accessible globally for debugging
    window.displayAnalysisResults = (progress) => {
      uiManager.displayAnalysisResults(progress, sessionId, analysisComplete);
    };

    // Form submission
    document.getElementById('course-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (currentMethod === 'upload' && !analysisComplete) {
        alert('Please complete file analysis before creating the course');
        return;
      }
      
      const submitButton = e.target.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Creating Course...';
      submitButton.disabled = true;
      
      try {
        // Get the correct form elements based on the method
        let title, notes;
        
        if (currentMethod === 'upload') {
          // For upload method, use the manual course title, extracted content, and notes
          const manualTitleInput = document.getElementById('manual-course-title');
          const courseNotesInput = document.getElementById('course-notes');
          const contentDisplay = document.getElementById('content-display');
          
          if (!manualTitleInput || !manualTitleInput.value.trim()) {
            alert('Please enter a course title in the course generation section');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
          }
          
          if (!contentDisplay || !contentDisplay.value.trim()) {
            alert('No content available for course generation. Please ensure files have been analyzed.');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
          }
          
          title = manualTitleInput.value.trim();
          notes = courseNotesInput ? courseNotesInput.value.trim() : '';
          const extractedContent = contentDisplay.value.trim();
          const apiUrl = import.meta.env.VITE_API_URL || 'https://skoolmebackend-695368262076.europe-west1.run.app'
          
          // For upload method, use the backend API to generate course structure
          try {
            const response = await fetch('${apiUrl}/api/generate-course', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                session_id: sessionId,
                course_title: title,
                extracted_content: extractedContent,
                additional_notes: notes
              })
            });
            
            const result = await response.json();
            
            if (result.success) {
              // Display the course structure
              this.displayCourseStructure(result.course_structure);
              
              // Create course object for the AI manager
              const courseData = {
                title: title,
                school: document.getElementById('school-input') ? document.getElementById('school-input').value : '',
                notes: notes,
                method: currentMethod,
                sessionId: sessionId,
                files: uploadedFiles.map(f => f.name),
                course_structure: result.course_structure
              };
              
              // Get AI manager instance
              const aiManager = this.aiManager || window.aiManager;
              if (!aiManager) {
                throw new Error('AI Manager not available');
              }
              
              // Generate course content with AI using the course structure
              const generatedCourse = await aiManager.generateCourseContent(courseData);
              
              // Clean up session if files were uploaded
              if (sessionId) {
                this.api.cleanupSession(sessionId)
                  .catch(err => console.warn('Cleanup failed:', err));
              }
              
              // Dispatch event with generated course
              document.dispatchEvent(new CustomEvent('course-created', {
                detail: generatedCourse
              }));
              
              return; // Exit early since we handled the upload method
            } else {
              throw new Error(result.error || 'Course generation failed');
            }
          } catch (error) {
            console.error('Course generation error:', error);
            alert('Failed to generate course: ' + error.message);
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        return;
      }
        } else {
          // For title-only method, use the main form inputs
          const titleInput = document.getElementById('course-title-input');
          const notesInput = document.getElementById('course-notes');
          
          console.log('Title-only method - checking form elements:');
          console.log('Title input:', titleInput);
          console.log('Notes input:', notesInput);
          console.log('Title value:', titleInput ? titleInput.value : 'null');
          
          if (!titleInput || !titleInput.value.trim()) {
            alert('Please enter a course title');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
          }
          
          title = titleInput.value.trim();
          notes = notesInput ? notesInput.value.trim() : '';
          
          console.log('Form data - Title:', title, 'Notes:', notes);
        }
        
        const courseData = {
          title: title,
          school: document.getElementById('school-input') ? document.getElementById('school-input').value : '',
          notes: notes,
          method: currentMethod,
          sessionId: sessionId,
          files: uploadedFiles.map(f => f.name)
        };
        
        // Get AI manager instance
        const aiManager = this.aiManager || window.aiManager;
        console.log('AI Manager check:', aiManager);
        console.log('this.aiManager:', this.aiManager);
        console.log('window.aiManager:', window.aiManager);
        
        if (!aiManager) {
          throw new Error('AI Manager not available');
        }
        
        // Generate course content with AI
        const generatedCourse = await aiManager.generateCourseContent(courseData);
        
        // Clean up session if files were uploaded
        if (sessionId) {
          this.api.cleanupSession(sessionId)
            .catch(err => console.warn('Cleanup failed:', err));
        }
        
        // Dispatch event with generated course
        document.dispatchEvent(new CustomEvent('course-created', {
          detail: generatedCourse
        }));
        
      } catch (error) {
        console.error('Error creating course:', error);
        alert('Failed to create course: ' + error.message);
        
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }
    });
  }

  showCourseInterface(course, aiManager) {
    this.app.innerHTML = `
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <div class="main-content">
        <div class="course-interface fade-in">
          <div class="course-sidebar" id="course-sidebar">
            <div class="course-progress">
              <h3 class="progress-title">📊 Progress</h3>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${course.progress || 0}%"></div>
              </div>
              <p class="progress-text">${Math.round(course.progress || 0)}% completed</p>
            </div>
            <div class="lesson-timeline">
              <h3 class="progress-title">📋 Course Timeline</h3>
              <ul class="lesson-list">
                ${(course.lessons || []).map((lesson, index) => `
                  <li class="lesson-item ${index === 0 ? 'active' : ''}" data-lesson-id="${lesson.id}">
                    <span class="lesson-icon">${this.getLessonIcon(lesson)}</span>
                    <span>${lesson.title}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            <div class="sidebar-actions" style="margin-top: 2rem;">
              <button class="btn btn-secondary" id="new-course-btn" style="width: 100%;">
                ➕ Create New Course
              </button>
            </div>
          </div>
          <div class="course-main">
            <div class="chat-header">
              <h2 class="chat-title">${course.outline?.title || course.title || 'Untitled Course'}</h2>
              <div class="chat-actions">
                <button class="btn btn-icon" id="download-course-btn">📥</button>
              </div>
            </div>
            <div class="chat-container">
              <div class="chat-messages" id="chat-messages">
                </div>
              <div class="chat-input-container">
                <form class="chat-input-form" id="chat-form">
                  <textarea class="chat-input" placeholder="Ask a question to proceed..." rows="1"></textarea>
                  <button type="submit" class="btn btn-primary">Send</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    document.getElementById('hamburger-menu').style.display = 'flex';
    document.querySelector('.header-content').classList.remove('no-hamburger');


    // Add chat container styles
    const chatStyles = document.createElement('style')
    chatStyles.id = 'chat-styles'
    chatStyles.textContent = `
      .chat-container {
        height: calc(100vh - 200px);
        max-height: 80vh;
        display: flex;
        flex-direction: column;
      }
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        max-height: calc(100vh - 300px);
      }
      .chat-input-container {
        flex-shrink: 0;
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
        background: var(--secondary-white);
      }
      body.dark .chat-input-container {
        border-top-color: #374151;
        background: #1f2937;
      }
      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        background: var(--secondary-white);
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      body.dark .chat-header {
        border-bottom-color: #374151;
        background: #1f2937;
      }
      .chat-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--primary-purple);
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .chat-actions {
        flex-shrink: 0;
        margin-left: auto;
      }
      
      /* Mobile Responsive Styles */
      @media (max-width: 768px) {
        .course-main {
          flex: 1;
          width: 100%;
        }
        .chat-header {
          flex-direction: row;
          align-items: center;
        }
        .chat-title {
          font-size: 1.1rem;
        }
        .chat-actions {
          margin-left: 0;
        }
        .chat-container {
          height: calc(100vh - 200px);
        }
        .chat-messages {
          max-height: calc(100vh - 300px);
        }
        .chat-input-form {
          flex-direction: row;
        }
        .chat-input {
          min-height: 40px;
        }
      }
      
      @media (max-width: 480px) {
        .chat-header {
          padding: 0.75rem;
        }
        .chat-title {
          font-size: 1rem;
        }
        .chat-messages {
          padding: 0.75rem;
        }
        .chat-input-container {
          padding: 0.75rem;
        }
      }
    `
    document.head.appendChild(chatStyles)

    // Initialize AI chat session
    this.initializeChatSession(course, aiManager)

    // Add event listeners
    document.getElementById('new-course-btn').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('start-new-course'))
    })

    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        this.toggleSidebar();
    });

    // Download course functionality
    document.getElementById('download-course-btn').addEventListener('click', () => {
      this.downloadCourse(course)
    })

    // Auto-resize textarea
    const textarea = document.querySelector('.chat-input')
    textarea.addEventListener('input', function() {
      this.style.height = 'auto'
      this.style.height = this.scrollHeight + 'px'
    })

    // Handle Enter key to send message
    textarea.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        document.getElementById('chat-form').dispatchEvent(new Event('submit'))
      }
    })

    // Chat form submission
    document.getElementById('chat-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const message = textarea.value.trim()
      if (message) {
        this.addMessage('user', message, course, aiManager)
        textarea.value = ''
        textarea.style.height = 'auto'
      }
    })
  }

  getLessonIcon(lesson) {
    if (lesson.completed) return '✅'
    if (lesson.type === 'test') return '🧪'
    if (lesson.type === 'exam') return '📝'
    return '📖'
  }

  async initializeChatSession(course, aiManager) {
    if (aiManager) {
      await aiManager.startChatSession(course)
      
      const courseTitle = course.outline?.title || course.title || 'your course'
      
      const welcomeMessage = `Welcome to your personalized course on "${courseTitle}"! 🎉
      
I've analyzed your materials and created a structured learning path. Let's start with the fundamentals and build your understanding step by step.

Are you ready to begin your first lesson?`
      
      this.addMessageToUI('ai', this.formatAIResponse(welcomeMessage))
    }
  }

  async addMessage(type, content, course, aiManager) {
    this.addMessageToUI(type, content)
    
    if (type === 'user' && aiManager) {
      this.showTypingIndicator()
      try {
        const response = await aiManager.generateResponse(content, course)
        this.hideTypingIndicator()
        const formattedContent = this.formatAIResponse(response.content)
        this.addMessageToUI('ai', formattedContent)
        // Scroll to the first AI message in the latest reply (icon at the top)
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
          // Find all AI messages
          const aiMessages = messagesContainer.querySelectorAll('.message.ai');
          if (aiMessages.length > 0) {
            aiMessages[0].scrollIntoView({ block: 'start', behavior: 'auto' });
            messagesContainer.scrollTop = aiMessages[0].offsetTop;
          } else {
            messagesContainer.scrollTop = 0;
          }
        }

        if (response.progressUpdate) {
          this.updateLessonStatus(response.progressUpdate.lessonCompleted)
          this.updateProgressBar(response.progressUpdate.newProgress)
        }

        // Await video suggestions if extractVideoSuggestions is async
        if (response.suggestedVideos) {
          let videos = response.suggestedVideos;
          if (typeof videos.then === 'function') {
            videos = await videos;
          }
          if (videos && videos.length > 0) {
            this.showVideoSuggestions(videos);
          }
        }

        if (response.followUpQuestions && response.followUpQuestions.length > 0) {
          this.showFollowUpQuestions(response.followUpQuestions)
        }

        if (response.needsSubspace) {
          this.suggestSubspace(content, course)
        }
      } catch (error) {
        this.hideTypingIndicator()
        this.addMessageToUI('ai', "I apologize, but I'm having trouble processing your question right now. Could you please try again?")
      }
    }
  }

  updateLessonStatus(lessonIndex) {
    const lessonItems = document.querySelectorAll('.lesson-item')
    if (lessonItems[lessonIndex]) {
      const lessonIcon = lessonItems[lessonIndex].querySelector('.lesson-icon')
      if (lessonIcon) {
        lessonIcon.textContent = '✅'
      }
      lessonItems[lessonIndex].classList.add('completed')
    }
    
    if (lessonItems[lessonIndex + 1]) {
      lessonItems.forEach(item => item.classList.remove('active'))
      lessonItems[lessonIndex + 1].classList.add('active')
    }
  }

  updateProgressBar(newProgress) {
    const progressFill = document.querySelector('.progress-fill')
    const progressText = document.querySelector('.progress-text')
    
    if (progressFill) {
      progressFill.style.width = `${newProgress}%`
    }
    if (progressText) {
      progressText.textContent = `${newProgress}% completed`
    }
  }

  addMessageToUI(type, content) {
    const messagesContainer = document.getElementById('chat-messages')
    const messageDiv = document.createElement('div')
    messageDiv.className = `message ${type} slide-up`
    
    const avatar = type === 'ai' ? '🤖' : '👤'
    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">${content}</div>
    `
    
    messagesContainer.appendChild(messageDiv)
    // If the message is from AI, scroll to the top so user sees the start of the response
    if (type === 'ai') {
      messagesContainer.scrollTop = 0;
    } else {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages')
    const typingDiv = document.createElement('div')
    typingDiv.className = 'message ai typing-indicator'
    typingDiv.id = 'typing-indicator'
    typingDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `
    
    messagesContainer.appendChild(typingDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    
    if (!document.getElementById('typing-styles')) {
      const style = document.createElement('style')
      style.id = 'typing-styles'
      style.textContent = `
        .typing-dots {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .typing-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary-purple);
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `
      document.head.appendChild(style)
    }
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator')
    if (typingIndicator) {
      typingIndicator.remove()
    }
  }

  showVideoSuggestions(videos) {
    const messagesContainer = document.getElementById('chat-messages');
    const videoDiv = document.createElement('div');
    videoDiv.className = 'message ai slide-up';
    videoDiv.innerHTML = `
      <div class="message-avatar">🎥</div>
      <div class="message-content">
        <strong>Suggested Videos:</strong><br>
        ${videos.map((video, idx) => `
          <div class="suggested-video-box" style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(139, 92, 246, 0.1); border-radius: 8px; display: flex; align-items: center; gap: 1rem;">
            <img src="${video.thumbnail}" alt="${video.title}" style="width: 120px; height: 68px; border-radius: 6px; object-fit: cover; cursor: pointer;" data-vidx="${idx}">
            <div style="flex:1;">
              <div style="font-weight: bold;">${video.title}</div>
              <div style="font-size: 0.9em; color: #666;">Duration: ${video.duration}</div>
              <button class="expand-video-btn" data-vidx="${idx}" style="margin-top: 0.5rem; padding: 0.3rem 0.8rem; border-radius: 4px; border: none; background: #8b5cf6; color: #fff; cursor: pointer;">Play</button>
            </div>
          </div>
          <div class="expandable-video-player" id="expandable-video-${idx}" style="display:none; margin: 0.5rem 0 1rem 0;">
            <iframe width="100%" height="315" src="https://www.youtube.com/embed/${video.videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </div>
        `).join('')}
      </div>
    `;
    messagesContainer.appendChild(videoDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add expand/collapse logic for video player
    videoDiv.querySelectorAll('.expand-video-btn, img[data-vidx]').forEach(el => {
      el.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-vidx');
        const player = videoDiv.querySelector(`#expandable-video-${idx}`);
        if (player.style.display === 'none') {
          player.style.display = 'block';
          e.target.textContent = 'Hide';
        } else {
          player.style.display = 'none';
          e.target.textContent = 'Play';
        }
      });
    });
  }

  showFollowUpQuestions(questions) {
    const messagesContainer = document.getElementById('chat-messages')
    const questionsDiv = document.createElement('div')
    questionsDiv.className = 'message ai slide-up'
    questionsDiv.innerHTML = `
      <div class="message-avatar">❓</div>
      <div class="message-content">
        <strong>Quick Questions:</strong><br>
        ${questions.map((question, index) => `
          <button class="btn btn-secondary follow-up-btn" style="margin: 0.25rem; padding: 0.5rem 1rem; font-size: 0.875rem;" data-question="${question}">
            ${question}
          </button>
        `).join('')}
      </div>
    `
    
    messagesContainer.appendChild(questionsDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    
    questionsDiv.querySelectorAll('.follow-up-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.dataset.question
        document.querySelector('.chat-input').value = question
        document.getElementById('chat-form').dispatchEvent(new Event('submit'))
      })
    })
  }

  suggestSubspace(question, course) {
    const messagesContainer = document.getElementById('chat-messages')
    const subspaceDiv = document.createElement('div')
    subspaceDiv.className = 'message ai slide-up'
    subspaceDiv.innerHTML = `
      <div class="message-avatar">🔍</div>
      <div class="message-content">
        This seems like a complex topic that deserves focused attention. Would you like me to create a dedicated discussion space for this question?
        <br><br>
        <button class="btn btn-primary" id="create-subspace-btn" style="margin-top: 0.5rem;">
          🚀 Create Focused Discussion
        </button>
      </div>
    `
    
    messagesContainer.appendChild(subspaceDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    
    document.getElementById('create-subspace-btn').addEventListener('click', () => {
      this.createSubspace(question, course)
    })
  }

  createSubspace(question, course) {
    // Create subspace overlay
    const subspaceOverlay = document.createElement('div')
    subspaceOverlay.className = 'subspace-overlay'
    subspaceOverlay.id = 'subspace-overlay'
    
    subspaceOverlay.innerHTML = `
      <div class="subspace-container">
        <div class="subspace-header">
          <div class="subspace-title">
            <span class="subspace-icon">🔍</span>
            Focused Discussion
          </div>
          <div class="subspace-controls">
            <button class="btn btn-secondary" id="close-subspace-btn">✕ Close</button>
          </div>
        </div>
        
        <div class="subspace-topic">
          <div class="topic-label">Discussing:</div>
          <div class="topic-text">${question}</div>
        </div>
        
        <div class="subspace-chat">
          <div class="subspace-messages" id="subspace-messages">
            <div class="message ai">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                Let's dive deeper into this topic. I'm here to help you understand it completely. What specific part would you like me to explain first?
              </div>
            </div>
          </div>
          
          <div class="subspace-input-container">
            <form class="subspace-input-form" id="subspace-input-form">
              <input 
                type="text" 
                class="subspace-input" 
                id="subspace-input"
                placeholder="Ask your question here..."
                autocomplete="off"
              >
              <button type="submit" class="btn btn-primary">Send</button>
            </form>
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(subspaceOverlay)
    
    // Initialize subspace functionality
    this.initializeSubspace(question, course)
    
    // Animate in
    setTimeout(() => {
      subspaceOverlay.classList.add('active')
    }, 10)
  }

  initializeSubspace(question, course) {
    const subspaceInput = document.getElementById('subspace-input')
    const subspaceForm = document.getElementById('subspace-input-form')
    const closeBtn = document.getElementById('close-subspace-btn')
    const messagesContainer = document.getElementById('subspace-messages')
    
    // Store subspace context
    this.subspaceContext = {
      active: true,
      topic: question,
      course: course,
      messages: []
    }
    
    // Handle form submission
    subspaceForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      const message = subspaceInput.value.trim()
      if (!message) return
      
      // Add user message
      this.addSubspaceMessage('user', message)
      subspaceInput.value = ''
      
      // Store message in context
      this.subspaceContext.messages.push({ type: 'user', content: message })
      
      // Show typing indicator
      this.showSubspaceTypingIndicator()
      
      try {
        // Generate AI response
        const context = {
          inSubspace: true,
          topic: question,
          course: course,
          subspaceHistory: this.subspaceContext.messages
        }
        
        const response = await this.aiManager.generateResponse(message, context)
        
        // Hide typing indicator
        this.hideSubspaceTypingIndicator()
        
        // Add AI response
        this.addSubspaceMessage('ai', response.content)
        this.subspaceContext.messages.push({ type: 'ai', content: response.content })
        
        // Check if should close subspace
        if (response.closeSubspace) {
          this.showReturnToMainChat()
        }
        
      } catch (error) {
        this.hideSubspaceTypingIndicator()
        this.addSubspaceMessage('ai', 'I apologize, but I\'m having trouble responding right now. Please try again.')
      }
    })
    
    // Handle close button
    closeBtn.addEventListener('click', () => {
      this.closeSubspace()
    })
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.subspaceContext?.active) {
        this.closeSubspace()
      }
    })
    
    // Focus input
    subspaceInput.focus()
  }

  addSubspaceMessage(type, content) {
    const messagesContainer = document.getElementById('subspace-messages')
    const messageDiv = document.createElement('div')
    messageDiv.className = `message ${type} slide-up`
    
    const avatar = type === 'ai' ? '🤖' : '👤'
    
    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">${this.formatAIResponse(content)}</div>
    `
    
    messagesContainer.appendChild(messageDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  showSubspaceTypingIndicator() {
    const messagesContainer = document.getElementById('subspace-messages')
    const typingDiv = document.createElement('div')
    typingDiv.className = 'message ai typing-indicator'
    typingDiv.id = 'subspace-typing-indicator'
    typingDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `
    
    messagesContainer.appendChild(typingDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  hideSubspaceTypingIndicator() {
    const typingIndicator = document.getElementById('subspace-typing-indicator')
    if (typingIndicator) {
      typingIndicator.remove()
    }
  }

  showReturnToMainChat() {
    const messagesContainer = document.getElementById('subspace-messages')
    const returnDiv = document.createElement('div')
    returnDiv.className = 'message ai slide-up'
    returnDiv.innerHTML = `
      <div class="message-avatar">🎯</div>
      <div class="message-content">
        Great! It looks like you understand the concept now. Would you like to return to the main chat to continue with your course?
        <br><br>
        <button class="btn btn-primary" id="return-to-main-btn" style="margin-top: 0.5rem;">
          ↩️ Return to Main Chat
        </button>
      </div>
    `
    
    messagesContainer.appendChild(returnDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    
    document.getElementById('return-to-main-btn').addEventListener('click', () => {
      this.returnToMainChat()
    })
  }

  returnToMainChat() {
    // Add summary message to main chat
    const summaryMessage = `We had a great focused discussion about "${this.subspaceContext.topic}". Now let's continue with your course!`
    
    // Close subspace
    this.closeSubspace()
    
    // Add continuation message to main chat
    setTimeout(() => {
      this.addMessageToUI('ai', summaryMessage)
    }, 300)
  }

  closeSubspace() {
    const subspaceOverlay = document.getElementById('subspace-overlay')
    if (subspaceOverlay) {
      subspaceOverlay.classList.remove('active')
      setTimeout(() => {
        subspaceOverlay.remove()
        this.subspaceContext = null
      }, 300)
    }
  }

  showAboutModal() {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.innerHTML = `
      <div class="modal" style="max-width: 600px;">
        <div class="modal-header">
          <h2>About SkoolMe! 🎓</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 1rem;">
            SkoolMe! is an AI-powered learning platform that transforms your study materials into interactive, personalized courses.
          </p>
          <h3 style="color: var(--primary-purple); margin: 1.5rem 0 1rem;">✨ Features:</h3>
          <ul style="margin-left: 1.5rem; margin-bottom: 1.5rem;">
            <li>Upload audio recordings, notes, or documents</li>
            <li>AI creates structured course timelines</li>
            <li>Interactive chat-based learning</li>
            <li>Progress tracking and assessments</li>
            <li>Subspace discussions for complex topics</li>
            <li>Download courses as PDF or DOCX</li>
          </ul>
          <p style="color: #64748B; font-size: 0.875rem;">
            Powered by Google Gemini AI for intelligent, personalized learning experiences.
          </p>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove()
    })

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove()
      }
    })
  }

  downloadCourse(course) {
    const courseTitle = course.outline?.title || course.title || 'Untitled Course';
    const children = [
        new Paragraph({
            text: courseTitle,
            heading: HeadingLevel.TITLE,
            alignment: 'center',
        }),
        new Paragraph({}), // Spacer
        new TableOfContents("Course Outline", {
            hyperlink: true,
            headingStyleRange: "2-2",
        }),
        new Paragraph({}), // Spacer
    ];

    // Note: A true grouping of chat messages per topic is complex without changing the data model.
    // This implementation will list the lessons and then show the full conversation.
    (course.lessons || []).forEach(lesson => {
        children.push(
            new Paragraph({
                text: lesson.title,
                heading: HeadingLevel.HEADING_2,
                style: "MySpectacularStyle",
            })
        );
        if(lesson.content) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: "Content: ", bold: true }),
                        new TextRun(lesson.content),
                    ],
                })
            );
        }
        if(lesson.objectives && lesson.objectives.length > 0) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: "Learning Objectives:", bold: true }),
                    ],
                })
            );
            lesson.objectives.forEach(obj => children.push(new Paragraph({ text: obj, bullet: { level: 0 } })));
        }
         if(lesson.keyTerms && lesson.keyTerms.length > 0) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: "Key Terms:", bold: true }),
                    ],
                })
            );
            lesson.keyTerms.forEach(term => children.push(new Paragraph({ text: term, bullet: { level: 0 } })));
        }
        children.push(new Paragraph({})); // Spacer
    });

    children.push(
        new Paragraph({
            text: "Learning Conversation",
            heading: HeadingLevel.HEADING_1,
        })
    );
    
    const chatMessages = document.querySelectorAll('.message');
    chatMessages.forEach(message => {
        const type = message.classList.contains('ai') ? 'AI Tutor' : 'Student';
        const content = message.querySelector('.message-content').innerText;
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: `${type}: `, bold: true }),
                    new TextRun(content),
                ],
            })
        );
        children.push(new Paragraph({})); // Spacer
    });


    const doc = new Document({
        styles: {
            paragraphStyles: [{
                id: "MySpectacularStyle",
                name: "My Spectacular Style",
                basedOn: "Heading2",
                next: "Heading2",
                quickFormat: true,
                run: {
                    color: "990000",
                },
            }, ],
        },
        sections: [{
            children: children
        }],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_course.docx`);
        this.showDownloadSuccess(courseTitle);
    });
  }

  showDownloadSuccess(courseTitle) {
    const notification = document.createElement('div')
    notification.className = 'download-notification'
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">📥</span>
        <span class="notification-text">Course "${courseTitle}" downloaded successfully!</span>
      </div>
    `
    
    const style = document.createElement('style')
    style.textContent = `
      .download-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-purple);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
      }
      .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .notification-icon {
        font-size: 1.2rem;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @media (max-width: 480px) {
        .download-notification {
          top: 10px;
          right: 10px;
          left: 10px;
          padding: 0.75rem 1rem;
        }
        .notification-text {
          font-size: 0.875rem;
        }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
      style.remove()
    }, 3000)
  }

  formatAIResponse(content) {
    let formatted = content
      .replace(/\*\*\*+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{2,}/g, '')
      .replace(/_{2,}/g, '')
      .replace(/~{2,}/g, '')
      .replace(/^([A-Z][^.!?]*:)/gm, '<strong style="font-size: 1.1em; color: var(--primary-purple);">$1</strong>')
      .replace(/^\d+\.\s+(.+)/gm, '<strong>$1</strong>')
      .replace(/^[-•]\s+(.+)/gm, '<strong>• $1</strong>')
      .replace(/^(.+\?)/gm, '<strong style="color: var(--primary-purple);">$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
    
    return formatted
  }

  setupCourseGeneration(sessionId) {
    const generateBtn = document.getElementById('generate-course-btn');
    const titleInput = document.getElementById('manual-course-title');
    const notesInput = document.getElementById('course-notes');
    const contentDisplay = document.getElementById('content-display');
    
    // Check if elements exist
    if (!generateBtn) {
      console.error('Generate course button not found');
      return;
    }
    
    if (!titleInput) {
      console.error('Manual course title input not found');
      return;
    }
    
    if (!contentDisplay) {
      console.error('Content display not found');
      return;
    }
    
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoader = generateBtn.querySelector('.btn-loader');
    
    generateBtn.onclick = async () => {
      const title = titleInput.value.trim();
      const notes = notesInput ? notesInput.value.trim() : '';
      const extractedContent = contentDisplay.value.trim();
      const apiUrl = import.meta.env.VITE_API_URL || 'https://skoolmebackend-695368262076.europe-west1.run.app'

      
      if (!title) {
        alert('Please enter a course title');
        return;
      }
      
      if (!extractedContent) {
        alert('No content available for course generation. Please ensure files have been analyzed.');
        return;
      }
      
      // Show loading state
      if (btnText) btnText.style.display = 'none';
      if (btnLoader) btnLoader.style.display = 'inline-block';
      generateBtn.disabled = true;
      
      try {
        const response = await fetch('${apiUrl}/api/generate-course', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            course_title: title,
            extracted_content: extractedContent,
            additional_notes: notes
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          this.displayCourseStructure(result.course_structure);
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Course generation error:', error);
        alert('Failed to generate course. Please try again.');
      } finally {
        // Reset button state
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
        generateBtn.disabled = false;
      }
    };
  }
  
  displayCourseStructure(structure) {
    const courseStructureSection = document.getElementById('course-structure-section');
    const courseStructureDisplay = document.getElementById('course-structure-display');
    
    // Check if elements exist
    if (!courseStructureSection) {
      console.error('Course structure section not found');
      return;
    }
    
    if (!courseStructureDisplay) {
      console.error('Course structure display not found');
      return;
    }
    
    courseStructureDisplay.innerHTML = `
      <div class="course-structure-container">
        <div class="course-header">
          <h4 class="course-title">${structure.title}</h4>
          <div class="course-meta">
            <span class="course-duration">⏱️ ${structure.estimated_duration}</span>
            <span class="course-difficulty">📊 ${structure.difficulty_level}</span>
          </div>
        </div>
        
        <div class="course-overview">
          <h5>Course Overview</h5>
          <p>${structure.overview}</p>
        </div>
        
        <div class="learning-objectives">
          <h5>Learning Objectives</h5>
          <ul>
            ${structure.learning_objectives.map(obj => `<li>${obj}</li>`).join('')}
          </ul>
        </div>
        
        <div class="course-modules">
          <h5>Course Modules</h5>
          <div class="modules-grid">
            ${structure.modules.map(module => `
              <div class="module-card">
                <div class="module-header">
                  <h6>${module.title}</h6>
                  <span class="module-time">${module.estimated_time}</span>
                </div>
                <p class="module-description">${module.description}</p>
                <div class="module-topics">
                  <strong>Topics:</strong>
                  <ul>
                    ${module.topics.map(topic => `<li>${topic}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="key-topics">
          <h5>Key Topics Covered</h5>
          <div class="topics-tags">
            ${structure.key_topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
          </div>
        </div>
        
        <div class="course-actions">
          <button class="btn btn-primary" onclick="window.print()">
            📄 Print Course Structure
          </button>
          <button class="btn btn-secondary" onclick="copyToClipboard()">
            📋 Copy to Clipboard
          </button>
        </div>
      </div>
    `;
    
    courseStructureSection.style.display = 'block';
    courseStructureSection.scrollIntoView({ behavior: 'smooth' });
  }

  displayAnalysisResults(progress, sessionId, analysisComplete) {
    console.log('displayAnalysisResults called with:', progress);
    
    const analysisResults = document.getElementById('analysis-results');
    const overallScore = document.getElementById('overall-score');
    const fileResults = document.getElementById('file-results');
    const contentDisplaySection = document.getElementById('content-display-section');
    const contentDisplay = document.getElementById('content-display');
    const courseGenerationSection = document.getElementById('course-generation-section');
    
    console.log('DOM elements found:', {
      analysisResults: !!analysisResults,
      overallScore: !!overallScore,
      fileResults: !!fileResults,
      contentDisplaySection: !!contentDisplaySection,
      contentDisplay: !!contentDisplay,
      courseGenerationSection: !!courseGenerationSection
    });
    
    // Check if elements exist before trying to access them
    if (!analysisResults) {
      console.error('Analysis results element not found');
      return;
    }
    
    // Show overall score
    if (overallScore) {
      const scoreColor = SkoolMeAPI.getStatusColor(progress.overall_score);
      const scoreText = SkoolMeAPI.getStatusText(progress.overall_score);
      
      overallScore.innerHTML = `
        <div class="score-item" style="color: ${scoreColor};">
          <span class="score-value">${progress.overall_score.toFixed(1)}%</span>
          <span class="score-label">${scoreText} Analysis</span>
        </div>
      `;
    }
    
    // Show extracted content if available
    if (progress.all_content && progress.all_content.trim()) {
      console.log('Content found, length:', progress.all_content.length);
      if (contentDisplay) {
        contentDisplay.value = progress.all_content;
      }
      if (contentDisplaySection) {
        contentDisplaySection.style.display = 'block !important';
        contentDisplaySection.style.visibility = 'visible !important';
        contentDisplaySection.style.opacity = '1 !important';
        contentDisplaySection.classList.remove('hidden');
        contentDisplaySection.classList.add('visible');
      }
    } else {
      console.log('No content found, showing fallback message');
      // If no content was extracted, show a message
      if (contentDisplay) {
        contentDisplay.value = "No text content was extracted from the uploaded files. You can still create a course by providing a title and additional notes below.";
      }
      if (contentDisplaySection) {
        contentDisplaySection.style.display = 'block !important';
        contentDisplaySection.style.visibility = 'visible !important';
        contentDisplaySection.style.opacity = '1 !important';
        contentDisplaySection.classList.remove('hidden');
        contentDisplaySection.classList.add('visible');
      }
    }
    
    // Show course title section after analysis
    const courseTitleSection = document.getElementById('course-title-section');
    if (courseTitleSection) {
      console.log('Showing course title section');
      courseTitleSection.style.display = 'block !important';
      courseTitleSection.style.visibility = 'visible !important';
      courseTitleSection.style.opacity = '1 !important';
      courseTitleSection.classList.remove('hidden');
      courseTitleSection.classList.add('visible');
    } else {
      console.error('Course title section not found!');
    }
    
    // Always show course generation section after analysis
    if (courseGenerationSection) {
      console.log('Showing course generation section');
      courseGenerationSection.style.display = 'block !important';
      courseGenerationSection.style.visibility = 'visible !important';
      courseGenerationSection.style.opacity = '1 !important';
      courseGenerationSection.classList.remove('hidden');
      courseGenerationSection.classList.add('visible');
      
      // Set up course generation button
      this.setupCourseGeneration(progress.session_id || sessionId);
      
      // Also set up the main form submission for the upload method
      const createCourseBtn = document.getElementById('create-course-btn');
      if (createCourseBtn) {
        createCourseBtn.style.display = 'inline-block !important';
        createCourseBtn.disabled = false;
        createCourseBtn.textContent = '🚀 Create Course from Analysis';
      }
    } else {
      console.error('Course generation section not found!');
    }
    
    // Show file results
    if (fileResults && progress.results) {
      fileResults.innerHTML = progress.results.map(result => {
        const statusColor = SkoolMeAPI.getStatusColor(result.score);
        const statusText = SkoolMeAPI.getStatusText(result.score);
        
        return `
          <div class="file-result">
            <div class="file-result-header">
              <span class="file-name">${result.filename}</span>
              <span class="file-score" style="color: ${statusColor};">
                ${result.score.toFixed(1)}% - ${statusText}
              </span>
            </div>
            ${result.error ? `<div class="file-error">Error: ${result.error}</div>` : ''}
          </div>
        `;
      }).join('');
    }
    
    // Update final file status
    const fileItems = document.querySelectorAll('.file-item');
    if (progress.results) {
      progress.results.forEach((result, index) => {
        if (fileItems[index]) {
          const statusElement = fileItems[index].querySelector('.file-status');
          if (statusElement) {
            const statusColor = SkoolMeAPI.getStatusColor(result.score);
            const statusText = result.score >= 80 ? '✅ Good' : 
                              result.score >= 30 ? '⚠️ Partial' : '❌ Poor';
            
            statusElement.textContent = statusText;
            statusElement.style.color = statusColor;
          }
        }
      });
    }
    
    // Force show analysis results with !important
    analysisResults.style.display = 'block !important';
    analysisResults.style.visibility = 'visible !important';
    analysisResults.style.opacity = '1 !important';
    analysisResults.classList.remove('hidden');
    analysisResults.classList.add('visible');
    
    // Scroll to the course generation section
    if (courseGenerationSection) {
      setTimeout(() => {
        courseGenerationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
    
    console.log('displayAnalysisResults completed');
    
    // Add a final check to ensure elements are visible
    setTimeout(() => {
      console.log('Final visibility check:');
      console.log('contentDisplaySection visible:', contentDisplaySection ? window.getComputedStyle(contentDisplaySection).display : 'element not found');
      console.log('courseGenerationSection visible:', courseGenerationSection ? window.getComputedStyle(courseGenerationSection).display : 'element not found');
    }, 1000);
  }

  clearPreviousAnalysis() {
    try {
      // Clear analysis results
      const analysisResults = document.getElementById('analysis-results');
      if (analysisResults) {
        analysisResults.innerHTML = '';
      }
      
      // Reset course structure section
      const courseStructureSection = document.getElementById('course-structure-section');
      if (courseStructureSection) {
        courseStructureSection.style.display = 'none';
      }
      
      // Reset course structure display
      const courseStructureDisplay = document.getElementById('course-structure-display');
      if (courseStructureDisplay) {
        courseStructureDisplay.innerHTML = '';
      }
      
      // Reset progress bar
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');
      if (progressFill) {
        progressFill.style.width = '0%';
      }
      if (progressText) {
        progressText.textContent = 'Starting analysis...';
      }
      
      // Reset course title inputs
      const courseTitleInput = document.getElementById('course-title-input');
      const manualCourseTitleInput = document.getElementById('manual-course-title');
      if (courseTitleInput) {
        courseTitleInput.value = '';
      }
      if (manualCourseTitleInput) {
        manualCourseTitleInput.value = '';
      }
      
      // Reset course notes
      const courseNotesInput = document.getElementById('course-notes');
      if (courseNotesInput) {
        courseNotesInput.value = '';
      }
      
      // Reset create course button
      const createCourseBtn = document.getElementById('create-course-btn');
      if (createCourseBtn) {
        createCourseBtn.style.display = 'none';
        createCourseBtn.disabled = true;
      }
      
      // Reset analysis complete flag - use window scope to avoid reference errors
      // Since analysisComplete is a local variable, we'll let it be reset in the method scope
      
      // Remove processing note if it exists
      const processingNote = document.querySelector('.processing-note');
      if (processingNote) {
        processingNote.remove();
      }
      
      // Clear any error messages
      const errorMessages = document.querySelectorAll('.error-message, .alert-error');
      errorMessages.forEach(msg => {
        if (msg) msg.remove();
      });
      
    } catch (error) {
      console.log('Error clearing previous analysis:', error);
      // Don't throw the error to prevent breaking the analysis flow
    }
  }
}
