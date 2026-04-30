/* ============================================================
   PORTFOLIO ANIMATIONS ENGINE
   Rich scroll, hover, and page-load motion for every section
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. PAGE LOADER ── */
  function initLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    // Loader auto-fades via CSS animation at 0.8s; just remove after
    setTimeout(() => loader.remove(), 1400);
  }

  /* ── 2. SCROLL PROGRESS BAR ── */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      bar.style.width = Math.min((scrolled / total) * 100, 100) + '%';
    }, { passive: true });
  }

  /* ── 3. CURSOR GLOW ── */
  function initCursorGlow() {
    // Only on non-touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      glow.style.left = glowX + 'px';
      glow.style.top  = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  /* ── 4. UNIVERSAL INTERSECTION OBSERVER ── */
  function initRevealObserver() {
    const revealClasses = [
      '.reveal', '.reveal-left', '.reveal-scale',
      '.reveal-up', '.reveal-down', '.reveal-right',
      '.reveal-zoom', '.reveal-flip',
      '.section-enter',
      '.stat-box', '.timeline-item',
      '.section-underline', '.section-badge', '.section-title'
    ];

    const targets = document.querySelectorAll(revealClasses.join(','));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;

        // Add both legacy and new visible class
        el.classList.add('in-view', 'visible', 'entered');

        // Animate skill bars when they appear
        if (el.classList.contains('skills-chart') || el.querySelector('.skill-progress')) {
          animateSkillBars(el);
        }

        // Count up stat numbers
        if (el.classList.contains('stat-box')) {
          animateCounter(el);
        }

        observer.unobserve(el);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    targets.forEach(el => observer.observe(el));

    // Also observe section wrappers for staggered children
    document.querySelectorAll('.projects-grid, .skills-grid, .stats-row, .cards-wrapper').forEach(wrapper => {
      const childObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            setTimeout(() => {
              child.classList.add('in-view', 'visible');
            }, i * 120);
          });
          childObs.unobserve(entry.target);
        });
      }, { threshold: 0.1 });

      childObs.observe(wrapper);
    });
  }

  /* ── 5. SKILL BAR ANIMATION ── */
  function animateSkillBars(container) {
    const bars = (container || document).querySelectorAll('.skill-progress[data-progress]');
    bars.forEach((bar, i) => {
      const target = bar.getAttribute('data-progress');
      bar.style.setProperty('--target-width', target + '%');
      setTimeout(() => {
        bar.style.width = target + '%';
        bar.classList.add('animated');
      }, i * 120 + 200);
    });
  }

  /* ── 6. COUNTER ANIMATION ── */
  function animateCounter(el) {
    const numEl = el.querySelector('.stat-number');
    if (!numEl || numEl.dataset.animated) return;
    numEl.dataset.animated = 'true';

    const text = numEl.textContent.trim();
    const match = text.match(/(\d+)/);
    if (!match) return;

    const target = parseInt(match[1], 10);
    const suffix = text.replace(match[1], '').replace(/^\d/, '');
    const prefix = text.indexOf(match[1]) > 0 ? text.slice(0, text.indexOf(match[1])) : '';
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      numEl.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ── 7. TIMELINE LINE DRAW ── */
  function initTimelineDraw() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        timeline.classList.add('line-drawn');
        obs.unobserve(timeline);
      }
    }, { threshold: 0.1 });

    obs.observe(timeline);
  }

  /* ── 8. FLOATING PARTICLES IN HERO ── */
  function initHeroParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'hero-particles';
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;';
    hero.prepend(canvas);

    const ctx = canvas.getContext('2d');

    let W, H, particles = [];
    const COLORS = ['rgba(96,165,250,', 'rgba(167,139,250,', 'rgba(34,211,238,', 'rgba(248,113,113,'];

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }

    function Particle() {
      this.reset = function () {
        this.x = Math.random() * W;
        this.y = Math.random() * H + H;
        this.r = Math.random() * 1.5 + 0.5;
        this.speed = Math.random() * 0.4 + 0.15;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)] + (Math.random() * 0.5 + 0.1) + ')';
        this.dx = (Math.random() - 0.5) * 0.3;
      };
      this.reset();
      this.y = Math.random() * H; // scatter on init
    }

    function init() {
      particles = Array.from({ length: 55 }, () => new Particle());
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.y -= p.speed;
        p.x += p.dx;

        if (p.y < -10) p.reset();
      });
      requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();
    window.addEventListener('resize', () => { resize(); });
  }

  /* ── 9. SCROLL INDICATOR ── */
  function initScrollIndicator() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const ind = document.createElement('div');
    ind.className = 'scroll-indicator';
    ind.innerHTML = `
      <span>Scroll</span>
      <div class="scroll-indicator-arrow"></div>
    `;
    ind.addEventListener('click', () => {
      const next = hero.nextElementSibling;
      if (next) next.scrollIntoView({ behavior: 'smooth' });
    });
    hero.appendChild(ind);

    // Hide when scrolled past hero
    window.addEventListener('scroll', () => {
      ind.style.opacity = window.scrollY > 80 ? '0' : '';
    }, { passive: true });
  }

  /* ── 10. SECTION BACKGROUND PARALLAX ── */
  function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < hero.offsetHeight * 1.5) {
        const factor = y * 0.25;
        const mesh = hero.querySelector('.hero::before');
        // Parallax the hero-visual slightly
        const visual = hero.querySelector('.hero-visual');
        if (visual) visual.style.transform = `translateY(${y * 0.08}px)`;
      }
    }, { passive: true });
  }

  /* ── 11. SECTION ENTRANCE (fade + lift on scroll into view) ── */
  function initSectionEntrance() {
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => sec.classList.add('section-enter'));

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('entered');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    sections.forEach(sec => obs.observe(sec));
  }

  /* ── 12. TAB PANEL SMOOTH TRANSITIONS ── */
  function enhanceTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels  = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        const currentActivePanel = document.querySelector('.tab-panel.active');
        
        // Remove active class from all buttons
        tabButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // If there's a currently active panel, fade it out first
        if (currentActivePanel) {
          currentActivePanel.style.opacity = '0';
          currentActivePanel.style.transform = 'translateY(8px)';
          setTimeout(() => {
            currentActivePanel.classList.remove('active');
            currentActivePanel.style.opacity = '';
            currentActivePanel.style.transform = '';
            
            // Show the new panel
            const newPanel = document.getElementById(targetTab);
            if (newPanel) {
              newPanel.classList.add('active');
              // Trigger reflow for animation
              newPanel.offsetHeight;
            }
          }, 200);
        } else {
          // No active panel, show the new one immediately
          const newPanel = document.getElementById(targetTab);
          if (newPanel) {
            newPanel.classList.add('active');
          }
        }
      });
    });
  }

  /* ── 13. MAGNETIC BUTTON EFFECT ── */
  function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ── 14. ACTIVE NAV HIGHLIGHT WITH SMOOTH INDICATOR ── */
  function initNavIndicator() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Already handled in existing script.js – we enhance with smooth color transition
    const links = navbar.querySelectorAll('.nav-link');
    links.forEach((link, i) => {
      link.style.transitionDelay = (i * 0.05) + 's';
      link.style.animation = `navLinkIn 0.5s ease ${0.15 + i * 0.07}s both`;
    });

    // Inject keyframe
    if (!document.getElementById('nav-anim-style')) {
      const style = document.createElement('style');
      style.id = 'nav-anim-style';
      style.textContent = `
        @keyframes navLinkIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ── 15. PROJECT CARD TILT ── */
  function initCardTilt() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.profile-card, .about-block').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect  = card.getBoundingClientRect();
        const cx    = rect.left + rect.width  / 2;
        const cy    = rect.top  + rect.height / 2;
        const rotX  = ((e.clientY - cy) / rect.height) * -8;
        const rotY  = ((e.clientX - cx) / rect.width)  *  8;
        card.style.transform     = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
        card.style.transition     = 'transform 0.1s ease';
        card.style.willChange     = 'transform';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform   = '';
        card.style.transition  = 'transform 0.5s cubic-bezier(0.34,1.3,0.64,1)';
        card.style.willChange  = '';
      });
    });
  }

  /* ── 16. SECTION-ENTER OBSERVER ── */
  function initSectionObs() {
    document.querySelectorAll('section').forEach(sec => {
      sec.classList.add('section-enter');
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('entered');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.04 });

    document.querySelectorAll('section').forEach(s => obs.observe(s));
  }

  /* ── 17. PAGE LOADER INJECTION ── */
  function injectLoader() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div class="loader-ring"></div>
        <div class="loader-dot"></div>
      </div>
    `;
    document.body.prepend(loader);
    initLoader();
  }

  /* ── INIT ALL ── */
  function init() {
    injectLoader();
    initScrollProgress();
    initCursorGlow();
    initRevealObserver();
    initTimelineDraw();
    initHeroParticles();
    initScrollIndicator();
    initMagneticButtons();
    initNavIndicator();
    initCardTilt();
    initSectionObs();
    enhanceTabs();

    // Animate skill bars when skills section enters view
    const skillsSection = document.querySelector('#skills');
    if (skillsSection) {
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => animateSkillBars(skillsSection), 300);
          obs.unobserve(skillsSection);
        }
      }, { threshold: 0.2 });
      obs.observe(skillsSection);
    }

    // Animate counters when profile/stats enters view
    document.querySelectorAll('.stat-box').forEach(box => {
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          animateCounter(box);
          obs.unobserve(box);
        }
      }, { threshold: 0.5 });
      obs.observe(box);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
