'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, Eye } from 'lucide-react'

interface AtGlanceData {
  insights: string
  timestamp: string
  error?: string
}

interface AtGlanceProps {
  refreshInterval?: number
}

export default function AtGlance({ refreshInterval = 15 * 60 * 1000 }: AtGlanceProps) {
  const [data, setData] = useState<AtGlanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchGlanceData = async () => {
    try {
      setError(null)
      const response = await fetch('/api/ai/glance')
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
        setLastRefresh(new Date())
        
        localStorage.setItem('atGlanceData', JSON.stringify({
          ...result,
          cachedAt: new Date().toISOString()
        }))
      } else {
        throw new Error(result.error || 'Failed to fetch insights')
      }
    } catch (err) {
      console.error('Error fetching glance data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      const cached = localStorage.getItem('atGlanceData')
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          setData(cachedData)
          setLastRefresh(new Date(cachedData.cachedAt))
        } catch (parseError) {
          console.error('Error parsing cached data:', parseError)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cached = localStorage.getItem('atGlanceData')
    if (cached) {
      try {
        const cachedData = JSON.parse(cached)
        const cacheAge = Date.now() - new Date(cachedData.cachedAt).getTime()
        
        if (cacheAge < refreshInterval) {
          setData(cachedData)
          setLastRefresh(new Date(cachedData.cachedAt))
          setLoading(false)
          return
        }
      } catch (error) {
        console.error('Error loading cached data:', error)
      }
    }

    fetchGlanceData()
  }, [refreshInterval])

  useEffect(() => {
    const interval = setInterval(fetchGlanceData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const handleManualRefresh = () => {
    setLoading(true)
    fetchGlanceData()
  }

  const formatInsights = (insights: string) => {
    return insights.split('\n').map((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) return null
      
      return (
        <div key={index} className="text-xs leading-relaxed">
          {trimmed}
        </div>
      )
    }).filter(Boolean)
  }

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return 'just now'
    if (minutes === 1) return '1 minute ago'
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return '1 hour ago'
    return `${hours} hours ago`
  }

  if (loading && !data) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading insights...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !data) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-destructive mb-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            className="text-xs h-6"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">No insights available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            AI Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastRefresh && (
              <span className="text-xs text-muted-foreground">
                {getTimeAgo(lastRefresh)}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {formatInsights(data.insights)}
          {error && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              ⚠️ Showing cached data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}