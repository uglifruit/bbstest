import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await request.json()
  const { handle, message } = body

  if (!handle || !message) {
    return NextResponse.json({ error: 'Handle and message are required' }, { status: 400 })
  }

  if (handle.length > 20) {
    return NextResponse.json({ error: 'Handle must be 20 characters or less' }, { status: 400 })
  }

  if (message.length > 500) {
    return NextResponse.json({ error: 'Message must be 500 characters or less' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{ handle: handle.trim(), message: message.trim() }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
