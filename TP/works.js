// === مسارات مرشّحة تلقائية للـPDF ===
// تأكد أن one of them موجود فعليًا (يفضّل هذا):
// assets/works/the-project-profile.pdf
const CANDIDATES = [
  'assets/works/the-project-profile.pdf',
  // احتياط للأسماء الشائعة:
  'assets/works/the project profile.pdf',
  'assets/works/the-project-profile.pdf.pdf',
  'assets/works/the project profile.pdf.pdf',
  'assets/the-project-profile.pdf',
  'assets/the project profile.pdf',
];

// عناصر واجهة
const pageInfoEl  = document.getElementById('pageInfo');
const directLink  = document.getElementById('directLink');
const flipbookEl  = document.getElementById('flipbook');
const pickPdfLink = document.getElementById('pickPdfLink');
const pdfPicker   = document.getElementById('pdfPicker');

// فحص وجود ملف/مسار
async function exists(url) {
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    return res.ok;
  } catch { return false; }
}

// عرض PDF ككتاب عبر PageFlip
async function showPdf(sourceUrlOrFile) {
  // تهيئة PDF.js
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const loadingTask = (sourceUrlOrFile instanceof File)
    ? pdfjsLib.getDocument({ data: await sourceUrlOrFile.arrayBuffer() })
    : pdfjsLib.getDocument(sourceUrlOrFile);

  const pdf = await loadingTask.promise;
  const total = pdf.numPages;

  // حول كل صفحة إلى صورة
  const images = [];
  for (let p = 1; p <= total; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width  = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL('image/jpeg', 0.9));
  }

  // استنتاج النسبة لقياس الكتاب
  const probe = new Image();
  probe.onload = () => {
    const ratio = probe.height / probe.width;
    const baseW = Math.min(900, Math.max(520, window.innerWidth * 0.86));
    const baseH = Math.round(baseW * ratio);

    // أنشئ الكتاب
    const pageFlip = new St.PageFlip(flipbookEl, {
      width: baseW, height: baseH,
      size: 'stretch', usePortrait: true,  // صفحة واحدة للجوال/الديسكتوب
      minWidth: 320, maxWidth: 1600,
      minHeight: 420, maxHeight: 2400,
      mobileScrollSupport: true,
      autoSize: true,
      disableFlipByClick: false,
      swipeDistance: 25
    });

    // حمّل الصور كصفحات
    pageFlip.loadFromImages(images);

    function updateInfo() {
      const i = pageFlip.getCurrentPageIndex();
      pageInfoEl.textContent = `صفحة ${i + 1} / ${pageFlip.getPageCount()}`;
    }
    pageFlip.on('flip', updateInfo);
    pageFlip.on('init', updateInfo);

    // أزرار التنقل
    document.getElementById('btnPrev').onclick = () => pageFlip.flipPrev();
    document.getElementById('btnNext').onclick = () => pageFlip.flipNext();

    // إعادة ضبط القياس عند تغيير العرض
    window.addEventListener('resize', () => {
      const w = Math.min(900, Math.max(520, window.innerWidth * 0.86));
      const h = Math.round(w * ratio);
      pageFlip.update({ width: w, height: h });
    });
  };
  probe.src = images[0];
}

(async function init() {
  // زر اختيار الملف يدويًا
  pickPdfLink?.addEventListener('click', (e) => {
    e.preventDefault();
    pdfPicker.click();
  });
  pdfPicker?.addEventListener('change', async () => {
    const file = pdfPicker.files?.[0];
    if (file) showPdf(file);
  });

  // جرّب العثور على الملف تلقائيًا
  let pdfPath = null;
  for (const c of CANDIDATES) {
    if (await exists(c)) { pdfPath = c; break; }
    const encoded = c.replace(/ /g, '%20');
    if (encoded !== c && await exists(encoded)) { pdfPath = encoded; break; }
  }

  if (pdfPath) {
    directLink.href = pdfPath;     // فتح مباشر
    await showPdf(pdfPath);        // عرض ككتاب
  } else {
    // رسالة تنبيه إذا لم يوجد
    const warn = document.createElement('p');
    warn.style.textAlign = 'center';
    warn.style.color = '#ffb3b3';
    warn.style.margin = '10px';
    warn.textContent =
      'لم أستطع العثور على the-project-profile.pdf داخل assets/works/. تأكد من الاسم والمسار، أو اختر الملف يدويًا.';
    flipbookEl.before(warn);
  }
})();
