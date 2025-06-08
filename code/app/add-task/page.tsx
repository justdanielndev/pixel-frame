'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function AddTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/companion/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.back()
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <PageHeader title="Add New Task" showBack />
      
      <div className="px-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select 
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="due_time">Due Time (optional)</Label>
                <Input
                  id="due_time"
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                  placeholder="Select time"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., School, Personal, Work"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Task'}
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