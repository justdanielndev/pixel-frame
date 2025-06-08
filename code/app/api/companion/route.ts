import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'
import { getDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const db = getCompanionDatabase()
    const settings = db.getCompanionSettings()
    const environment = db.getEnvironmentSettings()
    const recentSleep = db.getRecentSleepRecords(7)
    const tasks = db.getAllTasks()
    const notes = db.getAllNotes()
    const studyStreak = db.getStudyStreak()
    
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const studySessions = db.getStudySessionsForDateRange(
      weekAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    )
    
    const recentScreenTime = db.getRecentScreenTimeRecords(7)
    
    const totalStudyTime = studySessions.reduce((sum, session) => sum + session.duration_minutes, 0)
    const averageProductivity = studySessions.length > 0 
      ? studySessions.reduce((sum, session) => sum + session.productivity_rating, 0) / studySessions.length 
      : 0
    
    const completedTasks = tasks.filter(task => task.completed).length
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
    
    let daysToFinals = 0
    let finalsMessage = "Finals date not set"
    
    if (settings.finals_start_date) {
      const finalsDate = new Date(settings.finals_start_date)
      daysToFinals = Math.ceil((finalsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      finalsMessage = daysToFinals > 0 ? `Finals start in ${daysToFinals} days` : 
                     daysToFinals === 0 ? "Finals start today!" : 
                     "Finals have passed"
    }
    
    const nextAppointment = await getNextAppointment(db)
    
    const dashboardData = {
      datetime: new Date().toLocaleString('en-US', {
        weekday: 'long',
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
        month: 'long',
        day: 'numeric',
        timeZoneName: 'short'
      }),
      weather: await getWeatherData(),
      indoor_conditions: environment ? 
        `Indoor ${environment.home_temperature}°C with ${environment.air_quality} air quality, humidity ${environment.home_humidity}%` :
        'Indoor conditions not set',
      days_to_finals: finalsMessage,
      bedtime_patterns: formatSleepPatterns(recentSleep),
      study_performance: `This week: ${Math.round(totalStudyTime / 60)} hours total study time. Overall ${Math.round(averageProductivity * 20)}% productive sessions`,
      focus_sessions: formatFocusSessions(studySessions),
      task_completion: formatTaskCompletion(tasks, taskCompletionRate),
      screen_time: formatScreenTime(recentScreenTime),
      reading_activity: await getReadingActivitySummary(),
      books: await getBookActivity(),
      tv: await getTvActivity(db),
      next_appointment: nextAppointment,
      mood_indicators: generateMoodIndicators(averageProductivity, recentSleep, taskCompletionRate),
      study_streak: `Study streak: ${studyStreak} days consecutively (goal: reach ${settings.study_streak_goal} days until finals)`,
      active_projects: await getActiveProjects(db),
      home_status: environment ? 
        `Blinds ${environment.blinds_position}% closed, lights dimmed to ${environment.lights_brightness}%, reading system ready` :
        'Home status not set',
      history: 'None',
      notes,
      settings,
      raw_data: {
        sleep_records: recentSleep,
        study_sessions: studySessions,
        tasks,
        environment,
        study_streak: studyStreak,
        task_completion_rate: taskCompletionRate,
        screen_time_records: recentScreenTime,
        projects: db.getAllProjects(),
        appointments: db.getAllAppointments()
      }
    }
    
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching companion data:', error)
    return NextResponse.json({ error: 'Failed to fetch companion data' }, { status: 500 })
  }
}

async function getNextAppointment(db: any) {
  const upcomingAppointments = db.getUpcomingAppointments(7)
  if (upcomingAppointments.length === 0) {
    return "No upcoming appointments"
  }
  
  const next = upcomingAppointments[0]
  const date = new Date(next.date)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const timeStr = diffDays === 0 ? 'today' : diffDays === 1 ? 'tomorrow' : `in ${diffDays} days`
  return `Next: ${next.title} ${date.toLocaleDateString()} at ${next.start_time} (${timeStr})`
}

async function getWeatherData(location: string = 'Valencia,ES'): Promise<string> {
  try {
    const meteosourceApiKey = process.env.METEOSOURCE_API_KEY
    if (meteosourceApiKey) {
      console.log('🌤️ Trying Meteosource API for weather data')
      
      const placeId = location.toLowerCase().includes('valencia') ? 'valencia' : location.split(',')[0].toLowerCase()
      
      const currentResponse = await fetch(
        `https://www.meteosource.com/api/v1/free/point?place_id=${placeId}&sections=current&timezone=UTC&language=en&units=metric&key=${meteosourceApiKey}`
      )
      
      if (currentResponse.ok) {
        const currentData = await currentResponse.json()
        
        if (currentData.current) {
          const temp = Math.round(currentData.current.temperature)
          const summary = currentData.current.summary || 'Clear'
          
          return `Currently ${summary.toLowerCase()}, ${temp}°C`
        }
      }
    }
  } catch (meteosourceError) {
    console.log('🌤️ Meteosource failed, falling back to OpenWeatherMap:', meteosourceError)
  }

  try {
    console.log('🌤️ Using OpenWeatherMap as fallback')
    const apiKey = process.env.OPENWEATHER_API_KEY || ""
    if (!apiKey) {
      throw new Error('No weather API keys configured')
    }
    
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`)
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`)
    }
    const data = await response.json()
    
    if (!data.weather?.[0] || !data.main) {
      throw new Error('Invalid weather data format')
    }
    
    return `Currently ${data.weather[0].description}, ${Math.round(data.main.temp)}°C`
  } catch (error) {
    console.error('All weather APIs failed:', error)
    return `Weather for ${location} unavailable`
  }
}

