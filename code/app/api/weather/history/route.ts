import { NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function GET() {
  try {
    const db = getCompanionDatabase()
    const weatherHistory = db.getRecentWeatherRecords(100) // Get last 100 records
    
    return NextResponse.json(weatherHistory)
  } catch (error) {
    console.error('Error fetching weather history:', error)
    return NextResponse.json({ error: 'Failed to fetch weather history' }, { status: 500 })
  }
}