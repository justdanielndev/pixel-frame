import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

interface ProgressRequest {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: ProgressRequest) {
  try {
    const { currentPage, sessionId, timeOnPage, previousPage } = await request.json()
    const bookId = params.id
    
    const db = getDatabase()
    
    db.updateBookProgress(bookId, currentPage)
    
    if (sessionId) {
      db.endReadingSession(sessionId, currentPage)
    }
    
    if (timeOnPage && previousPage && sessionId) {
      db.recordPageReadingTime(sessionId, previousPage, timeOnPage)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating reading progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: ProgressRequest) {
  try {
    const bookId = params.id
    const db = getDatabase()
    
    const book = db.getAllBooks().find(b => b.id === bookId)
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    const readingTime = db.estimateReadingTime(bookId)
    const readingSpeed = db.calculateReadingSpeed(bookId)
    
    return NextResponse.json({
      currentPage: book.current_page,
      totalPages: book.page_count,
      percentComplete: Math.round((book.current_page / book.page_count) * 100),
      readingTimeRemaining: readingTime.remainingMinutes,
      totalReadingTime: readingTime.totalMinutes,
      averageWPM: readingSpeed,
      lastRead: book.last_read
    })
  } catch (error) {
    console.error('Error getting reading progress:', error)
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 })
  }
}

