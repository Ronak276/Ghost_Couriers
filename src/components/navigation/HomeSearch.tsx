import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { LuMic, LuMicOff, LuSearch } from 'react-icons/lu'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const prompts = ['Search for a spicy burger', 'Search for pizza', 'Search for a poke bowl', 'Search for barbecue']
type Recognition = {
  lang: string
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

export function HomeSearch() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [promptIndex, setPromptIndex] = useState(0)
  const [focused, setFocused] = useState(false)
  const [listening, setListening] = useState(false)
  const [status, setStatus] = useState('')
  const reducedMotion = useReducedMotion()
  const recognition = useRef<Recognition | null>(null)

  useEffect(() => {
    if (reducedMotion || focused || query || listening) return
    const timer = window.setInterval(() => setPromptIndex(index => (index + 1) % prompts.length), 2500)
    return () => window.clearInterval(timer)
  }, [focused, query, listening, reducedMotion])

  useEffect(() => () => {
    const active = recognition.current
    if (active) {
      active.onend = active.onerror = active.onresult = null
      active.abort()
    }
  }, [])

  function search(value: string) {
    setParams(current => {
      const next = new URLSearchParams(current)
      if (value) next.set('q', value)
      else next.delete('q')
      return next
    }, { replace: true })
  }

  function voiceSearch() {
    if (recognition.current) {
      recognition.current.stop()
      return
    }
    const browser = window as Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
    const SpeechRecognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setStatus('Voice search is unavailable in this browser. You can type your search.')
      return
    }
    const session = new SpeechRecognition()
    recognition.current = session
    session.lang = 'en-US'
    session.onresult = event => {
      const transcript = event.results[0]?.[0]?.transcript.trim().replace(/[.!?]+$/, '')
      if (transcript) search(transcript)
      setStatus('')
    }
    session.onerror = event => {
      setStatus(event.error === 'not-allowed'
        ? 'Microphone access was denied. You can type your search.'
        : 'Voice search could not hear you. Try again or type your search.')
    }
    session.onend = () => {
      recognition.current = null
      setListening(false)
      setStatus(current => current === 'Listening…' ? '' : current)
    }
    try {
      session.start()
      setListening(true)
      setStatus('Listening…')
    } catch {
      recognition.current = null
      setStatus('Voice search could not start. You can type your search.')
    }
  }

  return <div className="home-search">
    <div className="search-row">
      <label className="search home-search-field">
        <LuSearch aria-hidden="true" />
        <Input aria-label="Search restaurants or dishes" value={query} onChange={event => search(event.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={focused ? 'Search restaurants or dishes' : undefined} />
        {!query && !focused && <span className="search-prompt" aria-hidden="true">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={promptIndex} initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -9 }} transition={{ duration: reducedMotion ? 0 : 0.24 }}>{prompts[promptIndex]}</motion.span>
          </AnimatePresence>
        </span>}
      </label>
      <Button type="button" size="icon" variant="outline" className="voice-search" aria-label={listening ? 'Stop voice search' : 'Voice search'}
        aria-pressed={listening} onClick={voiceSearch}>{listening ? <LuMicOff /> : <LuMic />}</Button>
    </div>
    <p className="voice-status" role="status">{status}</p>
  </div>
}