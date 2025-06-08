'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AddTaskModalProps {
  onTaskAdded: () => void
}

export default function AddTaskModal({ onTaskAdded }: AddTaskModalProps) {
  const router = useRouter()

  return (
    <Button size="sm" variant="outline" onClick={() => router.push('/add-task')}>
      <Plus className="w-4 h-4 mr-2" />
      Add Task
    </Button>
  )
}