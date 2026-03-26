import { useCallback, useEffect, useMemo, useState } from 'react'
import initialData from './data.json'
import RoadmapView from './components/RoadmapView'
import GanttView from './components/GanttView'
import EditModal from './components/EditModal'
import AdminLock from './components/AdminLock'
import OrgChartView from './components/OrgChartView'
import { Calendar, Check, Cloud, CloudOff, LayoutDashboard, PlusCircle, Share2 } from 'lucide-react'
import { supabase } from './lib/supabase'
import { getAutoStatus } from './lib/getAutoStatus'

const App = () => {
  const [data, setData] = useState(initialData)
  const [orgData, setOrgData] = useState({ services: [] })
  const [view, setView] = useState('roadmap')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Auth Session Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(Boolean(session?.user))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(Boolean(session?.user))
    })

    return () => subscription.unsubscribe()
  }, [])

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('axe') // 'axe', 'milestone', or 'new_axe'
  const [modalTarget, setModalTarget] = useState(null) // { mIdx, aIdx }

  // Load Data from Supabase
  const fetchData = useCallback(async () => {
    try {
      setIsSyncing(true)
      const { data: cloudData, error } = await supabase.from('tedx_cloud_data').select('*').single()

      // PGRST116 is "no rows found"
      if (error && error.code !== 'PGRST116') throw error

      if (cloudData) {
        if (cloudData.roadmap_data) setData(cloudData.roadmap_data)
        if (cloudData.org_data) setOrgData(cloudData.org_data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setSyncError(true)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Debounced Save to Supabase
  const saveData = useCallback(async () => {
    try {
      setIsSyncing(true)
      const { error } = await supabase.from('tedx_cloud_data').upsert({
        id: 1, // Single row for now
        roadmap_data: data,
        org_data: orgData,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      setSyncError(false)
    } catch (error) {
      console.error('Error saving data:', error)
      setSyncError(true)
    } finally {
      // Small artificial delay to show the sync icon
      setTimeout(() => setIsSyncing(false), 500)
    }
  }, [data, orgData])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAdmin) {
        saveData()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [isAdmin, saveData])

  const updateAction = (mIdx, aIdx, actIdx, newText) => {
    if (!isAdmin) return
    setData((prev) => {
      const next = structuredClone(prev)
      next.months[mIdx].axes[aIdx].actions[actIdx].text = newText
      return next
    })
  }

  const openEditAxe = (mIdx, aIdx) => {
    if (!isAdmin) return
    setModalType('axe')
    setModalTarget({ mIdx, aIdx })
    setModalOpen(true)
  }

  const openEditMilestone = (mIdx) => {
    if (!isAdmin) return
    setModalType('milestone')
    setModalTarget({ mIdx })
    setModalOpen(true)
  }

  const openAddAxeGlobal = () => {
    if (!isAdmin) return
    setModalType('new_axe')
    setModalTarget(null)
    setModalOpen(true)
  }

  const handleSaveModal = (updated) => {
    if (!isAdmin) return
    const newData = structuredClone(data)

    if (modalType === 'axe' && modalTarget) {
      const updatedAxe = {
        ...newData.months[modalTarget.mIdx].axes[modalTarget.aIdx],
        ...updated,
        progress: Number.parseInt(updated.progress || 0, 10),
      }
      // Auto status
      updatedAxe.status = getAutoStatus(updatedAxe)
      newData.months[modalTarget.mIdx].axes[modalTarget.aIdx] = updatedAxe
    } else if (modalType === 'new_axe') {
      const monthIdx = updated.targetMonthIdx || 0
      const newAxe = {
        id: Date.now(),
        type: 'event',
        icon: updated.icon || '✨',
        label: updated.label || 'Nouvel Axe',
        description: updated.description || '',
        responsible: updated.responsible || '',
        progress: Number.parseInt(updated.progress || 0, 10),
        startDate: updated.startDate || new Date().toISOString().split('T')[0],
        endDate:
          updated.endDate ||
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        color: updated.color || '#E62B1E',
        actions: [{ text: 'Action à définir', isSub: false }],
      }
      newAxe.status = getAutoStatus(newAxe)
      newData.months[monthIdx].axes.push(newAxe)
    } else if (modalType === 'milestone') {
      if (modalTarget) {
        // Editing existing milestone
        newData.months[modalTarget.mIdx].label = updated.label
        newData.months[modalTarget.mIdx].milestone = updated.milestone
        newData.months[modalTarget.mIdx].date = updated.date
      } else {
        // Creating new
        newData.months.push({
          label: updated.label || 'Nouveau Mois',
          milestone: updated.milestone || 'Nouveau Jalon',
          date: updated.date || new Date().toISOString().split('T')[0],
          kpi: '',
          axes: [],
        })
      }
    }

    setData(newData)
    setModalOpen(false)
  }

  const handleDeleteTarget = () => {
    if (!isAdmin || !modalTarget) return
    const newData = structuredClone(data)
    if (modalType === 'axe' || modalType === 'new_axe') {
      newData.months[modalTarget.mIdx].axes.splice(modalTarget.aIdx, 1)
    } else if (modalType === 'milestone') {
      newData.months.splice(modalTarget.mIdx, 1)
    }
    setData(newData)
    setModalOpen(false)
    setModalTarget(null)
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        throw new Error('Clipboard API unavailable')
      }
      setToastMessage("L'URL a été copiée dans le presse-papier !")
      setTimeout(() => setToastMessage(null), 3000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setToastMessage("L'URL a été copiée dans le presse-papier !")
        setTimeout(() => setToastMessage(null), 3000)
      } catch {
        setToastMessage("Erreur lors de la copie de l'URL.")
        setTimeout(() => setToastMessage(null), 3000)
      }
      document.body.removeChild(textArea)
    }
  }

  const editModalInitialData = useMemo(() => {
    if (modalType === 'axe' && modalTarget)
      return data.months[modalTarget.mIdx].axes[modalTarget.aIdx]
    if (modalType === 'milestone' && modalTarget) return data.months[modalTarget.mIdx]
    return {}
  }, [data.months, modalTarget, modalType])

  const editModalKey = useMemo(() => {
    const mIdx = modalTarget?.mIdx ?? 'none'
    const aIdx = modalTarget?.aIdx ?? 'none'
    return `${modalType}:${mIdx}:${aIdx}:${modalOpen ? 'open' : 'closed'}`
  }, [modalOpen, modalTarget, modalType])

  return (
    <div className="gradient-bg min-h-screen font-outfit text-ted-text selection:bg-ted-red/30">
      <div className="pointer-events-none fixed left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-ted-red/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] h-[30%] w-[30%] rounded-full bg-white/5 blur-[100px]"></div>
      </div>

      <nav className="glass sticky top-0 z-50 flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-8 md:py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="./logo.png" alt="TEDx Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="mx-2 hidden h-6 w-px bg-white/10 md:block"></div>
          <div className="hidden items-center gap-1 rounded-lg border border-white/10 bg-black/40 p-1 md:flex">
            <button
              onClick={() => setView('roadmap')}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-300 ${view === 'roadmap' ? 'bg-ted-red text-white shadow-md' : 'text-ted-muted hover:bg-white/5 hover:text-white'}`}
            >
              <LayoutDashboard size={16} />
              <span>Roadmap</span>
            </button>
            <button
              onClick={() => setView('gantt')}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-300 ${view === 'gantt' ? 'bg-ted-red text-white shadow-md' : 'text-ted-muted hover:bg-white/5 hover:text-white'}`}
            >
              <Calendar size={16} />
              <span>Planning Gantt</span>
            </button>
            <button
              onClick={() => setView('org')}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-300 ${view === 'org' ? 'bg-ted-red text-white shadow-md' : 'text-ted-muted hover:bg-white/5 hover:text-white'}`}
            >
              <PlusCircle size={16} />
              <span>Organigramme</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSyncing ? (
            <div className="flex animate-pulse items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-blue-400">
              <Cloud size={14} className="animate-bounce" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sync...</span>
            </div>
          ) : syncError ? (
            <div className="flex items-center gap-2 rounded-lg border border-ted-red/20 bg-ted-red/10 px-3 py-1.5 text-ted-red">
              <CloudOff size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1.5 text-emerald-400 md:px-3">
              <Cloud size={14} />
              <span className="hidden text-[10px] font-bold uppercase tracking-widest sm:inline">
                Cloud Sync
              </span>
            </div>
          )}

          <AdminLock isAdmin={isAdmin} onLock={() => {}} />

          {isAdmin && (
            <div className="mr-2 flex items-center gap-2">
              <button
                onClick={openAddAxeGlobal}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10"
              >
                <PlusCircle size={16} className="text-emerald-400" />
                <span className="hidden md:inline">Ajouter un axe</span>
              </button>
              {/* Temporarily hidden as requested:
              <button 
                onClick={openAddMilestone}
                className="flex items-center gap-2 bg-ted-red hover:bg-ted-accent text-white px-5 py-2 rounded-lg transition-all duration-300 text-sm font-semibold shadow-lg shadow-ted-red/20 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Nouveau Jalon</span>
              </button>
              */}
            </div>
          )}

          <button
            onClick={handleShare}
            aria-label="Partager la roadmap"
            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 md:px-4 md:py-2"
          >
            <Share2 size={16} />
            <span className="ml-2 hidden md:inline">Partager</span>
          </button>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="glass pb-safe fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-white/10 bg-black/95 px-4 py-2 backdrop-blur-2xl md:hidden">
        <button
          onClick={() => setView('roadmap')}
          aria-label="Vue Roadmap"
          className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${view === 'roadmap' ? 'text-ted-red' : 'text-ted-muted hover:text-white'}`}
        >
          <LayoutDashboard
            size={20}
            className={
              view === 'roadmap' ? 'scale-110 drop-shadow-[0_0_8px_rgba(230,43,30,0.5)]' : ''
            }
          />
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest">Roadmap</span>
        </button>
        <button
          onClick={() => setView('gantt')}
          aria-label="Vue Gantt"
          className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${view === 'gantt' ? 'text-ted-red' : 'text-ted-muted hover:text-white'}`}
        >
          <Calendar
            size={20}
            className={
              view === 'gantt' ? 'scale-110 drop-shadow-[0_0_8px_rgba(230,43,30,0.5)]' : ''
            }
          />
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest">Gantt</span>
        </button>
        <button
          onClick={() => setView('org')}
          aria-label="Vue Organigramme"
          className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${view === 'org' ? 'text-ted-red' : 'text-ted-muted hover:text-white'}`}
        >
          <PlusCircle
            size={20}
            className={view === 'org' ? 'scale-110 drop-shadow-[0_0_8px_rgba(230,43,30,0.5)]' : ''}
          />
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest">Structure</span>
        </button>
      </div>

      <main className="animate-premium-entry py-8 pb-24 md:py-12 md:pb-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <header className="mb-8 md:mb-12">
            <h1 className="mb-2 font-bebas text-5xl leading-tight tracking-[3px] text-white md:mb-3 md:text-7xl md:tracking-[6px]">
              {view === 'org' ? (
                <>
                  ORGANIGRAMME <span className="text-ted-red">2026</span>–2027
                </>
              ) : view === 'gantt' ? (
                <>
                  PLANNING <span className="text-ted-red">SYNCHRONISÉ</span>
                </>
              ) : (
                <>
                  PROGRAMME <span className="text-ted-red">2026</span>–2027
                </>
              )}
            </h1>
            <p className="max-w-2xl font-inter text-sm font-medium leading-relaxed tracking-wide text-ted-muted opacity-70">
              {view === 'org'
                ? 'Structure organisationnelle et responsables des pôles IMT × EULiST.'
                : view === 'gantt'
                  ? 'Vue panoramique des échéances et de la progression en temps réel.'
                  : "Direction l'excellence opérationnelle pour l'organisation de l'événement TEDx IMT × EULiST."}
            </p>
          </header>
        </div>

        <div
          className={`${
            view === 'org' || view === 'gantt'
              ? 'w-full px-3 sm:px-4 md:px-8'
              : 'mx-auto max-w-7xl px-3 sm:px-4 md:px-8'
          }`}
        >
          {view === 'roadmap' ? (
            <RoadmapView
              months={data.months}
              updateAction={updateAction}
              onEditAxe={openEditAxe}
              onEditMilestone={openEditMilestone}
              isAdmin={isAdmin}
            />
          ) : view === 'gantt' ? (
            <GanttView months={data.months} />
          ) : (
            <OrgChartView orgData={orgData} setOrgData={setOrgData} isAdmin={isAdmin} />
          )}
        </div>
      </main>

      <EditModal
        key={editModalKey}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        months={data.months}
        orgData={orgData}
        initialData={editModalInitialData}
        onSave={handleSaveModal}
        onDelete={handleDeleteTarget}
      />

      {/* Toast Notification */}
      <div
        className={`fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 transform transition-all duration-500 md:bottom-8 ${toastMessage ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'}`}
      >
        <div className="glass flex items-center gap-3 rounded-2xl border border-white/20 bg-black/80 px-6 py-3 shadow-premium backdrop-blur-xl">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
            <Check size={14} className="text-emerald-400" />
          </div>
          <span className="whitespace-nowrap text-sm font-medium tracking-wide text-white">
            {toastMessage}
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
