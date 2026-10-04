import React, { useState } from 'react'
import {
  Target,
  PlusCircle,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileQuestion,
  Building2,
  Camera,
  MessageSquare,
  Trash2,
  Edit2,
  Maximize2,
  X,
  Search,
  Filter,
  BarChart2,
  Layers,
  BookOpen
} from 'lucide-react'

export default function MockExamsView({
  student,
  mockExams = [],
  onOpenModal,
  onDeleteExam
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [publisherFilter, setPublisherFilter] = useState('all')
  const [chartMetric, setChartMetric] = useState('total') // 'total' | 'math'
  const [previewPhoto, setPreviewPhoto] = useState(null)

  // Filter exams for this student
  const studentExams = (mockExams || []).filter(
    exam => exam.studentId === student?.id
  )

  // Sort chronological for chart, reverse chronological for cards
  const chronologicalExams = [...studentExams].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )
  const sortedExams = [...studentExams].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  // Filter by search & publisher
  const filteredExams = sortedExams.filter(exam => {
    if (publisherFilter !== 'all' && exam.publisher !== publisherFilter) {
      return false
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      const titleMatch = exam.examTitle?.toLowerCase().includes(term)
      const pubMatch = exam.publisher?.toLowerCase().includes(term)
      if (!titleMatch && !pubMatch) return false
    }
    return true
  })

  // Aggregated KPI Stats
  const totalExams = studentExams.length

  // Overall General Net Average
  const avgTotalNet = totalExams > 0
    ? (studentExams.reduce((sum, e) => sum + (Number(e.net) || 0), 0) / totalExams).toFixed(2)
    : '0.00'

  // Math Net Average specifically
  const avgMathNet = totalExams > 0
    ? (studentExams.reduce((sum, e) => sum + (Number(e.mathNet ?? e.net) || 0), 0) / totalExams).toFixed(2)
    : '0.00'

  // Highest General Net Exam
  const highestTotalExam = studentExams.length > 0
    ? studentExams.reduce((prev, curr) => (Number(curr.net) > Number(prev.net) ? curr : prev), studentExams[0])
    : null

  // Highest Math Net Exam
  const highestMathExam = studentExams.length > 0
    ? studentExams.reduce((prev, curr) => (Number(curr.mathNet ?? curr.net) > Number(prev.mathNet ?? prev.net) ? curr : prev), studentExams[0])
    : null

  const totalQuestionsSolved = studentExams.reduce((sum, e) => sum + (Number(e.qCount) || 0), 0)
  const avgDuration = totalExams > 0
    ? Math.round(studentExams.reduce((sum, e) => sum + (Number(e.durationMinutes) || 0), 0) / totalExams)
    : 0

  const publishers = ['all', ...Array.from(new Set(studentExams.map(e => e.publisher).filter(Boolean)))]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-inner">
              <Target className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Genel Deneme Sınavları & Net Takip Portalı
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                  {student?.name}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Tüm derslerin (Türkçe, Matematik, Fen, Sosyal) genel deneme sonuçları, net grafiği ve kitapçık soru arşivi
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenModal(null)}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Deneme Sınavı Gir</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Exams */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Toplam Deneme</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {totalExams} <span className="text-xs font-normal text-slate-400">Adet</span>
            </div>
          </div>
        </div>

        {/* Average General Net */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Ortalama Genel Net</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
              {avgTotalNet} <span className="text-xs font-normal text-slate-400">Net</span>
            </div>
          </div>
        </div>

        {/* Math Net Special KPI */}
        <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 shadow-lg flex items-center space-x-3.5 ring-1 ring-indigo-500/20">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-indigo-300 font-semibold uppercase">Matematik Ortalaması</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-0.5 truncate">
              {avgMathNet} <span className="text-xs font-normal text-slate-400">Net</span>
            </div>
          </div>
        </div>

        {/* Highest General Net */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-400 font-medium">En Yüksek Genel Net</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 truncate">
              {highestTotalExam ? Number(highestTotalExam.net).toFixed(2) : '-'} <span className="text-xs font-normal text-slate-400">Net</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Progression Trend Chart with Metric Switcher (Genel Net vs Matematik Neti) */}
      {chronologicalExams.length > 1 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Net Gelişim Çizelgesi: {chartMetric === 'total' ? 'Genel Toplam Netler' : 'Matematik Branş Netleri'}
              </h3>
            </div>

            {/* Toggle metric */}
            <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setChartMetric('total')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  chartMetric === 'total'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎯 Genel Toplam Net
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('math')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  chartMetric === 'math'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📐 Matematik Neti
              </button>
            </div>
          </div>

          <div className="relative pt-4 pb-2 px-2 overflow-x-auto">
            <div className="min-w-[420px] flex items-end justify-between gap-4 h-44 border-b border-slate-800 pb-2">
              {chronologicalExams.map((exam, i) => {
                const isGeneralMetric = chartMetric === 'total'
                const netValue = isGeneralMetric
                  ? Math.max(0, Number(exam.net) || 0)
                  : Math.max(0, Number(exam.mathNet ?? exam.net) || 0)

                const maxPossible = isGeneralMetric
                  ? Math.max(...chronologicalExams.map(e => e.qCount || 120), 120)
                  : Math.max(...chronologicalExams.map(e => e.mathQCount || 30), 40)

                const barHeightPercent = Math.min(100, Math.max(14, Math.round((netValue / maxPossible) * 100)))

                return (
                  <div key={exam.id || i} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-14 bg-slate-800 text-white border border-slate-700 text-[10px] py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-2xl z-30">
                      <div className="font-bold text-white">{exam.examTitle}</div>
                      <div className="text-indigo-300">
                        {isGeneralMetric ? `Genel: ${netValue.toFixed(2)} Net (%${exam.scorePercent || 0})` : `Matematik: ${netValue.toFixed(2)} Net`}
                      </div>
                      <div className="text-slate-400 text-[9px]">{exam.publisher} • {exam.date}</div>
                    </div>

                    {/* Value Badge */}
                    <span className="text-[11px] font-bold text-indigo-300 mb-1">
                      {netValue.toFixed(1)}
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[44px] bg-slate-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end p-0.5">
                      <div
                        style={{ height: `${barHeightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-500 group-hover:brightness-110 ${
                          isGeneralMetric
                            ? 'bg-gradient-to-t from-indigo-700 via-indigo-500 to-purple-400'
                            : 'bg-gradient-to-t from-blue-700 via-indigo-500 to-cyan-400'
                        }`}
                      />
                    </div>

                    {/* Date label */}
                    <span className="text-[10px] text-slate-400 mt-2 truncate max-w-[70px] text-center">
                      {exam.date?.slice(5) || `D${i+1}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Deneme adı veya kurum ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Publisher Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-1" />
          {publishers.map(pub => (
            <button
              key={pub}
              onClick={() => setPublisherFilter(pub)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                publisherFilter === pub
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {pub === 'all' ? 'Tümü' : pub}
            </button>
          ))}
        </div>
      </div>

      {/* Exams Cards List */}
      {filteredExams.length > 0 ? (
        <div className="space-y-4">
          {filteredExams.map((exam) => {
            const isGeneral = exam.examType === 'general' || (exam.subjects && exam.subjects.length > 1)
            const q = Number(exam.qCount) || 120
            const netVal = Number(exam.net) || 0
            const pct = Number(exam.scorePercent) || 0
            const mathNetVal = exam.mathNet !== undefined ? Number(exam.mathNet) : null

            return (
              <div
                key={exam.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition duration-200 space-y-4"
              >
                {/* Top Row: Title, Date, Badges & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isGeneral
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {isGeneral ? '🎯 Genel Deneme Sınavı' : '📐 Branş Denemesi'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                        {exam.publisher || 'Kurumsal Deneme'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.date}</span>
                      </span>
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.durationMinutes || 120} dk</span>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {exam.examTitle}
                    </h3>
                  </div>

                  {/* Top Right: Overall Net and Math Net */}
                  <div className="flex items-center space-x-4 self-end sm:self-center">
                    {/* Math Net pill if multi-subject */}
                    {isGeneral && mathNetVal !== null && (
                      <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl px-3 py-1.5 text-right">
                        <div className="text-[10px] text-indigo-300 font-bold uppercase">📐 Matematik</div>
                        <div className="text-base font-black text-indigo-400">
                          {mathNetVal.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">Net</span>
                        </div>
                      </div>
                    )}

                    {/* Overall Net */}
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Genel Toplam Net</div>
                      <div className="text-xl sm:text-2xl font-black text-white">
                        {netVal.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-slate-400">/ {q} Soru</span>
                      </div>
                      <span className={`text-[10px] font-bold ${
                        pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        %{pct} Başarı
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
                      <button
                        onClick={() => onOpenModal(exam)}
                        title="Düzenle"
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteExam(exam.id)}
                        title="Sil"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Second Row: SUBJECTS BREAKDOWN (DERSLER BAZINDA DÖKÜM) */}
                {exam.subjects && exam.subjects.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Dersler Bazında Sonuçlar & Net Dağılımı:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {exam.subjects.map((sub, sIdx) => {
                        const isMath = sub.name?.toLowerCase().includes('mat') || sub.key === 'matematik'
                        const subNet = Number(sub.net) || 0

                        return (
                          <div
                            key={sub.key || sIdx}
                            className={`p-3 rounded-xl border transition ${
                              isMath
                                ? 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/30'
                                : 'bg-slate-800/60 border-slate-700/60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-white flex items-center space-x-1 truncate">
                                <span>{sub.icon || (isMath ? '📐' : '📝')}</span>
                                <span className="truncate">{sub.name}</span>
                              </span>
                              <span className={`text-xs font-black ${
                                isMath ? 'text-indigo-400' : 'text-emerald-400'
                              }`}>
                                {subNet.toFixed(2)} Net
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
                              <span>{sub.correct || 0} D • {sub.wrong || 0} Y • {sub.empty || 0} B</span>
                              <span className="text-[10px] text-slate-500">{sub.qCount || 30} Soru</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  /* Single subject fallback */
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-emerald-300 block font-medium">Doğru</span>
                      <span className="text-base font-black text-emerald-400">{exam.correct || 0} Soru</span>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-rose-300 block font-medium">Yanlış</span>
                      <span className="text-base font-black text-rose-400">{exam.wrong || 0} Soru</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-amber-300 block font-medium">Boş</span>
                      <span className="text-base font-black text-amber-400">{exam.empty || 0} Soru</span>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-indigo-300 block font-medium">Başarı Oranı</span>
                      <span className="text-base font-black text-indigo-300">%{pct}</span>
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                </div>

                {/* Student Note */}
                {exam.studentNote && (
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300">
                    <strong className="text-indigo-400 block mb-0.5">Öğrenci Notu:</strong>
                    {exam.studentNote}
                  </div>
                )}

                {/* Teacher Feedback Banner (Müfit Hoca) */}
                {exam.teacherFeedback && (
                  <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/40 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span>Müfit Hoca'nın Genel Deneme Değerlendirmesi:</span>
                    </div>
                    <p className="text-xs text-purple-100 pl-6">
                      {exam.teacherFeedback}
                    </p>
                  </div>
                )}

                {/* Booklet Question Photos Gallery with Subject Tags */}
                {exam.questionPhotos && exam.questionPhotos.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-slate-800/80">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                      <Camera className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Deneme Kitapçığından Kaydedilen Sorular ({exam.questionPhotos.length} Soru):</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {exam.questionPhotos.map((photo, pIdx) => (
                        <div
                          key={photo.id || pIdx}
                          onClick={() => setPreviewPhoto(photo.url)}
                          className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video cursor-pointer hover:border-indigo-500 transition"
                        >
                          <img
                            src={photo.url}
                            alt={photo.label || `Soru ${pIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-white" />
                          </div>
                          <span className="absolute bottom-1 left-1 text-[9px] bg-black/85 text-white px-1.5 py-0.5 rounded font-mono truncate max-w-[90%]">
                            {photo.subject || 'Soru'} #{pIdx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Target className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Henüz Genel Deneme Sınavı Kaydı Bulunmuyor</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Okulda veya dershanede girdiğiniz Özdebir, TÖDER veya kurumsal genel denemelerin tüm ders sonuçlarını kaydederek genel net gelişiminizi takip edebilirsiniz.
            </p>
          </div>
          <button
            onClick={() => onOpenModal(null)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25"
          >
            <PlusCircle className="w-4 h-4" />
            <span>İlk Genel Deneme Sınavını Kaydet</span>
          </button>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewPhoto}
              alt="Deneme Sorusu Önizleme"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-slate-800"
            />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-2 right-2 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
