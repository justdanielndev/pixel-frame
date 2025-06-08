'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Play } from 'lucide-react'
import EpubReader from '@/components/epub-reader'

interface Book {
  id: string
  title: string
  author: string
  filename: string
  filePath: string
  lastRead?: Date
  currentPage?: number
  totalPages?: number
  description?: string
  cover_url?: string
  readingTimeRemaining?: number
  percentComplete?: number
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedBook) return
      
      switch (e.key) {
        case 'ArrowLeft':
          setSelectedIndex(prev => prev > 0 ? prev - 1 : books.length - 1)
          break
        case 'ArrowRight':
          setSelectedIndex(prev => prev < books.length - 1 ? prev + 1 : 0)
          break
        case 'Enter':
          if (books[selectedIndex]) {
            setSelectedBook(books[selectedIndex])
          }
          break
        case ' ':
          e.preventDefault()
          window.location.href = '/dashboard'
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [books, selectedIndex, selectedBook])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
      }
    } catch (error) {
      console.error('Failed to load books:', error)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  if (selectedBook) {
    return <EpubReader initialBook={selectedBook.filename} />
  }

  if (loading) {
    return (
      <div className="w-screen h-screen bg-white text-black font-mono flex items-center justify-center">
        <div className="text-xl">Loading books...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-white text-black font-mono flex flex-col">
      <div className="border-b-2 border-gray-300 p-4">
        <div className="flex items-center justify-center max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">Books</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {books.length === 0 ? (
            <div className="border-2 border-gray-300 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No books yet</h3>
              <p className="text-gray-600">
                Use the companion app to add books.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book, index) => (
                <div key={book.id} className={`border-2 p-4 bg-white ${
                  index === selectedIndex ? 'border-black bg-gray-50' : 'border-gray-300'
                }`}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      {book.cover_url ? (
                        <img 
                          src={book.cover_url} 
                          alt={`${book.title} cover`}
                          className="w-16 h-24 object-cover border border-gray-300 flex-shrink-0 shadow-sm"
                          style={{ aspectRatio: '2/3' }}
                        />
                      ) : (
                        <div className="w-16 h-24 border-2 border-gray-300 bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm" style={{ aspectRatio: '2/3' }}>
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm leading-tight mb-1">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">
                          {book.author}
                        </p>
                        <p className="text-xs text-gray-500">
                          {book.percentComplete || 0}% complete
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 h-2 mb-1">
                        <div 
                          className="bg-gray-600 h-2" 
                          style={{ width: `${book.percentComplete || 0}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Page {book.currentPage || 1} of {book.totalPages || 1}
                      </div>
                    </div>
                    
                    {book.lastRead && (
                      <div className="text-xs text-gray-500 mb-3">
                        Last read: {new Date(book.lastRead).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="mt-auto flex items-center justify-center">
                      <Play className="w-5 h-5 text-gray-600" />
                      <span className="ml-1 text-sm text-gray-600">Click to Read</span>
                    </div>
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