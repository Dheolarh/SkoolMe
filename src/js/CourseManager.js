export class CourseManager {
  constructor() {
    this.courses = []
    this.currentCourse = null
    this.aiManager = null
  }

  setAIManager(aiManager) {
    this.aiManager = aiManager
  }

  async createCourse(courseData) {
    // Generate AI course content
    let aiContent = null
    if (this.aiManager) {
      try {
        aiContent = await this.aiManager.generateCourseContent(courseData)
      } catch (error) {
        console.error('AI course generation failed, using fallback:', error)
      }
    }

    const course = {
      id: Date.now(),
      title: courseData.title,
      school: courseData.school,
      files: courseData.files,
      notes: courseData.notes,
      createdAt: new Date().toISOString(),
      progress: 0,
      lessons: aiContent ? aiContent.lessons : this.generateLessons(courseData),
      outline: aiContent ? aiContent.outline : this.generateCourseOutline(courseData),
      conversations: [],
      subspaces: []
    }

    this.courses.push(course)
    this.currentCourse = course
    this.saveCourses()
    
    return course
  }

  generateCourseOutline(courseData) {
    return {
      title: courseData.title,
      description: `A comprehensive course on ${courseData.title}`,
      duration: '4-6 hours',
      difficulty: 'Intermediate'
    }
  }

  generateLessons(courseData) {
    // Generate a basic lesson structure based on course data
    const topics = this.generateTopicsFromCourse(courseData)
    const lessons = [
      ...topics.map((topic, index) => ({
        id: index + 1,
        title: topic,
        type: 'lesson',
        completed: index === 0, // First lesson completed by default
        content: `Let's explore ${topic} in detail...`
      })),
      {
        id: topics.length + 1,
        title: 'Mid-Course Assessment',
        type: 'test',
        completed: false,
        questions: this.generateTestQuestions()
      },
      ...topics.slice(Math.ceil(topics.length / 2)).map((topic, index) => ({
        id: topics.length + 2 + index,
        title: topic,
        type: 'lesson',
        completed: false,
        content: `Advanced concepts in ${topic}...`
      })),
      {
        id: topics.length * 2 + 2,
        title: 'Final Examination',
        type: 'exam',
        completed: false,
        questions: this.generateExamQuestions(),
        timeLimit: 60 // minutes
      }
    ]

    return lessons
  }

  generateTopicsFromCourse(courseData) {
    // AI-generated topics based on course title and content
    const courseTitle = courseData.title.toLowerCase()
    
    if (courseTitle.includes('physics')) {
      return [
        'Fundamental Forces and Motion',
        'Energy and Work Principles',
        'Waves and Oscillations',
        'Thermodynamics Basics',
        'Electromagnetic Fields',
        'Quantum Mechanics Introduction'
      ]
    } else if (courseTitle.includes('math') || courseTitle.includes('calculus')) {
      return [
        'Limits and Continuity',
        'Derivatives and Applications',
        'Integration Techniques',
        'Series and Sequences',
        'Multivariable Calculus',
        'Differential Equations'
      ]
    } else if (courseTitle.includes('chemistry')) {
      return [
        'Atomic Structure and Bonding',
        'Chemical Reactions and Stoichiometry',
        'Thermochemistry',
        'Chemical Equilibrium',
        'Acids and Bases',
        'Organic Chemistry Basics'
      ]
    } else if (courseTitle.includes('biology')) {
      return [
        'Cell Structure and Function',
        'Genetics and Heredity',
        'Evolution and Natural Selection',
        'Ecology and Ecosystems',
        'Human Anatomy and Physiology',
        'Molecular Biology'
      ]
    } else if (courseTitle.includes('history')) {
      return [
        'Historical Context and Timeline',
        'Key Figures and Events',
        'Social and Political Changes',
        'Economic Developments',
        'Cultural Transformations',
        'Legacy and Modern Impact'
      ]
    } else if (courseTitle.includes('computer') || courseTitle.includes('programming')) {
      return [
        'Programming Fundamentals',
        'Data Structures and Algorithms',
        'Object-Oriented Programming',
        'Database Management',
        'Web Development Basics',
        'Software Engineering Principles'
      ]
    } else {
      // Generic topics for any subject
      return [
        `Introduction to ${courseData.title}`,
        'Fundamental Principles',
        'Core Methodologies',
        'Practical Applications',
        'Advanced Concepts',
        'Real-World Case Studies'
      ]
    }
  }
  generateTestQuestions() {
    return [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Which of the following best describes the main concept?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 0
      },
      {
        id: 2,
        type: 'fill-in-blank',
        question: 'The primary principle is ______.',
        answer: 'fundamental'
      }
    ]
  }

  generateExamQuestions() {
    return [
      {
        id: 1,
        type: 'essay',
        question: 'Explain the key concepts covered in this course and their practical applications.',
        points: 25
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Advanced concept question...',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 2,
        points: 15
      }
    ]
  }

  addMessage(courseId, message) {
    const course = this.courses.find(c => c.id === courseId)
    if (course) {
      course.conversations.push({
        id: Date.now(),
        ...message,
        timestamp: new Date().toISOString()
      })
      this.saveCourses()
    }
  }

  createSubspace(courseId, topic, question) {
    const course = this.courses.find(c => c.id === courseId)
    if (course) {
      const subspace = {
        id: Date.now(),
        topic: topic,
        question: question,
        messages: [],
        createdAt: new Date().toISOString(),
        resolved: false
      }
      
      course.subspaces.push(subspace)
      this.saveCourses()
      return subspace
    }
  }

  updateProgress(courseId, lessonId) {
    const course = this.courses.find(c => c.id === courseId)
    if (course) {
      const lesson = course.lessons.find(l => l.id === lessonId)
      if (lesson) {
        lesson.completed = true
        course.progress = (course.lessons.filter(l => l.completed).length / course.lessons.length) * 100
        this.saveCourses()
      }
    }
  }

  saveCourses() {
    localStorage.setItem('skoolme-courses', JSON.stringify(this.courses))
  }

  loadCourses() {
    const saved = localStorage.getItem('skoolme-courses')
    if (saved) {
      this.courses = JSON.parse(saved)
    }
  }

  getCourses() {
    return this.courses
  }

  getCurrentCourse() {
    return this.currentCourse
  }
}