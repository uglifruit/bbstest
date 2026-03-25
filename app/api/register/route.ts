import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await request.json()
  const { handle, password } = body

  if (!handle || !password) {
    return NextResponse.json({ error: 'Handle and password required' }, { status: 400 })
  }

  const cleanHandle = handle.trim().toLowerCase()

  if (cleanHandle.length < 2 || cleanHandle.length > 20) {
    return NextResponse.json({ error: 'Handle must be 2-20 characters' }, { status: 400 })
  }

  if (!/^[a-z0-9_-]+$/.test(cleanHandle)) {
    return NextResponse.json({ error: 'Handle: letters, numbers, _ and - only' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const { error } = await supabase
    .from('users')
    .insert([{ handle: cleanHandle, password_hash: passwordHash }])

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Handle already taken' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
