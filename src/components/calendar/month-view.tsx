"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCalendarStore } from '@/store/calendar'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, formatDate } from '@/lib/utils'

export function MonthView() {
  const { currentDate, setCurrentDate, events, selectedDate, setSelectedDate } = useCalendarStore()
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = []
  let day = calendarStart

  while (day <= calendarEnd) {
    days.push(new Date(day))
    day = addDays(day, 1)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const today = new Date()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-px mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
            <div
              key={dayName}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {days.map((day, dayIdx) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth()
            const isToday = isSameDay(day, today)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const dayEvents = events.filter(event => 
              isSameDay(new Date(event.startTime), day)
            )

            return (
              <div
                key={dayIdx}
                className={`
                  calendar-cell min-h-[100px] bg-background p-2 cursor-pointer hover:bg-muted/50
                  ${isToday ? 'bg-primary/5 border-primary' : ''}
                  ${isSelected ? 'bg-primary/10 ring-2 ring-primary' : ''}
                  ${!isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''}
                `}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="event-item text-xs px-1 py-0.5 rounded truncate"
                      style={{ backgroundColor: event.color || event.calendar.color }}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected date info */}
        {selectedDate && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">
              {formatDate(selectedDate)}
            </h3>
            <div className="space-y-2">
              {events
                .filter(event => isSameDay(new Date(event.startTime), selectedDate))
                .map((event) => (
                  <div key={event.id} className="text-sm">
                    <span className="font-medium">{event.title}</span>
                    {event.location && (
                      <span className="text-muted-foreground ml-2">
                        📍 {event.location}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
