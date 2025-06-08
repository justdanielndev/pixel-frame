import JSZip from 'jszip'
import { readFile } from 'fs/promises'
import { parseString } from 'xml2js'
import { promisify } from 'util'

const parseXML = promisify(parseString)

export interface EpubMetadata {
  title: string
  author: string
  isbn?: string
  description?: string
  language?: string
  publisher?: string
  publishedDate?: string
  coverImagePath?: string
}

export interface EpubChapter {
  id: string
  title: string
  content: string
  order: number
}

export interface EpubContent {
  metadata: EpubMetadata
  chapters: EpubChapter[]
  totalPages: number
  wordsPerPage: number
  pageBreaks: number[]
}

export class EpubParser {
  static async parseEpub(filePath: string): Promise<EpubContent> {
    try {
      const epubData = await readFile(filePath)
      const zip = await JSZip.loadAsync(epubData)
      
      const containerXml = await zip.file('META-INF/container.xml')?.async('text')
      if (!containerXml) throw new Error('Invalid EPUB: No container.xml found')
      
      const containerData = await parseXML(containerXml)
      const opfPath = containerData.container.rootfiles[0].rootfile[0]['$']['full-path']
      
      const opfContent = await zip.file(opfPath)?.async('text')
      if (!opfContent) throw new Error('Invalid EPUB: No OPF file found')
      
      const opfData = await parseXML(opfContent)
      const packageData = opfData.package
      
      const metadata = this.extractMetadata(packageData.metadata[0])
      
      const manifest = packageData.manifest[0].item
      const spine = packageData.spine[0].itemref
      
      const chapters = await this.extractChapters(zip, manifest, spine, opfPath)
      
      const allText = chapters.map(ch => ch.content).join('\n\n')
      const words = allText.split(/\s+/)
      const wordsPerPage = 250
      
      const { pageBreaks, totalPages } = this.calculatePageBreaks(allText, wordsPerPage)
      
      return {
        metadata,
        chapters,
        totalPages,
        wordsPerPage,
        pageBreaks
      }
    } catch (error) {
      console.error('Error parsing EPUB:', error)
      throw new Error(`Failed to parse EPUB: ${error.message}`)
    }
  }
  
  private static extractMetadata(metadataElement: any): EpubMetadata {
    const metadata: EpubMetadata = {
      title: 'Unknown Title',
      author: 'Unknown Author'
    }
    
    if (metadataElement['dc:title']) {
      metadata.title = metadataElement['dc:title'][0]._ || metadataElement['dc:title'][0]
    }
    
    if (metadataElement['dc:creator']) {
      const creator = metadataElement['dc:creator'][0]
      metadata.author = creator._ || creator
    }
    
    if (metadataElement['dc:identifier']) {
      const identifiers = Array.isArray(metadataElement['dc:identifier']) 
        ? metadataElement['dc:identifier'] 
        : [metadataElement['dc:identifier']]
      
      for (const id of identifiers) {
        const value = id._ || id
        if (typeof value === 'string' && /^(978|979)\d{10}$/.test(value.replace(/[-\s]/g, ''))) {
          metadata.isbn = value
          break
        }
      }
    }
    
    if (metadataElement['dc:description']) {
      metadata.description = metadataElement['dc:description'][0]._ || metadataElement['dc:description'][0]
    }
    
    if (metadataElement['dc:language']) {
      metadata.language = metadataElement['dc:language'][0]._ || metadataElement['dc:language'][0]
    }
    
    if (metadataElement['dc:publisher']) {
      metadata.publisher = metadataElement['dc:publisher'][0]._ || metadataElement['dc:publisher'][0]
    }
    
    if (metadataElement['dc:date']) {
      metadata.publishedDate = metadataElement['dc:date'][0]._ || metadataElement['dc:date'][0]
    }
    
    return metadata
  }
  
  private static async extractChapters(
    zip: JSZip, 
    manifest: any[], 
    spine: any[], 
    opfPath: string
  ): Promise<EpubChapter[]> {
    const chapters: EpubChapter[] = []
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1)
    
    const manifestMap = new Map()
    manifest.forEach(item => {
      manifestMap.set(item.$.id, item.$.href)
    })
    
