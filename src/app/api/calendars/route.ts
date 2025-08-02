import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCalendarSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().default('#3b82f6'),
  isDefault: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper auth check
    const userId = "placeholder-user-id"

    const calendars = await prisma.calendar.findMany({
      where: {
        userId: userId,
      },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(calendars)
  } catch (error) {
    console.error('Error fetching calendars:', error)
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
    const data = createCalendarSchema.parse(body)

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.calendar.updateMany({
        where: {
          userId: userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const calendar = await prisma.calendar.create({
      data: {
        ...data,
        userId: userId,
      },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    })

    return NextResponse.json(calendar, { status: 201 })
  } catch (error) {
    console.error('Error creating calendar:', error)
    
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
