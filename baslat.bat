@echo off
chcp 65001 > nul
title Mete ve Ege Test Çözme & Analiz Platformu
echo ======================================================================
echo   METE & EGE 9. SINIF MATEMATİK TEST TAKİP VE ANALİZ SİSTEMİ
echo   Türkiye Yüzyılı Maarif Modeli - Günlük 1 Test Prensibi
echo ======================================================================
echo.
echo Web uygulaması başlatılıyor: http://localhost:5000
echo Tarayıcınız otomatik olarak açılacaktır...
echo.
timeout /t 2 > nul
start http://localhost:5000
node server/index.js
pause
