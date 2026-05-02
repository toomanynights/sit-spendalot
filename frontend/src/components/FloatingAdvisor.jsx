import { useEffect, useRef, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import tips from '../data/advisorTips.json'

function pickRandomTip(exclude) {
  if (!Array.isArray(tips) || tips.length === 0) return 'Guard thy treasury well.'
  if (tips.length === 1) return tips[0]

  let next = tips[Math.floor(Math.random() * tips.length)]
  while (next === exclude) {
    next = tips[Math.floor(Math.random() * tips.length)]
  }
  return next
}

export default function FloatingAdvisor() {
  const initialTip = useMemo(() => pickRandomTip(), [])
  const [isOpen, setIsOpen] = useState(false)
  const [tip, setTip] = useState(initialTip)
  const [imageFailed, setImageFailed] = useState(false)
  const buttonRef = useRef(null)
  const containerRef = useRef(null)

  function deactivate() {
    setIsOpen(false)
    buttonRef.current?.blur()
  }

  function openWithFreshTip() {
    setTip(prev => pickRandomTip(prev))
    setIsOpen(true)
  }

  function handleClick() {
    if (isOpen) {
      deactivate()
      return
    }
    openWithFreshTip()
  }

  useEffect(() => {
    if (!isOpen) return
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        deactivate()
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="advisor-float">
      <button
        ref={buttonRef}
        type="button"
        className={`advisor-badge${isOpen ? ' advisor-badge--open' : ''}`}
        onClick={handleClick}
        aria-label="Toggle Sir Spendalot advisor"
        aria-expanded={isOpen}
      >
        <span className="advisor-glow-ring" />
        <span className="advisor-badge-core">
          {!imageFailed ? (
            <img
              src="/images/sir-spendalot-badge.png"
              alt="Sir Spendalot"
              className="w-full h-full object-cover rounded-full"
              onError={() => setImageFailed(true)}
            />
          ) : (
            'SS'
          )}
        </span>
      </button>

      {isOpen && (
        <div className="advisor-speech-bubble">
          <p className="advisor-bubble-title">
            <Info size={14} />
            Counsel from Sir Spendalot
          </p>
          <p className="advisor-bubble-text">{tip}</p>
        </div>
      )}
    </div>
  )
}
