import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import { EpubParser } from '@/lib/epub-parser'
import { convertToBlackAndWhite } from '@/lib/image-utils'

interface CoverRequest {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: CoverRequest) {
  try {
    const bookId = params.id
    
    const db = getDatabase()
    const books = db.getAllBooks()
    const book = books.find(b => b.id === bookId)
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    const EPUB_FOLDER = process.env.EPUB_FOLDER || '/workspaces/screenui/books'
    const filePath = `${EPUB_FOLDER}/${book.filename}`
    
    try {
      const coverImage = await EpubParser.extractCoverImage(filePath)
      
      if (!coverImage) {
        return NextResponse.json({ error: 'Cover not found' }, { status: 404 })
      }
      
      const bwImage = await convertToBlackAndWhite(coverImage)
      
      return new NextResponse(bwImage, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000'
        }
      })
    } catch (error) {
      console.error('Error extracting cover:', error)
      return NextResponse.json({ error: 'Failed to extract cover' }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error serving cover:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}