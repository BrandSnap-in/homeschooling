/**
 * DEVENDRA SIR COACHING — script.js
 * Mobile-first Vanilla JS | No dependencies
 * Features: Nav, Scroll Reveal, Counters, FAQ,
 *           Testimonial Carousel, WhatsApp Form
 */
'use strict';

/* ════════════════════════════════════
   1. NAVIGATION — sticky + mobile drawer
════════════════════════════════════ */
(function initNav() {
  const nav      = document.getElementById('nav');
  const burger   = document.getElementById('burger');
  const drawer   = document.getElementById('nav-drawer');
  const overlay  = document.getElementById('nav-overlay');
  const closeBtn = document.getElementById('drawer-close');
  if (!nav || !burger || !drawer) return;

  /* Scrolled class — affects bg and logo colour */
  const handleScroll = () => {
    const scrolled = window.scrollY > 60;
    nav.classList.toggle('scrolled', scrolled);
    nav.classList.toggle('hero-area', !scrolled);
    nav.classList.toggle('nav--light', scrolled);  // triggers CSS dual-logo swap
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* Open drawer */
  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('show');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // focus first link for accessibility
    drawer.querySelector('.drawer__link')?.focus();
  };

  /* Close drawer */
  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    burger.focus();
  };

  burger.addEventListener('click', () =>
    drawer.classList.contains('open') ? closeDrawer() : openDrawer()
  );
  closeBtn?.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  /* Auto-close when any [data-close] element is clicked */
  document.querySelectorAll('[data-close]').forEach(el =>
    el.addEventListener('click', closeDrawer)
  );

  /* Active nav link highlight on scroll */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const highlightNav = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
    });
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === '#' + current;
      link.style.color    = active ? 'var(--blue)' : '';
      link.style.fontWeight = active ? '700' : '';
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });
})();


/* ════════════════════════════════════
   2. SCROLL REVEAL — Intersection Observer
════════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll(
    '.reveal-fade, .reveal-up, .reveal-left, .reveal-right'
  );
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-v'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-v');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  els.forEach(el => io.observe(el));
})();


/* ════════════════════════════════════
   3. COUNTER ANIMATION
════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animateCount = el => {
    const target = parseFloat(el.dataset.count);
    const isFloat = el.dataset.float === 'true';
    const duration = 1500;
    const start = performance.now();

    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const val = target * easeOut(p);
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCount);
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
})();


/* ════════════════════════════════════
   4. TESTIMONIAL CAROUSEL
   Scroll-snap track with dot indicators
════════════════════════════════════ */
(function initCarousel() {
  const track = document.getElementById('reviews-track');
  const dotsWrap = document.getElementById('reviews-dots');
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  if (!cards.length) return;

  /* Build dot buttons */
  const dots = cards.map((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'reviews__dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', `Testimonial ${i + 1}`);
    btn.setAttribute('role', 'tab');
    btn.addEventListener('click', () => scrollToCard(i));
    dotsWrap.appendChild(btn);
    return btn;
  });

  /* Scroll to a card */
  const scrollToCard = idx => {
    const card = cards[idx];
    track.scrollTo({ left: card.offsetLeft - 20, behavior: 'smooth' });
  };

  /* Update active dot based on scroll position */
  let rafId;
  const updateDots = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const trackLeft = track.scrollLeft;
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - trackLeft);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closest));
    });
  };

  track.addEventListener('scroll', updateDots, { passive: true });

  /* Auto-advance on mobile every 5s */
  let autoIdx = 0;
  let autoTimer;
  const startAuto = () => {
    autoTimer = setInterval(() => {
      autoIdx = (autoIdx + 1) % cards.length;
      scrollToCard(autoIdx);
    }, 5000);
  };
  const stopAuto = () => clearInterval(autoTimer);

  // Pause auto on touch
  track.addEventListener('touchstart', stopAuto, { passive: true });
  track.addEventListener('touchend', () => {
    stopAuto();
    startAuto();
  }, { passive: true });

  // Only auto-advance on mobile viewports
  if (window.matchMedia('(max-width: 767px)').matches) startAuto();
})();


/* ════════════════════════════════════
   5. FAQ — close others when one opens
════════════════════════════════════ */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        items.forEach(other => { if (other !== item) other.open = false; });
      }
    });
  });
})();


