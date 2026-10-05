import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.join(__dirname, '..', 'data')
const DB_FILE = path.join(DB_DIR, 'database.json')
const CURRICULUM_FILE = path.join(__dirname, '..', 'curriculum_data.json')

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

// Load curriculum catalog
let curriculumData = []
try {
  curriculumData = JSON.parse(fs.readFileSync(CURRICULUM_FILE, 'utf-8'))
} catch (e) {
  console.warn('Could not read curriculum_data.json:', e.message)
}

/**
 * Helper to compute date formatted as YYYY-MM-DD
 */
export function getScheduledDate(startDateStr, dayIndex) {
  const [year, month, day] = startDateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  d.setDate(d.getDate() + dayIndex)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dt = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dt}`
}

/**
 * Builds the unified 304-test curriculum:
 * Both books (ÇAP Plus and Orijinal) interleaved subtopic-by-subtopic in pedagogical sequence:
 * 1. ÇAP Plus: Öğreniyorum (Konu Kavrama)
 * 2. Orijinal: Temel Kabul & Süreç Kontrol (Pekiştirme ve Uygulama)
 * 3. ÇAP Plus: Pekiştiriyorum
 * 4. Orijinal: Beceri Temelli ve Tema Testleri
 * When a subtopic completes, both books advance together to the next subtopic!
 */
export function buildUnifiedCurriculum() {
  const cap = curriculumData.find(b => b.id === 'cap-9')
  const orig = curriculumData.find(b => b.id === 'orijinal-9')
  const unified = []

  // Collect all unique subtopics in pedagogical order
  const subtopicMap = new Map()

  function registerSubtopics(book) {
    if (!book) return
    for (const theme of book.themes) {
      const subs = theme.subtopics || theme.topics || []
      for (const s of subs) {
        if (!subtopicMap.has(s.id)) {
          subtopicMap.set(s.id, {
            id: s.id,
            name: s.name,
            themeId: theme.id,
            themeName: theme.name
          })
        }
      }
    }
  }

  registerSubtopics(orig)
  registerSubtopics(cap)

  // Sort subtopics by theme index and subtopic index (e.g. sub-1-1, sub-1-2, ..., sub-7-2)
  const sortedSubtopicKeys = Array.from(subtopicMap.keys()).sort((a, b) => {
    const [, tA, sA] = a.split('-').map(Number)
    const [, tB, sB] = b.split('-').map(Number)
    if (tA !== tB) return tA - tB
    return sA - sB
  })

  // For each subtopic, interleave ÇAP Plus and Orijinal tests
  for (const sk of sortedSubtopicKeys) {
    let capTests = []
    let capTheme = null
    let capSub = null
    if (cap) {
      for (const t of cap.themes) {
        const found = (t.subtopics || t.topics || []).find(s => s.id === sk)
        if (found) {
          capTheme = t
          capSub = found
          capTests = found.tests || []
          break
        }
      }
    }

    let origTests = []
    let origTheme = null
    let origSub = null
    if (orig) {
      for (const t of orig.themes) {
        const found = (t.subtopics || t.topics || []).find(s => s.id === sk)
        if (found) {
          origTheme = t
          origSub = found
          origTests = found.tests || []
          break
        }
      }
    }

    const maxLen = Math.max(capTests.length, origTests.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < capTests.length) {
        const test = capTests[i]
        const isOgr = (test.num || '').includes('Öğreniyorum')
        const isPek = (test.num || '').includes('Pekiştiriyorum')
        unified.push({
          bookId: cap.id,
          bookTitle: cap.title,
          bookShort: cap.short_title,
          themeId: capTheme.id,
          themeName: capTheme.name,
          subtopicId: sk,
          topicName: capSub.name,
          testId: test.id,
          testNum: test.num,
          testTitle: test.title,
          pages: test.pages,
          qCount: test.q_count || 12,
          stage: isOgr ? 'Kavrama & Öğrenme (ÇAP Plus)' : isPek ? 'Pekiştirme (ÇAP Plus)' : 'Tema Tarama (ÇAP Plus)',
          difficulty: isOgr ? 'Temel Düzey' : 'Orta Düzey'
        })
      }
      if (i < origTests.length) {
        const test = origTests[i]
        const isTK = (test.num || '').includes('Temel Kabul')
        const isBeceri = (test.title || '').includes('Beceri')
        unified.push({
          bookId: orig.id,
          bookTitle: orig.title,
          bookShort: orig.short_title,
          themeId: origTheme.id,
          themeName: origTheme.name,
          subtopicId: sk,
          topicName: origSub.name,
          testId: test.id,
          testNum: test.num,
          testTitle: test.title,
          pages: test.pages,
          qCount: test.q_count || 12,
          stage: isTK ? 'Hazırbulunuşluk (Orijinal)' : isBeceri ? 'Beceri Temelli (Orijinal)' : 'Süreç Kontrol (Orijinal)',
          difficulty: isTK ? 'Temel Düzey' : 'Orta-İleri Düzey'
        })
      }
    }
  }

  return unified
}

/**
 * Maps 304 unified tests into calendar schedule:
 * Weekdays (Monday-Friday): 1 test/day
 * Weekends (Saturday-Sunday): 2 tests/day
 * Result: 304 tests completed in exactly 237 calendar days (2026-10-05 to 2027-05-29)
 */
export function generateAcceleratedSchedule(unifiedList, startDateStr = '2026-10-05') {
  const [year, month, day] = startDateStr.split('-').map(Number)
  let curr = new Date(year, month - 1, day)
  const schedule = []

  let testIdx = 0
  let calendarDay = 1

  while (testIdx < unifiedList.length) {
    const y = curr.getFullYear()
    const m = String(curr.getMonth() + 1).padStart(2, '0')
    const dt = String(curr.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${dt}`
    const dow = curr.getDay() // 0: Sun, 1: Mon, ..., 5: Fri, 6: Sat
    const isWeekend = (dow === 0 || dow === 6)
    const dailyQuota = isWeekend ? 2 : 1
    const take = Math.min(dailyQuota, unifiedList.length - testIdx)

    for (let slot = 0; slot < take; slot++) {
      schedule.push({
        test: unifiedList[testIdx],
        testOrder: testIdx + 1, // 1 to 304
        date: dateStr,
        dayNumber: calendarDay,
        totalCalendarDays: 237,
        isWeekend,
        dailyIndex: slot + 1, // 1 or 2
        dailyTotal: take, // 1 or 2
        dailySlotName: isWeekend
          ? (slot === 0 ? 'Hafta Sonu: 1. Test (Öğlen Öncesi)' : 'Hafta Sonu: 2. Test (Öğleden Sonra)')
          : 'Hafta İçi: Günün Testi'
      })
      testIdx++
    }

    calendarDay++
    if (testIdx >= unifiedList.length) break
    curr.setDate(curr.getDate() + 1)
  }

  return schedule
}

