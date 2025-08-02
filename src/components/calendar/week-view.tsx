"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCalendarStore } from '@/store/calendar'
import { startOfWeek, endOfWeek, addDays, formatDate, formatTime, isSameDay } from '@/lib/utils'

export function WeekView() {
  const { currentDate, setCurrentDate, events } = useCalendarStore()
  
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)

  const weekDays: Date[] = []
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i))
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(currentDate, direction === 'next' ? 7 : -7)
    setCurrentDate(newDate)
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const today = new Date()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {formatDate(weekStart)} - {formatDate(weekEnd)}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
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
              onClick={() => navigateWeek('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Days header */}
          <div className="flex border-b border-border">
            <div className="w-16"></div>
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, today)
              return (
                <div
                  key={index}
                  className={`flex-1 p-2 text-center border-l border-border ${
                    isToday ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="text-sm text-muted-foreground">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-medium ${isToday ? 'text-primary' : ''}`}>
                    {day.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* All day events */}
          <div className="flex border-b border-border">
            <div className="w-16 p-2 text-sm text-muted-foreground text-right">
              All day
            </div>
            {weekDays.map((day, dayIndex) => {
              const dayAllDayEvents = events.filter(event => 
                event.isAllDay && isSameDay(new Date(event.startTime), day)
              )

              return (
                <div
                  key={dayIndex}
                  className="flex-1 p-2 border-l border-border min-h-[40px]"
                >
                  {dayAllDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="mb-1 p-1 rounded text-xs truncate"
                      style={{ backgroundColor: event.color || event.calendar.color }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Hourly grid */}
          {hours.map((hour) => (
            <div key={hour} className="flex border-b border-border">
              <div className="w-16 py-4 text-sm text-muted-foreground text-right pr-4">
                {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
              </div>
              {weekDays.map((day, dayIndex) => {
                const hourEvents = events.filter(event => {
                  if (event.isAllDay) return false
                  const eventStart = new Date(event.startTime)
                  return isSameDay(eventStart, day) && eventStart.getHours() === hour
                })

                return (
                  <div
                    key={dayIndex}
                    className="flex-1 border-l border-border min-h-[60px] relative"
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 p-1 rounded text-xs cursor-pointer hover:opacity-80"
                        style={{ 
                          backgroundColor: event.color || event.calendar.color,
                          top: `${(new Date(event.startTime).getMinutes() / 60) * 60}px`,
                          height: `${Math.max(20, (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60 * 60) * 60)}px`
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="opacity-75 truncate">
                          {formatTime(new Date(event.startTime))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
