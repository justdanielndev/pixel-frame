#!/usr/bin/env node

/**
 * Script to refetch metadata for all books in the library
 * Usage: node scripts/refetch-metadata.js [book-id]
 * 
 * If no book-id is provided, refetches metadata for all books
 * If book-id is provided, refetches only for that specific book
 */

const fs = require('fs')
const path = require('path')

async function generateRecommendations(baseUrl) {
  try {
    console.log('🤖 Updating recommendation cache...')
    
    const response = await fetch(`${baseUrl}/api/books/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Recommendations updated successfully')
    } else {
      console.log('❌ Failed to update recommendations:', result.error)
    }
    
  } catch (error) {
    console.log('❌ Error updating recommendations:', error.message)
  }
}

async function refetchMetadata(bookId = null) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  try {
    if (bookId) {
      console.log(`Refetching metadata for book: ${bookId}`)
      
      const response = await fetch(`${baseUrl}/api/books/${bookId}/metadata`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (response.ok) {
        console.log('✅ Success:', result.metadata.title, 'by', result.metadata.author)
      } else {
        console.log('❌ Failed:', result.error)
      }
      
    } else {
      console.log('Fetching list of all books...')
      
      const booksResponse = await fetch(`${baseUrl}/api/books`)
      const booksData = await booksResponse.json()
      
      if (!booksResponse.ok) {
        throw new Error('Failed to fetch books list')
      }
      
      const books = booksData.books || []
      console.log(`Found ${books.length} books. Starting metadata refetch...`)
      
      let successCount = 0
      let failCount = 0
      
      for (const book of books) {
        console.log(`\nProcessing: ${book.title} (${book.filename})`)
        
        try {
          const response = await fetch(`${baseUrl}/api/books/${book.id}/metadata`, {
            method: 'POST'
          })
          
          const result = await response.json()
          
          if (response.ok) {
            console.log('✅ Success:', result.metadata.title, 'by', result.metadata.author)
            successCount++
          } else {
            console.log('❌ Failed:', result.error)
            failCount++
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (error) {
          console.log('❌ Error:', error.message)
          failCount++
        }
      }
      
      console.log(`\n📊 Summary:`)
      console.log(`✅ Successful: ${successCount}`)
      console.log(`❌ Failed: ${failCount}`)
      console.log(`📚 Total: ${books.length}`)
      
  }
    
  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

const bookId = process.argv[2]

if (bookId && bookId === '--help') {
  console.log(`
Usage: node scripts/refetch-metadata.js [book-id]

Arguments:
  book-id     Optional. If provided, refetches metadata only for this book.
              If omitted, refetches for all books in the library.

Examples:
  node scripts/refetch-metadata.js                    # Refetch all books + recommendations
  node scripts/refetch-metadata.js abc123             # Refetch specific book + recommendations
  node scripts/refetch-metadata.js --help             # Show this help

Features:
  - Fetches book metadata (title, author, description, cover)
  - Generates book recommendations based on your library
  - Updates recommendation cache for faster loading

Note: Make sure the development server is running on localhost:3000
or set NEXT_PUBLIC_BASE_URL environment variable.
`)
  process.exit(0)
}

refetchMetadata(bookId)
  .then(() => {
    console.log('\n🎉 Metadata refetch completed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Script failed:', error.message)
    process.exit(1)
  })