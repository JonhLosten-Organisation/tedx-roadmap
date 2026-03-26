import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  Target,
} from 'lucide-react'

const RoadmapView = ({ months, onEditAxe, onEditMilestone, isAdmin }) => {
  const getStatusConfig = (status) => {
    switch (status?.type) {
      case 'done':
        return {
          icon: <CheckCircle2 size={12} />,
          pillClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        }
      case 'key':
        return {
          icon: <AlertCircle size={12} />,
          pillClass: 'bg-ted-red/10 text-ted-red border-ted-red/20',
        }
      case 'prep':
        return {
          icon: <Clock size={12} />,
          pillClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        }
      default:
        return {
          icon: <Clock size={12} />,
          pillClass: 'bg-white/5 text-ted-muted border-white/10',
        }
    }
  }

  return (
    <div className="relative space-y-20 pl-8 md:space-y-32 md:pl-12">
      <div className="absolute bottom-0 left-[1.125rem] top-0 w-px bg-gradient-to-b from-ted-red via-white/10 to-transparent md:left-4"></div>

      {months.map((month, mIdx) => {
        const isEventMonth = month.milestone.includes('ÉVÉNEMENT')

        return (
          <section
            key={mIdx}
            className="relative animate-premium-entry"
            style={{ animationDelay: `${mIdx * 0.1}s` }}
          >
            <div
              className={`group absolute left-[-1.5rem] top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-ted-red bg-ted-dark md:left-[-2.55rem] ${isEventMonth ? 'ted-red-glow scale-125' : ''}`}
            >
              <div
                className={`h-2 w-2 rounded-full bg-ted-red transition-transform duration-300 group-hover:scale-150`}
              ></div>
            </div>

            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:mb-10 md:flex-row md:items-end md:gap-6">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    onClick={() => isAdmin && onEditMilestone(mIdx)}
                    className={`inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[2px] shadow-lg transition-all ${isEventMonth ? 'bg-ted-red text-white shadow-ted-red/20' : 'border border-white/10 bg-white/5 text-ted-muted'} ${isAdmin ? 'cursor-pointer hover:bg-white/10 hover:text-white active:scale-95' : ''}`}
                  >
                    <Target size={12} className={isEventMonth ? 'text-white' : 'text-ted-red'} />
                    <span className="opacity-60">{month.date ? 'Événement le ' : 'Focus : '}</span>
                    {month.date
                      ? new Date(month.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                        })
                      : month.milestone || 'Objectif stratégique'}
                  </div>
                </div>
                <h2
                  className={`mt-2 font-bebas text-5xl leading-none tracking-widest md:text-7xl ${isEventMonth ? 'font-bold text-ted-red' : 'text-white'}`}
                >
                  {month.label}
                </h2>
              </div>

              <div className="flex flex-col items-end gap-4">
                {month.kpi && (
                  <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-tight text-ted-muted">
                    <Target size={12} className="text-ted-red/70" />
                    <span className="italic leading-relaxed opacity-80">{month.kpi}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {month.axes.map((axe, aIdx) => {
                const statusConfig = getStatusConfig(axe.status)

                return (
                  <div
                    key={axe.id || aIdx}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-black/40 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl"
                    style={{ borderColor: `${axe.color || '#E62B1E'}20` }}
                  >
                    <div
                      onClick={() => isAdmin && onEditAxe(mIdx, aIdx)}
                      className={`group/header flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-5 ${isAdmin ? 'cursor-pointer hover:bg-white/10' : ''}`}
                    >
                      <div className="flex items-center gap-3 font-bebas text-2xl tracking-[2px] text-white transition-transform group-hover/header:translate-x-1">
                        <span
                          className="text-2xl"
                          style={{ textShadow: `0 0 10px ${axe.color || '#E62B1E'}40` }}
                        >
                          {axe.icon}
                        </span>
                        {axe.label}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2 opacity-0 transition-all group-hover/header:opacity-100">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-ted-red">
                            Cliquer pour éditer
                          </span>
                          <Edit3 size={14} className="text-ted-red" />
                        </div>
                      )}
                    </div>

                    <div
                      onClick={() => isAdmin && onEditAxe(mIdx, aIdx)}
                      className={`relative flex-1 bg-gradient-to-br from-transparent to-black/10 p-6 ${isAdmin ? 'cursor-pointer hover:bg-white/[0.02]' : ''}`}
                    >
                      <div className="absolute right-6 top-0 flex -translate-y-1/2 items-center gap-2">
                        {axe.startDate && axe.endDate && (
                          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-3 py-1 shadow-lg">
                            <Calendar size={10} className="text-ted-red" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter text-white">
                              {new Date(axe.startDate).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                              })}{' '}
                              -{' '}
                              {new Date(axe.endDate).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        )}
                        <div
                          className={`rounded-full border px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-md ${statusConfig.pillClass}`}
                        >
                          {axe.status?.label || '—'}
                        </div>
                      </div>

                      <div className="mb-6 h-[72px] overflow-hidden">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-ted-muted opacity-40">
                          Objectif & Focus
                        </span>
                        <p className="line-clamp-3 font-inter text-[12px] italic leading-[1.6] text-ted-muted">
                          {axe.description ||
                            'Synthèse des objectifs et points clés de cet axe stratégique.'}
                        </p>
                      </div>

                      <div className="mb-6">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-ted-muted opacity-40">
                          Responsable
                        </span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-1.5 w-1.5 animate-pulse rounded-full"
                            style={{ backgroundColor: axe.color || '#E62B1E' }}
                          ></div>
                          <span className="text-xs font-bold uppercase tracking-wide text-white/90">
                            {axe.responsible || 'Non assigné'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-ted-muted opacity-40">
                          Progression
                        </span>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full shadow-[0_0_8px_rgba(230,43,30,0.5)] transition-all duration-1000 ease-out"
                            style={{
                              width: `${axe.progress || 0}%`,
                              backgroundColor: axe.color || '#E62B1E',
                            }}
                          ></div>
                        </div>
                      </div>

                      <ul className="space-y-4">
                        {axe.actions.map((action, actIdx) => (
                          <li
                            key={actIdx}
                            className={`group/item flex gap-3.5 ${action.isSub ? 'ml-7 opacity-70' : ''}`}
                          >
                            <div className="mt-1.5 shrink-0 font-inter transition-transform group-hover/item:translate-x-1">
                              {action.isSub ? (
                                <div className="mt-1 h-1.5 w-1.5 rounded-full border border-ted-muted/30"></div>
                              ) : (
                                <ChevronRight
                                  size={14}
                                  className="text-ted-red/60 transition-colors group-hover/item:text-ted-red"
                                />
                              )}
                            </div>
                            <span
                              className={`rounded-md px-1.5 py-0.5 font-inter text-[13px] leading-[1.6] transition-all ${action.isSub ? 'font-normal italic text-ted-muted' : 'font-medium text-ted-text/90'}`}
                            >
                              {action.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 bg-black/20 px-6 py-3">
                      <div
                        className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[1.5px] ${statusConfig.pillClass}`}
                      >
                        {axe.status?.label || '—'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default RoadmapView
