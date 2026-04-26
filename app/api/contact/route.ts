import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// TODO: Add rate limiting in production using tools like rate-limit or upstash

interface ContactFormData {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()

    // Validate required fields
    const { name, email, subject, message } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get SMTP configuration from environment variables
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const contactEmail = process.env.CONTACT_EMAIL

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !contactEmail) {
      console.error('Missing SMTP configuration in environment variables')
      return NextResponse.json(
        { error: 'Email service is not properly configured' },
        { status: 500 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: parseInt(smtpPort, 10) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // Email content
    const emailContent = `
Name: ${name}
Email: ${email}

Subject: ${subject}

Message:
${message}
    `.trim()

    // Send email
    await transporter.sendMail({
      from: smtpUser,
      to: contactEmail,
      subject: `New Contact Form Submission: ${subject}`,
      text: emailContent,
      replyTo: email,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
