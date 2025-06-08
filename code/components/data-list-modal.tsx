'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { List } from 'lucide-react'

interface DataListModalProps {
  onDataChanged: () => void
}

export default function DataListModal({ onDataChanged }: DataListModalProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/data-management')
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick}>
      <List className="w-4 h-4 mr-2" />
      View All Data
    </Button>
  )
}