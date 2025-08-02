import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendEventReminder({
  to,
  eventTitle,
  eventDate,
  eventTime,
  location,
}: {
  to: string
  eventTitle: string
  eventDate: string
  eventTime: string
  location?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'DiCalen <noreply@dicalen.com>',
      to: [to],
      subject: `Reminder: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Event Reminder</h2>
          <p>This is a reminder for your upcoming event:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #2563eb;">${eventTitle}</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${eventDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${eventTime}</p>
            ${location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>` : ''}
          </div>
          
          <p>Don't forget to prepare for your event!</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Sent by DiCalen - Your AI-powered calendar assistant
          </p>
        </div>
      `,
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error sending email reminder:', error)
    throw new Error('Failed to send email reminder')
  }
}

export async function sendDailySummary({
  to,
  date,
  events,
}: {
  to: string
  date: string
  events: Array<{
    title: string
    time: string
    location?: string
  }>
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'DiCalen <noreply@dicalen.com>',
      to: [to],
      subject: `Your schedule for ${date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Your Schedule for ${date}</h2>
          
          ${events.length === 0 
            ? '<p>You have no events scheduled for today. Enjoy your free time!</p>'
            : `
              <p>You have ${events.length} event${events.length === 1 ? '' : 's'} scheduled:</p>
              <div style="margin: 20px 0;">
                ${events.map(event => `
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #2563eb;">
                    <h4 style="margin: 0 0 5px 0; color: #1a1a1a;">${event.title}</h4>
                    <p style="margin: 2px 0; color: #6b7280;">${event.time}</p>
                    ${event.location ? `<p style="margin: 2px 0; color: #6b7280;">📍 ${event.location}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            `
          }
          
          <p>Have a great day!</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Sent by DiCalen - Your AI-powered calendar assistant
          </p>
        </div>
      `,
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error sending daily summary:', error)
    throw new Error('Failed to send daily summary')
  }
}
