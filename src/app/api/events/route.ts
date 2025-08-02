import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  isAllDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.string().optional(),
  calendarId: z.string(),
  reminders: z.array(z.number()).optional(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().positive(),
    endDate: z.string().datetime().optional(),
    count: z.number().positive().optional(),
    byWeekDay: z.array(z.number().min(0).max(6)).optional(),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper auth check
    const userId = "placeholder-user-id"

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const calendarId = searchParams.get('calendarId')

    const where: any = {
      userId: userId,
    }

    if (startDate && endDate) {
      where.OR = [
        {
          startTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          endTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          AND: [
            { startTime: { lte: new Date(startDate) } },
            { endTime: { gte: new Date(endDate) } },
          ],
        },
      ]
    }

    if (calendarId) {
      where.calendarId = calendarId
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        calendar: true,
        files: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper auth check
    const userId = "placeholder-user-id"

    const body = await request.json()
    const data = createEventSchema.parse(body)

    // Verify the calendar belongs to the user
    const calendar = await prisma.calendar.findFirst({
      where: {
        id: data.calendarId,
        userId: userId,
      },
    })

    if (!calendar) {
      return NextResponse.json(
        { error: 'Calendar not found' },
        { status: 404 }
      )
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        userId: userId,
        recurrence: data.recurrence || undefined,
        reminders: data.reminders || undefined,
      },
      include: {
        calendar: true,
        files: true,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
