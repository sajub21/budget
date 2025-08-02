import { User, Calendar, Event, File, Subscription } from '@prisma/client'

export type UserWithRelations = User & {
  calendars: Calendar[]
  subscription: Subscription | null
}

export type CalendarWithEvents = Calendar & {
  events: Event[]
}

export type EventWithRelations = Event & {
  calendar: Calendar
  files: File[]
}

export type CalendarView = 'day' | 'week' | 'month' | 'agenda'

export interface EventFormData {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  isAllDay?: boolean
  location?: string
  color?: string
  calendarId: string
  reminders?: number[] // minutes before event
  recurrence?: RecurrenceRule
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: Date
  count?: number
  byWeekDay?: number[] // 0 = Sunday, 1 = Monday, etc.
}

export interface CalendarSettings {
  view: CalendarView
  showWeekends: boolean
  startOfWeek: 0 | 1 // 0 = Sunday, 1 = Monday
  timeFormat: '12h' | '24h'
  timezone: string
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
}

export interface AIEventSuggestion {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  confidence: number
}
