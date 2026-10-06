import React from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileCheck2,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react'

export default function TodayHero({
  student,
  todayData,
  upcomingAssignments,
  onOpenTestModal,
  onOpenUpcomingModal
}) {
  const todayList = todayData?.todayAssignments || (todayData?.assignment ? [todayData.assignment] : [])
  const [selectedSlotIndex, setSelectedSlotIndex] = React.useState(0)

  const activeIndex = Math.min(selectedSlotIndex, Math.max(0, todayList.length - 1))
  const assignment = todayList[activeIndex] || todayData?.assignment
  const submission = assignment?.submission
  const isCompleted = assignment?.status === 'completed' || !!submission

  const isMete = student?.id === 'mete'
  const accentColor = isMete ? 'from-orange-600 to-amber-600' : 'from-blue-600 to-cyan-600'
  const ringColor = isMete ? 'border-orange-500/30' : 'border-blue-500/30'
  const badgeBg = isMete ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <img
              src="/mufit-hoca-logo.jpg"
              alt="Müfit Hoca ile Matematik"
              className="w-12 h-12 rounded-full border-2 border-indigo-400 shadow-lg object-cover hidden sm:block shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{student?.avatar}</span>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Hoş Geldin, {student?.name}!
                </h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${ringColor} ${badgeBg}`}>
                  {student?.school}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">
                Müfit Hoca ile Matematik • Kural: Hafta İçi 1 Test, Hafta Sonu 2 Test
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>
                {todayData?.isUpcomingStart ? (
                  <>Başlangıç: <strong className="text-white">5 Ekim 2026 Pazartesi</strong></>
                ) : (
                  <>Tarih: <strong className="text-white">{todayData?.todayDate || '5 Ekim 2026'}</strong></>
                )}
              </span>
            </div>
            <span className="h-3 w-px bg-slate-700 hidden sm:inline" />
            <span className="text-indigo-300 font-semibold">
              Gün: <strong>{assignment?.dayNumber || 1} / {assignment?.totalDays || student?.totalCalendarDays || 237}</strong>
              <span className="text-slate-400 font-normal ml-1">({assignment?.testOrder || 1} / 304 Test)</span>
            </span>
            <span className="h-3 w-px bg-slate-700 hidden sm:inline" />
            <span className="text-emerald-400 font-medium">
              Bitiş: 29 Mayıs 2027
            </span>
          </div>
        </div>
      </div>

      {/* Today's Assignment Card (MAIN HERO) */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-700/80 p-6 md:p-8 shadow-xl">
        {/* Weekend Slot Toggle (If 2 tests scheduled for today) */}
        {todayList.length > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-2 bg-slate-800/80 rounded-xl border border-indigo-500/30">
            <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Hafta Sonu Özel Programı (Bugün 2 Test):
            </span>
            <div className="flex items-center gap-2">
              {todayList.map((asgn, idx) => {
                const done = asgn.status === 'completed' || !!asgn.submission
                return (
                  <button
                    key={asgn.id || idx}
                    onClick={() => setSelectedSlotIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                      activeIndex === idx
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span>{idx === 0 ? '1. Test' : '2. Test'}</span>
                    <span className="text-[10px] opacity-80">({asgn.bookShort})</span>
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-400" />
              {todayList.length > 1
                ? `Hafta Sonu Ödevi (${activeIndex + 1}. Test • ${assignment?.dailySlotName || 'Günün Testi'})`
                : todayData?.isUpcomingStart || assignment?.dayNumber === 1
                ? '1. Günün Ödevi (5 Ekim 2026 Pazartesi)'
                : 'Bugünün Ödevi (Hafta İçi • Günde 1 Test)'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <span className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tamamlandı</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Çözüm Bekliyor</span>
              </span>
            )}
          </div>
        </div>

        {assignment ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Left 2 cols: Test Details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                  assignment.bookId === 'orijinal-9'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  📖 {assignment.bookShort || assignment.bookTitle}
                </span>
                {assignment.stage && (
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/30">
                    🎯 {assignment.stage}
                  </span>
                )}
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  {assignment.themeName}
                </span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                  Sayfa: {assignment.pages}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white">
                  {assignment.topicName} — {assignment.testNum}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {assignment.testTitle}
                </p>
              </div>

              {/* Teacher instructions */}
              <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 text-xs text-slate-300 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Öğretmen Talimatı:</strong>{' '}
                  {assignment.teacherNote || 'Planlanan sürede özenle çözün. Anlaşılmayan soruları işaretleyin.'}
                  <div className="mt-1 text-[11px] text-slate-400">
                    * Kitaptaki açık uçlu etkinlikler atlanmaktadır; yalnızca bu çoktan seçmeli test çözülecektir.
                  </div>
                </div>
              </div>
            </div>

            {/* Right col: Action Button or Completed Results */}
            <div className="lg:col-span-1 bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 text-center">
              {isCompleted ? (
                <div className="space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Tebrikler, Tamamlandı!</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Bugünkü 1 test hedefin sisteme kaydedildi.</p>
                  </div>

                  {/* Solved stats snapshot */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-center">
                    <div>
                      <span className="block text-[10px] text-slate-400">Doğru</span>
                      <strong className="text-sm text-emerald-400">{submission?.correct ?? '-'}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Yanlış</span>
                      <strong className="text-sm text-rose-400">{submission?.wrong ?? '-'}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Net</span>
                      <strong className="text-sm text-amber-400">{submission?.net ?? '-'}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenTestModal(assignment, submission)}
                    className="w-full mt-2 py-2 px-4 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                  >
                    Sonucu Düzenle / İncele
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    <Sparkles className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Hazır mısın?</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Kitabını aç, testini çöz ve sonuçlarını hemen sisteme aktar.
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenTestModal(assignment, null)}
                    className={`w-full py-3 px-5 rounded-xl font-bold text-sm text-white shadow-lg transition-all transform hover:-translate-y-0.5 bg-gradient-to-r ${accentColor} shadow-indigo-500/25 flex items-center justify-center space-x-2`}
                  >
                    <span>Testi Çözdüm / Giriş Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Bugün için atanmış bir test bulunamadı.</p>
            <p className="text-xs mt-1">Öğretmen panelinden veya müfredat kataloğundan yeni test atayabilirsiniz.</p>
          </div>
        )}
      </div>

      {/* Upcoming Next Days Preview (Gelecek Günlerin Testleri) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Gelecek Günlerin Programı (Sıradaki 1 Testler)</h3>
          </div>
          <span className="text-xs text-slate-400">Her gün 1 test</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {upcomingAssignments && upcomingAssignments.slice(0, 3).map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => onOpenUpcomingModal(item)}
              className="group cursor-pointer bg-slate-800/60 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/60 hover:border-indigo-500/40 transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-indigo-400">{item.date}</span>
                <span className="bg-slate-900/60 px-2 py-0.5 rounded text-[11px]">
                  Sayfa {item.pages}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition line-clamp-1">
                {item.testNum}: {item.topicName}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {item.bookTitle}
              </p>
              <div className="mt-3 flex items-center text-[11px] text-slate-400 group-hover:text-indigo-400 transition">
                <span>İncele / Önceden Çöz</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
