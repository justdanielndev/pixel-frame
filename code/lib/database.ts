import Database from 'better-sqlite3'
import { join } from 'path'

export interface BookRecord {
  id: string
  filename?: string
  title: string
  author: string
  isbn?: string
  description?: string
  cover_url?: string
  page_count: number
  current_page: number
  last_read?: Date | null
  reading_sessions: ReadingSession[]
  metadata_fetched?: boolean
  metadata?: any
  created_at: Date
  updated_at: Date
}

export interface ReadingSession {
  id: string
  book_id: string
  start_page: number
  end_page: number
  start_time: Date
  end_time: Date
  words_per_minute?: number
}

export interface UserStats {
  id: string
  total_books_read: number
  total_pages_read: number
  average_wpm: number
  total_reading_time_minutes: number
  updated_at: Date
}

class BookDatabase {
  private db: Database.Database

  constructor() {
    const dbPath = process.env.DB_PATH || join(process.cwd(), 'data', 'books.db')
    
    const fs = require('fs')
    const path = require('path')
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    
    this.db = new Database(dbPath)
    this.initializeTables()
  }

  private initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        isbn TEXT,
        description TEXT,
        cover_url TEXT,
        page_count INTEGER NOT NULL DEFAULT 0,
        current_page INTEGER NOT NULL DEFAULT 1,
        last_read DATETIME,
        metadata_fetched INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reading_sessions (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        start_page INTEGER NOT NULL,
        end_page INTEGER NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        words_per_minute REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books (id)
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id TEXT PRIMARY KEY DEFAULT 'default',
        total_books_read INTEGER DEFAULT 0,
        total_pages_read INTEGER DEFAULT 0,
        average_wpm REAL DEFAULT 0,
        total_reading_time_minutes INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_books_filename ON books(filename)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_books_last_read ON books(last_read)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions(book_id)`)
  }

  upsertBook(book: Partial<BookRecord>): BookRecord {
    const now = new Date().toISOString()
    
    const stmt = this.db.prepare(`
      INSERT INTO books (
        id, filename, title, author, isbn, description, cover_url, 
        page_count, current_page, last_read, metadata_fetched, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(filename) DO UPDATE SET
        title = excluded.title,
        author = excluded.author,
        isbn = excluded.isbn,
        description = excluded.description,
        cover_url = excluded.cover_url,
        page_count = excluded.page_count,
        current_page = excluded.current_page,
        last_read = excluded.last_read,
        metadata_fetched = excluded.metadata_fetched,
        updated_at = excluded.updated_at
    `)

    stmt.run(
      book.id || this.generateId(),
      book.filename,
      book.title,
      book.author,
      book.isbn || null,
      book.description || null,
      book.cover_url || null,
      book.page_count || 0,
      book.current_page || 1,
      book.last_read ? book.last_read.toISOString() : null,
      book.metadata_fetched ? 1 : 0,
      book.created_at ? book.created_at.toISOString() : now,
      now
    )

    return this.getBookByFilename(book.filename!)!
  }

  getBookByFilename(filename: string): BookRecord | null {
    const stmt = this.db.prepare('SELECT * FROM books WHERE filename = ?')
    const row = stmt.get(filename) as any
    
    if (!row) return null
    
    return {
      ...row,
      last_read: row.last_read ? new Date(row.last_read) : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      metadata_fetched: Boolean(row.metadata_fetched),
      reading_sessions: this.getReadingSessionsForBook(row.id)
    }
  }

  getAllBooks(): BookRecord[] {
    const stmt = this.db.prepare('SELECT * FROM books ORDER BY last_read DESC, created_at DESC')
    const rows = stmt.all() as any[]
    
    return rows.map(row => ({
      ...row,
      last_read: row.last_read ? new Date(row.last_read) : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      metadata_fetched: Boolean(row.metadata_fetched),
      reading_sessions: this.getReadingSessionsForBook(row.id)
    }))
  }

  updateBookProgress(bookId: string, currentPage: number): void {
    const stmt = this.db.prepare(`
      UPDATE books 
      SET current_page = ?, last_read = ?, updated_at = ?
      WHERE id = ?
    `)
    stmt.run(currentPage, new Date().toISOString(), new Date().toISOString(), bookId)
  }

  startReadingSession(bookId: string, startPage: number): string {
    const sessionId = this.generateId()
    const stmt = this.db.prepare(`
      INSERT INTO reading_sessions (id, book_id, start_page, end_page, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const now = new Date().toISOString()
    stmt.run(sessionId, bookId, startPage, startPage, now, now)
    return sessionId
  }

  endReadingSession(sessionId: string, endPage: number): void {
    const stmt = this.db.prepare(`
      UPDATE reading_sessions 
      SET end_page = ?, end_time = ?
      WHERE id = ?
    `)
    stmt.run(endPage, new Date().toISOString(), sessionId)
  }

  recordPageReadingTime(sessionId: string, page: number, timeMs: number): void {
    const wordsPerPage = 250
    const minutes = timeMs / (1000 * 60)
    const wpm = minutes > 0 ? Math.round(wordsPerPage / minutes) : 0
    
    const stmt = this.db.prepare(`
      UPDATE reading_sessions 
      SET words_per_minute = (
        CASE 
          WHEN words_per_minute IS NULL THEN ?
          ELSE (words_per_minute + ?) / 2  -- Average with existing WPM
        END
      )
      WHERE id = ?
    `)
    stmt.run(wpm, wpm, sessionId)
  }

  getReadingSessionsForBook(bookId: string): ReadingSession[] {
    const stmt = this.db.prepare('SELECT * FROM reading_sessions WHERE book_id = ? ORDER BY start_time DESC')
    const rows = stmt.all(bookId) as any[]
    
    return rows.map(row => ({
      ...row,
      start_time: new Date(row.start_time),
      end_time: new Date(row.end_time)
    }))
  }

  getUserStats(): UserStats {
    const stmt = this.db.prepare('SELECT * FROM user_stats WHERE id = ?')
    let stats = stmt.get('default') as any
    
    if (!stats) {
      const insertStmt = this.db.prepare(`
        INSERT INTO user_stats (id) VALUES ('default')
      `)
      insertStmt.run()
      stats = stmt.get('default')
    }
    
    return {
      ...stats,
      updated_at: new Date(stats.updated_at)
    }
  }

  calculateReadingSpeed(bookId: string): number {
    const sessions = this.getReadingSessionsForBook(bookId)
    if (sessions.length === 0) return 250
    
    let totalWords = 0
    let totalMinutes = 0
    
    sessions.forEach(session => {
      const pages = session.end_page - session.start_page + 1
      const minutes = (session.end_time.getTime() - session.start_time.getTime()) / (1000 * 60)
      const estimatedWords = pages * 250
      
      totalWords += estimatedWords
      totalMinutes += minutes
    })
    
    return totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 250
  }

  estimateReadingTime(bookId: string): { remainingMinutes: number, totalMinutes: number } {
    const book = this.db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as any
    if (!book) return { remainingMinutes: 0, totalMinutes: 0 }
    
    const wpm = this.calculateReadingSpeed(bookId)
    const wordsPerPage = 250
    const totalWords = book.page_count * wordsPerPage
    const remainingWords = (book.page_count - book.current_page + 1) * wordsPerPage
    
    return {
      remainingMinutes: Math.round(remainingWords / wpm),
      totalMinutes: Math.round(totalWords / wpm)
    }
  }

  getBookById(id: string): BookRecord | null {
    const stmt = this.db.prepare('SELECT * FROM books WHERE id = ?')
    const row = stmt.get(id) as any
    
    if (!row) return null
    
    return {
      ...row,
      last_read: row.last_read ? new Date(row.last_read) : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      metadata_fetched: Boolean(row.metadata_fetched),
      reading_sessions: this.getReadingSessionsForBook(row.id)
    }
  }

  updateBook(id: string, updates: Partial<BookRecord>): BookRecord | null {
    const current = this.getBookById(id)
    if (!current) return null
    
    const now = new Date().toISOString()
    
    const stmt = this.db.prepare(`
      UPDATE books 
      SET title = ?, author = ?, isbn = ?, description = ?, cover_url = ?, 
          page_count = ?, current_page = ?, updated_at = ?
      WHERE id = ?
    `)
    
    stmt.run(
      updates.title || current.title,
      updates.author || current.author,
      updates.isbn || current.isbn,
      updates.description || current.description,
      updates.cover_url || current.cover_url,
      updates.page_count !== undefined ? updates.page_count : current.page_count,
      updates.current_page !== undefined ? updates.current_page : current.current_page,
      now,
      id
    )
    
    return this.getBookById(id)
  }

  deleteBook(id: string): boolean {
    // First, delete all reading sessions for this book
    const deleteSessionsStmt = this.db.prepare('DELETE FROM reading_sessions WHERE book_id = ?')
    deleteSessionsStmt.run(id)
    
    // Then delete the book
    const deleteBookStmt = this.db.prepare('DELETE FROM books WHERE id = ?')
    const result = deleteBookStmt.run(id)
    return result.changes > 0
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  close(): void {
    this.db.close()
  }
}

let dbInstance: BookDatabase | null = null

export function getDatabase(): BookDatabase {
  if (!dbInstance) {
    dbInstance = new BookDatabase()
  }
  return dbInstance
}

export default BookDatabase