import { GoogleGenerativeAI } from '@google/generative-ai'

export class AIManager {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyD1Euh93DJzlZXJjYC_9t8s1PCCBT4Zt88'
    this.genAI = null
    this.model = null
    this.chatSession = null
    this.lastSubspaceSuggestion = 0 // Timestamp of last subspace suggestion
    this.subspaceCooldown = 60000 // 1 minute cooldown between suggestions
    this.isInitialized = false
    this.lastError = null
  }

  async init() {
    try {
      console.log('Initializing Gemini AI with API key:', this.apiKey ? 'Available' : 'Missing')
      
      if (!this.apiKey) {
        throw new Error('API key is missing. Please set VITE_GOOGLE_API_KEY environment variable.')
      }
      
      if (!this.apiKey.startsWith('AIza')) {
        throw new Error('Invalid API key format. API key should start with "AIza"')
      }
      
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      // Test the connection with a simple request
      const testResult = await this.model.generateContent("Test")
      await testResult.response
      
      this.isInitialized = true
      this.lastError = null
      console.log('Gemini AI initialized successfully')
      return true
    } catch (error) {
      this.lastError = error
      console.error('Failed to initialize Gemini AI:', error)
      
      if (error.message.includes('API key')) {
        console.error('API key issue detected. Please check your Google AI API key.')
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        console.error('API quota exceeded. Please check your Google AI usage limits.')
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        console.error('Network error. Please check your internet connection.')
      }
      
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

      if (context.inSubspace) {
        // Handle subspace conversation
        const subspacePrompt = `This is a focused discussion about "${context.topic}". 
The student just said: "${message}"

Previous conversation in this subspace:
${context.subspaceHistory ? context.subspaceHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n') : ''}

Please provide a detailed, helpful response that addresses their question about this specific topic. 
Be thorough and use examples where appropriate. If the student seems to understand and says things like 
"I get it", "okay I understand", "thanks that makes sense", then suggest returning to the main chat.

Student message: ${message}`

        if (this.shouldCloseSubspace(message)) {
          return {
            content: "Perfect! It looks like you've got a good grasp of this concept now. Let's return to the main course where we can continue with the next topics!",
            closeSubspace: true,
          };
        }
        
        const result = await this.chatSession.sendMessage(subspacePrompt);
        const response = await result.response;
        const responseText = response.text();
        
        // Check if AI suggests closing based on understanding
        if (this.detectUnderstanding(message, responseText)) {
          return {
            content: responseText,
            closeSubspace: true,
          };
        }
        
        return {
          content: responseText,
        };
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
      this.lastError = error
      
      let errorMessage = "I apologize, but I'm having trouble processing your question right now."
      
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        errorMessage = "There's an issue with the AI service authentication. Please check the API configuration."
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = "The AI service has reached its usage limit. Please try again later."
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "There's a network connection issue. Please check your internet connection and try again."
      } else if (error.message.includes('timeout')) {
        errorMessage = "The AI service is taking too long to respond. Please try again."
      }
      
      return {
        content: errorMessage + " Could you please rephrase it or try asking something else?",
        suggestedVideos: [],
        followUpQuestions: ["Would you like me to explain this concept differently?", "Should we move on to the next topic?", "Try asking a simpler question"],
        needsSubspace: false
      }
    }
  }

  async extractVideoSuggestions(text) {

    // Use YouTube Data API to fetch real videos based on the chat context (user + AI response + lesson/topic)
    const videoKeywords = ['video', 'watch', 'youtube', 'tutorial', 'demonstration', 'explain', 'lesson'];
    if (!videoKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return [];
    }

    // Try to get the last user message from the chat container for better context
    let userMessage = '';
    try {
      const chatMessages = document.querySelectorAll('.message.user .message-content');
      if (chatMessages.length > 0) {
        userMessage = chatMessages[chatMessages.length - 1].innerText || '';
      }
    } catch (e) {}

    // Try to get the current lesson/topic title if available
    let lessonTitle = '';
    try {
      const lessonHeader = document.querySelector('.lesson-title, .chat-title');
      if (lessonHeader) {
        lessonTitle = lessonHeader.innerText || '';
      }
    } catch (e) {}

    // Prefer a query that is most likely to yield an educational video
    let query = '';
    if (userMessage && userMessage.length > 10 && /video|tutorial|explain|lesson|how to|show/i.test(userMessage)) {
      query = userMessage + ' tutorial';
    } else if (lessonTitle && lessonTitle.length > 5) {
      query = lessonTitle + ' tutorial';
    } else {
      query = text + ' tutorial';
    }
    // Limit to 12 words for search
    query = query.split(/\s+/).slice(0, 12).join(' ');

    // Use VITE_YOUTUBE_API_KEY for YouTube API requests, fallback to VITE_GOOGLE_API_KEY
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || window.VITE_YOUTUBE_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || window.VITE_GOOGLE_API_KEY;
    if (!apiKey) return [];

    try {
      // Search for up to 5 videos for better filtering
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${apiKey}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      if (!searchData.items || searchData.items.length === 0) return [];

      // Get video IDs for details
      const videoIds = searchData.items.map(item => item.id.videoId).filter(Boolean).join(',');
      if (!videoIds) return [];
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();
      if (!detailsData.items || detailsData.items.length === 0) return [];

      // Parse ISO 8601 duration to readable format
      function parseDuration(iso) {
        const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const h = match[1] ? match[1] + ':' : '';
        const m = match[2] ? (match[1] ? match[2].padStart(2, '0') : match[2]) : '00';
        const s = match[3] ? match[3].padStart(2, '0') : '00';
        return h + m + ':' + s;
      }

      // Filter out Shorts and prefer videos longer than 60 seconds
      const filtered = detailsData.items.filter(item => {
        const iso = item.contentDetails.duration;
        const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const seconds = (parseInt(match[1]||0)*3600) + (parseInt(match[2]||0)*60) + (parseInt(match[3]||0));
        return seconds >= 60;
      });
      if (filtered.length === 0) return [];
      const details = filtered[0];
      const videoId = details.id;

      return [{
        title: details.snippet.title,
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        duration: parseDuration(details.contentDetails.duration),
        thumbnail: details.snippet.thumbnails.medium.url
      }];
    } catch (e) {
      return [];
    }
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
    // Check cooldown - don't suggest subspace if one was suggested recently
    const now = Date.now();
    if (now - this.lastSubspaceSuggestion < this.subspaceCooldown) {
      return false;
    }

    const confusionIndicators = [
      'i don\'t understand', 'don\'t understand', 'confused', 'confusing',
      'what do you mean', 'can you explain', 'explain more', 'i\'m lost',
      'makes no sense', 'doesn\'t make sense', 'clarify', 'break it down',
      'elaborate', 'what does that mean', 'i need help', 'struggling with',
      'hard to follow', 'difficult to understand', 'this is hard',
      'i\'m confused about', 'not clear', 'unclear'
    ]
    
    const questionIndicators = [
      'how does', 'why does', 'what happens when', 'what if',
      'can you show me', 'give me an example', 'walk me through',
      'how do i', 'what\'s the difference', 'compared to'
    ]
    
    const userText = userMessage.toLowerCase()
    
    // Check for direct confusion indicators (highest priority)
    const hasConfusion = confusionIndicators.some(indicator => 
      userText.includes(indicator)
    )
    
    // Check for complex questions (medium priority)
    const hasComplexQuestion = questionIndicators.some(indicator => 
      userText.includes(indicator)
    ) && userText.length > 25 // Longer questions are more likely to be complex
    
    // Check AI response length as indicator of complexity (low priority)
    const aiResponseIsLong = aiResponse.length > 400
    
    // Only suggest subspace for genuine confusion or very complex topics
    const shouldSuggest = hasConfusion || (hasComplexQuestion && aiResponseIsLong)
    
    if (shouldSuggest) {
      this.lastSubspaceSuggestion = now;
    }
    
    return shouldSuggest;
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

  shouldCloseSubspace(userMessage) {
    const closeKeywords = [
      'okay i understand now',
      'i get it now',
      'got it',
      'i understand',
      'makes sense now',
      'that makes sense',
      'thanks that helps',
      'thank you',
      'that clears it up',
      'close',
      'exit',
      'back to main chat',
      'return to main chat'
    ];
    const userText = userMessage.toLowerCase();
    return closeKeywords.some(keyword => userText.includes(keyword));
  }

  detectUnderstanding(userMessage, aiResponse) {
    const understandingIndicators = [
      'understand',
      'makes sense',
      'clear now',
      'got it',
      'i see',
      'that helps',
      'thanks',
      'perfect'
    ];
    
    const userText = userMessage.toLowerCase();
    const aiText = aiResponse.toLowerCase();
    
    // Check if user shows understanding
    const userUnderstands = understandingIndicators.some(indicator => 
      userText.includes(indicator)
    );
    
    // Check if AI detects understanding and suggests moving back
    const aiSuggestsReturn = aiText.includes('return to main') || 
                            aiText.includes('back to main') ||
                            aiText.includes('continue with');
    
    return userUnderstands || aiSuggestsReturn;
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