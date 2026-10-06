import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import {
  readDB,
  writeDB,
  getStudents,
  getBooks,
  getAssignments,
  getSubmissions,
  addSubmission,
  updateStudentPin,
  verifyStudentPin,
  getUnsolvedQuestions,
  addUnsolvedQuestion,
  updateUnsolvedQuestion,
  deleteUnsolvedQuestion,
  getMockExams,
  addMockExam,
  updateMockExam,
  deleteMockExam,
  getSettings,
  updateSettings
} from './db.js'
import { computeStudentAnalytics, computeComparisonAnalytics } from './analytics.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'data', 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

app.use(cors())
app.use(express.json({ limit: '30mb' }))
app.use(express.urlencoded({ extended: true, limit: '30mb' }))

// Serve uploaded question photos
app.use('/uploads', express.static(UPLOADS_DIR))

/**
 * Asynchronously sends an uploaded question photo to Müfit Hoca's Google Apps Script Web App,
 * which saves it into Google Drive under:
 * "mete-ege yapılamayan sorular / [Tarih] / [Öğrenci]_[Ders]_[Test]_[Soru]_[Zaman].jpg"
 */
async function syncPhotoToGoogleDrive(questionRecord) {
  try {
    const settings = getSettings()
    if (!settings.googleAppsScriptUrl || !settings.googleAppsScriptUrl.trim()) {
      return { synced: false, reason: 'Google Apps Script URL ayarlanmamış.' }
    }

    let base64Data = ''
    if (questionRecord.imageUrl) {
      if (questionRecord.imageUrl.startsWith('data:image')) {
        base64Data = questionRecord.imageUrl
      } else {
        const basename = path.basename(questionRecord.imageUrl)
        const localPath = path.join(UPLOADS_DIR, basename)
        if (fs.existsSync(localPath)) {
          const buf = fs.readFileSync(localPath)
          let mime = 'image/jpeg'
          if (basename.endsWith('.png')) mime = 'image/png'
          else if (basename.endsWith('.webp')) mime = 'image/webp'
          base64Data = `data:${mime};base64,${buf.toString('base64')}`
        }
      }
    }

    if (!base64Data) {
      return { synced: false, reason: 'Görsel içeriği bulunamadı.' }
    }

    const payload = {
      action: 'upload_photo',
      studentName: questionRecord.studentName || (questionRecord.studentId === 'mete' ? 'Mete' : 'Ege'),
      studentId: questionRecord.studentId,
      date: questionRecord.date || (questionRecord.createdAt ? questionRecord.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
      subject: questionRecord.subject || questionRecord.themeName || 'Matematik',
      bookTitle: questionRecord.bookTitle || 'Matematik',
      testTitle: questionRecord.testTitle || 'Test',
      questionNo: questionRecord.questionNo || 'Soru',
      note: questionRecord.note || '',
      imageBase64: base64Data
    }

    const resp = await fetch(settings.googleAppsScriptUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    })

    const result = await resp.json()
    if (result && (result.status === 'success' || result.fileUrl)) {
      updateUnsolvedQuestion(questionRecord.id, {
        driveFileUrl: result.fileUrl || '',
        driveDownloadUrl: result.downloadUrl || '',
        driveFolder: result.folderPath || 'mete-ege yapılamayan sorular',
        driveSyncedAt: new Date().toISOString()
      })
      console.log(`[Google Drive Sync] Başarılı: ${questionRecord.studentName} -> ${result.folderPath} (${result.fileName || ''})`)
      return { synced: true, result }
    } else {
      console.warn(`[Google Drive Sync] Apps Script yanıtı:`, result)
      return { synced: false, error: result?.message || 'Bilinmeyen hata' }
    }
  } catch (err) {
    console.error(`[Google Drive Sync Error]:`, err.message)
    return { synced: false, error: err.message }
  }
}

/**
 * Formats WhatsApp announcement text for daily test assignment schedule at 16:00
 */
