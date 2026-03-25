'use client'

import { useState, useEffect, useRef } from 'react'
import type { Message } from '@/lib/supabase'

const ASCII_BANNER = `
 ██████╗ ██████╗ ███████╗███████╗███╗   ██╗    ██████╗ ██████╗ ███████╗
██╔════╝ ██╔══██╗██╔════╝██╔════╝████╗  ██║    ██╔══██╗██╔══██╗██╔════╝
██║  ███╗██████╔╝█████╗  █████╗  ██╔██╗ ██║    ██████╔╝██████╔╝███████╗
██║   ██║██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║    ██╔══██╗██╔══██╗╚════██║
╚██████╔╝██║  ██║███████╗███████╗██║ ╚████║    ██████╔╝██████╔╝███████║
 ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝    ╚═════╝ ╚═════╝ ╚══════╝`

const SMALL_BANNER = ` ___ ___ ___ ___ _  _   ___ ___ ___
/ __| _ \\ __| __| \\| | | _ ) _ \\ __|
| (_ |   / _|| _|| .\` | | _ \\  _/__ \\
\\___|_|_\\___|___|_|\\_| |___/_|  |___/`

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
    <div className="crt-screen p-4 font-mono text-sm leading-6 text-green-400 min-h-screen bg-black">
      {lines.map((line, i) => (
        <div key={i}>{line || '\u00A0'}</div>
      ))}
      <span className="blink">█</span>
    </div>
  )
}

export default function Home() {
  const [booted, setBooted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [handle, setHandle] = useState('')
  const [messageText, setMessageText] = useState('')
  const [status, setStatus] = useState<string>('READY.')
  const [isPosting, setIsPosting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const formRef = useRef<HTMLDivElement>(null)

  async function fetchMessages() {
    try {
      const res = await fetch('/api/messages')
      if (!res.ok) throw new Error('Failed to fetch')
      const data: Message[] = await res.json()
      setMessages(data)
      setStatus('READY.')
    } catch {
      setStatus('ERR: COULD NOT REACH DATABASE.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (booted) {
      fetchMessages()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted])

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!handle.trim() || !messageText.trim()) {
      setStatus('ERR: HANDLE AND MESSAGE REQUIRED.')
      return
    }
    setIsPosting(true)
    setStatus('TRANSMITTING...')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim(), message: messageText.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus(`ERR: ${data.error?.toUpperCase() ?? 'UNKNOWN ERROR'}`)
      } else {
        setMessageText('')
        setStatus('MESSAGE POSTED SUCCESSFULLY.')
        await fetchMessages()
      }
    } catch {
      setStatus('ERR: TRANSMISSION FAILED.')
    } finally {
      setIsPosting(false)
    }
  }

  if (!booted) {
    return <BootSequence onDone={() => setBooted(true)} />
  }

  return (
    <main className="crt-screen min-h-screen bg-black text-green-400 p-2 md:p-4 font-mono">
      {/* Header */}
      <div className="mb-4">
        <pre className="text-green-400 text-[7px] md:text-[9px] leading-tight hidden md:block overflow-x-auto">
          {ASCII_BANNER}
        </pre>
        <pre className="text-green-400 text-[8px] leading-tight md:hidden">
          {SMALL_BANNER}
        </pre>
        <div className="border-t border-b border-green-700 py-1 mt-2 flex flex-wrap gap-x-4 text-xs text-green-600">
          <span>■ SYSTEM: GREEN BBS v2.3</span>
          <span>■ NODE: PUBLIC-1</span>
          <span>■ DATE: {new Date().toLocaleDateString('en-US')}</span>
          <span>■ MSGS SHOWN: LAST 12</span>
        </div>
      </div>

      {/* Message Board */}
      <div className="mb-4">
        <div className="text-green-600 text-xs mb-0">
          ┌──────────────────────────── MESSAGE BASE ──────────────────────────────────────────┐
        </div>
        <div className="border-x border-green-800 bg-black min-h-48 max-h-96 overflow-y-auto scrollbar-bbs p-2">
          {isLoading && (
            <div className="text-green-600 text-sm">
              LOADING MESSAGES FROM DATABASE<span className="blink">_</span>
            </div>
          )}
          {!isLoading && messages.length === 0 && (
            <div className="text-green-600 text-sm">
              NO MESSAGES FOUND. BE THE FIRST TO POST!
            </div>
          )}
          {!isLoading && messages.map((msg, index) => (
            <div key={msg.id} className="mb-3 border-b border-green-900 pb-2 last:border-0">
              <div className="flex flex-wrap gap-x-3 text-xs mb-1">
                <span className="text-green-500">[{String(messages.length - index).padStart(2, '0')}]</span>
                <span className="text-yellow-400">FROM: {msg.handle.toUpperCase()}</span>
                <span className="text-green-600">DATE: {formatDate(msg.created_at)}</span>
              </div>
              <div className="text-green-300 text-sm pl-6 whitespace-pre-wrap break-words leading-relaxed">
                {msg.message}
              </div>
            </div>
          ))}
        </div>
        <div className="text-green-600 text-xs mt-0">
          └────────────────────────────────────────────────────────────────────────────────────┘
        </div>
      </div>

      {/* Post Form */}
      <div className="mb-4" ref={formRef}>
        <div className="text-green-600 text-xs mb-0">
          ┌─────────────────────────── COMPOSE MESSAGE ────────────────────────────────────────┐
        </div>
        <div className="border-x border-green-800 bg-black p-3">
          <form onSubmit={handlePost} className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-green-600 text-xs w-20 shrink-0">HANDLE:</label>
              <input
                type="text"
                value={handle}
                onChange={e => setHandle(e.target.value)}
                placeholder="YOUR_HANDLE"
                maxLength={20}
                className="flex-1 px-2 py-1 text-sm"
                disabled={isPosting}
              />
              <span className="text-green-700 text-xs shrink-0">{handle.length}/20</span>
            </div>
            <div className="flex gap-2">
              <label className="text-green-600 text-xs w-20 shrink-0 pt-1">MESSAGE:</label>
              <div className="flex-1">
                <textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="TYPE YOUR MESSAGE HERE..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-2 py-1 text-sm resize-none"
                  disabled={isPosting}
                />
                <div className="text-right text-green-700 text-xs">{messageText.length}/500</div>
              </div>
            </div>
            <div className="flex items-center gap-4 pl-20">
              <button
                type="submit"
                disabled={isPosting}
                className="px-4 py-1 text-sm border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPosting ? '[ SENDING... ]' : '[ POST MESSAGE ]'}
              </button>
              <button
                type="button"
                onClick={fetchMessages}
                disabled={isLoading}
                className="px-4 py-1 text-sm border border-green-700 text-green-600 hover:bg-green-900 transition-colors disabled:opacity-50 cursor-pointer"
              >
                [ REFRESH ]
              </button>
            </div>
          </form>
        </div>
        <div className="text-green-600 text-xs mt-0">
          └────────────────────────────────────────────────────────────────────────────────────┘
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-green-800 pt-2 flex flex-wrap justify-between text-xs text-green-600 gap-2">
        <span>STATUS: <span className="text-green-400">{status}</span></span>
        <span className="text-green-800">■ SYSOP IS NOT WATCHING. PROBABLY.</span>
        <span><span className="blink text-green-400">█</span></span>
      </div>
    </main>
  )
}
