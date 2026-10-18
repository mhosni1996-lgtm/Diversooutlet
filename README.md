# Diverso — Shopify Theme

ثيم Shopify فاخر لمتجر ملابس رجالي تركي وإيطالي، مستوحى من مواقع البراندات الحديثة (NØRTH).
يدعم العربي (RTL) والإنجليزي، ومنتجاتك وأقسامك بتظهر أوتوماتيك من Shopify.

## التركيب على Shopify

**الطريقة 1 — GitHub (الأفضل، أي تعديل هنا بيوصل للمتجر أوتوماتيك):**
1. Shopify Admin ← Online Store ← Themes ← Add theme ← **Connect from GitHub**
2. اختار الريبو `Diversooutlet` والفرع.
3. اضغط **Customize** عشان تعاين الثيم من غير ما تنشره، ولما يعجبك اضغط **Publish**.

**الطريقة 2 — رفع ملف ZIP:**
1. نزّل الريبو كـ ZIP (Code ← Download ZIP).
2. Online Store ← Themes ← Add theme ← **Upload zip file**.

## بعد التركيب (من Customize)

| المكان | تعمل إيه |
|---|---|
| Header | ارفع اللوجو، واختار القائمة `main-menu` |
| Hero video | ارفع فيديو قصير للموديلز (10–20 ثانية) أو صورة |
| Product spotlight | اختار 3 منتجات مميزة (يفضل صور PNG بخلفية شفافة) |
| Featured collection | اختار الكولكشن اللي هيظهر في الصفحة الرئيسية |
| Collage / Floating 3D cards | ارفع صور اللوك بوك |
| Theme settings ← WhatsApp | رقم الواتساب بصيغة دولية `2010xxxxxxxx` |
| Theme settings ← Colors | الألوان (الافتراضي: أوف وايت + أسود + ذهبي) |

**اللغة العربية:** Settings ← Languages ← Add language ← Arabic ← Publish.
هيظهر زرار "عربي" في الهيدر، والموقع هيتقلب RTL أوتوماتيك.

**الفلاتر في صفحة الكتالوج:** نزّل تطبيق **Search & Discovery** من Shopify وفعّل فلاتر المقاس واللون والسعر.

## الأقسام المتاحة

Hero video · Product spotlight · Featured collection · Collage · Collection list · Floating 3D cards · Image with text · Scrolling text · Newsletter · Rich text

## الملفات

```
layout/     القالب العام (theme.liquid)
sections/   كل أقسام الصفحات
snippets/   أجزاء مشتركة (كارت المنتج، السعر، الأيقونات)
templates/  ترتيب الأقسام لكل صفحة
assets/     theme.css و theme.js
locales/    الترجمة (en / ar)
config/     إعدادات الثيم
```
