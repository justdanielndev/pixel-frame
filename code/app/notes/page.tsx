'use client'

import { useState, useEffect } from 'react'
import { StickyNote } from 'lucide-react'

interface Note {
  id: string
  content: string
  created_at: string
  updated_at: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadNotes()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (showDeleteConfirm) {
            setShowDeleteConfirm(null)
          } else {
            setSelectedIndex(prev => prev > 0 ? prev - 1 : notes.length - 1)
          }
          break
        case 'ArrowRight':
          if (showDeleteConfirm) {
            setShowDeleteConfirm(null)
          } else {
            setSelectedIndex(prev => prev < notes.length - 1 ? prev + 1 : 0)
          }
          break
        case 'Enter':
          if (showDeleteConfirm) {
            deleteNote(showDeleteConfirm)
          } else if (notes[selectedIndex]) {
            setShowDeleteConfirm(notes[selectedIndex].id)
          }
          break
        case ' ':
          e.preventDefault()
          if (showDeleteConfirm) {
            setShowDeleteConfirm(null)
          } else {
            window.location.href = '/dashboard'
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [notes, selectedIndex, showDeleteConfirm])

  const loadNotes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/companion/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/companion/notes/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        loadNotes()
        setShowDeleteConfirm(null)
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { timeZone: 'Europe/Berlin' })
  }

  if (loading) {
    return (
      <div className="w-screen h-screen bg-white text-black font-mono flex items-center justify-center">
        <div className="text-xl">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-white text-black font-mono flex flex-col">
      <div className="border-b-2 border-gray-300 p-4">
        <div className="flex items-center justify-center max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">Notes</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {notes.length === 0 ? (
            <div className="border-2 border-gray-300 p-12 text-center">
              <StickyNote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No notes yet</h3>
              <p className="text-gray-600">
                Use the companion app to add notes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note, index) => (
                <div key={note.id} className={`border-2 p-4 ${
                  showDeleteConfirm === note.id ? 'border-red-500 bg-red-50' :
                  index === selectedIndex ? 'border-black bg-gray-50' : 'border-gray-300 bg-white'
                }`}>
                  <div>
                    {showDeleteConfirm === note.id ? (
                      <div className="text-center">
                        <p className="text-sm font-medium mb-2">Delete this note?</p>
                        <p className="text-xs text-gray-600 mb-3">Click to Delete, Rotate/Hold to Cancel</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs text-gray-500 font-medium">
                            {formatDate(note.created_at).split(',')[0]}
                          </span>
                          {index === selectedIndex && (
                            <span className="text-xs text-gray-500">Click to Delete</span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                        {note.updated_at !== note.created_at && (
                          <div className="text-xs text-gray-500 mt-2">
                            Updated: {formatDate(note.updated_at)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}