// Initial Database Structure
export function getInitialData() {
  const START_DATE = '2026-10-05'
  const END_DATE = '2027-05-29'
  const TOTAL_TESTS = 304
  const TOTAL_CALENDAR_DAYS = 237

  const students = [
    {
      id: 'mete',
      name: 'Mete',
      school: 'Fen Lisesi',
      grade: '9. Sınıf',
      role: 'student',
      avatar: '👨‍🎓',
      accentColor: '#f97316',
      badge: '9. Sınıf Matematik | ÇAP & Orijinal',
      assignedBooks: ['cap-9', 'orijinal-9'],
      assignedBookTitle: 'ÇAP Plus & Orijinal Matematik (304 Test • 237 Gün)',
      streakDays: 0,
      targetScore: 90,
      startDate: START_DATE,
      endDate: END_DATE,
      totalAssignedTests: TOTAL_TESTS,
      totalCalendarDays: TOTAL_CALENDAR_DAYS,
      scheduleRule: 'Hafta içi 1, Hafta sonu 2 Test',
      pin: '1234', // Mete'nin bireysel şifresi
      privateToken: 'mete-token-2026'
    },
    {
      id: 'ege',
      name: 'Ege',
      school: 'Anadolu Lisesi',
      grade: '9. Sınıf',
      role: 'student',
      avatar: '🧑‍🎓',
      accentColor: '#3b82f6',
      badge: '9. Sınıf Matematik | ÇAP & Orijinal',
      assignedBooks: ['cap-9', 'orijinal-9'],
      assignedBookTitle: 'ÇAP Plus & Orijinal Matematik (304 Test • 237 Gün)',
      streakDays: 0,
      targetScore: 85,
      startDate: START_DATE,
      endDate: END_DATE,
      totalAssignedTests: TOTAL_TESTS,
      totalCalendarDays: TOTAL_CALENDAR_DAYS,
      scheduleRule: 'Hafta içi 1, Hafta sonu 2 Test',
      pin: '5678', // Ege'nin bireysel şifresi
      privateToken: 'ege-token-2026'
    }
  ]

  const unifiedList = buildUnifiedCurriculum()
  const scheduledItems = generateAcceleratedSchedule(unifiedList, START_DATE)
  const assignments = []
  const submissions = []

  // Generate 304 assignments for each student mapped to 237 calendar days
  students.forEach(student => {
    scheduledItems.forEach(item => {
      const asgnId = `asgn_${student.id}_${item.testOrder}`
      const test = item.test

      assignments.push({
        id: asgnId,
        studentId: student.id,
        testOrder: item.testOrder,
        dayNumber: item.dayNumber, // 1 to 237
        totalDays: TOTAL_CALENDAR_DAYS, // 237
        totalTests: TOTAL_TESTS, // 304
        date: item.date,
        isWeekend: item.isWeekend,
        dailyIndex: item.dailyIndex, // 1 or 2
        dailyTotal: item.dailyTotal, // 1 or 2
        dailySlotName: item.dailySlotName,
        bookId: test.bookId,
        bookTitle: test.bookTitle,
        bookShort: test.bookShort,
        themeName: test.themeName,
        topicName: test.topicName,
        testId: test.testId,
        testNum: test.testNum,
        testTitle: test.testTitle,
        pages: test.pages,
        qCount: test.qCount,
        stage: test.stage,
        difficulty: test.difficulty,
        status: 'pending',
        submissionId: null,
        teacherNote: item.isWeekend
          ? 'Hafta sonu programı (Günde 2 test): Süre tutarak çözünüz, takıldığınız soruları derste incelemek üzere işaretleyiniz.'
          : 'Hafta içi programı (Günde 1 test): Süre tutarak çözünüz, takıldığınız soruları derste incelemek üzere işaretleyiniz.'
      })
    })
  })

  return {
    students,
    books: curriculumData,
    unifiedCurriculum: unifiedList,
    assignments,
    submissions,
    unsolvedQuestions: [],
    mockExams: [],
    teacherNotes: [
      {
        id: 'note-1',
        title: '2026-2027 Maarif Modeli Matematik Hızlandırılmış Programı',
        content: 'Program 5 Ekim 2026 Pazartesi günü başladı. Hafta içi günde 1 test, hafta sonları günde 2 test (haftalık 9 test) kuralıyla toplam 304 test, okullar kapanmadan önce 29 Mayıs 2027 Cumartesi günü (237 günde) tamamlanacaktır. Mete ve Ege için ÇAP Plus ve Orijinal kitapları alt konu düzeyinde senkronize şekilde dönüşümlü ilerlemektedir.',
        date: START_DATE
      }
    ],
    settings: {
      dailyScheduleRule: 'Hafta İçi 1 Test, Hafta Sonu 2 Test',
      weekdayLimit: 1,
      weekendLimit: 2,
      startDate: START_DATE,
      endDate: END_DATE,
      totalTests: TOTAL_TESTS,
      totalDays: TOTAL_CALENDAR_DAYS,
      schoolYear: '2026-2027',
      allowWeekendTests: true,
      skipActivities: true,
      teacherPin: '2026',
      googleAppsScriptUrl: '',
      whatsAppGroupName: 'Mete & Ege 9. Sınıf',
      whatsAppDailyTime: '16:00'
    }
  }
}

