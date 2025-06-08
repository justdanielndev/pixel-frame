import Database from 'better-sqlite3'
import { join } from 'path'

export interface CompanionNote {
  id: string
  content: string
  created_at: Date
  updated_at: Date
}

export interface SleepRecord {
  id: string
  date: String
  bedtime: string
  wake_time?: string
  quality_rating?: number
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface StudySession {
  id: string
  date: string
  start_time: string
  end_time: string
  subject: string
  duration_minutes: number
  productivity_rating: number
  focus_rating: number
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  due_date?: string
  due_time?: string
  completed: boolean
  completed_at?: Date
  priority: 'low' | 'medium' | 'high'
  category?: string
  created_at: Date
  updated_at: Date
}

export interface Appointment {
  id: string
  title: string
  description?: string
  date: string
  start_time: string
  end_time?: string
  location?: string
  type: 'exam' | 'class' | 'meeting' | 'appointment' | 'other'
  created_at: Date
  updated_at: Date
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  start_date?: string
  target_date?: string
  progress_percentage: number
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface ScreenTimeRecord {
  id: string
  date: string
  total_minutes: number
  productive_minutes: number
  social_minutes: number
  entertainment_minutes: number
  other_minutes: number
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface EnvironmentSettings {
  id: string
  home_temperature: number
  home_humidity: number
  air_quality: 'poor' | 'fair' | 'good' | 'excellent'
  blinds_position: number
  lights_brightness: number
  updated_at: Date
}

export interface CompanionSettings {
  id: string
  finals_start_date: string
  study_streak_goal: number
  daily_study_goal_minutes: number
  daily_reading_goal_minutes: number
  bedtime_goal: string
  weather_location: string
  updated_at: Date
}

export interface GlanceHistory {
  id: string
  insights: string
  timestamp: Date
  created_at: Date
}

export interface TVShow {
  id: string
  title: string
  status: 'watching' | 'completed' | 'on_hold' | 'plan_to_watch' | 'dropped'
  type: 'series' | 'movie' | 'documentary' | 'anime'
  current_episode?: number
  total_episodes?: number
  current_season?: number
  total_seasons?: number
  rating?: number
  notes?: string
  platform?: string
  created_at: Date
  updated_at: Date
}

export interface WeatherRecord {
  id: string
  timestamp: Date
  location: string
  temperature: number
  feels_like: number
  humidity: number
  pressure: number
  visibility: number
  wind_speed: number
  wind_direction: number
  description: string
  icon: string
  provider: string
  created_at: Date
}

class CompanionDatabase {
  private db: Database.Database

  constructor() {
    const dbPath = process.env.COMPANION_DB_PATH || join(process.cwd(), 'data', 'companion.db')
    
    const fs = require('fs')
    const path = require('path')
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
    
    this.db = new Database(dbPath)
    this.initializeTables()
  }

  private getGMT2Timestamp(): string {
    return new Date().toLocaleString('sv-SE', {
      timeZone: 'Europe/Berlin',
      hour12: false
    }).replace(' ', 'T') + '.000Z'
  }

  private initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS companion_notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sleep_records (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        bedtime TEXT NOT NULL,
        wake_time TEXT,
        quality_rating INTEGER CHECK(quality_rating BETWEEN 1 AND 5),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        subject TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        productivity_rating INTEGER NOT NULL CHECK(productivity_rating BETWEEN 1 AND 5),
        focus_rating INTEGER NOT NULL CHECK(focus_rating BETWEEN 1 AND 5),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        due_time TEXT,
        completed INTEGER DEFAULT 0,
        completed_at DATETIME,
        priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        location TEXT,
        type TEXT NOT NULL CHECK(type IN ('exam', 'class', 'meeting', 'appointment', 'other')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK(status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
        priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
        start_date TEXT,
        target_date TEXT,
        progress_percentage INTEGER DEFAULT 0 CHECK(progress_percentage BETWEEN 0 AND 100),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS screen_time_records (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        total_minutes INTEGER NOT NULL,
        productive_minutes INTEGER DEFAULT 0,
        social_minutes INTEGER DEFAULT 0,
        entertainment_minutes INTEGER DEFAULT 0,
        other_minutes INTEGER DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS environment_settings (
        id TEXT PRIMARY KEY DEFAULT 'current',
        home_temperature REAL NOT NULL,
        home_humidity REAL NOT NULL,
        air_quality TEXT NOT NULL CHECK(air_quality IN ('poor', 'fair', 'good', 'excellent')),
        blinds_position INTEGER NOT NULL CHECK(blinds_position BETWEEN 0 AND 100),
        lights_brightness INTEGER NOT NULL CHECK(lights_brightness BETWEEN 0 AND 100),
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS companion_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        finals_start_date TEXT NOT NULL,
        study_streak_goal INTEGER NOT NULL DEFAULT 14,
        daily_study_goal_minutes INTEGER NOT NULL DEFAULT 120,
        daily_reading_goal_minutes INTEGER NOT NULL DEFAULT 45,
        bedtime_goal TEXT NOT NULL DEFAULT '23:00',
        weather_location TEXT NOT NULL DEFAULT 'Valencia,ES',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS glance_history (
        id TEXT PRIMARY KEY,
        insights TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tv_shows (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('watching', 'completed', 'on_hold', 'plan_to_watch', 'dropped')),
        type TEXT NOT NULL CHECK(type IN ('series', 'movie', 'documentary', 'anime')),
        current_episode INTEGER,
        total_episodes INTEGER,
        current_season INTEGER,
        total_seasons INTEGER,
        rating INTEGER CHECK(rating BETWEEN 1 AND 10),
        notes TEXT,
        platform TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS weather_records (
        id TEXT PRIMARY KEY,
        timestamp DATETIME NOT NULL,
        location TEXT NOT NULL,
        temperature REAL NOT NULL,
        feels_like REAL NOT NULL,
        humidity INTEGER NOT NULL,
        pressure REAL NOT NULL,
        visibility REAL NOT NULL,
        wind_speed REAL NOT NULL,
        wind_direction REAL NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        provider TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_sleep_records_date ON sleep_records(date)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_screen_time_date ON screen_time_records(date)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_glance_history_timestamp ON glance_history(timestamp)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_tv_shows_status ON tv_shows(status)`)
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_weather_records_timestamp ON weather_records(timestamp)`)

    // Migration: Add due_time column to existing tasks table
    try {
      this.db.exec(`ALTER TABLE tasks ADD COLUMN due_time TEXT`)
    } catch (error) {
      // Column already exists, ignore error
    }
  }

  createNote(content: string): CompanionNote {
    const id = this.generateId()
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO companion_notes (id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(id, content, now, now)
    
    return this.getNote(id)!
  }

  getNote(id: string): CompanionNote | null {
    const stmt = this.db.prepare('SELECT * FROM companion_notes WHERE id = ?')
    const row = stmt.get(id) as any
    
    if (!row) return null
    
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  getAllNotes(): CompanionNote[] {
    const stmt = this.db.prepare('SELECT * FROM companion_notes ORDER BY created_at DESC')
    const rows = stmt.all() as any[]
    
    return rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  updateNote(id: string, content: string): CompanionNote | null {
    const stmt = this.db.prepare(`
      UPDATE companion_notes 
      SET content = ?, updated_at = ?
      WHERE id = ?
    `)
    stmt.run(content, this.getGMT2Timestamp(), id)
    
    return this.getNote(id)
  }

  deleteNote(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM companion_notes WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  upsertSleepRecord(record: Omit<SleepRecord, 'id' | 'created_at' | 'updated_at'>): SleepRecord {
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO sleep_records (id, date, bedtime, wake_time, quality_rating, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        bedtime = excluded.bedtime,
        wake_time = excluded.wake_time,
        quality_rating = excluded.quality_rating,
        notes = excluded.notes,
        updated_at = excluded.updated_at
    `)
    
    const id = this.generateId()
    stmt.run(id, record.date, record.bedtime, record.wake_time, record.quality_rating, record.notes, now, now)
    
    return this.getSleepRecord(record.date)!
  }

  getSleepRecord(date: string): SleepRecord | null {
    const stmt = this.db.prepare('SELECT * FROM sleep_records WHERE date = ?')
    const row = stmt.get(date) as any
    
    if (!row) return null
    
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  getRecentSleepRecords(days: number = 7): SleepRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM sleep_records 
      ORDER BY date DESC 
      LIMIT ?
    `)
    const rows = stmt.all(days) as any[]
    
    return rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  createStudySession(session: Omit<StudySession, 'id' | 'created_at' | 'updated_at'>): StudySession {
    const id = this.generateId()
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO study_sessions (id, date, start_time, end_time, subject, duration_minutes, productivity_rating, focus_rating, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, session.date, session.start_time, session.end_time, session.subject, session.duration_minutes, session.productivity_rating, session.focus_rating, session.notes, now, now)
    
    return this.getStudySession(id)!
  }

  getStudySession(id: string): StudySession | null {
    const stmt = this.db.prepare('SELECT * FROM study_sessions WHERE id = ?')
    const row = stmt.get(id) as any
    
    if (!row) return null
    
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  getStudySessionsForDateRange(startDate: string, endDate: string): StudySession[] {
    const stmt = this.db.prepare(`
      SELECT * FROM study_sessions 
      WHERE date BETWEEN ? AND ?
      ORDER BY date DESC, start_time DESC
    `)
    const rows = stmt.all(startDate, endDate) as any[]
    
    return rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed' | 'completed_at'>): Task {
    const id = this.generateId()
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, due_date, due_time, priority, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, task.title, task.description, task.due_date, task.due_time, task.priority, task.category, now, now)
    
    return this.getTask(id)!
  }

  getTask(id: string): Task | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?')
    const row = stmt.get(id) as any
    
    if (!row) return null
    
    return {
      ...row,
      completed: Boolean(row.completed),
      completed_at: row.completed_at ? new Date(row.completed_at) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  getAllTasks(): Task[] {
    const stmt = this.db.prepare('SELECT * FROM tasks ORDER BY completed ASC, due_date ASC, priority DESC')
    const rows = stmt.all() as any[]
    
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed),
      completed_at: row.completed_at ? new Date(row.completed_at) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  completeTask(id: string): Task | null {
    const stmt = this.db.prepare(`
      UPDATE tasks 
      SET completed = 1, completed_at = ?, updated_at = ?
      WHERE id = ?
    `)
    const now = this.getGMT2Timestamp()
    stmt.run(now, now, id)
    
    return this.getTask(id)
  }

  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Task | null {
    const current = this.getTask(id)
    if (!current) return null
    
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, due_date = ?, due_time = ?, priority = ?, category = ?, updated_at = ?
      WHERE id = ?
    `)
    
    stmt.run(
      updates.title || current.title,
      updates.description || current.description,
      updates.due_date || current.due_date,
      updates.due_time || current.due_time,
      updates.priority || current.priority,
      updates.category || current.category,
      now,
      id
    )
    
    return this.getTask(id)
  }

  deleteTask(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  getCompanionSettings(): CompanionSettings {
    const stmt = this.db.prepare('SELECT * FROM companion_settings WHERE id = ?')
    let settings = stmt.get('default') as any
    
    if (!settings) {
      const now = this.getGMT2Timestamp()
      const finalsDate = new Date()
      finalsDate.setDate(finalsDate.getDate() + 12)
      
      const insertStmt = this.db.prepare(`
        INSERT INTO companion_settings (id, finals_start_date, study_streak_goal, daily_study_goal_minutes, daily_reading_goal_minutes, bedtime_goal, weather_location, updated_at)
        VALUES ('default', ?, 14, 120, 45, '23:00', 'Valencia,ES', ?)
      `)
      insertStmt.run(finalsDate.toISOString().split('T')[0], now)
      settings = stmt.get('default')
    }
    
    return {
      ...settings,
      updated_at: new Date(settings.updated_at)
    }
  }

  updateCompanionSettings(updates: Partial<Omit<CompanionSettings, 'id' | 'updated_at'>>): CompanionSettings {
    const current = this.getCompanionSettings()
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      UPDATE companion_settings 
      SET finals_start_date = ?, study_streak_goal = ?, daily_study_goal_minutes = ?, 
          daily_reading_goal_minutes = ?, bedtime_goal = ?, weather_location = ?, updated_at = ?
      WHERE id = 'default'
    `)
    
    stmt.run(
      updates.finals_start_date || current.finals_start_date,
      updates.study_streak_goal || current.study_streak_goal,
      updates.daily_study_goal_minutes || current.daily_study_goal_minutes,
      updates.daily_reading_goal_minutes || current.daily_reading_goal_minutes,
      updates.bedtime_goal || current.bedtime_goal,
      updates.weather_location || current.weather_location,
      now
    )
    
    return this.getCompanionSettings()
  }

  updateEnvironmentSettings(settings: Omit<EnvironmentSettings, 'id' | 'updated_at'>): EnvironmentSettings {
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO environment_settings (id, home_temperature, home_humidity, air_quality, blinds_position, lights_brightness, updated_at)
      VALUES ('current', ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        home_temperature = excluded.home_temperature,
        home_humidity = excluded.home_humidity,
        air_quality = excluded.air_quality,
        blinds_position = excluded.blinds_position,
        lights_brightness = excluded.lights_brightness,
        updated_at = excluded.updated_at
    `)
    
    stmt.run(settings.home_temperature, settings.home_humidity, settings.air_quality, settings.blinds_position, settings.lights_brightness, now)
    
    return this.getEnvironmentSettings()!
  }

  getEnvironmentSettings(): EnvironmentSettings | null {
    const stmt = this.db.prepare('SELECT * FROM environment_settings WHERE id = ?')
    const row = stmt.get('current') as any
    
    if (!row) return null
    
    return {
      ...row,
      updated_at: new Date(row.updated_at)
    }
  }

  createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Appointment {
    const id = this.generateId()
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO appointments (id, title, description, date, start_time, end_time, location, type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, appointment.title, appointment.description, appointment.date, appointment.start_time, appointment.end_time, appointment.location, appointment.type, now, now)
    
    return this.getAppointment(id)!
  }

  getAppointment(id: string): Appointment | null {
    const stmt = this.db.prepare('SELECT * FROM appointments WHERE id = ?')
    const row = stmt.get(id) as any
    
    if (!row) return null
    
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  getAllAppointments(): Appointment[] {
    const stmt = this.db.prepare('SELECT * FROM appointments ORDER BY date ASC, start_time ASC')
    const rows = stmt.all() as any[]
    
    return rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  getUpcomingAppointments(days: number = 7): Appointment[] {
    const today = this.getGMT2Timestamp().split('T')[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    const futureDateStr = futureDate.toISOString().split('T')[0]
    
    const stmt = this.db.prepare(`
      SELECT * FROM appointments 
      WHERE date BETWEEN ? AND ?
      ORDER BY date ASC, start_time ASC
    `)
    const rows = stmt.all(today, futureDateStr) as any[]
    
    return rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  updateAppointment(id: string, updates: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>): Appointment | null {
    const current = this.getAppointment(id)
    if (!current) return null
    
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      UPDATE appointments 
      SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, location = ?, type = ?, updated_at = ?
      WHERE id = ?
    `)
    
    stmt.run(
      updates.title || current.title,
      updates.description || current.description,
      updates.date || current.date,
      updates.start_time || current.start_time,
      updates.end_time || current.end_time,
      updates.location || current.location,
      updates.type || current.type,
      now,
      id
    )
    
    return this.getAppointment(id)
  }

  deleteAppointment(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM appointments WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
    const id = this.generateId()
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, description, status, priority, start_date, target_date, progress_percentage, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, project.name, project.description, project.status, project.priority, project.start_date, project.target_date, project.progress_percentage, project.notes, now, now)
    
    return this.getProject(id)!
  }

  getProject(id: string): Project | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?')
    const row = stmt.get(id) as any
    
    if (!row) return null
    
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  getAllProjects(): Project[] {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY priority DESC, status ASC, created_at DESC')
    const rows = stmt.all() as any[]
    
    return rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  getActiveProjects(): Project[] {
    const stmt = this.db.prepare(`
      SELECT * FROM projects 
      WHERE status IN ('planning', 'in_progress')
      ORDER BY priority DESC, created_at DESC
    `)
    const rows = stmt.all() as any[]
    
    return rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Project | null {
    const current = this.getProject(id)
    if (!current) return null
    
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      UPDATE projects 
      SET name = ?, description = ?, status = ?, priority = ?, start_date = ?, target_date = ?, progress_percentage = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `)
    
    stmt.run(
      updates.name || current.name,
      updates.description || current.description,
      updates.status || current.status,
      updates.priority || current.priority,
      updates.start_date || current.start_date,
      updates.target_date || current.target_date,
      updates.progress_percentage !== undefined ? updates.progress_percentage : current.progress_percentage,
      updates.notes || current.notes,
      now,
      id
    )
    
    return this.getProject(id)
  }

  deleteProject(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  upsertScreenTimeRecord(record: Omit<ScreenTimeRecord, 'id' | 'created_at' | 'updated_at'>): ScreenTimeRecord {
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO screen_time_records (id, date, total_minutes, productive_minutes, social_minutes, entertainment_minutes, other_minutes, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        total_minutes = excluded.total_minutes,
        productive_minutes = excluded.productive_minutes,
        social_minutes = excluded.social_minutes,
        entertainment_minutes = excluded.entertainment_minutes,
        other_minutes = excluded.other_minutes,
        notes = excluded.notes,
        updated_at = excluded.updated_at
    `)
    
    const id = this.generateId()
    stmt.run(id, record.date, record.total_minutes, record.productive_minutes, record.social_minutes, record.entertainment_minutes, record.other_minutes, record.notes, now, now)
    
    return this.getScreenTimeRecord(record.date)!
  }

  getScreenTimeRecord(date: string): ScreenTimeRecord | null {
    const stmt = this.db.prepare('SELECT * FROM screen_time_records WHERE date = ?')
    const row = stmt.get(date) as any
    
    if (!row) return null
    
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  getRecentScreenTimeRecords(days: number = 7): ScreenTimeRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM screen_time_records 
      ORDER BY date DESC 
      LIMIT ?
    `)
    const rows = stmt.all(days) as any[]
    
    return rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  updateScreenTimeRecord(id: string, updates: Partial<Omit<ScreenTimeRecord, 'id' | 'created_at' | 'updated_at'>>): ScreenTimeRecord | null {
    const current = this.getScreenTimeRecord(updates.date || '')
    if (!current) return null
    
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      UPDATE screen_time_records 
      SET date = ?, total_minutes = ?, productive_minutes = ?, social_minutes = ?, entertainment_minutes = ?, other_minutes = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `)
    
    stmt.run(
      updates.date || current.date,
      updates.total_minutes !== undefined ? updates.total_minutes : current.total_minutes,
      updates.productive_minutes !== undefined ? updates.productive_minutes : current.productive_minutes,
      updates.social_minutes !== undefined ? updates.social_minutes : current.social_minutes,
      updates.entertainment_minutes !== undefined ? updates.entertainment_minutes : current.entertainment_minutes,
      updates.other_minutes !== undefined ? updates.other_minutes : current.other_minutes,
      updates.notes || current.notes,
      now,
      id
    )
    
    return this.getScreenTimeRecord(updates.date || current.date)
  }

  deleteScreenTimeRecord(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM screen_time_records WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  getStudyStreak(): number {
    const stmt = this.db.prepare(`
      SELECT DISTINCT date 
      FROM study_sessions 
      WHERE date <= date('now') 
      ORDER BY date DESC
    `)
    const dates = stmt.all() as { date: string }[]
    
    if (dates.length === 0) return 0
    
    let streak = 0
    let currentDate = new Date()
    currentDate.setDate(currentDate.getDate())
    
    for (const record of dates) {
      const recordDate = new Date(record.date)
      const diffTime = currentDate.getTime() - recordDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === streak) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  saveGlanceHistory(insights: string, timestamp: Date): GlanceHistory {
    const id = this.generateId()
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO glance_history (id, insights, timestamp, created_at)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(id, insights, timestamp.toISOString(), now)
    
    return this.getGlanceHistory(id)!
  }

  getGlanceHistory(id: string): GlanceHistory | null {
    const stmt = this.db.prepare('SELECT * FROM glance_history WHERE id = ?')
    const row = stmt.get(id) as any
    
    if (!row) return null
    
    return {
      ...row,
      timestamp: new Date(row.timestamp),
      created_at: new Date(row.created_at)
    }
  }

  getRecentGlanceHistory(limit: number = 5): GlanceHistory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM glance_history 
      ORDER BY timestamp DESC 
      LIMIT ?
    `)
    const rows = stmt.all(limit) as any[]
    
    return rows.map(row => ({
      ...row,
      timestamp: new Date(row.timestamp),
      created_at: new Date(row.created_at)
    }))
  }

  createTVShow(show: Omit<TVShow, 'id' | 'created_at' | 'updated_at'>): TVShow {
    const id = this.generateId()
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO tv_shows (id, title, status, type, current_episode, total_episodes, current_season, total_seasons, rating, notes, platform, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, show.title, show.status, show.type, show.current_episode, show.total_episodes, show.current_season, show.total_seasons, show.rating, show.notes, show.platform, now, now)
    
    return this.getTVShow(id)!
  }

  getTVShow(id: string): TVShow | null {
    const stmt = this.db.prepare('SELECT * FROM tv_shows WHERE id = ?')
    const row = stmt.get(id) as any
    
    if (!row) return null
    
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  getAllTVShows(): TVShow[] {
    const stmt = this.db.prepare('SELECT * FROM tv_shows ORDER BY updated_at DESC')
    const rows = stmt.all() as any[]
    
    return rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  getCurrentlyWatching(): TVShow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tv_shows 
      WHERE status = 'watching'
      ORDER BY updated_at DESC
    `)
    const rows = stmt.all() as any[]
    
    return rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  updateTVShow(id: string, updates: Partial<Omit<TVShow, 'id' | 'created_at' | 'updated_at'>>): TVShow | null {
    const current = this.getTVShow(id)
    if (!current) return null
    
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      UPDATE tv_shows 
      SET title = ?, status = ?, type = ?, current_episode = ?, total_episodes = ?, current_season = ?, total_seasons = ?, rating = ?, notes = ?, platform = ?, updated_at = ?
      WHERE id = ?
    `)
    
    stmt.run(
      updates.title || current.title,
      updates.status || current.status,
      updates.type || current.type,
      updates.current_episode !== undefined ? updates.current_episode : current.current_episode,
      updates.total_episodes !== undefined ? updates.total_episodes : current.total_episodes,
      updates.current_season !== undefined ? updates.current_season : current.current_season,
      updates.total_seasons !== undefined ? updates.total_seasons : current.total_seasons,
      updates.rating !== undefined ? updates.rating : current.rating,
      updates.notes || current.notes,
      updates.platform || current.platform,
      now,
      id
    )
    
    return this.getTVShow(id)
  }

  deleteTVShow(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM tv_shows WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  saveWeatherRecord(weatherData: Omit<WeatherRecord, 'id' | 'created_at'>): WeatherRecord {
    const id = this.generateId()
    const now = this.getGMT2Timestamp()
    
    const stmt = this.db.prepare(`
      INSERT INTO weather_records (id, timestamp, location, temperature, feels_like, humidity, pressure, visibility, wind_speed, wind_direction, description, icon, provider, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      id,
      weatherData.timestamp.toISOString(),
      weatherData.location,
      weatherData.temperature,
      weatherData.feels_like,
      weatherData.humidity,
      weatherData.pressure,
      weatherData.visibility,
      weatherData.wind_speed,
      weatherData.wind_direction,
      weatherData.description,
      weatherData.icon,
      weatherData.provider,
      now
    )
    
    return this.getWeatherRecord(id)!
  }

  getWeatherRecord(id: string): WeatherRecord | null {
    const stmt = this.db.prepare('SELECT * FROM weather_records WHERE id = ?')
    const row = stmt.get(id) as any
    
    if (!row) return null
    
    return {
      ...row,
      timestamp: new Date(row.timestamp),
      created_at: new Date(row.created_at)
    }
  }

  getRecentWeatherRecords(limit: number = 50): WeatherRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM weather_records 
      ORDER BY timestamp DESC 
      LIMIT ?
    `)
    const rows = stmt.all(limit) as any[]
    
    return rows.map(row => ({
      ...row,
      timestamp: new Date(row.timestamp),
      created_at: new Date(row.created_at)
    }))
  }

  getLatestWeatherRecord(): WeatherRecord | null {
    const stmt = this.db.prepare(`
      SELECT * FROM weather_records 
      ORDER BY timestamp DESC 
      LIMIT 1
    `)
    const row = stmt.get() as any
    
    if (!row) return null
    
    return {
      ...row,
      timestamp: new Date(row.timestamp),
      created_at: new Date(row.created_at)
    }
  }

  cleanOldWeatherRecords(daysToKeep: number = 7): number {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    
    const stmt = this.db.prepare('DELETE FROM weather_records WHERE timestamp < ?')
    const result = stmt.run(cutoffDate.toISOString())
    return result.changes
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  close(): void {
    this.db.close()
  }
}

let companionDbInstance: CompanionDatabase | null = null

export function getCompanionDatabase(): CompanionDatabase {
  if (!companionDbInstance) {
    companionDbInstance = new CompanionDatabase()
  }
  return companionDbInstance
}

export default CompanionDatabase