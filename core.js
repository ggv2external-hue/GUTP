/**
 * ==========================================================================
 * PREMIUM BIRTHDAY WEBSITE — NGUYỄN LINH CHI
 * File: core.js
 * Purpose: Elevated experiential interactions, dynamic lighting & transitions
 * ==========================================================================
 */

(function () {
  'use strict';

  // Wait for the DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  function initApp() {
    // Progressive enhancement: switch from no-js to js-ready
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('no-js');
    htmlEl.classList.add('js-ready');

    const bodyEl = document.body;
    const btnOpen = document.getElementById('btn-open-letter');
    const btnReturn = document.getElementById('btn-return');
    const viewLanding = document.getElementById('view-landing');
    const viewMessage = document.getElementById('view-message');
    const cursorGlow = document.getElementById('cursor-glow');
    const letterCard = document.getElementById('letter-card');
    const sparklesContainer = document.getElementById('sparkles-container');

    // Guard against missing DOM elements
    if (!btnOpen || !btnReturn || !viewLanding || !viewMessage) {
      return;
    }

    let isMessageOpen = false;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ------------------------------------------------------------------------
    // 1. STATE MANAGEMENT (State A <-> State B)
    // ------------------------------------------------------------------------

    function openMessage(options = { updateHistory: true, focusTarget: true }) {
      if (isMessageOpen) return;
      isMessageOpen = true;

      htmlEl.classList.add('state-message-open');
      bodyEl.classList.add('state-message-active');

      viewLanding.setAttribute('aria-hidden', 'true');
      viewMessage.setAttribute('aria-hidden', 'false');

      if (options.updateHistory && window.history && window.history.pushState) {
        window.history.pushState({ state: 'message' }, '', '#view-message');
      }

      if (options.focusTarget) {
        setTimeout(() => {
          const letterHeadline = viewMessage.querySelector('.letter-headline');
          if (letterHeadline) {
            letterHeadline.setAttribute('tabindex', '-1');
            letterHeadline.focus({ preventScroll: true });
          } else {
            viewMessage.focus({ preventScroll: true });
          }
        }, 140);
      }
    }

    function closeMessage(options = { updateHistory: true, returnFocus: true }) {
      if (!isMessageOpen) return;
      isMessageOpen = false;

      htmlEl.classList.remove('state-message-open');
      bodyEl.classList.remove('state-message-active');

      viewLanding.setAttribute('aria-hidden', 'false');
      viewMessage.setAttribute('aria-hidden', 'true');

      // Reset card tilt if active
      if (letterCard) {
        letterCard.style.transform = '';
      }

      if (options.updateHistory && window.history && window.history.pushState) {
        window.history.pushState({ state: 'landing' }, '', window.location.pathname + window.location.search);
      }

      if (options.returnFocus && btnOpen) {
        setTimeout(() => {
          btnOpen.focus({ preventScroll: true });
        }, 140);
      }
    }

    // CTA Click events
    btnOpen.addEventListener('click', function (e) {
      e.preventDefault();
      openMessage();
    });

    btnReturn.addEventListener('click', function (e) {
      e.preventDefault();
      closeMessage();
    });

    // Keyboard support: Escape returns to State A
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isMessageOpen) {
        e.preventDefault();
        closeMessage();
      }
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function () {
      if (window.location.hash === '#view-message') {
        openMessage({ updateHistory: false, focusTarget: false });
      } else {
        closeMessage({ updateHistory: false, returnFocus: false });
      }
    });

    // If starting on #view-message anchor
    if (window.location.hash === '#view-message') {
      openMessage({ updateHistory: false, focusTarget: false });
    }

    // ------------------------------------------------------------------------
    // 2. AMBIENT CURSOR LIGHT FOLLOWER (DESKTOP)
    // ------------------------------------------------------------------------
    if (cursorGlow && !isTouchDevice && !prefersReducedMotion) {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let currentX = mouseX;
      let currentY = mouseY;
      let isMoving = false;
      let animationFrameId = null;

      function renderCursor() {
        // Smooth lerp (linear interpolation) for candle-like lag
        currentX += (mouseX - currentX) * 0.12;
        currentY += (mouseY - currentY) * 0.12;

        cursorGlow.style.left = `${currentX}px`;
        cursorGlow.style.top = `${currentY}px`;

        if (isMoving || Math.abs(mouseX - currentX) > 0.5 || Math.abs(mouseY - currentY) > 0.5) {
          animationFrameId = requestAnimationFrame(renderCursor);
        } else {
          animationFrameId = null;
        }
      }

      window.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!cursorGlow.classList.contains('is-active')) {
          cursorGlow.classList.add('is-active');
        }
        if (!animationFrameId) {
          isMoving = true;
          animationFrameId = requestAnimationFrame(renderCursor);
        }
      }, { passive: true });

      document.addEventListener('mouseleave', function () {
        cursorGlow.classList.remove('is-active');
        isMoving = false;
      });
    }

    // ------------------------------------------------------------------------
    // 3. TACTILE STARLIGHT SPARKLES (ON TAP / CLICK)
    // ------------------------------------------------------------------------
    if (sparklesContainer && !prefersReducedMotion) {
      const sparkleGlyphs = ['✦', '✧', '⋆', '･'];

      window.addEventListener('pointerdown', function (e) {
        // Avoid spawning sparkles directly when clicking buttons to keep UI clean
        if (e.target.closest('button, a')) return;

        const count = 3;
        for (let i = 0; i < count; i++) {
          const sparkle = document.createElement('span');
          sparkle.className = 'starlight-sparkle';
          sparkle.textContent = sparkleGlyphs[Math.floor(Math.random() * sparkleGlyphs.length)];
          
          sparkle.style.left = `${e.clientX}px`;
          sparkle.style.top = `${e.clientY}px`;

          // Random scatter offsets
          const angle = Math.random() * Math.PI * 2;
          const distance = 16 + Math.random() * 28;
          const dx = Math.cos(angle) * distance;
          const dy = Math.sin(angle) * distance;
          sparkle.style.setProperty('--dx', `${dx}px`);
          sparkle.style.setProperty('--dy', `${dy}px`);

          sparklesContainer.appendChild(sparkle);

          // Clean up DOM node
          setTimeout(() => {
            if (sparkle.parentNode) {
              sparkle.parentNode.removeChild(sparkle);
            }
          }, 800);
        }
      }, { passive: true });
    }

    // ------------------------------------------------------------------------
    // 4. 3D PERSPECTIVE TILT ON LETTER CARD (DESKTOP)
    // ------------------------------------------------------------------------
    if (letterCard && !isTouchDevice && !prefersReducedMotion) {
      let cardBounds = null;

      function updateCardBounds() {
        if (isMessageOpen) {
          cardBounds = letterCard.getBoundingClientRect();
        }
      }

      window.addEventListener('resize', updateCardBounds, { passive: true });

      letterCard.addEventListener('mouseenter', function () {
        cardBounds = letterCard.getBoundingClientRect();
      });

      letterCard.addEventListener('mousemove', function (e) {
        if (!cardBounds) cardBounds = letterCard.getBoundingClientRect();

        const x = e.clientX - cardBounds.left;
        const y = e.clientY - cardBounds.top;
        const centerX = cardBounds.width / 2;
        const centerY = cardBounds.height / 2;

        // Subtle, elegant tilt angles (max +/- 2.5 degrees)
        const rotateY = ((x - centerX) / centerX) * 2.5;
        const rotateX = -((y - centerY) / centerY) * 2.5;

        letterCard.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;

        // Update sheen position
        const percentX = (x / cardBounds.width) * 100;
        const percentY = (y / cardBounds.height) * 100;
        letterCard.style.setProperty('--sheen-x', `${percentX.toFixed(1)}%`);
        letterCard.style.setProperty('--sheen-y', `${percentY.toFixed(1)}%`);
      });

      letterCard.addEventListener('mouseleave', function () {
        letterCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    }
  }
})();
