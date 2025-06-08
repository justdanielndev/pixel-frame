'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function LogStudyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    productivity_rating: 3,
    focus_rating: 3,
    notes: ''
  })

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`)
      const end = new Date(`2000-01-01T${formData.end_time}`)
      const diffMs = end.getTime() - start.getTime()
      return Math.round(diffMs / (1000 * 60))
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const duration = calculateDuration()
    const submitData = {
      ...formData,
      duration_minutes: duration > 0 ? duration : formData.duration_minutes
    }

    try {
      const response = await fetch('/api/companion/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to log study session:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <PageHeader title="Log Study Session" showBack />
      
      <div className="px-4">
        <Card>
          <CardHeader>
            <CardTitle>Study Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Math, Physics, etc."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
              
              {calculateDuration() > 0 && (
                <div className="text-sm text-muted-foreground">
                  Duration: {calculateDuration()} minutes
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productivity_rating">Productivity (1-5)</Label>
                  <select 
                    id="productivity_rating"
                    value={formData.productivity_rating}
                    onChange={(e) => setFormData({ ...formData, productivity_rating: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded"
                  >
                    <option value={1}>1 - Very Low</option>
                    <option value={2}>2 - Low</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Very High</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="focus_rating">Focus (1-5)</Label>
                  <select 
                    id="focus_rating"
                    value={formData.focus_rating}
                    onChange={(e) => setFormData({ ...formData, focus_rating: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded"
                  >
                    <option value={1}>1 - Very Low</option>
                    <option value={2}>2 - Low</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Very High</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What did you study? How did it go?"
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Logging...' : 'Log Study Session'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}