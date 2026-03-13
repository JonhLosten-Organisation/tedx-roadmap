import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, Palette, Search, Smile, PlusCircle, ChevronRight } from 'lucide-react';

const COMMON_EMOJIS = [
  { cat: 'Projet', emojis: ['🚀', '🎯', '✨', '📅', '📝', '💡', '🔥', '⚙️', '📊', '📈'] },
  { cat: 'Équipe', emojis: ['👥', '🤝', '📣', '🙌', '💬', '🧠', '🏢', '🏗️', '👔', '👑'] },
  { cat: 'Événement', emojis: ['🎤', '🎭', '🎟️', '🎬', '🎹', '🎸', '📸', '📽️', '📍', '🗺️'] },
  { cat: 'Design', emojis: ['🎨', '🖌️', '💅', '👕', '📱', '💻', '🖥️', '🖋️', '🌈', '💎'] },
  { cat: 'Logistique', emojis: ['📦', '🚚', '📦', '🛒', '🍽️', '☕', '🥤', '🏠', '🔑', '🛠️'] }
];

const getAutoStatus = (axe) => {
  const today = new Date().toISOString().split('T')[0];
  const progress = parseInt(axe.progress || 0);
  
  if (progress >= 100) return { label: 'Terminé', type: 'done' };
  if (axe.endDate && axe.endDate < today) return { label: 'En retard', type: 'key' };
  if (progress > 0 || (axe.startDate && axe.startDate <= today)) return { label: 'En cours', type: 'prep' };
  return { label: 'À faire', type: 'todo' };
};

