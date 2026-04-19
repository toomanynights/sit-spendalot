import { useMemo, useState } from 'react'
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

  function openWithFreshTip() {
    setTip(prev => pickRandomTip(prev))
    setIsOpen(true)
  }

  function handleClick() {
    if (isOpen) {
      setIsOpen(false)
      return
    }
    openWithFreshTip()
  }

  return (
    <div
      className="advisor-float"
      onMouseEnter={openWithFreshTip}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="advisor-badge"
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
