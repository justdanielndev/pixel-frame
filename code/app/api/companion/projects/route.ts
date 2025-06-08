import { NextRequest, NextResponse } from 'next/server'
import { getCompanionDatabase } from '@/lib/companion-database'

export async function GET() {
  try {
    const db = getCompanionDatabase()
    const projects = db.getAllProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json()
    
    if (!projectData.name || !projectData.status || !projectData.priority) {
      return NextResponse.json({ 
        error: 'Name, status, and priority are required' 
      }, { status: 400 })
    }
    
    const db = getCompanionDatabase()
    const project = db.createProject(projectData)
    
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}