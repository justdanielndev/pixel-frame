'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageHeader from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Cloud, Home } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    finals_start_date: '',
    study_streak_goal: 14,
    daily_study_goal_minutes: 120,
    daily_reading_goal_minutes: 45,
    bedtime_goal: '23:00',
    weather_location: 'Valencia,ES'
  })
  const [environment, setEnvironment] = useState({
    home_temperature: 22,
    home_humidity: 45,
    air_quality: 'good' as 'poor' | 'fair' | 'good' | 'excellent',
    blinds_position: 60,
    lights_brightness: 40
  })

  useEffect(() => {
    loadSettings()
    const tab = searchParams.get('tab')
    if (tab && ['general', 'environment'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const loadSettings = async () => {
    try {
      const [settingsResponse, environmentResponse] = await Promise.all([
        fetch('/api/companion/settings'),
        fetch('/api/companion/environment')
      ])
      
      if (settingsResponse.ok) {
        const data = await settingsResponse.json()
        setSettings(data)
      }
      
      if (environmentResponse.ok) {
        const envData = await environmentResponse.json()
        setEnvironment(envData)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const saveGeneralSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/companion/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEnvironmentSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/companion/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(environment)
      })

      if (response.ok) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to save environment:', error)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="App Settings" showBack />
      
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Academic Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="finals_date">Finals Start Date</Label>
                  <Input
                    id="finals_date"
                    type="date"
                    value={settings.finals_start_date}
                    onChange={(e) => setSettings({ ...settings, finals_start_date: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="study_goal">Study Streak Goal (days)</Label>
                    <Input
                      id="study_goal"
                      type="number"
                      min="1"
                      max="365"
                      value={settings.study_streak_goal}
                      onChange={(e) => setSettings({ ...settings, study_streak_goal: parseInt(e.target.value) })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bedtime_goal">Bedtime Goal</Label>
                    <Input
                      id="bedtime_goal"
                      type="time"
                      value={settings.bedtime_goal}
                      onChange={(e) => setSettings({ ...settings, bedtime_goal: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="daily_study">Daily Study Goal (minutes)</Label>
                    <Input
                      id="daily_study"
                      type="number"
                      min="15"
                      max="720"
                      value={settings.daily_study_goal_minutes}
                      onChange={(e) => setSettings({ ...settings, daily_study_goal_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="daily_reading">Daily Reading Goal (minutes)</Label>
                    <Input
                      id="daily_reading"
                      type="number"
                      min="15"
                      max="480"
                      value={settings.daily_reading_goal_minutes}
                      onChange={(e) => setSettings({ ...settings, daily_reading_goal_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="weather_location">Weather Location</Label>
                  <Input
                    id="weather_location"
                    type="text"
                    placeholder="City,CountryCode (e.g., Valencia,ES)"
                    value={settings.weather_location}
                    onChange={(e) => setSettings({ ...settings, weather_location: e.target.value })}
                  />
                </div>
                
                <Button onClick={saveGeneralSettings} disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save General Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Home Environment
                </CardTitle>
                <CardDescription>
                  Configure your home environment settings for optimal studying
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperature: {environment.home_temperature}°C</Label>
                    <Input
                      id="temperature"
                      type="range"
                      min="15"
                      max="30"
                      step="0.5"
                      value={environment.home_temperature}
                      onChange={(e) => setEnvironment({ ...environment, home_temperature: parseFloat(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="humidity">Humidity: {environment.home_humidity}%</Label>
                    <Input
                      id="humidity"
                      type="range"
                      min="20"
                      max="80"
                      value={environment.home_humidity}
                      onChange={(e) => setEnvironment({ ...environment, home_humidity: parseInt(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="air_quality">Air Quality</Label>
                  <select 
                    id="air_quality"
                    value={environment.air_quality}
                    onChange={(e) => setEnvironment({ ...environment, air_quality: e.target.value as any })}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="excellent">Excellent</option>
                  </select>
                </div>
                
                <Button onClick={saveEnvironmentSettings} disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save Environment Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}