    for (let i = 0; i < spine.length; i++) {
      const spineItem = spine[i]
      const itemId = spineItem.$.idref
      const href = manifestMap.get(itemId)
      
      if (href && href.endsWith('.xhtml') || href.endsWith('.html')) {
        try {
          const filePath = opfDir + href
          const content = await zip.file(filePath)?.async('text')
          
          if (content) {
            const cleanContent = this.extractTextFromHtml(content)
            const title = this.extractTitleFromHtml(content) || `Chapter ${i + 1}`
            
            chapters.push({
              id: itemId,
              title,
              content: cleanContent,
              order: i
            })
          }
        } catch (error) {
          console.warn(`Failed to extract chapter ${itemId}:`, error)
        }
      }
    }
    
    return chapters
  }
  
  private static extractTextFromHtml(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  private static extractTitleFromHtml(html: string): string | null {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i) ||
                      html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i)
    
    if (titleMatch) {
      return this.extractTextFromHtml(titleMatch[1])
    }
    
    return null
  }
  
  static countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length
  }

  static calculatePageBreaks(text: string, wordsPerPage: number): { pageBreaks: number[], totalPages: number } {
    const words = text.split(/\s+/)
    const pageBreaks: number[] = [0]
    
    let currentPageStart = 0
    
    while (currentPageStart < words.length) {
      const currentPageEnd = Math.min(currentPageStart + wordsPerPage, words.length)
      
      if (currentPageEnd >= words.length) {
        break
      }
      
      const pageText = words.slice(currentPageStart, currentPageEnd).join(' ')
      let nextPageStart = currentPageEnd
      
      if (pageText.length > 100) {
        const minLength = Math.floor(pageText.length * 0.8)
        const sentencePattern = /[.!?]["']?\s/g
        let lastMatch = null
        let match
        
        while ((match = sentencePattern.exec(pageText)) !== null) {
          if (match.index >= minLength) {
            lastMatch = match
            break
          }
        }
        
        if (lastMatch) {
          const textBeforeBreak = pageText.substring(0, lastMatch.index + 1)
          const wordsBeforeBreak = textBeforeBreak.split(/\s+/).length
          nextPageStart = currentPageStart + wordsBeforeBreak
        }
      }
      
      pageBreaks.push(nextPageStart)
      currentPageStart = nextPageStart
    }
    
    return {
      pageBreaks,
      totalPages: pageBreaks.length - 1
    }
  }
  
  static getPageContent(chapters: EpubChapter[], page: number, pageBreaks: number[], wordsPerPage: number = 250): string {
    const allText = chapters.map(ch => ch.content).join('\n\n')
    const words = allText.split(/\s+/)
    
    if (pageBreaks && pageBreaks.length > 0) {
      const pageIndex = page - 1
      
      if (pageIndex >= pageBreaks.length - 1) {
        return 'End of book reached.'
      }
      
      const startWord = pageBreaks[pageIndex]
      const endWord = pageIndex + 1 < pageBreaks.length ? pageBreaks[pageIndex + 1] : words.length
      
      return words.slice(startWord, endWord).join(' ')
    }
    
    const startWord = (page - 1) * wordsPerPage
    const endWord = Math.min(startWord + wordsPerPage, words.length)
    
    if (startWord >= words.length) {
      return 'End of book reached.'
    }
    
    return words.slice(startWord, endWord).join(' ')
  }
  
  static async extractCoverImage(filePath: string): Promise<Buffer | null> {
    try {
      const epubData = await readFile(filePath)
      const zip = await JSZip.loadAsync(epubData)
      
      const coverPaths = [
        'cover.jpg', 'cover.jpeg', 'cover.png',
        'OEBPS/cover.jpg', 'OEBPS/cover.jpeg', 'OEBPS/cover.png',
        'OEBPS/images/cover.jpg', 'OEBPS/images/cover.jpeg', 'OEBPS/images/cover.png',
        'images/cover.jpg', 'images/cover.jpeg', 'images/cover.png'
      ]
      
      for (const path of coverPaths) {
        const file = zip.file(path)
        if (file) {
          return await file.async('nodebuffer')
        }
      }
      
      const imageFiles = Object.keys(zip.files).filter(path => 
        /\.(jpg|jpeg|png|gif)$/i.test(path) && 
        /cover|front/i.test(path)
      )
      
      if (imageFiles.length > 0) {
        const file = zip.file(imageFiles[0])
        if (file) {
          return await file.async('nodebuffer')
        }
      }
      
      return null
    } catch (error) {
      console.error('Error extracting cover image:', error)
      return null
    }
  }
}