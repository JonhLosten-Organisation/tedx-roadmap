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
          name: `◈ ${month.milestone || 'Événement'}`,
          start: month.date,
          end: month.date,
          progress: 100,
          dependencies: '',
          custom_class: 'gantt-milestone-diamond'
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
      column_width: viewMode === 'Day' ? 55 : (viewMode === 'Week' ? 150 : 250),
      step: 24,
      view_mode: viewMode,
      language: 'fr',
      bar_height: 42,
      bar_corner_radius: 10,
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
      <div className="glass rounded-[2.5rem] p-4 sm:p-6 md:p-12 shadow-premium relative border border-white/10 bg-black/60 overflow-hidden">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-ted-red to-transparent opacity-40"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-12 bg-ted-red"></div>
                <span className="text-ted-red text-[11px] font-black uppercase tracking-[5px]">Chronologie Réelle</span>
            </div>
            <h3 className="font-bebas text-4xl sm:text-5xl md:text-6xl tracking-widest text-white leading-tight">Master Timeline</h3>
            <p className="text-ted-muted text-sm font-medium tracking-wide opacity-70 font-inter max-w-xl mt-3 leading-relaxed">
                Visualisation dynamique des phases critiques. Les couleurs correspondent aux pôles stratégiques définis dans le programme.
            </p>
          </div>
          
          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-start gap-1 sm:gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-premium backdrop-blur-xl overflow-x-auto scrollbar-none">
            {[
              { id: 'Day', label: 'Jour' },
              { id: 'Week', label: 'Sem' },
              { id: 'Month', label: 'Mois' }
            ].map(mode => (
              <button 
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex-1 lg:flex-none px-4 sm:px-8 py-2 sm:py-3 rounded-xl text-[10px] sm:text-[12px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${viewMode === mode.id ? 'bg-ted-red text-white shadow-[0_0_25px_rgba(230,27,30,0.4)] scale-105' : 'text-ted-muted hover:text-white hover:bg-white/5'}`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/20 bg-black/90 p-2 min-h-[600px] scrollbar-premium shadow-2xl backdrop-blur-sm">
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
          background: #000000 !important;
        }
        
        /* Force dark header */
        .gantt .grid-header { 
            fill: #000000 !important; 
            background-color: #000000 !important;
            stroke: rgba(255,255,255,0.15) !important; 
        }
        
        /* Grid Styles */
        .gantt .grid-row { fill: #000000 !important; stroke: rgba(255,255,255,0.08) !important; }
        .gantt .grid-row:nth-child(even) { fill: #050505 !important; }
        
        /* Text Styles */
        .gantt .lower-text, .gantt-container .lower-text { 
            fill: #ffffff !important; 
            color: #ffffff !important;
            font-family: 'Inter', sans-serif !important; 
            font-size: 11px !important; 
            font-weight: 800 !important; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            opacity: 1 !important;
        }
        .gantt .upper-text, .gantt-container .upper-text { 
            fill: #ffffff !important; 
            color: #ffffff !important;
            font-family: 'Bebas Neue', sans-serif !important; 
            font-size: 18px !important; 
            letter-spacing: 3px !important; 
            opacity: 1 !important; 
        }
        
        /* Bar Styles */
        .gantt .bar-wrapper .bar { 
            fill: #111111 !important; 
            stroke: rgba(255,255,255,0.3) !important; 
            stroke-width: 2px !important; 
        }
        .gantt .bar-progress { 
            fill: #E62B1E !important; 
            filter: drop-shadow(0 0 12px #E62B1E); 
        }
        .gantt .bar-label { 
            fill: #ffffff !important; 
            color: #ffffff !important;
            font-family: 'Inter', sans-serif !important; 
            font-weight: 950 !important; 
            font-size: 13px !important; 
            letter-spacing: 1.2px; 
            text-transform: uppercase; 
            dominant-baseline: central;
            text-shadow: none !important;
            stroke: none !important;
            pointer-events: none;
        }
        
        .gantt .bar-label.big {
            fill: #ffffff !important;
            font-weight: 1000 !important;
            text-shadow: none !important;
            stroke: none !important;
        }
        
        /* Interactive States */
        .gantt .bar-wrapper:hover .bar { 
            stroke: #ffffff !important;
            fill: #222222 !important;
        }
        
        /* TODAY LINE */
        .gantt .today-highlight { 
            stroke: #E62B1E !important; 
            stroke-width: 2px !important; 
            opacity: 1 !important;
        }

        /* Diamond Milestone Style */
        .gantt .gantt-milestone-diamond .bar {
            fill: #E62B1E !important;
            stroke: #ffffff !important;
            stroke-width: 2px !important;
            transform: scale(0.6) rotate(45deg);
            transform-origin: center;
        }
        
        .gantt .gantt-milestone-diamond .bar-progress {
            display: none;
        }

        .gantt .gantt-milestone-diamond .bar-label {
            fill: #E62B1E !important;
            font-weight: 950 !important;
            transform: translateY(-2px);
        }

        /* Arrows */
        .gantt .arrow { stroke: rgba(255,255,255,0.3) !important; stroke-width: 2; }
      `}</style>
    </div>
  );
};

export default GanttView;
