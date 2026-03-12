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
      header_height: 60,
      column_width: viewMode === 'Day' ? 45 : (viewMode === 'Week' ? 140 : 250),
      step: 24,
      view_mode: viewMode,
      language: 'fr',
      bar_height: 35,
      bar_corner_radius: 8,
      padding: 25,
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
      <div className="glass rounded-[2rem] p-10 shadow-premium relative border border-white/10 bg-black/60 overflow-hidden">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-ted-red to-transparent opacity-50"></div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 mb-12 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-8 bg-ted-red"></div>
                <span className="text-ted-red text-[10px] font-bold uppercase tracking-[4px]">Planning Temporel</span>
            </div>
            <h3 className="font-bebas text-5xl tracking-widest text-white leading-tight">Master Timeline</h3>
            <p className="text-ted-muted text-sm font-medium tracking-wide opacity-60 font-inter max-w-lg mt-2">
                Vue panoramique synchronisée sur les dates réelles. 
                Couleurs personnalisées par axe stratégique.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 bg-black/80 p-2 rounded-2xl border border-white/10 shadow-inner">
            {[
              { id: 'Day', label: 'Jour' },
              { id: 'Week', label: 'Semaine' },
              { id: 'Month', label: 'Mois' }
            ].map(mode => (
              <button 
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === mode.id ? 'bg-ted-red text-white shadow-lg ted-red-glow' : 'text-ted-muted hover:text-white hover:bg-white/5'}`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20 p-4 min-h-[500px] scrollbar-premium">
          <div ref={containerRef} className="gantt-wrapper"></div>
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap gap-10 items-center justify-between border-t border-white/5 pt-10">
            <div className="flex gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md bg-ted-red shadow-lg shadow-ted-red/20 transition-transform hover:scale-110"></div>
                    <span className="text-[11px] font-bold uppercase tracking-[2px] text-ted-muted">Progression active</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md bg-ted-dark border border-white/20 transition-transform hover:scale-110"></div>
                    <span className="text-[11px] font-bold uppercase tracking-[2px] text-ted-muted">Planifié</span>
                </div>
            </div>
            <div className="flex items-center gap-2 text-ted-red/80 font-bold text-[10px] uppercase tracking-widest animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-ted-red"></div>
                Ligne rouge : Aujourd'hui
            </div>
        </div>
      </div>

      <style>{`
        .gantt-wrapper svg {
          max-width: none !important;
          border-radius: 12px;
        }
        
        /* Grid Styles */
        .gantt .grid-header { fill: #111 !important; stroke: #262626 !important; stroke-width: 1px; }
        .gantt .grid-row { fill: #0a0a0a !important; stroke: #1a1a1a !important; }
        .gantt .grid-row:nth-child(even) { fill: #0d0d0d !important; }
        
        /* Text Styles */
        .gantt .lower-text { fill: rgba(180,180,180,0.6) !important; font-family: 'Inter', sans-serif !important; font-size: 11px !important; font-weight: 500; text-transform: capitalize; }
        .gantt .upper-text { fill: #E62B1E !important; font-family: 'Bebas Neue', sans-serif !important; font-size: 16px !important; letter-spacing: 2px !important; }
        
        /* Bar Styles */
        .gantt .bar-wrapper { cursor: pointer; }
        .gantt .bar { fill: #1a1a1a !important; stroke: rgba(255,255,255,0.05) !important; stroke-width: 1px !important; }
        .gantt .bar-progress { fill: #E62B1E !important; filter: drop-shadow(0 0 5px rgba(230, 43, 30, 0.4)); transition: fill 0.3s ease; }
        .gantt .bar-label { fill: #fff !important; font-family: 'Inter', sans-serif !important; font-weight: 600 !important; font-size: 11px !important; letter-spacing: 0.2px; text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
        
        /* TODAY LINE */
        .gantt .today-highlight { 
            fill: none !important; 
            stroke: #E62B1E !important; 
            stroke-width: 2px !important; 
            stroke-dasharray: 4, 4 !important;
            opacity: 0.8 !important;
        }

        /* Arrows & Handles */
        .gantt .arrow { stroke: rgba(255,255,255,0.1) !important; stroke-width: 1.5; }
        .gantt .handle { fill: #E62B1E !important; opacity: 0; }
        
        /* Scrollbar personalization */
        .scrollbar-premium::-webkit-scrollbar { height: 10px; }
        .scrollbar-premium::-webkit-scrollbar-track { background: #0a0a0a; border-radius: 20px; }
        .scrollbar-premium::-webkit-scrollbar-thumb { background: #333; border-radius: 20px; border: 3px solid #0a0a0a; }
        .scrollbar-premium::-webkit-scrollbar-thumb:hover { background: #E62B1E; }

        /* MILESTONE STYLING */
        .gantt .gantt-milestone-indicator .bar {
            fill: #E62B1E !important;
            stroke: #fff !important;
            stroke-width: 2px !important;
            transform: scale(0.8) translateY(2px);
        }
        .gantt .gantt-milestone-indicator .bar-label {
            fill: #E62B1E !important;
            font-weight: 800 !important;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
};

export default GanttView;
