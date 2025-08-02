"use client"

import { useCalendarStore } from '@/store/calendar'
import { DayView } from './day-view'
import { WeekView } from './week-view'
import { MonthView } from './month-view'
import { AgendaView } from './agenda-view'

export function CalendarView() {
  const { currentView } = useCalendarStore()

  switch (currentView) {
    case 'day':
      return <DayView />
    case 'week':
      return <WeekView />
    case 'month':
      return <MonthView />
    case 'agenda':
      return <AgendaView />
    default:
      return <MonthView />
  }
}
