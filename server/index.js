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
  updateSettings,
  initDatabaseWithCloudSync
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

// =========================================================================
// EMAIL NOTIFICATION SYSTEM (GOOGLE APPS SCRIPT VIA MAILAPP)
// =========================================================================

function formatTrDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'))
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${days[d.getDay()]}`
  } catch (e) {
    return dateStr
  }
}

/**
 * Asynchronously sends an email via Müfit Hoca's Google Apps Script Web App
 */
async function sendEmailViaAppsScript({ to, subject, htmlBody, textBody }) {
  try {
    const settings = getSettings()
    if (!settings.googleAppsScriptUrl || !settings.googleAppsScriptUrl.trim()) {
      return { success: false, error: 'Google Apps Script URL ayarlanmamış.' }
    }
    const targetRecipients = (to || settings.notificationEmails || '').trim()
    if (!targetRecipients) {
      return { success: false, error: 'Alıcı e-posta adresi belirtilmemiş.' }
    }

    const payload = {
      action: 'send_email',
      to: targetRecipients,
      recipients: targetRecipients,
      subject: subject || 'Mete & Ege Matematik Bildirimi',
      htmlBody: htmlBody || '',
      textBody: textBody || 'Mete & Ege Matematik bilgilendirme mesajıdır.'
    }

    const resp = await fetch(settings.googleAppsScriptUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    })

    const result = await resp.json()
    return result
  } catch (err) {
    console.error('[Apps Script Email Send Error]:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Generates responsive HTML for instant daily test submission notification
 */
function buildDailySubmissionEmailHtml(submission, student, settings) {
  const studentName = student?.name || (submission.studentId === 'mete' ? 'Mete' : 'Ege')
  const dateFormatted = formatTrDate(submission.date) || submission.date
  const net = submission.net !== undefined ? submission.net : parseFloat((Number(submission.correct || 0) - Number(submission.wrong || 0) * 0.25).toFixed(2))
  const questionCount = submission.qCount || (Number(submission.correct || 0) + Number(submission.wrong || 0) + Number(submission.empty || 0)) || 12
  const scorePercent = submission.scorePercent !== undefined ? submission.scorePercent : Math.round((Number(submission.correct || 0) / questionCount) * 100)
  const photoCount = Array.isArray(submission.questionPhotos) ? submission.questionPhotos.length : 0

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ödev Tamamlama Bildirimi - ${studentName}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <tr>
      <td style="background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%); padding: 26px 24px; text-align: center; color: #ffffff;">
        <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 8px;">
          GÜNLÜK ÖDEV SONUÇ BİLDİRİMİ
        </div>
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
          ${studentName} Testini Başarıyla Kaydetti! 🎯
        </h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #e0e7ff;">
          Öğretmen: Müfit Hoca • ${dateFormatted}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 0 8px 8px 0; margin-bottom: 20px; padding: 14px;">
          <tr>
            <td>
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">Çözülen Test Bilgisi</div>
              <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">${submission.testTitle || 'Matematik Testi'}</div>
              <div style="font-size: 13px; color: #475569; margin-top: 4px;">
                📚 <strong>${submission.themeName || submission.topicName || 'Matematik'}</strong> ${submission.pages ? '• Sayfa ' + submission.pages : ''}
              </div>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
          <tr>
            <td width="23%" align="center" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 6px;">
              <div style="font-size: 22px; font-weight: 900; color: #16a34a;">${submission.correct || 0}</div>
              <div style="font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase; margin-top: 2px;">Doğru</div>
            </td>
            <td width="2%">&nbsp;</td>
            <td width="23%" align="center" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 12px 6px;">
              <div style="font-size: 22px; font-weight: 900; color: #dc2626;">${submission.wrong || 0}</div>
              <div style="font-size: 11px; font-weight: 700; color: #b91c1c; text-transform: uppercase; margin-top: 2px;">Yanlış</div>
            </td>
            <td width="2%">&nbsp;</td>
            <td width="23%" align="center" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 6px;">
              <div style="font-size: 22px; font-weight: 900; color: #64748b;">${submission.empty || 0}</div>
              <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 2px;">Boş</div>
            </td>
            <td width="2%">&nbsp;</td>
            <td width="27%" align="center" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 6px;">
              <div style="font-size: 22px; font-weight: 900; color: #2563eb;">${net}</div>
              <div style="font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; margin-top: 2px;">Net Skor</div>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;">📊 <strong>Başarı Yüzdesi:</strong></td>
            <td align="right" style="padding: 6px 0; font-weight: 800; color: ${scorePercent >= 80 ? '#16a34a' : scorePercent >= 60 ? '#f59e0b' : '#dc2626'};">
              %${scorePercent}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; border-top: 1px solid #e2e8f0;">⏱️ <strong>Çözüm Süresi:</strong></td>
            <td align="right" style="padding: 6px 0; font-weight: 700; color: #1e293b; border-top: 1px solid #e2e8f0;">
              ${submission.durationMinutes || 15} Dakika
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; border-top: 1px solid #e2e8f0;">❓ <strong>Toplam Soru:</strong></td>
            <td align="right" style="padding: 6px 0; font-weight: 700; color: #1e293b; border-top: 1px solid #e2e8f0;">
              ${questionCount} Soru
            </td>
          </tr>
          ${photoCount > 0 ? `
          <tr>
            <td style="padding: 6px 0; color: #b45309; border-top: 1px solid #e2e8f0;">📸 <strong>Yapılamayan Soru Fotoğrafı:</strong></td>
            <td align="right" style="padding: 6px 0; font-weight: 700; color: #b45309; border-top: 1px solid #e2e8f0;">
              ${photoCount} Adet Google Drive'a Aktarıldı
            </td>
          </tr>` : ''}
        </table>
        ${submission.studentNote ? `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; margin-bottom: 20px; padding: 12px 14px;">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase;">💬 Öğrenci Notu:</div>
              <div style="font-size: 13px; color: #78350f; margin-top: 3px; font-style: italic;">"${submission.studentNote}"</div>
            </td>
          </tr>
        </table>` : ''}
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="text-align: center; margin-top: 10px;">
          <tr>
            <td align="center">
              <a href="https://mete-ege-matematik.onrender.com" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 13px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);">
                🌐 Öğretmen & Öğrenci Paneline Git
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; background-color: #f8fafc;">
        Mete & Ege 9. Sınıf Matematik Takip Sistemi • Öğretmen: Müfit Hoca<br>
        Bu bilgilendirme e-postası ödev kaydı sonrası otomatik olarak gönderilmiştir.
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Dispatches instant submission email to all registered recipients
 */
async function dispatchDailySubmissionEmail(submission, student, settings) {
  const recipients = settings?.notificationEmails?.trim()
  if (!recipients) return { success: false, reason: 'Alıcı e-posta adresi kayıtlı değil' }

  const studentName = student?.name || (submission.studentId === 'mete' ? 'Mete' : 'Ege')
  const net = submission.net !== undefined ? submission.net : parseFloat((Number(submission.correct || 0) - Number(submission.wrong || 0) * 0.25).toFixed(2))
  const questionCount = submission.qCount || (Number(submission.correct || 0) + Number(submission.wrong || 0) + Number(submission.empty || 0)) || 12
  const scorePercent = submission.scorePercent !== undefined ? submission.scorePercent : Math.round((Number(submission.correct || 0) / questionCount) * 100)
  const subject = `📚 [Mete & Ege] ${studentName} Günlük Ödevini Tamamladı: ${submission.testTitle || 'Matematik Testi'} (Net: ${net}, Başarı: %${scorePercent})`

  const htmlBody = buildDailySubmissionEmailHtml(submission, student, settings)
  const textBody = `${studentName} günlük matematik testini tamamladı!\nTest: ${submission.testTitle}\nDoğru: ${submission.correct}, Yanlış: ${submission.wrong}, Boş: ${submission.empty}, Net: ${net}, Başarı: %${scorePercent}\nSüre: ${submission.durationMinutes} dk.`

  return await sendEmailViaAppsScript({
    to: recipients,
    subject,
    htmlBody,
    textBody
  })
}

function renderTestsTableHtml(subs) {
  if (!subs || subs.length === 0) {
    return `<div style="padding: 14px; text-align: center; color: #94a3b8; font-size: 12px; background: #f8fafc; border-radius: 8px;">Bu hafta henüz tamamlanan test kaydı bulunmuyor.</div>`
  }

  let rows = subs.map(s => {
    const net = s.net !== undefined ? s.net : parseFloat((Number(s.correct || 0) - Number(s.wrong || 0) * 0.25).toFixed(2))
    const score = s.scorePercent !== undefined ? s.scorePercent : Math.round((Number(s.correct || 0) / (Number(s.qCount) || 1)) * 100)
    const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'
    return `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 8px 6px; font-size: 11px; color: #64748b; white-space: nowrap;">${s.date}</td>
      <td style="padding: 8px 6px; font-size: 12px; font-weight: 600; color: #1e293b;">${s.testTitle || 'Test'}</td>
      <td style="padding: 8px 6px; font-size: 11px; text-align: center; color: #334155;">
        <span style="color: #16a34a; font-weight: 700;">${s.correct || 0}D</span> / 
        <span style="color: #dc2626; font-weight: 700;">${s.wrong || 0}Y</span> / 
        <span style="color: #64748b;">${s.empty || 0}B</span>
      </td>
      <td style="padding: 8px 6px; font-size: 12px; font-weight: 800; text-align: center; color: #2563eb;">${net}</td>
      <td style="padding: 8px 6px; font-size: 12px; font-weight: 800; text-align: right; color: ${scoreColor};">%${score}</td>
    </tr>`
  }).join('')

  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 12px; border-collapse: collapse; margin-top: 10px;">
    <thead>
      <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase;">
        <th style="padding: 8px 6px;">Tarih</th>
        <th style="padding: 8px 6px;">Test</th>
        <th style="padding: 8px 6px; text-align: center;">D / Y / B</th>
        <th style="padding: 8px 6px; text-align: center;">Net</th>
        <th style="padding: 8px 6px; text-align: right;">Başarı</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`
}

