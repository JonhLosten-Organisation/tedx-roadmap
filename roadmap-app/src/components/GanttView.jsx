import React, { useEffect, useRef, useState } from 'react';
import Gantt from 'frappe-gantt';
import '../assets/frappe-gantt.css';

const GanttView = ({ months }) => {
  const ganttRef = useRef(null);
  const containerRef = useRef(null);
  const [viewMode, setViewMode] = useState('Week');

  useEffect(() => {
    if (!containerRef.current || !months) return;

    const validMonths = months.filter(m => m.axes && m.axes.length > 0);
    if (validMonths.length === 0) return;

    const tasks = [];
    const colorStyles = [];

    validMonths.forEach((month, idx) => {
      // Add Milestone if it has a date
      if (month.date) {
        tasks.push({
          id: `milestone-${idx}`,
          name: `🚩 ${month.milestone || 'Jalon'}`,
          start: month.date,
          end: month.date,
          progress: 100,
          dependencies: '',
          custom_class: 'gantt-milestone-indicator'
        });
      }

      month.axes.forEach((axe) => {
        // Use real dates if available, otherwise fallback to month-based logic
        const start = axe.startDate || '2026-03-01';
        const end = axe.endDate || '2026-03-28';
        const taskId = `task-${axe.id || Math.random().toString(36).substr(2, 9)}`;
        const customClass = `gantt-bar-custom-${axe.id || 'default'}`;

        tasks.push({
          id: taskId,
          name: axe.label,
          start: start,
          end: end,
          progress: axe.progress || 0,
          dependencies: '',
          custom_class: customClass
        });

        if (axe.color) {
          colorStyles.push(`.gantt .${customClass} .bar-progress { fill: ${axe.color} !important; }`);
        }
      });
    });

    if (tasks.length === 0) return;

    // Cleanup and New Element Creation
    containerRef.current.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'gantt-svg-content';
    containerRef.current.appendChild(svg);

    const config = {
      header_height: 65,
      column_width: viewMode === 'Day' ? 60 : (viewMode === 'Week' ? 160 : 280),
      step: 24,
      view_mode: viewMode,
      language: 'fr',
      bar_height: 48,
      bar_corner_radius: 12,
      padding: 30,
      on_click: (task) => console.log('Task clicked:', task),
    };

    try {
      ganttRef.current = new Gantt(svg, tasks, config);
      
      // Inject dynamic styles
      const styleId = 'gantt-dynamic-colors';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = colorStyles.join('\n');

    } catch (e) {
      console.error("Gantt Error:", e);
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [months, viewMode]);

  return (
    <div className="animate-premium-entry mt-8">
      <div className="glass rounded-[2.5rem] p-6 md:p-12 shadow-premium relative border border-white/10 bg-black/60 overflow-hidden">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-ted-red to-transparent opacity-40"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-12 bg-ted-red"></div>
                <span className="text-ted-red text-[11px] font-black uppercase tracking-[5px]">Chronologie Réelle</span>
            </div>
            <h3 className="font-bebas text-5xl md:text-6xl tracking-widest text-white leading-tight">Master Timeline</h3>
            <p className="text-ted-muted text-sm font-medium tracking-wide opacity-70 font-inter max-w-xl mt-3 leading-relaxed">
                Visualisation dynamique des phases critiques. Les couleurs correspondent aux pôles stratégiques définis dans le programme.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-premium backdrop-blur-xl">
            {[
              { id: 'Day', label: 'Jour' },
              { id: 'Week', label: 'Semaine' },
              { id: 'Month', label: 'Mois' }
            ].map(mode => (
              <button 
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-8 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all duration-500 ${viewMode === mode.id ? 'bg-ted-red text-white shadow-[0_0_25px_rgba(230,27,30,0.4)] scale-105' : 'text-ted-muted hover:text-white hover:bg-white/5'}`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-black/40 p-2 min-h-[600px] scrollbar-premium shadow-2xl backdrop-blur-sm">
          <div ref={containerRef} className="gantt-wrapper p-4"></div>
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap gap-12 items-center justify-between border-t border-white/10 pt-10">
            <div className="flex flex-wrap gap-10">
                <div className="flex items-center gap-4 group">
                    <div className="w-5 h-5 rounded-lg bg-ted-red shadow-lg shadow-ted-red/30 transition-all group-hover:scale-125 border border-white/10"></div>
                    <span className="text-[12px] font-black uppercase tracking-[2px] text-white/60 group-hover:text-white transition-colors">Progression</span>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 transition-all group-hover:scale-125 shadow-lg shadow-black/50"></div>
                    <span className="text-[12px] font-black uppercase tracking-[2px] text-white/60 group-hover:text-white transition-colors">Planification</span>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-5 h-5 rounded-lg border-2 border-ted-red shadow-lg transition-all group-hover:scale-125 flex items-center justify-center bg-transparent">
                      <div className="w-1.5 h-1.5 bg-ted-red rounded-full"></div>
                    </div>
                    <span className="text-[12px] font-black uppercase tracking-[2px] text-white/60 group-hover:text-white transition-colors">Jalon Critique</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3 bg-ted-red/5 px-6 py-3 rounded-full border border-ted-red/20 shadow-premium">
                <div className="w-2 h-2 rounded-full bg-ted-red animate-ping"></div>
                <span className="text-[11px] font-black uppercase tracking-[3px] text-ted-red/90 leading-none">Aujourd'hui</span>
            </div>
        </div>
      </div>

      <style>{`
        .gantt-wrapper svg {
          max-width: none !important;
          border-radius: 16px;
          background: transparent !important;
        }
        
        /* Grid Styles */
        .gantt .grid-header { fill: rgba(255,255,255,0.02) !important; stroke: rgba(255,255,255,0.1) !important; stroke-width: 1px; }
        .gantt .grid-row { fill: transparent !important; stroke: rgba(255,255,255,0.05) !important; }
        .gantt .grid-row:nth-child(even) { fill: rgba(255,255,255,0.02) !important; }
        
        /* Text Styles */
        .gantt .lower-text { 
            fill: #ffffff !important; 
            font-family: 'Inter', sans-serif !important; 
            font-size: 11px !important; 
            font-weight: 800 !important; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            opacity: 0.9 !important;
        }
        .gantt .upper-text { 
            fill: #E62B1E !important; 
            font-family: 'Bebas Neue', sans-serif !important; 
            font-size: 18px !important; 
            letter-spacing: 3px !important; 
            opacity: 1 !important; 
        }
        
        /* Bar Styles */
        .gantt .bar-wrapper { cursor: pointer; }
        .gantt .bar { fill: rgba(255,255,255,0.06) !important; stroke: rgba(255,255,255,0.12) !important; stroke-width: 1.5px !important; }
        .gantt .bar-progress { fill: #E62B1E !important; filter: drop-shadow(0 0 15px rgba(230, 43, 30, 0.5)); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .gantt .bar-label { fill: #fff !important; font-family: 'Inter', sans-serif !important; font-weight: 800 !important; font-size: 11px !important; letter-spacing: 0.5px; text-transform: uppercase; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)); }
        
        /* Interactive States */
        .gantt .bar-wrapper:hover .bar { stroke: rgba(255,255,255,0.5) !important; filter: brightness(1.2); }
        .gantt .bar-wrapper:hover .bar-label { fill: #fff !important; opacity: 1; }
        
        /* TODAY LINE */
        .gantt .today-highlight { 
            fill: rgba(230, 43, 30, 0.08) !important; 
            stroke: #E62B1E !important; 
            stroke-width: 2px !important; 
            stroke-dasharray: 8, 4 !important;
            filter: drop-shadow(0 0 10px rgba(230, 43, 30, 0.7));
        }

        /* Arrows & Handles */
        .gantt .arrow { stroke: rgba(255,255,255,0.15) !important; stroke-width: 2; marker-end: none !important; }
        .gantt .handle { fill: #fff !important; opacity: 0; }
        
        /* Scrollbar personalization */
        .scrollbar-premium::-webkit-scrollbar { height: 12px; }
        .scrollbar-premium::-webkit-scrollbar-track { background: rgba(0,0,0,0.6); border-radius: 20px; }
        .scrollbar-premium::-webkit-scrollbar-thumb { background: #333; border-radius: 20px; border: 3px solid transparent; background-clip: content-box; transition: all 0.3s; }
        .scrollbar-premium::-webkit-scrollbar-thumb:hover { background: #E62B1E; background-clip: content-box; }

        /* MILESTONE STYLING */
        .gantt .gantt-milestone-indicator .bar {
            fill: rgba(230, 43, 30, 0.1) !important;
            stroke: #E62B1E !important;
            stroke-width: 3px !important;
            stroke-dasharray: 0 !important;
        }
        .gantt .gantt-milestone-indicator .bar-label {
            fill: #E62B1E !important;
            font-weight: 900 !important;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-size: 13px !important;
        }
      `}</style>
    </div>
  );
};

export default GanttView;
