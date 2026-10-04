import React, { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Award,
  Sparkles,
  Send,
  PlusCircle,
  FileText,
  UserCheck,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  BookOpen,
  Share2,
  Lock,
  KeyRound,
  Camera,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  BarChart2,
  Layers,
  TrendingUp,
  Printer,
  ChevronRight,
  Filter,
  X,
  Target,
  Cloud,
  Smartphone,
  RefreshCw,
  Folder,
  FolderOpen
} from 'lucide-react'
import {
  updateStudentPin,
  updateUnsolvedQuestion,
  deleteUnsolvedQuestion,
  updateMockExam,
  deleteMockExam,
  fetchSettings,
  updateSettings,
  testGoogleDriveConnection,
  syncAllQuestionsToDrive,
  fetchWhatsAppDailyMessage,
  sendWhatsAppWebhook
} from '../api'

export default function TeacherDashboard({
  teacherData,
  onAddFeedback,
  onAddNote,
  onOpenTestModal,
  onSwitchToStudent,
  onPrintStudent
}) {
  const [activeTeacherTab, setActiveTeacherTab] = useState('overview') // 'overview' | 'unsolved' | 'mock_exams' | 'detailed_stats'
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [feedbackInputs, setFeedbackInputs] = useState({})
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [copiedLink, setCopiedLink] = useState(null)

  // Unsolved questions states
  const [unsolvedFilterStudent, setUnsolvedFilterStudent] = useState('all') // 'all' | 'mete' | 'ege'
  const [unsolvedFilterStatus, setUnsolvedFilterStatus] = useState('all') // 'all' | 'pending' | 'resolved'
  const [unsolvedList, setUnsolvedList] = useState(teacherData?.unsolvedQuestions || [])
  const [unsolvedReplies, setUnsolvedReplies] = useState({})
  const [previewPhoto, setPreviewPhoto] = useState(null)

  // Mock exams states
  const [mockExamsList, setMockExamsList] = useState(teacherData?.mockExams || [])
  const [mockExamFeedback, setMockExamFeedback] = useState({})
  const [mockExamFilterStudent, setMockExamFilterStudent] = useState('all')
  const [savingFeedbackId, setSavingFeedbackId] = useState(null)

  // Update lists when teacherData changes
  React.useEffect(() => {
    if (teacherData?.unsolvedQuestions) {
      setUnsolvedList(teacherData.unsolvedQuestions)
    }
    if (teacherData?.mockExams) {
      setMockExamsList(teacherData.mockExams)
    }
  }, [teacherData])

  const {
    mete,
    ege,
    today,
    teacherNotes,
    recentSubmissions,
    meteAnalytics,
    egeAnalytics,
    comparison
  } = teacherData || {}

  const [metePinInput, setMetePinInput] = useState(mete?.student?.pin || '1234')
  const [egePinInput, setEgePinInput] = useState(ege?.student?.pin || '5678')
  const [pinSaveMsg, setPinSaveMsg] = useState(null)

  // Settings & Google Drive states
  const [systemSettings, setSystemSettings] = useState(null)
  const [scriptUrlInput, setScriptUrlInput] = useState('')
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsSaveMsg, setSettingsSaveMsg] = useState(null)
  const [isTestingDrive, setIsTestingDrive] = useState(false)
  const [driveTestResult, setDriveTestResult] = useState(null)
  const [isSyncingDrive, setIsSyncingDrive] = useState(false)
  const [driveSyncMsg, setDriveSyncMsg] = useState(null)
  const [showScriptCode, setShowScriptCode] = useState(false)
  const [copiedScriptCode, setCopiedScriptCode] = useState(false)

  // WhatsApp 16:00 states
  const [whatsAppDate, setWhatsAppDate] = useState(today || '2026-10-05')
  const [whatsAppData, setWhatsAppData] = useState(null)
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false)
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false)
  const [whatsAppWebhookInput, setWhatsAppWebhookInput] = useState('')
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [webhookTestResult, setWebhookTestResult] = useState(null)

  // Fetch settings on mount
  React.useEffect(() => {
    fetchSettings()
      .then(st => {
        if (st) {
          setSystemSettings(st)
          if (st.googleAppsScriptUrl) setScriptUrlInput(st.googleAppsScriptUrl)
          if (st.whatsAppWebhookUrl) setWhatsAppWebhookInput(st.whatsAppWebhookUrl)
        }
      })
      .catch(console.error)
  }, [])

  // Fetch WhatsApp daily message whenever date changes
  React.useEffect(() => {
    let isMounted = true
    setLoadingWhatsApp(true)
    fetchWhatsAppDailyMessage(whatsAppDate)
      .then(res => {
        if (isMounted && res) {
          setWhatsAppData(res)
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoadingWhatsApp(false)
      })
    return () => {
      isMounted = false
    }
  }, [whatsAppDate])

  const handleSaveAndTestDrive = async () => {
    if (!scriptUrlInput.trim()) {
      alert('Lütfen Google Apps Script Web Uygulaması URL adresini giriniz.')
      return
    }
    setIsSavingSettings(true)
    setIsTestingDrive(true)
    setDriveTestResult(null)
    setSettingsSaveMsg(null)

    try {
      const updated = await updateSettings({ googleAppsScriptUrl: scriptUrlInput.trim() })
      if (updated && updated.settings) {
        setSystemSettings(updated.settings)
        setSettingsSaveMsg('URL başarıyla kaydedildi.')
      }

      const testRes = await testGoogleDriveConnection(scriptUrlInput.trim())
      if (testRes.success) {
        setDriveTestResult({
          success: true,
          message: testRes.message || 'Google Drive & Apps Script bağlantısı başarıyla doğrulandı!'
        })
      } else {
        setDriveTestResult({
          success: false,
          message: testRes.error || 'Bağlantı kurulamadı. Lütfen dağıtımın "Herkes" erişimli olduğunu kontrol edin.'
        })
      }
    } catch (err) {
      setDriveTestResult({
        success: false,
        message: 'Hata: ' + err.message
      })
    } finally {
      setIsSavingSettings(false)
      setIsTestingDrive(false)
      setTimeout(() => setSettingsSaveMsg(null), 4000)
    }
  }

  const handleSyncAllQuestions = async () => {
    setIsSyncingDrive(true)
    setDriveSyncMsg(null)
    try {
      const res = await syncAllQuestionsToDrive(true)
      if (res && res.success) {
        setDriveSyncMsg(res.message || 'Tüm sorular Google Drive ile senkronize edildi.')
      } else {
        alert('Senkronizasyon hatası: ' + (res?.error || 'Bilinmeyen hata'))
      }
    } catch (err) {
      alert('Senkronizasyon hatası: ' + err.message)
    } finally {
      setIsSyncingDrive(false)
      setTimeout(() => setDriveSyncMsg(null), 6000)
    }
  }

  const handleCopyWhatsApp = () => {
    if (!whatsAppData?.message) return
    navigator.clipboard.writeText(whatsAppData.message)
    setCopiedWhatsApp(true)
    setTimeout(() => setCopiedWhatsApp(false), 2500)
  }

  const handleSaveAndTestWebhook = async () => {
    if (!whatsAppWebhookInput.trim()) {
      alert('Lütfen WhatsApp Webhook URL adresinizi giriniz.')
      return
    }
    setIsTestingWebhook(true)
    setWebhookTestResult(null)
    try {
      await updateSettings({ whatsAppWebhookUrl: whatsAppWebhookInput.trim() })
      const res = await sendWhatsAppWebhook(whatsAppWebhookInput.trim(), whatsAppDate)
      if (res && res.success) {
        setWebhookTestResult({
          success: true,
          message: 'Tebrikler! Webhook isteği başarıyla gönderildi (HTTP ' + (res.statusCode || 200) + ').'
        })
      } else {
        setWebhookTestResult({
          success: false,
          message: res?.error || 'Webhook yanıt vermedi.'
        })
      }
    } catch (err) {
      setWebhookTestResult({
        success: false,
        message: 'Hata: ' + err.message
      })
    } finally {
      setIsTestingWebhook(false)
    }
  }

  const scriptSampleCode = `/**
 * METE VE EGE TEST PROGRAMI: GOOGLE DRIVE & SAAT 16:00 OTOMATİK WHATSAPP
 * Öğretmen: Müfit Hoca
 */
var ROOT_FOLDER_NAME = "mete-ege yapılamayan sorular";

// WhatsApp Gönderim Servisi: "greenapi", "ultramsg" veya "webhook"
var WHATSAPP_SERVISI = "greenapi"; 

// GREEN-API AYARLARI:
var GREEN_API_HOST        = "https://7107.api.greenapi.com";
var GREEN_API_INSTANCE_ID = "7107639595";
var GREEN_API_TOKEN       = "41919f0f1ff94b00a0daf0b5a20028811dba6ffbe274471bbd";
var WHATSAPP_GRUP_ADI     = "MÜFİT HOCA İLE MATEMATİK";
var WHATSAPP_GRUP_ID      = "120363414194493647@g.us";

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "Drive & WhatsApp Aktif" })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", message: "Bağlantı başarılı!" })).setMimeType(ContentService.MimeType.JSON);
    }
    if (data.action === "upload_photo") {
      var dateStr = data.date || Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd");
      var base64 = data.imageBase64.indexOf(",") !== -1 ? data.imageBase64.split(",")[1] : data.imageBase64;
      var decoded = Utilities.base64Decode(base64);
      var fileName = (data.studentName || "Ogrenci") + "_" + (data.subject || "Mat") + "_" + (data.testTitle || "Test") + "_" + (data.questionNo || "Soru") + "_" + new Date().getTime() + ".jpg";
      var blob = Utilities.newBlob(decoded, "image/jpeg", fileName);

      var rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);
      var dateFolder = getOrCreateFolder(rootFolder, dateStr);
      var file = dateFolder.createFile(blob);
      file.setDescription("Öğrenci: " + data.studentName + "\\nSoru: " + data.questionNo + "\\nNot: " + (data.note || ""));

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        downloadUrl: file.getDownloadUrl(),
        folderPath: ROOT_FOLDER_NAME + "/" + dateStr
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function sendDaily1600WhatsApp() {
  try {
    var todayStr = Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd");
    var messageText = "📅 *GÜNLÜK ÖDEV VE ÇALIŞMA BİLDİRİMİ (Saat 16:00)*\\n" +
      "🗓 *Tarih:* " + todayStr + "\\n" +
      "👨‍🏫 *Öğretmen:* Müfit Hoca\\n" +
      "━━━━━━━━━━━━━━━━━━━━━\\n\\n" +
      "👨‍🎓 *METE VE EGE'NİN DİKKATİNE:*\\n" +
      "Günün test ödevleriniz sisteme tanımlanmıştır. Okul çıkışında süre tutarak çözünüz.\\n\\n" +
      "📸 *ÖNEMLİ HATIRLATMA:*\\n" +
      "Çözemediğiniz veya boş bıraktığınız soruların fotoğrafını sisteme yükleyiniz (Sorular anında Müfit Hoca'nın Google Drive arşivine aktarılır).\\n\\n" +
      "🚀 Başarılar gençler, iyi çalışmalar!";

    if (WHATSAPP_SERVISI === "greenapi") {
      var targetChat = WHATSAPP_GRUP_ID.indexOf("@g.us") !== -1 ? WHATSAPP_GRUP_ID : (WHATSAPP_GRUP_ID + "@g.us");
      var greenUrl = "https://api.green-api.com/waInstance" + GREEN_API_INSTANCE_ID + "/sendMessage/" + GREEN_API_TOKEN;
      var resp = UrlFetchApp.fetch(greenUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify({ chatId: targetChat, message: messageText }),
        muteHttpExceptions: true
      });
      Logger.log(resp.getContentText());
    }
  } catch (err) {
    Logger.log("Hata: " + err.toString());
  }
}

function otomatik1600TetikleyiciKur() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "sendDaily1600WhatsApp") ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger("sendDaily1600WhatsApp").timeBased().everyDays(1).atHour(16).create();
  Logger.log("Tetikleyici kuruldu!");
}`

  if (!teacherData) {
    return (
      <div className="text-center py-20 text-slate-400">
        <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
        <p>Öğretmen paneli verileri yükleniyor...</p>
      </div>
    )
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'
  const meteLink = `${baseUrl}/?student=mete`
  const egeLink = `${baseUrl}/?student=ege`

  const handleCopy = (link, key) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(key)
    setTimeout(() => setCopiedLink(null), 2500)
  }

  const handleSavePin = async (studentId, pin) => {
    if (!pin || pin.trim().length < 2) {
      alert('Şifre en az 2 karakter olmalıdır.')
      return
    }
    try {
      const res = await updateStudentPin(studentId, pin.trim())
      if (res && res.success) {
        setPinSaveMsg(`${studentId === 'mete' ? 'Mete' : 'Ege'} için yeni şifre (${pin.trim()}) başarıyla kaydedildi!`)
        setTimeout(() => setPinSaveMsg(null), 3500)
      }
    } catch (e) {
      alert('Şifre güncellenirken hata oluştu: ' + e.message)
    }
  }

  const handleCreateNote = async (e) => {
    e.preventDefault()
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return
    setIsSavingNote(true)
    try {
      await onAddNote(newNoteTitle, newNoteContent)
      setNewNoteTitle('')
      setNewNoteContent('')
    } catch (err) {
      alert('Not eklenirken hata: ' + err.message)
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleSendFeedback = async (subId) => {
    const text = feedbackInputs[subId]
    if (!text || !text.trim()) return
    try {
      await onAddFeedback(subId, text)
      setFeedbackInputs(prev => ({ ...prev, [subId]: '' }))
      alert('Geri bildirim öğrenciye iletildi!')
    } catch (err) {
      alert('Geri bildirim kaydedilemedi: ' + err.message)
    }
  }

  // Handle teacher reply & status for unsolved question
  const handleReplyQuestion = async (qId, newStatus = null) => {
    const replyText = unsolvedReplies[qId]
    const updates = {}
    if (replyText !== undefined && replyText.trim()) {
      updates.teacherReply = replyText.trim()
    }
    if (newStatus) {
      updates.status = newStatus
    }

    try {
      const res = await updateUnsolvedQuestion(qId, updates)
      if (res && res.success) {
        setUnsolvedList(prev => prev.map(item => item.id === qId ? res.question : item))
        setUnsolvedReplies(prev => ({ ...prev, [qId]: '' }))
      }
    } catch (err) {
      alert('Soru güncellenirken hata oluştu: ' + err.message)
    }
  }

  const handleDeleteQuestion = async (qId) => {
    if (!confirm('Bu soru kaydını silmek istediğinize emin misiniz?')) return
    try {
      const res = await deleteUnsolvedQuestion(qId)
      if (res && res.success) {
        setUnsolvedList(prev => prev.filter(q => q.id !== qId))
      }
    } catch (err) {
      alert('Soru silinemedi: ' + err.message)
    }
  }

  // Mock exams handlers
  const handleSaveMockFeedback = async (examId) => {
    const text = mockExamFeedback[examId]
    if (text === undefined || !text.trim()) {
      alert('Lütfen bir değerlendirme yorumu yazınız.')
      return
    }
    setSavingFeedbackId(examId)
    try {
      const res = await updateMockExam(examId, { teacherFeedback: text.trim() })
      if (res && res.success) {
        setMockExamsList(prev => prev.map(item => item.id === examId ? res.exam : item))
        alert('Değerlendirmeniz başarıyla kaydedildi!')
      }
    } catch (err) {
      alert('Geri bildirim kaydedilemedi: ' + err.message)
    } finally {
      setSavingFeedbackId(null)
    }
  }

  const handleDeleteMockExam = async (examId) => {
    if (!confirm('Bu deneme sınavı kaydını silmek istediğinize emin misiniz?')) return
    try {
      const res = await deleteMockExam(examId)
      if (res && res.success) {
        setMockExamsList(prev => prev.filter(e => e.id !== examId))
      }
    } catch (err) {
      alert('Deneme sınavı silinemedi: ' + err.message)
    }
  }

  // Filter unsolved questions
  const filteredUnsolved = unsolvedList.filter(q => {
    if (unsolvedFilterStudent !== 'all' && q.studentId !== unsolvedFilterStudent) return false
    if (unsolvedFilterStatus !== 'all' && q.status !== unsolvedFilterStatus) return false
    return true
  })

  // Filter mock exams
  const filteredTeacherMockExams = mockExamsList.filter(e => {
    if (mockExamFilterStudent !== 'all' && e.studentId !== mockExamFilterStudent) return false
    return true
  })

  const pendingQuestionsCount = unsolvedList.filter(q => q.status === 'pending').length

  return (
    <div className="space-y-8 pb-12">
      {/* Teacher Top Header with Müfit Hoca Logo & Dedicated Report Buttons */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <img
              src="/mufit-hoca-logo.jpg"
              alt="Müfit Hoca ile Matematik"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-purple-400/80 shadow-2xl shadow-purple-500/30 object-cover shrink-0 ring-4 ring-purple-500/20"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Müfit Hoca ile Matematik
                </h2>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  Yönetici Paneli
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-200 mt-0.5">
                Mete (Fen Lisesi) & Ege (Anadolu Lisesi) Eşzamanlı Özel Ders Takip ve Performans Yönetimi
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-300">
                <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">Bugün: <strong>{today}</strong></span>
                <span>•</span>
                <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">Kural: <strong>Hafta İçi 1, Sonu 2 Test</strong></span>
                <span>•</span>
                <span className="bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg text-emerald-300 font-semibold">
                  Bitiş: 29 Mayıs 2027 (237 Gün)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Separate Report Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => onPrintStudent && onPrintStudent('mete')}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-orange-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>👨‍🎓 Mete'nin Raporunu Al</span>
            </button>

            <button
              onClick={() => onPrintStudent && onPrintStudent('ege')}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>🧑‍🎓 Ege'nin Raporunu Al</span>
            </button>
          </div>
        </div>

        {/* Teacher Navigation Tabs */}
        <div className="flex items-center space-x-2 border-t border-purple-800/40 pt-4 mt-6">
          <button
            onClick={() => setActiveTeacherTab('overview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTeacherTab === 'overview'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Genel Bakış & Canlı Takip</span>
          </button>

          <button
            onClick={() => setActiveTeacherTab('unsolved')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTeacherTab === 'unsolved'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>📸 Çözülemeyen Sorular Havuzu</span>
            {pendingQuestionsCount > 0 && (
              <span className="bg-amber-500 text-slate-950 px-2 py-0.2 rounded-full text-[10px] font-black animate-pulse">
                {pendingQuestionsCount} Yeni
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTeacherTab('mock_exams')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTeacherTab === 'mock_exams'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target className="w-4 h-4 text-indigo-400" />
            <span>🎯 Deneme Sınavları Takibi</span>
            {mockExamsList.length > 0 && (
              <span className="bg-indigo-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                {mockExamsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTeacherTab('detailed_stats')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTeacherTab === 'detailed_stats'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>📊 Ayrıntılı İstatistikler & Konu Karnesi</span>
          </button>

          <button
            onClick={() => setActiveTeacherTab('whatsapp_and_drive')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTeacherTab === 'whatsapp_and_drive'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>☁️ Google Drive & WhatsApp (16:00)</span>
            {systemSettings?.googleAppsScriptUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Google Drive Bağlı" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GENEL BAKIŞ & CANLI TAKİP */}
      {/* ========================================================================= */}
      {activeTeacherTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* PRIVACY & DEDICATED STUDENT SHARE LINKS AND PASSWORDS */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2.5">
                <Share2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Öğrencilere Özel Erişim Bağlantıları ve Bireysel Şifreler
                </h3>
              </div>
              {pinSaveMsg && (
                <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg">
                  ✓ {pinSaveMsg}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Öğrencilerinize yalnızca kendi bağlantılarını ve şifrelerini iletiniz. Her öğrenci kendi şifresiyle giriş yaptığında <strong className="text-indigo-300">yalnızca kendi çalışma programını ve analizlerini görür</strong>; diğer öğrencinin hiçbir verisine veya kıyaslamasına erişemez.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Mete Card */}
              <div className="bg-slate-800/80 border border-orange-500/30 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">👨‍🎓</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Mete'nin Özel Girişi</h4>
                      <span className="text-[11px] text-orange-400">Fen Lisesi • ÇAP Plus & Orijinal (304 Test)</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded font-mono">
                    ?student=mete
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Özel Web Bağlantısı:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={meteLink}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopy(meteLink, 'mete')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        copiedLink === 'mete'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-orange-600 hover:bg-orange-500 text-white'
                      }`}
                    >
                      {copiedLink === 'mete' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'mete' ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-700/60">
                  <span className="text-[10px] text-slate-400">Mete'nin Bireysel Giriş Şifresi:</span>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <KeyRound className="w-3.5 h-3.5 text-orange-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={metePinInput}
                        onChange={(e) => setMetePinInput(e.target.value)}
                        placeholder="Şifre belirle"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <button
                      onClick={() => handleSavePin('mete', metePinInput)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition"
                    >
                      Şifreyi Kaydet
                    </button>
                  </div>
                </div>
              </div>

              {/* Ege Card */}
              <div className="bg-slate-800/80 border border-blue-500/30 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🧑‍🎓</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Ege'nin Özel Girişi</h4>
                      <span className="text-[11px] text-blue-400">Anadolu Lisesi • ÇAP Plus & Orijinal (304 Test)</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">
                    ?student=ege
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Özel Web Bağlantısı:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={egeLink}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopy(egeLink, 'ege')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        copiedLink === 'ege'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {copiedLink === 'ege' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === 'ege' ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-700/60">
                  <span className="text-[10px] text-slate-400">Ege'nin Bireysel Giriş Şifresi:</span>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <KeyRound className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={egePinInput}
                        onChange={(e) => setEgePinInput(e.target.value)}
                        placeholder="Şifre belirle"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => handleSavePin('ege', egePinInput)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition"
                    >
                      Şifreyi Kaydet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp 16:00 Notification & Google Drive Status Bar */}
          <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-sky-950/70 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white">
                    Günün WhatsApp Ödev Bildirimi (Saat 16:00)
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    Hazır
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Mete ve Ege'nin bugünkü görevleri otomatik formatlandı. Tek tıkla WhatsApp grubunuza iletebilirsiniz.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                {copiedWhatsApp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedWhatsApp ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
              </button>

              {whatsAppData?.whatsappUrl && (
                <a
                  href={whatsAppData.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp'ta Aç ve Gönder</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setActiveTeacherTab('whatsapp_and_drive')}
                className="px-3.5 py-2 bg-sky-900/60 hover:bg-sky-800 text-sky-200 border border-sky-600/30 rounded-xl text-xs font-semibold transition flex items-center space-x-1"
                title="Google Drive & WhatsApp Detayları"
              >
                <Cloud className="w-4 h-4" />
                <span>Drive & Kılavuz</span>
              </button>
            </div>
          </div>

          {/* Program Summary & Timeline Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Başlangıç Tarihi</span>
              <strong className="text-base text-white">5 Ekim 2026</strong>
              <span className="text-[10px] text-slate-500 block">Pazartesi Başlangıç</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Bitiş Tarihi</span>
              <strong className="text-base text-emerald-400">29 Mayıs 2027</strong>
              <span className="text-[10px] text-slate-500 block">Cumartesi Bitiş (237 Gün)</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Toplam Test Sayısı</span>
              <strong className="text-base text-white">304 Test / Öğrenci</strong>
              <span className="text-[10px] text-indigo-400 block">ÇAP (127) + Orijinal (177)</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Günlük Çözüm Planı</span>
              <strong className="text-base text-white">Hafta İçi 1, Sonu 2</strong>
              <span className="text-[10px] text-amber-400 block">Hızlandırılmış Senkron Program</span>
            </div>
          </div>

          {/* Dual Student Side-by-Side Live Monitor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mete Monitor Card */}
            <div className="bg-slate-900/90 border border-orange-500/30 rounded-2xl p-6 space-y-4 shadow-lg shadow-orange-950/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">👨‍🎓</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Mete</h3>
                    <span className="text-[11px] text-orange-400 font-medium">
                      Fen Lisesi • ÇAP Plus & Orijinal (304 Test)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-full font-semibold block">
                    {mete?.totalCompleted || 0} / 304 Test
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Şifre: <strong className="text-white font-mono">{mete?.student?.pin || '1234'}</strong></span>
                </div>
              </div>

              {mete?.todayAssignment ? (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Bugünün Ödevi:</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      mete.todayAssignment.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {mete.todayAssignment.status === 'completed' ? '✓ Çözüldü' : '⏳ Bekliyor'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-white text-sm block">
                      {mete.todayAssignment.testTitle} ({mete.todayAssignment.testNum})
                    </strong>
                    <span className="text-xs text-indigo-300 block">
                      {mete.todayAssignment.bookTitle} • Sayfa {mete.todayAssignment.pages}
                    </span>
                  </div>
                  {mete.todayAssignment.submission && (
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-700/50 text-center text-xs">
                      <div className="text-emerald-400 font-bold">{mete.todayAssignment.submission.correct} Doğru</div>
                      <div className="text-rose-400 font-bold">{mete.todayAssignment.submission.wrong} Yanlış</div>
                      <div className="text-slate-400 font-bold">{mete.todayAssignment.submission.empty} Boş</div>
                      <div className="text-indigo-300 font-black">{mete.todayAssignment.submission.net} Net</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Bugün için atanmış test bulunamadı.</p>
              )}

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => onSwitchToStudent('mete')}
                  className="flex-1 py-2 px-3 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/40 rounded-xl text-xs font-semibold transition"
                >
                  Mete'nin Sayfasına Git
                </button>
                <button
                  onClick={() => onPrintStudent && onPrintStudent('mete')}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
                >
                  Karnesini Al
                </button>
              </div>
            </div>

            {/* Ege Monitor Card */}
            <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 space-y-4 shadow-lg shadow-blue-950/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">🧑‍🎓</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Ege</h3>
                    <span className="text-[11px] text-blue-400 font-medium">
                      Anadolu Lisesi • ÇAP Plus & Orijinal (304 Test)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full font-semibold block">
                    {ege?.totalCompleted || 0} / 304 Test
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Şifre: <strong className="text-white font-mono">{ege?.student?.pin || '5678'}</strong></span>
                </div>
              </div>

              {ege?.todayAssignment ? (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Bugünün Ödevi:</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      ege.todayAssignment.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {ege.todayAssignment.status === 'completed' ? '✓ Çözüldü' : '⏳ Bekliyor'}
                    </span>
                  </div>
                  <div>
                    <strong className="text-white text-sm block">
                      {ege.todayAssignment.testTitle} ({ege.todayAssignment.testNum})
                    </strong>
                    <span className="text-xs text-indigo-300 block">
                      {ege.todayAssignment.bookTitle} • Sayfa {ege.todayAssignment.pages}
                    </span>
                  </div>
                  {ege.todayAssignment.submission && (
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-700/50 text-center text-xs">
                      <div className="text-emerald-400 font-bold">{ege.todayAssignment.submission.correct} Doğru</div>
                      <div className="text-rose-400 font-bold">{ege.todayAssignment.submission.wrong} Yanlış</div>
                      <div className="text-slate-400 font-bold">{ege.todayAssignment.submission.empty} Boş</div>
                      <div className="text-indigo-300 font-black">{ege.todayAssignment.submission.net} Net</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Bugün için atanmış test bulunamadı.</p>
              )}

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => onSwitchToStudent('ege')}
                  className="flex-1 py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-semibold transition"
                >
                  Ege'nin Sayfasına Git
                </button>
                <button
                  onClick={() => onPrintStudent && onPrintStudent('ege')}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
                >
                  Karnesini Al
                </button>
              </div>
            </div>
          </div>

          {/* Recent Submissions & Feedback Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Son Test Çözümleri & Öğretmen Geri Bildirimi
            </h3>

            {recentSubmissions && recentSubmissions.length > 0 ? (
              <div className="space-y-4">
                {recentSubmissions.map((sub) => {
                  const isM = sub.studentId === 'mete'
                  return (
                    <div
                      key={sub.id}
                      className={`p-4 rounded-xl border ${
                        isM
                          ? 'bg-slate-800/60 border-orange-500/20'
                          : 'bg-slate-800/60 border-blue-500/20'
                      } space-y-3`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{isM ? '👨‍🎓' : '🧑‍🎓'}</span>
                          <div>
                            <strong className="text-white text-sm">
                              {isM ? 'Mete' : 'Ege'} — {sub.topicName} ({sub.testNum})
                            </strong>
                            <span className="text-xs text-slate-400 block">
                              Tarih: {sub.date} • {sub.bookTitle} • Süre: {sub.durationMinutes} dk
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-emerald-400 font-bold">{sub.correct} D</span>
                          <span className="text-rose-400 font-bold">{sub.wrong} Y</span>
                          <span className="text-slate-400 font-bold">{sub.empty} B</span>
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30">
                            {sub.net} Net
                          </span>
                        </div>
                      </div>

                      {sub.studentNote && (
                        <div className="text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 text-slate-300">
                          <span className="text-slate-400 font-semibold">Öğrenci Notu: </span>
                          "{sub.studentNote}"
                        </div>
                      )}

                      {sub.teacherFeedback ? (
                        <div className="text-xs bg-purple-950/40 p-2.5 rounded-lg border border-purple-800/40 text-purple-200 flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <div>
                            <strong>İletilen Geri Bildiriminiz:</strong> {sub.teacherFeedback}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="text"
                            placeholder="Öğrenciye motive edici geri bildirim yazın..."
                            value={feedbackInputs[sub.id] || ''}
                            onChange={(e) =>
                              setFeedbackInputs(prev => ({ ...prev, [sub.id]: e.target.value }))
                            }
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleSendFeedback(sub.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>İlet</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Henüz test çözümü kaydedilmedi.</p>
            )}
          </div>

          {/* Teacher Directives / Notes Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              Ders & Ödev Duyurusu Ekle
            </h3>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <input
                type="text"
                placeholder="Duyuru / Ödev Başlığı (Örn: 1. Tema Sayılar Bitirme Hedefi)"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                rows="2"
                placeholder="Duyuru içeriği, ödev stratejisi veya ders hatırlatması..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSavingNote}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
              >
                {isSavingNote ? 'Kaydediliyor...' : 'Duyuruyu Yayınla'}
              </button>
            </form>

            {teacherNotes && teacherNotes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {teacherNotes.map((note) => (
                  <div key={note.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-slate-200">{note.title}</strong>
                      <span className="text-slate-500 text-[10px]">{note.date}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ÇÖZÜLEMEYEN SORULAR HAVUZU (FOTOĞRAFLAR) */}
      {/* ========================================================================= */}
      {activeTeacherTab === 'unsolved' && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls & Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <span>Öğrencilerin Çözemediği Sorular Havuzu</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mete ve Ege'nin test çözerken yapamadığı ve fotoğrafını çektiği tüm sorular
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Öğrenci:</span>
              <button
                onClick={() => setUnsolvedFilterStudent('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  unsolvedFilterStudent === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Tümü ({unsolvedList.length})
              </button>
              <button
                onClick={() => setUnsolvedFilterStudent('mete')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  unsolvedFilterStudent === 'mete'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                👨‍🎓 Mete
              </button>
              <button
                onClick={() => setUnsolvedFilterStudent('ege')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  unsolvedFilterStudent === 'ege'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                🧑‍🎓 Ege
              </button>

              <span className="text-slate-400 ml-2">Durum:</span>
              <select
                value={unsolvedFilterStatus}
                onChange={(e) => setUnsolvedFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">⏳ Çözüm Bekleyenler</option>
                <option value="resolved">✓ Derste Çözüldü</option>
              </select>
            </div>
          </div>

          {/* Question Cards Grid */}
          {filteredUnsolved.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUnsolved.map((item) => {
                const isM = item.studentId === 'mete'
                const isResolved = item.status === 'resolved'
                return (
                  <div
                    key={item.id}
                    className={`bg-slate-900/90 border rounded-2xl p-5 space-y-4 shadow-xl transition ${
                      isResolved
                        ? 'border-emerald-500/30'
                        : isM
                        ? 'border-orange-500/40 hover:border-orange-500/70'
                        : 'border-blue-500/40 hover:border-blue-500/70'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{isM ? '👨‍🎓' : '🧑‍🎓'}</span>
                        <div>
                          <strong className="text-white text-sm">
                            {item.studentName} — {item.questionNo || 'Soru'}
                          </strong>
                          <span className="text-[11px] text-slate-400 block">
                            {item.bookTitle} • {item.topicName} ({item.testNum})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          isResolved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}>
                          {isResolved ? '✓ Derste Çözüldü' : '⏳ Bekliyor'}
                        </span>
                        <button
                          onClick={() => handleDeleteQuestion(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                          title="Soruyu Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Photo Container */}
                    <div
                      onClick={() => setPreviewPhoto(item.imageUrl)}
                      className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden cursor-zoom-in group max-h-72 flex items-center justify-center"
                    >
                      <img
                        src={item.imageUrl}
                        alt="Öğrencinin Çözemediği Soru"
                        className="max-h-72 w-full object-contain p-2 group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-lg">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Tam Ekran Büyüt</span>
                        </span>
                      </div>
                    </div>

                    {/* Student Note */}
                    {item.note && (
                      <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs">
                        <span className="text-amber-400 font-bold block mb-0.5">Öğrencinin Takıldığı Nokta:</span>
                        <p className="text-slate-200">"{item.note}"</p>
                      </div>
                    )}

                    {/* Teacher Reply Section */}
                    {item.teacherReply ? (
                      <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-800/40 text-xs space-y-1">
                        <div className="flex items-center justify-between text-purple-300 font-bold">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Müfit Hoca'nın Çözüm Notu / Açıklaması:</span>
                          </span>
                          <span className="text-[10px] text-purple-400">
                            {item.teacherReplyAt ? new Date(item.teacherReplyAt).toLocaleDateString('tr-TR') : ''}
                          </span>
                        </div>
                        <p className="text-purple-100">{item.teacherReply}</p>
                      </div>
                    ) : null}

                    {/* Teacher Action Bar */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Soru için çözüm tüyosu veya derste incelenecek notu yazın..."
                          value={unsolvedReplies[item.id] || ''}
                          onChange={(e) => setUnsolvedReplies(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleReplyQuestion(item.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition shrink-0"
                        >
                          Not Yaz
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">
                          Tarih: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : today}
                        </span>

                        <button
                          onClick={() => handleReplyQuestion(item.id, isResolved ? 'pending' : 'resolved')}
                          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                            isResolved
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isResolved ? 'Tekrar Bekliyor Yap' : '✓ Derste Çözüldü Olarak İşaretle'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <Camera className="w-12 h-12 mx-auto text-slate-600 opacity-60" />
              <p className="text-sm font-medium">Bu filtrede henüz çözülemeyen soru kaydı bulunmuyor.</p>
              <p className="text-xs text-slate-500">
                Öğrenciler test çözerken takıldıkları soruların fotoğraflarını yüklediklerinde anında burada listelenecektir.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AYRINTILI İSTATİSTİKLER & MÜFREDAT KARNESİ */}
      {/* ========================================================================= */}
      {activeTeacherTab === 'detailed_stats' && (
        <div className="space-y-8 animate-fade-in">
          {/* Comparative KPI Metrics for Teacher */}
          {comparison && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-400" />
                    <span>Mete & Ege Karşılaştırmalı Performans Matrisi</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    İki öğrencinin hızlandırılmış 304 testlik programdaki canlı gelişim metrikleri
                  </p>
                </div>
                <span className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-lg font-semibold">
                  Eşzamanlı Özel Ders
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-xs text-slate-400 block mb-2">Çözülen Testler</span>
                  <div className="flex items-center justify-center space-x-3">
                    <div>
                      <span className="text-[10px] text-orange-400 block font-semibold">Mete</span>
                      <strong className="text-xl text-white">{comparison.comparison.testsSolved.mete}</strong>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div>
                      <span className="text-[10px] text-blue-400 block font-semibold">Ege</span>
                      <strong className="text-xl text-white">{comparison.comparison.testsSolved.ege}</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Hedef: 304 Test</span>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-xs text-slate-400 block mb-2">Net Ortalaması</span>
                  <div className="flex items-center justify-center space-x-3">
                    <div>
                      <span className="text-[10px] text-orange-400 block font-semibold">Mete</span>
                      <strong className="text-xl text-amber-300">{comparison.comparison.avgNet.mete}</strong>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div>
                      <span className="text-[10px] text-blue-400 block font-semibold">Ege</span>
                      <strong className="text-xl text-amber-300">{comparison.comparison.avgNet.ege}</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">12 Soru Üzerinden</span>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-xs text-slate-400 block mb-2">Başarı Yüzdesi</span>
                  <div className="flex items-center justify-center space-x-3">
                    <div>
                      <span className="text-[10px] text-orange-400 block font-semibold">Mete</span>
                      <strong className="text-xl text-emerald-400">%{comparison.comparison.avgScore.mete}</strong>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div>
                      <span className="text-[10px] text-blue-400 block font-semibold">Ege</span>
                      <strong className="text-xl text-emerald-400">%{comparison.comparison.avgScore.ege}</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Doğru / Toplam Soru</span>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-center">
                  <span className="text-xs text-slate-400 block mb-2">Çözüm Serisi</span>
                  <div className="flex items-center justify-center space-x-3">
                    <div>
                      <span className="text-[10px] text-orange-400 block font-semibold">Mete</span>
                      <strong className="text-xl text-rose-400">{comparison.comparison.streakDays.mete} Gün</strong>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div>
                      <span className="text-[10px] text-blue-400 block font-semibold">Ege</span>
                      <strong className="text-xl text-rose-400">{comparison.comparison.streakDays.ege} Gün</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-rose-400/80 block mt-1">Zinciri Kırma 🔥</span>
                </div>
              </div>
            </div>
          )}

          {/* 7 Themes Detailed Mastery Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>7 Tema Ayrıntılı Konu Kazanım & Başarı Tablosu</span>
                </h3>
                <p className="text-xs text-slate-400">
                  9. Sınıf Maarif Modeli temalarında Mete ve Ege'nin ilerleme ve net durumu
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Toplam 304 Test</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Müfredat Teması</th>
                    <th className="py-3 px-3 text-center">Toplam Test</th>
                    <th className="py-3 px-3 text-center text-orange-400">👨‍🎓 Mete (Çözülen / Net)</th>
                    <th className="py-3 px-3 text-center text-orange-400">Mete Başarı %</th>
                    <th className="py-3 px-3 text-center text-blue-400">🧑‍🎓 Ege (Çözülen / Net)</th>
                    <th className="py-3 px-3 text-center text-blue-400">Ege Başarı %</th>
                    <th className="py-3 px-4 text-center">Kazanım Durumu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { id: 't1', name: '1. Tema: Sayılar', total: 61 },
                    { id: 't2', name: '2. Tema: Nicelikler ve Değişimler', total: 31 },
                    { id: 't3', name: '3. Tema: Geometrik Şekiller', total: 18 },
                    { id: 't4', name: '4. Tema: Eşlik ve Benzerlik', total: 48 },
                    { id: 't5', name: '5. Tema: Algoritma ve Bilişim', total: 23 },
                    { id: 't6', name: '6. Tema: İstatistiksel Araştırma', total: 27 },
                    { id: 't7', name: '7. Tema: Veriden Olasılığa', total: 11 }
                  ].map((theme) => {
                    const meteTheme = meteAnalytics?.topicMastery?.find(t => t.themeName.includes(theme.name.split(':')[1]?.trim() || theme.name))
                    const egeTheme = egeAnalytics?.topicMastery?.find(t => t.themeName.includes(theme.name.split(':')[1]?.trim() || theme.name))

                    const meteDone = meteTheme?.testsCompleted || 0
                    const egeDone = egeTheme?.testsCompleted || 0
                    const meteAvgNet = meteTheme?.avgNet || 0
                    const egeAvgNet = egeTheme?.avgNet || 0
                    const meteScore = meteTheme?.successRate || 0
                    const egeScore = egeTheme?.successRate || 0

                    return (
                      <tr key={theme.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {theme.name}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                          {theme.total} Test
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-bold text-white">{meteDone}</span>
                          <span className="text-slate-500"> / {theme.total}</span>
                          <span className="ml-1 text-[11px] text-amber-300 font-mono">({meteAvgNet} Net)</span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            meteScore >= 80 ? 'bg-emerald-500/20 text-emerald-300' : meteScore > 0 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500'
                          }`}>
                            %{meteScore}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-bold text-white">{egeDone}</span>
                          <span className="text-slate-500"> / {theme.total}</span>
                          <span className="ml-1 text-[11px] text-amber-300 font-mono">({egeAvgNet} Net)</span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            egeScore >= 80 ? 'bg-emerald-500/20 text-emerald-300' : egeScore > 0 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500'
                          }`}>
                            %{egeScore}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[11px] text-slate-400">
                            {meteDone > 0 || egeDone > 0 ? 'Aktif İşleniyor' : 'Sırada'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Book Breakdown: ÇAP Plus vs Orijinal Matematik */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                <div>
                  <h4 className="text-base font-bold text-white">ÇAP Plus 9. Sınıf Soru Bankası</h4>
                  <span className="text-xs text-indigo-300">Konu Kavrama & Pekiştirme (127 Test)</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Temel ve kavrama düzeyindeki öğreniyorum ve pekiştiriyorum testleri.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-orange-400 block font-semibold">👨‍🎓 Mete</span>
                  <strong className="text-base text-white">{meteAnalytics?.summary?.totalTests || 0} / 127 Test</strong>
                  <span className="text-[10px] text-slate-500 block">Kavrama Seviyesi</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-blue-400 block font-semibold">🧑‍🎓 Ege</span>
                  <strong className="text-base text-white">{egeAnalytics?.summary?.totalTests || 0} / 127 Test</strong>
                  <span className="text-[10px] text-slate-500 block">Kavrama Seviyesi</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-purple-400" />
                <div>
                  <h4 className="text-base font-bold text-white">Orijinal 9. Sınıf Soru Bankası</h4>
                  <span className="text-xs text-purple-300">Süreç Kontrol & ÖSYM Tarzı (177 Test)</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Orta ve ileri düzey beceri temelli, yeni nesil soru kalıpları.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-orange-400 block font-semibold">👨‍🎓 Mete</span>
                  <strong className="text-base text-white">{meteAnalytics?.summary?.totalTests || 0} / 177 Test</strong>
                  <span className="text-[10px] text-slate-500 block">İleri Düzey</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] text-blue-400 block font-semibold">🧑‍🎓 Ege</span>
                  <strong className="text-base text-white">{egeAnalytics?.summary?.totalTests || 0} / 177 Test</strong>
                  <span className="text-[10px] text-slate-500 block">İleri Düzey</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DENEME SINAVLARI TAKİBİ (METE & EGE) */}
      {/* ========================================================================= */}
      {activeTeacherTab === 'mock_exams' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Mete & Ege Deneme Sınavları ve Kitapçık Soru Takibi
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Öğrencilerin okul, dershane ve kurumsal deneme sonuçlarını, net başarılarını ve kitapçık soru fotoğraflarını inceleyip her denemeye özel öğretmen değerlendirmesi iletebilirsiniz.
                </p>
              </div>

              {/* Filter by Student */}
              <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setMockExamFilterStudent('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    mockExamFilterStudent === 'all'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tümü ({mockExamsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMockExamFilterStudent('mete')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    mockExamFilterStudent === 'mete'
                      ? 'bg-orange-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👨‍🎓 Mete ({mockExamsList.filter(e => e.studentId === 'mete').length})
                </button>
                <button
                  type="button"
                  onClick={() => setMockExamFilterStudent('ege')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    mockExamFilterStudent === 'ege'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🧑‍🎓 Ege ({mockExamsList.filter(e => e.studentId === 'ege').length})
                </button>
              </div>
            </div>
          </div>

          {/* Student KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Mete KPI */}
            {(() => {
              const meteExams = mockExamsList.filter(e => e.studentId === 'mete')
              const meteAvg = meteExams.length > 0
                ? (meteExams.reduce((s, e) => s + (Number(e.net) || 0), 0) / meteExams.length).toFixed(2)
                : '0.00'
              const meteHigh = meteExams.length > 0
                ? Math.max(...meteExams.map(e => Number(e.net) || 0)).toFixed(2)
                : '-'

              return (
                <div className="bg-slate-900/90 border border-orange-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">👨‍🎓</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">Mete (Fen Lisesi)</h4>
                        <span className="text-[11px] text-orange-400">Deneme Performans Özeti</span>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold">
                      {meteExams.length} Deneme
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Toplam Sınav</span>
                      <strong className="text-base text-white">{meteExams.length}</strong>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Ortalama Net</span>
                      <strong className="text-base text-emerald-400">{meteAvg} Net</strong>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">En Yüksek Net</span>
                      <strong className="text-base text-amber-400">{meteHigh}</strong>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Ege KPI */}
            {(() => {
              const egeExams = mockExamsList.filter(e => e.studentId === 'ege')
              const egeAvg = egeExams.length > 0
                ? (egeExams.reduce((s, e) => s + (Number(e.net) || 0), 0) / egeExams.length).toFixed(2)
                : '0.00'
              const egeHigh = egeExams.length > 0
                ? Math.max(...egeExams.map(e => Number(e.net) || 0)).toFixed(2)
                : '-'

              return (
                <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">🧑‍🎓</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">Ege (Anadolu Lisesi)</h4>
                        <span className="text-[11px] text-blue-400">Deneme Performans Özeti</span>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                      {egeExams.length} Deneme
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Toplam Sınav</span>
                      <strong className="text-base text-white">{egeExams.length}</strong>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">Ortalama Net</span>
                      <strong className="text-base text-emerald-400">{egeAvg} Net</strong>
                    </div>
                    <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">En Yüksek Net</span>
                      <strong className="text-base text-amber-400">{egeHigh}</strong>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Detailed Mock Exams List */}
          {filteredTeacherMockExams.length > 0 ? (
            <div className="space-y-4">
              {filteredTeacherMockExams.map((exam) => {
                const isMete = exam.studentId === 'mete'
                const netVal = Number(exam.net) || 0
                const q = Number(exam.qCount) || 30
                const currentFeedbackInput = mockExamFeedback[exam.id] !== undefined
                  ? mockExamFeedback[exam.id]
                  : (exam.teacherFeedback || '')

                return (
                  <div
                    key={exam.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl space-y-4 transition"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{isMete ? '👨‍🎓' : '🧑‍🎓'}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                              isMete ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {exam.studentName || (isMete ? 'Mete' : 'Ege')}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                              {exam.publisher}
                            </span>
                            <span className="text-xs text-slate-400">
                              {exam.date}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white mt-1">
                            {exam.examTitle}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 self-end sm:self-center">
                        {exam.mathNet !== undefined && (
                          <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl px-3 py-1.5 text-right">
                            <div className="text-[10px] text-indigo-300 font-bold uppercase">📐 Matematik</div>
                            <div className="text-sm font-black text-indigo-400">
                              {Number(exam.mathNet).toFixed(2)} Net
                            </div>
                          </div>
                        )}

                        <div className="text-right">
                          <div className="text-xs text-slate-400">Genel Toplam Net</div>
                          <div className="text-lg sm:text-xl font-black text-white">
                            {netVal.toFixed(2)} / {q} Soru
                            <span className="text-xs font-semibold text-emerald-400 ml-1.5">
                              (%{exam.scorePercent || 0})
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteMockExam(exam.id)}
                          title="Denemeyi Sil"
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Multi-subject breakdown or single subject pills */}
                    {exam.subjects && exam.subjects.length > 0 ? (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Dersler Bazında Netler & Sonuçlar:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {exam.subjects.map((sub, sIdx) => {
                            const isMath = sub.name?.toLowerCase().includes('mat') || sub.key === 'matematik'
                            return (
                              <div
                                key={sub.key || sIdx}
                                className={`p-2.5 rounded-xl border text-xs ${
                                  isMath
                                    ? 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/30'
                                    : 'bg-slate-800/60 border-slate-700/60'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold text-white mb-1 truncate">
                                  <span className="truncate">{sub.icon || (isMath ? '📐' : '📝')} {sub.name}</span>
                                  <span className={isMath ? 'text-indigo-400' : 'text-emerald-400'}>
                                    {Number(sub.net || 0).toFixed(2)} Net
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                  <span>{sub.correct || 0}D • {sub.wrong || 0}Y • {sub.empty || 0}B</span>
                                  <span className="text-slate-500">{sub.qCount || 30} S</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
                          <span className="text-[10px] text-emerald-300 block">Doğru</span>
                          <strong className="text-emerald-400 text-sm">{exam.correct || 0} Soru</strong>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2">
                          <span className="text-[10px] text-rose-300 block">Yanlış</span>
                          <strong className="text-rose-400 text-sm">{exam.wrong || 0} Soru</strong>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2">
                          <span className="text-[10px] text-amber-300 block">Boş</span>
                          <strong className="text-amber-400 text-sm">{exam.empty || 0} Soru</strong>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2">
                          <span className="text-[10px] text-purple-300 block">Çözüm Süresi</span>
                          <strong className="text-purple-300 text-sm">{exam.durationMinutes || 45} dk</strong>
                        </div>
                      </div>
                    )}

                    {/* Student note if available */}
                    {exam.studentNote && (
                      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300">
                        <strong className="text-indigo-400 block mb-0.5">Öğrencinin Öz Değerlendirmesi:</strong>
                        {exam.studentNote}
                      </div>
                    )}

                    {/* Question Photos from booklet */}
                    {exam.questionPhotos && exam.questionPhotos.length > 0 && (
                      <div className="space-y-2 border-t border-slate-800 pt-3">
                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                          <Camera className="w-4 h-4 text-indigo-400" />
                          <span>Deneme Kitapçığı Soru Fotoğrafları ({exam.questionPhotos.length} Soru):</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {exam.questionPhotos.map((photo, pIdx) => (
                            <div
                              key={photo.id || pIdx}
                              onClick={() => setPreviewPhoto(photo.url)}
                              className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video cursor-pointer hover:border-purple-400 transition"
                            >
                              <img
                                src={photo.url}
                                alt={`Soru ${pIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <Maximize2 className="w-5 h-5 text-white" />
                              </div>
                              <span className="absolute bottom-1 left-1 text-[9px] bg-black/75 text-white px-1.5 py-0.5 rounded font-mono">
                                Soru #{pIdx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teacher Feedback Box */}
                    <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 space-y-2">
                      <label className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                        <span>Müfit Hoca'nın Bu Denemeye Özel Değerlendirme & Yorumu:</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <textarea
                          rows="2"
                          placeholder="Örn: Geometri kısmındaki eksikleri haftalık özel dersimizde analiz edeceğiz. Net gelişimi çok iyi..."
                          value={currentFeedbackInput}
                          onChange={(e) => setMockExamFeedback(prev => ({ ...prev, [exam.id]: e.target.value }))}
                          className="flex-1 bg-slate-900 border border-purple-500/40 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveMockFeedback(exam.id)}
                          disabled={savingFeedbackId === exam.id}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shrink-0 self-end sm:self-auto disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{savingFeedbackId === exam.id ? 'Kaydediliyor...' : 'Yorumu Kaydet'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-3">
              <Target className="w-10 h-10 text-indigo-400 mx-auto opacity-60" />
              <h4 className="text-sm font-bold text-white">Henüz Deneme Sınavı Kaydı Bulunmuyor</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Öğrenciler kendi sayfalarından deneme sınavlarını girdikçe tüm sonuçlar ve kitapçık soruları burada listelenecektir.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GOOGLE DRIVE & WHATSAPP ENTEGRASYONU (SAAT 16:00) */}
      {/* ========================================================================= */}
      {activeTeacherTab === 'whatsapp_and_drive' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-slate-900/90 border border-sky-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Google Drive Soru Arşivi & WhatsApp 16:00 Bildirim Merkezi
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Öğrencilerinizin sisteme yüklediği çözülemeyen sorular kendi Google Drive'ınızda <strong>"mete-ege yapılamayan sorular"</strong> ana klasörüne tarih tarih kaydedilir.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                  systemSettings?.googleAppsScriptUrl
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${systemSettings?.googleAppsScriptUrl ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{systemSettings?.googleAppsScriptUrl ? 'Google Drive Aktif' : 'Kurulum Bekleniyor'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: WhatsApp on Left, Drive on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">

            {/* CARD 1: WHATSAPP 16:00 BİLDİRİMİ */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">WhatsApp Grubu Günlük Ödev Bildirimi</h4>
                      <span className="text-[11px] text-emerald-400 font-medium">Hedef Saat: 16:00 • Mete & Ege Grubu</span>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
                    Saat 16:00
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs text-slate-300 font-medium">Bildirim Tarihi Seçin:</label>
                  <input
                    type="date"
                    value={whatsAppDate}
                    onChange={(e) => setWhatsAppDate(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* WhatsApp Chat Bubble Mockup */}
                <div className="bg-slate-950/90 border border-emerald-500/20 rounded-2xl p-4 shadow-inner">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Mete & Ege WhatsApp Grubu Önizleme
                    </span>
                    <span>{whatsAppData?.dateFormatted || whatsAppDate}</span>
                  </div>

                  {loadingWhatsApp ? (
                    <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Günün test görevleri derleniyor...</span>
                    </div>
                  ) : (
                    <pre className="text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto pr-1">
                      {whatsAppData?.message || 'Mesaj oluşturulamadı.'}
                    </pre>
                  )}
                </div>

                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-[11px] text-emerald-200 leading-relaxed flex items-start gap-2">
                  <span className="text-sm shrink-0">💡</span>
                  <span>
                    <strong>Öğretmen Tavsiyesi:</strong> Okul çıkışında (16:00) öğrencilerin ne çözeceğini bilmesi çalışma alışkanlığını pekiştirir. Öğrenciler çözemedikleri soruların fotoğraflarını sisteme yüklediğinde doğrudan Google Drive'ınıza düşer.
                  </span>
                </div>

                {/* Optional Automated WhatsApp Webhook Configuration */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Otomatik Gönderim İçin WhatsApp Webhook URL:</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-medium">Opsiyonel / Otomatik</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={whatsAppWebhookInput}
                      onChange={(e) => setWhatsAppWebhookInput(e.target.value)}
                      placeholder="https://your-whatsapp-bot-or-webhook-url..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveAndTestWebhook}
                      disabled={isTestingWebhook}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                    >
                      {isTestingWebhook ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{isTestingWebhook ? 'Gönderiliyor...' : 'Webhook Test Et'}</span>
                    </button>
                  </div>
                  {webhookTestResult && (
                    <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                      webhookTestResult.success ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                    }`}>
                      {webhookTestResult.success ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      <span>{webhookTestResult.message}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    💡 Google Apps Script içinde <code className="text-emerald-300 font-mono">otomatik1600TetikleyiciKur()</code> fonksiyonunu çalıştırdığınızda, her gün saat 16:00'da bu webhook üzerinden gruba mesaj kendiliğinden gönderilir.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
                >
                  {copiedWhatsApp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWhatsApp ? 'Metin Kopyalandı!' : 'Metni Kopyala'}</span>
                </button>

                {whatsAppData?.whatsappUrl && (
                  <a
                    href={whatsAppData.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30"
                  >
                    <Send className="w-4 h-4" />
                    <span>WhatsApp'ta Aç ve Gönder</span>
                  </a>
                )}
              </div>
            </div>

            {/* CARD 2: GOOGLE DRIVE ENTEGRASYONU */}
            <div className="bg-slate-900/90 border border-sky-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Google Drive Soru Arşivi</h4>
                      <span className="text-[11px] text-sky-400 font-medium">Klasör: mete-ege yapılamayan sorular</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                    Google Apps Script
                  </span>
                </div>

                {/* Folder Structure Visual */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <FolderOpen className="w-4 h-4" />
                    <span>Google Drive / mete-ege yapılamayan sorular</span>
                  </div>
                  <div className="pl-6 border-l border-slate-800 space-y-1 text-[11px]">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-amber-400" />
                      <span>2026-10-05 (Günün Tarihi Klasörü)</span>
                    </div>
                    <div className="pl-5 text-slate-400 flex items-center gap-1.5">
                      <span>📸</span>
                      <span>Mete_Matematik_UsluSayilar_Soru3.jpg</span>
                    </div>
                    <div className="pl-5 text-slate-400 flex items-center gap-1.5">
                      <span>📸</span>
                      <span>Ege_Matematik_UsluSayilar_Soru7.jpg</span>
                    </div>
                  </div>
                </div>

                {/* URL Input Form */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-bold block">
                    Google Apps Script Web Uygulaması URL Adresi:
                  </label>
                  <input
                    type="url"
                    value={scriptUrlInput}
                    onChange={(e) => setScriptUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Google Drive'ınızda oluşturduğunuz Apps Script Web Uygulaması URL'sini buraya yapıştırınız.
                  </p>
                </div>

                {/* Result Feedback Messages */}
                {driveTestResult && (
                  <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                    driveTestResult.success
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                  }`}>
                    {driveTestResult.success ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                    <span>{driveTestResult.message}</span>
                  </div>
                )}

                {settingsSaveMsg && (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{settingsSaveMsg}</span>
                  </div>
                )}

                {driveSyncMsg && (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{driveSyncMsg}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSaveAndTestDrive}
                    disabled={isSavingSettings || isTestingDrive}
                    className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/30 disabled:opacity-50"
                  >
                    {isTestingDrive ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{isTestingDrive ? 'Bağlantı Test Ediliyor...' : 'Kaydet & Bağlantıyı Test Et'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncAllQuestions}
                    disabled={isSyncingDrive}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-50"
                    title="Mevcut soruları Drive'a gönder"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin text-sky-400' : ''}`} />
                    <span>{isSyncingDrive ? 'Eşitleniyor...' : 'Tümünü Eşitle'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowScriptCode(!showScriptCode)}
                  className="w-full text-center text-xs text-sky-400 hover:text-sky-300 underline underline-offset-4 py-1"
                >
                  {showScriptCode ? '▲ Kurulum Rehberini ve Kodunu Gizle' : '▼ 1 Dakikalık Kurulum Rehberi & Apps Script Kodunu Gör'}
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Step-by-Step Guide & Apps Script Code */}
          {showScriptCode && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">📘</span>
                  <h4 className="text-sm font-bold text-white">Google Apps Script 1 Dakikada Kurulum Kılavuzu</h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(scriptSampleCode)
                    setCopiedScriptCode(true)
                    setTimeout(() => setCopiedScriptCode(false), 2500)
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                >
                  {copiedScriptCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScriptCode ? 'Kod Kopyalandı!' : 'Script Kodunu Kopyala'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-300">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[11px] mb-1">1</span>
                  <strong className="text-white block">Apps Script Açın</strong>
                  <p className="text-slate-400 text-[11px]">Tarayıcıda <strong>script.google.com</strong> adresine gidip "+ Yeni proje" butonuna tıklayın.</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[11px] mb-1">2</span>
                  <strong className="text-white block">Kodu Yapıştırın</strong>
                  <p className="text-slate-400 text-[11px]">Yukarıdaki "Script Kodunu Kopyala" butonuna basıp editöre yapıştırın ve disket simgesiyle kaydedin.</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[11px] mb-1">3</span>
                  <strong className="text-white block">Web Uygulaması Dağıtın</strong>
                  <p className="text-slate-400 text-[11px]">Sağ üstte "Dağıt" → "Yeni dağıtım" → Tür: "Web uygulaması" → "Erişimi olanlar: Herkes" seçip dağıtın.</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[11px] mb-1">4</span>
                  <strong className="text-white block">URL'yi Ekleyin</strong>
                  <p className="text-slate-400 text-[11px]">Google'ın size verdiği Web Uygulaması URL'sini yukarıdaki kutucuğa yapıştırıp test edin!</p>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-sky-300 font-mono text-[11px] p-4 rounded-xl border border-slate-800 max-h-64 overflow-y-auto leading-relaxed">
                  {scriptSampleCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Zoom Modal for Question Photos */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
            <div className="p-3 bg-slate-950 flex justify-between items-center border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                Öğrenci Soru Fotoğrafı Önizleme
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
  )
}
