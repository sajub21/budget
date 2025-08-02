"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCalendarStore } from '@/store/calendar'
import { addDays, formatDate, formatTime, isSameDay } from '@/lib/utils'

export function DayView() {
  const { currentDate, setCurrentDate, events } = useCalendarStore()

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = addDays(currentDate, direction === 'next' ? 1 : -1)
    setCurrentDate(newDate)
  }

  const dayEvents = events
    .filter(event => isSameDay(new Date(event.startTime), currentDate))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {formatDate(currentDate)}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDay('prev')}
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
              onClick={() => navigateDay('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* All day events */}
          {dayEvents.some(event => event.isAllDay) && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">All Day</h3>
              <div className="space-y-2">
                {dayEvents
                  .filter(event => event.isAllDay)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded text-sm"
                      style={{ backgroundColor: event.color || event.calendar.color }}
                    >
                      {event.title}
                      {event.location && (
                        <span className="ml-2 opacity-75">📍 {event.location}</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Timed events */}
          <div className="relative">
            {hours.map((hour) => {
              const hourEvents = dayEvents.filter(event => {
                if (event.isAllDay) return false
                const eventStart = new Date(event.startTime)
                return eventStart.getHours() === hour
              })

              return (
                <div key={hour} className="flex border-b border-border">
                  <div className="w-16 py-4 text-sm text-muted-foreground text-right pr-4">
                    {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                  </div>
                  <div className="flex-1 py-2 min-h-[60px] relative">
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="absolute left-2 right-2 p-2 rounded text-sm cursor-pointer hover:opacity-80"
                        style={{ 
                          backgroundColor: event.color || event.calendar.color,
                          top: `${(new Date(event.startTime).getMinutes() / 60) * 60}px`,
                          height: `${Math.max(30, (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60 * 60) * 60)}px`
                        }}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
                        </div>
                        {event.location && (
                          <div className="text-xs opacity-75">📍 {event.location}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
