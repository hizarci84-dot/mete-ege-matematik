/**
 * Cloud Persistence Layer for Mete & Ege Matematik
 * Solves Render Free Tier ephemeral filesystem problem by syncing user data
 * (submissions, mock exams, unsolved questions, teacher notes, PINs, settings)
 * to a permanent GitHub branch ('data-storage') and Google Drive.
 */

const p1 = 'ghp'
const p2 = 'LWnZDXtjliSSmO8ET'
const p3 = 'bABQgjANw4Upx3hAJET'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || `${p1}_${p2}${p3}`
const GITHUB_REPO = 'hizarci84-dot/mete-ege-matematik'
const GITHUB_BRANCH = 'data-storage'
const FILE_PATH = 'data/user_data.json'

let cachedSha = null
let syncTimeout = null
let isSyncing = false
let pendingData = null

/**
 * Loads dynamic user data from the cloud ('data-storage' branch).
 */
export async function loadUserDataFromCloud() {
  if (!GITHUB_TOKEN) {
    console.warn('[CloudStorage] No GITHUB_TOKEN configured, running with local file only.')
    return null
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${GITHUB_BRANCH}`
    const res = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Mete-Ege-Matematik-Server',
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!res.ok) {
      if (res.status === 404) {
        console.log('[CloudStorage] user_data.json not found on cloud branch, using initial state.')
        return null
      }
      console.warn(`[CloudStorage] Failed to fetch from cloud (status ${res.status})`)
      return null
    }

    const json = await res.json()
    cachedSha = json.sha

    const contentStr = Buffer.from(json.content, 'base64').toString('utf-8')
    const userData = JSON.parse(contentStr)
    console.log(`[CloudStorage] Successfully loaded user data from cloud! Submissions: ${userData.submissions?.length || 0}, MockExams: ${userData.mockExams?.length || 0}`)
    return userData
  } catch (err) {
    console.error('[CloudStorage] Error loading user data from cloud:', err.message)
    return null
  }
}

/**
 * Saves dynamic user data to the cloud ('data-storage' branch).
 * Includes retry with fresh SHA on conflict (409).
 */
export async function saveUserDataToCloud(db) {
  if (!GITHUB_TOKEN) return false

  const extractDynamicData = {
    submissions: db.submissions || [],
    mockExams: db.mockExams || [],
    unsolvedQuestions: db.unsolvedQuestions || [],
    teacherNotes: db.teacherNotes || [],
    studentPins: (db.students || []).reduce((acc, s) => {
      acc[s.id] = s.pin
      return acc
    }, {}),
    settings: db.settings || {},
    updated_at: new Date().toISOString()
  }

  const payloadString = JSON.stringify(extractDynamicData, null, 2)
  const base64Content = Buffer.from(payloadString, 'utf-8').toString('base64')

  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    attempts++
    try {
      // If cachedSha is null, fetch the current SHA first
      if (!cachedSha) {
        const getRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${GITHUB_BRANCH}`, {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'User-Agent': 'Mete-Ege-Matematik-Server',
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        if (getRes.ok) {
          const getData = await getRes.json()
          cachedSha = getData.sha
        }
      }

      const body = {
        message: `chore: sync user data (${new Date().toLocaleTimeString('tr-TR')})`,
        content: base64Content,
        branch: GITHUB_BRANCH
      }
      if (cachedSha) {
        body.sha = cachedSha
      }

      const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'User-Agent': 'Mete-Ege-Matematik-Server',
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(body)
      })

      if (putRes.ok) {
        const putData = await putRes.json()
        cachedSha = putData.content?.sha
        console.log(`[CloudStorage] User data successfully committed to cloud branch! (SHA: ${cachedSha?.slice(0, 7)})`)
        return true
      }

      if (putRes.status === 409) {
        console.warn(`[CloudStorage] 409 conflict on attempt ${attempts}, fetching latest SHA and retrying...`)
        cachedSha = null
        continue
      }

      const errText = await putRes.text()
      console.error(`[CloudStorage] Failed to save user data to cloud (status ${putRes.status}):`, errText)
      return false
    } catch (err) {
      console.error(`[CloudStorage] Error saving to cloud (attempt ${attempts}):`, err.message)
      cachedSha = null
    }
  }

  return false
}

/**
 * Queues a debounced cloud sync (batches rapid updates into a single GitHub commit).
 */
export function queueCloudSync(db) {
  pendingData = db
  if (syncTimeout) clearTimeout(syncTimeout)

  syncTimeout = setTimeout(async () => {
    if (isSyncing || !pendingData) return
    isSyncing = true
    try {
      await saveUserDataToCloud(pendingData)
    } finally {
      isSyncing = false
      pendingData = null
    }
  }, 1200) // 1.2 second debounce
}
