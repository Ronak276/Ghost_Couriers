import { useRef, useState, type PointerEvent } from 'react'
import { LuCheck, LuChevronRight } from 'react-icons/lu'
import { Button } from '@/components/ui/button'

export function SlideAction({ label, onAdvance }: { label: string; onAdvance: () => void }) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const gesture = useRef<{ id: number; start: number; distance: number } | null>(null)
  const suppressClick = useRef(false)

  function start(event: PointerEvent<HTMLButtonElement>) {
    if (gesture.current || !event.isPrimary || event.button !== 0) return
    suppressClick.current = false
    if (!(event.target instanceof Element) || !event.target.closest('.welcome-cta-icon')) return
    const distance = event.currentTarget.clientWidth - 45
    if (distance <= 0) return
    gesture.current = { id: event.pointerId, start: event.clientX, distance }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const drag = gesture.current
    if (!drag || drag.id !== event.pointerId) return
    const delta = event.clientX - drag.start
    if (Math.abs(delta) > 6) suppressClick.current = true
    setOffset(Math.max(0, Math.min(delta, drag.distance)))
  }

  function stop(event: PointerEvent<HTMLButtonElement>, complete: boolean) {
    const drag = gesture.current
    if (!drag || drag.id !== event.pointerId) return
    gesture.current = null
    setDragging(false)
    setOffset(0)
    const delta = event.clientX - drag.start
    suppressClick.current ||= Math.abs(delta) > 6
    if (complete && delta >= drag.distance * 0.65) onAdvance()
  }

  return <Button
    className="welcome-continue"
    data-dragging={dragging}
    onPointerDown={start}
    onPointerMove={move}
    onPointerUp={event => stop(event, true)}
    onPointerCancel={event => stop(event, false)}
    onLostPointerCapture={event => stop(event, false)}
    onClick={event => {
      if (event.detail === 0 || !suppressClick.current) onAdvance()
      suppressClick.current = false
    }}
  >
    <span className="welcome-cta-icon" aria-hidden="true" style={{ transform: `translateX(${offset}px)` }}><LuCheck /></span>
    <span>{label}</span>
    <span className="welcome-chevrons" aria-hidden="true"><LuChevronRight /><LuChevronRight /><LuChevronRight /></span>
  </Button>
}