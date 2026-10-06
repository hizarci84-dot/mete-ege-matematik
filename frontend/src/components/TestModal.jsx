import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet,
  Camera,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  UploadCloud,
  Loader2,
  Plus,
  Minus
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { uploadPhoto } from '../api'

export default function TestModal({
  isOpen,
  onClose,
  assignment,
  existingSubmission,
  studentId,
  onSubmitSuccess
}) {
  if (!isOpen || !assignment) return null

  const [qCount, setQCount] = useState(assignment?.qCount || 14)

  useEffect(() => {
    if (assignment?.qCount) {
      setQCount(assignment.qCount)
    }
  }, [assignment?.id, assignment?.qCount])

  const [mode, setMode] = useState('quick') // 'quick' | 'detailed'

  // Photo upload states
  const photoInputRef = useRef(null)
  const [questionPhotos, setQuestionPhotos] = useState(
    existingSubmission?.questionPhotos || []
  )
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState(null)

  // Quick mode states - clean by default for fresh test entry
  const [correct, setCorrect] = useState(existingSubmission?.correct !== undefined ? existingSubmission.correct : '')
  const [wrong, setWrong] = useState(existingSubmission?.wrong !== undefined ? existingSubmission.wrong : '')
  const [empty, setEmpty] = useState(existingSubmission?.empty !== undefined ? existingSubmission.empty : '')
  const [durationMinutes, setDurationMinutes] = useState(
    existingSubmission?.durationMinutes !== undefined ? existingSubmission.durationMinutes : ''
  )
  const [studentNote, setStudentNote] = useState(existingSubmission?.studentNote || '')

  // Reset or initialize fields whenever modal opens or target assignment changes
  useEffect(() => {
    if (isOpen) {
      if (existingSubmission) {
        setCorrect(existingSubmission.correct !== undefined ? existingSubmission.correct : '')
        setWrong(existingSubmission.wrong !== undefined ? existingSubmission.wrong : '')
        setEmpty(existingSubmission.empty !== undefined ? existingSubmission.empty : '')
        setDurationMinutes(existingSubmission.durationMinutes !== undefined ? existingSubmission.durationMinutes : '')
        setStudentNote(existingSubmission.studentNote || '')
        setQuestionPhotos(existingSubmission.questionPhotos || [])
        if (existingSubmission.answers && existingSubmission.answers.length > 0) {
          setAnswers(existingSubmission.answers)
        } else {
          setAnswers(Array.from({ length: qCount }, (_, i) => ({
            qNum: i + 1,
            status: null,
            selectedOption: '',
            difficult: false
          })))
        }
      } else {
        // Fresh entry - completely clean, zero fake numbers
        setCorrect('')
        setWrong('')
        setEmpty('')
        setDurationMinutes('')
        setStudentNote('')
        setQuestionPhotos([])
        setAnswers(Array.from({ length: qCount }, (_, i) => ({
          qNum: i + 1,
          status: null,
          selectedOption: '',
          difficult: false
        })))
      }
    }
  }, [isOpen, assignment?.id, existingSubmission, qCount])

  // Canvas image compression for fast mobile upload and crystal clear math equations
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const maxDim = 1600
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.82))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoUploadChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploadingPhoto(true)
    try {
      const newItems = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const dataUrl = await compressImage(file)
        const res = await uploadPhoto(dataUrl)
        const photoUrl = res.url || dataUrl
        newItems.push({
          id: `qimg_${Date.now()}_${i}`,
          url: photoUrl,
          questionNo: `Soru ${questionPhotos.length + i + 1}`,
          note: ''
        })
      }
      setQuestionPhotos(prev => [...prev, ...newItems])
    } catch (err) {
      console.error('Photo upload error:', err)
      alert('Fotoğraf yüklenirken bir hata oluştu: ' + err.message)
    } finally {
      setIsUploadingPhoto(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (id) => {
    setQuestionPhotos(prev => prev.filter(p => p.id !== id))
  }

  const handlePhotoFieldChange = (id, field, value) => {
    setQuestionPhotos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  // Detailed mode states (per-question answers)
  const [answers, setAnswers] = useState(() => {
    if (existingSubmission?.answers && existingSubmission.answers.length > 0) {
      return existingSubmission.answers
    }
    return Array.from({ length: qCount }, (_, i) => ({
      qNum: i + 1,
      status: null, // clean, not pre-marked
      selectedOption: '',
      difficult: false
    }))
  })

  // Synchronize detailed answers array length when qCount is changed by user
  useEffect(() => {
    setAnswers(prev => {
      if (!prev || prev.length === qCount) return prev
      if (prev.length < qCount) {
        const added = Array.from({ length: qCount - prev.length }, (_, i) => ({
          qNum: prev.length + i + 1,
          status: null,
          selectedOption: '',
          difficult: false
        }))
        return [...prev, ...added]
      }
      return prev.slice(0, qCount)
    })
  }, [qCount])

  // Synchronize detailed answers with counts
  const handleDetailedStatusChange = (qIndex, newStatus) => {
    const nextAnswers = [...answers]
    nextAnswers[qIndex].status = newStatus
    setAnswers(nextAnswers)

    // recalculate counts
    const c = nextAnswers.filter(a => a.status === 'correct').length
    const w = nextAnswers.filter(a => a.status === 'wrong').length
    const e = nextAnswers.filter(a => a.status === 'empty').length
    setCorrect(c)
    setWrong(w)
    setEmpty(e)
  }

  const handleDetailedDifficultToggle = (qIndex) => {
    const nextAnswers = [...answers]
    nextAnswers[qIndex].difficult = !nextAnswers[qIndex].difficult
    setAnswers(nextAnswers)
  }

  // Calculate live Net and Score
  const numCorrect = correct === '' ? 0 : Number(correct)
  const numWrong = wrong === '' ? 0 : Number(wrong)
  const numEmpty = empty === '' ? 0 : Number(empty)
  const hasInput = correct !== '' || wrong !== '' || empty !== ''
  const currentTotal = hasInput ? numCorrect + numWrong + numEmpty : 0
  const net = hasInput ? Math.max(0, parseFloat((numCorrect - (numWrong / 4)).toFixed(2))) : 0
  const scorePercent = (hasInput && qCount > 0) ? Math.round((numCorrect / qCount) * 100) : 0
  const isCountValid = hasInput && currentTotal === qCount

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hasInput) {
      alert('Lütfen test sonuçlarınızı (doğru, yanlış ve boş sayılarını) giriniz.')
      return
    }
    if (!isCountValid) {
      alert(`Doğru (${numCorrect}) + Yanlış (${numWrong}) + Boş (${numEmpty}) toplamı soru sayısına (${qCount}) eşit olmalıdır!`)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        studentId,
        assignmentId: assignment.id,
        testId: assignment.testId,
        bookId: assignment.bookId,
        themeName: assignment.themeName,
        topicName: assignment.topicName,
        testTitle: assignment.testTitle,
        testNum: assignment.testNum,
        pages: assignment.pages,
        date: assignment.date,
        qCount,
        correct: numCorrect,
        wrong: numWrong,
        empty: numEmpty,
        net,
        scorePercent,
        durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : 0,
        mode,
        answers: mode === 'detailed' ? answers : [],
        studentNote,
        questionPhotos
      }

      await onSubmitSuccess(payload)

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        })
      } catch (err) {}

      onClose()
    } catch (err) {
      alert('Kayıt sırasında bir hata oluştu: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-[94vh] sm:h-auto sm:max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Fixed at Top */}
        <div className="shrink-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-indigo-400 block truncate">
                {assignment.bookTitle}
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white leading-tight truncate">
                {assignment.topicName} — {assignment.testNum}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Sayfa {assignment.pages} • Tarih: {assignment.date}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher - Fixed Under Header */}
        <div className="shrink-0 px-4 sm:px-6 py-2.5 flex space-x-2 bg-slate-900 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => setMode('quick')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition ${
              mode === 'quick'
                ? 'bg-indigo-600/30 border-indigo-500 text-white'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Hızlı Giriş (D / Y / B)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('detailed')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition ${
              mode === 'detailed'
                ? 'bg-indigo-600/30 border-indigo-500 text-white'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Soru Soru Detaylı Giriş</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Toplam Soru Sayısı Ayarlayıcı */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Kitaptaki Soru Sayısı</span>
                  <span className="text-[11px] text-slate-400 block truncate">Farklıysa buradan ayarlayın</span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 rounded-lg p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setQCount(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-base font-bold transition active:scale-95"
                  title="Soru sayısını azalt"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={qCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val) && val >= 1 && val <= 50) {
                      setQCount(val)
                    }
                  }}
                  className="w-10 text-center bg-transparent text-indigo-300 font-extrabold text-base focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQCount(prev => Math.min(50, prev + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-base font-bold transition active:scale-95"
                  title="Soru sayısını artır"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Entry Form */}
            {mode === 'quick' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* Doğru */}
                  <div className="bg-slate-800/70 p-2.5 sm:p-3.5 rounded-xl border border-slate-700">
                    <label className="block text-xs font-medium text-emerald-400 mb-1 flex items-center justify-between">
                      <span>Doğru</span>
                      <span className="text-[10px] text-slate-400">(+{correct !== '' ? correct : 0})</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={qCount}
                      placeholder="0"
                      value={correct}
                      onChange={(e) => {
                        const valStr = e.target.value
                        if (valStr === '') {
                          setCorrect('')
                          return
                        }
                        const val = Math.max(0, Math.min(qCount, Number(valStr)))
                        setCorrect(val)
                        if (wrong !== '') {
                          const rem = qCount - val - Number(wrong)
                          if (rem >= 0) setEmpty(rem)
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-lg font-bold text-emerald-400 text-center focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                    />
                  </div>

                  {/* Yanlış */}
                  <div className="bg-slate-800/70 p-2.5 sm:p-3.5 rounded-xl border border-slate-700">
                    <label className="block text-xs font-medium text-rose-400 mb-1 flex items-center justify-between">
                      <span>Yanlış</span>
                      <span className="text-[10px] text-slate-400">(-{wrong !== '' ? wrong : 0})</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={qCount}
                      placeholder="0"
                      value={wrong}
                      onChange={(e) => {
                        const valStr = e.target.value
                        if (valStr === '') {
                          setWrong('')
                          return
                        }
                        const val = Math.max(0, Math.min(qCount, Number(valStr)))
                        setWrong(val)
                        if (correct !== '') {
                          const rem = qCount - Number(correct) - val
                          if (rem >= 0) setEmpty(rem)
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-lg font-bold text-rose-400 text-center focus:outline-none focus:border-rose-500 placeholder:text-slate-600"
                    />
                  </div>

                  {/* Boş */}
                  <div className="bg-slate-800/70 p-2.5 sm:p-3.5 rounded-xl border border-slate-700">
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                      <span>Boş</span>
                      <span className="text-[10px] text-slate-400">({empty !== '' ? empty : 0})</span>
                    </label>
                  <input
                    type="number"
                    min="0"
                    max={qCount}
                    placeholder="0"
                    value={empty}
                    onChange={(e) => {
                      const valStr = e.target.value
                      if (valStr === '') {
                        setEmpty('')
                        return
                      }
                      setEmpty(Math.max(0, Math.min(qCount, Number(valStr))))
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-lg font-bold text-slate-300 text-center focus:outline-none focus:border-slate-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Total validation warning (Only show after user starts typing if total does not match) */}
              {hasInput && !isCountValid && (
                <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Toplam işaretlenen soru ({currentTotal}), testteki soru sayısına ({qCount}) eşit olmalıdır. (Fark: {qCount - currentTotal})
                  </span>
                </div>
              )}

              {/* Süre */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-semibold block text-white">Çözüm Süresi</span>
                    <span className="text-slate-400 text-[11px]">
                      {durationMinutes !== '' && Number(durationMinutes) > 0
                        ? `Soru başına: ${(Number(durationMinutes) / qCount).toFixed(1)} dk`
                        : 'Süre giriniz'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    placeholder="örn. 15"
                    value={durationMinutes}
                    onChange={(e) => {
                      const valStr = e.target.value
                      setDurationMinutes(valStr === '' ? '' : Math.max(0, Number(valStr)))
                    }}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm font-bold text-white text-center focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  />
                  <span className="text-xs text-slate-400">Dakika</span>
                </div>
              </div>
            </div>
          ) : (
            /* Detailed Question-by-Question Grid */
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Her soru için Doğru (D), Yanlış (Y) veya Boş (B) seçin:</span>
                <span className="text-indigo-400 font-semibold">{qCount} Soru</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
                {answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/80 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-slate-300 w-6">S.{ans.qNum}</span>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => handleDetailedStatusChange(idx, 'correct')}
                        className={`w-6 h-6 rounded text-xs font-bold transition ${
                          ans.status === 'correct'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        D
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDetailedStatusChange(idx, 'wrong')}
                        className={`w-6 h-6 rounded text-xs font-bold transition ${
                          ans.status === 'wrong'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        Y
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDetailedStatusChange(idx, 'empty')}
                        className={`w-6 h-6 rounded text-xs font-bold transition ${
                          ans.status === 'empty'
                            ? 'bg-slate-500 text-white'
                            : 'bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        B
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real-time Result Summary Box */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-xl border border-indigo-500/30 grid grid-cols-4 gap-2 text-center">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Soru</span>
              <strong className="text-base text-white">{qCount}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-emerald-400 uppercase">Doğru</span>
              <strong className="text-base text-emerald-400">{correct !== '' ? correct : '-'}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-amber-400 uppercase">Hesaplanan Net</span>
              <strong className="text-base text-amber-300">{hasInput ? net : '-'}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-indigo-400 uppercase">Başarı</span>
              <strong className="text-base text-indigo-300">{hasInput ? `%${scorePercent}` : '-%'}</strong>
            </div>
          </div>

          {/* Question Photo Upload Section */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span>Çözülemediğim Soruların Fotoğrafları</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                    {questionPhotos.length} Soru Eklendi
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Takıldığınız, boş bıraktığınız veya yanlış yaptığınız soruları kamerayla çekip sisteme yükleyin. Müfit Hoca derste inceleyecektir.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handlePhotoUploadChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>📸 Fotoğraf Çek / Yükle</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Photo List */}
            {questionPhotos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {questionPhotos.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 flex space-x-3 items-start relative group"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => setPreviewPhoto(item.url)}
                      className="relative w-20 h-20 bg-slate-950 rounded-lg overflow-hidden shrink-0 border border-slate-700 cursor-pointer group-hover:border-indigo-400 transition"
                    >
                      <img
                        src={item.url}
                        alt="Soru Fotoğrafı"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Maximize2 className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={item.questionNo}
                          onChange={(e) => handlePhotoFieldChange(item.id, 'questionNo', e.target.value)}
                          placeholder="Soru No (Örn: Soru 4)"
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-bold w-28 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(item.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded transition"
                          title="Fotoğrafı Kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => handlePhotoFieldChange(item.id, 'note', e.target.value)}
                        placeholder="Zorlandığınız nokta (örn: kök ayrımı)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[10px] text-indigo-300 block">
                        🔍 Fotoğrafı büyütmek için üzerine tıklayın
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Genel Öğrenci Notu / Süreç Yorumu:
            </label>
            <textarea
              rows="2"
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              placeholder="Örn: 4. soruda mutlak değer tanımında takıldım, online derste hocama soracağım..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 bg-slate-950/90 backdrop-blur border-t border-slate-800 px-4 py-3 sm:px-6 flex items-center justify-between sm:justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isCountValid}
              className="py-2.5 px-5 sm:px-6 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Kaydediliyor...' : 'Testi Sisteme Kaydet'}</span>
            </button>
          </div>
        </form>

        {/* Photo Lightbox Zoom Modal */}
        {previewPhoto && (
          <div
            onClick={() => setPreviewPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
              <div className="p-3 bg-slate-950 flex justify-between items-center border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  Soru Fotoğrafı Önizleme
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2 overflow-auto flex items-center justify-center">
                <img
                  src={previewPhoto}
                  alt="Soru Büyük Önizleme"
                  className="max-h-[80vh] w-auto object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
