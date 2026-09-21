/* ================= STACKLY — main script ================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('done'), 900);
  });
  setTimeout(() => preloader && preloader.classList.add('done'), 2600);

  /* ---------- Custom cursor ---------- */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (dot) { dot.style.left = mouseX + 'px'; dot.style.top = mouseY + 'px'; }
  });
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    if (ring) { ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px'; }
    requestAnimationFrame(animateRing);
  }
  animateRing();
  document.querySelectorAll('a, button, input, textarea, select, .cat-card, .fleet-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring && ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring && ring.classList.remove('hover'));
  });

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    backToTop.classList.toggle('show', y > 600);
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Hamburger / mobile nav ---------- */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  const navOverlay = document.getElementById('navOverlay');

  function closeNav() {
    hamburger.classList.remove('open');
    mainNav.classList.remove('open');
    navOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  function toggleNav() {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    navOverlay.classList.toggle('show', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  hamburger.addEventListener('click', toggleNav);
  navOverlay.addEventListener('click', closeNav);
  document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeNav));

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* Only touch the nav state if this section actually owns a nav
           link (multi-page sections like the About-page story blocks
           don't, and shouldn't blank out a page's static active link). */
        const active = document.querySelector(`.nav-link[data-nav="${entry.target.id}"]`);
        if (active) {
          navLinks.forEach(l => l.classList.remove('active'));
          active.classList.add('active');
        }
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => navObserver.observe(s));

  /* ---------- Animated counters (Intersection Observer) ---------- */
  const counters = document.querySelectorAll('.stat-item');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const item = entry.target;
        const target = parseFloat(item.dataset.count);
        const decimals = parseInt(item.dataset.decimal || '0');
        const el = item.querySelector('.count');
        let current = 0;
        const duration = 1800;
        const start = performance.now();
        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          current = target * eased;
          el.textContent = decimals ? current.toFixed(decimals) : Math.floor(current).toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString();
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(item);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Fleet horizontal slider ---------- */
  const fleetTrack = document.getElementById('fleetTrack');
  const fleetPrev = document.getElementById('fleetPrev');
  const fleetNext = document.getElementById('fleetNext');
  if (fleetTrack) {
    const scrollAmount = () => (fleetTrack.querySelector('.fleet-card')?.offsetWidth || 320) + 24;
    fleetNext.addEventListener('click', () => fleetTrack.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
    fleetPrev.addEventListener('click', () => fleetTrack.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));

    /* drag to scroll */
    let isDown = false, startX, scrollLeft;
    fleetTrack.addEventListener('mousedown', e => {
      isDown = true; startX = e.pageX - fleetTrack.offsetLeft; scrollLeft = fleetTrack.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach(evt => fleetTrack.addEventListener(evt, () => isDown = false));
    fleetTrack.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - fleetTrack.offsetLeft;
      fleetTrack.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
  }

  /* ---------- Testimonial slider ---------- */
  const testiCards = document.querySelectorAll('.testi-card');
  const testiDotsWrap = document.getElementById('testiDots');
  let testiIndex = 0;
  if (testiCards.length) {
    testiCards.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => showTesti(i));
      testiDotsWrap.appendChild(dot);
    });
    function showTesti(i) {
      testiCards[testiIndex].classList.remove('active');
      testiDotsWrap.children[testiIndex].classList.remove('active');
      testiIndex = i;
      testiCards[testiIndex].classList.add('active');
      testiDotsWrap.children[testiIndex].classList.add('active');
    }
    setInterval(() => showTesti((testiIndex + 1) % testiCards.length), 5000);
  }

  /* ---------- Floating hero cards parallax (mouse move) ---------- */
  const heroStage = document.querySelector('.hero-car-stage');
  if (heroStage && window.matchMedia('(hover:hover)').matches) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const rect = heroStage.getBoundingClientRect();
      const relX = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const relY = (e.clientY - rect.top - rect.height / 2) / rect.height;
      document.querySelectorAll('[data-float]').forEach((card, i) => {
        const depth = (i + 1) * 8;
        card.style.transform = `translate(${relX * depth}px, ${relY * depth}px)`;
      });
    });
  }

  /* ---------- GSAP animations ---------- */
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    /* Hero entrance timeline */
    const heroTl = gsap.timeline({ delay: 0.4 });
    heroTl
      .from('.hero-kicker', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' })
      .from('.hero-title .line', { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out' }, '-=0.3')
      .from('.hero-desc', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .from('.hero-search', { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .from('.hero-tags span', { y: 14, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }, '-=0.3')
      .from('.hero-car-img', { scale: 0.85, opacity: 0, duration: 1, ease: 'power4.out' }, '-=0.9')
      .from('.floating-card', { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.7)' }, '-=0.5')
      .from('.hero-orbit-ring', { scale: 0.7, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.8');

    /* Steps progress line fills on scroll */
    gsap.to('#stepsProgress', {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.steps-wrap',
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 1
      }
    });

    /* Section title reveal (subtle, once per section) — kicker + title
       + underline sweep, treated as one small choreographed beat. */
    gsap.utils.toArray('.section-head, .about-content, .why-content, .contact-info').forEach(head => {
      const kicker = head.querySelector('.section-kicker');
      const title = head.querySelector('.section-title');
      const desc = head.querySelector('.section-desc');
      const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 85%' } });
      if (kicker) tl.from(kicker, { x: -18, opacity: 0, duration: 0.55, ease: 'power3.out' });
      if (title) tl.from(title, { y: 34, opacity: 0, duration: 0.75, ease: 'power4.out' }, '-=0.35');
      if (desc) tl.from(desc, { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.45');
    });

    /* ---------- STATS STRIP: pop + rotate in, digits already count ---------- */
    gsap.from('.stat-item', {
      y: 30, opacity: 0, scale: 0.7, rotate: -6, duration: 0.8, stagger: 0.12,
      ease: 'back.out(1.8)',
      scrollTrigger: { trigger: '.stats-inner', start: 'top 85%' }
    });

    /* ---------- ABOUT: clip-path wipe on main image, badge spins in,
       floating photo slides under it, copy points march in from the left ---------- */
    gsap.from('.about-img-main', {
      clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'power4.inOut',
      scrollTrigger: { trigger: '.about-media', start: 'top 78%' }
    });
    gsap.to('.about-img-main', {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.from('.about-img-float', {
      x: -60, opacity: 0, duration: 0.9, delay: 0.35, ease: 'power3.out',
      scrollTrigger: { trigger: '.about-media', start: 'top 78%' }
    });
    gsap.from('.about-badge', {
      scale: 0, rotate: -120, opacity: 0, duration: 0.9, delay: 0.6, ease: 'back.out(2.2)',
      scrollTrigger: { trigger: '.about-media', start: 'top 78%' }
    });
    gsap.from('.point', {
      x: -40, opacity: 0, duration: 0.65, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.about-points', start: 'top 85%' }
    });
    gsap.from('.about-content .btn-outline', {
      y: 16, opacity: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: '.about-points', start: 'top 80%' }
    });

    /* ---------- CATEGORIES: cards flip up out of the floor, row by row ---------- */
    gsap.utils.toArray('.cat-card').forEach((card, i) => {
      gsap.from(card, {
        rotateX: 55, y: 70, opacity: 0, transformOrigin: '50% 100%',
        duration: 0.85, delay: (i % 3) * 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%' }
      });
    });

    /* ---------- FLEET: cards slide in from the right like they're
       pulling into frame, staggered ---------- */
    gsap.from('.fleet-card', {
      x: 90, opacity: 0, rotate: 3, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.fleet-slider', start: 'top 82%' }
    });
    gsap.from('.fleet-nav button', {
      y: 16, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.fleet-nav', start: 'top 92%' }
    });

    /* ---------- HOW IT WORKS: step cards rise with a flip, then the
       number badge pops with an elastic bounce right after it lands ---------- */
    gsap.utils.toArray('.step-card').forEach((card, i) => {
      const num = card.querySelector('.step-num');
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%' } });
      tl.from(card, { y: 80, rotateX: -35, opacity: 0, transformOrigin: '50% 0%', duration: 0.75, ease: 'power3.out' })
        .from(num, { scale: 0, rotate: -180, duration: 0.55, ease: 'back.out(2.4)' }, '-=0.25');
    });

    /* ---------- WHY US: media reveals with a circular iris wipe,
       items alternate in from left/right with a rotating icon ---------- */
    gsap.from('.why-media img', {
      clipPath: 'circle(0% at 50% 50%)', duration: 1.1, ease: 'power3.inOut',
      scrollTrigger: { trigger: '.why-media', start: 'top 78%' }
    });
    gsap.utils.toArray('.why-item').forEach((item, i) => {
      const fromRight = i % 2 === 1;
      const icon = item.querySelector('i');
      const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 90%' } });
      tl.from(item, { x: fromRight ? 50 : -50, opacity: 0, duration: 0.65, ease: 'power3.out' });
      if (icon) tl.from(icon, { rotate: -90, scale: 0, duration: 0.45, ease: 'back.out(2)' }, '-=0.35');
    });

    /* ---------- PRICING: cards flip in on the Y axis like pages
       turning, featured plan drifts gently once settled ---------- */
    gsap.utils.toArray('.price-card').forEach((card, i) => {
      gsap.from(card, {
        rotateY: i % 2 === 0 ? -70 : 70, opacity: 0, transformOrigin: '50% 50%',
        duration: 0.85, delay: i * 0.12, ease: 'power3.out',
        scrollTrigger: {
          trigger: card, start: 'top 85%',
          onEnter: () => {
            if (card.classList.contains('featured')) {
              gsap.to(card, { y: -8, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.9 });
            }
          }
        }
      });
    });

    /* ---------- TESTIMONIALS: whole carousel scales up into place,
       stars sweep in left to right like a rating being cast ---------- */
    gsap.from('.testi-wrap', {
      scale: 0.9, opacity: 0, y: 20, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.testi-wrap', start: 'top 85%' }
    });
    gsap.from('.stars i', {
      scale: 0, opacity: 0, duration: 0.35, stagger: 0.08, ease: 'back.out(3)',
      scrollTrigger: { trigger: '.testi-wrap', start: 'top 80%' }
    });

    /* ---------- BLOG: cards wipe up from a hidden mask, cover image
       eases down from an over-zoom into its resting scale ---------- */
    gsap.utils.toArray('.blog-card').forEach((card, i) => {
      const img = card.querySelector('.blog-img img');
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 87%' } });
      tl.from(card, { clipPath: 'inset(100% 0 0 0)', y: 40, duration: 0.75, ease: 'power4.out' });
      if (img) tl.from(img, { scale: 1.35, duration: 1, ease: 'power2.out' }, '-=0.75');
    });

    /* ---------- CONTACT: info lines march in, form fields cascade up
       one after another like they're being filled in for you ---------- */
    gsap.from('.contact-line', {
      x: -30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-info', start: 'top 85%' }
    });
    gsap.from('.sk-social a', {
      scale: 0, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(2.5)',
      scrollTrigger: { trigger: '.sk-social', start: 'top 92%' }
    });
    gsap.from('.contact-form', {
      x: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-form', start: 'top 85%' }
    });
    gsap.from('.contact-form .form-field, .contact-form .submit-btn', {
      y: 22, opacity: 0, duration: 0.5, stagger: 0.09, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-form', start: 'top 78%' }
    });

    /* ---------- APP CTA: banner zooms in, shine sweeps across it on
       a loop, store badges pop in after the copy lands ---------- */
    gsap.from('.app-cta-inner', {
      scale: 0.92, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: {
        trigger: '.app-cta-inner', start: 'top 80%',
        onEnter: () => {
          gsap.to('.cta-shine', { left: '140%', duration: 2.4, ease: 'power1.inOut', repeat: -1, repeatDelay: 2.2 });
        }
      }
    });
    gsap.from('.store-badges a', {
      y: 20, opacity: 0, duration: 0.55, stagger: 0.12, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.store-badges', start: 'top 90%' }
    });
    gsap.from('.app-cta-inner > img', {
      x: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.app-cta-inner', start: 'top 80%' }
    });

    /* ---------- FOOTER: columns rise together, newsletter input
       gets a little extra emphasis ---------- */
    gsap.from('.footer-top > *', {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.footer-top', start: 'top 90%' }
    });

    /* ---------- Magnetic buttons: primary CTAs pull gently toward
       the cursor within their bounds, then spring back ---------- */
    document.querySelectorAll('.hs-submit, .login-btn, .submit-btn, .plan-btn').forEach(btn => {
      if (!window.matchMedia('(hover:hover)').matches) return;
      const moveX = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
      const moveY = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        moveX((e.clientX - r.left - r.width / 2) * 0.25);
        moveY((e.clientY - r.top - r.height / 2) * 0.3);
      });
      btn.addEventListener('mouseleave', () => { moveX(0); moveY(0); });
    });

    /* ---------- 3D tilt: category, fleet and pricing cards lean
       toward the cursor for a light showroom-turntable feel ---------- */
    document.querySelectorAll('.cat-card, .fleet-card, .price-card').forEach(card => {
      if (!window.matchMedia('(hover:hover)').matches) return;
      const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rotY(px * 10);
        rotX(py * -10);
      });
      card.addEventListener('mouseleave', () => { rotX(0); rotY(0); });
    });

    /* Images (all remote) can finish loading after ScrollTrigger has
       already measured the page, shifting section positions. Refresh
       once everything is in so no reveal gets stuck at its hidden
       starting state. */
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* =================================================================
     ABOUT PAGE — seven sections, seven distinct animation techniques.
     Everything below is scoped to <body class="page-about"> so none
     of it ever touches or slows down the homepage.
     ================================================================= */
  if (document.body.classList.contains('page-about') && window.gsap) {

    /* ---- 1. Story hero: characters fly in one by one, blobs drift via pure CSS ---- */
    const heroTitle = document.querySelector('.ap-hero-title');
    if (heroTitle) {
      const raw = heroTitle.textContent;
      heroTitle.textContent = '';
      const frag = document.createDocumentFragment();
      [...raw].forEach(ch => {
        const span = document.createElement('span');
        span.className = 'ap-char';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        frag.appendChild(span);
      });
      heroTitle.appendChild(frag);
      const chars = heroTitle.querySelectorAll('.ap-char');
      gsap.set(chars, { yPercent: 130, opacity: 0, rotate: 6 });
      gsap.timeline({ delay: 0.3 })
        .from('.ap-hero-kicker', { y: -14, opacity: 0, duration: 0.5, ease: 'power3.out' })
        .to(chars, { yPercent: 0, opacity: 1, rotate: 0, duration: 0.8, stagger: 0.018, ease: 'power4.out' }, '-=0.2')
        .from('.ap-hero-desc', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
        .from('.ap-hero-chip', { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
        .from('.ap-hero-media img', { scale: 1.15, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.9');
    }

    /* ---- 2. Mission & Vision: pinned scroll-scrub crossfade on desktop,
       a calm stacked fade-up on small screens (pinning is a poor fit for mobile) ---- */
    /* ---- 3. Journey: horizontal scroll-hijack timeline on desktop,
       a native swipeable strip on small screens ---- */
    gsap.matchMedia().add(
      { isDesktop: '(min-width: 900px)', isMobile: '(max-width: 899px)' },
      (context) => {
        const { isDesktop } = context.conditions;

        const panels = gsap.utils.toArray('.ap-mission-panel');
        const imgs = gsap.utils.toArray('.ap-mission-img');
        const badges = gsap.utils.toArray('.ap-mission-badge-panel');
        const steps = gsap.utils.toArray('.ap-mission-step');
        const railFill = document.getElementById('apMissionRailFill');

        if (isDesktop && panels.length === 2) {
          gsap.timeline({
            scrollTrigger: {
              trigger: '.ap-mission', start: 'top top', end: '+=100%',
              scrub: 1, pin: '.ap-mission-pin',
              onUpdate: self => {
                if (railFill) railFill.style.width = (self.progress * 100) + '%';
                const activeIndex = self.progress < 0.5 ? 0 : 1;
                steps.forEach(s => s.classList.toggle('active', Number(s.dataset.index) === activeIndex));
              }
            }
          })
            .to(panels[0], { opacity: 0, y: -30, duration: 1 })
            .to(imgs[0], { opacity: 0, duration: 1 }, '<')
            .to(imgs[1], { opacity: 1, duration: 1 }, '<')
            .to(badges[0], { opacity: 0, duration: 1 }, '<')
            .to(badges[1], { opacity: 1, duration: 1 }, '<')
            .fromTo(panels[1], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, '<');
        } else {
          panels.forEach(panel => {
            gsap.from(panel, {
              y: 30, opacity: 0, duration: 0.7, ease: 'power3.out',
              scrollTrigger: { trigger: panel, start: 'top 85%' }
            });
          });
        }

        const track = document.getElementById('apTimelineTrack');
        if (isDesktop && track) {
          const getDistance = () => track.scrollWidth - window.innerWidth + 80;
          gsap.to(track, {
            x: () => -getDistance(), ease: 'none',
            scrollTrigger: {
              trigger: '.ap-timeline-pin', start: 'top top',
              end: () => '+=' + getDistance(), scrub: 1, pin: true, invalidateOnRefresh: true
            }
          });
        }
      }
    );

    /* ---- 4. Values: each icon draws itself with its own stroke, cards
       pick up a soft spotlight that follows the cursor ---- */
    gsap.utils.toArray('.ap-value-card').forEach((card, i) => {
      const strokes = card.querySelectorAll('.ap-value-icon path, .ap-value-icon circle');
      strokes.forEach(p => {
        const len = p.getTotalLength ? p.getTotalLength() : 120;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.timeline({ delay: i * 0.05, scrollTrigger: { trigger: card, start: 'top 88%' } })
        .from(card, { y: 26, opacity: 0, duration: 0.6, ease: 'power3.out' })
        .to(strokes, { strokeDashoffset: 0, duration: 1, stagger: 0.08, ease: 'power2.out' }, '-=0.3');

      if (window.matchMedia('(hover:hover)').matches) {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
      }
    });

    /* ---- 5. Team: photos iris open from the centre, cards flip on
       hover (desktop) or a tap (touch) to reveal a short bio ---- */
    gsap.from('.ap-team-card', {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.ap-team-grid', start: 'top 85%' }
    });
    gsap.utils.toArray('.ap-team-photo').forEach((photo, i) => {
      gsap.fromTo(photo,
        { clipPath: 'circle(0% at 50% 50%)' },
        {
          clipPath: 'circle(75% at 50% 50%)', duration: 0.9, delay: i * 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: photo, start: 'top 88%' }
        }
      );
    });
    if (!window.matchMedia('(hover:hover)').matches) {
      document.querySelectorAll('.ap-team-card').forEach(card => {
        const inner = card.querySelector('.ap-team-inner');
        card.addEventListener('click', () => inner.classList.toggle('flipped'));
      });
    }

    /* ---- 6. Impact: circular rings draw themselves closed while the
       number underneath counts up in lockstep ---- */
    gsap.utils.toArray('.ap-ring').forEach(ring => {
      const target = parseFloat(ring.dataset.count);
      const numEl = ring.querySelector('.count');
      const fg = ring.querySelector('.ap-ring-fg');
      ScrollTrigger.create({
        trigger: ring, start: 'top 85%', once: true,
        onEnter: () => {
          gsap.to(fg, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.out' });
          const counter = { val: 0 };
          gsap.to(counter, {
            val: target, duration: 1.8, ease: 'power2.out',
            onUpdate: () => { numEl.textContent = Math.round(counter.val).toLocaleString(); }
          });
        }
      });
    });

    /* ---- 7. Join the ride: background shapes drift at different
       speeds as you scroll past, copy rises in, button ripples on click ---- */
    gsap.utils.toArray('.ap-shape').forEach(shape => {
      const factor = parseFloat(shape.dataset.parallax) || 1;
      gsap.to(shape, {
        yPercent: 40 * factor, ease: 'none',
        scrollTrigger: { trigger: '.ap-cta', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    gsap.from('.ap-cta-content > *', {
      y: 26, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.ap-cta-content', start: 'top 85%' }
    });
    document.querySelectorAll('.ap-ripple-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const r = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 1.6;
        const ripple = document.createElement('span');
        ripple.className = 'ap-ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* =================================================================
     SERVICES PAGE — 7 sections, seven more distinct animation
     techniques, scoped to <body class="page-services">.
     ================================================================= */
  if (document.body.classList.contains('page-services')) {

    /* ---- Core interactive logic: runs even if GSAP somehow fails to load ---- */

    /* 4. Add-ons: toggle switches feed a live running total */
    const addonChecks = document.querySelectorAll('.sv-addon-check');
    const addonTotalEl = document.getElementById('svAddonTotal');
    if (addonChecks.length && addonTotalEl) {
      const updateAddonTotal = () => {
        let sum = 0;
        addonChecks.forEach(chk => {
          if (chk.checked) sum += parseFloat(chk.closest('.sv-addon-card').dataset.price) || 0;
        });
        addonTotalEl.textContent = sum.toLocaleString();
        if (window.gsap) {
          gsap.fromTo(addonTotalEl.parentElement, { scale: 1.15 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
        }
      };
      addonChecks.forEach(chk => chk.addEventListener('change', updateAddonTotal));
    }

    /* 5. Pricing plans: segmented tab switcher + odometer-style price roll */
    const planTabs = document.querySelectorAll('.sv-plan-tab');
    const planPill = document.getElementById('svPlanPill');
    const planCards = document.querySelectorAll('.sv-plan-card');
    const movePlanPill = (tab) => {
      if (!planPill || !tab) return;
      const x = tab.offsetLeft, w = tab.offsetWidth;
      if (window.gsap) gsap.to(planPill, { x, width: w, duration: 0.4, ease: 'power3.out' });
      else { planPill.style.transform = `translateX(${x}px)`; planPill.style.width = w + 'px'; }
    };
    if (planTabs.length) {
      const initialTab = document.querySelector('.sv-plan-tab.active') || planTabs[0];
      requestAnimationFrame(() => movePlanPill(initialTab));
      window.addEventListener('load', () => movePlanPill(document.querySelector('.sv-plan-tab.active')));
      window.addEventListener('resize', () => movePlanPill(document.querySelector('.sv-plan-tab.active')));

      planTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          planTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          movePlanPill(tab);
          const period = tab.dataset.period;
          const suffix = period === 'daily' ? '/day' : period === 'weekly' ? '/week' : '/month';
          planCards.forEach(card => {
            const numEl = card.querySelector('.sv-plan-num');
            const suffixEl = card.querySelector('.sv-plan-suffix');
            if (!numEl || !card.dataset[period]) return;
            const target = parseFloat(card.dataset[period]);
            if (suffixEl) suffixEl.textContent = suffix;
            if (window.gsap) {
              const counter = { val: parseFloat(numEl.textContent.replace(/,/g, '')) || 0 };
              gsap.to(counter, {
                val: target, duration: 0.6, ease: 'power2.out',
                onUpdate: () => { numEl.textContent = Math.round(counter.val).toLocaleString(); }
              });
            } else {
              numEl.textContent = target.toLocaleString();
            }
          });
        });
      });
    }

    /* 7. FAQ accordion: one open at a time, smooth height tween */
    const faqItems = document.querySelectorAll('.sv-faq-item');
    const setFaqOpen = (item, open) => {
      const a = item.querySelector('.sv-faq-a');
      const inner = item.querySelector('.sv-faq-a-inner');
      item.classList.toggle('open', open);
      const target = open ? inner.offsetHeight : 0;
      if (window.gsap) gsap.to(a, { height: target, duration: 0.45, ease: 'power3.inOut' });
      else a.style.height = target + 'px';
    };
    faqItems.forEach(item => {
      setFaqOpen(item, item.classList.contains('open'));
      item.querySelector('.sv-faq-q').addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => { if (i !== item) setFaqOpen(i, false); });
        setFaqOpen(item, !isOpen);
      });
    });
    window.addEventListener('load', () => {
      faqItems.forEach(item => { if (item.classList.contains('open')) setFaqOpen(item, true); });
    });

    /* ---- Decorative scroll animations (need GSAP + ScrollTrigger) ---- */
    if (window.gsap) {

      /* 1. Hero: title decodes itself letter by letter, rest fades up */
      const scrambleEl = document.getElementById('svScrambleTitle');
      if (scrambleEl) {
        const finalText = scrambleEl.dataset.final || scrambleEl.textContent;
        const scrambleChars = '!<>-_\\/[]{}=+*^?#$%&';
        const runScramble = () => {
          let frame = 0;
          const totalFrames = 34;
          const queue = [...finalText].map(ch => {
            const start = Math.floor(Math.random() * totalFrames * 0.5);
            const end = start + Math.floor(Math.random() * totalFrames * 0.5) + 8;
            return { to: ch, start, end };
          });
          const step = () => {
            let out = '', done = 0;
            queue.forEach(q => {
              if (frame >= q.end) { out += q.to; done++; }
              else if (frame >= q.start) { out += q.to === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]; }
            });
            scrambleEl.textContent = out;
            if (done < queue.length) { frame++; requestAnimationFrame(step); }
          };
          step();
        };
        ScrollTrigger.create({ trigger: scrambleEl, start: 'top 90%', once: true, onEnter: runScramble });
      }
      gsap.from('.sv-hero-kicker', { y: -14, opacity: 0, duration: 0.5, delay: 0.15, ease: 'power3.out' });
      gsap.from('.sv-hero-desc', { y: 20, opacity: 0, duration: 0.7, delay: 0.5, ease: 'power3.out' });
      gsap.from('.sv-hero-stats > div', {
        y: 20, opacity: 0, duration: 0.6, stagger: 0.1, delay: 0.7, ease: 'power3.out'
      });

      /* 2. Categories: cards fly in from a shuffled deck and land in the grid */
      gsap.utils.toArray('.sv-cat-card').forEach((card, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.from(card, {
          x: dir * (50 + (i % 3) * 16), y: -70 - i * 5, rotate: dir * (9 + i * 2), scale: 0.75, opacity: 0,
          duration: 0.85, delay: i * 0.06, ease: 'power3.out',
          scrollTrigger: { trigger: '.sv-cat-grid', start: 'top 82%' }
        });
      });

      /* 3. Route: the path draws itself while a little car rides along it */
      const routePath = document.getElementById('svRoutePath');
      const routeCar = document.getElementById('svRouteCar');
      if (routePath && routeCar) {
        const routeLen = routePath.getTotalLength();
        gsap.set(routePath, { strokeDasharray: routeLen, strokeDashoffset: routeLen });
        ScrollTrigger.create({
          trigger: '.sv-route-wrap', start: 'top 75%', end: 'bottom 55%', scrub: 1,
          onUpdate: self => {
            const progress = self.progress;
            routePath.style.strokeDashoffset = routeLen * (1 - progress);
            const pt = routePath.getPointAtLength(routeLen * progress);
            const pt2 = routePath.getPointAtLength(Math.min(routeLen, routeLen * progress + 1));
            const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
            routeCar.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${angle})`);
          }
        });
        gsap.from('.sv-route-stop', {
          y: 20, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.sv-route-wrap', start: 'top 80%' }
        });
      }

      /* 4. Add-ons: cards and the total bar rise in */
      gsap.from('.sv-addon-card', {
        y: 20, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.sv-addon-grid', start: 'top 85%' }
      });
      gsap.from('.sv-addon-total', {
        y: 20, opacity: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.sv-addon-total', start: 'top 92%' }
      });

      /* 5. Plans: cards rise in below the tab switcher */
      gsap.from('.sv-plan-tabs', {
        y: 16, opacity: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.sv-plan-tabs', start: 'top 88%' }
      });
      gsap.from('.sv-plan-card', {
        y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.sv-plan-grid', start: 'top 85%' }
      });

      /* 6. Coverage map: lines draw out to each city, dots and labels pop in behind them */
      const mapLines = gsap.utils.toArray('.sv-map-line');
      const mapDots = gsap.utils.toArray('.sv-map-dot');
      const mapLabels = gsap.utils.toArray('.sv-map-label:not(.sv-map-label-hub)');
      if (mapLines.length) {
        mapLines.forEach(line => {
          const len = line.getTotalLength();
          gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set('.sv-map-dot', { transformOrigin: '50% 50%' });
        const mapTl = gsap.timeline({ scrollTrigger: { trigger: '.sv-map-wrap', start: 'top 75%' } });
        mapTl.from('.sv-map-hub', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(3)', transformOrigin: '50% 50%' })
             .to('.sv-map-label-hub', { opacity: 1, duration: 0.4 }, '<');
        mapLines.forEach((line, i) => {
          mapTl
            .to(line, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' }, i * 0.15 + 0.3)
            .fromTo(mapDots[i], { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(3)' }, i * 0.15 + 0.85)
            .to(mapLabels[i], { opacity: 1, duration: 0.4 }, i * 0.15 + 0.9);
        });
      }

      /* 7. FAQ + CTA: questions cascade in, the CTA copy rises above the moving road line */
      gsap.from('.sv-faq-item', {
        y: 18, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.sv-faq-list', start: 'top 85%' }
      });
      gsap.from('.sv-cta-road-inner > *', {
        y: 24, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.sv-cta-road', start: 'top 85%' }
      });

      window.addEventListener('load', () => ScrollTrigger.refresh());
    }
  }

  /* =================================================================
     BLOG PAGE — seven sections, seven fresh animation techniques.
     Scoped to <body class="page-blog"> only.
     ================================================================= */
  if (document.body.classList.contains('page-blog')) {

    /* ---- 1. Hero: ink-wipe headline reveal + drag-tilt photo stack ---- */
    if (window.gsap) {
      gsap.timeline({ delay: 0.3 })
        .to('.bl-wipe-fill', { clipPath: 'inset(0 0% 0 0)', duration: 0.9, stagger: 0.18, ease: 'power4.inOut' })
        .from('.bl-hero-desc', { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
        .from('.bl-hero-meta span', { y: 14, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, '-=0.4')
        .from('.bl-stack-3', { x: 60, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.7')
        .from('.bl-stack-2', { x: 60, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.6')
        .from('.bl-stack-1', { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.6');
    }
    const blStack = document.getElementById('blHeroStack');
    if (blStack) {
      blStack.addEventListener('mousemove', e => {
        const r = blStack.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        blStack.querySelectorAll('.bl-stack-card').forEach((card, i) => {
          const depth = (i + 1) * 10;
          const baseRotate = { 0: -3, 1: 6, 2: -9 }[i] || 0;
          card.style.transform = `translate(${px * depth}px, ${py * depth}px) rotate(${baseRotate + px * 4}deg)`;
        });
      });
      blStack.addEventListener('mouseleave', () => {
        blStack.querySelectorAll('.bl-stack-card').forEach((card, i) => {
          const baseRotate = { 0: -3, 1: 6, 2: -9 }[i] || 0;
          card.style.transform = `rotate(${baseRotate}deg)`;
        });
      });
    }

    /* ---- 2. Topic rail: magnetic liquid pill that morphs to the active filter ---- */
    const pillRail = document.getElementById('blPillRail');
    const pillLiquid = document.getElementById('blPillLiquid');
    const pills = document.querySelectorAll('.bl-pill');
    const blCards = document.querySelectorAll('.bl-card');
    const blEmpty = document.getElementById('blEmptyState');

   function moveLiquid(target) {
  if (!pillLiquid || !target) return;
  const railRect = pillRail.getBoundingClientRect();
  const btnRect = target.getBoundingClientRect();
  const x = btnRect.left - railRect.left;
  const y = btnRect.top - railRect.top;
  const w = btnRect.width;
  const h = btnRect.height;
  if (window.gsap) {
    gsap.to(pillLiquid, {
      x, y, width: w, height: h, opacity: 1, duration: 0.5, ease: 'power3.out',
      borderRadius: '40% 60% 55% 45% / 50% 45% 55% 50%'
    });
    gsap.to(pillLiquid, { borderRadius: '999px', duration: 0.35, delay: 0.5, ease: 'power2.out' });
  } else {
    pillLiquid.style.transform = `translate(${x}px, ${y}px)`;
    pillLiquid.style.width = w + 'px';
    pillLiquid.style.height = h + 'px';
    pillLiquid.style.opacity = 1;
  }
}

    function filterCards(filter) {
      let visible = 0;
      blCards.forEach((card, i) => {
        const match = filter === 'all' || card.dataset.cat === filter;
        if (match) {
          card.classList.remove('bl-hide');
          visible++;
          if (window.gsap) {
            gsap.fromTo(card, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, delay: i * 0.04, ease: 'power2.out' });
          }
        } else {
          card.classList.add('bl-hide');
        }
      });
      if (blEmpty) blEmpty.classList.toggle('show', visible === 0);
    }
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        moveLiquid(pill);
        filterCards(pill.dataset.filter);
      });
    });
    const activePill = document.querySelector('.bl-pill.active');
    if (activePill) requestAnimationFrame(() => moveLiquid(activePill));
    window.addEventListener('resize', () => {
      const cur = document.querySelector('.bl-pill.active');
      if (cur) moveLiquid(cur);
    });

    /* ---- 3. Featured grid: diagonal shutter-wipe reveal on scroll ---- */
    if (window.gsap) {
      document.querySelectorAll('.bl-card-media').forEach((media, i) => {
        const shutter = media.querySelector('.bl-shutter');
        if (!shutter) return;
        gsap.set(shutter, { clipPath: 'polygon(0 0,100% 0,100% 100%,0 40%)' });
        gsap.to(shutter, {
          clipPath: 'polygon(0 0,100% 0,100% 0%,0 0%)',
          duration: 0.9, ease: 'power3.inOut', delay: (i % 3) * 0.12,
          scrollTrigger: { trigger: media, start: 'top 88%' }
        });
        gsap.from(media.closest('.bl-card'), {
          y: 30, opacity: 0, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: media, start: 'top 88%' }
        });
      });
      window.addEventListener('load', () => ScrollTrigger.refresh());
    }

    /* ---- 4. Editor's picks: drag-driven 3D coverflow carousel ---- */
    const cfTrack = document.getElementById('blCoverflow');
    const cfCards = cfTrack ? Array.from(cfTrack.querySelectorAll('.bl-cf-card')) : [];
    const cfDots = document.getElementById('blCfDots');
    let cfIndex = 0;
    if (cfTrack && cfCards.length) {
      cfCards.forEach(() => {
        const dot = document.createElement('span');
        cfDots.appendChild(dot);
      });
      function renderCoverflow() {
        cfCards.forEach((card, i) => {
          const offset = i - cfIndex;
          const abs = Math.abs(offset);
          let x = offset * 200, scale = 1 - abs * 0.18, rotateY = offset * -28, z = -abs * 140, opacity = 1 - abs * 0.32, blur = abs * 1.5;
          if (abs > 2) { opacity = 0; }
          card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${Math.max(scale, 0.6)})`;
          card.style.opacity = opacity;
          card.style.filter = `blur(${blur}px)`;
          card.style.zIndex = 10 - abs;
        });
        cfDots.querySelectorAll('span').forEach((d, i) => d.classList.toggle('active', i === cfIndex));
      }
      function cfGo(i) {
        cfIndex = Math.max(0, Math.min(cfCards.length - 1, i));
        renderCoverflow();
      }
      document.getElementById('blCfPrev')?.addEventListener('click', () => cfGo(cfIndex - 1));
      document.getElementById('blCfNext')?.addEventListener('click', () => cfGo(cfIndex + 1));
      cfDots.addEventListener('click', e => {
        if (e.target.tagName === 'SPAN') cfGo(Array.from(cfDots.children).indexOf(e.target));
      });

      let dragging = false, startX = 0, dragged = 0;
      const dragStart = x => { dragging = true; startX = x; dragged = 0; cfTrack.classList.add('dragging'); };
      const dragMove = x => { if (dragging) dragged = x - startX; };
      const dragEnd = () => {
        if (!dragging) return;
        dragging = false; cfTrack.classList.remove('dragging');
        if (dragged > 60) cfGo(cfIndex - 1);
        else if (dragged < -60) cfGo(cfIndex + 1);
      };
      cfTrack.addEventListener('mousedown', e => dragStart(e.clientX));
      window.addEventListener('mousemove', e => dragMove(e.clientX));
      window.addEventListener('mouseup', dragEnd);
      cfTrack.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), { passive: true });
      cfTrack.addEventListener('touchmove', e => dragMove(e.touches[0].clientX), { passive: true });
      cfTrack.addEventListener('touchend', dragEnd);
      cfTrack.addEventListener('click', e => {
        const card = e.target.closest('.bl-cf-card');
        if (card && !dragged) cfGo(cfCards.indexOf(card));
      });

      renderCoverflow();
      if (window.gsap) {
        gsap.from(cfTrack, { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: cfTrack, start: 'top 85%' } });
      }
    }

    /* ---- 5. Writer spotlight: typewriter quote, plays once in view ---- */
    const quoteEl = document.getElementById('blWriterQuote');
    if (quoteEl) {
      const typedEl = quoteEl.querySelector('.bl-typed');
      const text = quoteEl.dataset.text || '';
      let typed = false;
      function typeQuote() {
        if (typed) return;
        typed = true;
        let i = 0;
        const speed = 22;
        (function step() {
          if (i <= text.length) {
            typedEl.textContent = text.slice(0, i);
            i++;
            setTimeout(step, speed);
          }
        })();
      }
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
          entries.forEach(entry => { if (entry.isIntersecting) typeQuote(); });
        }, { threshold: 0.5 });
        io.observe(quoteEl);
      } else {
        typeQuote();
      }
      if (window.gsap) {
        gsap.from('.bl-writer-media', { scale: 0.8, opacity: 0, duration: 0.8, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.bl-writer', start: 'top 80%' } });
        gsap.from('.bl-writer-byline', { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '.bl-writer', start: 'top 75%' } });
      }
    }

    /* ---- 6. Newsletter: magnetic submit + confetti-burst success ---- */
    const newsForm = document.getElementById('blNewsForm');
    const newsSuccess = document.getElementById('blNewsSuccess');
    const confettiHost = document.getElementById('blConfetti');
    if (newsForm) {
      newsForm.addEventListener('submit', () => {
        const email = document.getElementById('blNewsEmail');
        if (email && !email.value) { email.focus(); return; }
        newsForm.classList.add('bl-sent');
        newsSuccess.classList.add('show');
        if (confettiHost) {
          confettiHost.innerHTML = '';
          const colors = ['#E8A33D', '#F4EFE6', '#ffce7a'];
          for (let i = 0; i < 26; i++) {
            const dot = document.createElement('span');
            dot.style.background = colors[i % colors.length];
            confettiHost.appendChild(dot);
            const angle = Math.random() * Math.PI * 2;
            const dist = 90 + Math.random() * 140;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist - 40;
            if (window.gsap) {
              gsap.fromTo(dot,
                { opacity: 1, x: 0, y: 0, rotate: 0, scale: 0.6 },
                { opacity: 0, x: tx, y: ty, rotate: Math.random() * 360, scale: 1, duration: 1 + Math.random() * 0.6, ease: 'power2.out' });
            }
          }
        }
      });
    }

    /* ---- 7. Tag cloud: cursor-repelling floating tags (lightweight physics) ---- */
    const tagField = document.getElementById('blTagField');
    if (tagField && window.matchMedia('(hover:hover)').matches) {
      const tags = Array.from(tagField.querySelectorAll('.bl-tag')).map(el => ({
        el, ox: 0, oy: 0, tx: 0, ty: 0
      }));
      let fieldRect = tagField.getBoundingClientRect();
      let mouseX = -9999, mouseY = -9999;
      window.addEventListener('resize', () => { fieldRect = tagField.getBoundingClientRect(); });
      tagField.addEventListener('mousemove', e => {
        fieldRect = tagField.getBoundingClientRect();
        mouseX = e.clientX - fieldRect.left;
        mouseY = e.clientY - fieldRect.top;
      });
      tagField.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

      function repelLoop() {
        tags.forEach(t => {
          const r = t.el.getBoundingClientRect();
          const cx = r.left - fieldRect.left + r.width / 2;
          const cy = r.top - fieldRect.top + r.height / 2 - t.oy;
          const dx = cx - mouseX, dy = cy - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 110;
          if (dist < radius) {
            const force = (radius - dist) / radius;
            t.tx = (dx / (dist || 1)) * force * 34;
            t.ty = (dy / (dist || 1)) * force * 34;
          } else {
            t.tx = 0; t.ty = 0;
          }
          t.ox += (t.tx - t.ox) * 0.12;
          t.oy += (t.ty - t.oy) * 0.12;
          t.el.style.transform = `translate(-50%,-50%) translate(${t.ox}px, ${t.oy}px)`;
        });
        requestAnimationFrame(repelLoop);
      }
      repelLoop();
    }
    if (window.gsap) {
      gsap.from('.bl-tag', {
        opacity: 0, scale: 0.6, duration: 0.5, stagger: 0.04, ease: 'back.out(2)',
        scrollTrigger: { trigger: '.bl-tag-field', start: 'top 85%' }
      });
    }

    window.addEventListener('load', () => window.ScrollTrigger && ScrollTrigger.refresh());
  }


  /* =========================================================
     CONTACT PAGE — scoped to <body class="page-contact">
     split-flap departure-board headline, cursor-revealed route
     map, radar-sweep tilt chips, paper peel cards, flying-plane
     form submit, radar pin, pop-in avatars, chat-bubble FAQ,
     magnetic socials.
     ========================================================= */
  if (document.body.classList.contains('page-contact')) {

    /* ---------- Split-flap (airport board) headline ---------- */
    const flapChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ&';
    document.querySelectorAll('.cp-flap-line').forEach((line, lineIdx) => {
      const finalText = line.dataset.flap || line.textContent;
      line.innerHTML = '';
      const chars = finalText.split('').map(ch => {
        const wrap = document.createElement('span');
        wrap.className = 'cp-flap-char' + (ch === ' ' ? ' cp-space' : '');
        const inner = document.createElement('span');
        inner.className = 'cp-flap-inner';
        inner.textContent = ch === ' ' ? '\u00A0' : ch;
        wrap.appendChild(inner);
        line.appendChild(wrap);
        return { wrap, inner, final: ch };
      });

      chars.forEach((c, i) => {
        if (c.final === ' ') return;
        const flips = 4 + Math.floor(Math.random() * 3);
        let step = 0;
        const startDelay = 250 + lineIdx * 500 + i * 60;
        function flap() {
          c.wrap.classList.add('cp-flapping');
          setTimeout(() => {
            c.inner.textContent = step < flips - 1
              ? flapChars[Math.floor(Math.random() * flapChars.length)]
              : c.final;
          }, 90);
          setTimeout(() => { c.wrap.classList.remove('cp-flapping'); }, 220);
          step++;
          if (step < flips) setTimeout(flap, 130);
        }
        setTimeout(flap, startDelay);
      });
    });

    /* ---------- Cursor-revealed route map + spotlight ---------- */
    const heroSection = document.getElementById('cp-hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', e => {
        const r = heroSection.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        heroSection.style.setProperty('--mx', mx + '%');
        heroSection.style.setProperty('--my', my + '%');
      });
    }

    /* ---------- Radar tilt chips: 3D tilt toward cursor ---------- */
    document.querySelectorAll('.cp-tilt-chip').forEach(chip => {
      chip.addEventListener('mousemove', e => {
        const r = chip.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        chip.style.transform = `rotateX(${py * -22}deg) rotateY(${px * 22}deg) translateZ(6px)`;
      });
      chip.addEventListener('mouseleave', () => { chip.style.transform = ''; });
    });

    /* ---------- Form: floating labels + flying-plane submit ---------- */
    const cpForm = document.getElementById('cpContactForm');
    const cpSendBtn = document.getElementById('cpSendBtn');
    if (cpForm && cpSendBtn) {
      cpForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('cpName');
        const email = document.getElementById('cpEmail');
        const msg = document.getElementById('cpMessage');
        if (!name.value.trim() || !email.value.trim() || !msg.value.trim()) {
          [name, email, msg].forEach(f => {
            if (!f.value.trim()) {
              f.style.borderBottomColor = '#e0645f';
              setTimeout(() => { f.style.borderBottomColor = ''; }, 1200);
            }
          });
          return;
        }
        cpSendBtn.classList.add('cp-sending');
        setTimeout(() => {
          cpForm.classList.add('cp-submitted');
        }, 750);
      });
    }

    /* ---------- Location: radar pin + address reveal on scroll ---------- */
    if (window.gsap && window.ScrollTrigger) {
      gsap.from('.cp-peel-card', {
        opacity: 0, y: 40, duration: 0.6, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: '.cp-peel-grid', start: 'top 82%' }
      });
      gsap.from('.cp-map-media, .cp-location-info > *', {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.cp-location', start: 'top 78%' }
      });
    }

    /* ---------- Availability: pop-in avatars + highlight today ---------- */
    const avatarStack = document.getElementById('cpAvatarStack');
    if (avatarStack) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            avatarStack.classList.add('cp-inview');
            io.disconnect();
          }
        });
      }, { threshold: 0.4 });
      io.observe(avatarStack);
    }
    const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    document.querySelectorAll('.cp-hour-chip').forEach(chip => {
      if (chip.dataset.day === today) chip.classList.add('cp-today');
    });

    /* ---------- Chat-style FAQ: typing dots then bubble ---------- */
    document.querySelectorAll('.cp-chat-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.q;
        const answer = document.querySelector(`.cp-chat-a[data-a="${id}"]`);
        const isOpen = answer.classList.contains('cp-open');
        document.querySelectorAll('.cp-chat-a.cp-open').forEach(a => a.classList.remove('cp-open'));
        document.querySelectorAll('.cp-chat-q.cp-active').forEach(q => q.classList.remove('cp-active'));
        if (!isOpen) {
          answer.classList.add('cp-open');
          btn.classList.add('cp-active');
        }
      });
    });

    /* ---------- Magnetic social buttons ---------- */
    document.querySelectorAll('.cp-mag-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.35}px, ${dy * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
    });

    window.addEventListener('load', () => window.ScrollTrigger && ScrollTrigger.refresh());
  }


});