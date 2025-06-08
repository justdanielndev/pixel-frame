'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function AddAppointmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    type: 'appointment' as 'exam' | 'class' | 'meeting' | 'appointment' | 'other'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/companion/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to create appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <PageHeader title="Add Appointment" showBack />
      
      <div className="px-4">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Math exam, Meeting with John, etc."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <select 
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-2 border rounded"
                >
                  <option value="exam">Exam</option>
                  <option value="class">Class</option>
                  <option value="meeting">Meeting</option>
                  <option value="appointment">Appointment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
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
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Room 204, Zoom link, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Event'}
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