// Read database
export function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData()
    writeDB(initial)
    return initial
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8')
    const parsed = JSON.parse(content)
    // Validate if existing database has 237 days and 29 Mayıs 2027 finish
    if (!parsed.assignments || parsed.assignments.length !== 608 || parsed.settings?.endDate !== '2027-05-29' || parsed.settings?.startDate !== '2026-10-05') {
      console.log('Regenerating database with weekday 1 / weekend 2 tests ending 29 May 2027...')
      const initial = getInitialData()
      writeDB(initial)
      return initial
    }
    if (!parsed.unsolvedQuestions) {
      parsed.unsolvedQuestions = []
    }
    if (!parsed.mockExams) {
      parsed.mockExams = []
    }
    if (!parsed.settings) {
      parsed.settings = {}
    }
    if (parsed.settings.googleAppsScriptUrl === undefined) {
      parsed.settings.googleAppsScriptUrl = ''
    }
    if (parsed.settings.whatsAppDailyTime === undefined) {
      parsed.settings.whatsAppDailyTime = '16:00'
    }
    if (parsed.settings.whatsAppGroupName === undefined) {
      parsed.settings.whatsAppGroupName = 'Mete & Ege 9. Sınıf'
    }
    return parsed
  } catch (e) {
    console.error('Error reading database, creating new:', e.message)
    const initial = getInitialData()
    writeDB(initial)
    return initial
  }
}

