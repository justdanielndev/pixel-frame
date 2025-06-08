'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  isRecording: boolean
  onRecordingComplete: (transcript: string) => void
  onRecordingError: (error: string) => void
  onRecordingTooShort?: () => void
}

export default function VoiceRecorder({ isRecording, onRecordingComplete, onRecordingError, onRecordingTooShort }: VoiceRecorderProps) {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRecording) {
      startRecording()
    } else {
      stopRecording()
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      startTimeRef.current = Date.now()
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      const chunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = () => {
        const recordingDuration = startTimeRef.current ? Date.now() - startTimeRef.current : 0
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })
        
        if (recordingDuration < 1000) {
          if (onRecordingTooShort) {
            onRecordingTooShort()
          }
        } else {
          transcribeAudio(audioBlob)
        }
        setAudioChunks([])
        startTimeRef.current = null
      }

      recorder.start()
      setMediaRecorder(recorder)
      setAudioChunks(chunks)

    } catch (error) {
      console.error('Error starting recording:', error)
      onRecordingError('Failed to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setMediaRecorder(null)
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/ai/stt', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.transcript) {
        onRecordingComplete(data.transcript)
      } else {
        onRecordingError(data.error || 'Transcription failed')
      }
    } catch (error) {
      console.error('Error transcribing audio:', error)
      onRecordingError('Failed to transcribe audio')
    }
  }

  if (!isRecording) return null

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm",
      "flex items-center justify-center py-8 px-4",
      "animate-in slide-in-from-bottom-full duration-300"
    )}>
      <div className="flex flex-col items-center text-white space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
            <Mic className="w-8 h-8" />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-red-500 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">Listening...</p>
          <p className="text-sm text-white/70">Release space to send</p>
        </div>
      </div>
    </div>
  )
}