function formatWhatsAppDailyMessage(dateStr = null) {
  const db = readDB()
  const today = new Date().toISOString().split('T')[0]
  const targetDate = dateStr || (today >= '2026-10-05' && today <= '2027-05-29' ? today : '2026-10-05')

  const dayAssignments = db.assignments.filter(a => a.date === targetDate)
  const meteAsgns = dayAssignments.filter(a => a.studentId === 'mete')
  const egeAsgns = dayAssignments.filter(a => a.studentId === 'ege')

  const firstAsgn = dayAssignments[0]
  const dayNumber = firstAsgn ? firstAsgn.dayNumber : 1
  const isWeekend = firstAsgn ? firstAsgn.isWeekend : false

  // Format date in Turkish (örn: 5 Ekim 2026 Pazartesi)
  const dateObj = new Date(targetDate + 'T12:00:00')
  const daysTr = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const monthsTr = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  const dateFormatted = `${dateObj.getDate()} ${monthsTr[dateObj.getMonth()]} ${dateObj.getFullYear()} ${daysTr[dateObj.getDay()]}`

  let msg = `📅 *GÜNLÜK ÖDEV VE ÇALIŞMA BİLDİRİMİ*\n`
  msg += `🗓 *Tarih:* ${dateFormatted} (${isWeekend ? 'Hafta Sonu • 2 Test' : 'Hafta İçi • 1 Test'})\n`
  msg += `📌 *İlerleme:* Gün ${dayNumber} / 237\n`
  msg += `👨‍🏫 *Öğretmen:* Müfit Hoca\n`
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`

  // Mete'nin Görevi
  msg += `👨‍🎓 *METE'NİN BUGÜNKÜ GÖREVİ:*\n`
  if (meteAsgns.length > 0) {
    meteAsgns.forEach((a, i) => {
      const slot = isWeekend ? (i === 0 ? '1. Test (Öğlen Öncesi)' : '2. Test (Öğleden Sonra)') : 'Günün Testi'
      msg += `🔹 *${slot}*\n`
      msg += `   📚 Kitap: ${a.bookTitle}\n`
      msg += `   📂 Konu: ${a.topicName || a.themeName}\n`
      msg += `   📝 Test: ${a.testTitle} (${a.testNum || ''}) • Sayfa ${a.pages || ''}\n`
    })
  } else {
    msg += `   Bugün için planlanmış test bulunmuyor.\n`
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n\n`

  // Ege'nin Görevi
  msg += `🧑‍🎓 *EGE'NİN BUGÜNKÜ GÖREVİ:*\n`
  if (egeAsgns.length > 0) {
    egeAsgns.forEach((a, i) => {
      const slot = isWeekend ? (i === 0 ? '1. Test (Öğlen Öncesi)' : '2. Test (Öğleden Sonra)') : 'Günün Testi'
      msg += `🔹 *${slot}*\n`
      msg += `   📚 Kitap: ${a.bookTitle}\n`
      msg += `   📂 Konu: ${a.topicName || a.themeName}\n`
      msg += `   📝 Test: ${a.testTitle} (${a.testNum || ''}) • Sayfa ${a.pages || ''}\n`
    })
  } else {
    msg += `   Bugün için planlanmış test bulunmuyor.\n`
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`
  msg += `📸 *ÖNEMLİ KURAL & HATIRLATMA:*\n`
  msg += `• Testleri mutlaka süre tutarak ve dikkatinizi dağıtmadan çözünüz.\n`
  msg += `• Çözemediğiniz, takıldığınız veya boş bıraktığınız soruların fotoğrafını sisteme yükleyin (Sorular anında Müfit Hoca'nın Google Drive arşivine aktarılır).\n`
  msg += `• Test sonuçlarınızı çözdükten hemen sonra sisteme giriniz.\n\n`
  msg += `🚀 Başarılar gençler, iyi çalışmalar!`

  return {
    date: targetDate,
    dateFormatted,
    dayNumber,
    isWeekend,
    message: msg,
    whatsappUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Students
app.get('/api/students', (req, res) => {
  const students = getStudents()
  res.json(students)
})

app.get('/api/students/:id', (req, res) => {
  const students = getStudents()
  const student = students.find(s => s.id === req.params.id)
  if (!student) return res.status(404).json({ error: 'Öğrenci bulunamadı' })
  res.json(student)
})

// Books & Curriculum catalog
app.get('/api/books', (req, res) => {
  const books = getBooks()
  res.json(books)
})

// Schedule & Assignments
app.get('/api/schedule', (req, res) => {
  const { studentId, date, month } = req.query
  const db = readDB()
  let list = db.assignments

  if (studentId) {
    list = list.filter(a => a.studentId === studentId)
  }
  if (date) {
    list = list.filter(a => a.date === date)
  } else if (month) {
    // format YYYY-MM
    list = list.filter(a => a.date.startsWith(month))
  }

  // Attach submission data if completed
  const result = list.map(asgn => {
    let sub = null
    if (asgn.submissionId) {
      sub = db.submissions.find(s => s.id === asgn.submissionId)
    }
    return {
      ...asgn,
      submission: sub
    }
  })

  res.json(result)
})

// Today's Assignment(s) for a student (Weekdays: 1, Weekends: 2)
app.get('/api/today', (req, res) => {
  const { studentId } = req.query
  const db = readDB()
  const startDate = (db.settings && db.settings.startDate) || '2026-10-05'
  const today = new Date().toISOString().split('T')[0]

  let activeDate = today
  let isUpcomingStart = false

  // If current date is before official program start (e.g. 4 Ekim vs 5 Ekim)
  if (today < startDate) {
    activeDate = startDate
    isUpcomingStart = true
  }

  let todayAssignments = db.assignments.filter(
    a => a.studentId === studentId && a.date === activeDate
  )

  // Fallback to first pending assignment date
  if (todayAssignments.length === 0) {
    const firstPending = db.assignments.find(
      a => a.studentId === studentId && a.status === 'pending'
    )
    if (firstPending) {
      activeDate = firstPending.date
      todayAssignments = db.assignments.filter(
        a => a.studentId === studentId && a.date === activeDate
      )
    } else {
      const first = db.assignments.find(a => a.studentId === studentId)
      todayAssignments = first ? [first] : []
    }
  }

  // Attach submission data for each assignment
  const populatedAssignments = todayAssignments.map(asgn => {
    let submission = null
    if (asgn && asgn.submissionId) {
      submission = db.submissions.find(s => s.id === asgn.submissionId)
    }
    return { ...asgn, submission }
  })

  // Determine active assignment (prioritize first pending test, otherwise first completed)
  const activeAssignment = populatedAssignments.find(a => a.status === 'pending') || populatedAssignments[0] || null
  const isWeekend = populatedAssignments.some(a => a.isWeekend)

  res.json({
    todayDate: activeDate,
    systemDate: today,
    startDate,
    isUpcomingStart,
    isWeekend,
    totalTodayCount: populatedAssignments.length,
    todayAssignments: populatedAssignments,
    assignment: activeAssignment
  })
})

// Upload question photo (Base64 data)
app.post('/api/upload-photo', (req, res) => {
  try {
    const { dataUrl } = req.body
    if (!dataUrl) {
      return res.status(400).json({ error: 'Fotoğraf verisi (dataUrl) eksik.' })
    }

    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Geçersiz görsel formatı.' })
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')

    let ext = 'jpg'
    if (mimeType.includes('png')) ext = 'png'
    else if (mimeType.includes('webp')) ext = 'webp'

    const safeName = `question_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`
    const filePath = path.join(UPLOADS_DIR, safeName)

    fs.writeFileSync(filePath, buffer)
    const publicUrl = `/uploads/${safeName}`

    res.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      sizeBytes: buffer.length
    })
  } catch (err) {
    console.error('Photo upload error:', err)
    res.status(500).json({ error: 'Fotoğraf kaydedilirken hata oluştu: ' + err.message })
  }
})

// Unsolved questions list & management
app.get('/api/unsolved-questions', (req, res) => {
  const { studentId } = req.query
  const list = getUnsolvedQuestions(studentId)
  res.json(list)
})

app.post('/api/unsolved-questions', (req, res) => {
  const {
    studentId,
    studentName,
    testId,
    assignmentId,
    bookTitle,
    themeName,
    topicName,
    testTitle,
    testNum,
    pages,
    questionNo,
    note,
    imageUrl
  } = req.body

  if (!studentId || !imageUrl) {
    return res.status(400).json({ error: 'Öğrenci kimliği ve soru görseli zorunludur.' })
  }

  const created = addUnsolvedQuestion({
    studentId,
    studentName: studentName || (studentId === 'mete' ? 'Mete' : 'Ege'),
    testId: testId || null,
    assignmentId: assignmentId || null,
    bookTitle: bookTitle || 'Matematik Soru Bankası',
    themeName: themeName || '',
    topicName: topicName || '',
    testTitle: testTitle || '',
    testNum: testNum || '',
    pages: pages || '',
    questionNo: questionNo || 'Soru',
    note: note || '',
    imageUrl
  })

  // Asynchronously sync photo to Google Drive
  syncPhotoToGoogleDrive(created).catch(err => {
    console.error('[Google Drive Sync Error in /api/unsolved-questions]:', err.message)
  })

  res.status(201).json({ success: true, question: created })
})

app.put('/api/unsolved-questions/:id', (req, res) => {
  const { teacherReply, status } = req.body
  const updates = {}
  if (teacherReply !== undefined) {
    updates.teacherReply = teacherReply
    updates.teacherReplyAt = new Date().toISOString()
  }
  if (status !== undefined) {
    updates.status = status // 'pending', 'reviewed', 'resolved'
  }

  const updated = updateUnsolvedQuestion(req.params.id, updates)
  if (!updated) {
    return res.status(404).json({ error: 'Soru kaydı bulunamadı.' })
  }
  res.json({ success: true, question: updated })
})

app.delete('/api/unsolved-questions/:id', (req, res) => {
  const deleted = deleteUnsolvedQuestion(req.params.id)
  if (!deleted) {
    return res.status(404).json({ error: 'Soru kaydı bulunamadı.' })
  }
  res.json({ success: true })
})

// ==========================================
// Mock Exams (Deneme Sınavları) API
// ==========================================
app.get('/api/mock-exams', (req, res) => {
  const { studentId } = req.query
  const list = getMockExams(studentId)
  res.json(list)
})

app.post('/api/mock-exams', (req, res) => {
  const {
    studentId,
    studentName,
    examTitle,
    publisher,
    date,
    examType,
    subjects,
    qCount,
    correct,
    wrong,
    empty,
    durationMinutes,
    studentNote,
    questionPhotos
  } = req.body

  if (!studentId || !examTitle) {
    return res.status(400).json({ error: 'Öğrenci kimliği ve deneme adı gereklidir.' })
  }

  const newExam = addMockExam({
    studentId,
    studentName: studentName || (studentId === 'mete' ? 'Mete' : 'Ege'),
    examTitle: examTitle.trim(),
    publisher: publisher || 'Kurumsal Deneme',
    date: date || new Date().toISOString().split('T')[0],
    examType: examType || (subjects && subjects.length > 1 ? 'general' : 'single'),
    subjects: subjects || [],
    qCount: Number(qCount) || 30,
    correct: Number(correct) || 0,
    wrong: Number(wrong) || 0,
    empty: empty !== undefined ? Number(empty) : undefined,
    durationMinutes: Number(durationMinutes) || 120,
    studentNote: studentNote || '',
    questionPhotos: questionPhotos || []
  })

  // If mock exam has question photos, also add to unsolved questions and sync to Google Drive
  if (questionPhotos && Array.isArray(questionPhotos) && questionPhotos.length > 0) {
    questionPhotos.forEach((photo, idx) => {
      const qRecord = addUnsolvedQuestion({
        studentId: newExam.studentId,
        studentName: newExam.studentName,
        bookTitle: newExam.publisher || 'Deneme Sınavı',
        themeName: 'Deneme Sınavı',
        topicName: newExam.examTitle,
        testTitle: newExam.examTitle,
        testNum: 'Deneme',
        questionNo: photo.questionNo || `Soru ${idx + 1}`,
        note: photo.note || (newExam.studentNote ? `Deneme Notu: ${newExam.studentNote}` : ''),
        imageUrl: photo.url || photo.imageUrl
      })
      syncPhotoToGoogleDrive(qRecord).catch(err => {
        console.error('[Google Drive Sync Error in Mock Exam Question]:', err.message)
      })
    })
  }

  res.status(201).json({ success: true, exam: newExam })
})

app.put('/api/mock-exams/:id', (req, res) => {
  const updated = updateMockExam(req.params.id, req.body)
  if (!updated) {
    return res.status(404).json({ error: 'Deneme sınavı kaydı bulunamadı.' })
  }
  res.json({ success: true, exam: updated })
})

app.delete('/api/mock-exams/:id', (req, res) => {
  const deleted = deleteMockExam(req.params.id)
  if (!deleted) {
    return res.status(404).json({ error: 'Deneme sınavı kaydı bulunamadı.' })
  }
  res.json({ success: true })
})

// Submit test result
app.post('/api/submissions', (req, res) => {
  const {
    studentId,
    assignmentId,
    testId,
    bookId,
    themeName,
    topicName,
    testTitle,
    testNum,
    pages,
    date,
    qCount,
    correct,
    wrong,
    empty,
    durationMinutes,
    mode,
    answers,
    studentNote,
    questionPhotos
  } = req.body

  if (!studentId) {
    return res.status(400).json({ error: 'Öğrenci kimliği (studentId) gereklidir.' })
  }

  const submission = addSubmission({
    studentId,
    assignmentId: assignmentId || null,
    testId,
    bookId,
    themeName,
    topicName,
    testTitle,
    testNum,
    pages,
    date: date || new Date().toISOString().split('T')[0],
    qCount: Number(qCount) || 12,
    correct: Number(correct) || 0,
    wrong: Number(wrong) || 0,
    empty: Number(empty) || 0,
    durationMinutes: Number(durationMinutes) || 15,
    mode: mode || 'quick',
    answers: answers || [],
    studentNote: studentNote || '',
    questionPhotos: questionPhotos || []
  })

  // Asynchronously sync any unsolved question photos from this submission to Google Drive
  if (questionPhotos && Array.isArray(questionPhotos) && questionPhotos.length > 0) {
    const db = readDB()
    const newlyCreated = (db.unsolvedQuestions || []).filter(q => q.submissionId === submission.id)
    newlyCreated.forEach(q => {
      syncPhotoToGoogleDrive(q).catch(err => {
        console.error('[Google Drive Sync Error in Submission Question]:', err.message)
      })
    })
  }

  res.status(201).json({ success: true, submission })
})

// Teacher feedback on submission
app.put('/api/submissions/:id/feedback', (req, res) => {
  const { feedback } = req.body
  const db = readDB()
  const sub = db.submissions.find(s => s.id === req.params.id)
  if (!sub) return res.status(404).json({ error: 'Test girişi bulunamadı' })

  sub.teacherFeedback = feedback
  writeDB(db)
  res.json({ success: true, submission: sub })
})

// Analytics for student
app.get('/api/analytics/:studentId', (req, res) => {
  const data = computeStudentAnalytics(req.params.studentId)
  if (!data) return res.status(404).json({ error: 'Öğrenci bulunamadı' })
  res.json(data)
})

// Comparative Analytics (Mete vs Ege)
app.get('/api/analytics/compare/both', (req, res) => {
  const data = computeComparisonAnalytics()
  res.json(data)
})

// Teacher Dashboard Overview with rich detailed stats and unsolved questions
app.get('/api/teacher/overview', (req, res) => {
  const db = readDB()
  const today = new Date().toISOString().split('T')[0]
  const startDate = (db.settings && db.settings.startDate) || '2026-10-05'

  let activeDate = today
  if (today < startDate) {
    activeDate = startDate
  }

  const meteToday = db.assignments.find(a => a.studentId === 'mete' && a.date === activeDate) || db.assignments.find(a => a.studentId === 'mete')
  const egeToday = db.assignments.find(a => a.studentId === 'ege' && a.date === activeDate) || db.assignments.find(a => a.studentId === 'ege')

  const meteSub = meteToday && meteToday.submissionId ? db.submissions.find(s => s.id === meteToday.submissionId) : null
  const egeSub = egeToday && egeToday.submissionId ? db.submissions.find(s => s.id === egeToday.submissionId) : null

  const meteAnalytics = computeStudentAnalytics('mete')
  const egeAnalytics = computeStudentAnalytics('ege')
  const comparison = computeComparisonAnalytics()
  const unsolvedQuestions = getUnsolvedQuestions()
  const mockExams = getMockExams()

  res.json({
    today: activeDate,
    systemDate: today,
    startDate,
    settings: db.settings,
    students: db.students,
    mete: {
      student: db.students.find(s => s.id === 'mete'),
      todayAssignment: meteToday ? { ...meteToday, submission: meteSub } : null,
      totalCompleted: db.submissions.filter(s => s.studentId === 'mete').length,
      mockExamsCount: mockExams.filter(m => m.studentId === 'mete').length
    },
    ege: {
      student: db.students.find(s => s.id === 'ege'),
      todayAssignment: egeToday ? { ...egeToday, submission: egeSub } : null,
      totalCompleted: db.submissions.filter(s => s.studentId === 'ege').length,
      mockExamsCount: mockExams.filter(m => m.studentId === 'ege').length
    },
    meteAnalytics,
    egeAnalytics,
    comparison,
    unsolvedQuestions,
    unsolvedPendingCount: unsolvedQuestions.filter(q => q.status === 'pending').length,
    mockExams,
    teacherNotes: db.teacherNotes || [],
    recentSubmissions: db.submissions.slice().reverse().slice(0, 15)
  })
})

// Add Teacher Note
app.post('/api/teacher/notes', (req, res) => {
  const { title, content } = req.body
  const db = readDB()
  const note = {
    id: `note-${Date.now()}`,
    title,
    content,
    date: new Date().toISOString().split('T')[0]
  }
  if (!db.teacherNotes) db.teacherNotes = []
  db.teacherNotes.unshift(note)
  writeDB(db)
  res.status(201).json(note)
})

// Teacher PIN authentication
app.post('/api/auth/teacher-pin', (req, res) => {
  const { pin } = req.body
  const db = readDB()
  const teacherPin = (db.settings && db.settings.teacherPin) || '2026'
  if (pin === teacherPin) {
    return res.json({ success: true, token: 'teacher-auth-token-valid' })
  }
  return res.status(401).json({ success: false, error: 'Hatalı öğretmen PIN kodu.' })
})

// Student individual PIN verification
app.post('/api/auth/student-pin', (req, res) => {
  const { studentId, pin } = req.body
  if (!studentId || !pin) {
    return res.status(400).json({ success: false, error: 'Öğrenci ve şifre gereklidir.' })
  }
  const isValid = verifyStudentPin(studentId, pin)
  if (isValid) {
    return res.json({ success: true, studentId })
  }
  return res.status(401).json({ success: false, error: 'Hatalı öğrenci şifresi.' })
})

// Teacher updates a student's individual PIN
app.put('/api/students/:id/pin', (req, res) => {
  const { pin } = req.body
  if (!pin || String(pin).trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Şifre en az 2 karakter olmalıdır.' })
  }
  const updated = updateStudentPin(req.params.id, pin)
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Öğrenci bulunamadı.' })
  }
  return res.json({ success: true, studentId: req.params.id, pin: updated.pin })
})

// ==========================================
// Settings & Google Drive & WhatsApp APIs
// ==========================================
app.get('/api/settings', (req, res) => {
  const settings = getSettings()
  res.json(settings)
})

app.put('/api/settings', (req, res) => {
  const {
    googleAppsScriptUrl,
    whatsAppGroupName,
    whatsAppDailyTime,
    whatsAppWebhookUrl,
    teacherPin
  } = req.body
  const updates = {}
  if (googleAppsScriptUrl !== undefined) updates.googleAppsScriptUrl = String(googleAppsScriptUrl).trim()
  if (whatsAppGroupName !== undefined) updates.whatsAppGroupName = String(whatsAppGroupName).trim()
  if (whatsAppDailyTime !== undefined) updates.whatsAppDailyTime = String(whatsAppDailyTime).trim()
  if (whatsAppWebhookUrl !== undefined) updates.whatsAppWebhookUrl = String(whatsAppWebhookUrl).trim()
  if (teacherPin !== undefined && String(teacherPin).trim().length >= 4) updates.teacherPin = String(teacherPin).trim()

  const updated = updateSettings(updates)
  res.json({ success: true, settings: updated })
})

// Test connection to Google Apps Script Web App
app.post('/api/settings/test-google-drive', async (req, res) => {
  try {
    const targetUrl = (req.body.url || getSettings().googleAppsScriptUrl || '').trim()
    if (!targetUrl) {
      return res.status(400).json({ success: false, error: 'Lütfen geçerli bir Google Apps Script Web Uygulaması URL adresi giriniz.' })
    }

    const testResp = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ping' }),
      redirect: 'follow'
    })

    const data = await testResp.json()
    if (data && (data.status === 'ok' || data.message)) {
      return res.json({
        success: true,
        message: data.message || 'Google Drive & Apps Script bağlantısı başarıyla doğrulandı!',
        rootFolder: 'mete-ege yapılamayan sorular'
      })
    } else {
      return res.status(400).json({
        success: false,
        error: data.message || 'Apps Script yanıt verdi ancak doğrulama başarısız oldu.'
      })
    }
  } catch (err) {
    console.error('Google Drive Test Connection Error:', err.message)
    return res.status(500).json({
      success: false,
      error: 'Google Apps Script adresine ulaşılamadı. Lütfen URL\'nin "Herkes (Anyone)" erişimine açık olarak yayınlandığından emin olun. Hata: ' + err.message
    })
  }
})

