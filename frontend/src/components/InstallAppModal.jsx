import React, { useState, useEffect } from 'react'
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2, Sparkles } from 'lucide-react'

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    setIsStandalone(isInStandalone)

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // Listen for PWA install event
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setInstalled(true)
      }
      setDeferredPrompt(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>Telefona Uygulama Olarak Ekle</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tarayıcı olmadan, tıpkı normal bir mobil uygulama gibi kullanın!
            </p>
          </div>
        </div>

        {/* Already Installed */}
        {isStandalone ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-emerald-300">
              Uygulama Zaten Telefonunuzda Yüklü!
            </p>
            <p className="text-xs text-slate-400">
              Şu anda uygulamayı tam ekran mobil modunda kullanıyorsunuz.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Guide */
          <div className="space-y-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-indigo-300">
                🍎 iPhone / iPad (Safari) İçin 2 Basit Adım:
              </p>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                  <div className="flex items-center gap-1.5">
                    <span>Safari'nin altındaki</span>
                    <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-sky-400 font-semibold">
                      <Share className="w-3.5 h-3.5" /> Paylaş
                    </span>
                    <span>butonuna basın.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                  <div className="flex items-center gap-1.5">
                    <span>Açılan menüde aşağı kaydırıp</span>
                    <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-amber-400 font-semibold">
                      <PlusSquare className="w-3.5 h-3.5" /> Ana Ekrana Ekle
                    </span>
                    <span>seçeneğine dokunun.</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Sağ üstteki <strong>"Ekle"</strong> butonuna bastığınızda Müfit Hoca logosuyla telefonunuzun ana ekranına gelecektir!
            </p>
          </div>
        ) : deferredPrompt ? (
          /* Android / Chrome One-Click Install */
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Bu platformu telefonunuza yükleyerek internet tarayıcısı çubuğu olmadan tam ekran deneyimle çözün, testlerinizi ve istatistiklerinizi anında görün.
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Hemen Ana Ekrana Ekle (Yükle)</span>
            </button>
          </div>
        ) : (
          /* Generic Android Chrome Guide */
          <div className="space-y-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-indigo-300">
                🤖 Android (Chrome) İçin 2 Basit Adım:
              </p>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                  <span>Chrome'un sağ üst köşesindeki <strong>üç nokta (⋮)</strong> simgesine tıklayın.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                  <span>Menüden <strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> seçeneğine dokunun.</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Telefonunuzun ana ekranına uygulama olarak eklenecektir.
            </p>
          </div>
        )}

        {/* Benefits list */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-around text-[11px] text-slate-400">
          <span>⚡ Hızlı Açılış</span>
          <span>•</span>
          <span>📱 Tam Ekran Mobil</span>
          <span>•</span>
          <span>☁️ Bulut Senkronizasyonu</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
        >
          Kapat
        </button>
      </div>
    </div>
  )
}
