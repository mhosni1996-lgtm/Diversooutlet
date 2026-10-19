/**
 * REACH — single editable content & configuration file.
 * All visible copy, navigation, services, projects and integration settings live here.
 */

export type ServiceId = 'identity' | 'content' | 'web' | 'campaigns';

export const site = {
  brand: {
    name: 'REACH',
    tagline: 'Marketing & Creative Agency',
    logo: {
      src: '/brand/reach-logo-360.png',
      src2x: '/brand/reach-logo-720.png',
      width: 1519,
      height: 820,
      alt: 'REACH',
    },
  },

  nav: [
    { id: 'top', label: 'الرئيسية' },
    { id: 'services', label: 'خدماتنا' },
    { id: 'work', label: 'أعمالنا' },
    { id: 'process', label: 'طريقتنا' },
    { id: 'contact', label: 'تواصل معنا' },
  ],

  cta: 'ابدأ مشروعك',

  hero: {
    kicker: '01 — ASSEMBLE',
    titleLines: ['نحوّل الأفكار', 'إلى تأثير.'],
    accentWord: 'تأثير.',
    copy: 'نبني حضور علامتك بالاستراتيجية، التصميم، والتسويق.',
    primary: 'ابدأ مشروعك',
    secondary: 'شاهد أعمالنا',
    scrollHint: 'مرّر للاستكشاف',
  },

  services: {
    kicker: '02 — OPEN',
    titleLines: ['خدمات مترابطة.', 'تأثير أكبر.'],
    intro: 'أربع مساحات عمل تتحرك كنظام واحد: كل خدمة تبني على الأخرى، لتصل علامتك بصوت واحد وواضح.',
    linkLabel: 'ابدأ بهذه الخدمة',
    items: [
      {
        id: 'identity' as ServiceId,
        no: '01',
        en: 'Brand Identity',
        title: 'الهوية البصرية',
        body: 'شعار وألوان وخطوط مبنية على فكرة واضحة، ونظام بصري متماسك يرافق علامتك في كل نقطة تواصل.',
        points: ['الاستراتيجية والتسمية', 'الشعار والنظام البصري', 'دليل الاستخدام'],
      },
      {
        id: 'content' as ServiceId,
        no: '02',
        en: 'Content & Photography',
        title: 'المحتوى والتصوير',
        body: 'محتوى مكتوب ومرئي، وتصوير منتجات وفيديو، يحكي قصة علامتك بلغة جمهورك.',
        points: ['خطط المحتوى', 'التصوير والفيديو', 'الكتابة الإبداعية'],
      },
      {
        id: 'web' as ServiceId,
        no: '03',
        en: 'Websites & E-commerce',
        title: 'المواقع والمتاجر الإلكترونية',
        body: 'مواقع ومتاجر سريعة وسهلة الاستخدام، مصممة لتحوّل الزيارة إلى خطوة فعلية.',
        points: ['تجربة المستخدم', 'التطوير والمتاجر', 'الأداء والتحسين'],
      },
      {
        id: 'campaigns' as ServiceId,
        no: '04',
        en: 'Advertising Campaigns',
        title: 'الحملات الإعلانية',
        body: 'حملات مدروسة على المنصات المناسبة، بأهداف واضحة وقياس مستمر وتحسين بعد كل جولة.',
        points: ['التخطيط الإعلامي', 'الإبداع الإعلاني', 'القياس والتقارير'],
      },
    ],
  },

  work: {
    kicker: '03 — FRAME',
    titleLines: ['أعمال تصنع الفرق.'],
    intro: 'نعرض هنا ما نملك حق عرضه فقط. المشاريع المعلّمة بـ«تصور تجريبي» نماذج توضيحية لأسلوبنا، وليست أعمالاً لعملاء.',
    openLabel: 'تفاصيل المشروع',
    conceptBadge: 'تصور تجريبي',
    conceptNote:
      'هذا تصور توضيحي لعرض أسلوب العمل، وليس مشروعاً لعميل حقيقي. سيُستبدل بأعمال فعلية عند توفرها.',
    projects: [
      {
        id: 'reach-identity',
        featured: true,
        concept: false,
        title: 'REACH — بناء الأبعاد',
        category: 'الهوية البصرية',
        categoryEn: 'Brand Identity · In-house',
        year: '2026',
        summary:
          'هوية REACH نفسها: شعار مبني من مكعبات مفتوحة وسهم اتجاه، يتحول إلى نظام ألوان وخطوط وتطبيقات على القرطاسية والتغليف والمنتجات.',
        details: [
          'الفكرة: «Structure meets action» — البنية الهندسية تلتقي بالحركة.',
          'الشعار: مكعبات مفتوحة بإسقاط مائل، وسهم أصفر يكسر الإطار.',
          'الألوان: أزرق كوبالت، أصفر حيوي، أزرق جليدي، وأبيض نقي.',
          'التطبيقات: قرطاسية، ملابس، تغليف، وواجهات رقمية.',
        ],
        note: 'الصور تصورات تطبيق (Mockups) مقدمة ضمن ملف الهوية.',
        cover: { base: '/work/reach-01', alt: 'شعار REACH على ملصق أبيض مع عبارة Building dimensions that click وأدوات مكتبية زرقاء وصفراء' },
        gallery: [
          { base: '/work/reach-02', alt: 'شبكة بناء شعار REACH مع الزوايا والنِّسب الهندسية' },
          { base: '/work/reach-03', alt: 'بطاقات ألوان الهوية: أزرق كوبالت، أصفر حيوي، أزرق جليدي، وأبيض' },
          { base: '/work/reach-04', alt: 'شعار REACH على أوراق رسمية مع عيّنة الخط الإنجليزي' },
          { base: '/work/reach-05', alt: 'تطبيقات رقمية للهوية على حاسوب محمول وهاتف ودفاتر' },
          { base: '/work/reach-06', alt: 'قرطاسية REACH: مغلفات ودفاتر ولوح مشابك' },
          { base: '/work/reach-07', alt: 'ملابس REACH: هودي وقميص وقبعة باللون الأزرق والأصفر' },
          { base: '/work/reach-08', alt: 'حقيبة قماشية تحمل شعار REACH مع غطاء هاتف وميدالية' },
          { base: '/work/reach-09', alt: 'صناديق تغليف كرتونية بنمط المكعبات وشريط REACH' },
          { base: '/work/reach-10', alt: 'ملصق Expand your reach مع منتجات الهوية' },
        ],
      },
      {
        id: 'concept-store',
        featured: false,
        concept: true,
        art: 'web' as const,
        title: 'تجربة متجر إلكتروني',
        category: 'المواقع والمتاجر الإلكترونية',
        categoryEn: 'E-commerce · Concept',
        year: '—',
        summary: 'تصور لواجهة متجر تعتمد على وحدات معيارية: تصفح أسرع، ومسار شراء أقصر، وهوية حاضرة في كل خطوة.',
        details: ['هيكل صفحات مبني على شبكة المكعبات.', 'مسار شراء من ثلاث خطوات.', 'مكونات قابلة لإعادة الاستخدام.'],
      },
      {
        id: 'concept-content',
        featured: false,
        concept: true,
        art: 'content' as const,
        title: 'سلسلة محتوى مرئي',
        category: 'المحتوى والتصوير',
        categoryEn: 'Content · Concept',
        year: '—',
        summary: 'تصور لنظام محتوى شهري: قوالب تصوير ثابتة، وإطارات تحريرية، وإيقاع نشر واضح.',
        details: ['قوالب تصوير موحدة للمنتجات.', 'إطارات تحريرية للمنصات المختلفة.', 'تقويم نشر شهري.'],
      },
      {
        id: 'concept-campaign',
        featured: false,
        concept: true,
        art: 'campaign' as const,
        title: 'حملة إطلاق منتج',
        category: 'الحملات الإعلانية',
        categoryEn: 'Campaign · Concept',
        year: '—',
        summary: 'تصور لحملة إطلاق متعددة المراحل: تشويق، ثم إعلان، ثم تحويل — برسالة واحدة تتطور.',
        details: ['ثلاث مراحل برسالة متصاعدة.', 'مواد متكيفة لكل منصة.', 'خطة قياس قبل الإطلاق.'],
      },
    ],
  },

  process: {
    kicker: '04 — CONNECT',
    titleLines: ['من الفكرة إلى الإطلاق.'],
    steps: [
      { no: '01', en: 'Understand', title: 'نفهم', body: 'نسمع منك، وندرس السوق والجمهور والمنافسين، ونحدد المشكلة الحقيقية قبل الحل.' },
      { no: '02', en: 'Plan', title: 'نخطط', body: 'نحوّل الفهم إلى استراتيجية واضحة: رسائل، وقنوات، وجدول زمني، ومؤشرات نجاح.' },
      { no: '03', en: 'Build', title: 'ننفذ', body: 'تصميم ومحتوى وتطوير وإطلاق، بفريق واحد ومعايير جودة ثابتة.' },
      { no: '04', en: 'Evolve', title: 'نطوّر', body: 'نقيس الأداء ونحسّن باستمرار، لأن الإطلاق بداية الطريق لا نهايته.' },
    ],
  },

  contact: {
    kicker: '05 — REACH',
    titleLines: ['جاهز للخطوة الجاية؟'],
    copy: 'احكيلنا عن مشروعك، ونحدد معاك الخطوة المناسبة.',
    submit: 'ابدأ المحادثة',
    fields: {
      name: 'الاسم',
      phone: 'رقم الهاتف',
      company: 'اسم الشركة',
      service: 'الخدمة المطلوبة',
      brief: 'نبذة عن المشروع',
    },
    servicePlaceholder: 'اختر الخدمة',
    extraServiceOptions: ['أكثر من خدمة', 'لست متأكداً بعد'],
    /**
     * Form integration. Leave `endpoint` empty until a real backend exists.
     * When set, the form POSTs JSON ({ name, phone, company, service, brief }) to this URL
     * and only reports success when the server answers with a 2xx status.
     */
    endpoint: '' as string,
    previewNotice: 'وضع المعاينة: النموذج غير مربوط بخدمة إرسال بعد، لذلك لن تصلنا أي بيانات تُدخلها هنا.',
    notConnected: 'لم تُرسل رسالتك: النموذج غير مربوط بخادم بعد. بياناتك لم تُحفظ ولم تغادر جهازك.',
    sending: 'جارٍ الإرسال…',
    success: 'وصلتنا رسالتك. سنتواصل معك قريباً.',
    failure: 'تعذّر إرسال الرسالة. حاول مرة أخرى بعد قليل.',
    /** Real contact details — leave null until officially supplied. Only non-null values render. */
    details: {
      email: null as string | null,
      phone: null as string | null,
      whatsapp: null as string | null,
      location: null as string | null,
    },
  },

  footer: {
    line: 'Building dimensions that click.',
    rights: 'جميع الحقوق محفوظة',
  },
} as const;

export type Project = (typeof site.work.projects)[number];
