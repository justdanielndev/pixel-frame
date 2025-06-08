import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getCompanionDatabase()
    const deleted = db.deleteAppointment(params.id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const db = getCompanionDatabase()
    const appointment = db.updateAppointment(params.id, updates)
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    
    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}