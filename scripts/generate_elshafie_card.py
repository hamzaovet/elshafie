import os
import base64
import subprocess
import shutil
import qrcode
from io import BytesIO
from PIL import Image

base_dir = r"D:\Work\elshafie"
public_dir = os.path.join(base_dir, "public")
artifact_dir = r"C:\Users\Dr Princa\.gemini\antigravity\brain\2d9d53fe-6b03-4ac8-8878-725378cea44d"

os.makedirs(public_dir, exist_ok=True)
os.makedirs(artifact_dir, exist_ok=True)

web_url = "https://elshafie.vercel.app"
apk_url = "https://elshafie.vercel.app/api/download/apk"

# Web QR
qr_web = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=1,
)
qr_web.add_data(web_url)
qr_web.make(fit=True)
img_web = qr_web.make_image(fill_color="#064e3b", back_color="#ffffff")
buf_web = BytesIO()
img_web.save(buf_web, format="PNG")
web_qr_b64 = base64.b64encode(buf_web.getvalue()).decode("ascii")

# APK QR
qr_apk = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=1,
)
qr_apk.add_data(apk_url)
qr_apk.make(fit=True)
img_apk = qr_apk.make_image(fill_color="#047857", back_color="#ffffff")
buf_apk = BytesIO()
img_apk.save(buf_apk, format="PNG")
apk_qr_b64 = base64.b64encode(buf_apk.getvalue()).decode("ascii")

img_web.save(os.path.join(public_dir, "elshafie-web-qr.png"))
img_apk.save(os.path.join(public_dir, "elshafie-apk-qr.png"))

html_content = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <style>
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}
    html, body {{
      width: 1080px;
      height: 620px;
      margin: 0;
      padding: 0;
      background: #01140e;
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }}
    .card-container {{
      width: 1080px;
      height: 620px;
      background: radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.22) 0%, transparent 45%),
                  radial-gradient(circle at 15% 85%, rgba(4, 120, 87, 0.25) 0%, transparent 45%),
                  linear-gradient(135deg, #064e3b 0%, #022c22 55%, #01140e 100%);
      border: 2px solid rgba(245, 158, 11, 0.55);
      border-radius: 28px;
      padding: 24px 36px 20px 36px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 0 40px rgba(16, 185, 129, 0.12);
    }}
    /* Header Bar */
    .header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }}
    .brand-wrap {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}
    .brand-logo {{
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background: linear-gradient(135deg, #10b981, #047857);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }}
    .brand-text h1 {{
      font-size: 27px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: -0.5px;
    }}
    .brand-text p {{
      font-size: 13px;
      color: #a7f3d0;
      font-weight: 700;
      margin-top: 3px;
    }}
    .badge-vip {{
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      background: rgba(16, 185, 129, 0.18);
      border: 1px solid rgba(16, 185, 129, 0.5);
      border-radius: 20px;
      color: #6ee7b7;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 1px;
    }}
    .badge-dot {{
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }}

    /* Features Strip */
    .features-strip {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: rgba(2, 44, 34, 0.75);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 14px;
      padding: 8px 16px;
      position: relative;
      z-index: 2;
    }}
    .feature-item {{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      font-size: 12px;
      font-weight: 700;
      color: #ecfdf5;
      white-space: nowrap;
    }}

    /* QR Grid */
    .qr-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
      position: relative;
      z-index: 2;
    }}
    .qr-card {{
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.7), rgba(2, 44, 34, 0.9));
      border: 1.5px solid rgba(16, 185, 129, 0.45);
      border-radius: 20px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(16, 185, 129, 0.1);
    }}
    .qr-img-box {{
      width: 135px;
      height: 135px;
      background: #ffffff;
      border-radius: 14px;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
      flex-shrink: 0;
    }}
    .qr-img-box img {{
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }}
    .qr-info {{
      display: flex;
      flex-direction: column;
      gap: 5px;
    }}
    .qr-info .pill {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.25);
      border: 1px solid rgba(16, 185, 129, 0.5);
      color: #a7f3d0;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 20px;
      width: fit-content;
    }}
    .qr-info h3 {{
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.3;
    }}
    .qr-info p {{
      font-size: 11.5px;
      color: #f59e0b;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      direction: ltr;
      text-align: right;
    }}

    /* Footer Info & Contacts */
    .footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(2, 44, 34, 0.9);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 14px;
      padding: 9px 18px;
      font-size: 11.5px;
      position: relative;
      z-index: 2;
    }}
    .contacts-row {{
      display: flex;
      align-items: center;
      gap: 20px;
    }}
    .contact-item {{
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ffffff;
      font-family: 'JetBrains Mono', sans-serif;
      font-weight: 700;
      font-size: 12px;
    }}
    .contact-item .lbl {{
      color: #f59e0b;
      font-family: 'Cairo', sans-serif;
      font-weight: 700;
    }}
    .location-box {{
      color: #a7f3d0;
      font-weight: 700;
      font-size: 11.5px;
    }}

    /* Developer Watermark */
    .watermark {{
      text-align: center;
      font-size: 12.5px;
      font-weight: 800;
      color: #fbbf24;
      letter-spacing: 0.4px;
      position: relative;
      z-index: 2;
      padding-top: 2px;
    }}
  </style>
