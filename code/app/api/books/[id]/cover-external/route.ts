import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import { fetchAndConvertImage } from '@/lib/image-utils'

interface CoverExternalRequest {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: CoverExternalRequest) {
  try {
    const bookId = params.id
    
    const db = getDatabase()
    const books = db.getAllBooks()
    const book = books.find(b => b.id === bookId)
    
    if (!book || !book.cover_url) {
      return NextResponse.json({ error: 'Book or cover URL not found' }, { status: 404 })
    }
    
    const bwImage = await fetchAndConvertImage(book.cover_url)
    
    if (!bwImage) {
      return NextResponse.json({ error: 'Failed to fetch or convert cover' }, { status: 500 })
    }
    
    return new NextResponse(bwImage, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
    
  } catch (error) {
    console.error('Error serving external cover:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}