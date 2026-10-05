import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  AlertTriangle,
  HelpCircle,
  Camera,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  UploadCloud,
  Loader2,
  Target,
  Calendar,
  Building2,
  FileQuestion,
  BookOpen,
  Plus,
  Layers,
  ChevronDown
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { uploadPhoto } from '../api'

// Standard Preset Templates for 9th Grade & General Exams
const GENERAL_EXAM_TEMPLATES = [
  {
    id: '9_kurumsal_120',
    title: '9. Sınıf Kurumsal (120 Soru)',
    sub: 'Özdebir / TÖDER Standardı (4 x 30)',
    subjects: [
      { key: 'turkce', name: 'Türk Dili ve Edebiyatı', icon: '📚', qCount: 30, correct: 0, wrong: 0, empty: 0 },
      { key: 'matematik', name: 'Matematik', icon: '📐', qCount: 30, correct: 0, wrong: 0, empty: 0 },
      { key: 'fen', name: 'Fen Bilimleri (Fizik-Kimya-Biyo)', icon: '🔬', qCount: 30, correct: 0, wrong: 0, empty: 0 },
      { key: 'sosyal', name: 'Sosyal Bilimler (Tar-Coğ-Din-Fel)', icon: '🌍', qCount: 30, correct: 0, wrong: 0, empty: 0 }
    ]
  },
  {
    id: '9_temel_100',
    title: '9. Sınıf 4\'lü Deneme (100 Soru)',
    sub: '4 Temel Ders (4 x 25)',
    subjects: [
      { key: 'turkce', name: 'Türk Dili ve Edebiyatı', icon: '📚', qCount: 25, correct: 0, wrong: 0, empty: 0 },
      { key: 'matematik', name: 'Matematik', icon: '📐', qCount: 25, correct: 0, wrong: 0, empty: 0 },
      { key: 'fen', name: 'Fen Bilimleri', icon: '🔬', qCount: 25, correct: 0, wrong: 0, empty: 0 },
      { key: 'sosyal', name: 'Sosyal Bilimler', icon: '🌍', qCount: 25, correct: 0, wrong: 0, empty: 0 }
    ]
  },
  {
    id: 'tyt_standard_120',
    title: 'TYT Deneme Formatı (120 Soru)',
    sub: 'Türkçe 40, Mat 40, Fen 20, Sos 20',
    subjects: [
      { key: 'turkce', name: 'Türkçe', icon: '📚', qCount: 40, correct: 0, wrong: 0, empty: 0 },
      { key: 'matematik', name: 'Temel Matematik', icon: '📐', qCount: 40, correct: 0, wrong: 0, empty: 0 },
      { key: 'fen', name: 'Fen Bilimleri', icon: '🔬', qCount: 20, correct: 0, wrong: 0, empty: 0 },
      { key: 'sosyal', name: 'Sosyal Bilimler', icon: '🌍', qCount: 20, correct: 0, wrong: 0, empty: 0 }
    ]
  },
  {
    id: 'okul_80',
    title: 'Okul Ortak Sınavı (80 Soru)',
    sub: '4 Temel Ders (4 x 20)',
    subjects: [
      { key: 'turkce', name: 'Türk Dili ve Edebiyatı', icon: '📚', qCount: 20, correct: 0, wrong: 0, empty: 0 },
      { key: 'matematik', name: 'Matematik', icon: '📐', qCount: 20, correct: 0, wrong: 0, empty: 0 },
      { key: 'fen', name: 'Fen Bilimleri', icon: '🔬', qCount: 20, correct: 0, wrong: 0, empty: 0 },
      { key: 'sosyal', name: 'Sosyal Bilimler', icon: '🌍', qCount: 20, correct: 0, wrong: 0, empty: 0 }
    ]
  }
]

const SINGLE_SUBJECT_TEMPLATES = [
  { key: 'matematik', name: 'Matematik', icon: '📐', qCount: 30, correct: 0, wrong: 0, empty: 0 },
  { key: 'fen', name: 'Fen Bilimleri', icon: '🔬', qCount: 30, correct: 0, wrong: 0, empty: 0 },
  { key: 'turkce', name: 'Türk Dili ve Edebiyatı', icon: '📚', qCount: 30, correct: 0, wrong: 0, empty: 0 },
  { key: 'sosyal', name: 'Sosyal Bilimler', icon: '🌍', qCount: 30, correct: 0, wrong: 0, empty: 0 }
]

