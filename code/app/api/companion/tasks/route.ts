import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function GET() {
  try {
    const db = getCompanionDatabase()
    const tasks = db.getAllTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json()
    
    if (!taskData.title || !taskData.priority) {
      return NextResponse.json({ error: 'Title and priority are required' }, { status: 400 })
    }
    
    const db = getCompanionDatabase()
    const task = db.createTask(taskData)
    
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}