import { readDB } from './db.js'

const THEMES_CONFIG = [
  { id: 't1', name: '1. Tema: Sayılar', totalTests: 61 },
  { id: 't2', name: '2. Tema: Nicelikler ve Değişimler', totalTests: 31 },
  { id: 't3', name: '3. Tema: Geometrik Şekiller', totalTests: 18 },
  { id: 't4', name: '4. Tema: Eşlik ve Benzerlik', totalTests: 48 },
  { id: 't5', name: '5. Tema: Algoritma ve Bilişim', totalTests: 23 },
  { id: 't6', name: '6. Tema: İstatistiksel Araştırma Süreci', totalTests: 27 },
  { id: 't7', name: '7. Tema: Veriden Olasılığa', totalTests: 11 }
]

function normalizeTheme(name) {
  if (!name) return '1. Tema: Sayılar'
  if (name.includes('Sayılar') || name.includes('Sayilar')) return '1. Tema: Sayılar'
  if (name.includes('Nicelikler')) return '2. Tema: Nicelikler ve Değişimler'
  if (name.includes('Geometrik')) return '3. Tema: Geometrik Şekiller'
  if (name.includes('Eşlik') || name.includes('Eslik')) return '4. Tema: Eşlik ve Benzerlik'
  if (name.includes('Algoritma')) return '5. Tema: Algoritma ve Bilişim'
  if (name.includes('İstatistik') || name.includes('Istatistik')) return '6. Tema: İstatistiksel Araştırma Süreci'
  if (name.includes('Olasılık') || name.includes('Olasilik')) return '7. Tema: Veriden Olasılığa'
  return name
}

export function computeStudentAnalytics(studentId) {
  const db = readDB()
  const student = db.students.find(s => s.id === studentId)
  if (!student) return null

  const submissions = db.submissions
    .filter(s => s.studentId === studentId)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const totalTests = submissions.length
  let totalQuestions = 0
  let totalCorrect = 0
  let totalWrong = 0
  let totalEmpty = 0
  let totalNet = 0
  let totalDuration = 0

  // Topic & Theme tracking base
  const themeStats = {}
  THEMES_CONFIG.forEach(t => {
    themeStats[t.name] = {
      themeName: t.name,
      testsCompleted: 0,
      totalTestsInCurriculum: t.totalTests,
      totalQ: 0,
      correct: 0,
      wrong: 0,
      empty: 0,
      net: 0
    }
  })

  const trend = submissions.map(sub => {
    totalQuestions += sub.qCount || 0
    totalCorrect += sub.correct || 0
    totalWrong += sub.wrong || 0
    totalEmpty += sub.empty || 0
    totalNet += sub.net || 0
    totalDuration += sub.durationMinutes || 0

    // Group by normalized theme
    const theme = normalizeTheme(sub.themeName)
    if (!themeStats[theme]) {
      themeStats[theme] = {
        themeName: theme,
        testsCompleted: 0,
        totalTestsInCurriculum: 20,
        totalQ: 0,
        correct: 0,
        wrong: 0,
        empty: 0,
        net: 0
      }
    }
    themeStats[theme].testsCompleted++
    themeStats[theme].totalQ += sub.qCount || 0
    themeStats[theme].correct += sub.correct || 0
    themeStats[theme].wrong += sub.wrong || 0
    themeStats[theme].empty += sub.empty || 0
    themeStats[theme].net += sub.net || 0

    return {
      date: sub.date,
      testTitle: sub.testTitle,
      testNum: sub.testNum,
      net: sub.net,
      scorePercent: sub.scorePercent,
      durationMinutes: sub.durationMinutes,
      correct: sub.correct,
      wrong: sub.wrong,
      empty: sub.empty
    }
  })

  const avgNet = totalTests > 0 ? parseFloat((totalNet / totalTests).toFixed(2)) : 0
  const avgScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  const avgDuration = totalTests > 0 ? Math.round(totalDuration / totalTests) : 0
  const avgMinutesPerQuestion = totalQuestions > 0 ? parseFloat((totalDuration / totalQuestions).toFixed(1)) : 0

  // Format theme breakdown for all 7 themes
  const topicMastery = Object.values(themeStats).map(t => {
    const successRate = t.totalQ > 0 ? Math.round((t.correct / t.totalQ) * 100) : 0
    let status = 'Henüz Başlanmadı'
    let statusColor = 'slate'
    if (t.testsCompleted > 0) {
      if (successRate >= 85) {
        status = 'Kuvvetli'
        statusColor = 'green'
      } else if (successRate < 70) {
        status = 'Tekrar Gerekli'
        statusColor = 'red'
      } else {
        status = 'Gelişiyor'
        statusColor = 'yellow'
      }
    }
    const progressPercent = Math.min(100, Math.round((t.testsCompleted / t.totalTestsInCurriculum) * 100))

    return {
      ...t,
      avgNet: t.testsCompleted > 0 ? parseFloat((t.net / t.testsCompleted).toFixed(2)) : 0,
      successRate,
      progressPercent,
      status,
      statusColor
    }
  })

  const totalAssignedInProgram = 304
  const overallCurriculumProgress = Math.round((totalTests / totalAssignedInProgram) * 100)

  return {
    student,
    summary: {
      totalTests,
      totalAssignedInProgram,
      overallCurriculumProgress,
      totalQuestions,
      totalCorrect,
      totalWrong,
      totalEmpty,
      avgNet,
      avgScore,
      totalDurationHours: (totalDuration / 60).toFixed(1),
      avgDurationMinutes: avgDuration,
      avgMinutesPerQuestion,
      streakDays: student.streakDays || 0,
      startDate: student.startDate || '2026-10-05',
      endDate: student.endDate || '2027-05-29'
    },
    trend,
    topicMastery,
    submissions: submissions.slice().reverse()
  }
}

export function computeComparisonAnalytics() {
  const meteStats = computeStudentAnalytics('mete')
  const egeStats = computeStudentAnalytics('ege')

  return {
    mete: meteStats,
    ege: egeStats,
    comparison: {
      testsSolved: {
        mete: meteStats ? meteStats.summary.totalTests : 0,
        ege: egeStats ? egeStats.summary.totalTests : 0
      },
      avgNet: {
        mete: meteStats ? meteStats.summary.avgNet : 0,
        ege: egeStats ? egeStats.summary.avgNet : 0
      },
      avgScore: {
        mete: meteStats ? meteStats.summary.avgScore : 0,
        ege: egeStats ? egeStats.summary.avgScore : 0
      },
      streakDays: {
        mete: meteStats ? meteStats.summary.streakDays : 0,
        ege: egeStats ? egeStats.summary.streakDays : 0
      },
      progressPercent: {
        mete: meteStats ? meteStats.summary.overallCurriculumProgress : 0,
        ege: egeStats ? egeStats.summary.overallCurriculumProgress : 0
      }
    }
  }
}
