import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function GET() {
  try {
    const db = getCompanionDatabase()
    const appointments = db.getAllAppointments()
    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json()
    
    if (!appointmentData.title || !appointmentData.date || !appointmentData.start_time) {
      return NextResponse.json({ 
        error: 'Title, date, and start time are required' 
      }, { status: 400 })
    }
    
    const db = getCompanionDatabase()
    const appointment = db.createAppointment(appointmentData)
    
    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}