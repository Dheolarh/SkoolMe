import { AuthManager } from './AuthManager.js'
import { UIManager } from './UIManager.js'
import { CourseManager } from './CourseManager.js'
import { AIManager } from './AIManager.js'

export class AppManager {
  constructor() {
    this.authManager = new AuthManager()
    this.aiManager = new AIManager()
    this.uiManager = new UIManager(this.aiManager)
    this.courseManager = new CourseManager()
    
    this.currentUser = null
    this.currentCourse = null
  }

  async init() {
    // Show loading screen
    this.uiManager.showLoadingScreen()
    
    // Initialize managers
    this.uiManager.init()
    
    // Initialize AI and connect to course manager
    await this.aiManager.init()
    this.courseManager.setAIManager(this.aiManager)
    
    // Set up event listeners
    this.setupEventListeners()
    
    // Hide loading screen after 2 seconds
    setTimeout(() => {
      this.uiManager.hideLoadingScreen()
      this.showDashboard()
    }, 2000)
  }

  setupEventListeners() {
    // Auth events
    document.addEventListener('user-login', (e) => {
      this.currentUser = e.detail
      this.showDashboard()
    })

    document.addEventListener('user-logout', () => {
      this.currentUser = null
      this.showWelcomeScreen()
    })

    // Course events
    document.addEventListener('course-created', (e) => {
      this.currentCourse = e.detail
      this.showCourseInterface()
    })

    document.addEventListener('start-new-course', () => {
      this.showCourseCreation()
    })

    // Theme toggle
    document.addEventListener('toggle-theme', () => {
      this.uiManager.toggleTheme()
    })
  }

  showWelcomeScreen() {
    this.uiManager.showWelcomeScreen()
  }

  showDashboard() {
    this.uiManager.showDashboard(this.currentUser)
  }

  showCourseCreation() {
    this.uiManager.showCourseCreation()
  }

  showCourseInterface() {
    this.uiManager.showCourseInterface(this.currentCourse, this.aiManager)
  }
}