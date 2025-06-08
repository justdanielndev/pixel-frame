import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

interface BookParams {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: BookParams) {
  try {
    const updates = await request.json()
    const db = getDatabase()
    
    const book = db.updateBook(params.id, updates)
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    return NextResponse.json(book)
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: BookParams) {
  try {
    const db = getDatabase()
    const deleted = db.deleteBook(params.id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}