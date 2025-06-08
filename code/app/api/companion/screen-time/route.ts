import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function GET() {
  try {
    const db = getCompanionDatabase()
    const screenTimeRecords = db.getRecentScreenTimeRecords(30)
    return NextResponse.json(screenTimeRecords)
  } catch (error) {
    console.error('Error getting screen time records:', error)
    return NextResponse.json({ error: 'Failed to get screen time records' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const screenTimeData = await request.json()
    
    if (!screenTimeData.date || !screenTimeData.total_minutes) {
      return NextResponse.json({ 
        error: 'Date and total minutes are required' 
      }, { status: 400 })
    }
    
    const db = getCompanionDatabase()
    const screenTimeRecord = db.upsertScreenTimeRecord(screenTimeData)
    
    return NextResponse.json(screenTimeRecord, { status: 201 })
  } catch (error) {
    console.error('Error logging screen time:', error)
    return NextResponse.json({ error: 'Failed to log screen time' }, { status: 500 })
  }
}