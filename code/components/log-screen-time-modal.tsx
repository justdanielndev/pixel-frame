'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Smartphone } from 'lucide-react'

interface LogScreenTimeModalProps {
  onScreenTimeLogged: () => void
}

export default function LogScreenTimeModal({ onScreenTimeLogged }: LogScreenTimeModalProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/log-screen-time')
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick}>
      <Smartphone className="w-4 h-4 mr-2" />
      Log Screen Time
    </Button>
  )
}