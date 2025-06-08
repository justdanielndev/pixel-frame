'use client'

import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface Appointment {
  id: string
  title: string
  description?: string
  date: string
  start_time: string
  end_time?: string
  location?: string
  type: 'exam' | 'class' | 'meeting' | 'appointment' | 'other'
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          navigateDay(-1)
          break
        case 'ArrowRight':
          navigateDay(1)
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

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/companion/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to load appointments:', error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const navigateDay = (direction: number) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + direction)
      return newDate
    })
  }

  const getCurrentMonth = () => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === dateStr)
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const currentMonth = getCurrentMonth()
  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="w-screen h-screen bg-white text-black font-mono flex items-center justify-center">
        <div className="text-xl">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-white text-black font-mono flex flex-col">
      <div className="border-b-2 border-gray-300 p-4">
        <div className="flex items-center justify-center max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">Calendar</h1>
        </div>
      </div>

      <div className="flex-1 p-4 flex gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigateDay(-1)}
              className="border-2 border-gray-300 p-1 bg-white hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold">{formatMonth(currentMonth)}</h2>
            <button 
              onClick={() => navigateDay(1)}
              className="border-2 border-gray-300 p-1 bg-white hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="border-2 border-gray-300 bg-white">
            {/* Week day headers */}
            <div className="grid grid-cols-7 border-b-2 border-gray-300">
              {weekDays.map(day => (
                <div key={day} className="p-1 text-center text-xs font-medium border-r-2 border-gray-300 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {days.map((date, index) => {
                const dayAppointments = getAppointmentsForDate(date)
                const isCurrentDay = isToday(date)
                
                return (
                  <div 
                    key={index}
                    className={`h-12 border-r-2 border-b-2 border-gray-300 last:border-r-0 p-1 ${
                      !date ? 'bg-gray-50' : 
                      date.toDateString() === selectedDate.toDateString() ? 'bg-black text-white' :
                      isCurrentDay ? 'bg-gray-100' : 'bg-white'
                    }`}
                  >
                    {date && (
                      <>
                        <div className={`text-xs mb-1 ${
                          isCurrentDay ? 'font-bold' : ''
                        }`}>
                          {date.getDate()}
                        </div>
                        {dayAppointments.length > 0 && (
                          <div className="text-xs text-gray-600">
                            •
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="w-64 border-2 border-gray-300 bg-white p-3">
          <h3 className="font-bold text-sm mb-3">
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
          
          {(() => {
            const selectedDateStr = selectedDate.toISOString().split('T')[0]
            const dayAppointments = appointments.filter(apt => apt.date === selectedDateStr)
            
            if (dayAppointments.length === 0) {
              return (
                <div className="text-center text-gray-600">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs">No appointments</p>
                  <p className="text-xs">this day</p>
                </div>
              )
            }
            
            return (
              <div className="space-y-2">
                {dayAppointments
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map(apt => (
                    <div key={apt.id} className="border border-gray-300 p-2 text-xs bg-white">
                      <div className="font-medium truncate">{apt.title}</div>
                      <div className="text-gray-600">{apt.start_time}</div>
                      {apt.end_time && (
                        <div className="text-gray-600">to {apt.end_time}</div>
                      )}
                      {apt.location && (
                        <div className="text-gray-500 truncate">{apt.location}</div>
                      )}
                      {apt.description && (
                        <div className="text-gray-500 mt-1 text-xs">{apt.description}</div>
                      )}
                    </div>
                  ))}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}