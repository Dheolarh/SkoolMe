import './style.css'
import { AppManager } from './js/AppManager.js'
import { SkoolMeAPI } from './js/SkoolMeAPI.js'

// Initialize the app
const app = new AppManager()
app.init()

// Make API available globally for debugging
window.SkoolMeAPI = SkoolMeAPI
