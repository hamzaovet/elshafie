const fs = require('fs');
const qrs = JSON.parse(fs.readFileSync('d:/Work/elshafie/scripts/qrs.json', 'utf8'));

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Cairo', sans-serif;
    }
    body {
      width: 1080px;
      height: 640px;
      overflow: hidden;
      background: #021a14;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .card-frame {
      width: 1048px;
      height: 608px;
      background: radial-gradient(circle at 50% 0%, #064e3b 0%, #022c22 45%, #01140e 100%);
      border: 1.5px solid rgba(245, 158, 11, 0.45);
      border-radius: 28px;
      padding: 24px 32px 18px 32px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-box {
      width: 58px;
      height: 58px;
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
    }
    .brand-title {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .brand-sub {
      font-size: 13px;
      color: #a7f3d0;
      font-weight: 600;
      margin-top: 2px;
    }
    .vip-pill {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      padding: 6px 16px;
      border-radius: 20px;
      color: #6ee7b7;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .vip-dot {
      width: 7px;
      height: 7px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }
    .feature-strip {
      width: 100%;
      background: rgba(2, 44, 34, 0.7);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 14px;
      padding: 8px 18px;
      display: flex;
      justify-content: space-between;
      color: #ecfdf5;
      font-size: 12px;
      font-weight: 700;
      margin-top: 4px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .qr-section {
      display: flex;
      gap: 24px;
      justify-content: center;
      width: 100%;
      margin: 8px 0;
    }
    .qr-card {
      flex: 1;
      max-width: 440px;
      background: rgba(2, 44, 34, 0.55);
      border: 1.5px solid rgba(16, 185, 129, 0.35);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }
    .qr-img-wrapper {
      width: 140px;
      height: 140px;
      background: #ffffff;
      border-radius: 14px;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      flex-shrink: 0;
    }
    .qr-img-wrapper img {
      width: 100%;
      height: 100%;
      object-contain: cover;
    }
    .qr-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .qr-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
    }
    .qr-desc {
      font-size: 11px;
      color: #a7f3d0;
      line-height: 1.4;
    }
    .qr-url {
      font-size: 11px;
      font-weight: 800;
      color: #f59e0b;
      font-family: monospace;
      direction: ltr;
      text-align: right;
    }
    .info-footer {
      border-top: 1px solid rgba(16, 185, 129, 0.2);
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      color: #d1fae5;
      font-size: 11.5px;
      font-weight: 600;
    }
    .watermark-row {
      text-align: center;
      font-size: 12.5px;
      font-weight: 800;
      color: #fbbf24;
      padding-top: 4px;
      border-top: 1px dashed rgba(245, 158, 11, 0.3);
      letter-spacing: 0.3px;
    }
  </style>
</head>
<body>
  <div class="card-frame">
    <!-- Header -->
    <div class="header-row">
      <div class="brand-group">
        <div class="logo-box">🛒</div>
        <div>
          <div class="brand-title">سوبر ماركت أولاد الشافعي</div>
          <div class="brand-sub">سوبر ماركت • أجبان ولحوم طازجة • خضروات وفاكهة • بقالة ومؤن</div>
        </div>
      </div>
      <div class="vip-pill">
        <div class="vip-dot"></div>
        <span>SMART VIP CARD • 2026</span>
      </div>
    </div>

    <!-- Feature Strip -->
    <div class="feature-strip">
      <div class="feature-item"><span>⚖️</span><span>بيع بالوزن أو بالمبلغ المفتوح</span></div>
      <div class="feature-item"><span>🛵</span><span>توصيل سوبر سريع بـ 6 أكتوبر</span></div>
      <div class="feature-item"><span>🧀</span><span>أجبان ولحوم بلدية طازجة يومياً</span></div>
      <div class="feature-item"><span>💳</span><span>دفع كاش • فيزا • إنستاباي</span></div>
    </div>

    <!-- Dual QRs -->
    <div class="qr-section">
      <!-- Web QR -->
      <div class="qr-card">
        <div class="qr-img-wrapper">
          <img src="${qrs.web}" alt="Web Store QR">
        </div>
        <div class="qr-info">
          <div class="qr-badge">🌐 زيارة المتجر والطلب أونلاين</div>
          <div class="qr-desc">تصفح أكثر من 1,000 صنف، عروض الأسبوع وتوصيل حتى باب المنزل</div>
          <div class="qr-url">elshafie.vercel.app</div>
        </div>
      </div>

      <!-- APK QR -->
      <div class="qr-card">
        <div class="qr-img-wrapper">
          <img src="${qrs.apk}" alt="APK Download QR">
        </div>
        <div class="qr-info">
          <div class="qr-badge">📲 تحميل تطبيق الأندرويد الرسمي</div>
          <div class="qr-desc">تطبيق رسمي خفيف وسريع، إشعارات العروض الحصرية وتتبع الطلب</div>
          <div class="qr-url">elshafie.apk (v1.0.0)</div>
        </div>
      </div>
    </div>

    <!-- Footer Details & Developer Watermark -->
    <div class="info-footer">
      <div class="meta-row">
        <span>📍 الحي السادس — مدينة السادس من أكتوبر — الجيزة</span>
        <span dir="ltr">📞 01032104457 — 0111871017</span>
        <span>⏱️ يومياً من 8:00 ص حتى 2:00 ص</span>
      </div>
      <div class="watermark-row">
        تم التطوير بواسطة شركة أوركا لتقنية المعلومات — 01018671000
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('d:/Work/elshafie/scripts/card.html', html, 'utf8');
console.log('✅ card.html generated');
