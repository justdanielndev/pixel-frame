import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function POST(request: NextRequest) {
  try {
    const sleepData = await request.json()
    
    if (!sleepData.date || !sleepData.bedtime) {
      return NextResponse.json({ error: 'Date and bedtime are required' }, { status: 400 })
    }
    
    const db = getCompanionDatabase()
    const sleepRecord = db.upsertSleepRecord(sleepData)
    
    return NextResponse.json(sleepRecord, { status: 201 })
  } catch (error) {
    console.error('Error logging sleep:', error)
    return NextResponse.json({ error: 'Failed to log sleep' }, { status: 500 })
  }
}