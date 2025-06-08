import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import { BookMetadataService } from '@/lib/book-metadata'

interface MetadataRequest {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: MetadataRequest) {
  try {
    const bookId = params.id
    
    const db = getDatabase()
    const books = db.getAllBooks()
    const book = books.find(b => b.id === bookId)
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    const parsed = BookMetadataService.parseFilename(book.filename)
    const isbn = BookMetadataService.extractISBNFromEpub(book.filename)
    
    let metadata = null
    
    if (isbn) {
      metadata = await BookMetadataService.searchByISBN(isbn)
    }
    
    if (!metadata) {
      metadata = await BookMetadataService.searchByTitle(parsed.title, parsed.author)
    }
    
    if (metadata) {
      const updatedBook = db.upsertBook({
        ...book,
        title: metadata.title,
        author: metadata.author,
        isbn: metadata.isbn,
        description: metadata.description,
        cover_url: metadata.cover_url,
        page_count: metadata.page_count || book.page_count,
        metadata_fetched: true
      })
      
      return NextResponse.json({ 
        success: true, 
        metadata: {
          title: updatedBook.title,
          author: updatedBook.author,
          description: updatedBook.description,
          cover_url: updatedBook.cover_url,
          isbn: updatedBook.isbn
        }
      })
    } else {
      return NextResponse.json({ 
        error: 'No metadata found',
        message: 'Could not find metadata for this book online'
      }, { status: 404 })
    }
    
  } catch (error) {
    console.error('Error refetching metadata:', error)
    return NextResponse.json({ 
      error: 'Failed to refetch metadata',
      message: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: MetadataRequest) {
  try {
    const bookId = params.id
    
    const db = getDatabase()
    const books = db.getAllBooks()
    const book = books.find(b => b.id === bookId)
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      title: book.title,
      author: book.author,
      description: book.description,
      cover_url: book.cover_url,
      isbn: book.isbn,
      filename: book.filename,
      metadata_fetched: book.metadata_fetched,
      created_at: book.created_at,
      updated_at: book.updated_at
    })
    
  } catch (error) {
    console.error('Error getting metadata:', error)
    return NextResponse.json({ 
      error: 'Failed to get metadata' 
    }, { status: 500 })
  }
}