const PUBLISHERS = [
  'Özdebir',
  'TÖDER',
  'Okul Genel Denemesi',
  '3D Yayınları',
  'Bilgi Sarmal',
  'Apotemi',
  'ÇAP Yayınları',
  'Orijinal Matematik',
  'Limit',
  'Karakök',
  'Hız ve Renk',
  'Diğer'
]

const AVAILABLE_LESSONS = [
  { name: 'Türk Dili ve Edebiyatı', icon: '📚', defaultQ: 30 },
  { name: 'Matematik', icon: '📐', defaultQ: 30 },
  { name: 'Fen Bilimleri', icon: '🔬', defaultQ: 30 },
  { name: 'Fizik', icon: '⚛️', defaultQ: 10 },
  { name: 'Kimya', icon: '🧪', defaultQ: 10 },
  { name: 'Biyoloji', icon: '🧬', defaultQ: 10 },
  { name: 'Sosyal Bilimler', icon: '🌍', defaultQ: 30 },
  { name: 'Tarih', icon: '📜', defaultQ: 10 },
  { name: 'Coğrafya', icon: '🗺️', defaultQ: 10 },
  { name: 'Din Kültürü', icon: '🕌', defaultQ: 5 },
  { name: 'Felsefe', icon: '💡', defaultQ: 5 },
  { name: 'Yabancı Dil (İngilizce)', icon: '🇬🇧', defaultQ: 20 }
]

