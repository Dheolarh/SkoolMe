export class AuthManager {
  constructor() {
    this.currentUser = null
  }

  async init() {
    // Check for existing session
    const savedUser = localStorage.getItem('skoolme-user')
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser)
    }
  }

  async login(email, password) {
    // Simulate login process
    const user = {
      id: Date.now(),
      email: email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString()
    }

    this.currentUser = user
    localStorage.setItem('skoolme-user', JSON.stringify(user))
    
    return user
  }

  async logout() {
    this.currentUser = null
    localStorage.removeItem('skoolme-user')
    localStorage.removeItem('gemini-api-key')
  }

  getCurrentUser() {
    return this.currentUser
  }

  isAuthenticated() {
    return this.currentUser !== null
  }

  getApiKey() {
    return localStorage.getItem('gemini-api-key')
  }

  setApiKey(apiKey) {
    localStorage.setItem('gemini-api-key', apiKey)
  }
}