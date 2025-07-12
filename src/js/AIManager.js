import { GoogleGenerativeAI } from '@google/generative-ai'

export class AIManager {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyD1Euh93DJzlZXJjYC_9t8s1PCCBT4Zt88'
    this.genAI = null
    this.model = null
    this.chatSession = null
  }

  async init() {
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      console.log('Gemini AI initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error)
      return false
    }
  }

  async generateCourseContent(courseData) {
    try {
      const prompt = this.buildCoursePrompt(courseData)
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return this.parseCourseResponse(text, courseData)
    } catch (error) {
      console.error('Error generating course content:', error)
      return this.getFallbackCourseContent(courseData)
    }
  }

  getFallbackCourseContent(courseData) {
    return {
      outline: this.generateCourseOutline(courseData),
      lessons: this.formatLessons(this.generateLessonContent(courseData)),
      assessments: this.generateAssessments(courseData)
    }
  }

  buildCoursePrompt(courseData) {
    let prompt = `Create a comprehensive course structure for "${courseData.title}"`
    
    if (courseData.school) {
      prompt += ` at ${courseData.school}`
    }
    
    if (courseData.notes) {
      prompt += `\n\nAdditional context: ${courseData.notes}`
    }
    
    if (courseData.files && courseData.files.length > 0) {
      prompt += `\n\nFiles provided: ${courseData.files.map(f => f.name).join(', ')}`
    }
    
    prompt += `

Please create a detailed course structure with:
1. Course outline with 6-8 main topics/lessons
2. Learning objectives for each lesson
3. A brief description of what will be covered
4. Estimated duration for each lesson
5. Key concepts and terminology

Format the response as JSON with this structure:
{
  "outline": {
    "title": "Course Title",
    "description": "Course description",
    "duration": "Total estimated hours",
    "difficulty": "Beginner/Intermediate/Advanced"
  },
  "lessons": [
    {
      "title": "Lesson Title",
      "description": "What this lesson covers",
      "duration": 45,
      "objectives": ["Learning objective 1", "Learning objective 2"],
      "keyTerms": ["term1", "term2"]
    }
  ]
}`
    
    return prompt
  }

  parseCourseResponse(text, courseData) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const courseStructure = JSON.parse(jsonMatch[0])
        return {
          outline: courseStructure.outline || this.generateCourseOutline(courseData),
          lessons: this.formatLessons(courseStructure.lessons || []),
          assessments: this.generateAssessments(courseData)
        }
      }
    } catch (error) {
      console.error('Error parsing course response:', error)
    }
    
    // Fallback to manual parsing
    return this.parseTextResponse(text, courseData)
  }

  parseTextResponse(text, courseData) {
    const lines = text.split('\n').filter(line => line.trim())
    const lessons = []
    
    // Extract lesson titles and descriptions
    lines.forEach(line => {
      if (line.match(/^\d+\.|^-|^\*/) && line.length > 10) {
        const title = line.replace(/^\d+\.\s*|^-\s*|^\*\s*/, '').trim()
        if (title && !title.toLowerCase().includes('test') && !title.toLowerCase().includes('exam')) {
          lessons.push({
            title: title,
            description: `Comprehensive coverage of ${title.toLowerCase()}`,
            duration: 45,
            objectives: [`Understand ${title.toLowerCase()}`, `Apply concepts practically`],
            keyTerms: []
          })
        }
      }
    })
    
    return {
      outline: this.generateCourseOutline(courseData),
      lessons: lessons.length > 0 ? this.formatLessons(lessons) : this.generateLessonContent(courseData),
      assessments: this.generateAssessments(courseData)
    }
  }

  formatLessons(lessons) {
    const formattedLessons = lessons.map((lesson, index) => ({
      id: index + 1,
      title: lesson.title,
      type: 'lesson',
      completed: index === 0,
      content: lesson.description || `Let's explore ${lesson.title} in detail...`,
      duration: lesson.duration || 45,
      objectives: lesson.objectives || [`Understand ${lesson.title}`, 'Apply concepts practically'],
      keyTerms: lesson.keyTerms || []
    }))

    // Insert mid-course test
    const midPoint = Math.ceil(formattedLessons.length / 2)
    formattedLessons.splice(midPoint, 0, {
      id: midPoint + 1,
      title: 'Mid-Course Assessment',
      type: 'test',
      completed: false,
      questions: this.generateTestQuestions(),
      timeLimit: 30
    })

    // Add final exam
    formattedLessons.push({
      id: formattedLessons.length + 1,
      title: 'Final Examination',
      type: 'exam',
      completed: false,
      questions: this.generateExamQuestions(),
      timeLimit: 60
    })

    // Update IDs after insertion
    formattedLessons.forEach((lesson, index) => {
      lesson.id = index + 1
    })

    return formattedLessons
  }

  async startChatSession(courseContext) {
    try {
      const courseTitle = courseContext.outline?.title || courseContext.title || 'the course'
      const systemPrompt = `You are an AI tutor for the course "${courseTitle}". 
      
Course Context:
- Title: ${courseTitle}
- School: ${courseContext.school || 'General Education'}
- Current Progress: ${courseContext.progress || 0}% complete

Your role:
1. Act as a knowledgeable, patient, and encouraging teacher
2. Explain concepts clearly with examples
3. Ask follow-up questions to ensure understanding
4. Suggest relevant videos when helpful
5. Create subspaces for complex topics when needed
6. Track student progress and adapt teaching style

Teaching Style:
- Be conversational and friendly
- Use analogies and real-world examples
- Break down complex concepts into simple steps
- Encourage questions and curiosity
- Provide positive reinforcement

Always respond as if you're having a one-on-one tutoring session with the student.`

      this.chatSession = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemPrompt }]
          },
          {
            role: "model",
            parts: [{ text: `Hello! I'm your AI tutor for "${courseTitle}". I'm here to guide you through this learning journey step by step. I've analyzed your course materials and created a personalized learning path just for you.

Let's start with the fundamentals and build your understanding progressively. I'm here to answer any questions you have and make sure you truly understand each concept before we move forward.

Are you ready to begin your first lesson? Or do you have any questions about the course structure?` }]
          }
        ]
      })

      return true
    } catch (error) {
      console.error('Error starting chat session:', error)
      return false
    }
  }

  async generateResponse(message, context) {
    try {
      if (!this.chatSession) {
        await this.startChatSession(context)
      }

      // Check topic completion
      const completion = this.checkTopicCompletion(message, context)
      
      // Get current lesson index
      const currentLessonIndex = context.lessons ? 
        context.lessons.findIndex(lesson => !lesson.completed) : 0
      
      let responseText = ''
      
      if (completion.isComplete && currentLessonIndex < context.lessons.length) {
        // Mark current lesson as completed and move to next
        const progressInfo = this.updateCourseProgress(context, currentLessonIndex)
        
        if (progressInfo && !progressInfo.isComplete) {
          const nextLesson = context.lessons[progressInfo.nextIndex]
          responseText = `Great job! You've completed "${context.lessons[currentLessonIndex].title}" ✅

Your progress: ${progressInfo.progress}% completed

Now let's move on to: **${nextLesson.title}**

${nextLesson.content || `Let's explore ${nextLesson.title} in detail...`}

Are you ready to dive into this new topic?`
        } else {
          responseText = `Congratulations! 🎉 You've completed the entire course!

Your final progress: ${progressInfo.progress}% completed

You've successfully mastered all the topics in this course. Well done on your learning journey!

You can now download your complete course materials for future reference.`
        }
      } else {
        // Normal AI response for current topic
        const result = await this.chatSession.sendMessage(message)
        const response = await result.response
        responseText = response.text()
      }

      return {
        content: responseText,
        suggestedVideos: this.extractVideoSuggestions(responseText),
        followUpQuestions: this.extractFollowUpQuestions(responseText),
        needsSubspace: this.detectComplexTopic(message, responseText),
        progressUpdate: completion.isComplete ? {
          lessonCompleted: currentLessonIndex,
          newProgress: context.progress
        } : null
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      return {
        content: "I apologize, but I'm having trouble processing your question right now. Could you please rephrase it or try asking something else?",
        suggestedVideos: [],
        followUpQuestions: ["Would you like me to explain this concept differently?", "Should we move on to the next topic?"],
        needsSubspace: false
      }
    }
  }

  extractVideoSuggestions(text) {
    // Look for video suggestions in the AI response
    const videoKeywords = ['video', 'watch', 'youtube', 'tutorial', 'demonstration']
    if (videoKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return [
        {
          title: "Related Tutorial Video",
          url: "#", // In real implementation, would search YouTube API
          duration: "10:30"
        }
      ]
    }
    return []
  }

  extractFollowUpQuestions(text) {
    // Extract or generate follow-up questions
    const questions = []
    
    if (text.includes('?')) {
      const questionMatches = text.match(/[^.!?]*\?/g)
      if (questionMatches) {
        questions.push(...questionMatches.slice(0, 2))
      }
    }
    
    // Add default follow-ups if none found
    if (questions.length === 0) {
      questions.push(
        "Would you like me to explain this with an example?",
        "Do you have any questions about this concept?",
        "Should we practice with some exercises?"
      )
    }
    
    return questions.slice(0, 3)
  }

  detectComplexTopic(userMessage, aiResponse) {
    const complexityIndicators = [
      'complex', 'difficult', 'confused', 'don\'t understand', 
      'explain more', 'break down', 'elaborate', 'clarify'
    ]
    
    const userText = userMessage.toLowerCase()
    const responseText = aiResponse.toLowerCase()
    
    return complexityIndicators.some(indicator => 
      userText.includes(indicator) || responseText.includes(indicator)
    ) && aiResponse.length > 200
  }

  async createSubspaceResponse(topic, question, context) {
    try {
      const courseTitle = context.outline?.title || context.title || 'the course'
      const subspacePrompt = `The student is asking about "${topic}" with this specific question: "${question}"

This is a focused discussion space for this particular concept. Please:
1. Provide a detailed, step-by-step explanation
2. Use simple language and analogies
3. Include examples if helpful
4. Ask if they need further clarification
5. Keep the explanation focused on this specific topic

Context: This is part of the course "${courseTitle}"`

      const result = await this.model.generateContent(subspacePrompt)
      const response = await result.response
      
      return {
        content: response.text(),
        topic: topic,
        resolved: false
      }
    } catch (error) {
      console.error('Error creating subspace response:', error)
      return {
        content: `Let me help you understand ${topic} better. This is a complex concept that deserves focused attention. What specifically would you like me to clarify about this topic?`,
        topic: topic,
        resolved: false
      }
    }
  }

  // Topic progression logic
  checkTopicCompletion(userMessage, courseContext) {
    // Keywords that indicate topic completion or readiness to move on
    const completionKeywords = [
      'continue', 'next', 'move on', 'proceed', 'understood', 'got it', 
      'clear', 'ready', 'next topic', 'next lesson', 'finished', 'done'
    ]
    
    const questionKeywords = [
      'what', 'how', 'why', 'explain', 'clarify', 'confused', 'dont understand', 
      'help', 'more', 'elaborate', 'example'
    ]
    
    const userText = userMessage.toLowerCase()
    
    // Check if user wants to continue
    const wantsToContinue = completionKeywords.some(keyword => 
      userText.includes(keyword)
    )
    
    // Check if user has questions (not ready to move on)
    const hasQuestions = questionKeywords.some(keyword => 
      userText.includes(keyword)
    )
    
    return {
      isComplete: wantsToContinue && !hasQuestions,
      hasQuestions: hasQuestions,
      confidence: wantsToContinue ? 0.8 : 0.3
    }
  }

  updateCourseProgress(courseContext, currentTopicIndex) {
    if (courseContext.lessons && courseContext.lessons[currentTopicIndex]) {
      // Mark current lesson as completed
      courseContext.lessons[currentTopicIndex].completed = true
      
      // Calculate overall progress
      const completedLessons = courseContext.lessons.filter(lesson => lesson.completed).length
      const totalLessons = courseContext.lessons.length
      courseContext.progress = Math.round((completedLessons / totalLessons) * 100)
      
      // Update UI progress bar
      this.updateProgressUI(courseContext.progress)
      
      return {
        currentIndex: currentTopicIndex,
        nextIndex: currentTopicIndex + 1,
        isComplete: currentTopicIndex + 1 >= totalLessons,
        progress: courseContext.progress
      }
    }
    return null
  }

  updateProgressUI(progress) {
    const progressFill = document.querySelector('.progress-fill')
    const progressText = document.querySelector('.progress-text')
    
    if (progressFill) {
      progressFill.style.width = `${progress}%`
    }
    if (progressText) {
      progressText.textContent = `${progress}% completed`
    }
  }

  // Fallback methods for when AI fails
  generateCourseOutline(courseData) {
    return {
      title: courseData.title,
      description: `A comprehensive course on ${courseData.title}`,
      duration: '4-6 hours',
      difficulty: 'Intermediate'
    }
  }

  generateLessonContent(courseData) {
    const courseTitle = courseData.title.toLowerCase()
    
    if (courseTitle.includes('physics')) {
      return [
        { title: 'Fundamental Forces and Motion', duration: 45 },
        { title: 'Energy and Work Principles', duration: 45 },
        { title: 'Waves and Oscillations', duration: 45 },
        { title: 'Thermodynamics Basics', duration: 45 }
      ]
    } else if (courseTitle.includes('math') || courseTitle.includes('calculus')) {
      return [
        { title: 'Limits and Continuity', duration: 45 },
        { title: 'Derivatives and Applications', duration: 45 },
        { title: 'Integration Techniques', duration: 45 },
        { title: 'Series and Sequences', duration: 45 }
      ]
    } else {
      return [
        { title: `Introduction to ${courseData.title}`, duration: 30 },
        { title: 'Fundamental Principles', duration: 45 },
        { title: 'Core Methodologies', duration: 45 },
        { title: 'Practical Applications', duration: 45 }
      ]
    }
  }

  generateTestQuestions() {
    return [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Which concept is most fundamental to this subject?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 0
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
      }
    ]
  }

  generateAssessments(courseData) {
    return {
      midTest: {
        questions: 10,
        timeLimit: 30,
        passingScore: 70
      },
      finalExam: {
        questions: 25,
        timeLimit: 60,
        passingScore: 80
      }
    }
  }
}