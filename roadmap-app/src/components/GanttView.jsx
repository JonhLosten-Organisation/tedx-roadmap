import { useEffect, useMemo, useRef, useState } from 'react'

const GanttView = ({ months }) => {
  const [viewMode, setViewMode] = useState('Month')
  const scrollContainerRef = useRef(null)
  const pointerStateRef = useRef({
    isDragging: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia('(max-width: 640px)')
    const apply = () => {
      setViewMode((prev) => {
        if (prev !== 'Month' && prev !== 'Week' && prev !== 'Day') return 'Week'
        return mq.matches && prev === 'Month' ? 'Week' : prev
      })
    }

    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  const handlePointerDown = (e) => {
    const el = scrollContainerRef.current
    if (!el) return

    pointerStateRef.current.isDragging = true
    pointerStateRef.current.pointerId = e.pointerId
    pointerStateRef.current.startX = e.clientX
    pointerStateRef.current.startScrollLeft = el.scrollLeft

    try {
      el.setPointerCapture(e.pointerId)
    } catch {
      // no-op: not all browsers support capture for this element
    }
  }

  const handlePointerUp = (e) => {
    const el = scrollContainerRef.current
    if (!el) return

    if (pointerStateRef.current.pointerId === e.pointerId) {
      pointerStateRef.current.isDragging = false
      pointerStateRef.current.pointerId = null
    }
  }

  const handlePointerMove = (e) => {
    const el = scrollContainerRef.current
    if (!el) return
    if (!pointerStateRef.current.isDragging) return
    if (pointerStateRef.current.pointerId !== e.pointerId) return

    e.preventDefault()
    const walk = (e.clientX - pointerStateRef.current.startX) * 1.6
    el.scrollLeft = pointerStateRef.current.startScrollLeft - walk
  }

  // Date utilities
  const timelineConfig = useMemo(() => {
    let minDate = new Date('2026-01-01')
    let maxDate = new Date('2027-04-30') // Default range

    if (months && months.length > 0) {
      let foundDates = []
      months.forEach((m) => {
        if (m.date) foundDates.push(new Date(m.date))
        m.axes?.forEach((a) => {
          if (a.startDate) foundDates.push(new Date(a.startDate))
          if (a.endDate) foundDates.push(new Date(a.endDate))
        })
      })

      if (foundDates.length > 0) {
        minDate = new Date(Math.min(...foundDates))
        maxDate = new Date(Math.max(...foundDates))

        // Add padding: 1 month before, 2 months after
        minDate.setMonth(minDate.getMonth() - 1)
        maxDate.setMonth(maxDate.getMonth() + 2)
      }
    }

    // Force start of month for minDate
    minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    // Force end of month for maxDate
    maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0)

    const timelineStart = minDate
    const timelineEnd = maxDate
    const totalDays = Math.ceil((timelineEnd - timelineStart) / (1000 * 60 * 60 * 24))

    // Column widths based on view mode
    const dayWidth = viewMode === 'Day' ? 40 : viewMode === 'Week' ? 15 : 4
    const totalWidth = totalDays * dayWidth

    // Generate month headers
    const headers = []
    let current = new Date(timelineStart)
    while (current <= timelineEnd) {
      const year = current.getFullYear()
      const month = current.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()

      headers.push({
        label: current.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
        days: daysInMonth,
        width: daysInMonth * dayWidth,
        date: new Date(current),
      })

      current.setMonth(current.getMonth() + 1)
    }

    return { start: timelineStart, end: timelineEnd, totalDays, dayWidth, totalWidth, headers }
  }, [months, viewMode])

  // Calculate position and width for a bar
  const calculateBarMetrics = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return { left: 0, width: 0, valid: false }

    const start = new Date(startDateStr)
    const end = new Date(endDateStr)

    if (start > timelineConfig.end || end < timelineConfig.start)
      return { left: 0, width: 0, valid: false }

    // Clamp dates to timeline bounds
    const clampedStart = start < timelineConfig.start ? timelineConfig.start : start
    const clampedEnd = end > timelineConfig.end ? timelineConfig.end : end

    const daysFromStart = (clampedStart - timelineConfig.start) / (1000 * 60 * 60 * 24)
    const durationDays = (clampedEnd - clampedStart) / (1000 * 60 * 60 * 24) + 1 // +1 to include end day

    return {
      left: daysFromStart * timelineConfig.dayWidth,
      width: durationDays * timelineConfig.dayWidth,
      valid: true,
      isCutStart: start < timelineConfig.start,
      isCutEnd: end > timelineConfig.end,
    }
  }

  // Today indicator metrics
  const today = new Date()
  const todayDaysFromStart = (today - timelineConfig.start) / (1000 * 60 * 60 * 24)
  const todayLeft = todayDaysFromStart * timelineConfig.dayWidth
  const showToday = today >= timelineConfig.start && today <= timelineConfig.end

  // Flatten tasks for rendering
  const rows = useMemo(() => {
    let rowIndex = 0
    const result = []

    ;(months || []).forEach((month) => {
      // Month separator / Milestone (if date exists)
      result.push({
        type: 'month_separator',
        config: month,
        rowIndex: rowIndex++,
      })

      // Tasks
      ;(month.axes || []).forEach((axe) => {
        result.push({
          type: 'task',
          config: axe,
          rowIndex: rowIndex++,
        })
      })
    })
    return result
  }, [months])

  const rowHeight = 48 // px

  return (
    <div className="mt-8 animate-premium-entry">
      <div className="glass relative flex h-[calc(100vh-120px)] min-h-[700px] flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/60 p-4 shadow-premium sm:h-auto sm:p-6 md:p-12">
        {/* Header Decor */}
        <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-transparent via-ted-red to-transparent opacity-40"></div>

        <div className="relative z-10 mb-6 flex shrink-0 flex-col items-start justify-between gap-6 sm:mb-8 sm:gap-8 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-px w-12 bg-ted-red"></div>
              <span className="text-[11px] font-black uppercase tracking-[5px] text-ted-red">
                Chronologie Réelle
              </span>
            </div>
            <h3 className="font-bebas text-4xl leading-tight tracking-widest text-white sm:text-5xl md:text-6xl">
              Master Timeline
            </h3>
            <p className="mt-3 hidden max-w-xl font-inter text-sm font-medium leading-relaxed tracking-wide text-ted-muted opacity-70 sm:block">
              Visualisation fluide 100% Native React. Utilisez la souris pour glisser
              horizontalement sur la timeline.
            </p>
          </div>

          <div className="flex w-full shrink-0 items-center justify-between gap-1 rounded-2xl border border-white/10 bg-black/60 p-1.5 shadow-premium backdrop-blur-xl sm:gap-2 lg:w-auto lg:justify-start">
            {[
              { id: 'Day', label: 'Détail' },
              { id: 'Week', label: 'Moyen' },
              { id: 'Month', label: 'Global' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-500 sm:px-8 sm:py-3 sm:text-[12px] lg:flex-none ${viewMode === mode.id ? 'scale-105 bg-ted-red text-white shadow-[0_0_25px_rgba(230,27,30,0.4)]' : 'text-ted-muted hover:bg-white/5 hover:text-white'}`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Gantt Container */}
        <div className="relative flex flex-1 select-none flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-md">
          {/* Scrollable Area */}
          <div
            ref={scrollContainerRef}
            className="scrollbar-premium absolute inset-0 h-full w-full cursor-grab overflow-x-auto overflow-y-auto active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerMove={handlePointerMove}
            style={{ touchAction: 'pan-y' }}
          >
            <div
              className="relative min-h-full"
              style={{ width: Math.max(timelineConfig.totalWidth + 300, 1000) + 'px' }}
            >
              {/* Timeline Header (Months) */}
              <div className="sticky top-0 z-40 flex h-14 border-b border-white/10 bg-black/95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                {timelineConfig.headers.map((header, idx) => (
                  <div
                    key={idx}
                    className="flex flex-shrink-0 items-end border-r border-white/5 px-4 pb-2"
                    style={{ width: header.width + 'px' }}
                  >
                    <span className="truncate font-bebas text-xl uppercase tracking-widest text-white opacity-80 drop-shadow-md sm:text-2xl">
                      {header.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grid Background Lines (Months) */}
              <div className="pointer-events-none absolute bottom-0 left-0 top-14 z-10 flex border-l border-white/5">
                {timelineConfig.headers.map((header, idx) => (
                  <div
                    key={idx}
                    className="h-full flex-shrink-0 border-r border-white/5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgwLjV2NDBIMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-40"
                    style={{ width: header.width + 'px' }}
                  />
                ))}
              </div>

              {/* Today Marker */}
              {showToday && (
                <div
                  className="pointer-events-none absolute bottom-0 top-14 z-20 flex flex-col items-center"
                  style={{ left: todayLeft + 'px' }}
                >
                  <div className="-translate-x-1/2 whitespace-nowrap rounded-b bg-ted-red px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(230,27,30,1)]">
                    Auj.
                  </div>
                  <div className="h-full w-0.5 bg-gradient-to-b from-ted-red via-ted-red to-transparent opacity-80 shadow-[0_0_10px_rgba(230,27,30,1)]"></div>
                </div>
              )}

              {/* Rows Container */}
              <div className="relative z-30 w-full pb-12 pt-4">
                {rows.map((row) => {
                  if (row.type === 'month_separator') {
                    // Render milestone / category header
                    const hasDate = Boolean(row.config.date)
                    const metrics = hasDate
                      ? calculateBarMetrics(row.config.date, row.config.date)
                      : null

                    return (
                      <div
                        key={`sep-${row.rowIndex}`}
                        className="group relative flex items-center transition-colors hover:bg-white/5"
                        style={{ height: rowHeight + 'px' }}
                      >
                        {/* Horizontal separator line */}
                        <div className="absolute left-0 top-1/2 h-px w-full bg-white/10 transition-colors group-hover:bg-white/20"></div>

                        {/* Label (Sticky to screen left ideally, but placing it fixed on timeline for now) */}
                        <div className="pointer-events-none sticky left-4 z-40 flex items-center pr-8 drop-shadow-2xl">
                          <span className="relative flex items-center justify-center rounded-r-xl border-y border-r border-white/20 bg-black/90 px-4 py-1.5 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl before:absolute before:inset-0 before:rounded-r-xl before:bg-gradient-to-r before:from-white/10 before:to-transparent before:content-['']">
                            <span className="text-[10px] font-black uppercase tracking-[3px] text-white/80 drop-shadow-md sm:text-[11px]">
                              {row.config.month}
                            </span>
                          </span>
                        </div>

                        {/* Milestone Diamond if applicable */}
                        {hasDate && metrics?.valid && (
                          <div
                            className="absolute top-1/2 z-20 flex -translate-y-1/2 items-center gap-3 drop-shadow-2xl"
                            style={{ left: metrics.left + 'px' }}
                          >
                            <div className="relative z-10 flex items-center justify-center">
                              <div className="h-5 w-5 rotate-45 rounded-sm border-2 border-white bg-ted-red shadow-[0_0_20px_rgba(230,27,30,0.8)] sm:h-6 sm:w-6"></div>
                              <div className="absolute z-10 h-1.5 w-1.5 animate-pulse rounded-full bg-white sm:h-2 sm:w-2"></div>
                            </div>
                            <span className="whitespace-nowrap rounded-lg border border-white/10 bg-black/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-md sm:text-xs">
                              {row.config.milestone || 'Événement'}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  }

                  // Render standard task bar
                  const axe = row.config
                  const metrics = calculateBarMetrics(
                    axe.startDate || '2026-03-01',
                    axe.endDate || '2026-03-28',
                  )
                  const progress = parseInt(axe.progress || 0)

                  if (!metrics.valid || metrics.width <= 0) {
                    return <div key={`task-${row.rowIndex}`} style={{ height: rowHeight + 'px' }} />
                  } // Invisible row if invalid dates

                  return (
                    <div
                      key={`task-${row.rowIndex}`}
                      className="relative transition-colors hover:bg-white/[0.04]"
                      style={{ height: rowHeight + 'px' }}
                    >
                      {/* Grid row background alternating */}
                      {row.rowIndex % 2 !== 0 && (
                        <div className="absolute inset-0 bg-white/[0.02]"></div>
                      )}

                      {metrics.valid && metrics.width > 0 && (
                        <div
                          className="group absolute top-1/2 z-20 flex h-8 -translate-y-1/2 cursor-pointer items-center overflow-hidden rounded-xl border border-white/20 bg-black/80 shadow-2xl backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-white/50 sm:h-10"
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
                            className="absolute left-0 top-0 h-full bg-gradient-to-r transition-all duration-1000 ease-out"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: axe.color || '#E62B1E',
                              backgroundImage: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2))`,
                              opacity: 0.9,
                              boxShadow: `0 0 25px ${axe.color || '#E62B1E'}`,
                            }}
                          >
                            <div className="absolute right-0 top-0 h-full w-1 bg-white/50"></div>
                          </div>

                          {/* Inner Label */}
                          <div className="pointer-events-none relative z-10 flex w-full items-center justify-between px-3 drop-shadow-md">
                            <span className="truncate text-[10px] font-black uppercase tracking-widest text-white mix-blend-screen sm:text-xs">
                              {axe.label}
                            </span>
                            {progress > 0 && (
                              <span className="ml-2 hidden shrink-0 text-[9px] font-black text-white/80 mix-blend-screen sm:block">
                                {progress}%
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex shrink-0 flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-6 sm:gap-12">
          <div className="flex flex-wrap gap-6 sm:gap-10">
            <div className="group flex items-center gap-3 sm:gap-4">
              <div className="h-4 w-4 rounded-md border border-white/10 bg-ted-red opacity-90 shadow-lg shadow-ted-red/30 transition-all group-hover:scale-125 sm:h-5 sm:w-5 sm:rounded-lg"></div>
              <span className="text-[10px] font-black uppercase tracking-[2px] text-white/60 transition-colors group-hover:text-white sm:text-[12px]">
                Progression
              </span>
            </div>
            <div className="group flex items-center gap-3 sm:gap-4">
              <div className="h-4 w-4 rounded-md border border-white/30 bg-black/80 shadow-lg shadow-black/80 backdrop-blur-md transition-all group-hover:scale-125 sm:h-5 sm:w-5 sm:rounded-lg"></div>
              <span className="text-[10px] font-black uppercase tracking-[2px] text-white/60 transition-colors group-hover:text-white sm:text-[12px]">
                Planification
              </span>
            </div>
            <div className="group flex items-center gap-3 sm:gap-4">
              <div className="relative flex items-center justify-center transition-all group-hover:scale-125">
                <div className="h-3 w-3 rotate-45 rounded-sm border border-white bg-ted-red shadow-[0_0_15px_rgba(230,27,30,0.6)] sm:h-4 sm:w-4"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[2px] text-white/60 transition-colors group-hover:text-white sm:text-[12px]">
                Jalon Critique
              </span>
            </div>
          </div>

          <div className="pointer-events-none flex items-center gap-2 rounded-full border border-ted-red/20 bg-ted-red/10 px-4 py-2 shadow-premium sm:gap-3 sm:px-6">
            <div className="h-1.5 w-1.5 animate-ping rounded-full bg-ted-red sm:h-2 sm:w-2"></div>
            <span className="text-[9px] font-black uppercase leading-none tracking-[2px] text-ted-red/90 sm:text-[10px]">
              Aujourd'hui
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GanttView
