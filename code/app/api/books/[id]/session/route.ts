import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

interface SessionRequest {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: SessionRequest) {
  try {
    const { action, page, sessionId } = await request.json()
    const bookId = params.id
    
    const db = getDatabase()
    
    if (action === 'start') {
      const newSessionId = db.startReadingSession(bookId, page)
      return NextResponse.json({ sessionId: newSessionId })
    } else if (action === 'end' && sessionId) {
      db.endReadingSession(sessionId, page)
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing reading session:', error)
    return NextResponse.json({ error: 'Failed to manage session' }, { status: 500 })
  }
}