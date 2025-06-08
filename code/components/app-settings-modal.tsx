'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

interface AppSettingsModalProps {
  onSettingsUpdated: () => void
}

export default function AppSettingsModal({ onSettingsUpdated }: AppSettingsModalProps) {
  const router = useRouter()

  return (
    <Button size="sm" variant="outline" onClick={() => router.push('/settings')}>
      <Settings className="w-4 h-4 mr-2" />
      App Settings
    </Button>
  )
}