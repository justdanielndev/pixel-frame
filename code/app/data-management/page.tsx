'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Edit,
  Trash2, 
  Calendar, 
  CheckCircle, 
  Moon, 
  BookOpen, 
  FolderOpen,
  StickyNote,
  Smartphone,
  Save,
  X
} from 'lucide-react'

export default function DataManagementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<{type: string, id: string, data: any} | null>(null)
  const [data, setData] = useState({
    tasks: [],
    appointments: [],
    projects: [],
    sleep_records: [],
    study_sessions: [],
    notes: [],
    screen_time: [],
    tv_shows: [],
    books: []
  })

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [tasks, appointments, projects, notes, tvShows, books, screenTime] = await Promise.all([
        fetch('/api/companion/tasks').then(r => r.json()),
        fetch('/api/companion/appointments').then(r => r.json()),
        fetch('/api/companion/projects').then(r => r.json()),
        fetch('/api/companion/notes').then(r => r.json()),
        fetch('/api/companion/tv').then(r => r.json()),
        fetch('/api/books').then(r => r.json()),
        fetch('/api/companion/screen-time').then(r => r.json())
      ])

      setData({
        tasks: tasks || [],
        appointments: appointments || [],
        projects: projects || [],
        sleep_records: [],
        study_sessions: [],
        notes: notes || [],
        screen_time: screenTime || [],
        tv_shows: tvShows || [],
        books: books?.books || []
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      let endpoint = `/api/companion/${type}/${id}`
      
      if (type === 'books') {
        endpoint = `/api/books/${id}`
      } else if (type === 'screen-time') {
        endpoint = `/api/companion/screen-time/${id}`
      }
      
      const response = await fetch(endpoint, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadAllData()
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/companion/tasks/${taskId}/complete`, {
        method: 'POST'
      })

      if (response.ok) {
        loadAllData()
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'Europe/Berlin' })
  }

  const formatTime = (timeString: string) => {
    return timeString || 'Not set'
  }

  const startEdit = (type: string, id: string, itemData: any) => {
    setEditingItem({ type, id, data: { ...itemData } })
  }

  const cancelEdit = () => {
    setEditingItem(null)
  }

  const saveEdit = async () => {
    if (!editingItem) return

    try {
      let endpoint = `/api/companion/${editingItem.type}/${editingItem.id}`
      
      if (editingItem.type === 'books') {
        endpoint = `/api/books/${editingItem.id}`
      } else if (editingItem.type === 'screen-time') {
        endpoint = `/api/companion/screen-time/${editingItem.id}`
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem.data)
      })

      if (response.ok) {
        setEditingItem(null)
        loadAllData()
      } else {
        console.error('Failed to save changes')
      }
    } catch (error) {
      console.error('Failed to save item:', error)
    }
  }

  const updateEditingData = (field: string, value: any) => {
    if (!editingItem) return
    setEditingItem({
      ...editingItem,
      data: { ...editingItem.data, [field]: value }
    })
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Data Management</h1>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
          <div className="p-8 text-center">Loading data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Data Management</h1>
            <p className="text-muted-foreground">View and manage all your data</p>
          </div>
        </div>
        
        <Tabs defaultValue="tasks" className="w-full">
          <div className="w-full overflow-x-auto mb-4">
            <TabsList className="flex w-max min-w-full px-1">
              <TabsTrigger value="tasks" className="flex-shrink-0 px-3 py-2 text-sm">Tasks</TabsTrigger>
              <TabsTrigger value="appointments" className="flex-shrink-0 px-3 py-2 text-sm">Events</TabsTrigger>
              <TabsTrigger value="projects" className="flex-shrink-0 px-3 py-2 text-sm">Projects</TabsTrigger>
              <TabsTrigger value="notes" className="flex-shrink-0 px-3 py-2 text-sm">Notes</TabsTrigger>
              <TabsTrigger value="sleep" className="flex-shrink-0 px-3 py-2 text-sm">Sleep</TabsTrigger>
              <TabsTrigger value="study" className="flex-shrink-0 px-3 py-2 text-sm">Study</TabsTrigger>
              <TabsTrigger value="screen-time" className="flex-shrink-0 px-3 py-2 text-sm">Screen</TabsTrigger>
              <TabsTrigger value="tv" className="flex-shrink-0 px-3 py-2 text-sm">TV</TabsTrigger>
              <TabsTrigger value="books" className="flex-shrink-0 px-3 py-2 text-sm">Books</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tasks ({data.tasks.length})</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.tasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks found</p>
              ) : (
                data.tasks.map((task: any) => (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h4>
                          <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                            {task.priority}
                          </Badge>
                          {task.completed && <Badge variant="outline">Completed</Badge>}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        )}
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDate(task.due_date)}
                            {task.due_time && ` at ${task.due_time}`}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!task.completed && (
                          <Button size="sm" variant="outline" onClick={() => completeTask(task.id)}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => startEdit('tasks', task.id, task)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem('tasks', task.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Appointments ({data.appointments.length})</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No appointments found</p>
              ) : (
                data.appointments.map((appointment: any) => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{appointment.title}</h4>
                          <Badge variant="outline">{appointment.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {formatDate(appointment.date)} at {formatTime(appointment.start_time)}
                          {appointment.end_time && ` - ${formatTime(appointment.end_time)}`}
                        </p>
                        {appointment.location && (
                          <p className="text-xs text-muted-foreground">📍 {appointment.location}</p>
                        )}
                        {appointment.description && (
                          <p className="text-xs text-muted-foreground mt-1">{appointment.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => startEdit('appointments', appointment.id, appointment)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem('appointments', appointment.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Projects ({data.projects.length})</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.projects.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No projects found</p>
              ) : (
                data.projects.map((project: any) => (
                  <Card key={project.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{project.name}</h4>
                          <Badge variant={project.status === 'completed' ? 'default' : 'outline'}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'}>
                            {project.priority}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Progress: {project.progress_percentage}%</span>
                          {project.target_date && <span>Due: {formatDate(project.target_date)}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => startEdit('projects', project.id, project)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem('projects', project.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Notes ({data.notes.length})</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.notes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No notes found</p>
              ) : (
                data.notes.map((note: any) => (
                  <Card key={note.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm mb-2">{note.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleString('en-US', { timeZone: 'Europe/Berlin' })}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => startEdit('notes', note.id, note)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem('notes', note.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="sleep" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sleep Records</h3>
            </div>
            <p className="text-muted-foreground text-center py-8">Sleep record management coming soon</p>
          </TabsContent>

          <TabsContent value="study" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Study Sessions</h3>
            </div>
            <p className="text-muted-foreground text-center py-8">Study session management coming soon</p>
          </TabsContent>

          <TabsContent value="screen-time" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Screen Time Records ({data.screen_time.length})</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.screen_time.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No screen time records found</p>
              ) : (
                data.screen_time.map((record: any) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{formatDate(record.date)}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Total: {Math.round(record.total_minutes / 60 * 10) / 10}h
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <p>Productive: {Math.round(record.productive_minutes / 60 * 10) / 10}h</p>
                          <p>Social: {Math.round(record.social_minutes / 60 * 10) / 10}h</p>
                          <p>Entertainment: {Math.round(record.entertainment_minutes / 60 * 10) / 10}h</p>
                        </div>
                        {record.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => startEdit('screen-time', record.id, record)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem('screen-time', record.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="tv" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">TV Shows ({data.tv_shows.length})</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.tv_shows.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No TV shows found</p>
              ) : (
                data.tv_shows.map((show: any) => (
                  <Card key={show.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{show.title}</h4>
                          <Badge variant={show.status === 'watching' ? 'default' : 'secondary'}>
                            {show.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">{show.type}</Badge>
                        </div>
                        {show.current_episode && show.total_episodes && (
                          <p className="text-sm text-muted-foreground">
                            Episode {show.current_episode} of {show.total_episodes}
                          </p>
                        )}
                        {show.current_season && (
                          <p className="text-sm text-muted-foreground">
                            Season {show.current_season}
                          </p>
                        )}
                        {show.platform && (
                          <p className="text-xs text-muted-foreground">Platform: {show.platform}</p>
                        )}
                        {show.rating && (
                          <p className="text-xs text-muted-foreground">Rating: {show.rating}/10</p>
                        )}
                        {show.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{show.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => startEdit('tv', show.id, show)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem('tv', show.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="books" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Books ({data.books.length})</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.books.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No books found</p>
              ) : (
                data.books.map((book: any) => (
                  <Card key={book.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{book.title}</h4>
                          {book.percentComplete && (
                            <Badge variant={book.percentComplete === 100 ? 'default' : 'secondary'}>
                              {book.percentComplete}% complete
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">by {book.author}</p>
                        {book.currentPage && book.totalPages && (
                          <p className="text-xs text-muted-foreground">
                            Page {book.currentPage} of {book.totalPages}
                          </p>
                        )}
                        {book.readingTimeRemaining && (
                          <p className="text-xs text-muted-foreground">
                            {book.readingTimeRemaining} minutes remaining
                          </p>
                        )}
                        {book.lastRead && (
                          <p className="text-xs text-muted-foreground">
                            Last read: {formatDate(book.lastRead)}
                          </p>
                        )}
                        {book.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{book.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => startEdit('books', book.id, book)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem('books', book.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={cancelEdit}>
            <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit {editingItem.type}</h3>
                <Button variant="outline" size="icon" onClick={cancelEdit}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {editingItem.type === 'tasks' && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input 
                        value={editingItem.data.title || ''} 
                        onChange={(e) => updateEditingData('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea 
                        value={editingItem.data.description || ''} 
                        onChange={(e) => updateEditingData('description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={editingItem.data.priority || 'medium'} onValueChange={(value) => updateEditingData('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <Input 
                        type="date"
                        value={editingItem.data.due_date || ''} 
                        onChange={(e) => updateEditingData('due_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Due Time</label>
                      <Input 
                        type="time"
                        value={editingItem.data.due_time || ''} 
                        onChange={(e) => updateEditingData('due_time', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'appointments' && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input 
                        value={editingItem.data.title || ''} 
                        onChange={(e) => updateEditingData('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea 
                        value={editingItem.data.description || ''} 
                        onChange={(e) => updateEditingData('description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input 
                        type="date"
                        value={editingItem.data.date || ''} 
                        onChange={(e) => updateEditingData('date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Start Time</label>
                      <Input 
                        type="time"
                        value={editingItem.data.start_time || ''} 
                        onChange={(e) => updateEditingData('start_time', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Time</label>
                      <Input 
                        type="time"
                        value={editingItem.data.end_time || ''} 
                        onChange={(e) => updateEditingData('end_time', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input 
                        value={editingItem.data.location || ''} 
                        onChange={(e) => updateEditingData('location', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select value={editingItem.data.type || 'appointment'} onValueChange={(value) => updateEditingData('type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="class">Class</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="appointment">Appointment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {editingItem.type === 'projects' && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input 
                        value={editingItem.data.name || ''} 
                        onChange={(e) => updateEditingData('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea 
                        value={editingItem.data.description || ''} 
                        onChange={(e) => updateEditingData('description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select value={editingItem.data.status || 'planning'} onValueChange={(value) => updateEditingData('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={editingItem.data.priority || 'medium'} onValueChange={(value) => updateEditingData('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Progress (%)</label>
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        value={editingItem.data.progress_percentage || 0} 
                        onChange={(e) => updateEditingData('progress_percentage', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Target Date</label>
                      <Input 
                        type="date"
                        value={editingItem.data.target_date || ''} 
                        onChange={(e) => updateEditingData('target_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea 
                        value={editingItem.data.notes || ''} 
                        onChange={(e) => updateEditingData('notes', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'notes' && (
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea 
                      value={editingItem.data.content || ''} 
                      onChange={(e) => updateEditingData('content', e.target.value)}
                      rows={6}
                    />
                  </div>
                )}

                {editingItem.type === 'screen-time' && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input 
                        type="date"
                        value={editingItem.data.date || ''} 
                        onChange={(e) => updateEditingData('date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Total Minutes</label>
                      <Input 
                        type="number"
                        min="0"
                        value={editingItem.data.total_minutes || 0} 
                        onChange={(e) => updateEditingData('total_minutes', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Productive Minutes</label>
                      <Input 
                        type="number"
                        min="0"
                        value={editingItem.data.productive_minutes || 0} 
                        onChange={(e) => updateEditingData('productive_minutes', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Social Minutes</label>
                      <Input 
                        type="number"
                        min="0"
                        value={editingItem.data.social_minutes || 0} 
                        onChange={(e) => updateEditingData('social_minutes', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Entertainment Minutes</label>
                      <Input 
                        type="number"
                        min="0"
                        value={editingItem.data.entertainment_minutes || 0} 
                        onChange={(e) => updateEditingData('entertainment_minutes', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea 
                        value={editingItem.data.notes || ''} 
                        onChange={(e) => updateEditingData('notes', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'tv' && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input 
                        value={editingItem.data.title || ''} 
                        onChange={(e) => updateEditingData('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select value={editingItem.data.status || 'watching'} onValueChange={(value) => updateEditingData('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="watching">Watching</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="plan_to_watch">Plan to Watch</SelectItem>
                          <SelectItem value="dropped">Dropped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select value={editingItem.data.type || 'series'} onValueChange={(value) => updateEditingData('type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="series">Series</SelectItem>
                          <SelectItem value="movie">Movie</SelectItem>
                          <SelectItem value="documentary">Documentary</SelectItem>
                          <SelectItem value="anime">Anime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Current Episode</label>
                      <Input 
                        type="number"
                        min="1"
                        value={editingItem.data.current_episode || ''} 
                        onChange={(e) => updateEditingData('current_episode', parseInt(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Total Episodes</label>
                      <Input 
                        type="number"
                        min="1"
                        value={editingItem.data.total_episodes || ''} 
                        onChange={(e) => updateEditingData('total_episodes', parseInt(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Current Season</label>
                      <Input 
                        type="number"
                        min="1"
                        value={editingItem.data.current_season || ''} 
                        onChange={(e) => updateEditingData('current_season', parseInt(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Rating (1-10)</label>
                      <Input 
                        type="number"
                        min="1"
                        max="10"
                        value={editingItem.data.rating || ''} 
                        onChange={(e) => updateEditingData('rating', parseInt(e.target.value) || null)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Platform</label>
                      <Input 
                        value={editingItem.data.platform || ''} 
                        onChange={(e) => updateEditingData('platform', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea 
                        value={editingItem.data.notes || ''} 
                        onChange={(e) => updateEditingData('notes', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'books' && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input 
                        value={editingItem.data.title || ''} 
                        onChange={(e) => updateEditingData('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Author</label>
                      <Input 
                        value={editingItem.data.author || ''} 
                        onChange={(e) => updateEditingData('author', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">ISBN</label>
                      <Input 
                        value={editingItem.data.isbn || ''} 
                        onChange={(e) => updateEditingData('isbn', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea 
                        value={editingItem.data.description || ''} 
                        onChange={(e) => updateEditingData('description', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cover URL</label>
                      <Input 
                        value={editingItem.data.cover_url || ''} 
                        onChange={(e) => updateEditingData('cover_url', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Page Count</label>
                      <Input 
                        type="number"
                        min="1"
                        value={editingItem.data.page_count || 0} 
                        onChange={(e) => updateEditingData('page_count', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Current Page</label>
                      <Input 
                        type="number"
                        min="1"
                        max={editingItem.data.page_count || 1}
                        value={editingItem.data.current_page || 1} 
                        onChange={(e) => updateEditingData('current_page', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={saveEdit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}