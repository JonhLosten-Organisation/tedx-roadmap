import { useMemo, useState } from 'react'
import { Calendar, ChevronRight, Palette, PlusCircle, Save, Search, Trash2, X } from 'lucide-react'
import { getAutoStatus } from '../lib/getAutoStatus'

const COMMON_EMOJIS = [
  { cat: 'Projet', emojis: ['🚀', '🎯', '✨', '📅', '📝', '💡', '🔥', '⚙️', '📊', '📈'] },
  { cat: 'Équipe', emojis: ['👥', '🤝', '📣', '🙌', '💬', '🧠', '🏢', '🏗️', '👔', '👑'] },
  { cat: 'Événement', emojis: ['🎤', '🎭', '🎟️', '🎬', '🎹', '🎸', '📸', '📽️', '📍', '🗺️'] },
  { cat: 'Design', emojis: ['🎨', '🖌️', '💅', '👕', '📱', '💻', '🖥️', '🖋️', '🌈', '💎'] },
  { cat: 'Logistique', emojis: ['📦', '🚚', '📦', '🛒', '🍽️', '☕', '🥤', '🏠', '🔑', '🛠️'] },
]

const getDefaultAxeFormData = () => ({
  targetMonthIdx: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  color: '#E62B1E',
  progress: 0,
  responsible: '',
  icon: '✨',
  label: 'Nouvel Axe',
  description: '',
  actions: [],
  status: { label: 'À faire', type: 'todo' },
})

const clone = (value) => structuredClone(value)

