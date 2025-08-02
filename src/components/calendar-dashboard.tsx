"use client"

import { useState, useEffect } from 'react'
import { Calendar, Plus, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarView } from '@/components/calendar/calendar-view'
import { EventFormDialog } from '@/components/events/event-form-dialog'
import { useCalendarStore } from '@/store/calendar'
import { useAuthStore } from '@/store/auth'

export function CalendarDashboard() {
  const [showEventDialog, setShowEventDialog] = useState(false)
  const { currentView, setCurrentView } = useCalendarStore()
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">DiCalen</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Button
                  variant={currentView === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('day')}
                >
                  Day
                </Button>
                <Button
                  variant={currentView === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('week')}
                >
                  Week
                </Button>
                <Button
                  variant={currentView === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('month')}
                >
                  Month
                </Button>
                <Button
                  variant={currentView === 'agenda' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('agenda')}
                >
                  Agenda
                </Button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowEventDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
              
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Welcome back!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {user?.name || 'User'}
                </p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Today:</span> 3 events
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">This week:</span> 12 events
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Upcoming:</span> 2 reminders
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowEventDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  New Calendar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-3">
            <CalendarView />
          </div>
        </div>
      </main>

      {/* Event Form Dialog */}
      <EventFormDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
      />
    </div>
  )
}
