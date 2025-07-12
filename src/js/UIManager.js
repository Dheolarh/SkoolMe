export class UIManager {
  constructor(aiManager = null) {
    this.app = document.getElementById('app')
    this.isDarkMode = localStorage.getItem('darkMode') === 'true'
    this.aiManager = aiManager
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
          <div class="header-logo">🎓 SkoolMe!</div>
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
              <form id="course-form">
                <div class="form-group">
                  <label class="form-label">Course Title</label>
                  <input type="text" class="form-input" placeholder="e.g., Introduction to Physics" required>
                </div>
                <div class="form-group">
                  <label class="form-label">School/Institution (Optional)</label>
                  <input type="text" class="form-input" placeholder="e.g., MIT, Harvard University">
                </div>
                <div class="form-group">
                  <label class="form-label">Additional Notes (Optional)</label>
                  <textarea class="form-input form-textarea" placeholder="Any specific topics or areas you want to focus on..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">
                  🚀 Create Course with AI
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `

    // File upload handling
    const fileUpload = document.getElementById('file-upload')
    const fileInput = document.getElementById('file-input')

    fileUpload.addEventListener('click', () => {
      fileInput.click()
    })

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files)
      if (files.length > 0) {
        fileUpload.innerHTML = `
          <div class="file-upload-icon">✅</div>
          <p><strong>${files.length} file(s) selected</strong></p>
          <p style="font-size: 0.875rem; color: #64748B;">
            ${files.map(f => f.name).join(', ')}
          </p>
        `
      }
    })

    document.getElementById('course-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const submitButton = e.target.querySelector('button[type="submit"]')
      const originalText = submitButton.textContent
      submitButton.textContent = 'Generating Course...'
      submitButton.disabled = true
      
      try {
        const courseData = {
          title: e.target.querySelector('input[placeholder*="Introduction"]').value,
          school: e.target.querySelector('input[placeholder*="MIT"]').value,
          files: Array.from(fileInput.files),
          notes: e.target.querySelector('textarea').value
        }
        
        // Get AI manager instance - we need to pass it or access it
        const aiManager = this.aiManager || window.aiManager
        if (!aiManager) {
          throw new Error('AI Manager not available')
        }
        
        // Generate course content with AI
        const generatedCourse = await aiManager.generateCourseContent(courseData)
        
        // Dispatch event with generated course
        document.dispatchEvent(new CustomEvent('course-created', {
          detail: generatedCourse
        }))
        
      } catch (error) {
        console.error('Error generating course:', error)
        
        // Get courseData for fallback
        const courseData = {
          title: e.target.querySelector('input[placeholder*="Introduction"]').value,
          school: e.target.querySelector('input[placeholder*="MIT"]').value,
          files: Array.from(fileInput.files),
          notes: e.target.querySelector('textarea').value
        }
        
        // Fallback course structure
        const fallbackCourse = {
          outline: {
            title: courseData.title,
            description: `A comprehensive course on ${courseData.title}`,
            duration: '4-6 hours',
            difficulty: 'Intermediate'
          },
          lessons: [
            {
              id: 1,
              title: `Introduction to ${courseData.title}`,
              type: 'lesson',
              completed: true,
              content: `Welcome to ${courseData.title}! Let's begin your learning journey.`,
              duration: 30,
              objectives: [`Understand the basics of ${courseData.title}`, 'Get familiar with course structure'],
              keyTerms: []
            },
            {
              id: 2,
              title: 'Core Concepts',
              type: 'lesson',
              completed: false,
              content: 'We\'ll explore the fundamental concepts and principles.',
              duration: 45,
              objectives: ['Master core concepts', 'Apply fundamental principles'],
              keyTerms: []
            },
            {
              id: 3,
              title: 'Mid-Course Assessment',
              type: 'test',
              completed: false,
              questions: [
                {
                  id: 1,
                  type: 'multiple-choice',
                  question: 'What is the main focus of this course?',
                  options: ['Theory', 'Practice', 'Both', 'Neither'],
                  correct: 2
                }
              ],
              timeLimit: 30
            },
            {
              id: 4,
              title: 'Advanced Topics',
              type: 'lesson',
              completed: false,
              content: 'Dive deeper into advanced concepts and applications.',
              duration: 45,
              objectives: ['Understand advanced concepts', 'Apply knowledge practically'],
              keyTerms: []
            },
            {
              id: 5,
              title: 'Final Examination',
              type: 'exam',
              completed: false,
              questions: [
                {
                  id: 1,
                  type: 'essay',
                  question: 'Explain the key concepts covered in this course.',
                  points: 25
                }
              ],
              timeLimit: 60
            }
          ],
          assessments: {
            midTest: { questions: 5, timeLimit: 30, passingScore: 70 },
            finalExam: { questions: 10, timeLimit: 60, passingScore: 80 }
          }
        }
        
        document.dispatchEvent(new CustomEvent('course-created', {
          detail: fallbackCourse
        }))
      } finally {
        submitButton.textContent = originalText
        submitButton.disabled = false
      }
    })
  }

  showCourseInterface(course, aiManager) {
    this.app.innerHTML = `
      <div class="main-content">
        <div class="course-interface fade-in">
          <div class="course-sidebar">
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
                <button class="btn btn-secondary" id="download-course-btn">📥 Download Course</button>
              </div>
            </div>
            <div class="chat-container">
              <div class="chat-messages" id="chat-messages">
                <!-- Messages will be loaded here -->
              </div>
              <div class="chat-input-container">
                <form class="chat-input-form" id="chat-form">
                  <textarea class="chat-input" placeholder="Ask a question or type 'continue' to proceed..." rows="1"></textarea>
                  <button type="submit" class="btn btn-primary">Send</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

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
        .course-interface {
          flex-direction: column;
        }
        .course-sidebar {
          width: 100%;
          max-height: 200px;
          overflow-y: auto;
        }
        .course-main {
          flex: 1;
        }
        .chat-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .chat-title {
          font-size: 1.1rem;
          white-space: normal;
          overflow: visible;
          text-overflow: unset;
        }
        .chat-actions {
          margin-left: 0;
          align-self: flex-end;
        }
        .chat-container {
          height: calc(100vh - 280px);
        }
        .chat-messages {
          max-height: calc(100vh - 380px);
        }
        .lesson-timeline {
          max-height: 120px;
          overflow-y: auto;
        }
        .lesson-list {
          font-size: 0.875rem;
        }
        .chat-input-form {
          flex-direction: column;
          gap: 0.5rem;
        }
        .chat-input {
          min-height: 60px;
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
        .course-sidebar {
          max-height: 150px;
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
      
      // Get the correct title
      const courseTitle = course.outline?.title || course.title || 'your course'
      
      // Add welcome message with formatting
      const welcomeMessage = `Welcome to your personalized course on "${courseTitle}"! 🎉
      
I've analyzed your materials and created a structured learning path. Let's start with the fundamentals and build your understanding step by step.

Are you ready to begin your first lesson?`
      
      this.addMessageToUI('ai', this.formatAIResponse(welcomeMessage))
    }
  }

  async addMessage(type, content, course, aiManager) {
    this.addMessageToUI(type, content)
    
    if (type === 'user' && aiManager) {
      // Show typing indicator
      this.showTypingIndicator()
      
      try {
        const response = await aiManager.generateResponse(content, course)
        this.hideTypingIndicator()
        
        // Format the AI response
        const formattedContent = this.formatAIResponse(response.content)
        this.addMessageToUI('ai', formattedContent)
        
        // Handle progress updates
        if (response.progressUpdate) {
          this.updateLessonStatus(response.progressUpdate.lessonCompleted)
          this.updateProgressBar(response.progressUpdate.newProgress)
        }
        
        // Handle video suggestions
        if (response.suggestedVideos && response.suggestedVideos.length > 0) {
          this.showVideoSuggestions(response.suggestedVideos)
        }
        
        // Handle follow-up questions
        if (response.followUpQuestions && response.followUpQuestions.length > 0) {
          this.showFollowUpQuestions(response.followUpQuestions)
        }
        
        // Handle subspace creation if needed
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
    
    // Update active lesson to next one
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
    messagesContainer.scrollTop = messagesContainer.scrollHeight
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
    
    // Add typing animation styles
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
    const messagesContainer = document.getElementById('chat-messages')
    const videoDiv = document.createElement('div')
    videoDiv.className = 'message ai slide-up'
    videoDiv.innerHTML = `
      <div class="message-avatar">🎥</div>
      <div class="message-content">
        <strong>Suggested Videos:</strong><br>
        ${videos.map(video => `
          <div style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
            📺 <strong>${video.title}</strong><br>
            <small>Duration: ${video.duration}</small>
          </div>
        `).join('')}
      </div>
    `
    
    messagesContainer.appendChild(videoDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
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
    
    // Add click handlers for follow-up questions
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
    // This would create a new subspace interface
    alert(`Subspace created for: "${question}"\n\nThis feature will open a focused discussion area for complex topics.`)
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
    // Collect all chat messages
    const chatMessages = document.querySelectorAll('.message')
    let conversationText = ''
    
    chatMessages.forEach(message => {
      const type = message.classList.contains('ai') ? 'AI Tutor' : 'Student'
      const content = message.querySelector('.message-content').textContent
      conversationText += `${type}: ${content}\n\n`
    })
    
    // Create course document content
    const courseTitle = course.outline?.title || course.title || 'Untitled Course'
    const courseContent = `
# ${courseTitle}

## Course Overview
- **Description:** ${course.outline?.description || 'AI-generated course'}
- **Duration:** ${course.outline?.duration || 'Variable'}
- **Difficulty:** ${course.outline?.difficulty || 'Intermediate'}
- **Progress:** ${Math.round(course.progress || 0)}% completed

## Course Timeline

${(course.lessons || []).map((lesson, index) => `
### ${index + 1}. ${lesson.title} ${lesson.completed ? '✅' : '📖'}
- **Type:** ${lesson.type || 'lesson'}
- **Duration:** ${lesson.duration || 45} minutes
- **Status:** ${lesson.completed ? 'Completed' : 'Not Started'}

${lesson.objectives ? `**Learning Objectives:**
${lesson.objectives.map(obj => `- ${obj}`).join('\n')}` : ''}

${lesson.content ? `**Content:**
${lesson.content}` : ''}

${lesson.keyTerms && lesson.keyTerms.length > 0 ? `**Key Terms:**
${lesson.keyTerms.map(term => `- ${term}`).join('\n')}` : ''}

---
`).join('\n')}

## Learning Conversation

${conversationText}

## Course Summary
This course was generated and personalized by SkoolMe AI. All interactions and learning materials have been captured for your offline study.

Generated on: ${new Date().toLocaleDateString()}
`

    // Create and download the file
    const blob = new Blob([courseContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_course.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    // Show success message
    this.showDownloadSuccess(courseTitle)
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
    
    // Add notification styles
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
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove()
      style.remove()
    }, 3000)
  }

  formatAIResponse(content) {
    // Remove excessive symbols and format the response
    let formatted = content
      // Remove multiple asterisks
      .replace(/\*\*\*+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      // Remove other excessive symbols
      .replace(/#{2,}/g, '')
      .replace(/_{2,}/g, '')
      .replace(/~{2,}/g, '')
      // Format headers and important text
      .replace(/^([A-Z][^.!?]*:)/gm, '<strong style="font-size: 1.1em; color: var(--primary-purple);">$1</strong>')
      // Format numbered lists
      .replace(/^\d+\.\s+(.+)/gm, '<strong>$1</strong>')
      // Format bullet points
      .replace(/^[-•]\s+(.+)/gm, '<strong>• $1</strong>')
      // Format questions
      .replace(/^(.+\?)/gm, '<strong style="color: var(--primary-purple);">$1</strong>')
      // Add line breaks for better readability
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
    
    return formatted
  }
}