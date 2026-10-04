# Müfit Hoca ile Matematik — Mete & Ege Özel Ders ve Test Takip Platformu

Türkiye Yüzyılı Maarif Modeli 9. Sınıf Matematik müfredatına tam uyumlu; **Mete (Fen Lisesi)** ve **Ege (Anadolu Lisesi)** için geliştirilmiş bulut tabanlı günlük test takip, optik sonuç girişi, bireysel gizlilik korumalı şifreli erişim, çözülemeyen soru havuzu, genel deneme sınavı net analizi ve resmi karne platformudur.

---

## 🎯 Projenin Temel İlkeleri ve Mimari

1. **Öğrenci Profilleri ve Ortak Çözüm**:
   - İki öğrenci de (Mete ve Ege) **aynı programı** takip eder ve her iki kitabı da (**ÇAP Plus** ve **Orijinal**) çözer.
   - 👨‍🎓 **Mete (Fen Lisesi)**: Bireysel şifresiyle giriş yapar (`1234`), yalnızca kendi gelişimini görür.
   - 🧑‍🎓 **Ege (Anadolu Lisesi)**: Bireysel şifresiyle giriş yapar (`5678`), yalnızca kendi gelişimini görür.
   - Öğrenciler birbirlerinin skorlarını, çözümlerini veya ilerlemelerini kesinlikle göremezler (**Tam Bireysel Gizlilik**).

2. **237 Günlük Hızlandırılmış Takvim (Hafta İçi 1, Hafta Sonu 2 Test)**:
   - Program başlangıcı: **5 Ekim 2026 Pazartesi**
   - Program bitişi: **29 Mayıs 2027 Cumartesi**
   - **Toplam:** 237 Takvim Günü • 304 Test (170 Hafta İçi Testi + 134 Hafta Sonu Testi). Okul kapanışından önce tüm 9. sınıf müfredatı eksiksiz bitirilir.

3. **Pedagojik Konu Sıralı ve Dönüşümlü Program**:
   - ÇAP Plus ve Orijinal kitapları **konu konu (alt kazanım düzeyinde) senkronize** edilmiştir.
   - Konu önce ÇAP Plus'ın **"Öğreniyorum"** testleriyle kavranır, ardından Orijinal'in **"Süreç Kontrol"** testleriyle pekiştirilir, ÇAP Plus **"Pekiştiriyorum"** ve Orijinal **"Beceri Temelli"** testleriyle derinleştirilir.

4. **Çözülemeyen Soru Havuzu (Kitapçıktan Fotoğraflı Soru Gönderimi)** 📸:
   - Öğrenciler çözemedikleri soruları mobil kameradan çekip anında sisteme yükleyebilir.
   - Müfit Hoca öğretmen panelinden soruları inceleyip detaylı çözüm açıklamaları iletebilir.

5. **Çoklu Ders Genel Deneme Sınavları Sistemi (Özdebir / TÖDER / Okul)** 🎯:
   - Sadece matematik değil; **Türk Dili ve Edebiyatı, Matematik, Fen Bilimleri, Sosyal Bilimler ve Yabancı Dil** derslerini içeren tam kapsamlı genel deneme sınavı girişi.
   - ÖSYM standardında 4 yanlış 1 doğruyu götürür formülüyle anlık net hesabı.
   - Deneme kitapçığından yanlış ve boş soruların ders bazlı fotoğraflanıp kaydedilmesi.

6. **Koyu Mod (Dark) & Beyaz Mod (Light) Desteği**:
   - Tek dokunuşla gözü yormayan modern Koyu Mod veya aydınlık Beyaz Mod geçişi.

7. **Resmi Karne & Deneme Sınavları Performans Çıktısı (PDF / Yazdır)** 🖨️:
   - Mete ve Ege için ayrı ayrı alınabilen resmi analiz karnesi.
   - Okul ve kurumsal deneme sınavları performans dökümü ve pedagojik bilgilendirme protokolü.

---

## 📖 Kitap İçerikleri & Test Sayıları

| Kitap Adı | Yayınevi | Test Adedi | Detay Dağılım | Sayfa Aralığı |
| :--- | :--- | :---: | :--- | :---: |
| **ÇAP Plus 9. Sınıf Matematik** | Çap Yayınları | **127 Test** | 78 Öğreniyorum, 21 Pekiştiriyorum, 28 Tema Tarama | s. 7 - 298 |
| **Orijinal 9. Sınıf Matematik** | Orijinal Yayınları | **177 Test** | 7 Hazırbulunuşluk, Süreç Kontrol, Beceri Temelli | s. 6 - 322 |
| **TOPLAM PROGRAM** | **2 Kitap** | **304 Test** | **237 Gün (5 Eki 2026 - 29 May 2027)** | **Tüm Müfredat** |

---

## 🚀 Hızlı Başlangıç & Erişim

### 1. Yerel Bilgisayarda Tek Tıkla Başlatma:
Klasördeki **`baslat.bat`** dosyasına çift tıklayınız. Tarayıcınız otomatik olarak `http://localhost:5000` adresinde açılacaktır.

### 2. Öğrencilere ve Eğitmene Özel Bağlantılar:
* 👨‍🎓 **Mete'nin Özel Portalı:** `http://localhost:5000/?student=mete`  
  * *Varsayılan Şifre:* **`1234`**
* 🧑‍🎓 **Ege'nin Özel Portalı:** `http://localhost:5000/?student=ege`  
  * *Varsayılan Şifre:* **`5678`**
* 🛡️ **Müfit Hoca Yönetim Paneli:** `http://localhost:5000/?teacher=true`  
  * *Öğretmen PIN Kodu:* **`2026`**

---

## 🌐 İnternet Üzerinden Yayınlama (Deployment) Seçenekleri

Uygulamanın internet üzerinden öğrencilerin telefon ve tabletlerinden 7/24 erişilebilmesi için aşağıdaki yöntemlerden herhangi biri kullanılabilir:

### Seçenek A: Ücretsiz Bulut Sunucu (Render / Railway / Fly.io) - Önerilen
1. Projeyi bir GitHub deposuna yükleyiniz.
2. [Render.com](https://render.com) veya [Railway.app](https://railway.app) üzerinde **New Web Service** seçiniz.
3. Build Command: `npm run build`
4. Start Command: `node server/index.js`
5. Size özel `https://mufithoca-matematik.onrender.com` gibi ücretsiz, SSL korumalı bir alan adı verilir.

### Seçenek B: Anında Ücretsiz İnternet Tüneli (Cloudflare Tunnel / ngrok)
Bilgisayarınız açıkken öğrencilerin internetten hemen erişmesi için:
```bash
# Cloudflare tüneli (ücretsiz ve sınırsız)
npx cloudflared tunnel --url http://localhost:5000
```
Verilen güvenli `https://xxxx.trycloudflare.com` bağlantısını öğrencilerinize iletebilirsiniz.
