import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, X, ChevronRight } from 'lucide-react';

import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';

const AdminLock = ({ isAdmin, onLock }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      setShowPrompt(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Auth Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (onLock) onLock();
  };

  if (isAdmin) {
    return (
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-xs font-bold uppercase tracking-widest"
      >
        <Unlock size={14} />
        <span>Admin Mode</span>
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowPrompt(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-ted-muted border border-white/10 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
      >
        <Lock size={14} />
        <span>Lecture Seule</span>
      </button>

      {showPrompt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !loading && setShowPrompt(false)}></div>
          <div className="glass relative w-full max-w-sm rounded-2xl shadow-premium border border-white/10 p-8 animate-premium-entry mt-[-10vh]">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-ted-red/10 flex items-center justify-center mb-4 border border-ted-red/20">
                <ShieldAlert size={32} className="text-ted-red" />
              </div>
              <h3 className="font-bebas text-3xl tracking-wider text-white">Administration</h3>
              <p className="text-ted-muted text-[10px] font-bold uppercase tracking-wider opacity-60">Connectez-vous pour modifier</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-4">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  disabled={loading}
                  className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-ted-red transition-all"
                />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  disabled={loading}
                  className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-ted-red transition-all"
                />
              </div>

              {error && (
                <p className="text-ted-red text-[10px] font-bold uppercase text-center animate-pulse">
                  {error === 'Invalid login credentials' ? 'Identifiants invalides' : error}
                </p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-ted-red hover:bg-ted-accent disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-ted-red/20 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? 'Connexion...' : 'Se Connecter'}
                {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
              
              <button 
                type="button"
                onClick={() => setShowPrompt(false)}
                disabled={loading}
                className="w-full py-2 text-ted-muted hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                Annuler
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AdminLock;
