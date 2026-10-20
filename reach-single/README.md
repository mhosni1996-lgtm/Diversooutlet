# موقع REACH — دليل النشر للمبرمج

موقع صفحة واحدة (Landing Page) بالعربية، اتجاه RTL. **لا يحتاج أي build أو framework أو قاعدة بيانات** — ملفات ثابتة تُرفع كما هي.

## محتويات الحزمة

| الملف | الوظيفة |
| --- | --- |
| `index.html` | الموقع كاملاً: HTML + CSS + JavaScript في ملف واحد. الشعار مضمّن داخله. |
| `assets/lenis.mjs` | مكتبة التمرير الناعم Lenis 1.3.23 (نسخة محلية، رخصة MIT). |
| `assets/lenis-LICENSE.txt` | رخصة المكتبة. |

## خطوات النشر

1. ارفع `index.html` ومجلد `assets/` **كما هما** إلى جذر الموقع (`public_html` أو `www` أو ما يعادله)، مع الحفاظ على نفس المسارات.
2. افتح الموقع عبر الدومين على `https://`. انتهى.

يعمل على أي استضافة ملفات ثابتة: cPanel / Apache / Nginx / Netlify / Vercel / Cloudflare Pages / GitHub Pages.
لو الموقع داخل مجلد فرعي (مثل `/landing/`) يعمل أيضاً، لأن كل المسارات نسبية.

> للمعاينة على جهازك قبل الرفع: شغّل سيرفر محلي من داخل المجلد، مثل `npx serve .` أو `python3 -m http.server`، ثم افتح `http://localhost:...`.
> فتح الملف بالنقر المزدوج (`file://`) يعمل أيضاً، لكن المتصفح يمنع تحميل المكتبة المحلية، فيعمل الموقع بالتمرير العادي بدلاً من الناعم.

## ⚠️ مطلوب قبل الإطلاق: ربط نموذج التواصل

النموذج حالياً في **وضع المعاينة**: يتحقق من البيانات، لكنه لا يرسلها لأي مكان، ويخبر الزائر بوضوح أن رسالته لم تُرسل (لا يعرض نجاحاً وهمياً).

للتفعيل، افتح `index.html` وابحث عن:

```js
const CONTACT_ENDPOINT = '';
```

وضع رابط الـ API الذي يستقبل الطلبات، مثلاً:

```js
const CONTACT_ENDPOINT = 'https://api.example.com/contact';
```

عند التفعيل:
- يختفي تنبيه «وضع المعاينة» تلقائياً.
- يرسل النموذج طلب `POST` بصيغة JSON:
  ```json
  { "name": "...", "phone": "...", "company": "...", "service": "...", "brief": "..." }
  ```
  (رقم الهاتف يُحوَّل للأرقام الإنجليزية قبل الإرسال؛ `company` اختياري وقد يكون فارغاً.)
- تظهر رسالة النجاح **فقط** إذا ردّ السيرفر بحالة `2xx`، وإلا تظهر رسالة خطأ.
- لو الـ API على دومين مختلف عن الموقع، فعّل **CORS** للسماح بطلبات `POST` و `Content-Type: application/json` من دومين الموقع.

بدائل بدون كتابة Backend: Formspree أو Getform أو Basin (أي خدمة تقبل POST بـ JSON)، أو Google Apps Script، أو Netlify Functions.

## تعديلات اختيارية لاحقاً

- **بيانات التواصل الرسمية وروابط السوشيال:** غير موجودة حالياً لأنها لم تُزوَّد بعد. تُضاف في الفوتر (قسم `footer__cols`).
- **أعمال حقيقية:** قسم «أعمالنا» (`id="works"`) يحتوي مشروع هوية REACH نفسه + 3 تصورات مُعلَّمة «تصور تجريبي». استبدلها بأعمال فعلية عند توفرها.
- **SEO / مشاركة الروابط:** أضف وسوم Open Graph (`og:title`, `og:description`, `og:image`) وصورة مشاركة 1200×630 داخل `<head>`.
- **Analytics:** يمكن إضافة سكربت التحليلات قبل `</head>`.
- **شعار بجودة أعلى:** الشعار المضمّن مستخرج من ملف الهوية. لو عندكم نسخة SVG رسمية، استبدل قيمة `--logo` في أول الـ CSS.

## ملاحظات تقنية

- الخطوط (Alexandria + Space Grotesk) تُحمَّل من Google Fonts.
- التمرير الناعم يعمل على الكمبيوتر فقط؛ على الموبايل يبقى التمرير أصلياً (Native) لتجنب التقطيع على iPhone.
- الموقع يحترم إعداد «تقليل الحركة» (`prefers-reduced-motion`) ويعرض المحتوى كاملاً بدون حركة.
- التصميم متجاوب (موبايل / تابلت / ديسكتوب) ويتكبّر تلقائياً على الشاشات الأكبر من 1920px.
- لا توجد صور خارجية: خلفية الهيرو والتأثير يُرسمان بالكود.

---

## English summary (for the developer)

Static single-page site (Arabic, RTL). No build step, no dependencies to install.

1. Upload `index.html` and the `assets/` folder, unchanged, to the web root. Serve over HTTPS. Relative paths, so a sub-folder works too.
2. **Before launch, connect the contact form:** set `const CONTACT_ENDPOINT = '';` in `index.html` to your endpoint. The form POSTs JSON `{ name, phone, company, service, brief }` and shows success only on a 2xx response. Enable CORS if the endpoint is on another origin. Until then the form clearly states nothing was sent.
3. Optional: add official contact details/social links in the footer, replace the concept portfolio items, add Open Graph tags and analytics.

Smooth scrolling (Lenis 1.3.23, MIT) loads from `assets/lenis.mjs`, falls back to the unpkg CDN, and falls back to native scrolling if both fail, so the page never depends on it. Fonts load from Google Fonts. Local preview: `npx serve .` (opening via `file://` works but without smooth scrolling).
