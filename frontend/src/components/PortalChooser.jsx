import React from 'react'
import { GraduationCap, ShieldCheck, ArrowRight, BookOpen, Calendar, CheckCircle2 } from 'lucide-react'

export default function PortalChooser({ onSelectStudent, onOpenTeacherLogin, onOpenInstallModal }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
      <div className="max-w-2xl w-full my-auto space-y-8 py-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block mx-auto">
            <img
              src="/mufit-hoca-logo.jpg"
              alt="Müfit Hoca ile Matematik"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-indigo-500/80 shadow-2xl shadow-indigo-500/40 object-cover ring-4 ring-indigo-500/20 mx-auto"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Müfit Hoca ile Matematik
            </h1>
            <p className="text-sm text-indigo-300 font-medium">
              Özel Ders Test Takip, Analiz ve Bireysel Gelişim Portalı
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Mete (Fen Lisesi) & Ege (Anadolu Lisesi) — Maarif Modeli 9. Sınıf
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1 rounded-full text-xs text-indigo-300">
            <span>📅 5 Ekim 2026 — 29 Mayıs 2027</span>
            <span>•</span>
            <span className="font-semibold text-emerald-400">304 Test • 237 Gün (Hafta İçi 1, Hafta Sonu 2 Test)</span>
          </div>

          {onOpenInstallModal && (
            <div className="pt-1">
              <button
                onClick={onOpenInstallModal}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-sky-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-950/40 active:scale-95"
              >
                <span>📲</span>
                <span>Telefona Uygulama Olarak Ekle (Ana Ekrana Ekle)</span>
              </button>
            </div>
          )}
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mete Card */}
          <div
            onClick={() => onSelectStudent('mete')}
            className="group relative bg-slate-900 border border-orange-500/30 hover:border-orange-500/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-950/30 cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-4xl">👨‍🎓</span>
                <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  Fen Lisesi
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition">
                  Mete'nin Çalışma Alanı
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ÇAP Plus & Orijinal Matematik (304 Test • 237 Gün). Yalnızca Mete'ye ait testler, takvim ve başarı karnesi.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-orange-400 font-semibold">
              <span>Bireysel Giriş Yap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Ege Card */}
          <div
            onClick={() => onSelectStudent('ege')}
            className="group relative bg-slate-900 border border-blue-500/30 hover:border-blue-500/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-950/30 cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-4xl">🧑‍🎓</span>
                <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  Anadolu Lisesi
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                  Ege'nin Çalışma Alanı
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ÇAP Plus & Orijinal Matematik (304 Test • 237 Gün). Yalnızca Ege'ye ait testler, takvim ve başarı karnesi.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-semibold">
              <span>Bireysel Giriş Yap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        {/* Teacher Entry Banner */}
        <div
          onClick={onOpenTeacherLogin}
          className="group bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/80 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition hover:bg-slate-800/60"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                Öğretmen Yönetim Portalı
              </h4>
              <p className="text-xs text-slate-400">
                Her iki öğrencinin takibi, karşılaştırmalı analizler, soru arşivi ve karne raporları
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-purple-400 font-semibold px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <span>Öğretmen Girişi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </div>
  )
}