const EditModal = ({ isOpen, onClose, onSave, onDelete, type, initialData, months, orgData }) => {
  const initialFormData = useMemo(() => {
    if (initialData && Object.keys(initialData).length > 0) return clone(initialData)
    if (type === 'milestone') return { label: '', milestone: '', date: '' }
    return getDefaultAxeFormData()
  }, [initialData, type])

  const [formData, setFormData] = useState(initialFormData)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiSearch, setEmojiSearch] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const addAction = () => {
    const newActions = [...(formData.actions || []), { text: '', isSub: false }]
    setFormData({ ...formData, actions: newActions })
  }

  const removeAction = (idx) => {
    const newActions = formData.actions.filter((_, i) => i !== idx)
    setFormData({ ...formData, actions: newActions })
  }

  const updateActionText = (idx, text) => {
    const newActions = [...formData.actions]
    newActions[idx].text = text
    setFormData({ ...formData, actions: newActions })
  }

  const toggleSubAction = (idx) => {
    const newActions = [...formData.actions]
    newActions[idx].isSub = !newActions[idx].isSub
    setFormData({ ...formData, actions: newActions })
  }

  const colors = [
    { name: 'TED Red', value: '#E62B1E' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Slate', value: '#64748b' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="glass relative flex max-h-[95vh] w-full max-w-xl animate-premium-entry flex-col overflow-hidden rounded-[1.5rem] border border-white/10 shadow-premium md:rounded-[2rem]">
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4 md:px-8 md:py-6">
          <h3 className="font-bebas text-3xl tracking-widest text-white">
            {type === 'axe'
              ? "Modifier l'Axe"
              : type === 'milestone'
                ? 'Objectif de Phase'
                : 'Nouvel Axe Stratégique'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="p-2 text-ted-muted transition-colors hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="scrollbar-premium flex-1 space-y-6 overflow-y-auto p-6 md:space-y-8 md:p-8"
        >
          {type === 'milestone' ? (
            <>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                  Label de la Période (Mois)
                </label>
                <input
                  type="text"
                  value={formData.label || ''}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Ex: Mars 2026"
                  className="h-12 w-full rounded-xl border border-white/10 bg-black px-4 font-inter text-sm outline-none transition-all focus:border-ted-red focus:ring-1 focus:ring-ted-red/20"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                  Objectif de Phase (Focus principal)
                </label>
                <input
                  type="text"
                  value={formData.milestone || ''}
                  onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
                  placeholder="Ex: Structuration & Lancement"
                  className="h-12 w-full rounded-xl border border-white/10 bg-black px-4 font-inter text-sm outline-none transition-all focus:border-ted-red focus:ring-1 focus:ring-ted-red/20"
                />
              </div>
              <div className="space-y-3 border-t border-white/5 pt-4">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ted-muted opacity-60">
                  <Calendar size={12} className="text-ted-red" /> Date du Jalon (Événement sur le
                  Gantt)
                </label>
                <div className="flex flex-col gap-1">
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="inverted-calendar-icon h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 font-inter text-sm text-white outline-none transition-all focus:border-ted-red"
                  />
                  <p className="px-1 text-[9px] italic text-ted-muted">
                    Laissez vide si l'objectif de phase n'est pas un événement ponctuel.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {type === 'new_axe' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                    Jalon Cible (Mois)
                  </label>
                  <select
                    value={formData.targetMonthIdx || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, targetMonthIdx: parseInt(e.target.value) })
                    }
                    className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-black px-4 font-inter text-sm outline-none focus:border-ted-red"
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {m.label} - {m.milestone}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                  Libellé & Icône
                </label>
                <div className="flex gap-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex h-12 w-16 items-center justify-center rounded-xl border border-white/10 bg-black text-2xl transition-all hover:border-ted-red/50"
                    >
                      {formData.icon || '✨'}
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute left-0 top-14 z-50 w-72 animate-premium-entry overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 shadow-2xl">
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-2">
                          <Search size={14} className="text-ted-muted" />
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full bg-transparent text-xs outline-none"
                            value={emojiSearch}
                            onChange={(e) => setEmojiSearch(e.target.value)}
                          />
                        </div>
                        <div className="scrollbar-premium max-h-56 space-y-4 overflow-y-auto pr-1">
                          {COMMON_EMOJIS.map((group) => (
                            <div key={group.cat}>
                              <div className="mb-2 px-1 text-[8px] font-bold uppercase tracking-widest text-ted-muted">
                                {group.cat}
                              </div>
                              <div className="grid grid-cols-5 gap-1">
                                {group.emojis.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, icon: emoji })
                                      setShowEmojiPicker(false)
                                    }}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-colors hover:bg-white/5"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
                          <div className="px-1 text-[8px] font-bold uppercase tracking-widest text-ted-muted">
                            Ou tapez manuellement
                          </div>
                          <input
                            type="text"
                            maxLength="2"
                            value={formData.icon || ''}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className="h-8 w-full rounded-lg border border-white/5 bg-white/5 text-center"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.label || ''}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Titre de l'axe"
                    className="h-12 flex-1 rounded-xl border border-white/10 bg-black px-4 font-inter text-sm outline-none focus:border-ted-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                    Date de Début
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="inverted-calendar-icon h-12 w-full rounded-xl border border-white/10 bg-black px-4 font-inter text-sm text-white outline-none focus:border-ted-red"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                    Date de Fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="inverted-calendar-icon h-12 w-full rounded-xl border border-white/10 bg-black px-4 font-inter text-sm text-white outline-none focus:border-ted-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                    Responsable / Équipe
                  </label>
                  <select
                    value={formData.responsible || ''}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-black px-4 font-inter text-sm outline-none focus:border-ted-red"
                  >
                    <option value="">Non assigné</option>
                    {(() => {
                      const flatten = (services) => {
                        let members = []
                        let groups = []
                        let flatServices = []

                        services.forEach((s) => {
                          flatServices.push({ id: s.id, name: s.name })
                          // Check for members in services (previously poles had groups, now services have members)
                          s.members?.forEach((m) =>
                            members.push({ id: m.id, name: m.name, role: m.role }),
                          )

                          if (s.subServices && s.subServices.length > 0) {
                            const nested = flatten(s.subServices)
                            members = [...members, ...nested.members]
                            groups = [...groups, ...nested.groups]
                            flatServices = [...flatServices, ...nested.flatServices]
                          }
                        })
                        return { members, groups, flatServices }
                      }

                      const { members, groups, flatServices } = flatten(orgData?.services || [])

                      return (
                        <>
                          <optgroup label="Individus">
                            {members.map((m) => (
                              <option key={m.id} value={m.name}>
                                {m.name} ({m.role})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Groupes de travail">
                            {groups.map((g) => (
                              <option key={g.id} value={g.name}>
                                Groupe : {g.name}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Services / Pôles">
                            {flatServices.map((p) => (
                              <option key={p.id} value={p.name}>
                                Svc : {p.name}
                              </option>
                            ))}
                          </optgroup>
                        </>
                      )
                    })()}
                    <option value="Saisie libre">── Saisie libre ──</option>
                  </select>
                  {formData.responsible === 'Saisie libre' && (
                    <input
                      type="text"
                      className="mt-2 h-10 w-full rounded-lg border border-white/5 bg-black/40 px-4 text-xs outline-none focus:border-ted-red"
                      placeholder="Entrez le nom manuellement..."
                      onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    />
                  )}
                </div>
                <div className="space-y-3">
                  <label className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                    Avancement <span>{formData.progress || 0}%</span>
                  </label>
                  <div className="flex h-12 items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress || 0}
                      onChange={(e) =>
                        setFormData({ ...formData, progress: parseInt(e.target.value) })
                      }
                      className="w-full cursor-pointer bg-transparent accent-ted-red"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                  <Palette size={12} className="text-ted-red" /> Couleur de l'axe
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`h-9 w-9 rounded-full border-2 transition-all ${formData.color === c.value ? 'scale-110 border-white' : 'border-transparent opacity-60 hover:scale-110 hover:opacity-100'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    ></button>
                  ))}
                  <div className="mx-2 h-6 w-px bg-white/10"></div>
                  <div className="group relative">
                    <input
                      type="color"
                      value={formData.color || '#E62B1E'}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="absolute inset-0 z-10 h-10 w-10 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black opacity-0"
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-tr from-white/5 to-white/10 text-white transition-all group-hover:border-white/50">
                      <Palette size={18} />
                    </div>
                  </div>
                  <span className="rounded-md border border-white/5 bg-white/5 px-2 py-1 font-mono text-[10px] font-bold leading-none text-ted-muted">
                    {formData.color?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                  Description de l'axe
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détaillez les objectifs stratégiques..."
                  rows="3"
                  className="scrollbar-premium w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 font-inter text-sm outline-none focus:border-ted-red"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                  Statut (Automatique)
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                  {(() => {
                    const status = getAutoStatus(formData)
                    return (
                      <>
                        <div
                          className={`h-3 w-3 animate-pulse rounded-full ${status.type === 'done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : status.type === 'key' ? 'bg-ted-red shadow-[0_0_8px_rgba(230,43,30,0.5)]' : status.type === 'prep' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-ted-muted'}`}
                        ></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-white">
                          {status.label}
                        </span>
                        <span className="ml-auto text-[10px] italic text-ted-muted">
                          Basé sur les dates et l'avancement
                        </span>
                      </>
                    )
                  })()}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ted-muted">
                    <PlusCircle size={12} className="text-ted-red" /> Actions & Étapes
                  </label>
                  <button
                    type="button"
                    onClick={addAction}
                    className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-ted-red transition-colors hover:text-white"
                  >
                    <PlusCircle size={12} /> Ajouter
                  </button>
                </div>
                <div className="space-y-3">
                  {(formData.actions || []).map((action, idx) => (
                    <div
                      key={idx}
                      className="flex animate-premium-entry items-start gap-3"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSubAction(idx)}
                        title={
                          action.isSub ? 'Passer en action principale' : 'Passer en sous-action'
                        }
                        aria-label={
                          action.isSub ? 'Passer en action principale' : 'Passer en sous-action'
                        }
                        className={`mt-2.5 rounded p-1 transition-colors ${action.isSub ? 'bg-ted-red/10 text-ted-red' : 'bg-white/5 text-ted-muted hover:text-white'}`}
                      >
                        <ChevronRight size={12} className={action.isSub ? 'rotate-90' : ''} />
                      </button>
                      <input
                        type="text"
                        value={action.text}
                        onChange={(e) => updateActionText(idx, e.target.value)}
                        placeholder="Description de l'action..."
                        className={`h-10 flex-1 rounded-lg border border-white/5 bg-black/60 px-3 font-inter text-xs outline-none transition-all focus:border-ted-red/50 ${action.isSub ? 'ml-4 italic text-ted-muted' : 'text-white'}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeAction(idx)}
                        aria-label="Supprimer l'action"
                        className="mt-2.5 p-1 text-ted-muted transition-colors hover:text-ted-red"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(!formData.actions || formData.actions.length === 0) && (
                    <div className="rounded-xl border border-dashed border-white/5 py-4 text-center text-[10px] uppercase italic tracking-widest text-ted-muted opacity-40">
                      Aucune action définie
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="mt-4 flex flex-col gap-3 pt-6 sm:flex-row md:gap-4 md:pt-8">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      `⚠️ Supprimer ${type === 'axe' ? 'cet axe' : 'ce jalon'} définitivement ?`,
                    )
                  ) {
                    onDelete()
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-transparent px-6 py-3 text-xs font-bold uppercase tracking-[2px] text-ted-muted transition-all hover:border-ted-red/20 hover:text-ted-red"
              >
                <Trash2 size={16} />
                Supprimer {type === 'axe' ? "l'axe" : 'le jalon'}
              </button>
            )}
            <div className="hidden flex-1 sm:block"></div>
            <button
              type="submit"
              className="group flex items-center justify-center gap-3 rounded-xl bg-ted-red px-10 py-3 text-sm font-bold text-white shadow-lg shadow-ted-red/20 transition-all duration-300 hover:bg-ted-accent"
            >
              <Save size={18} className="transition-transform group-hover:scale-110" />
              CONFIRMER
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .inverted-calendar-icon::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        input[type="color"]::-webkit-color-swatch {
          border: none;
        }
      `}</style>
    </div>
  )
}

export default EditModal
