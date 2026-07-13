// MUN Samarkand — interactions

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Sticky nav background on scroll ---- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav toggle ---- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  document.querySelectorAll('.nav-link-item').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
    });
  });

  /* ---- Fade-up on scroll (IntersectionObserver) ---- */
  const faders = document.querySelectorAll('.fade-up, .hero-enter, .hero-visual-enter');

  // Bidirectional: elements reveal on the way down AND reverse back out
  // when you scroll back up past them (and re-reveal if you return again).
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  faders.forEach(el => fadeObserver.observe(el));

  /* ---- Smooth scroll offset for fixed nav ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 90;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ==========================================================
     Scroll progress bar
     ========================================================== */
  const progressBar = document.getElementById('progressBar');
  let progressTicking = false;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
    progressTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      window.requestAnimationFrame(updateProgress);
      progressTicking = true;
    }
  }, { passive: true });
  updateProgress();


  /* ==========================================================
     Animated stat counters
     ========================================================== */
  const statNums = document.querySelectorAll('.stat .num');

  // Cache each real target value up front, before anything can observe
  // or reset this element — otherwise a reset-to-0 that happens before
  // the first animation has ever run would permanently overwrite the
  // real number with "0" (the bug where stats got stuck at 0 until reload).
  statNums.forEach(el => {
    el.dataset.target = el.textContent.replace(/[^\d]/g, '');
  });

  const STAGGER_MS = 350;   // gap between each stat starting, so they reveal one by one
  const COUNT_DURATION = 1600;
  const pendingStart = new Map(); // el -> setTimeout id, so exits can cancel a not-yet-started reveal

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }

    const start = performance.now();
    const runId = Symbol();
    el.dataset.runId = ''; // placeholder, real tracking below via closure token
    el._activeRun = runId;

    function tick(now) {
      if (el._activeRun !== runId) return; // superseded by a reset or a newer run
      const elapsed = now - start;
      const progress = Math.min(elapsed / COUNT_DURATION, 1);
      // ease-out-cubic — more gradual than expo, so small targets (1, 3, 5)
      // don't just snap to their final value in the first few frames; they
      // stay in motion for roughly as long as the "100" counter does.
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(tick);
  }

  // Bidirectional: replays the count-up each time a stat scrolls back into
  // view, staggered so the four reveal one after another rather than all
  // at once. Exiting cancels both a pending stagger and an in-flight count.
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        const index = Array.from(statNums).indexOf(el);
        const timeoutId = window.setTimeout(() => animateCount(el), index * STAGGER_MS);
        pendingStart.set(el, timeoutId);
      } else {
        if (pendingStart.has(el)) {
          window.clearTimeout(pendingStart.get(el));
          pendingStart.delete(el);
        }
        el._activeRun = null; // stops any in-flight tick loop for this element
        el.textContent = '0';
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => countObserver.observe(el));


  /* ==========================================================
     Committee carousel — 2 cards visible at once (1 on mobile),
     auto-advances every 1s as a true infinite loop (clone slides
     at each end so it never visibly "snaps back"), pauses only
     while the pointer is pressed and held down, manual prev/next
     + dots.
     ========================================================== */
  const carousel = document.getElementById('committeeCarousel');

  if (carousel) {
    const track = document.getElementById('carouselTrack');
    const realSlides = Array.from(track.children);
    const total = realSlides.length;
    const CLONE_COUNT = 2;
    const dots = Array.from(document.querySelectorAll('#carouselDots .carousel-dot'));
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const AUTO_ADVANCE_MS = 1000;

    // Clone the last N slides to the front, and the first N slides to the
    // back, so scrolling past either real edge glides into a visual
    // duplicate — then we snap invisibly back to the real position once
    // the transition finishes, creating a seamless infinite loop.
    const headClones = realSlides.slice(-CLONE_COUNT).map(s => {
      const c = s.cloneNode(true);
      c.setAttribute('data-clone', 'true');
      c.setAttribute('aria-hidden', 'true');
      return c;
    });
    const tailClones = realSlides.slice(0, CLONE_COUNT).map(s => {
      const c = s.cloneNode(true);
      c.setAttribute('data-clone', 'true');
      c.setAttribute('aria-hidden', 'true');
      return c;
    });
    headClones.forEach(c => track.insertBefore(c, track.firstChild));
    tailClones.forEach(c => track.appendChild(c));

    const allSlides = Array.from(track.children);

    let index = CLONE_COUNT; // starts on the first real slide
    let autoplayId = null;

    function slideWidth() {
      return allSlides[0].getBoundingClientRect().width;
    }

    function realIndex() {
      return ((index - CLONE_COUNT) % total + total) % total;
    }

    function updateDots() {
      const ri = realIndex();
      dots.forEach((dot, di) => dot.classList.toggle('active', di === ri));
    }

    function goTo(i, animate) {
      index = i;
      track.style.transition = animate ? '' : 'none';
      track.style.transform = `translateX(-${index * slideWidth()}px)`;
      updateDots();
    }

    function next() { goTo(index + 1, true); }
    function prev() { goTo(index - 1, true); }

    // Once a transition into clone territory finishes, jump instantly
    // (no transition) to the equivalent real position — invisible to
    // the eye since the clone looks identical to the real slide.
    track.addEventListener('transitionend', () => {
      if (index >= total + CLONE_COUNT) {
        goTo(index - total, false);
      } else if (index < CLONE_COUNT) {
        goTo(index + total, false);
      }
    });

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      autoplayId = window.setInterval(next, AUTO_ADVANCE_MS);
    }

    function stopAutoplay() {
      if (autoplayId) {
        window.clearInterval(autoplayId);
        autoplayId = null;
      }
    }

    prevBtn.addEventListener('click', () => { prev(); });
    nextBtn.addEventListener('click', () => { next(); });
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.index, 10) + CLONE_COUNT, true);
      });
    });

    // Pause only while pressed and held down — plain hover no longer
    // pauses it. Track whether this carousel is the one being held so
    // an unrelated click elsewhere on the page doesn't reset its timer;
    // release anywhere (even outside the carousel) still resumes it, so
    // a press that drags off the element doesn't leave it stuck paused.
    let isHeld = false;
    carousel.addEventListener('mousedown', () => { isHeld = true; stopAutoplay(); });
    carousel.addEventListener('touchstart', () => { isHeld = true; stopAutoplay(); }, { passive: true });
    function release() {
      if (!isHeld) return;
      isHeld = false;
      startAutoplay();
    }
    document.addEventListener('mouseup', release);
    document.addEventListener('touchend', release);
    document.addEventListener('touchcancel', release);

    // Basic keyboard support
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    // Re-measure on resize (1-up vs 2-up breakpoint changes slide width)
    window.addEventListener('resize', () => {
      goTo(index, false);
    });

    goTo(CLONE_COUNT, false);
    startAutoplay();
  }


  /* ==========================================================
     Magnetic buttons
     ========================================================== */
  if (canHover && !prefersReducedMotion) {
    document.querySelectorAll('.btn').forEach(btn => {
      const strength = 0.55;
      const maxOffset = 20;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const offsetX = Math.max(Math.min(x * strength, maxOffset), -maxOffset);
        const offsetY = Math.max(Math.min(y * strength, maxOffset), -maxOffset);
        btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }


  /* ==========================================================
     SVG line-draw entrance — architecture traces itself in
     Bidirectional: replays on every scroll-back-into-view, resets
     to undrawn instantly when scrolled out of view.
     ========================================================== */
  const heroSvg = document.getElementById('heroSvg');

  if (heroSvg && !prefersReducedMotion) {
    const primaryEls = Array.from(heroSvg.querySelectorAll('.draw-primary'));
    const secondaryEls = Array.from(heroSvg.querySelectorAll('.draw-secondary'));
    const lengthCache = new Map();

    const STEP_DELAY = 130;      // ms between each primary stroke starting
    const DRAW_DURATION = 1700;  // must match CSS transition duration on .draw-primary
    const pendingTimeouts = [];

    function getLength(el) {
      if (!lengthCache.has(el)) {
        try {
          lengthCache.set(el, el.getTotalLength());
        } catch (e) {
          lengthCache.set(el, null); // element type doesn't support measurement
        }
      }
      return lengthCache.get(el);
    }

    function clearPending() {
      pendingTimeouts.forEach(id => window.clearTimeout(id));
      pendingTimeouts.length = 0;
    }

    function playDraw() {
      clearPending();
      secondaryEls.forEach(el => el.classList.add('pre-draw'));

      primaryEls.forEach((el, i) => {
        const length = getLength(el);
        if (length == null) return;
        el.style.transition = 'none';
        el.style.strokeDasharray = length;
        el.style.strokeDashoffset = length;
        el.style.opacity = '1';
        el.getBoundingClientRect(); // force reflow before animating

        const delay = 350 + i * STEP_DELAY;
        pendingTimeouts.push(window.setTimeout(() => {
          el.style.transition = '';
          el.style.strokeDashoffset = '0';
        }, delay));
      });

      const totalPrimaryTime = 350 + primaryEls.length * STEP_DELAY + DRAW_DURATION;
      pendingTimeouts.push(window.setTimeout(() => {
        secondaryEls.forEach(el => el.classList.remove('pre-draw'));
      }, totalPrimaryTime - 400));
    }

    function resetDraw() {
      clearPending();
      primaryEls.forEach(el => {
        const length = getLength(el);
        if (length == null) return;
        el.style.transition = 'none';
        el.style.strokeDashoffset = length;
        el.getBoundingClientRect();
      });
      secondaryEls.forEach(el => el.classList.add('pre-draw'));
    }

    const heroSvgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playDraw();
        } else {
          resetDraw();
        }
      });
    }, { threshold: 0.25 });

    heroSvgObserver.observe(heroSvg);
  }


  /* ==========================================================
     Hero parallax — multi-layer depth (far / mid / near)
     ========================================================== */
  const heroHeader = document.querySelector('.hero');
  const layerFar = document.getElementById('layerFar');
  const layerMid = document.getElementById('layerMid');
  const layerNear = document.getElementById('layerNear');

  if (layerFar && layerMid && layerNear && !prefersReducedMotion) {
    // depth multipliers: far layer moves least, near layer moves most
    // (pushed ~1.8x stronger than the original pass for a much more pronounced sense of depth)
    const layers = [
      { el: layerFar, scroll: 0.11, mouse: 9 },
      { el: layerMid, scroll: 0.22, mouse: 19 },
      { el: layerNear, scroll: 0.36, mouse: 30 }
    ];

    let scrollY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let parallaxTicking = false;

    function applyParallax() {
      layers.forEach(layer => {
        const driftY = scrollY * layer.scroll;
        const shiftX = mouseX * layer.mouse;
        const shiftY = mouseY * layer.mouse;
        layer.el.style.transform = `translate(${shiftX}px, ${(driftY + shiftY).toFixed(2)}px)`;
      });
      parallaxTicking = false;
    }

    function requestApply() {
      if (!parallaxTicking) {
        window.requestAnimationFrame(applyParallax);
        parallaxTicking = true;
      }
    }

    // Scroll-driven drift
    window.addEventListener('scroll', () => {
      const heroHeight = heroHeader ? heroHeader.offsetHeight : window.innerHeight;
      if (window.scrollY < heroHeight) {
        scrollY = window.scrollY;
        requestApply();
      }
    }, { passive: true });

    // Mouse-driven depth shift
    if (canHover && heroHeader) {
      heroHeader.addEventListener('mousemove', (e) => {
        const rect = heroHeader.getBoundingClientRect();
        mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
        mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
        requestApply();
      });

      heroHeader.addEventListener('mouseleave', () => {
        mouseX = 0;
        mouseY = 0;
        requestApply();
      });
    }
  }


  /* ==========================================================
     Cursor glow trail — ambient light, lerped toward pointer
     ========================================================== */
  const cursorGlow = document.getElementById('cursorGlow');

  if (cursorGlow && canHover && !prefersReducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let hasMoved = false;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasMoved) {
        currentX = targetX;
        currentY = targetY;
        hasMoved = true;
        cursorGlow.classList.add('active');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('active');
    });

    function lerpGlow() {
      // ease toward target position — gives the trailing "lag" feel
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      cursorGlow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(lerpGlow);
    }
    requestAnimationFrame(lerpGlow);
  }

});
