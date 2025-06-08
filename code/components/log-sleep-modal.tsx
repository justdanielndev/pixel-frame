'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Moon } from 'lucide-react'

interface LogSleepModalProps {
  onSleepLogged: () => void
}

export default function LogSleepModal({ onSleepLogged }: LogSleepModalProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/log-sleep')
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick}>
      <Moon className="w-4 h-4 mr-2" />
      Log Sleep
    </Button>
  )
}