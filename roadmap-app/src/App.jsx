import React, { useState, useEffect } from 'react';
import initialData from './data.json';
import RoadmapView from './components/RoadmapView';
import GanttView from './components/GanttView';
import EditModal from './components/EditModal';
import AdminLock from './components/AdminLock';
import OrgChartView from './components/OrgChartView';
import { LayoutDashboard, Calendar, Plus, Save, Share2, PlusCircle, Cloud, CloudOff } from 'lucide-react';
import { supabase } from './lib/supabase';

const getAutoStatus = (axe) => {
  const today = new Date().toISOString().split('T')[0];
  const progress = parseInt(axe.progress || 0);
  
  if (progress >= 100) return { label: 'Terminé', type: 'done' };
  if (axe.endDate && axe.endDate < today) return { label: 'En retard', type: 'key' };
  if (progress > 0 || (axe.startDate && axe.startDate <= today)) return { label: 'En cours', type: 'prep' };
  return { label: 'À faire', type: 'todo' };
};

const App = () => {
  const [data, setData] = useState(initialData);
  const [orgData, setOrgData] = useState({ poles: [] });
  const [view, setView] = useState('roadmap');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('axe'); // 'axe', 'milestone', or 'new_axe'
  const [modalTarget, setModalTarget] = useState(null); // { mIdx, aIdx }

  // Load Data from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsSyncing(true);
      const { data: cloudData, error } = await supabase
        .from('tedx_cloud_data')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"

      if (cloudData) {
        if (cloudData.roadmap_data) setData(cloudData.roadmap_data);
        if (cloudData.org_data) setOrgData(cloudData.org_data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setSyncError(true);
    } finally {
      setIsSyncing(false);
    }
  };

  // Debounced Save to Supabase
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAdmin) {
        saveData();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [data, orgData, isAdmin]);

  const saveData = async () => {
    try {
      setIsSyncing(true);
      const { error } = await supabase
        .from('tedx_cloud_data')
        .upsert({ 
          id: 1, // Single row for now
          roadmap_data: data,
          org_data: orgData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSyncError(false);
    } catch (err) {
      console.error('Error saving data:', err);
      setSyncError(true);
    } finally {
      // Small artificial delay to show the sync icon
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const updateAction = (mIdx, aIdx, actIdx, newText) => {
    if (!isAdmin) return;
    const newData = JSON.parse(JSON.stringify(data));
    newData.months[mIdx].axes[aIdx].actions[actIdx].text = newText;
    setData(newData);
  };

  const openEditAxe = (mIdx, aIdx) => {
    if (!isAdmin) return;
    setModalType('axe');
    setModalTarget({ mIdx, aIdx });
    setModalOpen(true);
  };

  const openEditMilestone = (mIdx) => {
    if (!isAdmin) return;
    setModalType('milestone');
    setModalTarget({ mIdx });
    setModalOpen(true);
  };

  const openAddMilestone = () => {
    if (!isAdmin) return;
    setModalType('milestone');
    setModalTarget(null);
    setModalOpen(true);
  };

  const openAddAxeGlobal = () => {
    if (!isAdmin) return;
    setModalType('new_axe');
    setModalTarget(null);
    setModalOpen(true);
  };

  const handleSaveModal = (updated) => {
    if (!isAdmin) return;
    const newData = JSON.parse(JSON.stringify(data));
    
    if (modalType === 'axe' && modalTarget) {
      const updatedAxe = {
        ...newData.months[modalTarget.mIdx].axes[modalTarget.aIdx],
        ...updated,
        progress: parseInt(updated.progress || 0)
      };
      // Auto status
      updatedAxe.status = getAutoStatus(updatedAxe);
      newData.months[modalTarget.mIdx].axes[modalTarget.aIdx] = updatedAxe;
    } else if (modalType === 'new_axe') {
      const monthIdx = updated.targetMonthIdx || 0;
      const newAxe = {
        id: Date.now(),
        type: 'event',
        icon: updated.icon || '✨',
        label: updated.label || 'Nouvel Axe',
        description: updated.description || '',
        responsible: updated.responsible || '',
        progress: parseInt(updated.progress || 0),
        startDate: updated.startDate || new Date().toISOString().split('T')[0],
        endDate: updated.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        color: updated.color || '#E62B1E',
        actions: [{ text: 'Action à définir', isSub: false }]
      };
      newAxe.status = getAutoStatus(newAxe);
      newData.months[monthIdx].axes.push(newAxe);
    } else if (modalType === 'milestone') {
      if (modalTarget) {
         // Editing existing milestone
         newData.months[modalTarget.mIdx].label = updated.label;
         newData.months[modalTarget.mIdx].milestone = updated.milestone;
         newData.months[modalTarget.mIdx].date = updated.date;
      } else {
         // Creating new
         newData.months.push({
           label: updated.label || 'Nouveau Mois',
           milestone: updated.milestone || 'Nouveau Jalon',
           date: updated.date || new Date().toISOString().split('T')[0],
           kpi: '',
           axes: []
         });
      }
    }
    
    setData(newData);
    setModalOpen(false);
  };

  const handleDeleteTarget = () => {
    if (!isAdmin || !modalTarget) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (modalType === 'axe' || modalType === 'new_axe') {
      newData.months[modalTarget.mIdx].axes.splice(modalTarget.aIdx, 1);
    } else if (modalType === 'milestone') {
      newData.months.splice(modalTarget.mIdx, 1);
    }
    setData(newData);
    setModalOpen(false);
    setModalTarget(null);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      alert("L'URL de la roadmap a été copiée !");
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert("L'URL de la roadmap a été copiée ! (Fallback)");
      } catch (e) {
        alert("Erreur lors de la copie de l'URL. Veuillez copier manuellement : " + url);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen gradient-bg text-ted-text font-outfit selection:bg-ted-red/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-ted-red/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-white/5 blur-[100px] rounded-full"></div>
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="./logo.png" alt="TEDx Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="hidden md:block h-6 w-px bg-white/10 mx-2"></div>
          <div className="hidden md:flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setView('roadmap')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${view === 'roadmap' ? 'bg-ted-red text-white shadow-md' : 'text-ted-muted hover:text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard size={16} />
              <span>Roadmap</span>
            </button>
            <button 
              onClick={() => setView('gantt')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${view === 'gantt' ? 'bg-ted-red text-white shadow-md' : 'text-ted-muted hover:text-white hover:bg-white/5'}`}
            >
              <Calendar size={16} />
              <span>Planning Gantt</span>
            </button>
            <button 
              onClick={() => setView('org')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${view === 'org' ? 'bg-ted-red text-white shadow-md' : 'text-ted-muted hover:text-white hover:bg-white/5'}`}
            >
              <PlusCircle size={16} />
              <span>Organigramme</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSyncing ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
              <Cloud size={14} className="animate-bounce" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sync...</span>
            </div>
          ) : syncError ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ted-red/10 text-ted-red border border-ted-red/20">
              <CloudOff size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cloud size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Cloud Sync</span>
            </div>
          )}
          
          <AdminLock 
            isAdmin={isAdmin} 
            onUnlock={() => setIsAdmin(true)} 
            onLock={() => setIsAdmin(false)} 
          />
        </div>
          
          {isAdmin && (
            <div className="flex items-center gap-2 mr-2">
              <button 
                onClick={openAddAxeGlobal}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <PlusCircle size={16} className="text-emerald-400" />
                <span className="hidden lg:inline">Ajouter un axe</span>
              </button>
              <button 
                onClick={openAddMilestone}
                className="flex items-center gap-2 bg-ted-red hover:bg-ted-accent text-white px-5 py-2 rounded-lg transition-all duration-300 text-sm font-semibold shadow-lg shadow-ted-red/20 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Nouveau Jalon</span>
              </button>
            </div>
          )}
          
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Partager</span>
          </button>
        </div>
      </nav>

      <main className="py-12 animate-premium-entry">
        <div className="max-w-7xl mx-auto px-8">
          <header className="mb-12">
            <h1 className="font-bebas text-6xl md:text-7xl tracking-[6px] text-white leading-tight mb-2">
              {view === 'org' ? (
                <>ORGANIGRAMME <span className="text-ted-red">2026</span>–2027</>
              ) : view === 'gantt' ? (
                <>PLANNING <span className="text-ted-red">SYNCHRONISÉ</span></>
              ) : (
                <>PROGRAMME <span className="text-ted-red">2026</span>–2027</>
              )}
            </h1>
            <p className="text-ted-muted text-sm font-medium max-w-2xl tracking-wide leading-relaxed opacity-70 font-inter">
              {view === 'org' 
                ? "Structure organisationnelle et responsables des pôles IMT × EULiST."
                : view === 'gantt'
                ? "Vue panoramique des échéances et de la progression en temps réel."
                : "Direction l'excellence opérationnelle pour l'organisation de l'événement TEDx IMT × EULiST."}
            </p>
          </header>
        </div>

        <div className={`${view === 'org' ? 'w-full px-4' : 'max-w-7xl mx-auto px-8'}`}>
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
            <OrgChartView 
              orgData={orgData} 
              setOrgData={setOrgData} 
              isAdmin={isAdmin} 
            />
          )}
        </div>
      </main>

      <EditModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        type={modalType}
        months={data.months}
        orgData={orgData}
        initialData={
          modalType === 'axe' && modalTarget 
            ? data.months[modalTarget.mIdx].axes[modalTarget.aIdx] 
            : (modalType === 'milestone' && modalTarget ? data.months[modalTarget.mIdx] : {})
        }
        onSave={handleSaveModal}
        onDelete={handleDeleteTarget}
      />
    </div>
  );
};

export default App;