export default function MockExamModal({
  isOpen,
  onClose,
  existingExam = null,
  studentId,
  studentName,
  onSubmitSuccess
}) {
  if (!isOpen) return null

  // Mode: 'general' (Genel Deneme - Çoklu Ders) | 'single' (Branş Denemesi)
  const [examType, setExamType] = useState(
    existingExam?.examType || (existingExam?.subjects && existingExam.subjects.length > 1 ? 'general' : 'general')
  )

  // Exam details
  const [examTitle, setExamTitle] = useState(existingExam?.examTitle || '')
  const [publisher, setPublisher] = useState(existingExam?.publisher || 'Özdebir')
  const [customPublisher, setCustomPublisher] = useState('')
  const [date, setDate] = useState(
    existingExam?.date || new Date().toISOString().split('T')[0]
  )
  const [durationMinutes, setDurationMinutes] = useState(
    existingExam?.durationMinutes || (examType === 'general' ? 135 : 45)
  )
  const [studentNote, setStudentNote] = useState(existingExam?.studentNote || '')

  // Subjects state
  const [subjects, setSubjects] = useState(() => {
    if (existingExam?.subjects && existingExam.subjects.length > 0) {
      return existingExam.subjects.map(s => ({
        key: s.key || s.name.toLowerCase().replace(/\s+/g, '_'),
        name: s.name,
        icon: s.icon || (s.name.includes('Mat') ? '📐' : s.name.includes('Türk') ? '📚' : s.name.includes('Fen') ? '🔬' : '🌍'),
        qCount: Number(s.qCount) || 30,
        correct: Number(s.correct) || 0,
        wrong: Number(s.wrong) || 0,
        empty: s.empty !== undefined ? Number(s.empty) : Math.max(0, (Number(s.qCount) || 30) - (Number(s.correct) || 0) - (Number(s.wrong) || 0))
      }))
    }
    // Default to 9th Grade General Template with clean 0s
    return GENERAL_EXAM_TEMPLATES[0].subjects.map(s => ({ ...s }))
  })

  // Selected Template ID for quick visual feedback
  const [selectedTemplateId, setSelectedTemplateId] = useState('9_kurumsal_120')

  // Photo upload states
  const photoInputRef = useRef(null)
  const [questionPhotos, setQuestionPhotos] = useState(
    existingExam?.questionPhotos || []
  )
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoSubjectSelect, setPhotoSubjectSelect] = useState('Matematik')

  // Reset or initialize state cleanly whenever modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingExam) {
        setExamType(existingExam.examType || (existingExam.subjects && existingExam.subjects.length > 1 ? 'general' : 'single'))
        setExamTitle(existingExam.examTitle || '')
        setPublisher(existingExam.publisher || 'Özdebir')
        setCustomPublisher('')
        setDate(existingExam.date || new Date().toISOString().split('T')[0])
        setDurationMinutes(existingExam.durationMinutes || (existingExam.examType === 'single' ? 45 : 135))
        setStudentNote(existingExam.studentNote || '')
        setQuestionPhotos(existingExam.questionPhotos || [])
        if (existingExam.subjects && existingExam.subjects.length > 0) {
          setSubjects(existingExam.subjects.map(s => ({
            key: s.key || s.name.toLowerCase().replace(/\s+/g, '_'),
            name: s.name,
            icon: s.icon || (s.name.includes('Mat') ? '📐' : s.name.includes('Türk') ? '📚' : s.name.includes('Fen') ? '🔬' : '🌍'),
            qCount: Number(s.qCount) || 30,
            correct: Number(s.correct) || 0,
            wrong: Number(s.wrong) || 0,
            empty: s.empty !== undefined ? Number(s.empty) : Math.max(0, (Number(s.qCount) || 30) - (Number(s.correct) || 0) - (Number(s.wrong) || 0))
          })))
        }
      } else {
        // Fresh entry - clean state with zero fake numbers
        setExamType('general')
        setExamTitle('')
        setPublisher('Özdebir')
        setCustomPublisher('')
        setDate(new Date().toISOString().split('T')[0])
        setDurationMinutes(135)
        setStudentNote('')
        setQuestionPhotos([])
        setSelectedTemplateId('9_kurumsal_120')
        setSubjects(GENERAL_EXAM_TEMPLATES[0].subjects.map(s => ({ ...s })))
      }
    }
  }, [isOpen, existingExam])

  // Apply template
  const handleApplyTemplate = (tmpl) => {
    setSelectedTemplateId(tmpl.id)
    setSubjects(tmpl.subjects.map(s => ({ ...s })))
    if (!existingExam) {
      setDurationMinutes(tmpl.id === 'okul_80' ? 90 : 135)
    }
  }

  // Switch to single branch exam mode
  const handleSwitchExamType = (type) => {
    setExamType(type)
    if (type === 'single') {
      setSubjects([
        {
          key: 'matematik',
          name: 'Matematik',
          icon: '📐',
          qCount: 30,
          correct: 26,
          wrong: 2,
          empty: 2
        }
      ])
      setDurationMinutes(45)
    } else {
      handleApplyTemplate(GENERAL_EXAM_TEMPLATES[0])
      setDurationMinutes(135)
    }
  }

  // Update a single subject's values
  const handleSubjectChange = (idx, field, value) => {
    setSubjects(prev => {
      const next = [...prev]
      const sub = { ...next[idx] }

      if (field === 'qCount') {
        const q = Math.max(1, Number(value) || 1)
        sub.qCount = q
        sub.empty = Math.max(0, q - Number(sub.correct) - Number(sub.wrong))
      } else if (field === 'correct') {
        const c = Math.max(0, Number(value) || 0)
        sub.correct = c
        sub.empty = Math.max(0, Number(sub.qCount) - c - Number(sub.wrong))
      } else if (field === 'wrong') {
        const w = Math.max(0, Number(value) || 0)
        sub.wrong = w
        sub.empty = Math.max(0, Number(sub.qCount) - Number(sub.correct) - w)
      } else if (field === 'empty') {
        sub.empty = Math.max(0, Number(value) || 0)
      } else if (field === 'name') {
        sub.name = value
      }

      next[idx] = sub
      return next
    })
  }

  // Remove a subject
  const handleRemoveSubject = (idx) => {
    if (subjects.length <= 1) {
      alert('Denemede en az 1 ders bulunmalıdır.')
      return
    }
    setSubjects(prev => prev.filter((_, i) => i !== idx))
  }

  // Add custom subject
  const handleAddSubject = (lesson) => {
    setSubjects(prev => [
      ...prev,
      {
        key: `sub_${Date.now()}`,
        name: lesson.name,
        icon: lesson.icon,
        qCount: lesson.defaultQ,
        correct: Math.round(lesson.defaultQ * 0.8),
        wrong: 2,
        empty: Math.max(0, lesson.defaultQ - Math.round(lesson.defaultQ * 0.8) - 2)
      }
    ])
  }

  // Aggregated calculations across all subjects
  const totalQuestions = subjects.reduce((sum, s) => sum + (Number(s.qCount) || 0), 0)
  const totalCorrect = subjects.reduce((sum, s) => sum + (Number(s.correct) || 0), 0)
  const totalWrong = subjects.reduce((sum, s) => sum + (Number(s.wrong) || 0), 0)
  const totalEmpty = subjects.reduce((sum, s) => sum + (Number(s.empty) || 0), 0)
  const totalNet = Math.max(0, parseFloat((totalCorrect - (totalWrong / 4)).toFixed(2)))
  const overallScorePercent = totalQuestions > 0 ? Math.round((totalNet / totalQuestions) * 100) : 0

  // Math subject specific net
  const mathSubject = subjects.find(s => s.name.toLowerCase().includes('mat') || s.key === 'matematik')
  const mathNet = mathSubject
    ? Math.max(0, parseFloat((Number(mathSubject.correct) - (Number(mathSubject.wrong) / 4)).toFixed(2)))
    : null

  // Validation
  const hasInvalidSubject = subjects.some(s => {
    const total = Number(s.correct) + Number(s.wrong) + Number(s.empty)
    return total !== Number(s.qCount)
  })

  // Canvas image compression
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
        const uploadRes = await uploadPhoto(dataUrl)
        if (uploadRes && uploadRes.url) {
          newItems.push({
            id: `mock-photo-${Date.now()}-${i}`,
            url: uploadRes.url,
            subject: photoSubjectSelect || 'Matematik',
            uploadedAt: new Date().toISOString(),
            label: `${photoSubjectSelect} Sorusu #${questionPhotos.length + newItems.length + 1}`
          })
        }
      }
      setQuestionPhotos(prev => [...prev, ...newItems])
    } catch (err) {
      alert('Fotoğraf yükleme sırasında hata oluştu: ' + err.message)
    } finally {
      setIsUploadingPhoto(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (photoId) => {
    setQuestionPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!examTitle.trim()) {
      alert('Lütfen deneme sınavı adını giriniz.')
      return
    }

    if (hasInvalidSubject) {
      alert('Lütfen tüm derslerde Doğru + Yanlış + Boş toplamının o dersin soru sayısına eşit olduğunu kontrol ediniz!')
      return
    }

    const finalPublisher = publisher === 'Diğer' && customPublisher.trim()
      ? customPublisher.trim()
      : publisher

    // Calculate each subject net & percent
    const calculatedSubjects = subjects.map(s => {
      const q = Number(s.qCount) || 0
      const c = Number(s.correct) || 0
      const w = Number(s.wrong) || 0
      const emp = s.empty !== undefined ? Number(s.empty) : Math.max(0, q - c - w)
      const snet = Math.max(0, parseFloat((c - (w / 4)).toFixed(2)))
      const spct = q > 0 ? Math.round((snet / q) * 100) : 0

      return {
        key: s.key || s.name.toLowerCase().replace(/\s+/g, '_'),
        name: s.name,
        icon: s.icon || '📝',
        qCount: q,
        correct: c,
        wrong: w,
        empty: emp,
        net: snet,
        scorePercent: spct
      }
    })

    setIsSubmitting(true)
    try {
      const payload = {
        ...(existingExam?.id ? { id: existingExam.id } : {}),
        studentId,
        studentName: studentName || (studentId === 'mete' ? 'Mete' : 'Ege'),
        examType,
        examTitle: examTitle.trim(),
        publisher: finalPublisher,
        date,
        durationMinutes: Number(durationMinutes),
        subjects: calculatedSubjects,
        qCount: totalQuestions,
        correct: totalCorrect,
        wrong: totalWrong,
        empty: totalEmpty,
        net: totalNet,
        scorePercent: overallScorePercent,
        mathNet: mathNet !== null ? mathNet : totalNet,
        mathQCount: mathSubject ? Number(mathSubject.qCount) : totalQuestions,
        studentNote: studentNote.trim(),
        questionPhotos
      }

      await onSubmitSuccess(payload)

      // Confetti celebration if score >= 70%
      if (overallScorePercent >= 70) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          })
        } catch (err) {}
      }

      onClose()
    } catch (err) {
      alert('Kaydedilirken hata oluştu: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {existingExam ? 'Deneme Sınavını Düzenle' : 'Genel Deneme Sınavı Veri Girişi'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  {studentName || (studentId === 'mete' ? 'Mete' : 'Ege')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tüm derslerin (Türkçe, Matematik, Fen, Sosyal) netlerini ve kitapçık sorularını kaydedin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
          {/* Exam Type Selector (Genel Deneme vs Branş Denemesi) */}
          <div className="flex p-1 bg-slate-800/80 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => handleSwitchExamType('general')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                examType === 'general'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>🎯 Genel Deneme Sınavı (Tüm Dersler)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchExamType('single')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                examType === 'single'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📐 Branş Denemesi (Tek Ders)</span>
            </button>
          </div>

          {/* Quick Presets if General Exam */}
          {examType === 'general' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Hazır Sınav Şablonu Seçin:</span>
                <span className="text-[11px] text-indigo-400 font-normal">Ders sayıları elle düzenlenebilir</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GENERAL_EXAM_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow ring-1 ring-indigo-400'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{tmpl.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{tmpl.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Publisher & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Yayın / Kurum</span>
              </label>
              <select
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {PUBLISHERS.map(pub => (
                  <option key={pub} value={pub}>{pub}</option>
                ))}
              </select>
              {publisher === 'Diğer' && (
                <input
                  type="text"
                  placeholder="Yayın / Kurum adını yazınız..."
                  value={customPublisher}
                  onChange={(e) => setCustomPublisher(e.target.value)}
                  className="w-full mt-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Deneme Adı / Başlığı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 1. Dönem Kurumsal Genel Deneme"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sınav Tarihi</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sınav Süresi (Dakika)</span>
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* SUBJECTS TABLE (DERSLER BAZINDA D, Y, B, NET) */}
          <div className="space-y-3 bg-slate-800/40 border border-slate-700/80 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Dersler & Net Dağılımı
                </span>
                <span className="text-[11px] text-slate-400">
                  Her ders için Doğru (D) ve Yanlış (Y) sayılarını giriniz. Netler ve Boşlar otomatik hesaplanır.
                </span>
              </div>

              {examType === 'general' && (
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ders Ekle</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-30 hidden group-hover:block max-h-56 overflow-y-auto">
                    {AVAILABLE_LESSONS.map((l) => (
                      <button
                        key={l.name}
                        type="button"
                        onClick={() => handleAddSubject(l)}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-indigo-600 hover:text-white transition flex items-center space-x-2"
                      >
                        <span>{l.icon}</span>
                        <span>{l.name} ({l.defaultQ} Soru)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subjects Rows */}
            <div className="space-y-2.5 pt-1">
              {subjects.map((sub, idx) => {
                const subNet = Math.max(0, parseFloat((Number(sub.correct) - (Number(sub.wrong) / 4)).toFixed(2)))
                const subTotal = Number(sub.correct) + Number(sub.wrong) + Number(sub.empty)
                const isValid = subTotal === Number(sub.qCount)
                const isMath = sub.name.toLowerCase().includes('mat') || sub.key === 'matematik'

                return (
                  <div
                    key={sub.key || idx}
                    className={`p-3 rounded-xl border transition ${
                      isMath
                        ? 'bg-indigo-950/30 border-indigo-500/40 ring-1 ring-indigo-500/20'
                        : 'bg-slate-900/90 border-slate-700/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      {/* Lesson title & Soru Sayısı */}
                      <div className="flex items-center space-x-2 w-full sm:w-5/12 min-w-0">
                        <span className="text-lg">{sub.icon || '📝'}</span>
                        <div className="min-w-0 flex-1">
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                            className="bg-transparent font-bold text-xs text-white focus:outline-none focus:underline truncate w-full"
                          />
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span>Soru Sayısı:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={sub.qCount}
                              onChange={(e) => handleSubjectChange(idx, 'qCount', e.target.value)}
                              className="w-12 bg-slate-800 border border-slate-600 rounded px-1.5 py-0.2 text-center text-xs text-white font-bold"
                            />
                            {isMath && (
                              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded font-semibold ml-1">
                                Müfit Hoca Özel
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* D, Y, B and Net inputs */}
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Correct */}
                        <div className="text-center">
                          <span className="text-[10px] text-emerald-400 block font-semibold">D</span>
                          <input
                            type="number"
                            min="0"
                            max={sub.qCount}
                            value={sub.correct}
                            onChange={(e) => handleSubjectChange(idx, 'correct', e.target.value)}
                            className="w-12 bg-emerald-500/10 border border-emerald-500/40 rounded-lg py-1 text-xs font-black text-emerald-400 text-center focus:outline-none"
                          />
                        </div>

                        {/* Wrong */}
                        <div className="text-center">
                          <span className="text-[10px] text-rose-400 block font-semibold">Y</span>
                          <input
                            type="number"
                            min="0"
                            max={sub.qCount}
                            value={sub.wrong}
                            onChange={(e) => handleSubjectChange(idx, 'wrong', e.target.value)}
                            className="w-12 bg-rose-500/10 border border-rose-500/40 rounded-lg py-1 text-xs font-black text-rose-400 text-center focus:outline-none"
                          />
                        </div>

                        {/* Empty */}
                        <div className="text-center">
                          <span className="text-[10px] text-amber-400 block font-semibold">B</span>
                          <input
                            type="number"
                            min="0"
                            max={sub.qCount}
                            value={sub.empty}
                            onChange={(e) => handleSubjectChange(idx, 'empty', e.target.value)}
                            className="w-12 bg-amber-500/10 border border-amber-500/40 rounded-lg py-1 text-xs font-black text-amber-400 text-center focus:outline-none"
                          />
                        </div>

                        {/* Calculated Net */}
                        <div className="text-center pl-2 border-l border-slate-700 min-w-[70px]">
                          <span className="text-[10px] text-slate-400 block font-medium">Net</span>
                          <span className={`text-xs font-black ${
                            isMath ? 'text-indigo-400' : 'text-white'
                          }`}>
                            {subNet.toFixed(2)}
                          </span>
                        </div>

                        {/* Delete Subject button */}
                        {examType === 'general' && subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(idx)}
                            title="Bu Dersi Kaldır"
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {!isValid && (
                      <div className="text-[10px] text-rose-400 mt-1 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>D ({sub.correct}) + Y ({sub.wrong}) + B ({sub.empty}) = {subTotal} soru. Soru sayısı ({sub.qCount}) ile eşleşmeli.</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* LIVE BIG SCORECARD SUMMARY (GENEL KARNE) */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Genel Deneme Toplam Neti
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {totalNet.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {totalQuestions} Soru
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    %{overallScorePercent} Başarı
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Toplam: {totalCorrect} Doğru • {totalWrong} Yanlış • {totalEmpty} Boş
                </div>
              </div>

              {/* Special Math Net Badge for Müfit Hoca */}
              {mathNet !== null && (
                <div className="bg-slate-800/80 border border-indigo-500/50 rounded-xl p-3 text-right shrink-0">
                  <div className="text-[10px] text-indigo-300 font-semibold uppercase">
                    📐 Matematik Neti
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-indigo-400">
                    {mathNet.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / {mathSubject?.qCount || 30} Net
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Question Photos with Subject Tagging */}
          <div className="space-y-3 bg-slate-800/40 border border-indigo-500/20 p-4 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">
                  Deneme Kitapçığı Soru Fotoğrafları
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                  {questionPhotos.length} Soru Kayıtlı
                </span>
              </div>

              {/* Subject selector for photo upload */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Ders:</span>
                <select
                  value={photoSubjectSelect}
                  onChange={(e) => setPhotoSubjectSelect(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                  <option value="Diğer / Genel">Diğer / Genel</option>
                </select>

                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow disabled:opacity-50"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>Fotoğraf Ekle</span>
                    </>
                  )}
                </button>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handlePhotoUploadChange}
                  className="hidden"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Denemede yanlış yaptığın veya boş bıraktığın soruları (Matematik, Fizik, Türkçe vb.) kitapçık üzerinden çekip yükle. Müfit Hoca tüm soruları inceleyip çözümleri için geri bildirim iletecektir.
            </p>

            {/* Photos Grid */}
            {questionPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {questionPhotos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-video flex items-center justify-center"
                  >
                    <img
                      src={photo.url}
                      alt={photo.label || `Soru ${idx + 1}`}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-200"
                      onClick={() => setPreviewPhoto(photo.url)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setPreviewPhoto(photo.url)}
                        title="Büyüt"
                        className="p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg transition"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        title="Kaldır"
                        className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/80 text-white px-1.5 py-0.5 rounded font-mono truncate max-w-[90%]">
                      {photo.subject || 'Soru'} #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-xl p-4 text-center cursor-pointer transition bg-slate-900/40"
              >
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-300 font-medium block">
                  Kitapçıktaki soruları çekmek için dokunun veya tıklayın
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Çözemediğiniz veya boş bıraktığınız soruları ders seçerek ekleyebilirsiniz
                </span>
              </div>
            )}
          </div>

          {/* Student Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Genel Deneme Öz Değerlendirmesi / Öğrenci Notu
            </label>
            <textarea
              rows="2"
              placeholder="Örn: Zaman yönetiminde Matematik ve Fen yetişti ama Türkçede son paragraflarda acele ettim. Matematik problem soruları iyiydi..."
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting || hasInvalidSubject || isUploadingPhoto}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{existingExam ? 'Değişiklikleri Kaydet' : 'Genel Deneme Sonucunu Kaydet'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lightbox Photo Preview */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewPhoto}
              alt="Soru Önizleme"
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
