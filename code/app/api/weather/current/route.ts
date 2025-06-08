import { NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function GET() {
  try {
    const db = getCompanionDatabase()
    const settings = db.getCompanionSettings()
    
    // Check if we have recent weather data (within 15 minutes)
    const latestRecord = db.getLatestWeatherRecord()
    const now = new Date()
    
    if (latestRecord) {
      const timeDiff = now.getTime() - latestRecord.timestamp.getTime()
      const minutesDiff = timeDiff / (1000 * 60)
      
      // If we have weather data less than 15 minutes old, return it
      // Skip cache for now to get fresh forecast data
      if (minutesDiff < 1) {
        return NextResponse.json({
          temperature: latestRecord.temperature,
          feels_like: latestRecord.feels_like,
          humidity: latestRecord.humidity,
          pressure: latestRecord.pressure,
          visibility: latestRecord.visibility,
          wind_speed: latestRecord.wind_speed,
          wind_direction: latestRecord.wind_direction,
          description: latestRecord.description,
          icon: latestRecord.icon,
          location: latestRecord.location,
          timestamp: latestRecord.timestamp,
          cached: true,
          tomorrow: null
        })
      }
    }

    // Fetch fresh weather data
    const location = settings.weather_location || 'Valencia,ES'
    
    let weatherData = null
    let provider = 'unknown'

    // Try Meteosource first
    if (process.env.METEOSOURCE_API_KEY) {
      try {
        const meteosourceUrl = `https://www.meteosource.com/api/v1/free/point?place_id=${location}&sections=current,daily&timezone=UTC&language=en&units=metric&key=${process.env.METEOSOURCE_API_KEY}`
        
        const response = await fetch(meteosourceUrl)
        if (response.ok) {
          const data = await response.json()
          const current = data.current
          const tomorrow = data.daily?.data?.[1] || null
          
          weatherData = {
            temperature: current.temperature,
            feels_like: current.feels_like,
            humidity: current.humidity,
            pressure: current.pressure,
            visibility: current.visibility,
            wind_speed: current.wind.speed,
            wind_direction: current.wind.dir,
            description: current.summary,
            icon: current.icon,
            tomorrow: tomorrow ? {
              temperature_min: tomorrow.all_day.temperature_min,
              temperature_max: tomorrow.all_day.temperature_max,
              description: tomorrow.all_day.summary,
              icon: tomorrow.all_day.icon
            } : null
          }
          provider = 'meteosource'
        }
      } catch (error) {
        console.warn('Meteosource API failed:', error)
      }
    }

    // Fallback to OpenWeatherMap
    if (!weatherData && process.env.OPENWEATHER_API_KEY) {
      try {
        const openWeatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        
        const response = await fetch(openWeatherUrl)
        if (response.ok) {
          const data = await response.json()
          
          weatherData = {
            temperature: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            visibility: data.visibility,
            wind_speed: data.wind?.speed || 0,
            wind_direction: data.wind?.deg || 0,
            description: data.weather[0].description,
            icon: data.weather[0].icon
          }
          provider = 'openweathermap'
        }
      } catch (error) {
        console.warn('OpenWeatherMap API failed:', error)
      }
    }

    if (!weatherData) {
      return NextResponse.json({ error: 'Unable to fetch weather data' }, { status: 503 })
    }

    // Save to database
    const weatherRecord = db.saveWeatherRecord({
      timestamp: now,
      location,
      temperature: weatherData.temperature,
      feels_like: weatherData.feels_like,
      humidity: weatherData.humidity,
      pressure: weatherData.pressure,
      visibility: weatherData.visibility,
      wind_speed: weatherData.wind_speed,
      wind_direction: weatherData.wind_direction,
      description: weatherData.description,
      icon: weatherData.icon,
      provider
    })

    // Clean old records (keep 7 days)
    db.cleanOldWeatherRecords(7)

    return NextResponse.json({
      ...weatherData,
      location,
      timestamp: weatherRecord.timestamp,
      cached: false
    })

  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}