</head>
<body>
  <div class="card-container">
    <!-- Header -->
    <div class="header">
      <div class="brand-wrap">
        <div class="brand-logo">🛒</div>
        <div class="brand-text">
          <h1>سوبر ماركت أولاد الشافعي</h1>
          <p>سوبر ماركت • أجبان ولحوم طازجة • خضروات وفاكهة • بقالة ومؤن</p>
        </div>
      </div>
      <div class="badge-vip">
        <div class="badge-dot"></div>
        <span>SMART VIP CARD • 2026</span>
      </div>
    </div>

    <!-- Features Strip -->
    <div class="features-strip">
      <div class="feature-item">
        <span>⚖️</span>
        <span>بيع بالوزن أو بالمبلغ المفتوح</span>
      </div>
      <div class="feature-item">
        <span>🛵</span>
        <span>توصيل سوبر سريع بـ 6 أكتوبر</span>
      </div>
      <div class="feature-item">
        <span>🧀</span>
        <span>أجبان ولحوم بلدية طازجة يومياً</span>
      </div>
      <div class="feature-item">
        <span>💳</span>
        <span>دفع كاش • فيزا • إنستاباي</span>
      </div>
    </div>

    <!-- Dual QR Codes -->
    <div class="qr-grid">
      <!-- Website QR -->
      <div class="qr-card">
        <div class="qr-img-box">
          <img src="data:image/png;base64,{web_qr_b64}" alt="Website QR">
        </div>
        <div class="qr-info">
          <span class="pill">🌐 المتجر الإلكتروني</span>
          <h3>تسوق أونلاين وتوصيل فوري</h3>
          <p>elshafie.vercel.app</p>
        </div>
      </div>

      <!-- App QR -->
      <div class="qr-card">
        <div class="qr-img-box">
          <img src="data:image/png;base64,{apk_qr_b64}" alt="APK Download QR">
        </div>
        <div class="qr-info">
          <span class="pill">📲 التطبيق الذكي</span>
          <h3>تحميل تطبيق الأندرويد الرسمي</h3>
          <p>elshafie.apk (v1.0.0)</p>
        </div>
      </div>
    </div>

    <!-- Contacts & Location -->
    <div class="footer">
      <div class="contacts-row">
        <div class="contact-item">
          <span class="lbl">مبيعات وطلبات:</span>
          <span>01032104457</span>
        </div>
        <div class="contact-item">
          <span class="lbl">إدارة وواتساب:</span>
          <span>0111871017</span>
        </div>
      </div>
      <div class="location-box">
        <span>📍 الحي السادس — مدينة السادس من أكتوبر — الجيزة</span>
      </div>
    </div>

    <!-- Developer Watermark -->
    <div class="watermark">
      تم التطوير بواسطة شركة أوركا لتقنية المعلومات — 01018671000
    </div>
  </div>
</body>
</html>
"""

html_path = os.path.join(base_dir, "scripts", "card.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

chrome_paths = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Users\Dr Princa\AppData\Local\Google\Chrome\Application\chrome.exe",
]
chrome_bin = next((p for p in chrome_paths if os.path.exists(p)), None)

out_png = os.path.join(public_dir, "elshafie-official-card.png")
root_png = os.path.join(base_dir, "elshafie-official-card.png")
artifact_png = os.path.join(artifact_dir, "elshafie-official-card.png")

if chrome_bin:
    raw_shot = os.path.join(public_dir, "raw_card_shot.png")
    cmd = [
        chrome_bin,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1114,724",
        f"--screenshot={raw_shot}",
        f"file:///{html_path.replace(os.sep, '/')}",
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(raw_shot):
        raw_im = Image.open(raw_shot)
        # Crop exact 1080x620 viewport box
        final_im = raw_im.crop((0, 0, 1080, 620))
        final_im.save(out_png)
        final_im.save(root_png)
        final_im.save(artifact_png)
        try:
            os.remove(raw_shot)
        except Exception:
            pass
        print("Successfully generated VIP card at:", out_png)
    else:
        print("Screenshot not produced, error:", res.stderr)
else:
    print("Chrome not found!")
