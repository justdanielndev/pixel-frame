'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

interface AddAppointmentModalProps {
  onAppointmentAdded: () => void
}

export default function AddAppointmentModal({ onAppointmentAdded }: AddAppointmentModalProps) {
  const router = useRouter()

  return (
    <Button size="sm" variant="outline" onClick={() => router.push('/add-appointment')}>
      <Calendar className="w-4 h-4 mr-2" />
      Add Event
    </Button>
  )
}