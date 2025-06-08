'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FolderPlus } from 'lucide-react'

interface AddProjectModalProps {
  onProjectAdded: () => void
}

export default function AddProjectModal({ onProjectAdded }: AddProjectModalProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push('/add-project')
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick}>
      <FolderPlus className="w-4 h-4 mr-2" />
      Add Project
    </Button>
  )
}