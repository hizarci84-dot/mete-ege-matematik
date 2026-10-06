import React, { useState, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  List,
  CalendarDays,
  Sparkles,
  ArrowRight
} from 'lucide-react'

export default function CalendarView({
  assignments = [],
  student,
  onOpenTestModal
}) {
  const [currentDate, setCurrentDate] = useState(() => {
    // Default to program start month (Ekim 2026) if current date is before start
    const now = new Date()
    if (now < new Date('2026-10-01')) {
      return new Date(2026, 9, 5) // 9 = Ekim
    }
    return now
  })

  // Mobile view mode: 'calendar' (mini month + day inspector) | 'agenda' (scrollable day list)
  const [viewMode, setViewMode] = useState('calendar')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-indexed

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const totalDays = lastDayOfMonth.getDate()

  // Day of week offset (0: Sunday, 1: Monday ...)
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1
  if (startingDayOfWeek === -1) startingDayOfWeek = 6 // Sunday is last in TR

  // Format date helper: YYYY-MM-DD
  const formatDayDate = (dayNum) => {
    const m = String(month + 1).padStart(2, '0')
    const d = String(dayNum).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  // Selected date for mobile inspector (default to today if in month, or first assigned day)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthAssignments = useMemo(
    () => assignments.filter(a => a.date?.startsWith(currentMonthPrefix)),
    [assignments, currentMonthPrefix]
  )
  const completedInMonth = useMemo(
    () => monthAssignments.filter(a => a.status === 'completed' || !!a.submission),
    [monthAssignments]
  )

  const [selectedDate, setSelectedDate] = useState(() => {
    if (todayStr.startsWith(currentMonthPrefix)) return todayStr
    return `${year}-${String(month + 1).padStart(2, '0')}-05` // 5 Ekim program start
  })

  const prevMonth = () => {
    const newD = new Date(year, month - 1, 1)
    setCurrentDate(newD)
    const m = String(newD.getMonth() + 1).padStart(2, '0')
    setSelectedDate(`${newD.getFullYear()}-${m}-01`)
  }

  const nextMonth = () => {
    const newD = new Date(year, month + 1, 1)
    setCurrentDate(newD)
    const m = String(newD.getMonth() + 1).padStart(2, '0')
    setSelectedDate(`${newD.getFullYear()}-${m}-01`)
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDate(todayStr)
  }

  // Assignments for selected date (inspector)
  const selectedDayAssignments = useMemo(
    () => assignments.filter(a => a.date === selectedDate),
    [assignments, selectedDate]
  )

  // Parse selected date for display
  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return null
    const [y, m, d] = selectedDate.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [selectedDate])

  const selectedDateDisplay = useMemo(() => {
    if (!selectedDateObj || isNaN(selectedDateObj.getTime())) return selectedDate
    const dayName = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][selectedDateObj.getDay()]
    const d = selectedDateObj.getDate()
    const mName = monthNames[selectedDateObj.getMonth()]
    const y = selectedDateObj.getFullYear()
    return `${d} ${mName} ${y} ${dayName}`
  }, [selectedDateObj, monthNames])

  return (
    <div className="space-y-5 w-full max-w-full overflow-hidden">
      {/* Calendar Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Title & Student */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                {monthNames[month]} {year} — Çalışma Takvimi
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {student?.name} ({student?.school}) • Gün gün test programı
              </p>
            </div>
          </div>

          {/* Month Navigation & View Toggle */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            {/* View Mode Toggle (Ay / Liste) */}
            <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/70 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                  viewMode === 'calendar'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Ay</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                  viewMode === 'agenda'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Liste</span>
              </button>
            </div>

            {/* Month Prev/Next */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={prevMonth}
                title="Önceki Ay"
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                title="Bugüne Git"
                className="text-xs font-bold text-white px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
              >
                {monthNames[month].slice(0, 3)} {year}
              </button>
              <button
                onClick={nextMonth}
                title="Sonraki Ay"
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Quick Snapshot */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/40 p-2.5 sm:p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] sm:text-[11px]">Aylık Plan</span>
            <strong className="text-sm sm:text-base text-white">{monthAssignments.length} Test</strong>
          </div>
          <div className="bg-slate-800/40 p-2.5 sm:p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] sm:text-[11px]">Tamamlanan</span>
            <strong className="text-sm sm:text-base text-emerald-400">{completedInMonth.length} Test</strong>
          </div>
          <div className="bg-slate-800/40 p-2.5 sm:p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] sm:text-[11px]">Hedefe Uyum</span>
            <strong className="text-sm sm:text-base text-amber-300">
              %{monthAssignments.length > 0 ? Math.round((completedInMonth.length / monthAssignments.length) * 100) : 0}
            </strong>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: AGENDA / LIST VIEW (Perfect for vertical mobile feed & quick scanning) */}
      {viewMode === 'agenda' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <List className="w-4 h-4 text-indigo-400" />
              <span>{monthNames[month]} {year} Günlük Test Listesi</span>
            </h3>
            <span className="text-xs text-slate-400">{monthAssignments.length} Test Planlandı</span>
          </div>

          {monthAssignments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Bu ay için planlanmış test bulunamadı.
            </div>
          ) : (
            <div className="space-y-2.5 divide-y divide-slate-800/40">
              {monthAssignments.map((asgn, idx) => {
                const done = asgn.status === 'completed' || !!asgn.submission
                const isToday = asgn.date === todayStr
                const [y, m, d] = asgn.date.split('-')

                return (
                  <div
                    key={asgn.id || idx}
                    onClick={() => onOpenTestModal(asgn, asgn.submission)}
                    className={`pt-2.5 first:pt-0 p-3 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isToday
                        ? 'bg-indigo-950/25 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                        : done
                        ? 'bg-slate-800/30 border-slate-800 hover:border-emerald-500/40'
                        : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-500'
                    }`}
                  >
                    {/* Left: Date + Test Info */}
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                        isToday
                          ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                          : done
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        <span className="text-sm font-extrabold leading-none">{d}</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">
                          {monthNames[Number(m) - 1].slice(0, 3)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            asgn.bookId === 'cap-9'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          }`}>
                            {asgn.bookShort || (asgn.bookId === 'cap-9' ? '📘 ÇAP' : '📙 Orijinal')}
                          </span>
                          <span className="text-xs font-bold text-white truncate">
                            {asgn.testNum}
                          </span>
                          {asgn.isWeekend && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/30">
                              Hafta Sonu (2x)
                            </span>
                          )}
                          {isToday && (
                            <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-bold">
                              Bugün
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 truncate">
                          {asgn.topicName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Sayfa {asgn.pages}
                        </p>
                      </div>
                    </div>

                    {/* Right: Status badge & Action */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      {done ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                            {asgn.submission?.net} Net
                          </span>
                          <span className="flex items-center text-xs text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            İncele
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30"
                        >
                          <span>Testi Çöz</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          {/* A) MOBILE COMPACT MONTH GRID (< md screens) */}
          <div className="block md:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-1.5">
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days tiles */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading days */}
              {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                <div
                  key={`m-empty-${idx}`}
                  className="aspect-square rounded-xl bg-slate-950/20 border border-slate-900/40"
                />
              ))}

              {/* Days of month */}
              {Array.from({ length: totalDays }).map((_, idx) => {
                const dayNum = idx + 1
                const dateStr = formatDayDate(dayNum)
                const dayAsgns = assignments.filter(a => a.date === dateStr)
                const hasTests = dayAsgns.length > 0
                const allCompleted = hasTests && dayAsgns.every(a => a.status === 'completed' || !!a.submission)
                const someCompleted = hasTests && dayAsgns.some(a => a.status === 'completed' || !!a.submission)
                const isToday = dateStr === todayStr
                const isSelected = dateStr === selectedDate

                return (
                  <button
                    key={`m-day-${dayNum}`}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 relative border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-extrabold border-indigo-400 shadow-md shadow-indigo-600/40 ring-2 ring-indigo-400/80 z-10'
                        : isToday
                        ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300 font-bold'
                        : hasTests
                        ? allCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60'
                          : someCompleted
                          ? 'bg-amber-950/20 border-amber-500/30 text-amber-300 hover:border-amber-500/60'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:border-slate-500'
                        : 'bg-slate-950/30 border-slate-800/40 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{dayNum}</span>

                    {/* Status Dot / Indicator */}
                    {hasTests && (
                      <div className="flex items-center space-x-0.5 mt-0.5">
                        {allCompleted ? (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />
                        ) : someCompleted ? (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-400'}`} />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-400/90'}`} />
                        )}
                        {dayAsgns.length > 1 && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-indigo-200' : 'bg-purple-400'}`} />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 mt-3 border-t border-slate-800 text-[10px] text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Çözüldü</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Bekliyor</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Hafta Sonu (2 Test)</span>
              </span>
            </div>
          </div>

          {/* B) MOBILE SELECTED DAY INSPECTOR CARD (< md screens) */}
          <div className="block md:hidden bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Seçili Gün Programı
                </span>
                <h3 className="text-sm font-bold text-white">
                  📅 {selectedDateDisplay}
                </h3>
              </div>
              {selectedDate === todayStr && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-[10px] font-bold">
                  Bugün
                </span>
              )}
            </div>

            {selectedDayAssignments.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                Bu tarihe planlanmış test bulunmamaktadır.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayAssignments.map((asgn, idx) => {
                  const done = asgn.status === 'completed' || !!asgn.submission
                  return (
                    <div
                      key={asgn.id || idx}
                      className={`p-3.5 rounded-xl border transition ${
                        done
                          ? 'bg-emerald-950/15 border-emerald-500/30'
                          : 'bg-slate-800/80 border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          asgn.bookId === 'cap-9'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        }`}>
                          {asgn.bookShort || (asgn.bookId === 'cap-9' ? '📘 ÇAP' : '📙 Orijinal')}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {asgn.testNum}
                        </span>
                        {asgn.isWeekend && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 ml-auto">
                            Hafta Sonu (2x)
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-slate-200 mb-1">
                        {asgn.topicName}
                      </h4>
                      <p className="text-[11px] text-slate-400 mb-3">
                        Sayfa {asgn.pages}
                      </p>

                      {done ? (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">
                              {asgn.submission?.net} Net (%{asgn.submission?.scorePercent || 0})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenTestModal(asgn, asgn.submission)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition"
                          >
                            İncele
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenTestModal(asgn, null)}
                          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/30"
                        >
                          <span>Testi Çöz ve Kaydet</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* C) DESKTOP DETAILED 7-COLUMN GRID (Hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
            {/* Day name headers */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells before first day */}
              {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="h-28 rounded-xl bg-slate-950/40 border border-slate-800/40 opacity-30"
                />
              ))}

              {/* Days of month */}
              {Array.from({ length: totalDays }).map((_, idx) => {
                const dayNum = idx + 1
                const dateStr = formatDayDate(dayNum)
                const dayAsgns = assignments.filter(a => a.date === dateStr)
                const hasTests = dayAsgns.length > 0
                const allCompleted = hasTests && dayAsgns.every(a => a.status === 'completed' || !!a.submission)
                const someCompleted = hasTests && dayAsgns.some(a => a.status === 'completed' || !!a.submission)
                const isToday = todayStr === dateStr

                return (
                  <div
                    key={dayNum}
                    onClick={() => {
                      if (hasTests) {
                        const target = dayAsgns.find(a => a.status === 'pending') || dayAsgns[0]
                        onOpenTestModal(target, target?.submission)
                      }
                    }}
                    className={`min-h-[120px] p-2.5 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                      isToday
                        ? 'border-indigo-500 bg-indigo-950/25 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                        : hasTests
                        ? allCompleted
                          ? 'bg-emerald-950/15 border-emerald-500/30 hover:border-emerald-500/60'
                          : someCompleted
                          ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-500/60'
                          : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-500'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isToday
                            ? 'bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center'
                            : 'text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {hasTests && (
                        <div className="flex items-center space-x-1">
                          {dayAsgns.length > 1 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                              2 Test
                            </span>
                          )}
                          <span>
                            {allCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : someCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-400/80" />
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Assignment content */}
                    {hasTests ? (
                      <div className="mt-1 space-y-1.5">
                        {dayAsgns.map((asgn, aIdx) => {
                          const done = asgn.status === 'completed' || !!asgn.submission
                          return (
                            <div
                              key={asgn.id || aIdx}
                              onClick={(e) => {
                                e.stopPropagation()
                                onOpenTestModal(asgn, asgn.submission)
                              }}
                              className={`p-1 rounded text-[10px] leading-tight transition hover:bg-slate-700/60 ${
                                done ? 'text-emerald-300 bg-emerald-950/20' : 'text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between font-semibold line-clamp-1">
                                <span className="truncate">
                                  {asgn.bookId === 'cap-9' ? '📘 ÇAP' : '📙 Orijinal'} {asgn.testNum}
                                </span>
                                {done && (
                                  <span className="text-[9px] text-emerald-400 font-mono ml-1">
                                    {asgn.submission?.net}N
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-600 italic">Plan yok</div>
                    )}

                    {/* Footer badge */}
                    {hasTests && (
                      <div className="mt-1 text-[9px] text-slate-400 flex items-center justify-between border-t border-slate-700/30 pt-1">
                        <span className="text-[9px] text-slate-400">
                          {dayAsgns[0].isWeekend ? 'Hafta Sonu (2x)' : 'Hafta İçi (1x)'}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {dayAsgns.map(a => `s.${a.pages}`).join(' • ')}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
