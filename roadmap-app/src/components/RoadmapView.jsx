import React from 'react';
import { CheckCircle2, AlertCircle, Clock, ChevronRight, Target, Calendar, Edit3, PlusCircle } from 'lucide-react';

const RoadmapView = ({ months, onEditAxe, onEditMilestone, isAdmin }) => {
  const getStatusConfig = (status) => {
    switch (status.type) {
      case 'done':
        return { 
          icon: <CheckCircle2 size={12} />, 
          class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'key':
        return { 
          icon: <AlertCircle size={12} />, 
          class: 'bg-ted-red/10 text-ted-red border-ted-red/20',
        };
      case 'prep':
        return { 
          icon: <Clock size={12} />, 
          class: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        };
      default:
        return { 
          icon: <Clock size={12} />, 
          class: 'bg-white/5 text-ted-muted border-white/10',
        };
    }
  };

  const getAxeTheme = (type) => {
    const themes = {
      finance: { color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
      comm: { color: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/10' },
      program: { color: 'text-pink-400', bg: 'bg-pink-500/5', border: 'border-pink-500/10' },
      partner: { color: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/10' },
      speaker: { color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/10' },
      inter: { color: 'text-teal-400', bg: 'bg-teal-500/5', border: 'border-teal-500/10' },
      team: { color: 'text-yellow-400', bg: 'bg-yellow-500/5', border: 'border-yellow-500/10' },
      lieu: { color: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/10' },
      license: { color: 'text-slate-300', bg: 'bg-slate-500/5', border: 'border-slate-500/10' },
      event: { color: 'text-ted-red', bg: 'bg-ted-red/5', border: 'border-ted-red/20' },
    };
    return themes[type] || { color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' };
  };

  return (
    <div className="relative pl-12 space-y-32">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-ted-red via-white/10 to-transparent"></div>

      {months.map((month, mIdx) => {
        const isEventMonth = month.milestone.includes('ÉVÉNEMENT');
        
        return (
          <section key={mIdx} className="relative animate-premium-entry" style={{ animationDelay: `${mIdx * 0.1}s` }}>
            <div className={`absolute left-[-2.55rem] top-2 w-5 h-5 rounded-full bg-ted-dark border-2 border-ted-red z-10 flex items-center justify-center group ${isEventMonth ? 'ted-red-glow scale-125' : ''}`}>
               <div className={`w-2 h-2 rounded-full bg-ted-red transition-transform duration-300 group-hover:scale-150`}></div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                    <button 
                      onClick={() => isAdmin && onEditMilestone(mIdx)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[2px] transition-all ${isEventMonth ? 'bg-ted-red text-white' : 'bg-white/10 text-ted-muted'} ${isAdmin ? 'hover:bg-ted-red hover:text-white cursor-pointer' : ''}`}
                    >
                      <Calendar size={12} />
                      {month.date ? new Date(month.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : (month.milestone || 'Jalon Mensuel')}
                    </button>
                </div>
                <h2 className={`font-bebas text-6xl md:text-7xl tracking-widest leading-none ${isEventMonth ? 'text-ted-red font-bold' : 'text-white'}`}>
                  {month.label}
                </h2>
              </div>
              
              <div className="flex flex-col gap-4 items-end">
                {month.kpi && (
                    <div className="flex items-center gap-2 text-ted-muted text-[10px] font-medium tracking-tight bg-white/5 py-1 px-3 rounded-full border border-white/5">
                    <Target size={12} className="text-ted-red/70" />
                    <span className="opacity-80 leading-relaxed italic">{month.kpi}</span>
                    </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {month.axes.map((axe, aIdx) => {
                const status = getStatusConfig(axe.status);
                // const theme = getAxeTheme(axe.type);
                
                return (
                  <div 
                    key={axe.id || aIdx} 
                    className="group bg-black/40 backdrop-blur-xl rounded-[1.5rem] overflow-hidden border transition-all duration-500 hover:shadow-2xl flex flex-col h-full"
                    style={{ borderColor: `${axe.color || '#E62B1E'}20` }}
                  >
                    <div 
                      onClick={() => isAdmin && onEditAxe(mIdx, aIdx)}
                      className={`px-6 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between group/header ${isAdmin ? 'cursor-pointer hover:bg-white/10' : ''}`}
                    >
                      <div className="flex items-center gap-3 font-bebas text-2xl tracking-[2px] text-white transition-transform group-hover/header:translate-x-1">
                        <span className="text-2xl" style={{ textShadow: `0 0 10px ${axe.color || '#E62B1E'}40` }}>{axe.icon}</span>
                        {axe.label}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2 opacity-0 group-hover/header:opacity-100 transition-all">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-ted-red">Cliquer pour éditer</span>
                           <Edit3 size={14} className="text-ted-red" />
                        </div>
                      )}
                    </div>

                    <div 
                      onClick={() => isAdmin && onEditAxe(mIdx, aIdx)}
                      className={`p-6 flex-1 bg-gradient-to-br from-transparent to-black/10 relative ${isAdmin ? 'cursor-pointer hover:bg-white/[0.02]' : ''}`}
                    >
                      <div className="absolute top-0 right-6 -translate-y-1/2 flex items-center gap-2">
                        {axe.startDate && axe.endDate && (
                           <div className="bg-black/80 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                              <Calendar size={10} className="text-ted-red" />
                              <span className="text-[9px] font-bold text-white uppercase tracking-tighter">
                                {new Date(axe.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - {new Date(axe.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                              </span>
                           </div>
                        )}
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-md ${status.bgColor} ${status.textColor} border ${status.borderColor}`}>
                          {status.label}
                        </div>
                      </div>

                      <div className="mb-6 h-[72px] overflow-hidden">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ted-muted opacity-40 block mb-1">Objectif & Focus</span>
                        <p className="text-[12px] leading-[1.6] text-ted-muted line-clamp-3 italic font-inter">
                          {axe.description || 'Synthèse des objectifs et points clés de cet axe stratégique.'}
                        </p>
                      </div>

                      <div className="mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ted-muted opacity-40 block mb-1">Responsable</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: axe.color || '#E62B1E' }}></div>
                            <span className="text-xs font-bold text-white/90 tracking-wide uppercase">{axe.responsible || 'Non assigné'}</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ted-muted opacity-40 block mb-1">Progression</span>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full shadow-[0_0_8px_rgba(230,43,30,0.5)] transition-all duration-1000 ease-out"
                            style={{ width: `${axe.progress || 0}%`, backgroundColor: axe.color || '#E62B1E' }}
                          ></div>
                        </div>
                      </div>

                      <ul className="space-y-4">
                        {axe.actions.map((action, actIdx) => (
                          <li key={actIdx} className={`flex gap-3.5 group/item ${action.isSub ? 'ml-7 opacity-70' : ''}`}>
                            <div className="mt-1.5 shrink-0 transition-transform group-hover/item:translate-x-1 font-inter">
                                {action.isSub ? (
                                    <div className="w-1.5 h-1.5 rounded-full border border-ted-muted/30 mt-1"></div>
                                ) : (
                                    <ChevronRight size={14} className="text-ted-red/60 group-hover/item:text-ted-red transition-colors" />
                                )}
                            </div>
                            <span 
                              className={`text-[13px] leading-[1.6] rounded-md px-1.5 transition-all font-inter py-0.5 ${action.isSub ? 'text-ted-muted font-normal italic' : 'text-ted-text/90 font-medium'}`}
                            >
                              {action.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`px-6 py-3 border-t border-white/5 flex items-center justify-between bg-black/20`}>
                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[8px] font-extrabold uppercase tracking-[1.5px] border ${status.class}`}>
                            {axe.status.label}
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default RoadmapView;
