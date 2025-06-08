export interface BookMetadata {
  title: string
  author: string
  isbn?: string
  description?: string
  cover_url?: string
  page_count?: number
  published_year?: number
  publisher?: string
}

export class BookMetadataService {
  private static readonly OPEN_LIBRARY_BASE = 'https://openlibrary.org'
  private static readonly GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1/volumes'

  static async searchByTitle(title: string, author?: string): Promise<BookMetadata | null> {
    try {
      const openLibraryResult = await this.searchOpenLibrary(title, author)
      if (openLibraryResult) return openLibraryResult

      const googleBooksResult = await this.searchGoogleBooks(title, author)
      if (googleBooksResult) return googleBooksResult

      return null
    } catch (error) {
      console.error('Error fetching book metadata:', error)
      return null
    }
  }

  static async searchByISBN(isbn: string): Promise<BookMetadata | null> {
    try {
      const openLibraryResult = await this.searchOpenLibraryByISBN(isbn)
      if (openLibraryResult) return openLibraryResult

      const googleBooksResult = await this.searchGoogleBooksByISBN(isbn)
      if (googleBooksResult) return googleBooksResult

      return null
    } catch (error) {
      console.error('Error fetching book metadata by ISBN:', error)
      return null
    }
  }

  private static async searchOpenLibrary(title: string, author?: string): Promise<BookMetadata | null> {
    let query = ''
    if (author) {
      query = `title:"${title}" author:"${author}"`
    } else {
      query = `title:"${title}"`
    }
    
    const fields = 'title,author_name,isbn,cover_i,first_sentence,number_of_pages_median,first_publish_year,publisher,key'
    const searchUrl = `${this.OPEN_LIBRARY_BASE}/search.json?q=${encodeURIComponent(query)}&fields=${fields}&limit=3&sort=editions`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null
    
    const data = await response.json()
    if (!data.docs || data.docs.length === 0) {
      return this.searchOpenLibraryFallback(title, author)
    }
    
    const book = data.docs.find(doc => 
      doc.title?.toLowerCase() === title.toLowerCase()
    ) || data.docs[0]
    
    let description = book.first_sentence?.[0] || ''
    if (book.key && !description) {
      try {
        const workResponse = await fetch(`${this.OPEN_LIBRARY_BASE}${book.key}.json`)
        if (workResponse.ok) {
          const workData = await workResponse.json()
          description = workData.description?.value || workData.description || ''
        }
      } catch (error) {
        console.warn('Failed to fetch work details:', error)
      }
    }
    
    let coverUrl = ''
    if (book.cover_i) {
      coverUrl = `${this.OPEN_LIBRARY_BASE}/b/id/${book.cover_i}-M.jpg`
    }
    
    return {
      title: book.title || title,
      author: book.author_name?.[0] || author || 'Unknown Author',
      isbn: book.isbn?.[0],
      description: this.cleanDescription(description),
      cover_url: coverUrl,
      page_count: book.number_of_pages_median || undefined,
      published_year: book.first_publish_year,
      publisher: book.publisher?.[0]
    }
  }

  private static async searchOpenLibraryFallback(title: string, author?: string): Promise<BookMetadata | null> {
    const query = author ? `${title} ${author}` : title
    const fields = 'title,author_name,isbn,cover_i,first_sentence,number_of_pages_median,first_publish_year,publisher'
    const searchUrl = `${this.OPEN_LIBRARY_BASE}/search.json?q=${encodeURIComponent(query)}&fields=${fields}&limit=1`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null
    
    const data = await response.json()
    if (!data.docs || data.docs.length === 0) return null
    
    const book = data.docs[0]
    let coverUrl = ''
    if (book.cover_i) {
      coverUrl = `${this.OPEN_LIBRARY_BASE}/b/id/${book.cover_i}-M.jpg`
    }
    
    return {
      title: book.title || title,
      author: book.author_name?.[0] || author || 'Unknown Author',
      isbn: book.isbn?.[0],
      description: this.cleanDescription(book.first_sentence?.[0] || ''),
      cover_url: coverUrl,
      page_count: book.number_of_pages_median || undefined,
      published_year: book.first_publish_year,
      publisher: book.publisher?.[0]
    }
  }

