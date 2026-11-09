/* ============================================
   ИП Филатова Наталья Геннадиевна — эффекты лендинга
   ============================================ */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  let preloaderDone = false;
  const hidePreloader = () => {
    if (preloaderDone || !preloader) return;
    preloaderDone = true;
    preloader.classList.add('done');
    document.body.classList.add('loaded');
  };
  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 500);
  } else {
    window.addEventListener('load', () => setTimeout(hidePreloader, 500));
  }
  setTimeout(hidePreloader, 3000); // страховка

  /* ---------- Header, прогресс, кнопка «наверх» ---------- */
  const header = document.getElementById('header');
  const progress = document.getElementById('progress');
  const toTop = document.getElementById('toTop');

  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('scrolled', y > 30);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
    toTop.classList.toggle('show', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  /* ---------- Мобильное меню ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  const setMenu = (open) => {
    burger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) setMenu(false);
  });

  /* ---------- Появление блоков при скролле ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => revealIO.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Активный пункт навигации ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const sections = Array.from(document.querySelectorAll('section[id]'));
  if ('IntersectionObserver' in window && sections.length) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-38% 0px -55% 0px', threshold: 0 });
    sections.forEach((section) => navIO.observe(section));
  }

  /* ---------- Анимированные счётчики ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (Number.isNaN(target)) return;
    if (prefersReduced) { el.textContent = String(target); return; }
    const duration = 1700;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = String(Math.round(target * easeOut(p)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => counterIO.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- 3D-наклон карточек ---------- */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const strength = parseFloat(card.dataset.tilt || '7');
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (x * 100).toFixed(2) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(2) + '%');
        card.style.transform =
          `perspective(950px) rotateX(${((0.5 - y) * strength).toFixed(2)}deg) ` +
          `rotateY(${((x - 0.5) * strength).toFixed(2)}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Магнитные кнопки ---------- */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('.btn, .contact-card').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform =
          `translate(${(x * 0.1).toFixed(1)}px, ${(y * 0.16).toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- Параллакс листьев в hero ---------- */
  const leaves = document.querySelectorAll('.hero__leaf[data-depth]');
  const hero = document.querySelector('.hero');
  if (leaves.length && hero && isFinePointer && !prefersReduced) {
    let mouseX = 0, mouseY = 0, curX = 0, curY = 0, rafId = null;

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width - 0.5;
      mouseY = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });

    const parallaxLoop = () => {
      curX += (mouseX - curX) * 0.06;
      curY += (mouseY - curY) * 0.06;
      leaves.forEach((leaf) => {
        const depth = parseFloat(leaf.dataset.depth);
        leaf.style.translate =
          `${(curX * depth * 260).toFixed(1)}px ${(curY * depth * 180).toFixed(1)}px`;
        leaf.style.rotate = `${(curX * depth * 18).toFixed(2)}deg`;
      });
      rafId = requestAnimationFrame(parallaxLoop);
    };
    parallaxLoop();
  }

  /* ---------- Свечение за курсором ---------- */
  const glow = document.getElementById('cursorGlow');
  if (glow && isFinePointer && !prefersReduced) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let posX = targetX, posY = targetY;
    let rafId = null;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    const followLoop = () => {
      posX += (targetX - posX) * 0.12;
      posY += (targetY - posY) * 0.12;
      glow.style.transform =
        `translate(${(posX - glow.offsetWidth / 2).toFixed(1)}px, ${(posY - glow.offsetHeight / 2).toFixed(1)}px)`;
      rafId = requestAnimationFrame(followLoop);
    };
    followLoop();
  }

  /* ---------- Частицы в hero (молекулы) ---------- */
  const canvas = document.getElementById('particles');
  if (canvas && !prefersReduced && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0, particles = [];
    let running = false, rafId = null;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const init = () => {
      const count = Math.min(85, Math.max(35, Math.floor((width * height) / 17000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.7 + 0.6,
        a: Math.random() * 0.45 + 0.12,
        color: Math.random() < 0.5 ? '200,164,95' : '159,197,174',
      }));
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;
        if (p.y < -4) p.y = height + 4;
        if (p.y > height + 4) p.y = -4;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            const alpha = (1 - Math.sqrt(d2) / 120) * 0.13;
            ctx.strokeStyle = `rgba(200,164,95,${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.a.toFixed(3)})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    const start = () => { if (!running) { running = true; draw(); } };
    const stop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };

    resize();
    init();
    start();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); init(); }, 180);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) start(); else stop();
      }, { threshold: 0.05 }).observe(canvas);
    }
  }

  /* ---------- Копирование реквизитов ---------- */
  document.querySelectorAll('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* ignore */ }
        ta.remove();
      }
      const original = btn.textContent;
      btn.textContent = 'Скопировано';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1600);
    });
  });

})();
