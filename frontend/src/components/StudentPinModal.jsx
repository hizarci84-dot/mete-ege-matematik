import React, { useState } from 'react'
import { Lock, X, AlertCircle, ArrowRight } from 'lucide-react'
import { verifyStudentPin } from '../api'

export default function StudentPinModal({
  isOpen,
  studentId,
  studentName,
  studentAvatar,
  onClose,
  onSuccess
}) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!pin) return
    setError('')
    setLoading(true)

    try {
      const res = await verifyStudentPin(studentId, pin)
      if (res && res.success) {
        sessionStorage.setItem(`student_auth_${studentId}`, 'true')
        onSuccess(studentId)
        onClose()
      } else {
        setError(res?.error || 'Hatalı şifre girdiniz. Lütfen öğretmeninize danışın.')
      }
    } catch (err) {
      // Fallback local check
      const valid = (studentId === 'mete' && pin === '1234') || (studentId === 'ege' && pin === '5678')
      if (valid) {
        sessionStorage.setItem(`student_auth_${studentId}`, 'true')
        onSuccess(studentId)
        onClose()
      } else {
        setError('Şifre doğrulanamadı.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isMete = studentId === 'mete'
  const accentGradient = isMete
    ? 'from-orange-600 to-amber-600'
    : 'from-blue-600 to-cyan-600'
  const borderColor = isMete ? 'border-orange-500/40' : 'border-blue-500/40'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className={`relative w-full max-w-sm bg-slate-900 border ${borderColor} rounded-2xl shadow-2xl p-6 space-y-5 overflow-hidden`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-lg">
            {studentAvatar || (isMete ? '👨‍🎓' : '🧑‍🎓')}
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {studentName || (isMete ? 'Mete' : 'Ege')} Girişi
          </h3>
          <p className="text-xs text-slate-400">
            Kişisel çalışma alanına ve ödev programına erişmek için bireysel şifreni gir.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              autoFocus
              placeholder="Şifre (4 Haneli)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-2xl tracking-widest font-mono bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {error && (
              <div className="flex items-center space-x-1.5 text-xs text-rose-400 mt-2 justify-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !pin}
            className={`w-full py-2.5 bg-gradient-to-r ${accentGradient} disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-lg flex items-center justify-center space-x-1.5`}
          >
            <span>{loading ? 'Doğrulanıyor...' : 'Giriş Yap'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500">
          Varsayılan Şifre: <strong className="text-slate-400">{isMete ? '1234' : '5678'}</strong> (Öğretmen panelinden güncellenebilir)
        </p>
      </div>
    </div>
  )
}
