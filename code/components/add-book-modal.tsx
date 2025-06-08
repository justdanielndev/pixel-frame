'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

interface AddBookModalProps {
  onBookAdded: () => void
}

export default function AddBookModal({ onBookAdded }: AddBookModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    cover_url: '',
    page_count: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.author) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          page_count: formData.page_count ? parseInt(formData.page_count) : undefined
        })
      })

      if (response.ok) {
        setFormData({
          title: '',
          author: '',
          isbn: '',
          description: '',
          cover_url: '',
          page_count: ''
        })
        setOpen(false)
        onBookAdded()
      } else {
        console.error('Failed to add book')
      }
    } catch (error) {
      console.error('Error adding book:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Book Manually</DialogTitle>
          <DialogDescription>
            Add a book to track your reading progress (without epub file)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Book title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Author name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="isbn">ISBN (optional)</Label>
            <Input
              id="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="978-0123456789"
            />
          </div>
          
          <div>
            <Label htmlFor="page_count">Page Count (optional)</Label>
            <Input
              id="page_count"
              type="number"
              value={formData.page_count}
              onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
              placeholder="Number of pages"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Book description"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="cover_url">Cover URL (optional)</Label>
            <Input
              id="cover_url"
              value={formData.cover_url}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
              placeholder="https://example.com/cover.jpg"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.author}
              className="flex-1"
            >
              {loading ? 'Adding...' : 'Add Book'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}