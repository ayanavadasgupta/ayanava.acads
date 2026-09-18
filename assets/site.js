/**
 * Ayanava Dasgupta - Academic Website Interactive Logic
 * Plain Vanilla JavaScript - No frameworks required
 */

(function () {
  'use strict';

  // --- 1. THEME SWITCH (Fancy Vintage Lamp Pull-Cord Dragging Switch) ---
  function initThemeSwitch() {
    const lamp = document.getElementById('theme-lamp') || document.querySelector('.theme-switch');
    const mediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check if the user explicitly manually switched the theme in this session
    const isManualOverride = localStorage.getItem('ayanava-theme-manual') === 'true';
    const savedTheme = isManualOverride ? (sessionStorage.getItem('ayanava-theme') || localStorage.getItem('ayanava-theme')) : null;
    const prefersDark = mediaQuery ? mediaQuery.matches : false;
    
    // Default strictly to browser's dark/light mode preference; honor manual override if set
    let isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    // Synthesized realistic mechanical lamp switch click
    function playLampClick(darkTarget) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;

        // Primary metallic snap
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(darkTarget ? 820 : 1080, now);
        osc1.frequency.exponentialRampToValueAtTime(140, now + 0.035);
        gain1.gain.setValueAtTime(0.18, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.035);

        // Secondary latch reverberation (24ms later)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(darkTarget ? 420 : 560, now + 0.024);
        osc2.frequency.exponentialRampToValueAtTime(70, now + 0.065);
        gain2.gain.setValueAtTime(0.12, now + 0.024);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.024);
        osc2.stop(now + 0.065);
      } catch (e) {
        // Silently continue if audio context is unavailable
      }
    }

    function applyTheme(dark, isManual = false) {
      if (dark) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
      }
      if (lamp) {
        lamp.setAttribute('aria-pressed', String(dark));
        lamp.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        lamp.setAttribute('title', dark ? 'Light mode (drag or click to pull lamp chain)' : 'Dark mode (drag or click to pull lamp chain)');
        const label = lamp.querySelector('.theme-switch-label');
        if (label) {
          label.textContent = dark ? 'Dark' : 'Light';
        }
      }
      if (isManual) {
        localStorage.setItem('ayanava-theme-manual', 'true');
        localStorage.setItem('ayanava-theme', dark ? 'dark' : 'light');
        sessionStorage.setItem('ayanava-theme', dark ? 'dark' : 'light');
      }
    }

    // Initialize theme based on browser mode or saved preference
    applyTheme(isDark, false);

    // Dynamically react whenever the browser or OS theme switches
    if (mediaQuery) {
      const handleSystemThemeChange = function (e) {
        localStorage.removeItem('ayanava-theme-manual');
        localStorage.removeItem('ayanava-theme');
        sessionStorage.removeItem('ayanava-theme');
        applyTheme(e.matches, false);
      };
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(handleSystemThemeChange);
      }
    }

    if (lamp) {
      const cord = lamp.querySelector('.theme-switch-cord');
      let isDragging = false;
      let startY = 0;
      let currentDragY = 0;
      const PULL_THRESHOLD = 24; // Drag distance needed to toggle
      const MAX_DRAG = 46; // Maximum chain stretch distance

      function getBaseCordHeight() {
        return window.innerWidth <= 768 ? 30 : 32;
      }

      function setPullPosition(y) {
        lamp.style.transform = 'translateY(' + y + 'px)';
        if (cord) {
          const baseH = getBaseCordHeight();
          const totalH = baseH + y;
          cord.style.height = totalH + 'px';
          cord.style.top = '-' + totalH + 'px';
        }
      }

      function resetPullPosition(animate) {
        if (animate) {
          lamp.classList.add('is-springing');
          setTimeout(() => {
            lamp.classList.remove('is-springing');
          }, 550);
        }
        lamp.style.transform = '';
        if (cord) {
          cord.style.height = '';
          cord.style.top = '';
        }
      }

      function triggerToggle() {
        const nextDark = !document.body.classList.contains('dark-mode');
        playLampClick(nextDark);
        applyTheme(nextDark, true);

        // Trigger ambient lamp bloom flash
        document.body.classList.add('lamp-flash');
        setTimeout(() => {
          document.body.classList.remove('lamp-flash');
        }, 400);
      }

      function simulateClickPull() {
        lamp.classList.add('is-pulling');
        setPullPosition(26);
        setTimeout(() => {
          triggerToggle();
          lamp.classList.remove('is-pulling');
          resetPullPosition(true);
        }, 130);
      }

      // Pointer event dragging (mouse, touch, stylus)
      lamp.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 && e.button !== undefined) return;
        isDragging = true;
        startY = e.clientY;
        currentDragY = 0;
        lamp.classList.add('is-dragging');
        lamp.classList.remove('is-springing');
        try {
          lamp.setPointerCapture(e.pointerId);
        } catch (err) {}
      });

      lamp.addEventListener('pointermove', function (e) {
        if (!isDragging) return;
        const delta = e.clientY - startY;
        if (delta <= 0) {
          currentDragY = Math.max(-4, delta * 0.15);
        } else {
          currentDragY = Math.min(MAX_DRAG, delta * 0.85);
        }
        setPullPosition(currentDragY);

        if (currentDragY >= PULL_THRESHOLD) {
          lamp.classList.add('reached-threshold');
        } else {
          lamp.classList.remove('reached-threshold');
        }
      });

      function finishDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        lamp.classList.remove('is-dragging');
        lamp.classList.remove('reached-threshold');
        try {
          if (e && e.pointerId) {
            lamp.releasePointerCapture(e.pointerId);
          }
        } catch (err) {}

        if (currentDragY >= PULL_THRESHOLD) {
          triggerToggle();
          resetPullPosition(true);
        } else if (Math.abs(currentDragY) < 5) {
          // Regular quick click or tap
          simulateClickPull();
        } else {
          // Dragged slightly but released before threshold
          resetPullPosition(true);
        }
        currentDragY = 0;
      }

      lamp.addEventListener('pointerup', finishDrag);
      lamp.addEventListener('pointercancel', finishDrag);

      // Keyboard accessibility (Space or Enter key)
      lamp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          simulateClickPull();
        }
      });
    }
  }

  // --- 2. DYNAMIC YEAR IN FOOTER ---
  function initYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // --- 3. RESEARCH PAGE: INTERACTIVE FIELD FILTERING & SEARCH ---
  function initResearchFiltering() {
    const fieldCards = document.querySelectorAll('.field-card[data-field-id]');
    const filterTabs = document.querySelectorAll('.filter-tab[data-field-tab]');
    const pubCards = document.querySelectorAll('.publication[data-fields]');
    const activeBanner = document.getElementById('active-filter-status');
    const activeFieldNameEl = document.getElementById('active-field-title');
    const resetBtns = document.querySelectorAll('.reset-field-filter');
    const searchInput = document.getElementById('pub-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const noResultsEl = document.getElementById('no-results-state');
    const journalSection = document.getElementById('journal-section');
    const preprintSection = document.getElementById('preprint-section');

    if (!fieldCards.length && !pubCards.length) return; // not on research page

    let currentField = null;
    let currentSearch = '';

    // Check URL hash for initial field filter, e.g. #field-quantum-learning
    const hash = window.location.hash;
    if (hash && hash.startsWith('#field-')) {
      const initialField = hash.replace('#field-', '');
      if (document.querySelector(`.field-card[data-field-id="${initialField}"]`)) {
        currentField = initialField;
      }
    }

    function updateView() {
      let visibleCount = 0;
      let visibleJournals = 0;
      let visiblePreprints = 0;

      // Update Field Cards UI
      fieldCards.forEach((card) => {
        const fid = card.getAttribute('data-field-id');
        const isSelected = fid === currentField;
        card.classList.toggle('active-field', isSelected);
        card.setAttribute('aria-pressed', String(isSelected));
        const hint = card.querySelector('.field-action-hint span');
        const badge = card.querySelector('.field-badge');
        const count = card.getAttribute('data-count') || 'Papers';

        if (hint) {
          hint.textContent = isSelected
            ? 'Currently showing related papers · Touch to reset'
            : 'Touch to show papers in this field →';
        }
        if (badge) {
          badge.textContent = isSelected ? '✓ Active Field' : `${count} Papers`;
        }
      });

      // Update Filter Tabs UI
      filterTabs.forEach((tab) => {
        const tabFid = tab.getAttribute('data-field-tab');
        const isTabActive = (tabFid === 'all' && !currentField) || tabFid === currentField;
        tab.classList.toggle('active', isTabActive);
      });

      // Update Active Banner
      if (activeBanner && activeFieldNameEl) {
        if (currentField) {
          const activeCard = document.querySelector(`.field-card[data-field-id="${currentField}"] h3`);
          activeFieldNameEl.textContent = activeCard ? activeCard.textContent : currentField;
          activeBanner.style.display = 'flex';
        } else {
          activeBanner.style.display = 'none';
        }
      }

      // Filter Publications
      pubCards.forEach((card) => {
        const fields = (card.getAttribute('data-fields') || '').split(' ');
        const matchesField = !currentField || fields.includes(currentField);

        let matchesSearch = true;
        if (currentSearch.trim()) {
          const text = (card.textContent || '').toLowerCase();
          matchesSearch = text.includes(currentSearch.toLowerCase());
        }

        const isVisible = matchesField && matchesSearch;
        card.style.display = isVisible ? 'grid' : 'none';

        if (isVisible) {
          visibleCount++;
          if (card.getAttribute('data-type') === 'journal') visibleJournals++;
          if (card.getAttribute('data-type') === 'preprint') visiblePreprints++;
        }
      });

      // Show/Hide section headings if empty
      if (journalSection) {
        journalSection.style.display = visibleJournals > 0 ? 'block' : 'none';
        const jCount = document.getElementById('journal-count');
        if (jCount) jCount.textContent = `(${visibleJournals})`;
      }
      if (preprintSection) {
        preprintSection.style.display = visiblePreprints > 0 ? 'block' : 'none';
        const pCount = document.getElementById('preprint-count');
        if (pCount) pCount.textContent = `(${visiblePreprints})`;
      }

      // Show/Hide No Results Box
      if (noResultsEl) {
        noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    // Attach click events to field cards
    fieldCards.forEach((card) => {
      card.addEventListener('click', function () {
        const fid = this.getAttribute('data-field-id');
        currentField = currentField === fid ? null : fid;
        if (currentField) {
          window.location.hash = `field-${currentField}`;
        } else {
          history.replaceState(null, '', window.location.pathname);
        }
        updateView();
        // Smooth scroll to publications if activated
        if (currentField) {
          const pubSection = document.getElementById('publications-section');
          if (pubSection) {
            pubSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Attach click events to tabs
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        const tabFid = this.getAttribute('data-field-tab');
        currentField = tabFid === 'all' ? null : tabFid;
        if (currentField) {
          window.location.hash = `field-${currentField}`;
        } else {
          history.replaceState(null, '', window.location.pathname);
        }
        updateView();
      });
    });

    // Reset buttons
    resetBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        currentField = null;
        currentSearch = '';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        history.replaceState(null, '', window.location.pathname);
        updateView();
      });
    });

    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        currentSearch = e.target.value.trim();
        if (clearSearchBtn) {
          clearSearchBtn.style.display = currentSearch ? 'block' : 'none';
        }
        updateView();
      });
    }

    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener('click', function () {
        searchInput.value = '';
        currentSearch = '';
        clearSearchBtn.style.display = 'none';
        updateView();
        searchInput.focus();
      });
    }

    // Direct tag buttons inside publications
    document.querySelectorAll('.pub-tag-btn').forEach((tagBtn) => {
      tagBtn.addEventListener('click', function () {
        const fid = this.getAttribute('data-filter-field');
        if (fid) {
          currentField = fid;
          window.location.hash = `field-${fid}`;
          updateView();
          const pubSection = document.getElementById('publications-section');
          if (pubSection) {
            pubSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Run initial update
    updateView();
  }

  // --- 4. CITATION COPYING (Cite / Copied!) ---
  function initCiteCopy() {
    const citeBtns = document.querySelectorAll('.cite-copy-btn');
    citeBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        const text = this.getAttribute('data-citation') || '';
        if (!text) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            const label = this.querySelector('span');
            const originalText = label ? label.textContent : 'Cite';
            if (label) label.textContent = 'Copied!';
            this.classList.add('copied');
            setTimeout(() => {
              if (label) label.textContent = originalText;
              this.classList.remove('copied');
            }, 2000);
          });
        }
      });
    });
  }

  // --- 5. CV PAGE: PDF / DOC VIEW TOGGLE ---
  function initCvViewToggle() {
    const btnPdf = document.getElementById('toggle-view-pdf');
    const btnDoc = document.getElementById('toggle-view-doc');
    const viewPdf = document.getElementById('cv-pdf-container');
    const viewDoc = document.getElementById('cv-doc-container');
    const switchDocBtn = document.getElementById('switch-to-doc-btn');

    if (!btnPdf || !btnDoc || !viewPdf || !viewDoc) return;

    function setMode(mode) {
      if (mode === 'doc') {
        btnDoc.classList.add('active');
        btnPdf.classList.remove('active');
        viewDoc.style.display = 'block';
        viewPdf.style.display = 'none';
      } else {
        btnPdf.classList.add('active');
        btnDoc.classList.remove('active');
        viewPdf.style.display = 'block';
        viewDoc.style.display = 'none';
      }
    }

    btnPdf.addEventListener('click', () => setMode('pdf'));
    btnDoc.addEventListener('click', () => setMode('doc'));
    if (switchDocBtn) {
      switchDocBtn.addEventListener('click', () => setMode('doc'));
    }
  }

  // --- 6. MOBILE NAVIGATION INTERACTION (Smooth Scroll & Dynamic Active State for Contact) ---
  function initMobileNav() {
    const contactSection = document.getElementById('contact');
    const homeTab = document.querySelector('.mobile-bottom-bar a[href="index.html"]');
    const contactTab = document.querySelector('.mobile-bottom-bar a[href="#contact"]');

    if (contactTab && contactSection) {
      contactTab.addEventListener('click', function (e) {
        e.preventDefault();
        contactSection.scrollIntoView({ behavior: 'smooth' });
        if (history.pushState) {
          history.pushState(null, null, '#contact');
        }
      });

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                contactTab.classList.add('active');
                if (homeTab) homeTab.classList.remove('active');
              } else {
                contactTab.classList.remove('active');
                if (homeTab) homeTab.classList.add('active');
              }
            });
          },
          { threshold: 0.25 }
        );
        observer.observe(contactSection);
      }
    }
  }

  // --- DOM READY BOOTSTRAP ---
  document.addEventListener('DOMContentLoaded', function () {
    initThemeSwitch();
    initYear();
    initResearchFiltering();
    initCiteCopy();
    initCvViewToggle();
    initMobileNav();
  });
})();
