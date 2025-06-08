'use client'

import { useState, useEffect } from 'react'
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Zap, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  RefreshCw 
} from 'lucide-react'

interface WeatherData {
  temperature: number
  feels_like: number
  humidity: number
  pressure: number
  visibility: number
  wind_speed: number
  wind_direction: number
  description: string
  icon: string
  location: string
  timestamp: string
  cached: boolean
  tomorrow?: {
    temperature_min: number
    temperature_max: number
    description: string
    icon: string
  } | null
}

interface WeatherRecord {
  id: number
  timestamp: string
  temperature: number
  description: string
  location: string
}

export default function WeatherPage() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [weatherHistory, setWeatherHistory] = useState<WeatherRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWeatherData()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          loadWeatherData()
          break
        case ' ':
          e.preventDefault()
          window.location.href = '/dashboard'
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const loadWeatherData = async () => {
    setLoading(true)
    try {
      const currentResponse = await fetch('/api/weather/current')
      if (currentResponse.ok) {
        const current = await currentResponse.json()
        setCurrentWeather(current)
      }

      const historyResponse = await fetch('/api/weather/history')
      if (historyResponse.ok) {
        const history = await historyResponse.json()
        setWeatherHistory(history.slice(0, 4))
      }
    } catch (error) {
      console.error('Failed to load weather data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase()
    if (desc.includes('rain') || desc.includes('drizzle')) return CloudRain
    if (desc.includes('snow')) return CloudSnow
    if (desc.includes('thunder') || desc.includes('storm')) return Zap
    if (desc.includes('cloud')) return Cloud
    return Sun
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="w-screen h-screen bg-white text-black font-mono flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading weather...</span>
        </div>
      </div>
    )
  }

  if (!currentWeather) {
    return (
      <div className="w-screen h-screen bg-white text-black font-mono flex items-center justify-center">
        <div className="text-center">
          <Cloud className="w-12 h-12 mx-auto mb-2" />
          <p>Weather data unavailable</p>
        </div>
      </div>
    )
  }

  const WeatherIcon = getWeatherIcon(currentWeather.description)

  return (
    <div className="w-screen h-screen bg-white text-black font-mono flex flex-col">
      
      {/* Main Weather Display */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-5xl px-6">
          
          {/* Top Section - Current Weather */}
          <div className="grid grid-cols-3 gap-6 items-center mb-8">
            
            {/* Left - Weather Icon */}
            <div className="flex justify-center">
              <WeatherIcon className="w-28 h-28" />
            </div>

            {/* Center - Temperature */}
            <div className="text-center border-l-2 border-r-2 border-gray-300 py-4">
              <div className="text-9xl font-bold leading-none mb-2">
                {Math.round(currentWeather.temperature)}°
              </div>
              <div className="text-lg">Temperature</div>
            </div>

            {/* Right - Weather Info */}
            <div className="space-y-6 pl-4">
              <div className="flex items-center gap-4">
                <Thermometer className="w-6 h-6" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(currentWeather.feels_like)}°</div>
                  <div className="text-sm">Feels Like</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Droplets className="w-6 h-6" />
                <div>
                  <div className="text-2xl font-bold">{currentWeather.humidity}%</div>
                  <div className="text-sm">Humidity</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <WeatherIcon className="w-6 h-6" />
                <div>
                  <div className="text-lg font-bold capitalize">{currentWeather.description.split(' ')[0]}</div>
                  <div className="text-sm">Right Now</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dotted Separator */}
          <div className="border-t-2 border-dotted border-gray-300 mb-8"></div>

          {/* Bottom Section - Forecast/History */}
          <div className="grid grid-cols-2 gap-12">
            
            {/* Left Column - Tomorrow's Forecast */}
            <div className="space-y-4">
              {currentWeather.tomorrow ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {(() => {
                      const TomorrowIcon = getWeatherIcon(currentWeather.tomorrow.description)
                      return <TomorrowIcon className="w-8 h-8" />
                    })()}
                    <div>
                      <div className="text-lg font-bold capitalize">{currentWeather.tomorrow.description}</div>
                      <div className="text-sm">Tomorrow</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xl font-bold">{Math.round(currentWeather.tomorrow.temperature_min)}°</div>
                      <div className="text-sm">Low</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{Math.round(currentWeather.tomorrow.temperature_max)}°</div>
                      <div className="text-sm">High</div>
                    </div>
                  </div>
                </div>
              ) : (
                weatherHistory.slice(0, 2).map((record, index) => {
                  const HistoryIcon = getWeatherIcon(record.description)
                  return (
                    <div key={record.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <HistoryIcon className="w-8 h-8" />
                        <div>
                          <div className="text-lg font-bold capitalize">{record.description}</div>
                          <div className="text-sm">{formatTime(record.timestamp)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xl font-bold">{Math.round(record.temperature - 3)}°</div>
                          <div className="text-sm">Low</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">{Math.round(record.temperature + 3)}°</div>
                          <div className="text-sm">High</div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Right Column - Wind & Visibility */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Wind className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">{currentWeather.wind_speed} m/s</div>
                  <div className="text-sm">Wind Speed</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Eye className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">{(currentWeather.visibility / 1000).toFixed(1)} km</div>
                  <div className="text-sm">Visibility</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>


    </div>
  )
}