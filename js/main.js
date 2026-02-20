/* ============================================================
   PORTFOLIO — main.js
   Vanilla JS: IntersectionObserver, Nav, Ripple, Back to top
   ============================================================ */

'use strict';

/* ── Utility ─────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── 1. NAV — scroll state + hamburger ───────────────────── */
(function initNav() {
  const nav      = qs('#nav');
  const hamburger = qs('.nav__hamburger');
  const mobileMenu = qs('#mobileMenu');
  const mobileLinks = qsa('.mobile-menu__link');

  if (!nav) return;

  // Scroll → glassmorphism effect
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    const toggleMenu = (open) => {
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      mobileMenu.classList.toggle('open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('open');
      toggleMenu(!isOpen);
    });

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) {
        toggleMenu(false);
        hamburger.focus();
      }
    });
  }
})();

/* ── 2. INTERSECTION OBSERVER — scroll reveal ─────────────── */
(function initReveal() {
  const elements = qsa('.reveal-up, .reveal-fade');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ── 3. BUTTON RIPPLE EFFECT ─────────────────────────────── */
(function initRipple() {
  const buttons = qsa('.btn');

  buttons.forEach(btn => {
    btn.addEventListener('pointerdown', function (e) {
      // Skip if btn has a child link that is the actual target
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 1.6;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: currentColor;
        opacity: 0.12;
      `;

      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();

/* ── 4. BACK TO TOP ──────────────────────────────────────── */
(function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── 5. HERO STAGGER — title lines ───────────────────────── */
(function initHeroStagger() {
  // Title lines are already staggered via CSS --delay vars
  // But we also want them to animate on the next frame so the
  // browser has finished painting the initial state.
  const lines = qsa('.hero__title-line, .hero__badge, .hero__sub, .hero__actions, .hero__scroll');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      lines.forEach(el => el.classList.add('in-view'));
    });
  });
})();

/* ── 6. SMOOTH ACTIVE NAV LINK ───────────────────────────── */
(function initActiveNav() {
  const navLinks = qsa('.nav__link[href*="#"]');
  if (!navLinks.length) return;

  const sections = navLinks
    .map(link => {
      const id = link.getAttribute('href').split('#')[1];
      return id ? qs(`#${id}`) : null;
    })
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href').endsWith(`#${id}`)
          );
        });
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );

  sections.forEach(s => sectionObserver.observe(s));
})();

/* ── 7. PROJECT CARD — parallel hover elevation ──────────── */
(function initCardTilt() {
  // Subtle mouse-follow shadow shift on project cards
  const cards = qsa('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      const rotateX = y * -4; // degrees
      const rotateY = x *  4;

      card.style.transform = `
        translateY(-6px)
        perspective(800px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── 8. STAT COUNTER ANIMATION ───────────────────────────── */
(function initCounters() {
  const statNums = qsa('.stat-card__num');
  if (!statNums.length) return;

  const parseNum = (str) => {
    const match = str.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const formatNum = (val, original) => {
    const suffix = original.replace(/[\d.]+/, '');
    const num = Number.isInteger(parseNum(original)) ? Math.round(val) : val.toFixed(1);
    return `${num}${suffix}`;
  };

  const animateCounter = (el) => {
    const target   = parseNum(el.textContent);
    const original = el.textContent.trim();
    const duration = 1200;
    const start    = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNum(eased * target, original);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  statNums.forEach(el => counterObserver.observe(el));
})();

/* ── 9. SKILL TAG STAGGER ────────────────────────────────── */
(function initSkillTagStagger() {
  const tags = qsa('.skill-tag, .tag');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const parent = entry.target.closest('.about-preview__skills, .project-card__tags');
        if (!parent) { observer.unobserve(entry.target); return; }

        qsa('.skill-tag, .tag', parent).forEach((tag, i) => {
          setTimeout(() => {
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
          }, i * 60);
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  // Initial state
  tags.forEach(tag => {
    tag.style.opacity = '0';
    tag.style.transform = 'translateY(8px)';
    tag.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  });

  // Observe first tag in each group
  qsa('.about-preview__skills, .project-card__tags').forEach(group => {
    const first = qs('.skill-tag, .tag', group);
    if (first) observer.observe(first);
  });
})();

/* ── 10. PAGE TRANSITION ─────────────────────────────────── */
(function initPageTransitions() {
  // Fade in on page load
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity 0.4s ease';

  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.documentElement.style.opacity = '1';
    });
  });

  // Fade out on internal link navigation
  const internalLinks = qsa('a[href]').filter(a => {
    const href = a.getAttribute('href') || '';
    return (
      !href.startsWith('#') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('http') &&
      !a.hasAttribute('target')
    );
  });

  internalLinks.forEach(link => {
    // Skip tag links on the projects page — handled by the filter
    if (link.classList.contains('tag') && link.closest('.projects-grid')) return;

    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      e.preventDefault();
      document.documentElement.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 300);
    });
  });
})();

/* ── 11. TAG FILTER (projects page) ─────────────────────── */
(function initTagFilter() {
  const filterBtns = qsa('.filter-btn');
  const grid       = qs('.projects-grid');
  if (!filterBtns.length || !grid) return;

  const cards = qsa('.project-card[data-tags]', grid);

  const setFilter = (tag) => {
    // Update active button
    filterBtns.forEach(btn =>
      btn.classList.toggle('active', btn.dataset.filter === tag)
    );

    // Show / hide cards
    cards.forEach(card => {
      const cardTags = (card.dataset.tags || '').split(' ');
      card.classList.toggle(
        'card-hidden',
        tag !== 'all' && !cardTags.includes(tag)
      );
    });

    // Reflect in URL without a full navigation
    const url = new URL(window.location.href);
    if (tag === 'all') url.searchParams.delete('tag');
    else url.searchParams.set('tag', tag);
    history.replaceState(null, '', url);
  };

  // Filter-button clicks
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // Tag-link clicks within the grid — filter in-place, skip page transition
  qsa('a.tag', grid).forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = new URL(link.href, window.location.href);
      const tag = url.searchParams.get('tag') || 'all';
      setFilter(tag);
    });
  });

  // Apply tag from URL on initial load (e.g. arriving from index.html)
  const initial = new URLSearchParams(window.location.search).get('tag') || 'all';
  setFilter(initial);
})();
