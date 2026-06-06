# راهنمای نصب Trade Journal Recorder در MT5

این Expert Advisor فقط معاملات را برای ژورنال ثبت می‌کند. معامله باز نمی‌کند، معامله را نمی‌بندد و مقدار SL یا TP را تغییر نمی‌دهد.

1. فایل `TradeJournalRecorder.mq5` را در مسیر `MT5 Data Folder > MQL5 > Experts` کپی کنید.
2. نرم‌افزار MetaEditor را باز کنید.
3. فایل EA را Compile کنید.
4. در MT5 گزینه Algo Trading را فعال کنید.
5. از منوی `Tools > Options > Expert Advisors` وارد تنظیمات شوید.
6. گزینه `Allow WebRequest for listed URL` را فعال کنید.
7. آدرس `http://127.0.0.1:3000` را به لیست مجاز اضافه کنید.
8. EA را فقط روی یک چارت وصل کنید.
9. مقدار `JOURNAL_API_BASE_URL` را روی `http://127.0.0.1:3000` قرار دهید.
10. مقدار `JOURNAL_UPLOAD_SECRET` را روی `test_journal_secret_123` قرار دهید.
11. برای تست، یک معامله دستی کوچک باز کنید و سپس آن را ببندید.
12. صفحه `/journal` را در وب‌سایت بررسی کنید.

نکته: اگر EA روی چارت XAUUSD باشد و شما معامله EURUSD باز کنید، EA باید رویداد معامله EURUSD را تشخیص دهد. اگر چارت EURUSD باز نباشد و `OPEN_CHART_FOR_SCREENSHOT=true` باشد، EA آن چارت را موقتاً باز می‌کند، اسکرین‌شات می‌گیرد و در صورت فعال بودن `CLOSE_TEMP_CHART_AFTER_SCREENSHOT` آن را می‌بندد.
