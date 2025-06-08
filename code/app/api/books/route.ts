import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { getDatabase } from '@/lib/database'
import { BookMetadataService } from '@/lib/book-metadata'
import { EpubParser } from '@/lib/epub-parser'

interface EpubFile {
  id: string
  title: string
  author: string
  filename: string
  lastRead?: Date
  currentPage?: number
  totalPages?: number
  filePath: string
  description?: string
  cover_url?: string
  readingTimeRemaining?: number
  percentComplete?: number
}

const EPUB_FOLDER = process.env.EPUB_FOLDER || '/workspaces/screenui/books'

export async function GET() {
  try {
    const db = getDatabase()
    
    const files = await readdir(EPUB_FOLDER)
    const epubFiles = files.filter(file => file.toLowerCase().endsWith('.epub'))
    
    const books: EpubFile[] = []
    
    for (const filename of epubFiles) {
      const filePath = join(EPUB_FOLDER, filename)
      const stats = await stat(filePath)
      
      let bookRecord = db.getBookByFilename(filename)
      
      if (!bookRecord) {
        const parsed = BookMetadataService.parseFilename(filename)
        const isbn = BookMetadataService.extractISBNFromEpub(filename)
        
        let pageCount = 1 // (fallback)
        try {
          const epubContent = await EpubParser.parseEpub(filePath)
          pageCount = epubContent.totalPages
        } catch (error) {
          console.warn(`Failed to parse EPUB ${filename}:`, error)
        }

        bookRecord = db.upsertBook({
          id: Buffer.from(filename).toString('base64'),
          filename,
          title: parsed.title,
          author: parsed.author || 'Unknown Author',
          isbn,
          page_count: pageCount,
          current_page: 1,
          last_read: stats.mtime,
          metadata_fetched: false
        })
        
        fetchBookMetadata(bookRecord, parsed.title, parsed.author, isbn)
        
      }
      
      const readingTime = db.estimateReadingTime(bookRecord.id)
      const percentComplete = Math.round((bookRecord.current_page / bookRecord.page_count) * 100)
      
      const book: EpubFile = {
        id: bookRecord.id,
        title: bookRecord.title,
        author: bookRecord.author,
        filename: bookRecord.filename,
        filePath,
        lastRead: bookRecord.last_read,
        currentPage: bookRecord.current_page,
        totalPages: bookRecord.page_count,
        description: bookRecord.description,
        cover_url: bookRecord.cover_url,
        readingTimeRemaining: readingTime.remainingMinutes,
        percentComplete
      }
      
      books.push(book)
    }
    
    books.sort((a, b) => {
      const aTime = a.lastRead?.getTime() || 0
      const bTime = b.lastRead?.getTime() || 0
      return bTime - aTime
    })
    
    return NextResponse.json({ books })
  } catch (error) {
    console.error('Error scanning EPUB folder:', error)
    
    return NextResponse.json({ books: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookData = await request.json()
    
    if (!bookData.title || !bookData.author) {
      return NextResponse.json({ 
        error: 'Title and author are required' 
      }, { status: 400 })
    }
    
    const db = getDatabase()
    
    const filename = `manual_${Date.now()}_${bookData.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.manual`
    
    const bookRecord = {
      id: Buffer.from(filename).toString('base64'),
      filename,
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn || null,
      description: bookData.description || null,
      cover_url: bookData.cover_url || null,
      page_count: bookData.page_count || 100,
      current_page: 1,
      last_read: new Date(),
      metadata_fetched: true
    }
    
    const createdBook = db.upsertBook(bookRecord)
    
    return NextResponse.json(createdBook, { status: 201 })
  } catch (error) {
    console.error('Error adding manual book:', error)
    return NextResponse.json({ error: 'Failed to add book' }, { status: 500 })
  }
}

async function fetchBookMetadata(bookRecord: any, title: string, author?: string, isbn?: string) {
  try {
    if (bookRecord.metadata_fetched) return
    
    let metadata = null
    
    if (isbn) {
      metadata = await BookMetadataService.searchByISBN(isbn)
    }
    
    if (!metadata) {
      metadata = await BookMetadataService.searchByTitle(title, author)
    }
    
    if (metadata) {
      const db = getDatabase()
      db.upsertBook({
        ...bookRecord,
        title: metadata.title,
        author: metadata.author,
        isbn: metadata.isbn,
        description: metadata.description,
        cover_url: metadata.cover_url,
        page_count: metadata.page_count || bookRecord.page_count,
        metadata_fetched: true
      })
    }
  } catch (error) {
    console.error('Error fetching metadata for book:', title, error)
  }
}