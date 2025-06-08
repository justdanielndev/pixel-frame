import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function POST(request: NextRequest) {
  try {
    const studyData = await request.json()
    
    if (!studyData.date || !studyData.start_time || !studyData.end_time || !studyData.subject) {
      return NextResponse.json({ 
        error: 'Date, start time, end time, and subject are required' 
      }, { status: 400 })
    }
    
    const db = getCompanionDatabase()
    const studySession = db.createStudySession(studyData)
    
    return NextResponse.json(studySession, { status: 201 })
  } catch (error) {
    console.error('Error logging study session:', error)
    return NextResponse.json({ error: 'Failed to log study session' }, { status: 500 })
  }
}