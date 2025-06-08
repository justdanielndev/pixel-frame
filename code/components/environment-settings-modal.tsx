'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

interface EnvironmentSettingsModalProps {
  onSettingsUpdated: () => void
  currentEnvironment?: any
}

export default function EnvironmentSettingsModal({ onSettingsUpdated, currentEnvironment }: EnvironmentSettingsModalProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/settings?tab=environment')
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick}>
      <Home className="w-4 h-4 mr-2" />
      Environment
    </Button>
  )
}