import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function GET() {
  try {
    const db = getCompanionDatabase()
    const notes = db.getAllNotes()
    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    
    const db = getCompanionDatabase()
    const note = db.createNote(content.trim())
    
    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}