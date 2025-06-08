import { NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'
import { getDatabase } from '@/lib/database'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

function formatDateTime(): string {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin'
  }
  return now.toLocaleDateString('en-US', options)
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

          try {
            const forecastResponse = await fetch(
              `https://www.meteosource.com/api/v1/free/point?place_id=${placeId}&sections=daily&timezone=UTC&language=en&units=metric&key=${meteosourceApiKey}`
            )
            
            if (forecastResponse.ok) {
              const forecastData = await forecastResponse.json()
              if (forecastData.daily?.data?.[1]) {
                const tomorrow = forecastData.daily.data[1]
                const tomorrowHigh = Math.round(tomorrow.all_day?.temperature_max || tomorrow.temperature_max || temp)
                const tomorrowLow = Math.round(tomorrow.all_day?.temperature_min || tomorrow.temperature_min || temp)
                const tomorrowSummary = tomorrow.summary || 'Partly cloudy'
                
                return `Currently ${summary.toLowerCase()}, ${temp}°C. Tomorrow ${tomorrowSummary.toLowerCase()}, high of ${tomorrowHigh}°C, low of ${tomorrowLow}°C.`
              }
            }
          } catch (forecastError) {
            console.log('Meteosource forecast failed, using current only')
          }
          
          return `Currently ${summary.toLowerCase()}, ${temp}°C. Forecast unavailable.`
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
    
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`)
    if (!forecastResponse.ok) {
      const current = `Currently ${data.weather[0].description}, ${Math.round(data.main.temp)}°C`
      return `${current}. Forecast unavailable.`
    }
    
    const forecast = await forecastResponse.json()
    if (!forecast.list?.[8]?.weather?.[0]) {
      const current = `Currently ${data.weather[0].description}, ${Math.round(data.main.temp)}°C`
      return `${current}. Forecast unavailable.`
    }
    
    const current = `Currently ${data.weather[0].description}, ${Math.round(data.main.temp)}°C`
    const tomorrow = forecast.list[8] 
    const tomorrowDesc = `Tomorrow ${tomorrow.weather[0].description}, high of ${Math.round(tomorrow.main.temp_max)}°C, low of ${Math.round(tomorrow.main.temp_min)}°C`
    
    return `${current}. ${tomorrowDesc}.`
  } catch (error) {
    console.error('All weather APIs failed:', error)
    return `Weather for ${location} unavailable`
  }
}

function generateCompanionData(): any {
  const db = getCompanionDatabase()
  const bookDb = getDatabase()
  const settings = db.getCompanionSettings()
  const environmentSettings = db.getEnvironmentSettings()
  const recentSleep = db.getRecentSleepRecords(7)
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
  const studySessions = db.getStudySessionsForDateRange(weekAgo, today)
  const tasks = db.getAllTasks().filter(t => !t.completed)
  const upcomingAppointments = db.getUpcomingAppointments(7)
  const activeProjects = db.getActiveProjects()
  const recentScreenTime = db.getRecentScreenTimeRecords(7)
  const studyStreak = db.getStudyStreak()
  const recentGlanceHistory = db.getRecentGlanceHistory(3)
  
  const userStats = bookDb.getUserStats()
  const allBooks = bookDb.getAllBooks()
  const currentBooks = allBooks.filter(book => 
    book.current_page < book.page_count && 
    book.last_read && 
    new Date(book.last_read).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
  )
  const currentlyWatching = db.getCurrentlyWatching()

  const finalsDate = new Date(settings.finals_start_date)
  const nowGMT2 = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Berlin' })
  const daysToFinals = Math.ceil((finalsDate.getTime() - new Date(nowGMT2).getTime()) / (1000 * 60 * 60 * 24))

  const bedtimeAvg = recentSleep.length > 0 ? 
    recentSleep.map(s => s.bedtime).join(', ') : 'No recent data'

  const totalStudyHours = studySessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60
  const avgFocusSession = studySessions.length > 0 ? 
    studySessions.reduce((sum, s) => sum + s.duration_minutes, 0) / studySessions.length : 0

  const completedTasks = db.getAllTasks().filter(t => t.completed && 
    new Date(t.updated_at).getTime() > new Date(nowGMT2).getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekCompletionRate = completedTasks.length > 0 ? 
    Math.round((completedTasks.length / (completedTasks.length + tasks.length)) * 100) : 0

  const screenTimeAvg = recentScreenTime.length > 0 ?
    recentScreenTime.reduce((sum, st) => sum + st.total_minutes, 0) / recentScreenTime.length / 60 : 0

  return {
    DATETIME: formatDateTime(),
    WEATHER: '',
    INDOOR_CONDITIONS: environmentSettings ? 
      `Indoor temperature ${environmentSettings.home_temperature}°C, humidity ${environmentSettings.home_humidity}%, air quality ${environmentSettings.air_quality}` :
      'Indoor conditions not available',
    DAYS_TO_FINALS: daysToFinals > 0 ? `Finals start in ${daysToFinals} days` : 'Finals have started or passed',
    BEDTIME_PATTERNS: `Past week bedtimes: ${bedtimeAvg}. Average bedtime tracking.`,
    STUDY_PERFORMANCE: `This week: ${totalStudyHours.toFixed(1)} hours total study time. Average session ${avgFocusSession.toFixed(0)} minutes.`,
    FOCUS_SESSIONS: `Recent focus sessions averaging ${avgFocusSession.toFixed(0)} minutes. Study streak: ${studyStreak} days.`,
    TASK_COMPLETION: `${tasks.length} pending tasks. Week completion rate ${weekCompletionRate}%.`,
    SCREEN_TIME: `Daily average ${screenTimeAvg.toFixed(1)}h screen time.`,
    READING_ACTIVITY: userStats ? 
      `Total: ${userStats.total_books_read} books, ${userStats.total_pages_read} pages, ${(userStats.total_reading_time_minutes / 60).toFixed(1)}h reading time. Average speed: ${userStats.average_wpm} WPM.` :
      'No reading activity recorded',
    BOOKS: currentBooks.length > 0 ?
      `Currently reading: ${currentBooks.map(book => `${book.title} by ${book.author} (${Math.round((book.current_page / book.page_count) * 100)}% complete)`).join(', ')}` :
      'No books currently being read',
    TV: currentlyWatching.length > 0 ?
      `Currently watching: ${currentlyWatching.map(show => {
        let progress = show.title
        if (show.current_episode && show.total_episodes) {
          progress += ` (${show.current_episode}/${show.total_episodes} episodes)`
        } else if (show.current_season) {
          progress += ` (Season ${show.current_season})`
        }
        return progress
      }).join(', ')}` :
      'No TV shows currently being watched',
    NEXT_APPOINTMENT: upcomingAppointments.length > 0 ? 
      `Next: ${upcomingAppointments[0].title} ${upcomingAppointments[0].date} ${upcomingAppointments[0].start_time}` :
      'No upcoming appointments',
    MOOD_INDICATORS: 'Mood indicators derived from patterns',
    STUDY_STREAK: `Study streak: ${studyStreak} days consecutively`,
    ACTIVE_PROJECTS: activeProjects.length > 0 ?
      `Active projects: ${activeProjects.map(p => `${p.name} (${p.progress_percentage}% complete)`).join(', ')}` :
      'No active projects',
    HOME_STATUS: environmentSettings ?
      `Temperature ${environmentSettings.home_temperature}°C, lights ${environmentSettings.lights_brightness}%, blinds ${environmentSettings.blinds_position}%` :
      'Home status not available',
    HISTORY: recentGlanceHistory.length > 0 ? 
      `Recent insights: ${recentGlanceHistory.map(h => `${h.timestamp.toISOString().split('T')[0]} ${h.timestamp.toISOString().split('T')[1].split('.')[0]} - ${h.insights.replace(/\n/g, ' | ')}`).join(' // ')}` :
      'No recent glance history'
  }
}

export async function GET() {
  try {
    console.log('🔍 Generating glance insights at', new Date().toISOString())
    const companionData = generateCompanionData()
    console.log('📊 Companion data generated:', companionData)
    const companionDb = getCompanionDatabase()
    const settings = companionDb.getCompanionSettings()
    const weather = await getWeatherData(settings?.weather_location)
    companionData.WEATHER = weather
    console.log('🌤️ Weather data:', weather)

    let prompt = `You are an AI assistant for a smart home hub, generating personalized daily insights for [USER INFO (REPLACE)]. Info: your screen is updated every 15min for new at a glance info, so texts should take that into account (they'll stay visible for 15mins)

Here is the current data:

<datetime>${companionData.DATETIME}</datetime>
<weather>${companionData.WEATHER}</weather>
<indoor_conditions>${companionData.INDOOR_CONDITIONS}</indoor_conditions>
<days_to_finals>${companionData.DAYS_TO_FINALS}</days_to_finals>
<bedtime_patterns>${companionData.BEDTIME_PATTERNS}</bedtime_patterns>
<study_performance>${companionData.STUDY_PERFORMANCE}</study_performance>
<focus_sessions>${companionData.FOCUS_SESSIONS}</focus_sessions>
<task_completion>${companionData.TASK_COMPLETION}</task_completion>
<screen_time>${companionData.SCREEN_TIME}</screen_time>
<reading_activity>${companionData.READING_ACTIVITY}</reading_activity>
<books>${companionData.BOOKS}</books>
<tv>${companionData.TV}</tv>
<next_appointment>${companionData.NEXT_APPOINTMENT}</next_appointment>
<mood_indicators>${companionData.MOOD_INDICATORS}</mood_indicators>
<study_streak>${companionData.STUDY_STREAK}</study_streak>
<active_projects>${companionData.ACTIVE_PROJECTS}</active_projects>
<home_status>${companionData.HOME_STATUS}</home_status>
<history>${companionData.HISTORY}</history>

Your task is to generate 1-4 brief insights (under 65 characters each) for Dan. Follow these guidelines:

1. Always include a weather-related insight.
2. Be practical and supportive, similar to Google At a Glance.
3. Only be extra encouraging if Dan's mood seems low.
4. Use the following emojis to categorize insights:
   - 🌤️ for weather (current/future/suggestions)
   - 📚/📺 for study/reading/movies/shows
   - ⏰ for schedule/productivity
   - ✨ life suggestions (only if needed based on mood)

5. Format each insight on a separate line with the appropriate emoji.
6. Be specific and weather-aware, using the natural language data provided.
7. Avoid excessive enthusiasm, generic advice, guilt-inducing messages, or made-up data.

Generate the insights directly without analysis tags, in this format:
🌤️ [Weather insight]
📚 [Study/reading insight]
⏰ [Schedule/productivity insight]`

    console.log('🤖 Sending prompt to Claude:', prompt.substring(0, 200) + '...')
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const insights = response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate insights'
    console.log('✨ Generated insights:', insights)
    
    const db = getCompanionDatabase()
    const timestamp = new Date()
    db.saveGlanceHistory(insights.trim(), timestamp)
    console.log('💾 Saved insights to history')
    
    return NextResponse.json({ 
      insights: insights.trim(),
      companionData,
      timestamp: timestamp.toISOString() 
    })

  } catch (error) {
    console.error('Error generating glance insights:', error)
    return NextResponse.json({ 
      error: 'Failed to generate insights',
      insights: '🌤️ Weather data unavailable\n📚 Study session recommended\n⏰ Check your schedule',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}