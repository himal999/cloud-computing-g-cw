import { NextRequest, NextResponse } from 'next/server'

const BFF_API_BASE_URL = process.env.BFF_API_BASE_URL ?? 'http://localhost:8086/api'

async function parseServiceResponse(response: Response) {
  const rawBody = await response.text()
  const contentType = response.headers.get('content-type') ?? ''

  if (!rawBody) {
    return null
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(rawBody)
    } catch {
      return { message: rawBody }
    }
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    return { message: rawBody }
  }
}

export async function GET() {
  try {
    const response = await fetch(`${BFF_API_BASE_URL}/search`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    const data = await parseServiceResponse(response)

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error ?? data?.message ?? 'Failed to fetch salaries' },
        { status: response.status }
      )
    }

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Backend service unavailable' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await fetch(`${BFF_API_BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await parseServiceResponse(response)

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error ?? data?.message ?? 'Failed to submit salary' },
        { status: response.status }
      )
    }

    return NextResponse.json(data ?? { message: 'Salary submitted' }, { status: response.status })
  } catch {
    return NextResponse.json({ error: 'Backend service unavailable' }, { status: 503 })
  }
}