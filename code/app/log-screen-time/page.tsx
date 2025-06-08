'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Smartphone } from 'lucide-react'

export default function LogScreenTimePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    total_minutes: 240,
    productive_minutes: 120,
    social_minutes: 60,
    entertainment_minutes: 90,
    other_minutes: 30,
    notes: ''
  })

  const handleTotalChange = (newTotal: number) => {
    const currentSum = formData.productive_minutes + formData.social_minutes + formData.entertainment_minutes + formData.other_minutes
    const ratio = newTotal / currentSum
    
    setFormData({
      ...formData,
      total_minutes: newTotal,
      productive_minutes: Math.round(formData.productive_minutes * ratio),
      social_minutes: Math.round(formData.social_minutes * ratio),
      entertainment_minutes: Math.round(formData.entertainment_minutes * ratio),
      other_minutes: Math.round(formData.other_minutes * ratio)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/companion/screen-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to log screen time:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalCategorized = formData.productive_minutes + formData.social_minutes + formData.entertainment_minutes + formData.other_minutes

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Log Screen Time</h1>
            <p className="text-muted-foreground">Track your daily screen time usage</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Screen Time Details
            </CardTitle>
            <CardDescription>
              Record your screen time breakdown for the day
            </CardDescription>
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
                <Label htmlFor="total">Total Screen Time: {Math.floor(formData.total_minutes / 60)}h {formData.total_minutes % 60}m</Label>
                <Slider
                  value={[formData.total_minutes]}
                  onValueChange={(value) => handleTotalChange(value[0])}
                  min={0}
                  max={720}
                  step={15}
                  className="mt-2"
                />
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Breakdown by Category</h4>
                
                <div>
                  <Label htmlFor="productive">Productive (coding, work, learning): {formData.productive_minutes}m</Label>
                  <Slider
                    value={[formData.productive_minutes]}
                    onValueChange={(value) => setFormData({ ...formData, productive_minutes: value[0] })}
                    min={0}
                    max={formData.total_minutes}
                    step={15}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="social">Social Media: {formData.social_minutes}m</Label>
                  <Slider
                    value={[formData.social_minutes]}
                    onValueChange={(value) => setFormData({ ...formData, social_minutes: value[0] })}
                    min={0}
                    max={formData.total_minutes}
                    step={15}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="entertainment">Entertainment (YouTube, streaming): {formData.entertainment_minutes}m</Label>
                  <Slider
                    value={[formData.entertainment_minutes]}
                    onValueChange={(value) => setFormData({ ...formData, entertainment_minutes: value[0] })}
                    min={0}
                    max={formData.total_minutes}
                    step={15}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="other">Other: {formData.other_minutes}m</Label>
                  <Slider
                    value={[formData.other_minutes]}
                    onValueChange={(value) => setFormData({ ...formData, other_minutes: value[0] })}
                    min={0}
                    max={formData.total_minutes}
                    step={15}
                    className="mt-1"
                  />
                </div>
                
                {totalCategorized !== formData.total_minutes && (
                  <p className="text-xs text-orange-600">
                    Categories total: {totalCategorized}m (differs from total: {formData.total_minutes}m)
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What did you spend time on? Any patterns?"
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Logging...' : 'Log Screen Time'}
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