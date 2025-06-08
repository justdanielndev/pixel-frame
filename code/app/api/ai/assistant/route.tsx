import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getCompanionDatabase } from '@/lib/companion-database'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get current companion data for context
    const db = getCompanionDatabase()
    const settings = db.getCompanionSettings()
    const latestWeather = db.getLatestWeatherRecord()
    const environmentSettings = db.getEnvironmentSettings()
    
    // Get recent data
    const tasks = db.getAllTasks()
    const recentSessions = db.getStudySessionsForDateRange(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    )
    const activeProjects = db.getActiveProjects()
    const recentSleep = db.getRecentSleepRecords(7)
    const upcomingAppointments = db.getUpcomingAppointments(7)

    // Calculate study metrics
    const completedTasks = tasks.filter(t => t.completed).length
    const totalTasks = tasks.length
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    // Calculate study streak
    const studyStreak = db.getStudyStreak()
    
    // Get current datetime
    const now = new Date()
    const datetime = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Europe/Berlin'
    }) + ', ' + now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true,
      timeZone: 'Europe/Berlin'
    })

    // Calculate days to finals
    const finalsDate = new Date(settings.finals_start_date)
    const daysToFinals = Math.ceil((finalsDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Format weather info
    const weather = latestWeather 
      ? `${latestWeather.description} with a temperature of ${Math.round(latestWeather.temperature)}°C (${Math.round(latestWeather.feels_like)}°C feels like). Humidity: ${latestWeather.humidity}%. Wind: ${latestWeather.wind_speed} m/s.`
      : 'Weather information not available'

    // Format indoor conditions
    const indoorConditions = environmentSettings
      ? `Temperature: ${environmentSettings.home_temperature}°C, Humidity: ${environmentSettings.home_humidity}%, Air Quality: ${environmentSettings.air_quality}`
      : 'Indoor conditions not available'

    // Build the prompt with real data
    const promptText = `<examples>
<example>
<MESSAGE>
Hey, I'm feeling a bit overwhelmed with all the studying I need to do. Can you help me figure out a good study schedule for today? Also, I've been meaning to work on my JavaScript project, but I'm not sure if I should focus on that or just stick to exam prep. What do you think?
</MESSAGE>
<DATETIME>
Tuesday, May 16, 2023, 10:15 AM
</DATETIME>
<WEATHER>
Partly cloudy with a high of 72°F (22°C). Light breeze from the southwest. 20% chance of rain in the afternoon.
</WEATHER>
<INDOOR_CONDITIONS>
Temperature: 70°F (21°C), Humidity: 45%, Air Quality Index: Good (38)
</INDOOR_CONDITIONS>
<DAYS_TO_FINALS>
12
</DAYS_TO_FINALS>
<STUDY_PERFORMANCE>
Average study time: 2.5 hours/day. Consistency: Moderate. Subjects needing attention: Mathematics, Physics
</STUDY_PERFORMANCE>
<FOCUS_SESSIONS>
Last 7 days: 5 sessions, average duration 45 minutes. Longest session: 75 minutes (2 days ago)
</FOCUS_SESSIONS>
<TASK_COMPLETION>
Weekly average: 65% of planned tasks completed. Yesterday: 3/5 tasks finished
</TASK_COMPLETION>
<STUDY_STREAK>
Current streak: 3 days. Longest streak: 7 days (2 weeks ago)
</STUDY_STREAK>
<NEXT_APPOINTMENT>
Math tutor session - Thursday, May 18, 4:00 PM
</NEXT_APPOINTMENT>
<BEDTIME_PATTERNS>
Average bedtime last week: 11:30 PM. Average wake-up time: 7:45 AM. Sleep quality: Moderate
</BEDTIME_PATTERNS>
<SCREEN_TIME>
Daily average: 6.5 hours. Peak usage: 8 PM - 11 PM. Most used apps: Discord, Instagram, Duolingo
</SCREEN_TIME>
<READING_ACTIVITY>
Last book finished: "Heartstopper: Volume 4" (3 days ago). Currently reading: "Clean Code: A Handbook of Agile Software Craftsmanship" (15% complete)
</READING_ACTIVITY>
<BOOKS>
Recent additions: "The Midnight Library", "Fundamentals of UX/UI Design", "The Hobbit"
</BOOKS>
<TV>
Recently watched: "The Dragon Prince" (Season 3), "Queer Eye" (2 episodes this week)
</TV>
<MOOD_INDICATORS>
Slight increase in stress levels over the past 3 days. Reduced social media engagement. Increased use of meditation app.
</MOOD_INDICATORS>
<ACTIVE_PROJECTS>
1. Personal website redesign (30% complete)
2. JavaScript game development (15% complete)
3. Arduino-based smart plant watering system (50% complete)
</ACTIVE_PROJECTS>
<ideal_output>
<response_planning>
1. **Dan's Current Situation:**
   - 12 days until finals with moderate study consistency (2.5 hrs/day average)
   - Stress levels increasing over past 3 days, but they're proactively using meditation app
   - Mathematics and Physics need attention, with a math tutor session Thursday
   - 65% task completion rate, currently on a 3-day study streak
   - Has 3 active tech projects (website 30%, JS game 15%, Arduino 50%)
   - Reading "Clean Code" shows their commitment to JavaScript learning
   - Good indoor conditions for studying today

2. **Key Points to Address:**
   - Feeling overwhelmed with studying
   - Needs help with today's study schedule
   - Torn between JavaScript project and exam prep
   - Decision paralysis about priorities

3. **Potential Responses:**
   - Create a balanced schedule incorporating both studying and project time
   - Acknowledge their stress while highlighting their current 3-day streak
   - Suggest focusing on Math/Physics since those need attention and they have tutoring Thursday
   - Recommend a short JavaScript break as a reward/mental reset
   - Use the pleasant weather and good indoor conditions as motivation

4. **Best Approach:**
   I'll provide a structured yet flexible schedule that prioritizes their weak subjects while allowing some project time as a motivational break. I'll acknowledge their stress without being overly enthusiastic, and reference their current reading and upcoming tutor session to show I understand their situation.
</response_planning>

{ text: "I can see you're feeling the pressure with finals coming up in 12 days. The good news is you're on a 3-day study streak, so let's keep that momentum going.", icon: null },

{ text: "For today's schedule, I'd suggest focusing on Math and Physics since your tutor session is Thursday - it'll be more productive if you prep beforehand. Maybe 90 minutes on each subject with breaks?", icon: "📚" },

{ text: "About your JavaScript project - I know it's tempting, especially since you're reading Clean Code right now. How about using 30-45 minutes of JS work as a reward after your main study blocks? It could actually help reset your focus.", icon: "💻" },

{ text: "The indoor conditions are perfect for studying today (70°F, good air quality), and it's pleasant outside if you want to take your breaks on the porch or by a window.", icon: null },

{ text: "Since your task completion has been around 65% lately, maybe plan for 3-4 realistic goals today rather than overloading your schedule. What feels most manageable right now?", icon: "✅" }
</ideal_output>
</example>
</examples>

Here is the user's message:
<message>${message}</message>

You are an AI assistant for a smart home hub, designed to interact with [USER INFO (REPLACE)]. Use the following data to inform your response:

<current_conditions>
<datetime>${datetime}</datetime>
<weather>${weather}</weather>
<indoor_conditions>${indoorConditions}</indoor_conditions>
</current_conditions>

<academic_status>
<days_to_finals>${daysToFinals}</days_to_finals>
<study_performance>Study sessions: ${recentSessions.length} in last 7 days. Task completion rate: ${taskCompletionRate}%</study_performance>
<focus_sessions>Recent study sessions: ${recentSessions.length} sessions this week</focus_sessions>
<task_completion>Current tasks: ${tasks.filter(t => !t.completed).length} pending, ${completedTasks} completed (${taskCompletionRate}% completion rate)</task_completion>
<study_streak>Current study streak: ${studyStreak} days</study_streak>
<next_appointment>${upcomingAppointments.length > 0 ? `${upcomingAppointments[0].title} - ${upcomingAppointments[0].date} at ${upcomingAppointments[0].start_time}` : 'No upcoming appointments'}</next_appointment>
</academic_status>

<personal_habits>
<bedtime_patterns>${recentSleep.length > 0 ? `Recent sleep pattern: ${recentSleep.length} sleep records in last week` : 'No recent sleep data'}</bedtime_patterns>
<screen_time>Screen time data not available</screen_time>
<reading_activity>Reading activity tracking in progress</reading_activity>
<books>Book collection being tracked</books>
<tv>TV watching activity being monitored</tv>
</personal_habits>

<wellbeing_indicators>
<mood_indicators>Monitoring through app usage and activity patterns</mood_indicators>
<active_projects>${activeProjects.map(p => `${p.name} (${p.progress_percentage}% complete)`).join(', ') || 'No active projects tracked'}</active_projects>
</wellbeing_indicators>

Before crafting your response, analyze the available data and consider how to best address the user's message. Show your thought process inside <response_planning> tags:

1. Summarize Dan's current situation based on the provided data.
2. Identify key points from Dan's message that need addressing.
3. List potential responses, considering Dan's interests and challenges.
4. Choose the most appropriate responses and explain why.

Guidelines for your response:
1. Be specific and weather-aware, using the natural language data provided.
2. Avoid:
   - Excessive enthusiasm
   - Generic advice
   - Guilt-inducing messages
   - Made-up data
   - Unexpressive responses
3. Format your response as a series of JSON-like objects, each containing a 'text' field and an optional 'icon' field.

Example format (do not use this content, it's just to illustrate the structure):
{ text: "First message", icon: null },
{ text: "Second message with an icon", icon: "📚" },
{ text: "Third message", icon: "💻" }

Remember to tailor your response to the user's interests, current academic situation, and personal habits. Be supportive and understanding of their challenges while providing constructive suggestions or observations.`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 20000,
      temperature: 1,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText
            }
          ]
        }
      ]
    })

    const responseText = response.content[0]?.text || 'I apologize, but I encountered an issue processing your message.'
    
    return NextResponse.json({
      response: responseText,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error calling Anthropic API:', error)
    return NextResponse.json({
      error: 'Unable to process your request at the moment. Please try again.',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}