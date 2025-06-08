import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getCompanionDatabase()
    const deleted = db.deleteProject(params.id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const db = getCompanionDatabase()
    const project = db.updateProject(params.id, updates)
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}