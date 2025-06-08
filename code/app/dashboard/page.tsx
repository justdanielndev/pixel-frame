"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sun, CloudRain, Book, Clock, Calendar, MessageCircle, Newspaper } from "lucide-react"
import VoiceRecorder from "@/components/voice-recorder"

interface AtGlanceData {
  insights: string
  timestamp: string
  error?: string
}

export default function EInkDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showNavigation, setShowNavigation] = useState(false)
  const [showTimeCountdown, setShowTimeCountdown] = useState(false)
  const [glanceData, setGlanceData] = useState<AtGlanceData | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const router = useRouter()

  const navigationOptions = [
    { name: "Books", icon: Book, path: "/books" },
    { name: "Notes", icon: MessageCircle, path: "/notes" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
    { name: "Weather", icon: Sun, path: "/weather" }
  ]

  const fetchGlanceData = async () => {
    try {
      const response = await fetch('/api/ai/glance')
      const result = await response.json()
      
      if (response.ok) {
        setGlanceData(result)
        localStorage.setItem('atGlanceData', JSON.stringify({
          ...result,
          cachedAt: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.error('Error fetching glance data:', error)
      const cached = localStorage.getItem('atGlanceData')
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          setGlanceData(cachedData)
        } catch (parseError) {
          console.error('Error parsing cached data:', parseError)
        }
      }
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchGlanceData()
    const interval = setInterval(fetchGlanceData, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showNavigation && !showTimeCountdown) {
        switch (e.code) {
          case 'Space':
            if (!isRecording && !e.repeat) {
              e.preventDefault()
              setIsRecording(true)
            }
            break
          case 'ArrowLeft':
          case 'ArrowRight':
            e.preventDefault()
            setShowNavigation(true)
            setSelectedIndex(0)
            break
          case 'Enter':
            e.preventDefault()
            setShowTimeCountdown(true)
            break
        }
      } else if (showTimeCountdown) {
        e.preventDefault()
        setShowTimeCountdown(false)
      } else {
        switch (e.code) {
          case 'ArrowLeft':
            e.preventDefault()
            setSelectedIndex(prev => Math.max(0, prev - 1))
            break
          case 'ArrowRight':
            e.preventDefault()
            setSelectedIndex(prev => Math.min(navigationOptions.length - 1, prev + 1))
            break
          case 'ArrowUp':
            e.preventDefault()
            setSelectedIndex(prev => Math.max(0, prev - 1))
            break
          case 'ArrowDown':
            e.preventDefault()
            setSelectedIndex(prev => Math.min(navigationOptions.length - 1, prev + 1))
            break
          case 'Enter':
            e.preventDefault()
            router.push(navigationOptions[selectedIndex].path)
            break
          case 'Space':
            e.preventDefault()
            setShowNavigation(false)
            break
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isRecording && !showNavigation && !showTimeCountdown) {
        e.preventDefault()
        setIsRecording(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedIndex, router, showNavigation, showTimeCountdown, navigationOptions, isRecording])

  useEffect(() => {
    if (showTimeCountdown) {
      const initialMinute = currentTime.getMinutes()
      
      const checkMinuteChange = () => {
        const now = new Date()
        if (now.getMinutes() !== initialMinute) {
          setShowTimeCountdown(false)
        }
      }
      
      const interval = setInterval(checkMinuteChange, 1000)
      return () => clearInterval(interval)
    }
  }, [showTimeCountdown, currentTime])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Europe/Berlin"
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "Europe/Berlin"
    })
  }

  const getSecondsUntilNextMinute = (date: Date) => {
    return 60 - date.getSeconds()
  }

  const handleRecordingComplete = (transcript: string) => {
    if (transcript.trim()) {
      localStorage.setItem('voice_transcript', transcript)
      router.push('/assistant')
    }
  }

  const handleRecordingError = (error: string) => {
    console.error('Recording error:', error)
  }

  const handleRecordingTooShort = () => {
    console.log('Recording too short, ignoring')
  }

  const parseInsights = (insights: string) => {
    if (!insights) return []
    
    const lines = insights.split('\n').filter(line => line.trim())
    return lines.map(line => {
      const trimmed = line.trim()
      if (trimmed.startsWith('🌤️')) {
        return { type: 'weather', text: trimmed.replace('🌤️', '').trim(), icon: Sun }
      } else if (trimmed.startsWith('📚') || trimmed.startsWith('📺')) {
        return { type: 'study', text: trimmed.replace(/^📚|📺/, '').trim(), icon: Book }
      } else if (trimmed.startsWith('⏰')) {
        return { type: 'schedule', text: trimmed.replace('⏰', '').trim(), icon: Clock }
      } else if (trimmed.startsWith('✨')) {
        return { type: 'life', text: trimmed.replace('✨', '').trim(), icon: CloudRain }
      }
      return { type: 'general', text: trimmed, icon: MessageCircle }
    }).filter(Boolean)
  }

  const insights = glanceData ? parseInsights(glanceData.insights) : [
    { type: 'study', text: 'Heartstopper 73% - perfect', icon: Book },
    { type: 'schedule', text: 'Physics homework due tonight', icon: Clock },
    { type: 'weather', text: 'Rain tomorrow - take umbrella', icon: CloudRain }
  ]

  return (
    <div className="w-screen h-screen bg-white text-black flex flex-col font-mono">
      {!showNavigation ? (
        <>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-8 text-3xl mb-8">
                {!showTimeCountdown ? (
                  <div className="flex items-center">
                    <Sun className="w-8 h-8 mr-3" />
                    <span className="font-bold">28°C</span>
                    <span className="text-xl ml-3 text-gray-600">Sunny, Light breeze</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 mr-3" />
                    <span className="font-bold">{formatTime(currentTime)}</span>
                  </div>
                )}
                <span className="text-gray-400">•</span>
                <span className="font-medium">{formatDate(currentTime)}</span>
              </div>

              <div className="w-full border-t-2 border-gray-300 mb-8"></div>

              <div className="space-y-4 flex flex-col items-center">
                {insights.slice(0, 3).map((insight, index) => {
                  const IconComponent = insight.icon
                  const colors = ['text-blue-600', 'text-orange-600', 'text-gray-600']
                  return (
                    <div key={index} className="flex items-center space-x-4 text-xl font-medium">
                      <IconComponent className={`w-6 h-6 ${colors[index % colors.length]}`} />
                      <span>{insight.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="w-full bg-gray-100 border-t-2 border-gray-300 p-4">
              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📦</span>
                  <div className="text-lg font-medium text-gray-600">Package Tracking - Coming Soon</div>
                </div>
              </div>
            </div>
          </div>

        </>
      ) : (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
          <div className="flex gap-12 items-center">
            {navigationOptions.map((option, index) => {
              const IconComponent = option.icon
              return (
                <div
                  key={option.name}
                  className={`flex flex-col items-center p-6 border-4 ${
                    index === selectedIndex
                      ? 'border-black bg-gray-100'
                      : 'border-gray-300'
                  }`}
                >
                  <IconComponent className="w-12 h-12 mb-3" />
                  <span className="text-xl font-medium">{option.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <VoiceRecorder 
        isRecording={isRecording}
        onRecordingComplete={handleRecordingComplete}
        onRecordingError={handleRecordingError}
        onRecordingTooShort={handleRecordingTooShort}
      />
    </div>
  )
}