// Manual Sync: Sync all unsolved questions to Google Drive
app.post('/api/unsolved-questions/sync-all-to-drive', async (req, res) => {
  try {
    const list = getUnsolvedQuestions()
    let count = 0
    let failed = 0

    for (const q of list) {
      if (!q.driveFileUrl || req.body.force) {
        const result = await syncPhotoToGoogleDrive(q)
        if (result.synced) count++
        else failed++
      }
    }

    res.json({
      success: true,
      total: list.length,
      syncedCount: count,
      failedCount: failed,
      message: `${count} adet soru fotoğrafı Google Drive'a ("mete-ege yapılamayan sorular") senkronize edildi.`
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Daily WhatsApp Message Generator (Saat 16:00)
app.get('/api/whatsapp/daily-message', (req, res) => {
  const { date } = req.query
  const msgObj = formatWhatsAppDailyMessage(date)
  res.json(msgObj)
})

// Trigger sending daily WhatsApp message to Webhook
app.post('/api/whatsapp/send-webhook', async (req, res) => {
  try {
    const settings = getSettings()
    const targetWebhookUrl = (req.body.webhookUrl || settings.whatsAppWebhookUrl || '').trim()
    const targetDate = req.body.date || null

    if (!targetWebhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'Lütfen geçerli bir WhatsApp Webhook URL adresi giriniz.'
      })
    }

    const msgObj = formatWhatsAppDailyMessage(targetDate)
    const payload = {
      message: msgObj.message,
      text: msgObj.message,
      body: msgObj.message,
      date: msgObj.date,
      dateFormatted: msgObj.dateFormatted,
      group: settings.whatsAppGroupName || 'Mete & Ege 9. Sınıf',
      timestamp: new Date().toISOString()
    }

    const webhookResp = await fetch(targetWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const respText = await webhookResp.text()
    return res.json({
      success: true,
      statusCode: webhookResp.status,
      response: respText,
      message: 'Günün ödev bildirimi WhatsApp Webhook adresinize başarıyla iletildi.'
    })
  } catch (err) {
    console.error('WhatsApp Webhook dispatch error:', err)
    return res.status(500).json({
      success: false,
      error: 'WhatsApp Webhook iletimi başarısız: ' + err.message
    })
  }
})

// Serve frontend in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist')
app.use(express.static(frontendDist))

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(frontendDist, 'index.html'), err => {
    if (err) res.status(404).send('Web arayüzü henüz derlenmedi veya geliştirme modunda.')
  })
})

app.listen(PORT, () => {
  console.log(`Backend API sunucusu http://localhost:${PORT} üzerinde çalışıyor`)
})