const EditModal = ({ isOpen, onClose, onSave, onDelete, type, initialData, months, orgData }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(JSON.parse(JSON.stringify(initialData)));
    } else {
      setFormData({
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
        status: { label: 'À faire', type: 'todo' }
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addAction = () => {
    const newActions = [...(formData.actions || []), { text: '', isSub: false }];
    setFormData({ ...formData, actions: newActions });
  };

  const removeAction = (idx) => {
    const newActions = formData.actions.filter((_, i) => i !== idx);
    setFormData({ ...formData, actions: newActions });
  };

  const updateActionText = (idx, text) => {
    const newActions = [...formData.actions];
    newActions[idx].text = text;
    setFormData({ ...formData, actions: newActions });
  };

  const toggleSubAction = (idx) => {
    const newActions = [...formData.actions];
    newActions[idx].isSub = !newActions[idx].isSub;
    setFormData({ ...formData, actions: newActions });
  };

  const statusOptions = [
    { label: 'Fait', type: 'done' },
    { label: 'Critique', type: 'key' },
    { label: 'En cours', type: 'prep' },
    { label: 'À faire', type: 'todo' }
  ];

  const colors = [
    { name: 'TED Red', value: '#E62B1E' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Slate', value: '#64748b' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="glass relative w-full max-w-xl rounded-[2rem] shadow-premium overflow-hidden animate-premium-entry border border-white/10">
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-white/5">
          <h3 className="font-bebas text-3xl tracking-widest text-white">
            {type === 'axe' ? 'Modifier l\'Axe' : (type === 'milestone' ? 'Nouveau Jalon' : 'Nouvel Axe Stratégique')}
          </h3>
          <button onClick={onClose} className="p-2 text-ted-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto scrollbar-premium">
          {type === 'milestone' ? (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted flex items-center gap-2">
                   <Calendar size={12} className="text-ted-red" /> Date du Jalon
                </label>
                <input 
                  type="date" 
                  value={formData.date || ''} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm focus:border-ted-red outline-none focus:ring-1 focus:ring-ted-red/20 transition-all font-inter text-white inverted-calendar-icon"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted flex items-center gap-2">
                   Label de la Période
                </label>
                <input 
                  type="text" 
                  value={formData.label || ''} 
                  onChange={e => setFormData({...formData, label: e.target.value})}
                  placeholder="Ex: Mars 2026"
                  className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm focus:border-ted-red outline-none focus:ring-1 focus:ring-ted-red/20 transition-all font-inter"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">Jalon (Focus)</label>
                <input 
                  type="text" 
                  value={formData.milestone || ''} 
                  onChange={e => setFormData({...formData, milestone: e.target.value})}
                  placeholder="Ex: Structuration & Lancement"
                  className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm focus:border-ted-red outline-none focus:ring-1 focus:ring-ted-red/20 transition-all font-inter"
                />
              </div>
            </>
          ) : (
            <>
              {type === 'new_axe' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">Jalon Cible (Mois)</label>
                  <select 
                    value={formData.targetMonthIdx || 0}
                    onChange={e => setFormData({...formData, targetMonthIdx: parseInt(e.target.value)})}
                    className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm focus:border-ted-red outline-none font-inter appearance-none cursor-pointer"
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx}>{m.label} - {m.milestone}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">Libellé & Icône</label>
                <div className="flex gap-4">
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-16 h-12 bg-black border border-white/10 rounded-xl text-2xl flex items-center justify-center hover:border-ted-red/50 transition-all"
                    >
                      {formData.icon || '✨'}
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute top-14 left-0 z-50 w-72 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-4 animate-premium-entry overflow-hidden">
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5 mb-4">
                          <Search size={14} className="text-ted-muted" />
                          <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            className="bg-transparent text-xs outline-none w-full"
                            value={emojiSearch}
                            onChange={(e) => setEmojiSearch(e.target.value)}
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto scrollbar-premium space-y-4 pr-1">
                          {COMMON_EMOJIS.map(group => (
                            <div key={group.cat}>
                              <div className="text-[8px] font-bold uppercase tracking-widest text-ted-muted mb-2 px-1">{group.cat}</div>
                              <div className="grid grid-cols-5 gap-1">
                                {group.emojis.map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      setFormData({...formData, icon: emoji});
                                      setShowEmojiPicker(false);
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-xl transition-colors"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                           <div className="text-[8px] font-bold uppercase tracking-widest text-ted-muted px-1">Ou tapez manuellement</div>
                           <input 
                              type="text" 
                              maxLength="2"
                              value={formData.icon || ''}
                              onChange={(e) => setFormData({...formData, icon: e.target.value})}
                              className="w-full bg-white/5 border border-white/5 rounded-lg h-8 text-center"
                           />
                        </div>
                      </div>
                    )}
                  </div>
                  <input 
                    type="text" 
                    value={formData.label || ''} 
                    onChange={e => setFormData({...formData, label: e.target.value})}
                    placeholder="Titre de l'axe"
                    className="flex-1 h-12 bg-black border border-white/10 rounded-xl px-4 text-sm focus:border-ted-red outline-none font-inter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">Date de Début</label>
                  <input 
                    type="date" 
                    value={formData.startDate || ''} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm focus:border-ted-red outline-none font-inter text-white inverted-calendar-icon"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">Date de Fin</label>
                  <input 
                    type="date" 
                    value={formData.endDate || ''} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm focus:border-ted-red outline-none font-inter text-white inverted-calendar-icon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">Responsable / Équipe</label>
                  <select 
                    value={formData.responsible || ''} 
                    onChange={e => setFormData({...formData, responsible: e.target.value})}
                    className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm focus:border-ted-red outline-none font-inter appearance-none cursor-pointer"
                  >
                    <option value="">Non assigné</option>
                    {(() => {
                      const flatten = (poles) => {
                        let members = [];
                        let groups = [];
                        let flatPoles = [];
                        
                        poles.forEach(p => {
                          flatPoles.push({ id: p.id, name: p.name });
                          p.groups?.forEach(g => groups.push({ id: g.id, name: g.name }));
                          p.groups?.flatMap(g => g.members || []).forEach(m => members.push({ id: m.id, name: m.name, role: m.role }));
                          
                          if (p.subPoles && p.subPoles.length > 0) {
                            const nested = flatten(p.subPoles);
                            members = [...members, ...nested.members];
                            groups = [...groups, ...nested.groups];
                            flatPoles = [...flatPoles, ...nested.flatPoles];
                          }
                        });
                        return { members, groups, flatPoles };
                      };

                      const { members, groups, flatPoles } = flatten(orgData?.poles || []);

                      return (
                        <>
                          <optgroup label="Individus">
                            {members.map(m => (
                              <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                            ))}
                          </optgroup>
                          <optgroup label="Groupes de travail">
                            {groups.map(g => (
                              <option key={g.id} value={g.name}>Groupe : {g.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Pôles">
                            {flatPoles.map(p => (
                              <option key={p.id} value={p.name}>Pôle : {p.name}</option>
                            ))}
                          </optgroup>
                        </>
                      );
                    })()}
                    <option value="Saisie libre">── Saisie libre ──</option>
                  </select>
                  {formData.responsible === 'Saisie libre' && (
                    <input 
                      type="text"
                      className="w-full h-10 mt-2 bg-black/40 border border-white/5 rounded-lg px-4 text-xs focus:border-ted-red outline-none"
                      placeholder="Entrez le nom manuellement..."
                      onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                    />
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted flex justify-between">
                    Avancement <span>{formData.progress || 0}%</span>
                  </label>
                  <div className="flex items-center h-12">
                     <input 
                        type="range" 
                        min="0" 
                        max="100"
                        value={formData.progress || 0} 
                        onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                        className="w-full accent-ted-red bg-transparent cursor-pointer"
                      />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted flex items-center gap-2">
                   <Palette size={12} className="text-ted-red" /> Couleur de l'axe
                </label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {colors.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({...formData, color: c.value})}
                      className={`w-9 h-9 rounded-full transition-all border-2 ${formData.color === c.value ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    ></button>
                  ))}
                  <div className="w-px h-6 bg-white/10 mx-2"></div>
                  <div className="relative group">
                    <input 
                      type="color" 
                      value={formData.color || '#E62B1E'}
                      onChange={e => setFormData({...formData, color: e.target.value})}
                      className="w-10 h-10 rounded-xl bg-black border border-white/10 cursor-pointer overflow-hidden opacity-0 absolute inset-0 z-10"
                    />
                    <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-white bg-gradient-to-tr from-white/5 to-white/10 group-hover:border-white/50 transition-all">
                       <Palette size={18} />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-ted-muted bg-white/5 px-2 py-1 rounded-md border border-white/5 leading-none">
                    {formData.color?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">Description de l'axe</label>
                <textarea 
                  value={formData.description || ''} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Détaillez les objectifs stratégiques..."
                  rows="3"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-ted-red outline-none font-inter resize-none scrollbar-premium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted">Statut (Automatique)</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
                  {(() => {
                    const status = getAutoStatus(formData);
                    return (
                      <>
                        <div className={`w-3 h-3 rounded-full animate-pulse ${status.type === 'done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : (status.type === 'key' ? 'bg-ted-red shadow-[0_0_8px_rgba(230,43,30,0.5)]' : (status.type === 'prep' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-ted-muted'))}`}></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-white">{status.label}</span>
                        <span className="text-[10px] text-ted-muted italic ml-auto">Basé sur les dates et l'avancement</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ted-muted flex items-center gap-2">
                    <PlusCircle size={12} className="text-ted-red" /> Actions & Étapes
                  </label>
                  <button 
                    type="button" 
                    onClick={addAction}
                    className="text-[9px] font-bold uppercase tracking-widest text-ted-red hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle size={12} /> Ajouter
                  </button>
                </div>
                <div className="space-y-3">
                  {(formData.actions || []).map((action, idx) => (
                    <div key={idx} className="flex gap-3 items-start animate-premium-entry" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <button 
                        type="button"
                        onClick={() => toggleSubAction(idx)}
                        title={action.isSub ? "Passer en action principale" : "Passer en sous-action"}
                        className={`mt-2.5 p-1 rounded transition-colors ${action.isSub ? 'text-ted-red bg-ted-red/10' : 'text-ted-muted hover:text-white bg-white/5'}`}
                      >
                        <ChevronRight size={12} className={action.isSub ? 'rotate-90' : ''} />
                      </button>
                      <input 
                        type="text" 
                        value={action.text} 
                        onChange={(e) => updateActionText(idx, e.target.value)}
                        placeholder="Description de l'action..."
                        className={`flex-1 h-10 bg-black/60 border border-white/5 rounded-lg px-3 text-xs focus:border-ted-red/50 outline-none transition-all font-inter ${action.isSub ? 'italic text-ted-muted ml-4' : 'text-white'}`}
                      />
                      <button 
                        type="button" 
                        onClick={() => removeAction(idx)}
                        className="mt-2.5 p-1 text-ted-muted hover:text-ted-red transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(!formData.actions || formData.actions.length === 0) && (
                    <div className="py-4 text-center border border-dashed border-white/5 rounded-xl text-[10px] text-ted-muted uppercase tracking-widest italic opacity-40">
                      Aucune action définie
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            {onDelete && (
              <button 
                type="button"
                onClick={() => { if(confirm(`⚠️ Supprimer ${type === 'axe' ? 'cet axe' : 'ce jalon'} définitivement ?`)) { onDelete(); } }}
                className="flex items-center justify-center gap-2 px-6 py-3 text-ted-muted hover:text-ted-red transition-all text-xs font-bold uppercase tracking-[2px] border border-transparent hover:border-ted-red/20 rounded-xl"
              >
                <Trash2 size={16} />
                Supprimer {type === 'axe' ? 'l\'axe' : 'le jalon'}
              </button>
            )}
            <div className="hidden sm:block flex-1"></div>
            <button 
              type="submit"
              className="flex items-center justify-center gap-3 bg-ted-red hover:bg-ted-accent text-white px-10 py-3 rounded-xl transition-all duration-300 text-sm font-bold shadow-lg shadow-ted-red/20 group"
            >
              <Save size={18} className="group-hover:scale-110 transition-transform" />
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
  );
};

export default EditModal;
