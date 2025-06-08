import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

interface TVParams {
  params: {
    id: string
  }
}

export async function DELETE(request: NextRequest, { params }: TVParams) {
  try {
    const tvId = params.id
    const db = getCompanionDatabase()
    
    const deleted = db.deleteTVShow(tvId)
    
    if (!deleted) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting TV show:', error)
    return NextResponse.json({ error: 'Failed to delete TV show' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: TVParams) {
  try {
    const updates = await request.json()
    const db = getCompanionDatabase()
    
    const tvShow = db.updateTVShow(params.id, updates)
    
    if (!tvShow) {
      return NextResponse.json({ error: 'TV show not found' }, { status: 404 })
    }
    
    return NextResponse.json(tvShow)
  } catch (error) {
    console.error('Error updating TV show:', error)
    return NextResponse.json({ error: 'Failed to update TV show' }, { status: 500 })
  }
}