function renderStudentCardHtml(studentStat, themeColor, avatarEmoji) {
  return `
  <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
      <tr>
        <td>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a;">
            ${avatarEmoji} ${studentStat.studentName}
            <span style="font-size: 11px; font-weight: 600; color: #64748b; margin-left: 6px;">(${studentStat.student?.school || '9. Sınıf'})</span>
          </div>
          ${studentStat.isFallback ? '<div style="font-size: 10px; color: #d97706; margin-top: 2px;">⚠️ Son Çözülen Testler Görüntüleniyor</div>' : ''}
        </td>
        <td align="right">
          <span style="background-color: ${themeColor}15; color: ${themeColor}; border: 1px solid ${themeColor}30; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800;">
            ${studentStat.totalTests} Test Çözüldü
          </span>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
      <tr>
        <td width="23%" align="center" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 4px;">
          <div style="font-size: 18px; font-weight: 900; color: #0f172a;">${studentStat.totalQ}</div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Toplam Soru</div>
        </td>
        <td width="2%">&nbsp;</td>
        <td width="23%" align="center" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 10px 4px;">
          <div style="font-size: 18px; font-weight: 900; color: #16a34a;">${studentStat.totalNet}</div>
          <div style="font-size: 10px; font-weight: 700; color: #15803d; text-transform: uppercase;">Toplam Net</div>
        </td>
        <td width="2%">&nbsp;</td>
        <td width="23%" align="center" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 10px 4px;">
          <div style="font-size: 18px; font-weight: 900; color: #2563eb;">%${studentStat.avgScore}</div>
          <div style="font-size: 10px; font-weight: 700; color: #1d4ed8; text-transform: uppercase;">Ort. Başarı</div>
        </td>
        <td width="2%">&nbsp;</td>
        <td width="27%" align="center" style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 10px; padding: 10px 4px;">
          <div style="font-size: 18px; font-weight: 900; color: #9333ea;">${studentStat.totalDuration} dk</div>
          <div style="font-size: 10px; font-weight: 700; color: #7e22ce; text-transform: uppercase;">Toplam Süre</div>
        </td>
      </tr>
    </table>

    <div style="font-size: 12px; color: #475569; margin-bottom: 8px;">
      ✅ <strong>Doğru:</strong> ${studentStat.totalCorrect} &nbsp;|&nbsp; 
      ❌ <strong>Yanlış:</strong> ${studentStat.totalWrong} &nbsp;|&nbsp; 
      ⚪ <strong>Boş:</strong> ${studentStat.totalEmpty} &nbsp;|&nbsp; 
      📈 <strong>Test Başına Ort. Net:</strong> ${studentStat.avgNet}
    </div>

    ${studentStat.unsolvedTotal > 0 ? `
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 8px 12px; font-size: 11px; color: #b45309; margin-bottom: 10px;">
      📸 <strong>Yapılamayan Sorular:</strong> Toplam ${studentStat.unsolvedTotal} soru Google Drive arşivinde (${studentStat.unsolvedPending} tanesi incelenmeyi bekliyor).
    </div>` : ''}

    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 10px; letter-spacing: 0.5px;">
      Bu Hafta Tamamlanan Testler
    </div>
    ${renderTestsTableHtml(studentStat.subs)}
  </div>`
}

