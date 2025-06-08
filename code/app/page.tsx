'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Target, 
  Thermometer,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Home,
  StickyNote,
  Plus,
  RefreshCw
} from 'lucide-react'
import AddTaskModal from '@/components/add-task-modal'
import LogSleepModal from '@/components/log-sleep-modal'
import LogStudyModal from '@/components/log-study-modal'
import AddAppointmentModal from '@/components/add-appointment-modal'
import AddProjectModal from '@/components/add-project-modal'
import AddTvModal from '@/components/add-tv-modal'
import LogScreenTimeModal from '@/components/log-screen-time-modal'
import DataListModal from '@/components/data-list-modal'
import AppSettingsModal from '@/components/app-settings-modal'
import AddBookModal from '@/components/add-book-modal'
import AtGlance from '@/components/at-glance'

interface CompanionData {
  datetime: string
  weather: string
  indoor_conditions: string
  days_to_finals: string
  bedtime_patterns: string
  study_performance: string
  focus_sessions: string
  task_completion: string
  screen_time: string
  reading_activity: string
  books: string
  tv: string
  next_appointment: string
  mood_indicators: string
  study_streak: string
  active_projects: string
  home_status: string
  history: string
  notes: any[]
  settings: any
  raw_data: {
    study_streak: number
    task_completion_rate: number
    tasks: any[]
    sleep_records: any[]
    study_sessions: any[]
    environment: any
    projects: any[]
  }
}

export default function MobileCompanion() {
  const [data, setData] = useState<CompanionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)

  useEffect(() => {
    loadCompanionData()
  }, [])

  const loadCompanionData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/companion')
      if (response.ok) {
        const companionData = await response.json()
        setData(companionData)
      }
    } catch (error) {
      console.error('Failed to load companion data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    
    try {
      const response = await fetch('/api/companion/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() })
      })
      
      if (response.ok) {
        setNewNote('')
        setShowNoteInput(false)
        loadCompanionData()
      }
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/companion/tasks/${taskId}/complete`, {
        method: 'POST'
      })
      
      if (response.ok) {
        loadCompanionData()
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-screen h-screen bg-white text-black font-mono flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading companion data...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-screen h-screen bg-white text-black font-mono flex items-center justify-center p-4">
        <div className="border-2 border-gray-300 p-6 text-center bg-white">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-gray-600" />
          <h3 className="font-bold mb-2">Unable to load data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Failed to connect to companion database
          </p>
          <button 
            onClick={loadCompanionData}
            className="border-2 border-gray-300 px-4 py-2 bg-white hover:bg-gray-100"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-white text-black font-mono flex flex-col">
      <div className="border-b-2 border-gray-300 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Companion</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={loadCompanionData}
              className="p-2 border-2 border-gray-300 bg-white hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <AppSettingsModal onSettingsUpdated={loadCompanionData} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">
            <p className="text-lg text-gray-600">{data.datetime}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-2 border-gray-300 p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-500 font-medium">Finals</span>
              </div>
              <p className="font-medium text-sm">
                {data.days_to_finals === "Finals date not set" ? "Not set" : 
                 data.days_to_finals.replace('Finals start in ', '').replace(' days', ' days')}
              </p>
            </div>
            
            <div className="border-2 border-gray-300 p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-500 font-medium">Weather</span>
              </div>
              <p className="font-medium text-sm">
                {data.weather.includes('not configured') ? 'Not set' : 
                 data.weather.match(/\d+°C/)?.[0] || 'N/A'}
              </p>
            </div>
            
            <div className="border-2 border-gray-300 p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-500 font-medium">Indoor</span>
              </div>
              <p className="font-medium text-sm">
                {data.raw_data.environment?.home_temperature ? 
                 `${data.raw_data.environment.home_temperature}°C` : 'Not set'}
              </p>
            </div>
            
            <div className="border-2 border-gray-300 p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-500 font-medium">Study Streak</span>
              </div>
              <p className="font-medium text-sm">{data.raw_data.study_streak} days</p>
            </div>
          </div>

          <AtGlance />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-gray-300 p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Study Streak Progress</span>
                </div>
                <span className="text-sm text-gray-600 border border-gray-300 px-2 py-1">
                  {data.raw_data.study_streak}/{data.settings.study_streak_goal} days
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 mb-2">
                <div 
                  className="bg-gray-600 h-2" 
                  style={{ width: `${(data.raw_data.study_streak / data.settings.study_streak_goal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Goal: reach {data.settings.study_streak_goal} days until finals
              </p>
            </div>

            <div className="border-2 border-gray-300 p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Weekly Tasks</span>
                </div>
                <span className="text-sm text-gray-600 border border-gray-300 px-2 py-1">
                  {data.raw_data.task_completion_rate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 mb-3">
                <div 
                  className="bg-gray-600 h-2" 
                  style={{ width: `${data.raw_data.task_completion_rate}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                {data.raw_data.tasks.filter(t => t.completed).slice(0, 3).map(task => (
                  <p key={task.id}>✓ {task.title}</p>
                ))}
                {data.raw_data.tasks.filter(t => !t.completed).length > 0 && (
                  <p className="text-gray-600">
                    Missing: {data.raw_data.tasks.filter(t => !t.completed).slice(0, 2).map(t => t.title).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {data.raw_data.tasks.filter(t => !t.completed).length > 0 && (
            <div className="border-2 border-gray-300 p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Pending Tasks</span>
              </div>
              <div className="space-y-2">
                {data.raw_data.tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center justify-between">
                    <span className="text-sm">{task.title}</span>
                    <button 
                      onClick={() => completeTask(task.id)}
                      className="px-3 py-1 border border-gray-300 bg-white hover:bg-gray-100 text-xs"
                    >
                      Complete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}


          <div className="border-2 border-gray-300 p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Quick Actions</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <AddTaskModal onTaskAdded={loadCompanionData} />
              <AddAppointmentModal onAppointmentAdded={loadCompanionData} />
              <AddProjectModal onProjectAdded={loadCompanionData} />
              <AddTvModal onTvAdded={loadCompanionData} />
              <AddBookModal onBookAdded={loadCompanionData} />
              <LogSleepModal onSleepLogged={loadCompanionData} />
              <LogStudyModal onStudyLogged={loadCompanionData} />
              <LogScreenTimeModal onScreenTimeLogged={loadCompanionData} />
            </div>
          </div>

          {showNoteInput ? (
            <div className="border-2 border-gray-300 p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Add Note</span>
              </div>
              <textarea
                placeholder="Write your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full h-24 p-3 border-2 border-gray-300 text-sm font-mono resize-none focus:outline-none focus:border-gray-500"
              />
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={addNote} 
                  disabled={!newNote.trim()}
                  className="px-4 py-2 border-2 border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
                <button 
                  onClick={() => {
                    setShowNoteInput(false)
                    setNewNote('')
                  }}
                  className="px-4 py-2 border-2 border-gray-300 bg-gray-50 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowNoteInput(true)}
              className="w-full border-2 border-gray-300 p-4 bg-white hover:bg-gray-100 text-left"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Add Quick Note</span>
              </div>
            </button>
          )}

          <DataListModal onDataChanged={loadCompanionData} />
        </div>
      </div>
    </div>
  )
}