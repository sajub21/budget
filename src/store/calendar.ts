import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CalendarView, CalendarSettings, EventWithRelations, CalendarWithEvents } from '@/types'

interface CalendarStore {
  // View state
  currentView: CalendarView
  currentDate: Date
  selectedDate: Date | null
  
  // Data
  events: EventWithRelations[]
  calendars: CalendarWithEvents[]
  
  // Settings
  settings: CalendarSettings
  
  // Loading states
  isLoading: boolean
  
  // Actions
  setCurrentView: (view: CalendarView) => void
  setCurrentDate: (date: Date) => void
  setSelectedDate: (date: Date | null) => void
  setEvents: (events: EventWithRelations[]) => void
  setCalendars: (calendars: CalendarWithEvents[]) => void
  updateSettings: (settings: Partial<CalendarSettings>) => void
  setLoading: (loading: boolean) => void
  
  // Calendar operations
  addEvent: (event: EventWithRelations) => void
  updateEvent: (eventId: string, updates: Partial<EventWithRelations>) => void
  deleteEvent: (eventId: string) => void
  
  // Calendar management
  addCalendar: (calendar: CalendarWithEvents) => void
  updateCalendar: (calendarId: string, updates: Partial<CalendarWithEvents>) => void
  deleteCalendar: (calendarId: string) => void
  toggleCalendarVisibility: (calendarId: string) => void
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentView: 'month',
      currentDate: new Date(),
      selectedDate: null,
      events: [],
      calendars: [],
      settings: {
        view: 'month',
        showWeekends: true,
        startOfWeek: 0,
        timeFormat: '12h',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      isLoading: false,

      // Actions
      setCurrentView: (view) => set({ currentView: view }),
      setCurrentDate: (date) => set({ currentDate: date }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setEvents: (events) => set({ events }),
      setCalendars: (calendars) => set({ calendars }),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      setLoading: (loading) => set({ isLoading: loading }),

      // Calendar operations
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),
      
      updateEvent: (eventId, updates) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId ? { ...event, ...updates } : event
          ),
        })),
      
      deleteEvent: (eventId) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== eventId),
        })),

      // Calendar management
      addCalendar: (calendar) =>
        set((state) => ({
          calendars: [...state.calendars, calendar],
        })),
      
      updateCalendar: (calendarId, updates) =>
        set((state) => ({
          calendars: state.calendars.map((calendar) =>
            calendar.id === calendarId ? { ...calendar, ...updates } : calendar
          ),
        })),
      
      deleteCalendar: (calendarId) =>
        set((state) => ({
          calendars: state.calendars.filter((calendar) => calendar.id !== calendarId),
          events: state.events.filter((event) => event.calendarId !== calendarId),
        })),
      
      toggleCalendarVisibility: (calendarId) =>
        set((state) => ({
          calendars: state.calendars.map((calendar) =>
            calendar.id === calendarId
              ? { ...calendar, isVisible: !calendar.isVisible }
              : calendar
          ),
        })),
    }),
    {
      name: 'dicalen-calendar-store',
      partialize: (state) => ({
        settings: state.settings,
        currentView: state.currentView,
      }),
    }
  )
)
