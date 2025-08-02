import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function generateEventFromText(text: string, userId: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a smart calendar assistant. Parse the user's natural language input and extract event details. 
          Return a JSON object with these fields:
          - title: string (event title)
          - description: string | null (optional description)
          - startTime: string (ISO 8601 datetime)
          - endTime: string (ISO 8601 datetime)
          - isAllDay: boolean
          - location: string | null (optional location)
          
          Current date/time context: ${new Date().toISOString()}
          
          If times are not specified, suggest reasonable defaults based on context.
          If the date is relative (like "tomorrow", "next week"), calculate the actual date.
          `,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Error generating event from text:', error)
    throw new Error('Failed to parse event from text')
  }
}

export async function suggestOptimalTime(
  title: string,
  preferredDate: string,
  duration: number, // in minutes
  existingEvents: Array<{ startTime: Date; endTime: Date }>
) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a calendar optimization assistant. Given an event title, preferred date, duration, and existing events, suggest the optimal time slot.
          
          Consider:
          - Common business hours (9 AM - 5 PM) for work events
          - Personal time preferences for personal events
          - Buffer time between meetings
          - Avoid conflicts with existing events
          
          Return a JSON object with:
          - suggestedStartTime: string (ISO 8601 datetime)
          - suggestedEndTime: string (ISO 8601 datetime)
          - reasoning: string (brief explanation)
          `,
        },
        {
          role: "user",
          content: `Event: "${title}"
          Preferred date: ${preferredDate}
          Duration: ${duration} minutes
          Existing events: ${JSON.stringify(existingEvents.map(e => ({
            start: e.startTime.toISOString(),
            end: e.endTime.toISOString()
          })))}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Error suggesting optimal time:', error)
    throw new Error('Failed to suggest optimal time')
  }
}
