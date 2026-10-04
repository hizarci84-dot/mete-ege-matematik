import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import TodayHero from './components/TodayHero'
import AnalyticsView from './components/AnalyticsView'
import CurriculumView from './components/CurriculumView'
import CalendarView from './components/CalendarView'
import TeacherDashboard from './components/TeacherDashboard'
import TestModal from './components/TestModal'
import MockExamModal from './components/MockExamModal'
import MockExamsView from './components/MockExamsView'
import PrintReport from './components/PrintReport'
import TeacherPinModal from './components/TeacherPinModal'
import StudentPinModal from './components/StudentPinModal'
import PortalChooser from './components/PortalChooser'
import InstallAppModal from './components/InstallAppModal'
import {
  fetchStudents,
  fetchBooks,
  fetchSchedule,
  fetchToday,
  submitTest,
  fetchAnalytics,
  fetchComparison,
  fetchTeacherOverview,
  addTeacherFeedback,
  addTeacherNote,
  fetchMockExams,
  createMockExam,
  updateMockExam,
  deleteMockExam
} from './api'

export default function App() {
  const [students, setStudents] = useState([])
  const [books, setBooks] = useState([])
  const [activeStudentId, setActiveStudentId] = useState('mete')
  const [activeTab, setActiveTab] = useState('daily') // 'daily', 'analytics', 'curriculum', 'calendar'

  // Privacy & Access Control States
  const [isLockedStudent, setIsLockedStudent] = useState(false)
  const [hasSelectedPortal, setHasSelectedPortal] = useState(true)
  const [isTeacherPinModalOpen, setIsTeacherPinModalOpen] = useState(false)
  const [studentPinPrompt, setStudentPinPrompt] = useState(null) // { studentId, name, avatar }

  // Data states
  const [todayData, setTodayData] = useState(null)
  const [scheduleList, setScheduleList] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [comparisonData, setComparisonData] = useState(null)
  const [teacherOverview, setTeacherOverview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [modalAssignment, setModalAssignment] = useState(null)
  const [modalSubmission, setModalSubmission] = useState(null)
  const [isMockModalOpen, setIsMockModalOpen] = useState(false)
  const [modalMockExam, setModalMockExam] = useState(null)
  const [mockExams, setMockExams] = useState([])
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [printStudentId, setPrintStudentId] = useState('mete')
  const [printAnalyticsData, setPrintAnalyticsData] = useState(null)
  const [printMockExams, setPrintMockExams] = useState([])
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)

  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('app_theme') || 'dark'
    } catch (e) {
      return 'dark'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('app_theme', theme)
    } catch (e) {}
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme')
      document.body.classList.add('light-theme')
    } else {
      document.documentElement.classList.remove('light-theme')
      document.body.classList.remove('light-theme')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  // Active student object
  const currentStudent = students.find(s => s.id === activeStudentId) || students[0]

  const handleOpenPrintReport = async (targetStudentId = null) => {
    const sid = targetStudentId || (activeStudentId === 'ege' ? 'ege' : 'mete')
    setPrintStudentId(sid)
    setIsPrintOpen(true)
    try {
      const [data, exams] = await Promise.all([
        fetchAnalytics(sid),
        fetchMockExams(sid)
      ])
      setPrintAnalyticsData(data)
      setPrintMockExams(exams || [])
    } catch (err) {
      console.error('Print report fetch error:', err)
    }
  }

  const handleSwitchPrintStudent = async (newStudentId) => {
    setPrintStudentId(newStudentId)
    try {
      const [data, exams] = await Promise.all([
        fetchAnalytics(newStudentId),
        fetchMockExams(newStudentId)
      ])
      setPrintAnalyticsData(data)
      setPrintMockExams(exams || [])
    } catch (err) {
      console.error('Print report fetch error:', err)
    }
  }

  // Parse URL on mount for student-specific link or teacher link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash
    const student = params.get('student') || (hash.includes('student=') ? hash.split('student=')[1]?.split('&')[0] : null)
    const teacher = params.get('teacher') || params.get('portal') === 'teacher' || hash.includes('teacher')

    if (student === 'mete' || student === 'ege') {
      if (sessionStorage.getItem(`student_auth_${student}`) === 'true') {
        setActiveStudentId(student)
        setIsLockedStudent(true)
        setHasSelectedPortal(true)
      } else {
        setStudentPinPrompt({
          studentId: student,
          name: student === 'mete' ? 'Mete' : 'Ege',
          avatar: student === 'mete' ? '👨‍🎓' : '🧑‍🎓'
        })
        setHasSelectedPortal(true)
      }
    } else if (teacher) {
      if (sessionStorage.getItem('teacher_auth') === 'true') {
        setActiveStudentId('teacher')
        setIsLockedStudent(false)
        setHasSelectedPortal(true)
      } else {
        setIsTeacherPinModalOpen(true)
        setHasSelectedPortal(true)
      }
    } else {
      // If no query parameters, show the friendly PortalChooser
      setHasSelectedPortal(false)
    }
  }, [])

  // Load static resources initially
  useEffect(() => {
    async function init() {
      try {
        const [stdList, bkList, comp] = await Promise.all([
          fetchStudents(),
          fetchBooks(),
          fetchComparison()
        ])
        setStudents(stdList)
        setBooks(bkList)
        setComparisonData(comp)
      } catch (err) {
        console.error('Initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  // Refresh student-specific data whenever activeStudentId changes
  const refreshStudentData = async (studentId = activeStudentId) => {
    if (studentId === 'teacher') {
      try {
        const overview = await fetchTeacherOverview()
        setTeacherOverview(overview)
        if (overview?.mockExams) {
          setMockExams(overview.mockExams)
        }
      } catch (err) {
        console.error('Teacher data error:', err)
      }
      return
    }

    try {
      const [todayRes, schedRes, analyticsRes, mockExamsRes] = await Promise.all([
        fetchToday(studentId),
        fetchSchedule(studentId),
        fetchAnalytics(studentId),
        fetchMockExams(studentId)
      ])
      setTodayData(todayRes)
      setScheduleList(schedRes)
      setAnalyticsData(analyticsRes)
      setMockExams(mockExamsRes || [])

      // Only fetch comparison if in teacher mode or unlocked
      if (!isLockedStudent) {
        const compRes = await fetchComparison()
        setComparisonData(compRes)
      }
    } catch (err) {
      console.error('Student data fetch error:', err)
    }
  }

  useEffect(() => {
    refreshStudentData(activeStudentId)
  }, [activeStudentId, isLockedStudent])

  // Handle open test modal
  const handleOpenTestModal = (assignment, existingSubmission = null) => {
    setModalAssignment(assignment)
    setModalSubmission(existingSubmission)
    setIsTestModalOpen(true)
  }

  // Handle submit test
  const handleTestSubmitSuccess = async (payload) => {
    await submitTest(payload)
    await refreshStudentData(activeStudentId)
  }

  // Handle open mock exam modal
  const handleOpenMockModal = (exam = null) => {
    setModalMockExam(exam)
    setIsMockModalOpen(true)
  }

  // Handle submit mock exam
  const handleMockExamSubmitSuccess = async (payload) => {
    if (payload.id) {
      await updateMockExam(payload.id, payload)
    } else {
      await createMockExam(payload)
    }
    await refreshStudentData(activeStudentId)
  }

  // Handle delete mock exam
  const handleDeleteMockExam = async (examId) => {
    if (!confirm('Bu deneme sınavı kaydını silmek istediğinize emin misiniz?')) return
    await deleteMockExam(examId)
    await refreshStudentData(activeStudentId)
  }

  // Handle teacher actions
  const handleAddFeedback = async (subId, feedback) => {
    await addTeacherFeedback(subId, feedback)
    await refreshStudentData('teacher')
  }

  const handleAddNote = async (title, content) => {
    await addTeacherNote(title, content)
    await refreshStudentData('teacher')
  }

  // Portal selection handlers
  const handleSelectStudentPortal = (studentId) => {
    if (sessionStorage.getItem(`student_auth_${studentId}`) === 'true') {
      try {
        window.history.pushState(null, '', `?student=${studentId}`)
      } catch (e) {}
      setActiveStudentId(studentId)
      setIsLockedStudent(true)
      setHasSelectedPortal(true)
    } else {
      setStudentPinPrompt({
        studentId,
        name: studentId === 'mete' ? 'Mete' : 'Ege',
        avatar: studentId === 'mete' ? '👨‍🎓' : '🧑‍🎓'
      })
    }
  }

  const handleStudentPinSuccess = (studentId) => {
    try {
      window.history.pushState(null, '', `?student=${studentId}`)
    } catch (e) {}
    setActiveStudentId(studentId)
    setIsLockedStudent(true)
    setHasSelectedPortal(true)
    setStudentPinPrompt(null)
  }

  const handleTeacherPinSuccess = () => {
    try {
      window.history.pushState(null, '', '?teacher=true')
    } catch (e) {}
    setActiveStudentId('teacher')
    setIsLockedStudent(false)
    setHasSelectedPortal(true)
  }

  const handleExitLock = () => {
    try {
      window.history.pushState(null, '', window.location.pathname)
    } catch (e) {}
    setHasSelectedPortal(false)
  }

  // Upcoming assignments (next 7 days)
  const upcomingAssignments = scheduleList
    .filter(a => a.status === 'pending')
    .slice(0, 7)

  // Completed test IDs
  const completedTestIds = scheduleList
    .filter(a => a.status === 'completed' || a.submission)
    .map(a => a.testId)

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'light-theme bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'} flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200`}>
      {/* Portal Chooser Modal (Shown when no URL param is given) */}
      {!hasSelectedPortal && (
        <PortalChooser
          onSelectStudent={handleSelectStudentPortal}
          onOpenTeacherLogin={() => setIsTeacherPinModalOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />
      )}

      {/* Student Individual PIN Login Modal */}
      <StudentPinModal
        isOpen={!!studentPinPrompt}
        studentId={studentPinPrompt?.studentId}
        studentName={studentPinPrompt?.name}
        studentAvatar={studentPinPrompt?.avatar}
        onClose={() => {
          setStudentPinPrompt(null)
          if (!isLockedStudent) {
            setHasSelectedPortal(false)
          }
        }}
        onSuccess={handleStudentPinSuccess}
      />

      {/* Teacher PIN Login Modal */}
      <TeacherPinModal
        isOpen={isTeacherPinModalOpen}
        onClose={() => setIsTeacherPinModalOpen(false)}
        onSuccess={handleTeacherPinSuccess}
      />

      {/* Top Navigation & Mobile Bottom Bar */}
      <Navbar
        students={students}
        activeStudentId={activeStudentId}
        onSelectStudent={(id) => {
          setActiveStudentId(id)
          if (id === 'teacher') {
            setIsLockedStudent(false)
          }
        }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPrint={() => handleOpenPrintReport(activeStudentId === 'ege' ? 'ege' : 'mete')}
        isLockedStudent={isLockedStudent}
        onExitLock={handleExitLock}
        onOpenTeacherLogin={() => setIsTeacherPinModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Veriler yükleniyor...</p>
          </div>
        ) : activeStudentId === 'teacher' ? (
          /* Teacher Dashboard View */
          <TeacherDashboard
            teacherData={teacherOverview}
            onAddFeedback={handleAddFeedback}
            onAddNote={handleAddNote}
            onOpenTestModal={handleOpenTestModal}
            onSwitchToStudent={(sid) => {
              setActiveStudentId(sid)
              setIsLockedStudent(false)
            }}
            onPrintStudent={(sid) => handleOpenPrintReport(sid)}
          />
        ) : (
          /* Student Views based on active tab */
          <>
            {activeTab === 'daily' && (
              <TodayHero
                student={currentStudent}
                todayData={todayData}
                upcomingAssignments={upcomingAssignments}
                onOpenTestModal={handleOpenTestModal}
                onOpenUpcomingModal={(item) => handleOpenTestModal(item, null)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                analyticsData={analyticsData}
                comparisonData={comparisonData}
                activeStudent={currentStudent}
                onSelectStudent={setActiveStudentId}
                isLockedStudent={isLockedStudent}
              />
            )}

            {activeTab === 'curriculum' && (
              <CurriculumView
                books={books}
                activeStudent={currentStudent}
                onOpenTestModal={handleOpenTestModal}
                completedTestIds={completedTestIds}
              />
            )}

            {activeTab === 'mock_exams' && (
              <MockExamsView
                student={currentStudent}
                mockExams={mockExams}
                onOpenModal={handleOpenMockModal}
                onDeleteExam={handleDeleteMockExam}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                assignments={scheduleList}
                student={currentStudent}
                onOpenTestModal={handleOpenTestModal}
              />
            )}
          </>
        )}
      </main>

      {/* Test Entry Modal */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        assignment={modalAssignment}
        existingSubmission={modalSubmission}
        studentId={activeStudentId === 'teacher' ? 'mete' : activeStudentId}
        onSubmitSuccess={handleTestSubmitSuccess}
      />

      {/* Mock Exam (Deneme Sınavı) Entry / Edit Modal */}
      <MockExamModal
        isOpen={isMockModalOpen}
        onClose={() => {
          setIsMockModalOpen(false)
          setModalMockExam(null)
        }}
        existingExam={modalMockExam}
        studentId={activeStudentId === 'teacher' ? 'mete' : activeStudentId}
        studentName={currentStudent?.name}
        onSubmitSuccess={handleMockExamSubmitSuccess}
      />

      {/* Printable Report Modal (Aşağı kaydırma çubuğu ve öğrenci seçimi aktif) */}
      {isPrintOpen && (
        <PrintReport
          student={students.find(s => s.id === printStudentId) || currentStudent}
          analyticsData={printAnalyticsData || analyticsData}
          mockExams={printMockExams.length > 0 ? printMockExams : mockExams}
          onClose={() => setIsPrintOpen(false)}
          onSwitchStudent={handleSwitchPrintStudent}
          allStudents={students}
        />
      )}

      {/* PWA Mobile App Install Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-400">
        <p>
          Mete (Fen Lisesi) & Ege (Anadolu Lisesi) — Maarif Modeli 9. Sınıf Matematik Özel Ders Platformu
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Program: 5 Ekim 2026 — 29 Mayıs 2027 • 237 Gün (Hafta İçi 1, Hafta Sonu 2 Test) • ÇAP Plus (127 Test) & Orijinal (177 Test)
        </p>
      </footer>
    </div>
  )
}
