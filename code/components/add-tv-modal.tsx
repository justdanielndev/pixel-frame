'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tv } from 'lucide-react'

interface AddTvModalProps {
  onTvAdded: () => void
}

export default function AddTvModal({ onTvAdded }: AddTvModalProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/add-tv')
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick}>
      <Tv className="w-4 h-4 mr-2" />
      Add TV/Movie
    </Button>
  )
}