import React from 'react'
import {
  Printer,
  X,
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  Target,
  TrendingUp,
  FileText
} from 'lucide-react'

export default function PrintReport({
  student,
  analyticsData,
  mockExams = [],
  onClose,
  onSwitchStudent,
  allStudents = []
}) {
  if (!analyticsData || !student) return null

  const { summary, topicMastery, submissions } = analyticsData

  // Student specific mock exams & statistics
  const studentExams = (mockExams || []).filter(e => e.studentId === student?.id)
  const totalMockExams = studentExams.length
  const avgGeneralNet = totalMockExams > 0
    ? (studentExams.reduce((sum, e) => sum + (Number(e.net) || 0), 0) / totalMockExams).toFixed(2)
    : '0.00'
  const avgMathNet = totalMockExams > 0
    ? (studentExams.reduce((sum, e) => sum + (Number(e.mathNet ?? e.net) || 0), 0) / totalMockExams).toFixed(2)
    : '0.00'
  const highestNetExam = totalMockExams > 0
    ? studentExams.reduce((prev, curr) => (Number(curr.net) > Number(prev.net) ? curr : prev), studentExams[0])
    : null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-hidden">
      <div className="bg-white text-slate-900 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col border border-slate-300 overflow-hidden">
        {/* Sticky Action Header (Always visible at the top, hidden in print) */}
        <div className="sticky top-0 z-20 bg-slate-900 text-white px-6 py-3.5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3 shrink-0 print:hidden">
          {/* Student Report Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Rapor Seçimi:</span>
            <button
              onClick={() => onSwitchStudent && onSwitchStudent('mete')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                student.id === 'mete'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 ring-2 ring-orange-400'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>👨‍🎓</span>
              <span>Mete'nin Raporu</span>
            </button>
            <button
              onClick={() => onSwitchStudent && onSwitchStudent('ege')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                student.id === 'ege'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>🧑‍🎓</span>
              <span>Ege'nin Raporu</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF Kaydet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Document Body (Aşağı kaydırma çubuğu aktif) */}
        <div
          className="overflow-y-auto p-6 sm:p-10 space-y-6 flex-1 print:p-0 print:overflow-visible print:max-h-none"
          style={{
            scrollbarWidth: 'auto',
            scrollbarColor: '#94a3b8 #f1f5f9'
          }}
        >
          {/* Official Document Header with Müfit Hoca Logo */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <img
                src="/mufit-hoca-logo.jpg"
                alt="Müfit Hoca ile Matematik"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-900 shadow-md object-cover shrink-0"
              />
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                  MÜFİT HOCA İLE MATEMATİK ÖZEL DERS MERKEZİ
                </h1>
                <h2 className="text-sm sm:text-base font-bold text-indigo-800">
                  9. Sınıf Maarif Modeli — Bireysel Soru Bankası Çözüm ve Analiz Karnesi
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  {student.name} ({student.school}) • 237 Günlük Hızlandırılmış Program
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-600 shrink-0 border-l sm:border-l-0 pl-3 sm:pl-0 border-slate-300">
              <div><strong>Rapor Tarihi:</strong> {new Date().toLocaleDateString('tr-TR')}</div>
              <div><strong>Akademik Yıl:</strong> 2026-2027</div>
              <div><strong>Eğitmen:</strong> Müfit Hoca</div>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Öğrenci Adı Soyadı:</span>
              <strong className="text-sm text-slate-900 font-bold">{student.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Kayıtlı Okulu / Sınıfı:</span>
              <strong className="text-sm text-slate-900">{student.school} — {student.grade}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Ödevlendirme Prensibi:</span>
              <strong className="text-slate-900 font-semibold">Hafta İçi 1 Test, Hafta Sonu 2 Test (Açık Uçlu Etkinlikler Hariç)</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Program Takvimi & Bitiş:</span>
              <strong className="text-slate-900">5 Ekim 2026 — 29 Mayıs 2027 (237 Gün • Hızlandırılmış)</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block text-[11px]">Müfredat ve Takip Edilen Kaynaklar:</span>
              <strong className="text-indigo-800">
                ÇAP Plus 9. Sınıf (127 Test) & Orijinal Matematik (177 Test) — Toplam 304 Test
              </strong>
            </div>
          </div>

          {/* Performance Overview KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Çözülen Test</span>
              <strong className="text-xl text-slate-900">{summary.totalTests} / {student?.totalAssignedTests || 304}</strong>
              <span className="text-[10px] text-slate-500 block">Test</span>
            </div>
            <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Toplam Soru</span>
              <strong className="text-xl text-slate-900">{summary.totalQuestions}</strong>
              <span className="text-[10px] text-slate-500 block">{summary.totalCorrect} Doğru • {summary.totalWrong} Yanlış</span>
            </div>
            <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
              <span className="text-[10px] text-indigo-700 uppercase font-bold block">Net Ortalaması</span>
              <strong className="text-xl text-indigo-700">{summary.avgNet} Net</strong>
              <span className="text-[10px] text-indigo-600 block">4 Yanlış 1 Doğru Götürür</span>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">Genel Başarı</span>
              <strong className="text-xl text-emerald-700">%{summary.avgScore}</strong>
              <span className="text-[10px] text-emerald-600 block">Aktif Seri: {summary.streakDays} Gün</span>
            </div>
          </div>

          {/* 7 Themes Mastery Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                Müfredat Temalarına Göre İlerleme ve Başarı Tablosu (7 Maarif Teması)
              </h3>
              <span className="text-[11px] text-slate-500">Müfredat İlerlemesi: %{summary.overallCurriculumProgress || 0}</span>
            </div>
            <div className="overflow-x-auto border border-slate-300 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-300">
                  <tr>
                    <th className="p-2.5 font-bold">Maarif Modeli Teması</th>
                    <th className="p-2.5 text-center font-bold">Tamamlanan Test</th>
                    <th className="p-2.5 text-center font-bold">Doğru</th>
                    <th className="p-2.5 text-center font-bold">Yanlış</th>
                    <th className="p-2.5 text-center font-bold">Boş</th>
                    <th className="p-2.5 text-center font-bold">Ort. Net</th>
                    <th className="p-2.5 text-center font-bold">Başarı %</th>
                    <th className="p-2.5 text-center font-bold">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {topicMastery.map((t, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-2.5 font-semibold text-slate-900">{t.themeName}</td>
                      <td className="p-2.5 text-center font-medium">
                        {t.testsCompleted} / {t.totalTestsInCurriculum}
                      </td>
                      <td className="p-2.5 text-center text-emerald-700 font-semibold">{t.correct}</td>
                      <td className="p-2.5 text-center text-rose-700 font-semibold">{t.wrong}</td>
                      <td className="p-2.5 text-center text-slate-500">{t.empty}</td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{t.avgNet}</td>
                      <td className="p-2.5 text-center font-bold text-indigo-700">
                        {t.testsCompleted > 0 ? `%${t.successRate}` : '-'}
                      </td>
                      <td className="p-2.5 text-center font-semibold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          t.statusColor === 'green'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.statusColor === 'yellow'
                            ? 'bg-amber-100 text-amber-800'
                            : t.statusColor === 'red'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DENEME SINAVLARI PERFORMANS VE BİLGİLENDİRME RAPORU      */}
          {/* ========================================================= */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-2 gap-1">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-indigo-700" />
                  <span>Okul ve Kurumsal Deneme Sınavları Performans Raporu</span>
                </h3>
                <p className="text-[11px] text-slate-600">
                  Öğrencinin okul yazılıları, dershane sınavları ve Türkiye geneli kurumsal denemelerde (Özdebir, TÖDER vb.) elde ettiği sonuçlar ve dersler bazındaki net analizi.
                </p>
              </div>
              <span className="text-[11px] bg-indigo-100 text-indigo-900 border border-indigo-300 px-2.5 py-0.5 rounded-full font-bold self-start sm:self-auto shrink-0">
                {studentExams.length} Deneme Kayıtlı
              </span>
            </div>

            {/* KPI Cards for Mock Exams */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Toplam Deneme</span>
                <strong className="text-base text-slate-900">{studentExams.length} Adet</strong>
                <span className="text-[10px] text-slate-500 block">Kurumsal & Okul</span>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="text-[10px] text-indigo-700 uppercase font-bold block">📐 Matematik Net Ortalaması</span>
                <strong className="text-base text-indigo-800 font-black">{avgMathNet} Net</strong>
                <span className="text-[10px] text-indigo-600 block">Özel Ders Takibi</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-700 uppercase font-semibold block">🎯 Genel Net Ortalaması</span>
                <strong className="text-base text-emerald-800">{avgGeneralNet} Net</strong>
                <span className="text-[10px] text-emerald-600 block">Tüm Dersler Toplamı</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-700 uppercase font-semibold block">En Yüksek Net</span>
                <strong className="text-base text-amber-800 font-bold">{highestNetExam ? Number(highestNetExam.net).toFixed(2) : '-'} Net</strong>
                <span className="text-[10px] text-amber-600 block truncate">{highestNetExam ? highestNetExam.publisher : 'Kayıt Yok'}</span>
              </div>
            </div>

            {/* Detailed Table if exams exist */}
            {studentExams.length > 0 ? (
              <div className="overflow-x-auto border border-slate-300 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-300">
                    <tr>
                      <th className="p-2.5 font-bold">Sınav Tarihi</th>
                      <th className="p-2.5 font-bold">Deneme Adı & Kurum</th>
                      <th className="p-2.5 text-center font-bold">Tür</th>
                      <th className="p-2.5 text-center font-bold">Soru</th>
                      <th className="p-2.5 font-bold">Dersler Bazında Net Dökümü</th>
                      <th className="p-2.5 text-center font-bold bg-indigo-50 text-indigo-900">📐 Matematik</th>
                      <th className="p-2.5 text-center font-bold bg-slate-200 text-slate-900">Genel Net</th>
                      <th className="p-2.5 text-center font-bold">Başarı %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentExams.map((exam, eIdx) => {
                      const isGeneral = exam.examType === 'general' || (exam.subjects && exam.subjects.length > 1)
                      return (
                        <tr key={exam.id || eIdx} className={eIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="p-2.5 text-slate-600 whitespace-nowrap">{exam.date}</td>
                          <td className="p-2.5">
                            <strong className="text-slate-900 block">{exam.examTitle}</strong>
                            <span className="text-[10px] text-slate-500">{exam.publisher} • {exam.durationMinutes || 120} dk</span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isGeneral ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {isGeneral ? 'Genel Deneme' : 'Branş'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-medium text-slate-700">{exam.qCount}</td>
                          <td className="p-2.5">
                            {exam.subjects && exam.subjects.length > 0 ? (
                              <div className="flex flex-wrap gap-1 text-[11px]">
                                {exam.subjects.map((s, si) => (
                                  <span key={si} className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                                    {s.name.split(' ')[0]}: <strong className="text-slate-900">{Number(s.net || 0).toFixed(1)}</strong>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500">{exam.correct}D / {exam.wrong}Y / {exam.empty}B</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-black text-indigo-700 bg-indigo-50/50">
                            {exam.mathNet !== undefined ? Number(exam.mathNet).toFixed(2) : '-'} Net
                          </td>
                          <td className="p-2.5 text-center font-black text-slate-900 bg-slate-100/50">
                            {Number(exam.net || 0).toFixed(2)} Net
                          </td>
                          <td className="p-2.5 text-center font-bold text-emerald-700">
                            %{exam.scorePercent || 0}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-600">
                <span className="font-semibold text-slate-800 block">Henüz Kayıtlı Deneme Sınavı Verisi Bulunmamaktadır</span>
                <span className="text-[11px] text-slate-500">
                  Öğrencinin okul yazılıları, dershane sınavları ve Özdebir/TÖDER kurumsal deneme sonuçları sisteme girildikçe bu bölüme otomatik olarak yansıtılacaktır.
                </span>
              </div>
            )}

            {/* Informational Guidance Notice on Trial Exams */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 space-y-1">
              <strong className="font-bold flex items-center space-x-1 text-indigo-950">
                <span>📌 Deneme Sınavları Pedagojik Takip ve Soru Çözüm Protokolü:</span>
              </strong>
              <p className="leading-relaxed text-indigo-800">
                Öğrencinin deneme sınavlarında çözemediği, boş bıraktığı veya yanlış yaptığı tüm sorular deneme kitapçığından fotoğraflanarak sisteme yüklenmektedir. Müfit Hoca, bu soruları haftalık özel ders seanslarında derinlemesine analiz ederek öğrencinin soru kalıplarını kavramasını, zaman yönetimi stratejisini ve sınav netlerini maksimize etmesini sağlamaktadır.
              </p>
            </div>
          </div>

          {/* Teacher Feedback / Notes Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <strong className="text-slate-900 block font-bold">Özel Ders Öğretmeni Görüş ve Değerlendirmesi:</strong>
            <p className="text-slate-700 leading-relaxed italic">
              "Öğrenci 9. sınıf Türkiye Yüzyılı Maarif Modeli Matematik dersinde ÇAP Plus ve Orijinal Matematik soru bankalarını hafta içi 1 test, hafta sonu 2 test temposunda kararlılıkla çözmektedir. Soru bankası ödevlerinin yanı sıra okul ve kurumsal deneme sınavlarındaki net gelişimi düzenli olarak izlenmekte; denemelerde yanlış ve boş bırakılan sorular özel derslerimizde birebir çözülerek konu eksikleri gecikmeden telafi edilmektedir."
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs text-slate-700">
            <div>
              <div className="font-semibold mb-8">Öğrenci</div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1 text-[11px] text-slate-500">
                {student.name}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-8">Veli Onayı</div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1 text-[11px] text-slate-500">
                İmza
              </div>
            </div>
            <div>
              <div className="font-semibold mb-8">Matematik Öğretmeni</div>
              <div className="border-t border-slate-400 w-32 mx-auto pt-1 text-[11px] text-slate-500">
                Kaşe / İmza
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
