import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'
import { EpubParser } from '@/lib/epub-parser'

interface ContentRequest {
  params: {
    id: string
  }
}

const epubCache = new Map<string, any>()

export async function GET(request: NextRequest, { params }: ContentRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const bookId = params.id
    
    const db = getDatabase()
    const books = db.getAllBooks()
    const book = books.find(b => b.id === bookId)
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    const EPUB_FOLDER = process.env.EPUB_FOLDER || '/workspaces/screenui/books'
    const filePath = `${EPUB_FOLDER}/${book.filename}`
    
    let epubContent = epubCache.get(bookId)
    
    if (!epubContent) {
      try {
        console.log('Parsing EPUB:', filePath)
        epubContent = await EpubParser.parseEpub(filePath)
        epubCache.set(bookId, epubContent)
        
        if (epubContent.totalPages !== book.page_count) {
          db.upsertBook({
            ...book,
            page_count: epubContent.totalPages
          })
        }
      } catch (error) {
        console.error('Failed to parse EPUB:', error)
        return NextResponse.json({ 
          error: 'Failed to read book content',
          content: 'Unable to load book content. Please check if the EPUB file is valid.',
          page,
          totalPages: book.page_count || 1
        })
      }
    }
    
    const content = EpubParser.getPageContent(epubContent.chapters, page, epubContent.pageBreaks, epubContent.wordsPerPage)
    
    return NextResponse.json({ 
      content,
      page,
      totalPages: epubContent.totalPages,
      chapter: epubContent.chapters.find(ch => {
        const chapterStartPage = Math.floor(
          epubContent.chapters.slice(0, epubContent.chapters.indexOf(ch))
            .reduce((sum, c) => sum + EpubParser.countWords(c.content), 0) / epubContent.wordsPerPage
        ) + 1
        const chapterEndPage = chapterStartPage + Math.floor(EpubParser.countWords(ch.content) / epubContent.wordsPerPage)
        return page >= chapterStartPage && page <= chapterEndPage
      })?.title
    })
    
  } catch (error) {
    console.error('Error reading EPUB content:', error)
    
    return NextResponse.json({ 
      error: 'Internal server error',
      content: 'Failed to load book content.',
      page: parseInt(new URL(request.url).searchParams.get('page') || '1'),
      totalPages: 1
    }, { status: 500 })
  }
}