async function getReadingActivitySummary() {
  try {
    const bookDb = getDatabase()
    const userStats = bookDb.getUserStats()
    
    if (!userStats || userStats.total_books_read === 0) {
      return "No reading activity recorded yet"
    }
    
    const readingTimeHours = Math.round(userStats.total_reading_time_minutes / 60 * 10) / 10
    return `Reading activity: ${userStats.total_books_read} books completed, ${userStats.total_pages_read} pages read, ${readingTimeHours}h total reading time, ${userStats.average_wpm} WPM average`
  } catch (error) {
    console.error('Error getting reading activity summary:', error)
    return "Error loading reading activity"
  }
}

async function getBookActivity() {
  try {
    const bookDb = getDatabase()
    const allBooks = bookDb.getAllBooks()
    
    const currentBooks = allBooks.filter(book => 
      book.current_page < book.page_count && 
      book.last_read && 
      new Date(book.last_read).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    )
    
    if (currentBooks.length === 0) {
      return "No books currently being read"
    }
    
    const currentBooksStr = currentBooks.map(book => 
      `${book.title} by ${book.author} (${Math.round((book.current_page / book.page_count) * 100)}% complete)`
    ).join(', ')
    
    return currentBooksStr
  } catch (error) {
    console.error('Error getting book activity:', error)
    return "Error loading current books"
  }
}

async function getTvActivity(db: any) {
  try {
    const currentlyWatching = db.getCurrentlyWatching()
    
    if (currentlyWatching.length === 0) {
      return "No TV shows currently being watched"
    }
    
    const watchingStr = currentlyWatching.map(show => {
      let progress = show.title
      if (show.current_episode && show.total_episodes) {
        progress += ` (${show.current_episode}/${show.total_episodes} episodes)`
      } else if (show.current_season) {
        progress += ` (Season ${show.current_season})`
      }
      return progress
    }).join(', ')
    
    return `Currently watching: ${watchingStr}`
  } catch (error) {
    console.error('Error getting TV activity:', error)
    return "Error loading TV activity"
  }
}

async function getActiveProjects(db: any) {
  const activeProjects = db.getActiveProjects()
  if (activeProjects.length === 0) {
    return "No active projects"
  }
  
  const projectList = activeProjects.slice(0, 3).map(project => 
    `${project.name} (${project.status.replace('_', ' ')})`
  ).join(', ')
  
  return `Active projects: ${projectList}`
}

function formatSleepPatterns(sleepRecords: any[]) {
  if (sleepRecords.length === 0) return "No sleep data recorded"
  
  const patterns = sleepRecords.map(record => {
    const date = new Date(record.date)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    return `${dayName} ${record.bedtime}`
  }).join(', ')
  
  const avgBedtime = calculateAverageBedtime(sleepRecords)
  return `Past week bedtimes: ${patterns}. Averaging ${avgBedtime}`
}

function calculateAverageBedtime(sleepRecords: any[]) {
  if (sleepRecords.length === 0) return "No data"
  
  const totalMinutes = sleepRecords.reduce((sum, record) => {
    const [hours, minutes] = record.bedtime.split(':').map(Number)
    return sum + (hours * 60) + minutes
  }, 0)
  
  const avgMinutes = Math.round(totalMinutes / sleepRecords.length)
  const hours = Math.floor(avgMinutes / 60)
  const mins = avgMinutes % 60
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function formatFocusSessions(studySessions: any[]) {
  if (studySessions.length === 0) return "No study sessions recorded"
  
  const recentSessions = studySessions.slice(0, 4).map(session => {
    const date = new Date(session.date)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const focusLevel = session.focus_rating >= 4 ? 'excellent' : session.focus_rating >= 3 ? 'good' : 'poor'
    return `${dayName} ${session.duration_minutes}min ${session.subject} (${focusLevel})`
  }).join(', ')
  
  const avgDuration = Math.round(studySessions.reduce((sum, s) => sum + s.duration_minutes, 0) / studySessions.length)
  
  return `Recent focus: ${recentSessions}. Average session ${avgDuration} minutes`
}

function formatTaskCompletion(tasks: any[], completionRate: number) {
  const completed = tasks.filter(t => t.completed).slice(0, 3)
  const pending = tasks.filter(t => !t.completed).slice(0, 2)
  
  const completedStr = completed.map(t => `${t.title} ✓`).join(', ')
  const pendingStr = pending.map(t => `${t.title}`).join(', ')
  
  return `${completedStr}${pending.length > 0 ? `, missing: ${pendingStr}` : ''}. Week completion rate ${completionRate}%`
}

function formatScreenTime(screenTimeRecords: any[]) {
  if (screenTimeRecords.length === 0) return "No screen time data recorded"
  
  const latest = screenTimeRecords[0]
  if (!latest) return "No recent screen time data"
  
  const totalHours = Math.round(latest.total_minutes / 60 * 10) / 10
  const productiveHours = Math.round(latest.productive_minutes / 60 * 10) / 10
  const socialHours = Math.round(latest.social_minutes / 60 * 10) / 10
  const entertainmentHours = Math.round(latest.entertainment_minutes / 60 * 10) / 10
  
  return `Yesterday ${totalHours}h screen time (${productiveHours}h productive, ${socialHours}h social, ${entertainmentHours}h entertainment). Weekly average being calculated...`
}

function generateMoodIndicators(productivity: number, sleepRecords: any[], taskRate: number) {
  const indicators = []
  
  if (taskRate >= 70) indicators.push("High task completion")
  if (sleepRecords.length >= 5) indicators.push("consistent sleep")
  if (productivity >= 3.5) indicators.push("productive study sessions")
  
  const mood = indicators.length >= 2 ? "good mood" : "mixed indicators"
  
  return `Mood indicators: ${indicators.join(', ')} suggest ${mood}`
}