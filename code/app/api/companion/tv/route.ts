import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function GET() {
  try {
    const db = getCompanionDatabase()
    const tvShows = db.getAllTVShows()
    return NextResponse.json(tvShows)
  } catch (error) {
    console.error('Error getting TV shows:', error)
    return NextResponse.json({ error: 'Failed to get TV shows' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const tvData = await request.json()
    
    if (!tvData.title || !tvData.type || !tvData.status) {
      return NextResponse.json({ 
        error: 'Title, type, and status are required' 
      }, { status: 400 })
    }
    
    const db = getCompanionDatabase()
    const tvShow = db.createTVShow(tvData)
    
    return NextResponse.json(tvShow, { status: 201 })
  } catch (error) {
    console.error('Error adding TV show:', error)
    return NextResponse.json({ error: 'Failed to add TV show' }, { status: 500 })
  }
}