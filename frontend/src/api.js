const API_BASE = '/api'

export async function fetchStudents() {
  const res = await fetch(`${API_BASE}/students`)
  return res.json()
}

export async function fetchBooks() {
  const res = await fetch(`${API_BASE}/books`)
  return res.json()
}

export async function fetchSchedule(studentId, date = null, month = null) {
  let url = `${API_BASE}/schedule?studentId=${studentId}`
  if (date) url += `&date=${date}`
  if (month) url += `&month=${month}`
  const res = await fetch(url)
  return res.json()
}

export async function fetchToday(studentId) {
  const res = await fetch(`${API_BASE}/today?studentId=${studentId}`)
  return res.json()
}

export async function submitTest(data) {
  const res = await fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function fetchAnalytics(studentId) {
  const res = await fetch(`${API_BASE}/analytics/${studentId}`)
  return res.json()
}

export async function fetchComparison() {
  const res = await fetch(`${API_BASE}/analytics/compare/both`)
  return res.json()
}

export async function fetchTeacherOverview() {
  const res = await fetch(`${API_BASE}/teacher/overview`)
  return res.json()
}

export async function addTeacherFeedback(submissionId, feedback) {
  const res = await fetch(`${API_BASE}/submissions/${submissionId}/feedback`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedback })
  })
  return res.json()
}

export async function addTeacherNote(title, content) {
  const res = await fetch(`${API_BASE}/teacher/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  })
  return res.json()
}

export async function verifyTeacherPin(pin) {
  const res = await fetch(`${API_BASE}/auth/teacher-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  })
  return res.json()
}

export async function verifyStudentPin(studentId, pin) {
  const res = await fetch(`${API_BASE}/auth/student-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, pin })
  })
  return res.json()
}

export async function updateStudentPin(studentId, pin) {
  const res = await fetch(`${API_BASE}/students/${studentId}/pin`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  })
  return res.json()
}

export async function uploadPhoto(dataUrl) {
  const res = await fetch(`${API_BASE}/upload-photo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl })
  })
  return res.json()
}

export async function fetchUnsolvedQuestions(studentId = null) {
  let url = `${API_BASE}/unsolved-questions`
  if (studentId) url += `?studentId=${studentId}`
  const res = await fetch(url)
  return res.json()
}

export async function createUnsolvedQuestion(data) {
  const res = await fetch(`${API_BASE}/unsolved-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function updateUnsolvedQuestion(id, updates) {
  const res = await fetch(`${API_BASE}/unsolved-questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  return res.json()
}

export async function deleteUnsolvedQuestion(id) {
  const res = await fetch(`${API_BASE}/unsolved-questions/${id}`, {
    method: 'DELETE'
  })
  return res.json()
}

export async function fetchMockExams(studentId = null) {
  let url = `${API_BASE}/mock-exams`
  if (studentId) url += `?studentId=${studentId}`
  const res = await fetch(url)
  return res.json()
}

export async function createMockExam(data) {
  const res = await fetch(`${API_BASE}/mock-exams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function updateMockExam(id, updates) {
  const res = await fetch(`${API_BASE}/mock-exams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  return res.json()
}

export async function deleteMockExam(id) {
  const res = await fetch(`${API_BASE}/mock-exams/${id}`, {
    method: 'DELETE'
  })
  return res.json()
}

// Settings & Google Drive & WhatsApp
export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`)
  return res.json()
}

export async function updateSettings(data) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function testGoogleDriveConnection(url = '') {
  const res = await fetch(`${API_BASE}/settings/test-google-drive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  return res.json()
}

export async function syncAllQuestionsToDrive(force = false) {
  const res = await fetch(`${API_BASE}/unsolved-questions/sync-all-to-drive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ force })
  })
  return res.json()
}

export async function fetchWhatsAppDailyMessage(date = null) {
  let url = `${API_BASE}/whatsapp/daily-message`
  if (date) url += `?date=${date}`
  const res = await fetch(url)
  return res.json()
}

export async function sendWhatsAppWebhook(webhookUrl = '', date = null) {
  const res = await fetch(`${API_BASE}/whatsapp/send-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webhookUrl, date })
  })
  return res.json()
}

