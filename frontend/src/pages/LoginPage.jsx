import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Coins, Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [username, setUsername]     = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)

  const { login, isLoggingIn, loginError } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/'

  function handleSubmit(e) {
    e.preventDefault()
    login(
      { username, password },
      { onSuccess: () => navigate(from, { replace: true }) },
    )
  }

  return (
    <div className="min-h-screen bg-medieval flex items-center justify-center p-6">
      <div className="bg-glow-right" />
      <div className="bg-glow-left" />

      <div className="card shimmer-top w-full max-w-sm relative z-10">

        {/* Header */}
        <div className="card-header justify-center flex-col text-center gap-4 py-8">
          <div className="flex items-center justify-center gap-4">
            <Coins size={36} className="text-gold" strokeWidth={2} />
            <Shield size={36} className="text-gold" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gold tracking-wide">Sir Spendalot</h1>
            <p className="text-gold-muted text-sm font-crimson italic mt-1">
              Identify thyself, noble steward
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-body flex flex-col gap-4">

          {/* Error banner */}
          {loginError && (
            <div className="info-box border-danger text-danger text-sm font-crimson italic">
              Hark! {loginError.message ?? 'Credentials rejected by the gatekeepers.'}
            </div>
          )}

          <div>
            <label className="input-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="input"
              type="text"
              autoComplete="username"
              autoFocus
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Thy name..."
            />
          </div>

          <div>
            <label className="input-label" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                className="input pr-11"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Thy secret phrase..."
              />
              <button
                type="button"
                className="btn-ghost absolute right-3 top-1/2 -translate-y-1/2 text-gold-muted hover:text-gold"
                onClick={() => setShowPass((p) => !p)}
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Entering the castle...
              </>
            ) : (
              'Enter the Castle'
            )}
          </button>
        </form>

        <p className="text-center text-gold-muted/30 text-xs font-crimson italic pb-5">
          "He who guards his gold, guards his glory"
        </p>
      </div>
    </div>
  )
}
