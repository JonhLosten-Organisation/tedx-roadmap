import React, { useState } from 'react'
import { Lock, Unlock, ShieldAlert, X, ChevronRight } from 'lucide-react'

import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

const AdminLock = ({ isAdmin, onLock }) => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      setShowPrompt(false)
      setEmail('')
      setPassword('')
    } catch (err) {
      console.error('Auth Error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (onLock) onLock()
  }

  if (isAdmin) {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-500/20"
      >
        <Unlock size={14} />
        <span>Admin Mode</span>
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowPrompt(true)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-ted-muted transition-all hover:bg-white/10"
      >
        <Lock size={14} />
        <span>Lecture Seule</span>
      </button>

      {showPrompt &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => !loading && setShowPrompt(false)}
            ></div>
            <div className="glass relative mt-[-10vh] w-full max-w-sm animate-premium-entry rounded-2xl border border-white/10 p-8 shadow-premium">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-ted-red/20 bg-ted-red/10">
                  <ShieldAlert size={32} className="text-ted-red" />
                </div>
                <h3 className="font-bebas text-3xl tracking-wider text-white">Administration</h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ted-muted opacity-60">
                  Connectez-vous pour modifier
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm transition-all focus:border-ted-red focus:outline-none"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm transition-all focus:border-ted-red focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="animate-pulse text-center text-[10px] font-bold uppercase text-ted-red">
                    {error === 'Invalid login credentials' ? 'Identifiants invalides' : error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ted-red font-bold text-white shadow-lg shadow-ted-red/20 transition-all hover:bg-ted-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Connexion...' : 'Se Connecter'}
                  {!loading && (
                    <ChevronRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrompt(false)}
                  disabled={loading}
                  className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-ted-muted transition-colors hover:text-white"
                >
                  Annuler
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

export default AdminLock
