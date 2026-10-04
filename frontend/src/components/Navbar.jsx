import React from 'react'
import {
  GraduationCap,
  Calendar,
  BarChart3,
  BookOpen,
  CalendarDays,
  ShieldCheck,
  Flame,
  Printer,
  Lock,
  LogOut,
  UserCheck,
  Sun,
  Moon,
  Target,
  Smartphone
} from 'lucide-react'

export default function Navbar({
  students,
  activeStudentId,
  onSelectStudent,
  activeTab,
  onSelectTab,
  onPrint,
  isLockedStudent,
  onExitLock,
  onOpenTeacherLogin,
  theme = 'dark',
  onToggleTheme,
  onOpenInstallModal
}) {
  const currentStudent = students.find(s => s.id === activeStudentId)
  const isTeacher = activeStudentId === 'teacher'

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo & title */}
            <div className="flex items-center space-x-3">
              <img
                src="/mufit-hoca-logo.jpg"
                alt="Müfit Hoca ile Matematik"
                className="w-11 h-11 rounded-full border-2 border-indigo-400/80 shadow-lg shadow-indigo-500/25 shrink-0 object-cover bg-slate-950"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base sm:text-lg text-white tracking-tight">
                    Müfit Hoca ile Matematik
                  </span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                    9. Sınıf (304 Test • 237 Gün)
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">
                  {isLockedStudent
                    ? `${currentStudent?.name} Bireysel Çalışma ve Gelişim Portalı`
                    : 'Mete & Ege Özel Ders Test Takip ve Performans Platformu'}
                </p>
              </div>
            </div>

            {/* Profile badge or Switcher */}
            <div className="flex items-center space-x-2">
              {isLockedStudent ? (
                /* Locked Student Profile Display (Zero Cross-Visibility) */
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                    currentStudent?.id === 'mete'
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}>
                    <span className="text-base">{currentStudent?.avatar}</span>
                    <span className="font-bold">{currentStudent?.name}</span>
                    <span className="text-[10px] opacity-75 bg-black/20 px-1.5 py-0.5 rounded hidden sm:inline">
                      Bireysel Portal
                    </span>
                  </div>

                  {onExitLock && (
                    <button
                      onClick={onExitLock}
                      title="Giriş ekranına dön"
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                /* Unlocked / Teacher Switcher (Only visible to Teacher or at Home) */
                <div className="hidden sm:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
                  <button
                    onClick={() => onSelectStudent('mete')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeStudentId === 'mete'
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span>👨‍🎓 Mete</span>
                  </button>

                  <button
                    onClick={() => onSelectStudent('ege')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeStudentId === 'ege'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span>🧑‍🎓 Ege</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenTeacherLogin) onOpenTeacherLogin()
                      else onSelectStudent('teacher')
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isTeacher
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Öğretmen Paneli</span>
                  </button>
                </div>
              )}

              {/* Streak Badge */}
              {currentStudent && (
                <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 sm:px-3 py-1 rounded-full text-xs text-amber-300">
                  <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="font-semibold">{currentStudent.streakDays || 0} Gün</span>
                </div>
              )}

              {/* Install PWA App Button */}
              {onOpenInstallModal && (
                <button
                  onClick={onOpenInstallModal}
                  title="Telefona Uygulama Olarak Ekle (Ana Ekrana Ekle)"
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 text-emerald-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs border border-emerald-500/40 transition shadow-sm active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline font-bold">Uygulamayı Ekle</span>
                </button>
              )}

              {/* Theme Toggle Button (Koyu Mod / Beyaz Mod) */}
              <button
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Beyaz / Aydınlık Moda Geç' : 'Koyu / Gece Moduna Geç'}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs border border-slate-700 transition shadow-sm"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline font-semibold">Beyaz Mod</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <span className="hidden md:inline font-semibold">Koyu Mod</span>
                  </>
                )}
              </button>

              {/* Print Report */}
              <button
                onClick={onPrint}
                title="Karne & Performans Çıktısı Al"
                className="hidden sm:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs border border-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Rapor Al</span>
              </button>
            </div>
          </div>

          {/* Desktop Tab Navigation */}
          {!isTeacher && (
            <div className="hidden md:flex space-x-1 border-t border-slate-800/80 pt-2 pb-2 overflow-x-auto">
              <button
                onClick={() => onSelectTab('daily')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  activeTab === 'daily'
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Bugünün Testi (1 Test / Gün)</span>
              </button>

              <button
                onClick={() => onSelectTab('calendar')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  activeTab === 'calendar'
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>237 Günlük Takvim (5 Eki - 29 May)</span>
              </button>

              <button
                onClick={() => onSelectTab('curriculum')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  activeTab === 'curriculum'
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Soru Bankaları (ÇAP Plus & Orijinal)</span>
              </button>

              <button
                onClick={() => onSelectTab('mock_exams')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  activeTab === 'mock_exams'
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Deneme Sınavları</span>
              </button>

              <button
                onClick={() => onSelectTab('analytics')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Bireysel Başarı & Gelişim Analizi</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      {!isTeacher && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => onSelectTab('daily')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition ${
              activeTab === 'daily'
                ? 'text-indigo-400 bg-slate-800/90 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span>Bugün</span>
          </button>

          <button
            onClick={() => onSelectTab('mock_exams')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition ${
              activeTab === 'mock_exams'
                ? 'text-indigo-400 bg-slate-800/90 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-5 h-5 mb-0.5" />
            <span>Denemeler</span>
          </button>

          <button
            onClick={() => onSelectTab('calendar')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition ${
              activeTab === 'calendar'
                ? 'text-indigo-400 bg-slate-800/90 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-5 h-5 mb-0.5" />
            <span>Takvim</span>
          </button>

          <button
            onClick={() => onSelectTab('curriculum')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition ${
              activeTab === 'curriculum'
                ? 'text-indigo-400 bg-slate-800/90 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span>Kitaplar</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition ${
              activeTab === 'analytics'
                ? 'text-indigo-400 bg-slate-800/90 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span>Analiz</span>
          </button>

          <button
            onClick={onPrint}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium text-slate-400 hover:text-white transition"
          >
            <Printer className="w-5 h-5 mb-0.5" />
            <span>Karne</span>
          </button>
        </nav>
      )}
    </>
  )
}
