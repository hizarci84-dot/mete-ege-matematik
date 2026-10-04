# ☁️ Müfit Hoca - Google Drive Arşivi & Saat 16:00 Otomatik WhatsApp Kılavuzu

Hocam, bu sistem iki büyük görevi **Google Bulutunda (bilgisayarınız kapalı olsa dahi 7/24)** otomatik olarak yürütür:
1. Mete ve Ege'nin yapamadığı sorular Google Drive'ınızda `mete-ege yapılamayan sorular / YYYY-MM-DD` klasöründe tarih tarih arşivlenir.
2. Her gün saat **16:00'da Google Apps Script Zaman Tetikleyicisi** çalışır ve Mete & Ege grubuna günün ödevini siz hiçbir tuşa basmadan kendiliğinden atar!

---

## 🟢 ADIM 1: Ücretsiz WhatsApp Ağ Geçidini Alma (2 Dakika)
WhatsApp doğrudan dışarıdan mesaj kabul etmediği için Google Apps Script'in mesajı iletebilmesi amacıyla dünyanın en çok kullanılan ücretsiz servisi **Green-API** kullanılır (Kredi kartı istemez, tamamen ücretsizdir):

1. Tarayıcınızda [green-api.com](https://green-api.com) adresini açıp sağ üstten **"Sign Up"** (Ücretsiz Kayıt) butonuna tıklayın.
2. E-posta adresinizle hesabınızı açın.
3. Giriş yapınca açılan ekranda **"Create an instance"** (Örnek oluştur) butonuna basın.
4. Karşınıza bir **Karekod (QR Code)** çıkacaktır. Telefonunuzdaki WhatsApp'tan (tıpkı WhatsApp Web'e bağlanır gibi) **Bağlı Cihazlar → Cihaz Bağla** diyerek bu karekodu okutun.
5. Karekodu okuttuğunuzda ekranda size 2 adet bilgi verilecektir:
   * **`idInstance`**: (Örn: `1101987654`)
   * **`apiTokenInstance`**: (Örn: `a1b2c3d4e5f6g7h8...`)
6. Mete ve Ege ile kurduğunuz WhatsApp grubunun ID'sini de paneldeki sohbetler listesinden (veya grup bilgi sayfasından) alın (`...@g.us` ile biter).

---

## 🟢 ADIM 2: Google Apps Script Kodunu Hazırlama
1. [script.google.com](https://script.google.com) adresine gidin ve sol üstteki **"+ Yeni proje"** butonuna tıklayın.
2. Proje başlığını `Mete-Ege-Otomasyon` yapın.
3. Editördeki tüm mevcut yazıları silin ve projenizdeki [`google_apps_script/GoogleDriveUploader.gs`](./GoogleDriveUploader.gs) dosyasının **tüm kodunu** kopyalayıp editöre yapıştırın.
4. Dosyanın 23, 24 ve 25. satırlarındaki yerlere Adım 1'de aldığınız bilgileri tırnak işaretlerinin içine yazın:
   ```javascript
   var GREEN_API_INSTANCE_ID = "1101987654";               // Kendi Instance ID'niz
   var GREEN_API_TOKEN       = "a1b2c3d4e5f6g7h8...";       // Kendi Token'ınız
   var WHATSAPP_GRUP_ID      = "120363024589999999@g.us";   // Mete ve Ege Grubunuzun ID'si
   ```
5. Üstteki **Disket (Kaydet)** simgesine basın.

---

## 🟢 ADIM 3: Saat 16:00 Tetikleyicisini Tek Tıkla Kurma!
Scriptin içine sizin için otomatik kurucu koyduk; saat kurmakla uğraşmanıza gerek yok:

1. Editörün üst kısmındaki fonksiyon açılır kutusundan **`otomatik1600TetikleyiciKur`** seçeneğini seçin.
2. Yanındaki **"Çalıştır" (Run)** butonuna basın.
3. Google bir defaya mahsus zaman tetikleyicisi izin yetkisi isteyecektir (**Gelişmiş → İzin Ver** deyin).
4. **TEBRİKLER!** Artık her gün saat 16:00'da Google sunucuları otomatik olarak çalışacak ve Mete & Ege grubuna o günün ödev duyurusunu kendiliğinden atacaktır.

*(İstediğiniz an hemen şimdi test etmek isterseniz menüden `testWhatsAppGonder` fonksiyonunu seçip "Çalıştır" diyerek anında mesajın gelip gelmediğini kontrol edebilirsiniz).*

---

## 🟢 ADIM 4: Google Drive Fotoğraf Arşivini Panele Bağlama
Öğrencilerin çözemediği soruların Drive'ınıza düşmesi için:
1. Aynı script sayfasında sağ üstteki mavi **"Dağıt" (Deploy) → "Yeni dağıtım"** seçin.
2. Sol çarktan **"Web uygulaması"** seçin.
3. Ayarlar:
   - **Uygulamayı şu olarak çalıştır**: `Ben`
   - **Erişimi olanlar**: `Herkes (Anyone)`
4. **"Dağıt"**a tıklayın ve size verilen **Web Uygulaması URL'sini** kopyalayın.
5. Web programımızdaki Öğretmen Panelinde **"☁️ Google Drive & WhatsApp (16:00)"** kutucuğuna yapıştırıp **"Kaydet & Bağlantıyı Test Et"**e basın.
