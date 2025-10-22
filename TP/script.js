// قفل الألعاب وقت التحميل لمنع الشرشرة
document.documentElement.classList.add('loading');
window.addEventListener('load', () => {
  setTimeout(() => document.documentElement.classList.remove('loading'), 180);
});

/* ========== util ========== */
async function loadFirstAvailable(urls) {
  for (const url of urls) {
    const ok = await new Promise((res) => {
      const im = new Image();
      im.onload = () => res(true);
      im.onerror = () => res(false);
      im.src = url;
    });
    if (ok) return url;
  }
  return null;
}

/* ========== شعار أبيض تلقائي للـ intro / nav / footer ========== */
(async () => {
  const white = await loadFirstAvailable([
    'assets/logo-12-white.png',
    'assets/logo W-12.png',
    'assets/logoW-12.png',
    'assets/logo_w-12.png',
  ]);
  if (white) {
    const ids = ['introLogo', 'navLogoLight', 'footerLogoLight'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.getAttribute('src')) el.setAttribute('src', white);
    });
  }
})();

/* ========== تبديل لون الهيدر عند قسم الخلفية البيضاء ========== */
const nav = document.getElementById('topNav');
const whiteHero = document.querySelector('[data-nav-onwhite]');
if (whiteHero && nav) {
  const io = new IntersectionObserver(([e]) => {
    nav.classList.toggle('on-white', e.isIntersecting);
  }, { threshold: 0.6 });
  io.observe(whiteHero);

  const sc = new IntersectionObserver(([e]) => {
    nav.classList.toggle('scrolled', !e.isIntersecting);
  }, { rootMargin: '-120px 0px 0px 0px', threshold: 0 });
  sc.observe(document.body);
}

/* ========== زرّ لطيف (موشن ضوء) ========== */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('pointermove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', `${e.clientX - r.left}px`);
    btn.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

/* ========== WHY: تنشيط العناصر + نقاط السكة ========== */
const whyList = document.getElementById('whyList');
const whyWrap = document.getElementById('whyRailWrap');
if (whyList && whyWrap) {
  const items = [...whyList.querySelectorAll('.why-item')];

  // إنشاء نقاط على السكة بعدد العناصر
  items.forEach(() => {
    const dot = document.createElement('span');
    dot.className = 'rail-dot';
    whyWrap.appendChild(dot);
  });
  const dots = [...whyWrap.querySelectorAll('.rail-dot')];

  function positionDots() {
    const rail = whyWrap.querySelector('.why-rail');
    const rTop = rail.getBoundingClientRect().top + window.scrollY;
    const rH = rail.getBoundingClientRect().height;
    items.forEach((it, i) => {
      const b = it.getBoundingClientRect();
      const mid = b.top + window.scrollY - rTop + b.height / 2;
      dots[i].style.top = `${Math.min(Math.max(mid - 6, 0), rH - 12)}px`;
    });
  }
  positionDots();
  window.addEventListener('resize', positionDots);
  window.addEventListener('load', positionDots);

  const io = new IntersectionObserver((ents) => {
    ents.forEach(en => {
      const idx = items.indexOf(en.target);
      if (en.isIntersecting) {
        en.target.classList.add('in');
        dots[idx]?.classList.add('active');
      } else {
        en.target.classList.remove('in');
        dots[idx]?.classList.remove('active');
      }
    });
  }, { rootMargin: '-12% 0px -12% 0px', threshold: 0.35 });
  items.forEach(it => io.observe(it));
}

/* ========== ABOUT: رسم الخط المستقيم عند الظهور + دخول البطاقات بتتابع ========== */
const rails = document.querySelector('.about-visions .rails');
if (rails) {
  const ioRails = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) rails.classList.add('draw');
  }, { threshold: 0.25 });
  ioRails.observe(rails);
}

