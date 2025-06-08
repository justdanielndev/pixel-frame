'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AppSettingsModal from '@/components/app-settings-modal'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  onSettingsUpdated?: () => void
}

export default function PageHeader({ title, showBack = false, onSettingsUpdated }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between mb-6 p-4">
      <div className="flex items-center gap-3">
        {showBack && (
          <Button size="sm" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      
      <div className="flex gap-2">
        {onSettingsUpdated && (
          <AppSettingsModal onSettingsUpdated={onSettingsUpdated} />
        )}
        <Button size="sm" variant="ghost" onClick={() => router.push('/')}>
          Home
        </Button>
      </div>
    </div>
  )
}