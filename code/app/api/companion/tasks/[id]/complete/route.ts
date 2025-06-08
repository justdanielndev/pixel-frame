import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getCompanionDatabase()
    const task = db.completeTask(params.id)
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    return NextResponse.json(task)
  } catch (error) {
    console.error('Error completing task:', error)
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 })
  }
}