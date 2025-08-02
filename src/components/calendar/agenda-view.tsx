"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCalendarStore } from '@/store/calendar'
import { addDays, formatDate, formatTime, isSameDay } from '@/lib/utils'

export function AgendaView() {
  const { currentDate, setCurrentDate, events } = useCalendarStore()

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = addDays(currentDate, direction === 'next' ? 1 : -1)
    setCurrentDate(newDate)
  }

  // Get events for the next 7 days starting from current date
  const upcomingDays: Array<{ date: Date; events: typeof events }> = []
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(currentDate, i)
    const dayEvents = events
      .filter(event => isSameDay(new Date(event.startTime), date))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    
    upcomingDays.push({ date, events: dayEvents })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            Agenda View
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
        <div className="space-y-6">
          {upcomingDays.map(({ date, events: dayEvents }, index) => {
            const isToday = isSameDay(date, new Date())
            
            return (
              <div key={index} className="space-y-3">
                <div className={`flex items-center space-x-3 ${isToday ? 'text-primary' : ''}`}>
                  <h3 className="text-lg font-semibold">
                    {formatDate(date)}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  {isToday && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      Today
                    </span>
                  )}
                </div>

                {dayEvents.length === 0 ? (
                  <div className="text-muted-foreground italic pl-4">
                    No events scheduled
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: event.color || event.calendar.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {event.title}
                          </div>
                          {event.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </div>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div>
                              {event.isAllDay ? (
                                'All day'
                              ) : (
                                `${formatTime(new Date(event.startTime))} - ${formatTime(new Date(event.endTime))}`
                              )}
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                📍 {event.location}
                              </div>
                            )}
                            <div className="flex items-center">
                              📅 {event.calendar.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {index < upcomingDays.length - 1 && (
                  <hr className="border-border" />
                )}
              </div>
            )
          })}
        </div>

        {/* Show message if no events in the next 7 days */}
        {upcomingDays.every(day => day.events.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-lg font-medium mb-2">No upcoming events</div>
            <div className="text-sm">
              You have a clear schedule for the next 7 days
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