  private static async searchOpenLibraryByISBN(isbn: string): Promise<BookMetadata | null> {
    const lookupUrl = `${this.OPEN_LIBRARY_BASE}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    
    const response = await fetch(lookupUrl)
    if (!response.ok) return null
    
    const data = await response.json()
    const bookKey = `ISBN:${isbn}`
    
    if (!data[bookKey]) return null
    
    const book = data[bookKey]
    
    let coverUrl = ''
    if (book.cover?.medium) {
      coverUrl = book.cover.medium
    }
    
    return {
      title: book.title,
      author: book.authors?.[0]?.name || 'Unknown Author',
      isbn,
      description: book.notes || '',
      cover_url: coverUrl,
      page_count: book.number_of_pages,
      published_year: book.publish_date ? new Date(book.publish_date).getFullYear() : undefined,
      publisher: book.publishers?.[0]?.name
    }
  }

  private static async searchGoogleBooks(title: string, author?: string): Promise<BookMetadata | null> {
    let query = ''
    if (author) {
      query = `intitle:"${title}" inauthor:"${author}"`
    } else {
      query = `intitle:"${title}"`
    }
    
    const searchUrl = `${this.GOOGLE_BOOKS_BASE}?q=${encodeURIComponent(query)}&maxResults=3&orderBy=relevance&printType=books`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null
    
    const data = await response.json()
    if (!data.items || data.items.length === 0) {
      return this.searchGoogleBooksFallback(title, author)
    }
    
    const bestMatch = data.items.find((item: any) => 
      item.volumeInfo.title?.toLowerCase() === title.toLowerCase()
    ) || data.items[0]
    
    const book = bestMatch.volumeInfo
    
    return {
      title: book.title || title,
      author: book.authors?.[0] || author || 'Unknown Author',
      isbn: book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier ||
            book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier,
      description: this.cleanDescription(book.description || ''),
      cover_url: book.imageLinks?.thumbnail?.replace('http:', 'https:') || 
                 book.imageLinks?.smallThumbnail?.replace('http:', 'https:'),
      page_count: book.pageCount,
      published_year: book.publishedDate ? new Date(book.publishedDate).getFullYear() : undefined,
      publisher: book.publisher
    }
  }

  private static async searchGoogleBooksFallback(title: string, author?: string): Promise<BookMetadata | null> {
    const query = author ? `${title} ${author}` : title
    const searchUrl = `${this.GOOGLE_BOOKS_BASE}?q=${encodeURIComponent(query)}&maxResults=1&printType=books`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null
    
    const data = await response.json()
    if (!data.items || data.items.length === 0) return null
    
    const book = data.items[0].volumeInfo
    
    return {
      title: book.title || title,
      author: book.authors?.[0] || author || 'Unknown Author',
      isbn: book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier ||
            book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier,
      description: this.cleanDescription(book.description || ''),
      cover_url: book.imageLinks?.thumbnail?.replace('http:', 'https:'),
      page_count: book.pageCount,
      published_year: book.publishedDate ? new Date(book.publishedDate).getFullYear() : undefined,
      publisher: book.publisher
    }
  }

  private static async searchGoogleBooksByISBN(isbn: string): Promise<BookMetadata | null> {
    const searchUrl = `${this.GOOGLE_BOOKS_BASE}?q=isbn:${isbn}&maxResults=1`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null
    
    const data = await response.json()
    if (!data.items || data.items.length === 0) return null
    
    const book = data.items[0].volumeInfo
    
    return {
      title: book.title,
      author: book.authors?.[0] || 'Unknown Author',
      isbn,
      description: book.description,
      cover_url: book.imageLinks?.thumbnail?.replace('http:', 'https:'),
      page_count: book.pageCount,
      published_year: book.publishedDate ? new Date(book.publishedDate).getFullYear() : undefined,
      publisher: book.publisher
    }
  }

  static extractISBNFromEpub(filename: string): string | null {
    const patterns = [
      /(?:isbn[:\-\s]*)?(\d{13})/i,
      /(?:isbn[:\-\s]*)?(\d{10})/i,
      /(\d{13})/,
      /(\d{10})/
    ]
    
    for (const pattern of patterns) {
      const match = filename.match(pattern)
      if (match) {
        const isbn = match[1]
        if (isbn.length === 10 || isbn.length === 13) {
          return isbn
        }
      }
    }
    return null
  }

  private static cleanDescription(description: string): string {
    if (!description) return ''
    
    return description
      .replace(/^["']|["']$/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 500)
  }

  static parseFilename(filename: string): { title: string, author?: string } {
    const nameWithoutExt = filename.replace(/\.epub$/i, '')
    
    const zlibPattern = /^(.+?)\s*\(([^)]+)\)\s*\([^)]*Z-Library[^)]*\)$/i
    const zlibMatch = nameWithoutExt.match(zlibPattern)
    if (zlibMatch) {
      return { title: zlibMatch[1].trim(), author: zlibMatch[2].trim() }
    }
    
    const parenthesesPattern = /^(.+?)\s*\(([^)]+)\)$/
    const parenthesesMatch = nameWithoutExt.match(parenthesesPattern)
    if (parenthesesMatch) {
      return { title: parenthesesMatch[1].trim(), author: parenthesesMatch[2].trim() }
    }
    
    const patterns = [
      /^(.+?)\s*-\s*(.+)$/,
      /^(.+?)\s*_\s*(.+)$/,
      /^(.+?)\s+by\s+(.+)$/i,
    ]
    
    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern)
      if (match) {
        const first = match[1].trim()
        const second = match[2].trim()
        
        if (first.includes(',') || first.split(' ').length <= 3) {
          return { title: second, author: first }
        } else {
          return { title: first, author: second }
        }
      }
    }
    
    return { title: nameWithoutExt }
  }
}