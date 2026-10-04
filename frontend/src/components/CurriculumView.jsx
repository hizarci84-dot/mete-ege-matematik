import React, { useState } from 'react'
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

export default function CurriculumView({
  books,
  activeStudent,
  onOpenTestModal,
  completedTestIds = []
}) {
  const [selectedBookId, setSelectedBookId] = useState(
    activeStudent?.id === 'mete' ? 'orijinal-9' : 'cap-9'
  )
  const [selectedThemeId, setSelectedThemeId] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const currentBook = books.find(b => b.id === selectedBookId) || books[0]

  // Filter themes and tests
  const filteredThemes = currentBook?.themes
    .filter(t => selectedThemeId === 'all' || t.id === selectedThemeId)
    .map(theme => {
      const filteredTopics = theme.topics
        .map(topic => {
          const filteredTests = topic.tests.filter(test => {
            const matchesSearch =
              test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              test.num.toLowerCase().includes(searchQuery.toLowerCase()) ||
              topic.name.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesSearch
          })
          return { ...topic, tests: filteredTests }
        })
        .filter(topic => topic.tests.length > 0)
      return { ...theme, topics: filteredTopics }
    })
    .filter(theme => theme.topics.length > 0)

  // Total test count in current book
  let totalBookTests = 0
  currentBook?.themes.forEach(t => {
    t.topics.forEach(top => {
      totalBookTests += top.tests.length
    })
  })

  return (
    <div className="space-y-6">
      {/* Book Tabs & Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Müfredat ve Test Kitapları Kataloğu
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Öğrencilere aldırılan soru bankalarının tüm testleri dizinlenmiştir. (Etkinlik sayfaları hariç tutulmuştur.)
            </p>
          </div>

          {/* Book Switcher */}
          <div className="flex bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80">
            {books.map(b => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBookId(b.id)
                  setSelectedThemeId('all')
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  selectedBookId === b.id
                    ? b.id === 'orijinal-9'
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{b.short_title || b.title}</span>
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded opacity-80">
                  {b.target_school}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Book Info Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 mb-6">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>{currentBook?.title}</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                {currentBook?.curriculum}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Yayıncı: <strong className="text-slate-200">{currentBook?.publisher}</strong> • Toplam Test:{' '}
              <strong className="text-emerald-400">{totalBookTests} Test</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
            <Info className="w-4 h-4 shrink-0" />
            <span>Etkinlikler filtrelenmiş olup, sadece testler listelenmektedir.</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Konu veya test adı ara (örn: Üslü, Fonksiyon, Pisagor)..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Theme select */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 py-2 px-3 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tüm Temalar ({currentBook?.themes.length})</option>
              {currentBook?.themes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Curriculum Themes and Tests Grid */}
      <div className="space-y-6">
        {filteredThemes?.map(theme => (
          <div
            key={theme.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>{theme.name}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{theme.description}</p>
            </div>

            <div className="space-y-4">
              {theme.topics.map((topic, tIdx) => (
                <div key={tIdx} className="space-y-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    {topic.name}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                    {topic.tests.map(test => {
                      const isCompleted = completedTestIds.includes(test.id)

                      return (
                        <div
                          key={test.id}
                          onClick={() => {
                            onOpenTestModal({
                              id: `custom_${test.id}`,
                              studentId: activeStudent?.id || 'mete',
                              testId: test.id,
                              bookId: currentBook.id,
                              bookTitle: currentBook.title,
                              themeName: theme.name,
                              topicName: topic.name,
                              testTitle: test.title,
                              testNum: test.num,
                              pages: test.pages,
                              qCount: test.q_count || 12,
                              date: new Date().toISOString().split('T')[0]
                            })
                          }}
                          className={`group cursor-pointer p-3 rounded-xl border transition flex flex-col justify-between ${
                            isCompleted
                              ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                              : 'bg-slate-800/50 border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-slate-300 group-hover:text-indigo-400 transition">
                                {test.num}
                              </span>
                              <span className="text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded text-[10px]">
                                s. {test.pages}
                              </span>
                            </div>
                            <h5 className="text-xs font-medium text-slate-200 line-clamp-1">
                              {test.title}
                            </h5>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">{test.q_count || 12} Soru</span>
                            {isCompleted ? (
                              <span className="flex items-center text-emerald-400 font-semibold space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Çözüldü</span>
                              </span>
                            ) : (
                              <span className="text-indigo-400 group-hover:underline flex items-center space-x-1">
                                <span>Çözüm Gir</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
