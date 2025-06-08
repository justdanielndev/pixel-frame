import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

interface ScreenTimeParams {
  params: {
    id: string
  }
}

export async function DELETE(request: NextRequest, { params }: ScreenTimeParams) {
  try {
    const db = getCompanionDatabase()
    const deleted = db.deleteScreenTimeRecord(params.id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Screen time record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting screen time record:', error)
    return NextResponse.json({ error: 'Failed to delete screen time record' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: ScreenTimeParams) {
  try {
    const updates = await request.json()
    const db = getCompanionDatabase()
    
    const screenTime = db.updateScreenTimeRecord(params.id, updates)
    
    if (!screenTime) {
      return NextResponse.json({ error: 'Screen time record not found' }, { status: 404 })
    }
    
    return NextResponse.json(screenTime)
  } catch (error) {
    console.error('Error updating screen time record:', error)
    return NextResponse.json({ error: 'Failed to update screen time record' }, { status: 500 })
  }
}