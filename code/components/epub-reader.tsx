'use client'

import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'

interface EpubReaderProps {
  initialBook?: string
}


export default function EpubReader({ initialBook }: EpubReaderProps) {
  const [content, setContent] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (initialBook) {
      loadBook()
    }
  }, [initialBook])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (currentPage > 1) {
            setCurrentPage(prev => prev - 1)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1)
          }
          break
        case ' ':
          e.preventDefault()
          // Save current progress before leaving
          saveProgress(currentPage)
          window.location.href = '/books'
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages])

  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (currentPage) {
        saveProgress(currentPage)
      }
    }
  }, [currentPage])

  const loadBook = async () => {
    if (!initialBook) return
    
    setLoading(true)
    try {
      // Get book metadata
      const booksResponse = await fetch('/api/books')
      if (booksResponse.ok) {
        const booksData = await booksResponse.json()
        const book = booksData.books?.find((b: any) => b.filename === initialBook)
        
        if (book) {
          setBookTitle(book.title)
          setBookAuthor(book.author)
          setCurrentPage(book.currentPage || 1)
          
          // Get book content
          const contentResponse = await fetch(`/api/books/${book.id}/content?page=${book.currentPage || 1}`)
          if (contentResponse.ok) {
            const contentData = await contentResponse.json()
            setContent(contentData.content || 'Content not available')
            setTotalPages(book.totalPages || 1)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load book:', error)
      setContent('Failed to load book content')
    } finally {
      setLoading(false)
    }
  }

  const loadPage = async (pageNum: number) => {
    if (!initialBook) return
    
    try {
      const booksResponse = await fetch('/api/books')
      if (booksResponse.ok) {
        const booksData = await booksResponse.json()
        const book = booksData.books?.find((b: any) => b.filename === initialBook)
        
        if (book) {
          const contentResponse = await fetch(`/api/books/${book.id}/content?page=${pageNum}`)
          if (contentResponse.ok) {
            const contentData = await contentResponse.json()
            setContent(contentData.content || `Page ${pageNum} content not available`)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load page:', error)
      setContent(`Failed to load page ${pageNum}`)
    }
  }

  const saveProgress = async (pageNum: number) => {
    if (!initialBook) return
    
    try {
      const booksResponse = await fetch('/api/books')
      if (booksResponse.ok) {
        const booksData = await booksResponse.json()
        const book = booksData.books?.find((b: any) => b.filename === initialBook)
        
        if (book) {
          // Save to books database using correct API
          await fetch(`/api/books/${book.id}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPage: pageNum })
          })
        }
      }
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  useEffect(() => {
    if (currentPage && !loading) {
      loadPage(currentPage)
      saveProgress(currentPage)
    }
  }, [currentPage])


  if (loading) {
    return (
      <div className="w-screen h-screen bg-white text-black font-mono flex items-center justify-center">
        <div className="text-xl">Loading book...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-white text-black font-mono flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-gray-300 p-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold">{bookTitle}</h1>
              <p className="text-sm text-gray-600">{bookAuthor}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="max-w-5xl mx-auto h-full">
          <div className="border-2 border-gray-300 p-4 bg-white h-full overflow-hidden">
            <div 
              className="font-serif text-sm leading-relaxed h-full overflow-hidden"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>

    </div>
  )
}