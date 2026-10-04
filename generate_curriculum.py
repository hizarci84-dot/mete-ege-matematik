import json

# Complete curriculum catalog based on the exact Table of Contents of both books

books_data = [
    {
        'id': 'cap-9',
        'title': 'ÇAP Plus 9. Sınıf Matematik Soru Bankası',
        'short_title': 'ÇAP Matematik',
        'publisher': 'Çap Yayınları',
        'curriculum': '2026 Türkiye Yüzyılı Maarif Modeli',
        'pdf_filename': 'CAP_9_Matematik_Soru_Bankasi.pdf',
        'target_school': 'Anadolu Lisesi ve Fen Lisesi',
        'color': '#3b82f6',
        'accent': 'blue',
        'themes': [
            {
                'id': 'cap-t1',
                'name': '1. Tema: Sayılar',
                'description': 'Üslü ve köklü gösterimler, aralıklar, kümeler, sıralama, işlem özellikleri ve özdeşlikler',
                'subtopics': [
                    {
                        'id': 'sub-1-1',
                        'name': '1.1 Gerçek Sayıların Üslü Gösterimi ve İşlemler',
                        'tests': [
                            {'id': 'cap-t1-ogr-1', 'num': 'Öğreniyorum 1', 'title': 'Üslü Sayılar', 'pages': '7-8', 'q_count': 12},
                            {'id': 'cap-t1-ogr-2', 'num': 'Öğreniyorum 2', 'title': 'Üslü Sayılarda Dört İşlem - 1', 'pages': '9-10', 'q_count': 12},
                            {'id': 'cap-t1-ogr-3', 'num': 'Öğreniyorum 3', 'title': 'Üslü Sayılarda Dört İşlem - 2', 'pages': '11-12', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-1-2',
                        'name': '1.2 Gerçek Sayıların Köklü Gösterimi ve İşlemler',
                        'tests': [
                            {'id': 'cap-t1-ogr-4', 'num': 'Öğreniyorum 4', 'title': 'Köklü Sayılar', 'pages': '13-14', 'q_count': 12},
                            {'id': 'cap-t1-ogr-5', 'num': 'Öğreniyorum 5', 'title': 'Köklü Sayılarda İşlemler - 1', 'pages': '15-16', 'q_count': 12},
                            {'id': 'cap-t1-ogr-6', 'num': 'Öğreniyorum 6', 'title': 'Köklü Sayılarda İşlemler - 2', 'pages': '17-18', 'q_count': 12},
                            {'id': 'cap-t1-ogr-7', 'num': 'Öğreniyorum 7', 'title': 'İç İçe Kökler ve Köklü Sayılarda Sıralama', 'pages': '19-20', 'q_count': 12},
                            {'id': 'cap-t1-pek-1', 'num': 'Pekiştiriyorum 1', 'title': 'Üslü ve Köklü Sayılar - Test 1', 'pages': '21-22', 'q_count': 12},
                            {'id': 'cap-t1-pek-2', 'num': 'Pekiştiriyorum 2', 'title': 'Üslü ve Köklü Sayılar - Test 2', 'pages': '23-24', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-1-3',
                        'name': '1.3 Gerçek Sayı Aralıkları ve Kümeler',
                        'tests': [
                            {'id': 'cap-t1-ogr-8', 'num': 'Öğreniyorum 8', 'title': 'Kümelerde Temel Kavramlar', 'pages': '26-27', 'q_count': 12},
                            {'id': 'cap-t1-ogr-9', 'num': 'Öğreniyorum 9', 'title': 'Kümelerde İşlemler', 'pages': '28-29', 'q_count': 12},
                            {'id': 'cap-t1-ogr-10', 'num': 'Öğreniyorum 10', 'title': 'Gerçek Sayı Aralıkları', 'pages': '30-31', 'q_count': 12},
                            {'id': 'cap-t1-ogr-11', 'num': 'Öğreniyorum 11', 'title': 'Aralıkların Mutlak Değer Gösterimi', 'pages': '32-33', 'q_count': 12},
                            {'id': 'cap-t1-pek-3', 'num': 'Pekiştiriyorum 3', 'title': 'Aralıklarda İşlemler - Test 1', 'pages': '34-35', 'q_count': 12},
                            {'id': 'cap-t1-pek-4', 'num': 'Pekiştiriyorum 4', 'title': 'Aralıklarda İşlemler - Test 2', 'pages': '36-37', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-1-4',
                        'name': '1.4 Sayı Kümelerinde Sıralama ve Özellikler',
                        'tests': [
                            {'id': 'cap-t1-ogr-12', 'num': 'Öğreniyorum 12', 'title': 'Sıralı Olma ve Sayı Belirleme', 'pages': '39-40', 'q_count': 12},
                            {'id': 'cap-t1-ogr-13', 'num': 'Öğreniyorum 13', 'title': 'Kapalılık Özelliği ve İspat Yöntemleri', 'pages': '41-42', 'q_count': 12},
                            {'id': 'cap-t1-ogr-14', 'num': 'Öğreniyorum 14', 'title': 'Sayılarda Sıralama Özellikleri - 1', 'pages': '43-44', 'q_count': 12},
                            {'id': 'cap-t1-ogr-15', 'num': 'Öğreniyorum 15', 'title': 'Sayılarda Sıralama Özellikleri - 2', 'pages': '45-46', 'q_count': 12},
                            {'id': 'cap-t1-ogr-16', 'num': 'Öğreniyorum 16', 'title': 'Sayılarda Sıralama Özellikleri - 3', 'pages': '47-48', 'q_count': 12},
                            {'id': 'cap-t1-pek-5', 'num': 'Pekiştiriyorum 5', 'title': 'Sayılarda Sıralama - Test 1', 'pages': '49-50', 'q_count': 12},
                            {'id': 'cap-t1-pek-6', 'num': 'Pekiştiriyorum 6', 'title': 'Sayılarda Sıralama - Test 2', 'pages': '51-52', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-1-5',
                        'name': '1.5 Önerme, İşlem Özellikleri ve Özdeşlikler',
                        'tests': [
                            {'id': 'cap-t1-ogr-17', 'num': 'Öğreniyorum 17', 'title': 'Önerme Kavramı', 'pages': '54-55', 'q_count': 12},
                            {'id': 'cap-t1-ogr-18', 'num': 'Öğreniyorum 18', 'title': 'Önermelerin Sembolik Dille İfadesi', 'pages': '56-57', 'q_count': 12},
                            {'id': 'cap-t1-ogr-19', 'num': 'Öğreniyorum 19', 'title': 'Sayı Kümelerinin İşlem Özellikleri', 'pages': '58-59', 'q_count': 12},
                            {'id': 'cap-t1-ogr-20', 'num': 'Öğreniyorum 20', 'title': 'Tam Kare Özdeşlikleri - 1', 'pages': '60-61', 'q_count': 12},
                            {'id': 'cap-t1-ogr-21', 'num': 'Öğreniyorum 21', 'title': 'Tam Kare Özdeşlikleri - 2', 'pages': '62-63', 'q_count': 12},
                            {'id': 'cap-t1-ogr-22', 'num': 'Öğreniyorum 22', 'title': 'İki Kare Farkı Özdeşliği', 'pages': '64-65', 'q_count': 12},
                            {'id': 'cap-t1-pek-7', 'num': 'Pekiştiriyorum 7', 'title': 'Özdeşlikler ve Önerme - Test 1', 'pages': '66-67', 'q_count': 12},
                            {'id': 'cap-t1-pek-8', 'num': 'Pekiştiriyorum 8', 'title': 'Özdeşlikler ve Önerme - Test 2', 'pages': '68-69', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-1-6',
                        'name': '1.6 1. Tema Tarama Testleri',
                        'tests': [
                            {'id': f'cap-t1-tar-{i}', 'num': f'Tema Tarama {i}', 'title': f'Sayılar Tema Tarama - Test {i}', 'pages': f'{70 + (i-1)*2}-{71 + (i-1)*2}', 'q_count': 12} for i in range(1, 6)
                        ]
                    }
                ]
            },
            {
                'id': 'cap-t2',
                'name': '2. Tema: Nicelikler ve Değişimler',
                'description': 'Doğrusal fonksiyonlar, mutlak değer fonksiyonları, denklem ve eşitsizlikler',
                'subtopics': [
                    {
                        'id': 'sub-2-1',
                        'name': '2.1 Doğrusal Fonksiyonlar, Parçalı ve Sabit Fonksiyon',
                        'tests': [
                            {'id': 'cap-t2-ogr-1', 'num': 'Öğreniyorum 1', 'title': 'f(x) = x ve f(x) = ax Doğrusal Referans Fonksiyonu', 'pages': '86-87', 'q_count': 12},
                            {'id': 'cap-t2-ogr-2', 'num': 'Öğreniyorum 2', 'title': 'f(x) = x + b Şeklinde Tanımlı Doğrusal Fonksiyonlar', 'pages': '88-89', 'q_count': 12},
                            {'id': 'cap-t2-ogr-3', 'num': 'Öğreniyorum 3', 'title': 'f(x) = ax + b Şeklinde Tanımlı Doğrusal Fonksiyonlar', 'pages': '90-91', 'q_count': 12},
                            {'id': 'cap-t2-ogr-4', 'num': 'Öğreniyorum 4', 'title': 'f(x) = a(x + r) + k Şeklinde Doğrusal Fonksiyonlar', 'pages': '92-93', 'q_count': 12},
                            {'id': 'cap-t2-ogr-5', 'num': 'Öğreniyorum 5', 'title': 'Sabit Fonksiyon', 'pages': '94-95', 'q_count': 12},
                            {'id': 'cap-t2-ogr-6', 'num': 'Öğreniyorum 6', 'title': 'Fonksiyonların Parçalı Gösterimi - 1', 'pages': '96-97', 'q_count': 12},
                            {'id': 'cap-t2-ogr-7', 'num': 'Öğreniyorum 7', 'title': 'Fonksiyonların Parçalı Gösterimi - 2', 'pages': '98-99', 'q_count': 12},
                            {'id': 'cap-t2-pek-1', 'num': 'Pekiştiriyorum 1', 'title': 'Doğrusal Fonksiyonlar ve Nitel Özellikleri', 'pages': '100-101', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-2-2',
                        'name': '2.2 Mutlak Değer Fonksiyonları',
                        'tests': [
                            {'id': 'cap-t2-ogr-8', 'num': 'Öğreniyorum 8', 'title': '|x| Temel Mutlak Değer Fonksiyonu', 'pages': '103-104', 'q_count': 12},
                            {'id': 'cap-t2-ogr-9', 'num': 'Öğreniyorum 9', 'title': 'f(x) = |ax + b| Şeklinde Mutlak Değer Fonksiyonu', 'pages': '105-106', 'q_count': 12},
                            {'id': 'cap-t2-ogr-10', 'num': 'Öğreniyorum 10', 'title': 'f(x) = |ax + b| ± c Mutlak Değer Fonksiyonu', 'pages': '107-108', 'q_count': 12},
                            {'id': 'cap-t2-pek-2', 'num': 'Pekiştiriyorum 2', 'title': 'Mutlak Değer Fonksiyonları ve Nitel Özellikleri', 'pages': '109-110', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-2-3',
                        'name': '2.3 Denklem ve Eşitsizlikler',
                        'tests': [
                            {'id': 'cap-t2-ogr-11', 'num': 'Öğreniyorum 11', 'title': 'Birinci Dereceden Bir Bilinmeyenli Denklemler', 'pages': '112-113', 'q_count': 12},
                            {'id': 'cap-t2-ogr-12', 'num': 'Öğreniyorum 12', 'title': 'Birinci Dereceden Bir Bilinmeyenli Eşitsizlikler', 'pages': '114-115', 'q_count': 12},
                            {'id': 'cap-t2-ogr-13', 'num': 'Öğreniyorum 13', 'title': 'Denklem ve Eşitsizlik Problemleri - 1', 'pages': '116-117', 'q_count': 12},
                            {'id': 'cap-t2-ogr-14', 'num': 'Öğreniyorum 14', 'title': 'Denklem ve Eşitsizlik Problemleri - 2', 'pages': '118-119', 'q_count': 12},
                            {'id': 'cap-t2-ogr-15', 'num': 'Öğreniyorum 15', 'title': 'Denklem ve Eşitsizlik Problemleri - 3', 'pages': '120-121', 'q_count': 12},
                            {'id': 'cap-t2-ogr-16', 'num': 'Öğreniyorum 16', 'title': 'Mutlak Değerli Denklemler', 'pages': '122-123', 'q_count': 12},
                            {'id': 'cap-t2-ogr-17', 'num': 'Öğreniyorum 17', 'title': 'Mutlak Değer Eşitsizlikler - 1', 'pages': '124-125', 'q_count': 12},
                            {'id': 'cap-t2-ogr-18', 'num': 'Öğreniyorum 18', 'title': 'Mutlak Değerli Eşitsizlikler - 2', 'pages': '126-127', 'q_count': 12},
                            {'id': 'cap-t2-pek-3', 'num': 'Pekiştiriyorum 3', 'title': 'Denklem ve Eşitsizlikler Testi', 'pages': '128-129', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-2-4',
                        'name': '2.4 2. Tema Tarama Testleri',
                        'tests': [
                            {'id': 'cap-t2-tar-1', 'num': 'Tema Tarama 1', 'title': 'Nicelikler Tema Tarama - Test 1', 'pages': '130-131', 'q_count': 12},
                            {'id': 'cap-t2-tar-2', 'num': 'Tema Tarama 2', 'title': 'Nicelikler Tema Tarama - Test 2', 'pages': '132-134', 'q_count': 12}
                        ]
                    }
                ]
            },
            {
                'id': 'cap-t3',
                'name': '3. Tema: Geometrik Şekiller',
                'description': 'Üçgende açı özellikleri, açı-kenar ilişkileri',
                'subtopics': [
                    {
                        'id': 'sub-3-1',
                        'name': '3.1 Üçgende Açılar',
                        'tests': [
                            {'id': f'cap-t3-ogr-{i}', 'num': f'Öğreniyorum {i}', 'title': f'Üçgende Açılar - Bölüm {i}', 'pages': f'{139 + (i-1)*2}-{140 + (i-1)*2}', 'q_count': 12} for i in range(1, 7)
                        ] + [
                            {'id': 'cap-t3-pek-1', 'num': 'Pekiştiriyorum 1', 'title': 'Üçgende Açılar - Test 1', 'pages': '151-152', 'q_count': 12},
                            {'id': 'cap-t3-pek-2', 'num': 'Pekiştiriyorum 2', 'title': 'Üçgende Açılar - Test 2', 'pages': '153-154', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-3-2',
                        'name': '3.2 Üçgende Açı - Kenar İlişkileri',
                        'tests': [
                            {'id': 'cap-t3-ogr-7', 'num': 'Öğreniyorum 7', 'title': 'Açı - Kenar Özellikleri - 1', 'pages': '156-157', 'q_count': 12},
                            {'id': 'cap-t3-ogr-8', 'num': 'Öğreniyorum 8', 'title': 'Açı - Kenar Özellikleri - 2', 'pages': '158-159', 'q_count': 12},
                            {'id': 'cap-t3-pek-3', 'num': 'Pekiştiriyorum 3', 'title': 'Açı-Kenar İlişkileri Testi', 'pages': '160-161', 'q_count': 12}
                        ]
                    }
                ]
            },
            {
                'id': 'cap-t4',
                'name': '4. Tema: Eşlik ve Benzerlik',
                'description': 'Dönüşümler, eşlik ve benzerlik, Öklid ve Pisagor teoremleri',
                'subtopics': [
                    {
                        'id': 'sub-4-1',
                        'name': '4.1 Geometrik Dönüşümler',
                        'tests': [
                            {'id': 'cap-t4-ogr-1', 'num': 'Öğreniyorum 1', 'title': 'Yansıma Dönüşümü', 'pages': '165-166', 'q_count': 12},
                            {'id': 'cap-t4-ogr-2', 'num': 'Öğreniyorum 2', 'title': 'Öteleme Dönüşümü', 'pages': '167-168', 'q_count': 12},
                            {'id': 'cap-t4-ogr-3', 'num': 'Öğreniyorum 3', 'title': 'Dönme Dönüşümü', 'pages': '169-170', 'q_count': 12},
                            {'id': 'cap-t4-pek-1', 'num': 'Pekiştiriyorum 1', 'title': 'Dönüşümler Geometri Testi', 'pages': '171-172', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-4-2',
                        'name': '4.2 Üçgenlerin Eşliği ve Benzerliği (Tales)',
                        'tests': [
                            {'id': 'cap-t4-ogr-4', 'num': 'Öğreniyorum 4', 'title': 'Üçgenlerin Eşliği - 1', 'pages': '174-175', 'q_count': 12},
                            {'id': 'cap-t4-ogr-5', 'num': 'Öğreniyorum 5', 'title': 'Üçgenlerin Eşliği - 2', 'pages': '176-177', 'q_count': 12},
                            {'id': 'cap-t4-ogr-6', 'num': 'Öğreniyorum 6', 'title': 'Üçgenlerin Benzerliği', 'pages': '179-180', 'q_count': 12},
                            {'id': 'cap-t4-ogr-7', 'num': 'Öğreniyorum 7', 'title': 'Tales Teoremleri - 1', 'pages': '181-182', 'q_count': 12},
                            {'id': 'cap-t4-ogr-8', 'num': 'Öğreniyorum 8', 'title': 'Tales Teoremleri - 2', 'pages': '183-184', 'q_count': 12},
                            {'id': 'cap-t4-pek-2', 'num': 'Pekiştiriyorum 2', 'title': 'Üçgenlerde Benzerlik - Test 1', 'pages': '185-186', 'q_count': 12},
                            {'id': 'cap-t4-pek-3', 'num': 'Pekiştiriyorum 3', 'title': 'Üçgenlerde Benzerlik - Test 2', 'pages': '187-188', 'q_count': 12},
                            {'id': 'cap-t4-pek-4', 'num': 'Pekiştiriyorum 4', 'title': 'Üçgenlerde Benzerlik - Test 3', 'pages': '189-190', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-4-3',
                        'name': '4.3 Öklid ve Pisagor Teoremleri',
                        'tests': [
                            {'id': 'cap-t4-ogr-9', 'num': 'Öğreniyorum 9', 'title': 'Öklid Teoremleri - 1', 'pages': '192-193', 'q_count': 12},
                            {'id': 'cap-t4-ogr-10', 'num': 'Öğreniyorum 10', 'title': 'Öklid Teoremleri - 2', 'pages': '194-195', 'q_count': 12},
                            {'id': 'cap-t4-ogr-11', 'num': 'Öğreniyorum 11', 'title': 'Pisagor Teoremi - 1', 'pages': '196-197', 'q_count': 12},
                            {'id': 'cap-t4-ogr-12', 'num': 'Öğreniyorum 12', 'title': 'Pisagor Teoremi - 2', 'pages': '198-199', 'q_count': 12},
                            {'id': 'cap-t4-ogr-13', 'num': 'Öğreniyorum 13', 'title': 'Pisagor Teoremi - 3', 'pages': '200-201', 'q_count': 12},
                            {'id': 'cap-t4-ogr-14', 'num': 'Öğreniyorum 14', 'title': 'Pisagor Eşitsizliği', 'pages': '202-203', 'q_count': 12},
                            {'id': 'cap-t4-ogr-15', 'num': 'Öğreniyorum 15', 'title': 'Özel Açılı Üçgenler', 'pages': '204-205', 'q_count': 12},
                            {'id': 'cap-t4-pek-5', 'num': 'Pekiştiriyorum 5', 'title': 'Öklid ve Pisagor - Test 1', 'pages': '206-207', 'q_count': 12},
                            {'id': 'cap-t4-pek-6', 'num': 'Pekiştiriyorum 6', 'title': 'Öklid ve Pisagor - Test 2', 'pages': '208-209', 'q_count': 12},
                            {'id': 'cap-t4-pek-7', 'num': 'Pekiştiriyorum 7', 'title': 'Öklid ve Pisagor - Test 3', 'pages': '210-211', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-4-4',
                        'name': '4.4 4. Tema Tarama Testleri',
                        'tests': [
                            {'id': f'cap-t4-tar-{i}', 'num': f'Tema Tarama {i}', 'title': f'Eşlik ve Benzerlik Tarama - Test {i}', 'pages': f'{212 + (i-1)*2}-{213 + (i-1)*2}', 'q_count': 12} for i in range(1, 9)
                        ]
                    }
                ]
            },
            {
                'id': 'cap-t5',
                'name': '5. Tema: Algoritma ve Bilişim',
                'description': 'Algoritma, şifreleme, çizge kuramı ve mantık bağlaçları',
                'subtopics': [
                    {
                        'id': 'sub-5-1',
                        'name': '5.1 Algoritmik Problem Çözme ve Çizge Kuramı',
                        'tests': [
                            {'id': 'cap-t5-ogr-1', 'num': 'Öğreniyorum 1', 'title': 'Algoritma Temelli Problem Çözümü', 'pages': '233-234', 'q_count': 12},
                            {'id': 'cap-t5-ogr-2', 'num': 'Öğreniyorum 2', 'title': 'Şifreleme', 'pages': '235-236', 'q_count': 12},
                            {'id': 'cap-t5-ogr-3', 'num': 'Öğreniyorum 3', 'title': 'Çizge Kuramı (Graf Teorisi)', 'pages': '237-238', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-5-2',
                        'name': '5.2 Mantık Bağlaçları ve Niceleyiciler',
                        'tests': [
                            {'id': 'cap-t5-ogr-4', 'num': 'Öğreniyorum 4', 'title': 'Mantık Bağlaçları ve Niceleyiciler - 1', 'pages': '239-240', 'q_count': 12},
                            {'id': 'cap-t5-ogr-5', 'num': 'Öğreniyorum 5', 'title': 'Mantık Bağlaçları ve Niceleyiciler - 2', 'pages': '241-242', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-5-3',
                        'name': '5.3 5. Tema Tarama Testleri',
                        'tests': [
                            {'id': f'cap-t5-tar-{i}', 'num': f'Tema Tarama {i}', 'title': f'Algoritma ve Bilişim Tarama - Test {i}', 'pages': f'{243 + (i-1)*2}-{244 + (i-1)*2}', 'q_count': 12} for i in range(1, 7)
                        ]
                    }
                ]
            },
            {
                'id': 'cap-t6',
                'name': '6. Tema: İstatistiksel Araştırma Süreçleri',
                'description': 'Tek nicel değişkenli veri dağılımları ve süreç testleri',
                'subtopics': [
                    {
                        'id': 'sub-6-1',
                        'name': '6.1 Tek Nicel Değişkenli Veri Dağılımları',
                        'tests': [
                            {'id': f'cap-t6-ogr-{i}', 'num': f'Öğreniyorum {i}', 'title': f'İstatistiksel Araştırma Süreçleri - Test {i}', 'pages': f'{260 + (i-1)*2}-{261 + (i-1)*2}', 'q_count': 12} for i in range(1, 8)
                        ]
                    },
                    {
                        'id': 'sub-6-2',
                        'name': '6.2 6. Tema Tarama Testleri',
                        'tests': [
                            {'id': f'cap-t6-tar-{i}', 'num': f'Tema Tarama {i}', 'title': f'İstatistik Tarama - Test {i}', 'pages': f'{274 + (i-1)*2}-{275 + (i-1)*2}', 'q_count': 12} for i in range(1, 4)
                        ]
                    }
                ]
            },
            {
                'id': 'cap-t7',
                'name': '7. Tema: Veriden Olasılığa',
                'description': 'Veriden olasılığa geçiş ve deneysel olasılık testleri',
                'subtopics': [
                    {
                        'id': 'sub-7-1',
                        'name': '7.1 Gözleme Dayalı Tahmin ve Olasılık',
                        'tests': [
                            {'id': f'cap-t7-ogr-{i}', 'num': f'Öğreniyorum {i}', 'title': f'Veriden Olasılığı - Test {i}', 'pages': f'{285 + (i-1)*2}-{286 + (i-1)*2}', 'q_count': 12} for i in range(1, 6)
                        ]
                    },
                    {
                        'id': 'sub-7-2',
                        'name': '7.2 7. Tema Tarama Testleri',
                        'tests': [
                            {'id': f'cap-t7-tar-{i}', 'num': f'Tema Tarama {i}', 'title': f'Veriden Olasılığa Tarama - Test {i}', 'pages': f'{295 + (i-1)*2}-{296 + (i-1)*2}', 'q_count': 12} for i in range(1, 3)
                        ]
                    }
                ]
            }
        ]
    },
    {
        'id': 'orijinal-9',
        'title': 'Orijinal 9. Sınıf Matematik Soru Bankası',
        'short_title': 'Orijinal Matematik',
        'publisher': 'Orijinal Yayınları',
        'curriculum': '2026 Türkiye Yüzyılı Maarif Modeli',
        'pdf_filename': '9.SINIF MATEMATİK SORU BANKASI(2026).pdf',
        'target_school': 'Fen Lisesi & Anadolu Lisesi İleri Düzey',
        'color': '#f97316',
        'accent': 'orange',
        'themes': [
            {
                'id': 't1',
                'name': '1. Tema: Sayılar',
                'description': 'Üslü ve köklü gösterimler, gerçek sayılarda küme ve aralıklar, mutlak değer, sıralama, mantık ve özdeşlikler',
                'subtopics': [
                    {
                        'id': 'sub-1-1',
                        'name': '1.1 Gerçek Sayıların Üslü Gösterimi ve İşlemler',
                        'tests': [
                            {'id': 'orig-t1-tk1', 'num': 'Temel Kabul', 'title': '1. Tema Temel Kabul Soruları (Hazırbulunuşluk)', 'pages': '6-7', 'q_count': 12}
                        ] + [
                            {'id': f'orig-t1-test-{i}', 'num': f'Test {i}', 'title': f'Üslü Gösterim Test {i}', 'pages': f'{8 + (i-1)*1}-{8 + (i-1)*1 + 1}', 'q_count': 12} for i in range(1, 11)
                        ]
                    },
                    {
                        'id': 'sub-1-2',
                        'name': '1.2 Gerçek Sayıların Köklü Gösterimi ve İşlemler',
                        'tests': [
                            {'id': f'orig-t1-test-{i}', 'num': f'Test {i}', 'title': f'Köklü Gösterim Test {i}', 'pages': f'{21 + (i-11)*1}-{21 + (i-11)*1 + 1}', 'q_count': 12} for i in range(11, 20)
                        ]
                    },
                    {
                        'id': 'sub-1-3',
                        'name': '1.3 Gerçek Sayı Aralıkları ve Kümeler',
                        'tests': [
                            {'id': f'orig-t1-test-{i}', 'num': f'Test {i}', 'title': f'Gerçek Sayılarda Küme Test {i-19}', 'pages': f'{34 + (i-20)*1}-{34 + (i-20)*1 + 1}', 'q_count': 12} for i in range(20, 23)
                        ] + [
                            {'id': f'orig-t1-test-{i}', 'num': f'Test {i}', 'title': f'Sayı Aralıkları Test {i-22}', 'pages': f'{38 + (i-23)*1}-{38 + (i-23)*1 + 1}', 'q_count': 12} for i in range(23, 25)
                        ]
                    },
                    {
                        'id': 'sub-1-4',
                        'name': '1.4 Sayı Kümelerinde Sıralama ve Özellikler',
                        'tests': [
                            {'id': f'orig-t1-test-{i}', 'num': f'Test {i}', 'title': f'Mutlak Değerli Aralıklar Test {i-24}', 'pages': f'{40 + (i-25)*1}-{40 + (i-25)*1 + 1}', 'q_count': 12} for i in range(25, 30)
                        ] + [
                            {'id': f'orig-t1-test-{i}', 'num': f'Test {i}', 'title': f'Sayı Kümelerinde Sıralama Test {i-29}', 'pages': f'{48 + (i-30)*1}-{48 + (i-30)*1 + 1}', 'q_count': 12} for i in range(30, 34)
                        ]
                    },
                    {
                        'id': 'sub-1-5',
                        'name': '1.5 Önerme, İşlem Özellikleri ve Özdeşlikler',
                        'tests': [
                            {'id': f'orig-t1-test-{i}', 'num': f'Test {i}', 'title': f'Önerme (Mantık) Test {i-33}', 'pages': f'{54 + (i-34)*1}-{54 + (i-34)*1 + 1}', 'q_count': 12} for i in range(34, 36)
                        ] + [
                            {'id': f'orig-t1-test-{i}', 'num': f'Test {i}', 'title': f'İşlem Öncelikleri Test {i-35}', 'pages': f'{56 + (i-36)*1}-{56 + (i-36)*1 + 1}', 'q_count': 12} for i in range(36, 38)
                        ] + [
                            {'id': f'orig-t1-test-{i}', 'num': f'Test {i}', 'title': f'Özdeşlikler Test {i-37}', 'pages': f'{58 + (i-38)*1}-{58 + (i-38)*1 + 1}', 'q_count': 12} for i in range(38, 40)
                        ] + [
                            {'id': f'orig-t1-test-{i}', 'num': f'Test {i}', 'title': f'Üslü Denklemler ve İç İçe Kökler Test {i-39}', 'pages': f'{61 + (i-40)*2}-{61 + (i-40)*2 + 1}', 'q_count': 12} for i in range(40, 48)
                        ]
                    }
                ]
            },
            {
                'id': 't2',
                'name': '2. Tema: Nicelikler ve Değişimler',
                'description': 'Doğrusal fonksiyonlar, parçalı/sabit fonksiyonlar, dönüşümler, mutlak değer ve eşitsizlikler',
                'subtopics': [
                    {
                        'id': 'sub-2-1',
                        'name': '2.1 Doğrusal Fonksiyonlar, Parçalı ve Sabit Fonksiyon',
                        'tests': [
                            {'id': 'orig-t2-tk1', 'num': 'Temel Kabul', 'title': '2. Tema Temel Kabul Soruları (Hazırbulunuşluk)', 'pages': '82-83', 'q_count': 12}
                        ] + [
                            {'id': f'orig-t2-test-{i}', 'num': f'Test {i}', 'title': f'Doğrusal Fonksiyonlar Test {i}', 'pages': f'{84 + (i-1)*2}-{85 + (i-1)*2}', 'q_count': 12} for i in range(1, 5)
                        ] + [
                            {'id': f'orig-t2-test-{i}', 'num': f'Test {i}', 'title': f'Parçalı ve Sabit Fonksiyon Test {i-4}', 'pages': f'{93 + (i-5)*2}-{94 + (i-5)*2}', 'q_count': 12} for i in range(5, 11)
                        ] + [
                            {'id': f'orig-t2-test-{i}', 'num': f'Test {i}', 'title': f'Fonksiyonlarda Dönüşümler Test {i-10}', 'pages': f'{105 + (i-11)*2}-{106 + (i-11)*2}', 'q_count': 12} for i in range(11, 14)
                        ]
                    },
                    {
                        'id': 'sub-2-2',
                        'name': '2.2 Mutlak Değer Fonksiyonları',
                        'tests': [
                            {'id': f'orig-t2-test-{i}', 'num': f'Test {i}', 'title': f'Mutlak Değerli Fonksiyonlar Test {i-13}', 'pages': f'{112 + (i-14)*2}-{113 + (i-14)*2}', 'q_count': 12} for i in range(14, 19)
                        ]
                    },
                    {
                        'id': 'sub-2-3',
                        'name': '2.3 Denklem ve Eşitsizlikler',
                        'tests': [
                            {'id': f'orig-t2-test-{i}', 'num': f'Test {i}', 'title': f'Fonksiyonlarda Eşitsizlikler Test {i-18}', 'pages': f'{123 + (i-19)*2}-{124 + (i-19)*2}', 'q_count': 12} for i in range(19, 26)
                        ]
                    }
                ]
            },
            {
                'id': 't3',
                'name': '3. Tema: Geometrik Şekiller',
                'description': 'Üçgende açılar, açı-kenar bağıntıları',
                'subtopics': [
                    {
                        'id': 'sub-3-1',
                        'name': '3.1 Üçgende Açılar',
                        'tests': [
                            {'id': 'orig-t3-tk1', 'num': 'Temel Kabul', 'title': '3. Tema Temel Kabul Soruları (Hazırbulunuşluk)', 'pages': '140-142', 'q_count': 12}
                        ] + [
                            {'id': f'orig-t3-test-{i}', 'num': f'Test {i}', 'title': f'Üçgende Açılar Test {i}', 'pages': f'{143 + (i-1)*1}-{144 + (i-1)*1}', 'q_count': 12} for i in range(1, 10)
                        ]
                    },
                    {
                        'id': 'sub-3-2',
                        'name': '3.2 Üçgende Açı - Kenar İlişkileri',
                        'tests': [
                            {'id': f'orig-t3-test-{i}', 'num': f'Test {i}', 'title': f'Açı-Kenar Bağıntıları Test {i-9}', 'pages': f'{158 + (i-10)*1}-{159 + (i-10)*1}', 'q_count': 12} for i in range(10, 15)
                        ]
                    }
                ]
            },
            {
                'id': 't4',
                'name': '4. Tema: Eşlik ve Benzerlik',
                'description': 'Dönüşüm geometrisi, eş ve benzer üçgenler, Öklid ve Pisagor teoremleri',
                'subtopics': [
                    {
                        'id': 'sub-4-1',
                        'name': '4.1 Geometrik Dönüşümler',
                        'tests': [
                            {'id': 'orig-t4-test-1', 'num': 'Test 1', 'title': 'Dönüşüm Geometrisi Test 1', 'pages': '168-170', 'q_count': 12}
                        ]
                    },
                    {
                        'id': 'sub-4-2',
                        'name': '4.2 Üçgenlerin Eşliği ve Benzerliği (Tales)',
                        'tests': [
                            {'id': f'orig-t4-test-{i}', 'num': f'Test {i}', 'title': f'Eş Üçgenler Test {i-1}', 'pages': f'{171 + (i-2)*1}-{172 + (i-2)*1}', 'q_count': 12} for i in range(2, 4)
                        ] + [
                            {'id': f'orig-t4-test-{i}', 'num': f'Test {i}', 'title': f'Benzer Üçgenler Test {i-3}', 'pages': f'{174 + (i-4)*1}-{175 + (i-4)*1}', 'q_count': 12} for i in range(4, 17)
                        ]
                    },
                    {
                        'id': 'sub-4-3',
                        'name': '4.3 Öklid ve Pisagor Teoremleri',
                        'tests': [
                            {'id': f'orig-t4-test-{i}', 'num': f'Test {i}', 'title': f'Öklid Bağıntısı Test {i-16}', 'pages': f'{193 + (i-17)*1}-{194 + (i-17)*1}', 'q_count': 12} for i in range(17, 20)
                        ] + [
                            {'id': f'orig-t4-test-{i}', 'num': f'Test {i}', 'title': f'Pisagor Bağıntısı Test {i-19}', 'pages': f'{197 + (i-20)*1}-{198 + (i-20)*1}', 'q_count': 12} for i in range(20, 28)
                        ] + [
                            {'id': f'orig-t4-test-{i}', 'num': f'Test {i}', 'title': f'Açı-Kenar Bağıntıları Test {i-27}', 'pages': f'{207 + (i-28)*1}-{208 + (i-28)*1}', 'q_count': 12} for i in range(28, 30)
                        ] + [
                            {'id': f'orig-t4-test-{i}', 'num': f'Test {i}', 'title': f'İkizkenar ve Eşkenar Üçgende Öklid-Pisagor Test {i-29}', 'pages': f'{209 + (i-30)*2}-{210 + (i-30)*2}', 'q_count': 12} for i in range(30, 36)
                        ]
                    }
                ]
            },
            {
                'id': 't5',
                'name': '5. Tema: Algoritma ve Bilişim',
                'description': 'Algoritmik problem çözme, çizge kuramı, mantık bağlaçları',
                'subtopics': [
                    {
                        'id': 'sub-5-1',
                        'name': '5.1 Algoritmik Problem Çözme ve Çizge Kuramı',
                        'tests': [
                            {'id': 'orig-t5-tk1', 'num': 'Temel Kabul', 'title': '5. Tema Temel Kabul Soruları (Hazırbulunuşluk)', 'pages': '224-225', 'q_count': 12}
                        ] + [
                            {'id': f'orig-t5-test-{i}', 'num': f'Test {i}', 'title': f'Algoritmik Problem Çözme Test {i}', 'pages': f'{226 + (i-1)*2}-{227 + (i-1)*2}', 'q_count': 12} for i in range(1, 7)
                        ] + [
                            {'id': f'orig-t5-test-{i}', 'num': f'Test {i}', 'title': f'Çizge Kuramı Test {i-6}', 'pages': f'{238 + (i-7)*2}-{239 + (i-7)*2}', 'q_count': 12} for i in range(7, 10)
                        ]
                    },
                    {
                        'id': 'sub-5-2',
                        'name': '5.2 Mantık Bağlaçları ve Niceleyiciler',
                        'tests': [
                            {'id': f'orig-t5-test-{i}', 'num': f'Test {i}', 'title': f'Mantık Bağlaçları Test {i-9}', 'pages': f'{246 + (i-10)*1}-{247 + (i-10)*1}', 'q_count': 12} for i in range(10, 18)
                        ]
                    }
                ]
            },
            {
                'id': 't6',
                'name': '6. Tema: İstatistiksel Araştırma Süreci',
                'description': 'Veri toplama, analiz, dağılımlar ve süreç testleri',
                'subtopics': [
                    {
                        'id': 'sub-6-1',
                        'name': '6.1 Tek Nicel Değişkenli Veri Dağılımları ve Süreç Testleri',
                        'tests': [
                            {'id': 'orig-t6-tk1', 'num': 'Temel Kabul', 'title': '6. Tema Temel Kabul Soruları (Hazırbulunuşluk)', 'pages': '262-263', 'q_count': 12}
                        ] + [
                            {'id': f'orig-t6-test-{i}', 'num': f'Test {i}', 'title': f'İstatistiksel Süreç & Beceri Testi {i}', 'pages': f'{264 + (i-1)*1}-{265 + (i-1)*1}', 'q_count': 12} for i in range(1, 25)
                        ]
                    }
                ]
            },
            {
                'id': 't7',
                'name': '7. Tema: Veriden Olasılığa',
                'description': 'Olasılık hesapları, deneysel ve teorik olasılık',
                'subtopics': [
                    {
                        'id': 'sub-7-1',
                        'name': '7.1 Gözleme Dayalı Tahmin ve Olasılık',
                        'tests': [
                            {'id': 'orig-t7-tk1', 'num': 'Temel Kabul', 'title': '7. Tema Temel Kabul Soruları (Hazırbulunuşluk)', 'pages': '308-309', 'q_count': 12}
                        ] + [
                            {'id': f'orig-t7-test-{i}', 'num': f'Test {i}', 'title': f'Olasılık Test {i}', 'pages': f'{310 + (i-1)*1}-{311 + (i-1)*1}', 'q_count': 12} for i in range(1, 10)
                        ]
                    }
                ]
            }
        ]
    }
]

# Provide backwards-compatible 'topics' property alias as well
for b in books_data:
    for t in b['themes']:
        t['topics'] = [{'name': s['name'], 'tests': s['tests']} for s in t['subtopics']]

total_tests = 0
for b in books_data:
    b_tests = 0
    for t in b['themes']:
        for sub in t['subtopics']:
            b_tests += len(sub['tests'])
    total_tests += b_tests
    print(f"{b['title']}: {b_tests} test")

print(f"Total catalog tests: {total_tests}")

with open('curriculum_data.json', 'w', encoding='utf-8') as f:
    json.dump(books_data, f, ensure_ascii=False, indent=2)

print("curriculum_data.json updated successfully with full 'Öğreniyorum' and 'Pekiştiriyorum' and Orijinal tests!")
