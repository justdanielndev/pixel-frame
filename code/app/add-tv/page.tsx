'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Tv } from 'lucide-react'

export default function AddTvPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'series' as 'series' | 'movie' | 'documentary' | 'anime' | 'other',
    status: 'watching' as 'watching' | 'completed' | 'paused' | 'plan_to_watch' | 'dropped',
    current_episode: '',
    total_episodes: '',
    rating: '',
    notes: '',
    genre: '',
    platform: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/companion/tv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          current_episode: formData.current_episode ? parseInt(formData.current_episode) : undefined,
          total_episodes: formData.total_episodes ? parseInt(formData.total_episodes) : undefined,
          rating: formData.rating ? parseInt(formData.rating) : undefined
        })
      })

      if (response.ok) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to add TV show:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add TV Show/Movie</h1>
            <p className="text-muted-foreground">Add a new show or movie to your watchlist</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tv className="w-5 h-5" />
              Show/Movie Details
            </CardTitle>
            <CardDescription>
              Fill out the information for your new show or movie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Good Girl's Guide to Murder, She-Ra, etc."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select 
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'series' | 'movie' | 'documentary' | 'anime' | 'other' })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="series">TV Series</option>
                    <option value="movie">Movie</option>
                    <option value="documentary">Documentary</option>
                    <option value="anime">Anime</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'watching' | 'completed' | 'paused' | 'plan_to_watch' | 'dropped' })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="watching">Currently Watching</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="plan_to_watch">Plan to Watch</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>
              </div>
              
              {formData.type === 'series' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="current_episode">Current Episode</Label>
                    <Input
                      id="current_episode"
                      type="number"
                      value={formData.current_episode}
                      onChange={(e) => setFormData({ ...formData, current_episode: e.target.value })}
                      placeholder="5"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="total_episodes">Total Episodes</Label>
                    <Input
                      id="total_episodes"
                      type="number"
                      value={formData.total_episodes}
                      onChange={(e) => setFormData({ ...formData, total_episodes: e.target.value })}
                      placeholder="6"
                      min="1"
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <select 
                    id="rating"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Rate it</option>
                    <option value="1">1 ⭐</option>
                    <option value="2">2 ⭐⭐</option>
                    <option value="3">3 ⭐⭐⭐</option>
                    <option value="4">4 ⭐⭐⭐⭐</option>
                    <option value="5">5 ⭐⭐⭐⭐⭐</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Input
                    id="platform"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    placeholder="Netflix, HBO, etc."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  placeholder="Mystery, Animation, Drama, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Your thoughts, where you left off, etc."
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Adding...' : 'Add to List'}
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