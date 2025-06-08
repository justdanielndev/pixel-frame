import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@deepgram/sdk'

const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const audioBuffer = await audioFile.arrayBuffer()
    
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      Buffer.from(audioBuffer),
      {
        model: 'nova-2',
        smart_format: true,
        language: 'en-US'
      }
    )

    if (error) {
      console.error('Deepgram error:', error)
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
    }

    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript
    
    if (!transcript) {
      return NextResponse.json({ error: 'No transcript generated' }, { status: 500 })
    }

    return NextResponse.json({ 
      transcript: transcript.trim(),
      confidence: result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0
    })

  } catch (error) {
    console.error('STT API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}