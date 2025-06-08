import sharp from 'sharp'

export async function convertToBlackAndWhite(imageBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .greyscale()
      .png()
      .toBuffer()
  } catch (error) {
    console.warn('Failed to convert image to black and white:', error)
    // Return original buffer if conversion fails
    return imageBuffer
  }
}

export async function fetchAndConvertImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)
    
    return await convertToBlackAndWhite(imageBuffer)
  } catch (error) {
    console.error('Error fetching and converting image:', error)
    return null
  }
}