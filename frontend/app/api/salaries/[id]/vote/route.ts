import { NextRequest, NextResponse } from 'next/server'

const BFF_API_BASE_URL = process.env.BFF_API_BASE_URL ?? 'http://localhost:8086/api'

interface RouteContext {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { voteType } = await request.json()

    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    const authHeader = request.headers.get('authorization')
    const response = await fetch(`${BFF_API_BASE_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {})
      },
      body: JSON.stringify({
        submissionId: params.id,
        voteType
      })
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error ?? data?.message ?? 'Failed to submit vote' },
        { status: response.status }
      )
    }

    return NextResponse.json(data ?? { message: 'Vote submitted' }, { status: response.status })
  } catch {
    return NextResponse.json({ error: 'Backend service unavailable' }, { status: 503 })
  }
}