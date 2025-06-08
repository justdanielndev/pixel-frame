import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function GET() {
  try {
    const db = getCompanionDatabase()
    const environment = db.getEnvironmentSettings()
    
    return NextResponse.json(environment || {
      home_temperature: 22,
      home_humidity: 45,
      air_quality: 'good',
      blinds_position: 60,
      lights_brightness: 40
    })
  } catch (error) {
    console.error('Error getting environment:', error)
    return NextResponse.json({ error: 'Failed to get environment' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const environmentData = await request.json()
    
    const db = getCompanionDatabase()
    const environment = db.updateEnvironmentSettings(environmentData)
    
    return NextResponse.json(environment, { status: 200 })
  } catch (error) {
    console.error('Error updating environment:', error)
    return NextResponse.json({ error: 'Failed to update environment' }, { status: 500 })
  }
}