import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Award
} from 'lucide-react'

export default function CalendarView({
  assignments,
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

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Format date helper: YYYY-MM-DD
  const formatDayDate = (dayNum) => {
    const m = String(month + 1).padStart(2, '0')
    const d = String(dayNum).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  // Monthly stats
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthAssignments = assignments.filter(a => a.date.startsWith(currentMonthPrefix))
  const completedInMonth = monthAssignments.filter(a => a.status === 'completed' || a.submission)

  return (
    <div className="space-y-6">
      {/* Calendar Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {monthNames[month]} {year} — Günlük 1 Test Takvimi
              </h2>
              <p className="text-xs text-slate-400">
                {student?.name} ({student?.school}) için gün gün planlanan ve çözülen testler
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-3 py-1 bg-slate-800 rounded-lg border border-slate-700">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Monthly Quick Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">Aylık Planlanan</span>
            <strong className="text-base text-white">{monthAssignments.length} Gün / Test</strong>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">Tamamlanan Test</span>
            <strong className="text-base text-emerald-400">{completedInMonth.length} Test</strong>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-[11px]">Hedefe Uyum</span>
            <strong className="text-base text-amber-300">
              %{monthAssignments.length > 0 ? Math.round((completedInMonth.length / monthAssignments.length) * 100) : 0}
            </strong>
          </div>
        </div>
      </div>

      {/* 7-column Calendar Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 overflow-hidden">
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
            const isToday = new Date().toISOString().split('T')[0] === dateStr

            return (
              <div
                key={dayNum}
                onClick={() => {
                  if (hasTests) {
                    // Default to first pending or first test
                    const target = dayAsgns.find(a => a.status === 'pending') || dayAsgns[0]
                    onOpenTestModal(target, target?.submission)
                  }
                }}
                className={`min-h-[120px] p-2.5 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                  isToday
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
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
                            {done && <span className="text-[9px] text-emerald-400 font-mono ml-1">{asgn.submission?.net}N</span>}
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
  )
}