/**
 * Computes last 7-day stats for Mete & Ege
 */
function generateWeeklyFridayReportData() {
  const db = readDB()
  const today = new Date()
  const endStr = today.toISOString().split('T')[0]
  const startDateObj = new Date(today)
  startDateObj.setDate(startDateObj.getDate() - 6)
  const startStr = startDateObj.toISOString().split('T')[0]

  const weekRangeStr = `${formatTrDate(startStr)} - ${formatTrDate(endStr)}`

  function getStudentStats(studentId) {
    const student = (db.students || []).find(s => s.id === studentId) || { id: studentId, name: studentId === 'mete' ? 'Mete' : 'Ege' }
    let subs = (db.submissions || [])
      .filter(s => s.studentId === studentId && s.date >= startStr && s.date <= endStr)
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    let isFallback = false
    if (subs.length === 0) {
      const allStudentSubs = (db.submissions || [])
        .filter(s => s.studentId === studentId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      if (allStudentSubs.length > 0) {
        subs = allStudentSubs.slice(0, 5).reverse()
        isFallback = true
      }
    }

    const totalTests = subs.length
    let totalQ = 0
    let totalCorrect = 0
    let totalWrong = 0
    let totalEmpty = 0
    let totalNet = 0
    let totalDuration = 0

    subs.forEach(s => {
      const q = Number(s.qCount) || (Number(s.correct || 0) + Number(s.wrong || 0) + Number(s.empty || 0)) || 12
      totalQ += q
      totalCorrect += Number(s.correct || 0)
      totalWrong += Number(s.wrong || 0)
      totalEmpty += Number(s.empty || 0)
      const n = s.net !== undefined ? Number(s.net) : parseFloat((Number(s.correct || 0) - Number(s.wrong || 0) * 0.25).toFixed(2))
      totalNet += n
      totalDuration += Number(s.durationMinutes || 0)
    })

    const avgNet = totalTests > 0 ? parseFloat((totalNet / totalTests).toFixed(2)) : 0
    const avgScore = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0
    const totalHours = (totalDuration / 60).toFixed(1)

    const studentUnsolved = (db.unsolvedQuestions || []).filter(q => q.studentId === studentId)
    const pendingUnsolved = studentUnsolved.filter(q => q.status === 'pending')

    return {
      student,
      studentId,
      studentName: student.name,
      totalTests,
      totalQ,
      totalCorrect,
      totalWrong,
      totalEmpty,
      totalNet: parseFloat(totalNet.toFixed(2)),
      avgNet,
      avgScore,
      totalDuration,
      totalHours,
      unsolvedTotal: studentUnsolved.length,
      unsolvedPending: pendingUnsolved.length,
      isFallback,
      subs
    }
  }

  const mete = getStudentStats('mete')
  const ege = getStudentStats('ege')

  return {
    generatedAt: new Date().toISOString(),
    startStr,
    endStr,
    weekRangeStr,
    mete,
    ege
  }
}

/**
 * Builds weekly Friday progress report email HTML
 */
function buildWeeklyFridayEmailHtml(reportData, settings) {
  const meteHtml = renderStudentCardHtml(reportData.mete, '#f97316', '👨‍🎓')
  const egeHtml = renderStudentCardHtml(reportData.ege, '#2563eb', '🧑‍🎓')

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Haftalık Performans Raporu</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
    <tr>
      <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a8a 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
        <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 5px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 10px;">
          📅 CUMA AKŞAMI HAFTALIK PERFORMANS RAPORU
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
          Mete & Ege Haftalık İlerleme Karnesi 📊
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #c7d2fe;">
          Dönem: ${reportData.weekRangeStr} • Öğretmen: Müfit Hoca
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <div style="background-color: #ffffff; border-left: 4px solid #4f46e5; border-radius: 0 10px 10px 0; padding: 14px 18px; margin-bottom: 22px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <div style="font-size: 11px; font-weight: 800; color: #4f46e5; text-transform: uppercase;">Öğretmen Değerlendirmesi</div>
          <div style="font-size: 13px; color: #334155; margin-top: 4px; line-height: 1.5;">
            "Değerli velilerimiz ve sevgili öğrencilerimiz; bu haftanın matematik çalışma karnesi aşağıda detaylı olarak yer almaktadır. Hafta sonu çözülemeyen soruların tekrar edilmesi ve eksik konuların pekiştirilmesi başarımızı artıracaktır."
          </div>
        </div>

        ${meteHtml}
        ${egeHtml}

        <div style="background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%); border: 1px solid #dbeafe; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
          <div style="font-size: 14px; font-weight: 800; color: #1e3a8a; margin-bottom: 8px;">
            ⚖️ Haftalık Genel Değerlendirme
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #334155;">
            <tr>
              <td style="padding: 4px 0;"><strong>👨‍🎓 Mete:</strong></td>
              <td align="right" style="padding: 4px 0; font-weight: 700; color: #f97316;">${reportData.mete.totalTests} Test • ${reportData.mete.totalNet} Toplam Net • %${reportData.mete.avgScore} Başarı</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; border-top: 1px solid #e0e7ff;"><strong>🧑‍🎓 Ege:</strong></td>
              <td align="right" style="padding: 4px 0; font-weight: 700; color: #2563eb; border-top: 1px solid #e0e7ff;">${reportData.ege.totalTests} Test • ${reportData.ege.totalNet} Toplam Net • %${reportData.ege.avgScore} Başarı</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-top: 10px;">
          <a href="https://mete-ege-matematik.onrender.com" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);">
            🌐 Öğretmen Portalına Git & Tüm Grafikleri İncele
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; background-color: #ffffff;">
        Mete & Ege 9. Sınıf Matematik Takip Sistemi • Öğretmen: Müfit Hoca<br>
        Bu rapor her Cuma saat 21:00'da sistem tarafından otomatik olarak hazırlanıp gönderilmektedir.
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Dispatches weekly Friday email report
 */
async function dispatchWeeklyFridayEmailReport(customRecipients = null) {
  const settings = getSettings()
  const recipients = (customRecipients || settings?.notificationEmails || '').trim()
  if (!recipients) {
    return { success: false, error: 'Alıcı e-posta adresi belirtilmemiş.' }
  }

  const reportData = generateWeeklyFridayReportData()
  const htmlBody = buildWeeklyFridayEmailHtml(reportData, settings)
  const subject = `📊 [Mete & Ege Matematik] Haftalık Performans Raporu (Cuma Özeti • ${reportData.weekRangeStr})`
  const textBody = `Mete & Ege Matematik Haftalık Performans Raporu\n${reportData.weekRangeStr}\nMete: ${reportData.mete.totalTests} test, ${reportData.mete.totalNet} net, %${reportData.mete.avgScore} başarı\nEge: ${reportData.ege.totalTests} test, ${reportData.ege.totalNet} net, %${reportData.ege.avgScore} başarı\nDetaylar: https://mete-ege-matematik.onrender.com`

  return await sendEmailViaAppsScript({
    to: recipients,
    subject,
    htmlBody,
    textBody
  })
}

/**
 * Dispatches test email to verify mail connection
 */
async function dispatchTestEmail(customRecipients = null) {
  const settings = getSettings()
  const recipients = (customRecipients || settings?.notificationEmails || '').trim()
  if (!recipients) {
    return { success: false, error: 'Lütfen test e-postası göndermek için en az bir e-posta adresi giriniz.' }
  }

  const subject = `✅ [Mete & Ege Matematik] E-posta Bildirim Testi Başarılı!`
  const htmlBody = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>E-posta Testi</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; text-align: center; color: #ffffff;">
        <div style="font-size: 32px; margin-bottom: 6px;">🎉</div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">E-posta Bağlantısı Başarıyla Kuruldu!</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #d1fae5;">Mete & Ege Matematik Takip Sistemi</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px; font-size: 14px; line-height: 1.6; color: #334155;">
        <p>Merhaba <strong>Müfit Hocam ve Değerli Veliler</strong>,</p>
        <p>Bu e-posta, Mete & Ege Matematik Takip Sistemi'nin e-posta bildirim servisinin eksiksiz çalıştığını doğrulamak amacıyla gönderilmiştir.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 16px 0;">
          <div style="font-weight: 700; color: #0f172a; font-size: 13px;">⚡ Aktif Olan Otomatik Bildirimler:</div>
          <ul style="margin: 8px 0 0 0; padding-left: 18px; font-size: 13px; color: #475569;">
            <li><strong>Günlük Test Bildirimi:</strong> Mete veya Ege günlük ödev testini bitirip kaydettiğinde sonuçlar anında bu e-posta adreslerine gelir.</li>
            <li><strong>Cuma 21:00 Haftalık Karne:</strong> Her Cuma saat 21:00'da haftanın tüm performansını gösteren kapsamlı haftalık rapor bu adreslere postalanır.</li>
          </ul>
        </div>
        <p style="margin-top: 16px; font-size: 13px; color: #64748b;">
          Tanımlanan Alıcılar: <code>${recipients}</code>
        </p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://mete-ege-matematik.onrender.com" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 13px;">
            🌐 Web Portalına Git
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; background-color: #f8fafc;">
        Mete & Ege 9. Sınıf Matematik Takip Sistemi • Öğretmen: Müfit Hoca
      </td>
    </tr>
  </table>
</body>
</html>`
  const textBody = `Tebrikler! Mete & Ege Matematik Takip Sistemi e-posta bağlantısı başarıyla çalışıyor.\nTanımlanan alıcılar: ${recipients}`

  return await sendEmailViaAppsScript({
    to: recipients,
    subject,
    htmlBody,
    textBody
  })
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

  // Asynchronously dispatch daily submission email to all recipients
  const settings = getSettings()
  if (settings.emailDailyEnabled && settings.notificationEmails && settings.notificationEmails.trim() && settings.googleAppsScriptUrl) {
    const student = (readDB().students || []).find(s => s.id === studentId)
    dispatchDailySubmissionEmail(submission, student, settings).catch(err => {
      console.error('[Daily Submission Email Error]:', err.message)
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
    teacherPin,
    notificationEmails,
    emailDailyEnabled,
    emailWeeklyFridayEnabled,
    emailWeeklyFridayTime
  } = req.body
  const updates = {}
  if (googleAppsScriptUrl !== undefined) updates.googleAppsScriptUrl = String(googleAppsScriptUrl).trim()
  if (whatsAppGroupName !== undefined) updates.whatsAppGroupName = String(whatsAppGroupName).trim()
  if (whatsAppDailyTime !== undefined) updates.whatsAppDailyTime = String(whatsAppDailyTime).trim()
  if (whatsAppWebhookUrl !== undefined) updates.whatsAppWebhookUrl = String(whatsAppWebhookUrl).trim()
  if (teacherPin !== undefined && String(teacherPin).trim().length >= 4) updates.teacherPin = String(teacherPin).trim()
  if (notificationEmails !== undefined) updates.notificationEmails = String(notificationEmails).trim()
  if (emailDailyEnabled !== undefined) updates.emailDailyEnabled = Boolean(emailDailyEnabled)
  if (emailWeeklyFridayEnabled !== undefined) updates.emailWeeklyFridayEnabled = Boolean(emailWeeklyFridayEnabled)
  if (emailWeeklyFridayTime !== undefined) updates.emailWeeklyFridayTime = String(emailWeeklyFridayTime).trim()

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

// ==========================================
// Email Notifications API
// ==========================================

// Test email delivery
app.post('/api/email/test', async (req, res) => {
  try {
    const { recipients } = req.body
    const result = await dispatchTestEmail(recipients)
    if (result && (result.status === 'success' || result.success)) {
      res.json({ success: true, message: result.message || 'Test e-postası başarıyla gönderildi!' })
    } else {
      res.status(400).json({ success: false, error: result?.error || result?.message || 'E-posta gönderilemedi.' })
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Trigger weekly Friday email report manually or via Google Apps Script trigger
app.post('/api/email/send-weekly', async (req, res) => {
  try {
    const { recipients } = req.body
    const result = await dispatchWeeklyFridayEmailReport(recipients)
    if (result && (result.status === 'success' || result.success)) {
      res.json({ success: true, message: 'Cuma haftalık performans raporu e-postası başarıyla gönderildi!' })
    } else {
      res.status(400).json({ success: false, error: result?.error || result?.message || 'Haftalık rapor e-postası gönderilemedi.' })
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Preview weekly Friday report HTML
app.get('/api/email/preview-weekly', (req, res) => {
  try {
    const reportData = generateWeeklyFridayReportData()
    const settings = getSettings()
    const html = buildWeeklyFridayEmailHtml(reportData, settings)
    res.json({ success: true, reportData, html })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
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

app.listen(PORT, async () => {
  console.log(`Backend API sunucusu http://localhost:${PORT} üzerinde çalışıyor`)
  try {
    await initDatabaseWithCloudSync()
  } catch (err) {
    console.error('Failed to initialize cloud database sync:', err.message)
  }
})

// Friday 21:00 Automated Weekly Report Local Cron Trigger (when server is running)
let lastFridayReportDate = null
setInterval(() => {
  try {
    const now = new Date()
    // Istanbul / GMT+3 time
    const trDateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now) // YYYY-MM-DD

    const trDayOfWeek = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })).getDay() // 5 = Friday
    const trHours = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })).getHours()
    const trMinutes = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })).getMinutes()

    // If Friday (day 5) and time is 21:00 (between 21:00 and 21:04) and not already sent today
    if (trDayOfWeek === 5 && trHours === 21 && trMinutes < 5 && lastFridayReportDate !== trDateParts) {
      const settings = getSettings()
      if (settings.emailWeeklyFridayEnabled && settings.notificationEmails && settings.googleAppsScriptUrl) {
        console.log(`[Cron] Cuma 21:00 Haftalık E-posta Raporu tetikleniyor... (${trDateParts})`)
        lastFridayReportDate = trDateParts
        dispatchWeeklyFridayEmailReport().catch(err => {
          console.error('[Cron Weekly Email Error]:', err.message)
        })
      }
    }
  } catch (err) {
    console.error('[Weekly Cron Check Error]:', err.message)
  }
}, 60000)
