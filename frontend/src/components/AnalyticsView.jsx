import React, { useState } from 'react'
import {
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Target,
  BarChart2,
  ArrowUpRight,
  BookOpen,
  Filter,
  Check,
  ChevronDown
} from 'lucide-react'

export default function AnalyticsView({
  analyticsData,
  comparisonData,
  activeStudent,
  onSelectStudent,
  isLockedStudent = false
}) {
  const [selectedThemeFilter, setSelectedThemeFilter] = useState('all')

  if (!analyticsData) {
    return (
      <div className="text-center py-20 text-slate-400">
        <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
        <p>Analiz verileri yükleniyor...</p>
      </div>
    )
  }

  const { student, summary, trend, topicMastery, submissions } = analyticsData

  // Filtered submissions
  const filteredSubmissions = selectedThemeFilter === 'all'
    ? submissions
    : submissions.filter(s => s.themeName === selectedThemeFilter)

  // Calculate coordinates for SVG trend chart
  const maxNet = 12
  const chartHeight = 160
  const chartWidth = 600

  const points = trend.map((t, idx) => {
    const x = trend.length > 1 ? (idx / (trend.length - 1)) * (chartWidth - 60) + 30 : chartWidth / 2
    const y = chartHeight - (t.net / maxNet) * (chartHeight - 40) - 20
    return { x, y, ...t }
  })

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')

  return (
    <div className="space-y-8">
      {/* Student Profile & Scope Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl">
            {student?.avatar}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {student?.name} — Bireysel Başarı & Gelişim Karnesi
              </h2>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                student?.id === 'mete'
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}>
                {student?.school}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Müfredat: <strong className="text-slate-200">ÇAP Plus (127 Test) & Orijinal Matematik (177 Test)</strong> • 237 Günlük Plan (29 Mayıs 2027 Bitiş)
            </p>
          </div>
        </div>

        {/* Student quick toggle (only visible to teacher / unlocked) */}
        {!isLockedStudent && (
          <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
            <button
              onClick={() => onSelectStudent('mete')}
              className={`px-3 py-1.5 rounded-lg transition ${
                student?.id === 'mete'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mete (Fen)
            </button>
            <button
              onClick={() => onSelectStudent('ege')}
              className={`px-3 py-1.5 rounded-lg transition ${
                student?.id === 'ege'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ege (Anadolu)
            </button>
          </div>
        )}
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Toplam Test */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Çözülen Test</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{summary.totalTests}</div>
          <span className="text-[10px] text-slate-400">Hedef: 1 test/gün</span>
        </div>

        {/* KPI 2: Toplam Soru */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Toplam Soru</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{summary.totalQuestions}</div>
          <span className="text-[10px] text-emerald-400 font-medium">
            %{summary.avgScore} Doğruluk
          </span>
        </div>

        {/* KPI 3: Ortalama Net */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Net Ortalaması</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{summary.avgNet}</div>
          <span className="text-[10px] text-slate-400">Max: 12.0 Net</span>
        </div>

        {/* KPI 4: Başarı Yüzdesi */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Başarı Oranı</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">%{summary.avgScore}</div>
          <span className="text-[10px] text-emerald-400 font-medium">Yüksek Düzey</span>
        </div>

        {/* KPI 5: Çalışma Süresi */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Ortalama Süre</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">
            {summary.avgDurationMinutes} <span className="text-xs font-normal">dk</span>
          </div>
          <span className="text-[10px] text-slate-400">
            ~{summary.avgMinutesPerQuestion} dk / soru
          </span>
        </div>

        {/* KPI 6: Çözme Serisi (Streak) */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs">Aktif Seri</span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {summary.streakDays} <span className="text-xs font-normal">Gün</span>
          </div>
          <span className="text-[10px] text-rose-400 font-medium">Zinciri Kırma 🔥</span>
        </div>
      </div>

      {/* Net Progression Chart & Metric Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Net Trend Line Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Günlük Net Gelişim Trendi</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Çözülen her 1 testin net skoru ve zaman içindeki performansı
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Net Skoru</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-400">
                <span className="w-2.5 h-0.5 bg-slate-600" />
                <span>Hedef: 10 Net</span>
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative w-full overflow-x-auto bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
            >
              {/* Grid lines */}
              {[3, 6, 9, 12].map(n => {
                const y = chartHeight - (n / maxNet) * (chartHeight - 40) - 20
                return (
                  <g key={n}>
                    <line
                      x1="20"
                      y1={y}
                      x2={chartWidth - 20}
                      y2={y}
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text x="5" y={y + 4} fill="#64748b" fontSize="10">
                      {n}
                    </text>
                  </g>
                )
              })}

              {/* Target 10 net line */}
              <line
                x1="20"
                y1={chartHeight - (10 / maxNet) * (chartHeight - 40) - 20}
                x2={chartWidth - 20}
                y2={chartHeight - (10 / maxNet) * (chartHeight - 40) - 20}
                stroke="#6366f1"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />

              {/* Data line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#10b981"
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="hover:r-7 transition-all"
                  />
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {p.net}
                  </text>
                  <text
                    x={p.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                  >
                    {p.testNum}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right col: Accuracy Donut Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Cevap Dağılımı</h3>
            <p className="text-xs text-slate-400">
              Toplam {summary.totalQuestions} sorunun doğruluk analizi
            </p>
          </div>

          <div className="my-6 space-y-4">
            {/* Doğru */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Doğru ({summary.totalCorrect})
                </span>
                <span className="text-emerald-400 font-bold">
                  %{Math.round((summary.totalCorrect / (summary.totalQuestions || 1)) * 100)}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round((summary.totalCorrect / (summary.totalQuestions || 1)) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Yanlış */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Yanlış ({summary.totalWrong})
                </span>
                <span className="text-rose-400 font-bold">
                  %{Math.round((summary.totalWrong / (summary.totalQuestions || 1)) * 100)}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round((summary.totalWrong / (summary.totalQuestions || 1)) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Boş */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-500 inline-block" />
                  Boş ({summary.totalEmpty})
                </span>
                <span className="text-slate-400 font-bold">
                  %{Math.round((summary.totalEmpty / (summary.totalQuestions || 1)) * 100)}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-500 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round((summary.totalEmpty / (summary.totalQuestions || 1)) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300">
            💡 <strong>Analiz Önerisi:</strong> 4 yanlışın 1 doğruyu götürdüğü sistemde, şüpheli sorularda eleme yapılmalı veya derste hocaya sorulmalıdır.
          </div>
        </div>
      </div>

      {/* Tema ve Konu Hakimiyet Haritası (Mastery Matrix) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Müfredat ve Tema Hakimiyet Haritası</h3>
            <p className="text-xs text-slate-400">
              Yeni Maarif Modeli temalarına göre öğrencinin konu kavrama derecesi
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
            Toplam {topicMastery.length} İşlenen Tema
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicMastery.map((theme, idx) => (
            <div
              key={idx}
              className="bg-slate-800/70 border border-slate-700/70 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">
                    {theme.themeName}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {theme.testsCount} Test Çözüldü ({theme.totalQ} Soru)
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    theme.statusColor === 'green'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : theme.statusColor === 'yellow'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {theme.status}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Başarı Oranı</span>
                  <strong className="text-white">%{theme.successRate}</strong>
                </div>
                <div className="w-full bg-slate-700/70 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      theme.statusColor === 'green'
                        ? 'bg-emerald-500'
                        : theme.statusColor === 'yellow'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${theme.successRate}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/50 flex justify-between text-[11px] text-slate-400">
                <span>Net Ortalaması: <strong className="text-slate-200">{theme.avgNet}</strong></span>
                <span>D/Y: <strong className="text-emerald-400">{theme.correct}</strong> / <strong className="text-rose-400">{theme.wrong}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Detailed Solved Tests Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Çözülen Testler Detaylı Günlüğü</h3>
            <p className="text-xs text-slate-400">
              Sistemde kayıtlı tüm tamamlanmış testler ve öğrenci notları
            </p>
          </div>

          {/* Theme Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedThemeFilter}
              onChange={(e) => setSelectedThemeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 py-1.5 px-3 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tüm Temalar ({submissions.length})</option>
              {topicMastery.map((t, idx) => (
                <option key={idx} value={t.themeName}>
                  {t.themeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Tarih</th>
                <th className="py-3 px-3">Kitap & Test</th>
                <th className="py-3 px-3 text-center">D / Y / B</th>
                <th className="py-3 px-3 text-center">Net</th>
                <th className="py-3 px-3 text-center">Başarı</th>
                <th className="py-3 px-3 text-center">Süre</th>
                <th className="py-3 px-3">Öğrenci Notu & Geri Bildirim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-300 font-medium whitespace-nowrap">
                      {sub.date}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{sub.testTitle}</div>
                      <div className="text-[11px] text-slate-400">
                        {sub.bookTitle} • Sayfa {sub.pages}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="text-emerald-400 font-bold">{sub.correct}</span> /{' '}
                      <span className="text-rose-400 font-bold">{sub.wrong}</span> /{' '}
                      <span className="text-slate-400">{sub.empty}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-300">
                      {sub.net}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-emerald-400">
                      %{sub.scorePercent}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-300 whitespace-nowrap">
                      {sub.durationMinutes} dk
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs">
                      {sub.studentNote && (
                        <div className="text-[11px] text-slate-300 italic mb-1">
                          "{sub.studentNote}"
                        </div>
                      )}
                      {sub.teacherFeedback && (
                        <div className="text-[11px] text-indigo-300 bg-indigo-500/10 p-1.5 rounded border border-indigo-500/20">
                          👨‍🏫 <strong>Hoca:</strong> {sub.teacherFeedback}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Seçilen filtrede tamamlanmış test bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