/* ════════════════════════════════════
   6. WHATSAPP ENQUIRY FORM
════════════════════════════════════ */
(function initForm() {
  const submitBtn   = document.getElementById('form-submit');
  const globalErr   = document.getElementById('form-global-e');
  if (!submitBtn) return;

  /* Helper: get trimmed value */
  const val = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  /* Helper: get selected radio value */
  const radioVal = name => {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  };

  /* Set / clear field error */
  const setErr = (fieldId, msg) => {
    const inp = document.getElementById(fieldId);
    const err = document.getElementById(fieldId + '-e');
    if (inp) inp.classList.toggle('err', !!msg);
    if (err) err.textContent = msg || '';
  };

  const clearAll = () => {
    ['f-student', 'f-phone', 'f-class'].forEach(id => setErr(id, ''));
    if (globalErr) globalErr.textContent = '';
  };

  submitBtn.addEventListener('click', () => {
    clearAll();

    const student  = val('f-student');
    const parent   = val('f-parent');
    const phone    = val('f-phone');
    const email    = val('f-email');
    const cls      = val('f-class');
    const subject  = val('f-subject');
    const mode     = radioVal('mode');
    const message  = val('f-msg');

    /* ── Validation ── */
    let valid = true;

    if (!student) {
      setErr('f-student', 'Please enter the student\'s name.');
      if (valid) document.getElementById('f-student')?.focus();
      valid = false;
    }

    if (!phone) {
      setErr('f-phone', 'Phone number is required.');
      if (valid) document.getElementById('f-phone')?.focus();
      valid = false;
    } else if (phone.replace(/\D/g, '').length < 10) {
      setErr('f-phone', 'Please enter a valid 10-digit number.');
      if (valid) document.getElementById('f-phone')?.focus();
      valid = false;
    }

    if (!cls) {
      setErr('f-class', 'Please select the student\'s class.');
      valid = false;
    }

    if (!valid) {
      if (globalErr) globalErr.textContent = 'Please fill in the required fields above.';
      return;
    }

    /* ── Build WhatsApp message ── */
    const lines = [
      'Hello Devendra Sir,',
      '',
      'I would like to enquire about tuition classes.',
      '',
      `Student Name: ${student}`,
      parent  ? `Parent Name: ${parent}`      : null,
      `Phone Number: ${phone}`,
      email   ? `Email: ${email}`             : null,
      `Class: ${cls}`,
      subject ? `Subject: ${subject}`         : null,
      mode    ? `Preferred Mode: ${mode}`     : null,
      '',
      message ? `Message:\n${message}` : null,
      '',
      'Please share further details regarding admission, fees, and class timings.',
      '',
      'Thank You.'
    ]
      .filter(l => l !== null)
      .join('\n');

    const url = 'https://wa.me/919871316032?text=' + encodeURIComponent(lines);
    window.open(url, '_blank', 'noopener,noreferrer');

    /* UI feedback */
    const origHTML = submitBtn.innerHTML;
    submitBtn.textContent = '✓ Opening WhatsApp…';
    submitBtn.disabled = true;
    setTimeout(() => {
      submitBtn.innerHTML = origHTML;
      submitBtn.disabled  = false;
    }, 4000);
  });
})();


/* ════════════════════════════════════
   7. FOOTER YEAR
════════════════════════════════════ */
(function setYear() {
  const el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ════════════════════════════════════
   8. SMOOTH SCROLL for anchor links
   (backup for browsers without CSS smooth-scroll)
════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 70; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ════════════════════════════════════
   9. DUAL LOGO SWAP
   Dark backgrounds (hero) → logo_dark.png
   Light backgrounds (scrolled nav) → logo.png
════════════════════════════════════ */
(function initDualLogo() {
  const nav        = document.getElementById('nav');
  const logoDark   = document.getElementById('nav-logo-dark');   // shown on dark bg
  const logoLight  = document.getElementById('nav-logo-light');  // shown on light bg
  const logoFb     = document.getElementById('nav-logo-fallback'); // text fallback
  if (!nav) return;

  // Track which images actually loaded
  let darkLoaded  = false;
  let lightLoaded = false;
  let darkFailed  = false;
  let lightFailed = false;

  const applyLogo = (isDark) => {
    if (!logoDark && !logoLight) return;

    if (isDark) {
      // Hero / dark section — show logo_dark.png
      if (!darkFailed && logoDark) {
        if (logoDark)  logoDark.style.display  = 'block';
        if (logoLight) logoLight.style.display = 'none';
        if (logoFb)    logoFb.style.display    = 'none';
      } else if (!lightFailed && logoLight) {
        // Fallback: use logo.png with CSS invert filter
        if (logoDark)  logoDark.style.display  = 'none';
        if (logoLight) { logoLight.style.display = 'block'; logoLight.style.filter = 'brightness(0) invert(1)'; }
        if (logoFb)    logoFb.style.display    = 'none';
      } else {
        if (logoDark)  logoDark.style.display  = 'none';
        if (logoLight) logoLight.style.display = 'none';
        if (logoFb)    logoFb.style.display    = 'flex';
      }
    } else {
      // Scrolled / light background — show logo.png
      if (!lightFailed && logoLight) {
        if (logoDark)  logoDark.style.display  = 'none';
        if (logoLight) { logoLight.style.display = 'block'; logoLight.style.filter = ''; }
        if (logoFb)    logoFb.style.display    = 'none';
      } else if (!darkFailed && logoDark) {
        // Fallback: use logo_dark.png (may appear light on white, but better than nothing)
        if (logoDark)  logoDark.style.display  = 'block';
        if (logoLight) logoLight.style.display = 'none';
        if (logoFb)    logoFb.style.display    = 'none';
      } else {
        if (logoDark)  logoDark.style.display  = 'none';
        if (logoLight) logoLight.style.display = 'none';
        if (logoFb)    logoFb.style.display    = 'flex';
      }
    }
  };

  // Handle image load/error events
  if (logoDark) {
    logoDark.addEventListener('load',  () => { darkLoaded = true; });
    logoDark.addEventListener('error', () => { darkFailed = true; logoDark.style.display = 'none'; applyLogo(window.scrollY < 80); });
  }
  if (logoLight) {
    logoLight.addEventListener('load',  () => { lightLoaded = true; });
    logoLight.addEventListener('error', () => { lightFailed = true; logoLight.style.display = 'none'; applyLogo(window.scrollY < 80); });
  }

  // Update on scroll — hero threshold = 80px
  const update = () => applyLogo(window.scrollY < 80);
  window.addEventListener('scroll', update, { passive: true });
  update(); // run on load
})();
