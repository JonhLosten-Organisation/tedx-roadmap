import React, { useState, useMemo, useRef } from 'react';

const GanttView = ({ months }) => {
  const [viewMode, setViewMode] = useState('Month');
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Drag to scroll logic
  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Date utilities
  const timelineConfig = useMemo(() => {
    let minDate = new Date('2026-01-01');
    let maxDate = new Date('2027-04-30'); // Default range

    if (months && months.length > 0) {
      let foundDates = [];
      months.forEach(m => {
        if (m.date) foundDates.push(new Date(m.date));
        m.axes?.forEach(a => {
          if (a.startDate) foundDates.push(new Date(a.startDate));
          if (a.endDate) foundDates.push(new Date(a.endDate));
        });
      });
      
      if (foundDates.length > 0) {
        minDate = new Date(Math.min(...foundDates));
        maxDate = new Date(Math.max(...foundDates));
        
        // Add padding: 1 month before, 2 months after
        minDate.setMonth(minDate.getMonth() - 1);
        maxDate.setMonth(maxDate.getMonth() + 2);
      }
    }

    // Force start of month for minDate
    minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    // Force end of month for maxDate
    maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

    const timelineStart = minDate;
    const timelineEnd = maxDate;
    const totalDays = Math.ceil((timelineEnd - timelineStart) / (1000 * 60 * 60 * 24));
    
    // Column widths based on view mode
    const dayWidth = viewMode === 'Day' ? 40 : (viewMode === 'Week' ? 15 : 4);
    const totalWidth = totalDays * dayWidth;

    // Generate month headers
    const headers = [];
    let current = new Date(timelineStart);
    while (current <= timelineEnd) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      headers.push({
        label: current.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
        days: daysInMonth,
        width: daysInMonth * dayWidth,
        date: new Date(current)
      });
      
      current.setMonth(current.getMonth() + 1);
    }

    return { start: timelineStart, end: timelineEnd, totalDays, dayWidth, totalWidth, headers };
  }, [months, viewMode]);

  // Calculate position and width for a bar
  const calculateBarMetrics = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return { left: 0, width: 0, valid: false };
    
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    if (start > timelineConfig.end || end < timelineConfig.start) return { left: 0, width: 0, valid: false };

    // Clamp dates to timeline bounds
    const clampedStart = start < timelineConfig.start ? timelineConfig.start : start;
    const clampedEnd = end > timelineConfig.end ? timelineConfig.end : end;

    const daysFromStart = (clampedStart - timelineConfig.start) / (1000 * 60 * 60 * 24);
    const durationDays = (clampedEnd - clampedStart) / (1000 * 60 * 60 * 24) + 1; // +1 to include end day

    return {
      left: daysFromStart * timelineConfig.dayWidth,
      width: durationDays * timelineConfig.dayWidth,
      valid: true,
      isCutStart: start < timelineConfig.start,
      isCutEnd: end > timelineConfig.end
    };
  };

  // Today indicator metrics
  const today = new Date();
  const todayDaysFromStart = (today - timelineConfig.start) / (1000 * 60 * 60 * 24);
  const todayLeft = todayDaysFromStart * timelineConfig.dayWidth;
  const showToday = today >= timelineConfig.start && today <= timelineConfig.end;

  // Flatten tasks for rendering
  const rows = useMemo(() => {
    let rowIndex = 0;
    const result = [];
    
    (months || []).forEach(month => {
      // Month separator / Milestone (if date exists)
      result.push({
        type: 'month_separator',
        config: month,
        rowIndex: rowIndex++
      });

      // Tasks
      (month.axes || []).forEach(axe => {
        result.push({
          type: 'task',
          config: axe,
          rowIndex: rowIndex++
        });
      });
    });
    return result;
  }, [months]);

  const rowHeight = 48; // px

  return (
    <div className="animate-premium-entry mt-8">
      <div className="glass rounded-[2.5rem] p-4 sm:p-6 md:p-12 shadow-premium relative border border-white/10 bg-black/60 overflow-hidden flex flex-col h-[calc(100vh-120px)] sm:h-auto min-h-[700px]">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-ted-red to-transparent opacity-40"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8 mb-6 sm:mb-8 relative z-10 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="h-px w-12 bg-ted-red"></div>
                <span className="text-ted-red text-[11px] font-black uppercase tracking-[5px]">Chronologie Réelle</span>
            </div>
            <h3 className="font-bebas text-4xl sm:text-5xl md:text-6xl tracking-widest text-white leading-tight">Master Timeline</h3>
            <p className="text-ted-muted text-sm font-medium tracking-wide opacity-70 font-inter max-w-xl mt-3 leading-relaxed hidden sm:block">
                Visualisation fluide 100% Native React. Utilisez la souris pour glisser horizontalement sur la timeline.
            </p>
          </div>
          
          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-start gap-1 sm:gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-premium backdrop-blur-xl shrink-0">
            {[
              { id: 'Day', label: 'Détail' },
              { id: 'Week', label: 'Moyen' },
              { id: 'Month', label: 'Global' }
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

        {/* Custom Gantt Container */}
        <div className="border border-white/10 rounded-2xl bg-black/80 overflow-hidden shadow-2xl backdrop-blur-md flex flex-col relative select-none flex-1">
          {/* Scrollable Area */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-auto w-full h-full absolute inset-0 scrollbar-premium cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div className="relative min-h-full" style={{ width: Math.max(timelineConfig.totalWidth + 300, 1000) + 'px' }}>
              
              {/* Timeline Header (Months) */}
              <div className="sticky top-0 z-40 bg-black/95 border-b border-white/10 flex h-14 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                {timelineConfig.headers.map((header, idx) => (
                  <div 
                    key={idx} 
                    className="flex-shrink-0 border-r border-white/5 flex items-end pb-2 px-4"
                    style={{ width: header.width + 'px' }}
                  >
                    <span className="text-white font-bebas text-xl sm:text-2xl tracking-widest opacity-80 uppercase drop-shadow-md truncate">
                      {header.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grid Background Lines (Months) */}
              <div className="absolute top-14 bottom-0 left-0 pointer-events-none z-10 flex border-l border-white/5">
                {timelineConfig.headers.map((header, idx) => (
                  <div 
                    key={idx} 
                    className="flex-shrink-0 border-r border-white/5 h-full opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgwLjV2NDBIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')]"
                    style={{ width: header.width + 'px' }}
                  />
                ))}
              </div>

              {/* Today Marker */}
              {showToday && (
                <div 
                  className="absolute top-14 bottom-0 z-20 pointer-events-none flex flex-col items-center"
                  style={{ left: todayLeft + 'px' }}
                >
                  <div className="bg-ted-red text-white text-[9px] font-black px-2 py-0.5 rounded-b shadow-[0_0_15px_rgba(230,27,30,1)] tracking-wider uppercase whitespace-nowrap -translate-x-1/2">
                    Auj.
                  </div>
                  <div className="w-0.5 h-full bg-gradient-to-b from-ted-red via-ted-red to-transparent opacity-80 shadow-[0_0_10px_rgba(230,27,30,1)]"></div>
                </div>
              )}

              {/* Rows Container */}
              <div className="relative z-30 pt-4 pb-12 w-full">
                {rows.map((row) => {
                  const yPos = row.rowIndex * rowHeight;
                  
                  if (row.type === 'month_separator') {
                    // Render milestone / category header
                    const hasDate = Boolean(row.config.date);
                    const metrics = hasDate ? calculateBarMetrics(row.config.date, row.config.date) : null;
                    
                    return (
                      <div key={`sep-${row.rowIndex}`} className="relative group hover:bg-white/5 transition-colors flex items-center" style={{ height: rowHeight + 'px' }}>
                        {/* Horizontal separator line */}
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 group-hover:bg-white/20 transition-colors"></div>
                        
                        {/* Label (Sticky to screen left ideally, but placing it fixed on timeline for now) */}
                        <div className="sticky left-4 z-40 pointer-events-none drop-shadow-2xl flex items-center pr-8">
                            <span className="bg-black/90 px-4 py-1.5 flex items-center justify-center rounded-r-xl border-y border-r border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl relative before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:rounded-r-xl">
                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[3px] text-white/80 drop-shadow-md">
                                    {row.config.month}
                                </span>
                            </span>
                        </div>

                        {/* Milestone Diamond if applicable */}
                        {hasDate && metrics?.valid && (
                          <div 
                            className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center gap-3 drop-shadow-2xl"
                            style={{ left: metrics.left + 'px' }}
                          >
                            <div className="relative flex items-center justify-center z-10">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm bg-ted-red rotate-45 border-2 border-white shadow-[0_0_20px_rgba(230,27,30,0.8)]"></div>
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full absolute z-10 animate-pulse"></div>
                            </div>
                            <span className="text-white font-black text-[10px] sm:text-xs uppercase tracking-widest bg-black/90 px-3 py-1 rounded-lg border border-white/10 shadow-xl whitespace-nowrap backdrop-blur-md">
                              {row.config.milestone || 'Événement'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Render standard task bar
                  const axe = row.config;
                  const metrics = calculateBarMetrics(axe.startDate || '2026-03-01', axe.endDate || '2026-03-28');
                  const progress = parseInt(axe.progress || 0);

                  if (!metrics.metrics && !metrics.width) return <div key={`task-${row.rowIndex}`} style={{ height: rowHeight + 'px' }} />; // Invisible row if invalid dates
                  
                  return (
                    <div key={`task-${row.rowIndex}`} className="relative hover:bg-white/[0.04] transition-colors" style={{ height: rowHeight + 'px' }}>
                      {/* Grid row background alternating */}
                      {row.rowIndex % 2 !== 0 && <div className="absolute inset-0 bg-white/[0.02]"></div>}

                      {metrics.valid && metrics.width > 0 && (
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 h-8 sm:h-10 rounded-xl border border-white/20 bg-black/80 shadow-2xl group hover:border-white/50 hover:scale-[1.02] transition-all cursor-pointer backdrop-blur-xl flex items-center overflow-hidden z-20"
                          style={{ 
                            left: metrics.left + 'px', 
                            width: Math.max(metrics.width, 30) + 'px', // Minimum width for visibility
                            borderTopLeftRadius: metrics.isCutStart ? '0' : '12px',
                            borderBottomLeftRadius: metrics.isCutStart ? '0' : '12px',
                            borderTopRightRadius: metrics.isCutEnd ? '0' : '12px',
                            borderBottomRightRadius: metrics.isCutEnd ? '0' : '12px',
                          }}
                        >
                          {/* Progress Fill */}
                          <div 
                            className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out bg-gradient-to-r"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: axe.color || '#E62B1E',
                              backgroundImage: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2))`,
                              opacity: 0.9,
                              boxShadow: `0 0 25px ${axe.color || '#E62B1E'}`
                            }}
                          >
                             <div className="absolute top-0 right-0 w-1 h-full bg-white/50"></div>
                          </div>
                          
                          {/* Inner Label */}
                          <div className="relative z-10 px-3 w-full flex items-center justify-between pointer-events-none drop-shadow-md">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white truncate mix-blend-screen">
                                {axe.label}
                            </span>
                            {progress > 0 && (
                                <span className="text-[9px] font-black text-white/80 shrink-0 ml-2 hidden sm:block mix-blend-screen">
                                    {progress}%
                                </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-6 sm:gap-12 items-center justify-between border-t border-white/10 pt-6 shrink-0">
            <div className="flex flex-wrap gap-6 sm:gap-10">
                <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-ted-red shadow-lg shadow-ted-red/30 transition-all group-hover:scale-125 border border-white/10 opacity-90"></div>
                    <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-[2px] text-white/60 group-hover:text-white transition-colors">Progression</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-black/80 border border-white/30 transition-all group-hover:scale-125 shadow-lg shadow-black/80 backdrop-blur-md"></div>
                    <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-[2px] text-white/60 group-hover:text-white transition-colors">Planification</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="relative flex items-center justify-center transition-all group-hover:scale-125">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-ted-red rotate-45 border border-white shadow-[0_0_15px_rgba(230,27,30,0.6)]"></div>
                    </div>
                    <span className="text-[10px] sm:text-[12px] font-black uppercase tracking-[2px] text-white/60 group-hover:text-white transition-colors">Jalon Critique</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 bg-ted-red/10 px-4 sm:px-6 py-2 rounded-full border border-ted-red/20 pointer-events-none shadow-premium">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-ted-red animate-ping"></div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[2px] text-ted-red/90 leading-none">Aujourd'hui</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GanttView;