const vmCards = document.querySelectorAll('.vm-card');
if (vmCards.length) {
  const ioCards = new IntersectionObserver((ents) => {
    ents.forEach((en, i) => {
      if (en.isIntersecting) {
        en.target.style.transitionDelay = `${i * 120}ms`;
        en.target.classList.add('in');
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
  vmCards.forEach(c => ioCards.observe(c));
}

/* ========== زر الأعمال: يفتح الرابط المحدّد في data-works ========== */
const worksBtn = document.getElementById('worksBtn');
if (worksBtn) {
  const url = worksBtn.getAttribute('data-works');
  worksBtn.addEventListener('click', () => {
    if (url && url !== '#') worksBtn.setAttribute('href', url);
  });
}

/* ========== العملاء: تحميل اللوغوهات من assets/clients/C 1-12.png … ========== */
const track = document.getElementById('clientsTrack');
if (track) {
  (async () => {
    const logos = [];
    for (let i = 1; i <= 12; i++) {
      const path = `assets/clients/C ${i}-12.png`;
      const ok = await loadFirstAvailable([path]);
      if (ok) logos.push(ok);
    }
    if (!logos.length) return;

    // نكرّر السلسلة مرتين لحركة لا نهائية
    for (let k = 0; k < 2; k++) {
      logos.forEach(src => {
        const im = new Image();
        im.src = src;
        im.alt = 'Client';
        track.appendChild(im);
      });
    }
  })();
}

/* ========== ضبط سرعات التيكر من data-speed ========== */
document.querySelectorAll('.ticker-line').forEach(line => {
  const s = +line.dataset.speed || 24;
  line.style.setProperty('--dur1', `${s}s`);
  line.style.setProperty('--dur2', `${s + 2}s`);
});
/* ——— من نحن: Stroke Reveal ——— */
(() => {
  const section = document.querySelector('.about-visions');
  if (!section) return;

  // أنشئ العناصر (خط أساس + خطين رأسيين) بدون تعديل الـHTML
  const base  = document.createElement('span');
  base.className = 'stroke-base';
  const railL = document.createElement('span');
  railL.className = 'stroke-rail r-left';
  const railR = document.createElement('span');
  railR.className = 'stroke-rail thin r-right';

  section.append(base, railL, railR);

  // فعّل الحركة عند ظهور القسم
  const io = new IntersectionObserver(([e])=>{
    if (e.isIntersecting){
      section.classList.add('revealed');
      io.disconnect();
    }
  }, { threshold:.35 });
  io.observe(section);
})();
(() => {
  const about = document.querySelector('#about');
  if (!about) return;

  let ticking = false;

  function computeProgress() {
    const rect = about.getBoundingClientRect();
    const vh = window.innerHeight;

    // يبدأ التأثير بعد دخول بسيط وينتهي عند ~60% من ارتفاع السكشن
    const start = vh * 0.1;
    const end   = rect.height * 0.6;

    const midPos = (vh / 2) - rect.top;  // موضع منتصف الشاشة نسبةً للسكشن
    let p = (midPos - start) / (end - start);
    p = Math.max(0, Math.min(1, p));

    about.style.setProperty('--aboutP', p.toFixed(3));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      computeProgress();
      ticking = false;
    });
  }

  ['load','scroll','resize'].forEach(e =>
    window.addEventListener(e, onScroll, { passive: true })
  );
  onScroll();
})();

// Passive listeners للسكول/اللمس (أداء أفضل على الموبايل)
window.addEventListener('scroll', ()=>{}, { passive: true });
window.addEventListener('touchmove', ()=>{}, { passive: true });

// أعِد حساب نقاط WHY والدوتس بعد تدوير الشاشة
window.addEventListener('orientationchange', () => {
  setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
}, { passive: true });

// لو حسّيتي التيكر سريع جدًا على بعض الأجهزة الصغيرة
if (window.matchMedia('(max-width: 600px)').matches) {
  document.querySelectorAll('.ticker-line').forEach(line=>{
    line.style.setProperty('--dur1', '36s');
    line.style.setProperty('--dur2', '40s');
  });
}
