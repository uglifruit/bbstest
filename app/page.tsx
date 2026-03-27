'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import type { Message } from '@/lib/supabase'

// ── Responsive panel box ──────────────────────────────────────────────────

function Panel({
  title,
  children,
  footer,
}: {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="relative border border-green-800 mb-4 pt-4 pb-0">
      <span className="absolute -top-2.5 left-3 bg-black px-2 text-green-600 text-xs select-none">
        ── {title} ──
      </span>
      <div className="p-3">{children}</div>
      {footer && (
        <div className="border-t border-green-900 px-3 py-1 flex justify-end">
          {footer}
        </div>
      )}
    </div>
  )
}

const ASCII_BANNER = `
 ██████╗ ██████╗ ███████╗███████╗███╗   ██╗    ██████╗ ██████╗ ███████╗
██╔════╝ ██╔══██╗██╔════╝██╔════╝████╗  ██║    ██╔══██╗██╔══██╗██╔════╝
██║  ███╗██████╔╝█████╗  █████╗  ██╔██╗ ██║    ██████╔╝██████╔╝███████╗
██║   ██║██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║    ██╔══██╗██╔══██╗╚════██║
╚██████╔╝██║  ██║███████╗███████╗██║ ╚████║    ██████╔╝██████╔╝███████║
 ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝    ╚═════╝ ╚═════╝ ╚══════╝`

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd}/${yy} ${hh}:${min}`
}

function BootSequence({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([])
  const bootLines = [
    'INITIALIZING SYSTEM...',
    'CHECKING MEMORY... 640K OK',
    'LOADING COMM DRIVER v1.4...',
    'DIALING NODE 1... CONNECT 2400',
    'CARRIER DETECTED',
    'AUTHENTICATING...',
    'ACCESS GRANTED',
    '',
    'WELCOME TO GREEN BBS',
    'SYSOP: UNKNOWN  |  NODE: 1  |  USERS ONLINE: ???',
    '',
  ]

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setLines(prev => [...prev, bootLines[i]])
        i++
      } else {
        clearInterval(interval)
        setTimeout(onDone, 400)
      }
    }, 120)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="crt-screen p-4 text-sm leading-6 min-h-screen bg-black">
      {lines.map((line, i) => (
        <div key={i}>{line || '\u00A0'}</div>
      ))}
      <span className="blink">█</span>
    </div>
  )
}

// ── Auth Panel (shown when logged out) ─────────────────────────────────────

function AuthPanel({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [handle, setHandle] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!handle || !password) { setStatus('ERR: HANDLE AND PASSWORD REQUIRED.'); return }
    setBusy(true)
    setStatus('CONNECTING...')
    const res = await signIn('credentials', { handle: handle.toLowerCase(), password, redirect: false })
    setBusy(false)
    if (res?.error) {
      setStatus('ERR: INVALID HANDLE OR PASSWORD.')
    } else {
      setStatus('LOGON SUCCESSFUL.')
      onSuccess()
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!handle || !password) { setStatus('ERR: ALL FIELDS REQUIRED.'); return }
    if (password !== confirm) { setStatus('ERR: PASSWORDS DO NOT MATCH.'); return }
    setBusy(true)
    setStatus('REGISTERING NEW USER...')
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setBusy(false)
      setStatus(`ERR: ${data.error?.toUpperCase() ?? 'UNKNOWN ERROR'}`)
      return
    }
    // Auto-login after registration
    const login = await signIn('credentials', { handle: handle.toLowerCase(), password, redirect: false })
    setBusy(false)
    if (login?.error) {
      setStatus('REGISTERED. PLEASE LOG IN.')
      setMode('login')
    } else {
      setStatus('REGISTRATION COMPLETE. WELCOME!')
      onSuccess()
    }
  }

  const switchMode = (m: 'login' | 'register') => {
    setMode(m)
    setStatus('')
    setHandle('')
    setPassword('')
    setConfirm('')
  }

  return (
    <Panel title="LOGON">
      <div className="space-y-3">
        {/* Mode tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => switchMode('login')}
            className={`px-3 py-0.5 text-xs border transition-colors cursor-pointer ${
              mode === 'login'
                ? 'border-green-400 text-black bg-green-400'
                : 'border-green-700 text-green-600 hover:border-green-500 hover:text-green-400'
            }`}
          >
            [ LOG ON ]
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`px-3 py-0.5 text-xs border transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-green-400 text-black bg-green-400'
                : 'border-green-700 text-green-600 hover:border-green-500 hover:text-green-400'
            }`}
          >
            [ NEW USER ]
          </button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-green-600 text-xs w-24 shrink-0">HANDLE:</label>
            <input
              type="text"
              value={handle}
              onChange={e => setHandle(e.target.value)}
              placeholder="YOUR_HANDLE"
              maxLength={20}
              className="w-48 px-2 py-0.5 text-sm"
              disabled={busy}
              autoComplete="username"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-green-600 text-xs w-24 shrink-0">PASSWORD:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              maxLength={72}
              className="w-48 px-2 py-0.5 text-sm"
              disabled={busy}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          {mode === 'register' && (
            <div className="flex items-center gap-2">
              <label className="text-green-600 text-xs w-24 shrink-0">CONFIRM:</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                maxLength={72}
                className="w-48 px-2 py-0.5 text-sm"
                disabled={busy}
                autoComplete="new-password"
              />
            </div>
          )}
          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-0.5 text-sm border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
            >
              {busy ? '[ WAIT... ]' : mode === 'login' ? '[ LOGON ]' : '[ REGISTER ]'}
            </button>
            {status && (
              <span className={`text-xs ${status.startsWith('ERR') ? 'text-red-400' : 'text-green-400'}`}>
                {status}
              </span>
            )}
          </div>
        </form>
      </div>
    </Panel>
  )
}

// ── Compose Panel (shown when logged in) ───────────────────────────────────

function ComposePanel({ handle, onPosted }: { handle: string; onPosted: (status: string) => void }) {
  const [messageText, setMessageText] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!messageText.trim()) { setStatus('ERR: MESSAGE CANNOT BE EMPTY.'); return }
    setBusy(true)
    setStatus('TRANSMITTING...')
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageText.trim() }),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) {
      setStatus(`ERR: ${data.error?.toUpperCase() ?? 'FAILED'}`)
    } else {
      setMessageText('')
      setStatus('MESSAGE POSTED.')
      onPosted('MESSAGE POSTED SUCCESSFULLY.')
    }
  }

  return (
    <Panel title="COMPOSE MESSAGE">
      <form onSubmit={handlePost} className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-green-600 text-xs w-24 shrink-0">FROM:</label>
          <span className="text-yellow-400 text-sm">{handle.toUpperCase()}</span>
          <button
            type="button"
            onClick={() => signOut()}
            className="ml-auto px-3 py-0.5 text-xs border border-green-800 text-green-700 hover:border-red-700 hover:text-red-500 transition-colors cursor-pointer"
          >
            [ LOG OFF ]
          </button>
        </div>
        <div className="flex gap-2">
          <label className="text-green-600 text-xs w-24 shrink-0 pt-1">MESSAGE:</label>
          <div className="flex-1 min-w-0">
            <textarea
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="TYPE YOUR MESSAGE HERE..."
              maxLength={500}
              rows={4}
              className="w-full px-2 py-1 text-sm resize-none"
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}
              disabled={busy}
            />
            <div className="flex justify-between text-xs text-green-700 mt-0.5">
              {status
                ? <span className={status.startsWith('ERR') ? 'text-red-400' : 'text-green-400'}>{status}</span>
                : <span />
              }
              <span>{messageText.length}/500</span>
            </div>
          </div>
        </div>
        <div className="pl-24">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-0.5 text-sm border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
          >
            {busy ? '[ SENDING... ]' : '[ POST MESSAGE ]'}
          </button>
        </div>
      </form>
    </Panel>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Home() {
  const { data: session, status: sessionStatus } = useSession()
  const [booted, setBooted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [boardStatus, setBoardStatus] = useState('READY.')

  async function fetchMessages() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/messages')
      if (!res.ok) throw new Error()
      const data: Message[] = await res.json()
      setMessages(data)
      setBoardStatus('READY.')
    } catch {
      setBoardStatus('ERR: COULD NOT REACH DATABASE.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (booted) fetchMessages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted])

  if (!booted) return <BootSequence onDone={() => setBooted(true)} />

  const handle = session?.user?.name ?? null
  const authReady = sessionStatus !== 'loading'

  return (
    <main className="crt-screen min-h-screen bg-black p-2 md:p-4">
      {/* ── Header ── */}
      <div className="mb-4">
        <pre className="text-green-400 text-[7px] md:text-[9px] leading-tight hidden md:block overflow-x-auto select-none">
          {ASCII_BANNER}
        </pre>
        <div className="border-t border-b border-green-700 py-1 mt-2 flex flex-wrap gap-x-4 text-xs text-green-600">
          <span>■ SYSTEM: GREEN BBS v2.3</span>
          <span>■ NODE: PUBLIC-1</span>
          <span>■ DATE: {new Date().toLocaleDateString('en-US')}</span>
          {handle
            ? <span className="text-yellow-500">■ USER: {handle.toUpperCase()}</span>
            : <span>■ USER: GUEST</span>
          }
        </div>
      </div>

      {/* ── Message Board ── */}
      <Panel
        title="MESSAGE BASE"
        footer={
          <button
            onClick={fetchMessages}
            disabled={isLoading}
            className="text-green-700 hover:text-green-400 transition-colors disabled:opacity-40 cursor-pointer text-xs"
          >
            [ REFRESH ]
          </button>
        }
      >
        <div className="min-h-40 max-h-[36rem] overflow-y-auto scrollbar-bbs -m-3 px-2 py-2">
          {isLoading && (
            <div className="text-green-600 text-sm">
              LOADING MESSAGES<span className="blink">_</span>
            </div>
          )}
          {!isLoading && messages.length === 0 && (
            <div className="text-green-600 text-sm">NO MESSAGES YET. BE THE FIRST TO POST!</div>
          )}
          {!isLoading && messages.map((msg, index) => (
            <div key={msg.id} className="mb-3 border-b border-green-900 pb-2 last:border-0">
              <div className="flex flex-wrap gap-x-3 text-xs mb-1">
                <span className="text-green-500">[{String(messages.length - index).padStart(2, '0')}]</span>
                <span className="text-yellow-400">FROM: {msg.handle.toUpperCase()}</span>
                <span className="text-green-600">DATE: {formatDate(msg.created_at)}</span>
              </div>
              <div
                className="text-green-300 text-sm pl-6 leading-relaxed"
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}
              >
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Auth / Compose ── */}
      {!authReady && (
        <div className="text-green-700 text-xs py-2">CHECKING SESSION<span className="blink">_</span></div>
      )}
      {authReady && !handle && (
        <AuthPanel onSuccess={fetchMessages} />
      )}
      {authReady && handle && (
        <ComposePanel handle={handle} onPosted={(s) => { setBoardStatus(s); fetchMessages() }} />
      )}

      {/* ── Status Bar ── */}
      <div className="border-t border-green-900 mt-4 pt-2 flex flex-wrap justify-between text-xs text-green-700 gap-2">
        <span>STATUS: <span className="text-green-500">{boardStatus}</span></span>
        <span>■ SYSOP IS NOT WATCHING. PROBABLY.</span>
        <span className="blink text-green-500">█</span>
      </div>
    </main>
  )
}
