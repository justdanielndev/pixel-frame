import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json()
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    
    const db = getCompanionDatabase()
    const note = db.updateNote(params.id, content.trim())
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    return NextResponse.json(note)
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getCompanionDatabase()
    const deleted = db.deleteNote(params.id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}