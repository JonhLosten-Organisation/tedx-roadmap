import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, X, ChevronRight } from 'lucide-react';

const AdminLock = ({ isAdmin, onUnlock, onLock }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === 'Legrandlerouge2026') {
      console.log('Admin Access Granted');
      onUnlock();
      setShowPrompt(false);
      setPassword('');
      setError(false);
    } else {
      console.log('Admin Access Denied');
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (isAdmin) {
    return (
      <button 
        onClick={onLock}
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

      {showPrompt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowPrompt(false)}></div>
          <div className="glass relative w-full max-w-sm rounded-2xl shadow-premium border border-white/10 p-8 animate-premium-entry">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-ted-red/10 flex items-center justify-center mb-4 border border-ted-red/20">
                <ShieldAlert size={32} className="text-ted-red" />
              </div>
              <h3 className="font-bebas text-3xl tracking-wider text-white">Accès Restreint</h3>
              <p className="text-ted-muted text-xs font-medium opacity-60">Saisissez le mot de passe pour modifier la roadmap.</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <input 
                autoFocus
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className={`w-full h-12 bg-black border ${error ? 'border-ted-red ring-2 ring-ted-red/20' : 'border-white/10'} rounded-xl px-4 text-center text-lg focus:outline-none focus:border-ted-red transition-all`}
              />
              <button 
                type="submit"
                className="w-full h-12 bg-ted-red hover:bg-ted-accent text-white font-bold rounded-xl shadow-lg shadow-ted-red/20 transition-all flex items-center justify-center gap-2 group"
              >
                Déverrouiller
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                type="button"
                onClick={() => setShowPrompt(false)}
                className="w-full py-2 text-ted-muted hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                Annuler
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLock;
