import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateEventFromText } from '@/lib/openai'
import { z } from 'zod'

const parseRequestSchema = z.object({
  text: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper auth check
    const userId = "placeholder-user-id"

    const body = await request.json()
    const { text } = parseRequestSchema.parse(body)

    const eventData = await generateEventFromText(text, userId)

    return NextResponse.json(eventData)
  } catch (error) {
    console.error('Error parsing event text:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to parse event text' },
      { status: 500 }
    )
  }
}
