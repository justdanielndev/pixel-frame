import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getCompanionDatabase()
    const deleted = db.deleteTask(params.id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const db = getCompanionDatabase()
    const task = db.updateTask(params.id, updates)
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}