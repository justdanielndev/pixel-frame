'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function LogSleepPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '23:00',
    wake_time: '07:00',
    quality: 'good' as 'poor' | 'fair' | 'good' | 'excellent',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/companion/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to log sleep:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <PageHeader title="Log Sleep" showBack />
      
      <div className="px-4">
        <Card>
          <CardHeader>
            <CardTitle>Sleep Record</CardTitle>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedtime">Bedtime</Label>
                  <Input
                    id="bedtime"
                    type="time"
                    value={formData.bedtime}
                    onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="wake_time">Wake Time</Label>
                  <Input
                    id="wake_time"
                    type="time"
                    value={formData.wake_time}
                    onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="quality">Sleep Quality</Label>
                <select 
                  id="quality"
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: e.target.value as any })}
                  className="w-full p-2 border rounded"
                >
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How was your sleep?"
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Logging...' : 'Log Sleep'}
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