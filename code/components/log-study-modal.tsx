'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

interface LogStudyModalProps {
  onStudyLogged: () => void
}

export default function LogStudyModal({ onStudyLogged }: LogStudyModalProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/log-study')
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick}>
      <BookOpen className="w-4 h-4 mr-2" />
      Log Study
    </Button>
  )
}