// Write database atomically
export function writeDB(data) {
  const tempFile = `${DB_FILE}.tmp`
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8')
  fs.renameSync(tempFile, DB_FILE)
}

// Helper methods
export function getStudents() {
  return readDB().students
}

export function getBooks() {
  return readDB().books
}

export function updateStudentPin(studentId, newPin) {
  const db = readDB()
  const student = db.students.find(s => s.id === studentId)
  if (!student) return null
  student.pin = String(newPin).trim()
  writeDB(db)
  return student
}

export function verifyStudentPin(studentId, pin) {
  const db = readDB()
  const student = db.students.find(s => s.id === studentId)
  if (!student) return false
  return String(student.pin).trim() === String(pin).trim()
}

export function getAssignments(studentId, date = null) {
  const db = readDB()
  let list = db.assignments
  if (studentId) {
    list = list.filter(a => a.studentId === studentId)
  }
  if (date) {
    list = list.filter(a => a.date === date)
  }
  return list
}

export function getSubmissions(studentId) {
  const db = readDB()
  let list = db.submissions
  if (studentId) {
    list = list.filter(s => s.studentId === studentId)
  }
  return list.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function addSubmission(submissionData) {
  const db = readDB()
  const subId = `sub_${Date.now()}`
  const newSub = {
    id: subId,
    submittedAt: new Date().toISOString(),
    ...submissionData
  }

  // Calculate Net and Score if not provided
  if (newSub.net === undefined) {
    newSub.net = parseFloat((newSub.correct - (newSub.wrong / 4)).toFixed(2))
  }
  if (newSub.scorePercent === undefined && newSub.qCount > 0) {
    newSub.scorePercent = Math.round((newSub.correct / newSub.qCount) * 100)
  }

  // Process and link uploaded question photos
  if (newSub.questionPhotos && Array.isArray(newSub.questionPhotos) && newSub.questionPhotos.length > 0) {
    if (!db.unsolvedQuestions) db.unsolvedQuestions = []
    newSub.questionPhotos.forEach((photo, idx) => {
      const qId = photo.id || `q_${Date.now()}_${idx}`
      if (!db.unsolvedQuestions.some(q => q.id === qId)) {
        db.unsolvedQuestions.unshift({
          id: qId,
          submissionId: subId,
          studentId: newSub.studentId,
          studentName: newSub.studentId === 'mete' ? 'Mete' : 'Ege',
          testId: newSub.testId,
          assignmentId: newSub.assignmentId,
          bookTitle: newSub.bookTitle,
          themeName: newSub.themeName,
          topicName: newSub.topicName,
          testTitle: newSub.testTitle,
          testNum: newSub.testNum,
          pages: newSub.pages,
          questionNo: photo.questionNo || `Soru ${idx + 1}`,
          note: photo.note || '',
          imageUrl: photo.url || photo.imageUrl,
          createdAt: new Date().toISOString(),
          status: 'pending', // 'pending' | 'reviewed' | 'resolved'
          teacherReply: '',
          teacherReplyAt: null
        })
      }
    })
  }

  db.submissions.push(newSub)

  // Update corresponding assignment if exists
  if (newSub.assignmentId) {
    const asgn = db.assignments.find(a => a.id === newSub.assignmentId)
    if (asgn) {
      asgn.status = 'completed'
      asgn.submissionId = subId
      if (newSub.qCount) asgn.qCount = newSub.qCount
    }
  } else {
    // Check if there is an assignment matching student, date, and testId
    const asgn = db.assignments.find(
      a => a.studentId === newSub.studentId && a.date === newSub.date
    )
    if (asgn) {
      asgn.status = 'completed'
      asgn.submissionId = subId
      if (newSub.qCount) asgn.qCount = newSub.qCount
    }
  }

  // Update student streak
  const student = db.students.find(s => s.id === newSub.studentId)
  if (student) {
    student.streakDays = (student.streakDays || 0) + 1
  }

  writeDB(db)
  return newSub
}

// Unsolved Questions Management
export function getUnsolvedQuestions(studentId = null) {
  const db = readDB()
  if (!db.unsolvedQuestions) db.unsolvedQuestions = []
  let list = db.unsolvedQuestions
  if (studentId) {
    list = list.filter(q => q.studentId === studentId)
  }
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function addUnsolvedQuestion(questionData) {
  const db = readDB()
  if (!db.unsolvedQuestions) db.unsolvedQuestions = []
  const newQ = {
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'pending', // 'pending' | 'reviewed' | 'resolved'
    teacherReply: '',
    teacherReplyAt: null,
    ...questionData
  }
  db.unsolvedQuestions.unshift(newQ)
  writeDB(db)
  return newQ
}

export function updateUnsolvedQuestion(id, updates) {
  const db = readDB()
  if (!db.unsolvedQuestions) db.unsolvedQuestions = []
  const idx = db.unsolvedQuestions.findIndex(q => q.id === id)
  if (idx === -1) return null

  db.unsolvedQuestions[idx] = {
    ...db.unsolvedQuestions[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  writeDB(db)
  return db.unsolvedQuestions[idx]
}

export function deleteUnsolvedQuestion(id) {
  const db = readDB()
  if (!db.unsolvedQuestions) db.unsolvedQuestions = []
  const idx = db.unsolvedQuestions.findIndex(q => q.id === id)
  if (idx === -1) return false
  db.unsolvedQuestions.splice(idx, 1)
  writeDB(db)
  return true
}

// Mock Exams (Deneme Sınavları) Management
export function getMockExams(studentId = null) {
  const db = readDB()
  if (!db.mockExams) db.mockExams = []
  let list = db.mockExams
  if (studentId) {
    list = list.filter(e => e.studentId === studentId)
  }
  return list.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function addMockExam(examData) {
  const db = readDB()
  if (!db.mockExams) db.mockExams = []
  const examId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

  let newExam
  let subjects = examData.subjects

  if (Array.isArray(subjects) && subjects.length > 0) {
    let totalCorrect = 0
    let totalWrong = 0
    let totalEmpty = 0
    let totalQCount = 0
    let totalNet = 0
    let mathNet = null
    let mathQCount = null

    const processedSubjects = subjects.map(sub => {
      const sq = Number(sub.qCount) || 0
      const sc = Number(sub.correct) || 0
      const sw = Number(sub.wrong) || 0
      const se = sub.empty !== undefined ? Number(sub.empty) : Math.max(0, sq - sc - sw)
      const snet = Math.max(0, parseFloat((sc - (sw / 4)).toFixed(2)))
      const spct = sq > 0 ? Math.round((snet / sq) * 100) : 0

      totalQCount += sq
      totalCorrect += sc
      totalWrong += sw
      totalEmpty += se
      totalNet += snet

      if (sub.name?.toLowerCase().includes('mat') || sub.key === 'matematik' || sub.key === 'mat') {
        mathNet = snet
        mathQCount = sq
      }

      return {
        key: sub.key || sub.name?.toLowerCase().replace(/\s+/g, '_'),
        name: sub.name,
        qCount: sq,
        correct: sc,
        wrong: sw,
        empty: se,
        net: snet,
        scorePercent: spct
      }
    })

    totalNet = parseFloat(totalNet.toFixed(2))
    const overallScorePercent = totalQCount > 0 ? Math.round((totalNet / totalQCount) * 100) : 0

    newExam = {
      id: examId,
      createdAt: new Date().toISOString(),
      examType: examData.examType || (processedSubjects.length > 1 ? 'general' : 'single'),
      ...examData,
      subjects: processedSubjects,
      qCount: totalQCount,
      correct: totalCorrect,
      wrong: totalWrong,
      empty: totalEmpty,
      net: totalNet,
      scorePercent: overallScorePercent,
      mathNet: mathNet !== null ? mathNet : totalNet,
      mathQCount: mathQCount !== null ? mathQCount : totalQCount
    }
  } else {
    // Single subject / default
    const c = Number(examData.correct) || 0
    const w = Number(examData.wrong) || 0
    const qCount = Number(examData.qCount) || 30
    const net = Math.max(0, parseFloat((c - (w / 4)).toFixed(2)))
    const scorePercent = qCount > 0 ? Math.round((net / qCount) * 100) : 0

    newExam = {
      id: examId,
      createdAt: new Date().toISOString(),
      examType: examData.examType || 'single',
      ...examData,
      subjects: [
        {
          key: 'matematik',
          name: 'Matematik',
          qCount,
          correct: c,
          wrong: w,
          empty: Number(examData.empty) !== undefined ? Number(examData.empty) : Math.max(0, qCount - c - w),
          net,
          scorePercent
        }
      ],
      qCount,
      correct: c,
      wrong: w,
      empty: Number(examData.empty) !== undefined ? Number(examData.empty) : Math.max(0, qCount - c - w),
      net,
      scorePercent,
      mathNet: net,
      mathQCount: qCount
    }
  }

  // If questionPhotos are attached to the mock exam, register them into unsolvedQuestions as well
  if (newExam.questionPhotos && Array.isArray(newExam.questionPhotos) && newExam.questionPhotos.length > 0) {
    if (!db.unsolvedQuestions) db.unsolvedQuestions = []
    newExam.questionPhotos.forEach((photo, idx) => {
      const qId = photo.id || `q_mock_${Date.now()}_${idx}`
      const subjectName = photo.subject || 'Matematik'
      if (!db.unsolvedQuestions.some(q => q.id === qId)) {
        db.unsolvedQuestions.unshift({
          id: qId,
          mockExamId: examId,
          studentId: newExam.studentId,
          studentName: newExam.studentName || (newExam.studentId === 'mete' ? 'Mete' : 'Ege'),
          testId: `mock-${examId}`,
          bookTitle: `Deneme: ${newExam.publisher || 'Kurumsal Deneme'} (${subjectName})`,
          topicName: `${subjectName} Deneme Sorusu`,
          testTitle: newExam.examTitle,
          testNum: photo.questionNo || `Soru ${idx + 1}`,
          pages: 'Deneme Kitapçığı',
          questionNo: photo.questionNo || `Soru ${idx + 1}`,
          note: photo.note || '',
          imageUrl: photo.url || photo.imageUrl,
          subject: subjectName,
          createdAt: new Date().toISOString(),
          status: 'pending',
          teacherReply: '',
          teacherReplyAt: null
        })
      }
    })
  }

  db.mockExams.unshift(newExam)
  writeDB(db)
  return newExam
}

export function updateMockExam(id, updates) {
  const db = readDB()
  if (!db.mockExams) db.mockExams = []
  const idx = db.mockExams.findIndex(e => e.id === id)
  if (idx === -1) return null

  const existing = db.mockExams[idx]
  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  // If subjects changed, recalculate all totals
  if (updates.subjects && Array.isArray(updates.subjects)) {
    let totalCorrect = 0
    let totalWrong = 0
    let totalEmpty = 0
    let totalQCount = 0
    let totalNet = 0
    let mathNet = null
    let mathQCount = null

    updated.subjects = updates.subjects.map(sub => {
      const sq = Number(sub.qCount) || 0
      const sc = Number(sub.correct) || 0
      const sw = Number(sub.wrong) || 0
      const se = sub.empty !== undefined ? Number(sub.empty) : Math.max(0, sq - sc - sw)
      const snet = Math.max(0, parseFloat((sc - (sw / 4)).toFixed(2)))
      const spct = sq > 0 ? Math.round((snet / sq) * 100) : 0

      totalQCount += sq
      totalCorrect += sc
      totalWrong += sw
      totalEmpty += se
      totalNet += snet

      if (sub.name?.toLowerCase().includes('mat') || sub.key === 'matematik' || sub.key === 'mat') {
        mathNet = snet
        mathQCount = sq
      }

      return {
        key: sub.key || sub.name?.toLowerCase().replace(/\s+/g, '_'),
        name: sub.name,
        qCount: sq,
        correct: sc,
        wrong: sw,
        empty: se,
        net: snet,
        scorePercent: spct
      }
    })

    updated.qCount = totalQCount
    updated.correct = totalCorrect
    updated.wrong = totalWrong
    updated.empty = totalEmpty
    updated.net = parseFloat(totalNet.toFixed(2))
    updated.scorePercent = totalQCount > 0 ? Math.round((updated.net / totalQCount) * 100) : 0
    if (mathNet !== null) {
      updated.mathNet = mathNet
      updated.mathQCount = mathQCount
    }
  } else if (updates.correct !== undefined || updates.wrong !== undefined || updates.qCount !== undefined) {
    const c = Number(updated.correct) || 0
    const w = Number(updated.wrong) || 0
    const qCount = Number(updated.qCount) || 30
    updated.net = Math.max(0, parseFloat((c - (w / 4)).toFixed(2)))
    updated.scorePercent = qCount > 0 ? Math.round((updated.net / qCount) * 100) : 0
    updated.empty = Math.max(0, qCount - c - w)
    if (updated.subjects && updated.subjects.length === 1) {
      updated.subjects[0].correct = c
      updated.subjects[0].wrong = w
      updated.subjects[0].empty = updated.empty
      updated.subjects[0].net = updated.net
      updated.subjects[0].scorePercent = updated.scorePercent
    }
  }

  db.mockExams[idx] = updated
  writeDB(db)
  return updated
}

export function deleteMockExam(id) {
  const db = readDB()
  if (!db.mockExams) db.mockExams = []
  const idx = db.mockExams.findIndex(e => e.id === id)
  if (idx === -1) return false
  db.mockExams.splice(idx, 1)
  writeDB(db)
  return true
}

export function getSettings() {
  const db = readDB()
  return db.settings || {}
}

export function updateSettings(updates) {
  const db = readDB()
  if (!db.settings) db.settings = {}
  db.settings = {
    ...db.settings,
    ...updates
  }
  writeDB(db)
  return db.settings
}

