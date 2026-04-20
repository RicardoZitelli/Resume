class ProgressBar extends HTMLElement {
  connectedCallback() {
    const stepsAttr      = this.getAttribute('steps') || '';
    const parsedLabels   = stepsAttr.split(',').map(s => s.trim()).filter(Boolean);
    const countAttr      = parseInt(this.getAttribute('count'), 10);
    const count          = !isNaN(countAttr) && countAttr >= 2 ? countAttr : null;

    const labels = count
      ? Array.from({ length: count }, (_, i) => parsedLabels[i] || '')
      : parsedLabels.length >= 2 ? parsedLabels : ['', ''];

    const colorEmpty     = this.getAttribute('color-empty')     || '#ffffff';
    const colorFilled    = this.getAttribute('color-filled')    || '#7B2FBE';
    const colorCheckmark = this.getAttribute('color-checkmark') || '#fcb034';
    const heading        = this.getAttribute('heading');
    const headingColor   = this.getAttribute('heading-color')   || '#fcb034';
    const showBtn        = this.hasAttribute('show-btn');
    const btnLabel       = this.getAttribute('btn-label')       || 'NEXT STEP';
    const btnRestart     = this.getAttribute('btn-restart')     || 'RESTART';
    const btnColor       = this.getAttribute('btn-color')       || '#fcb034';
    const btnTextColor   = this.getAttribute('btn-text-color')  || '#051B23';
    const btnHref        = this.getAttribute('btn-href')        || null;
    const hideCheckmark  = this.hasAttribute('hide-checkmark');

    const ANIM_MS = 1000;
    const FAST_MS = 0;

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Roboto Condensed', sans-serif;
          --color-empty:     ${colorEmpty};
          --color-filled:    ${colorFilled};
          --color-checkmark: ${colorCheckmark};
          --heading-color:   ${headingColor};
          --btn-color:       ${btnColor};
          --btn-text-color:  ${btnTextColor};
        }

        .heading {
          color: var(--heading-color);
          text-align: center;
          font-size: 2.5rem;
          letter-spacing: 3px;
          margin: 0 0 2em;
          font-weight: bold;
        }

        .progress {
          display: flex;
          align-items: flex-start;
          width: 100%;
          box-sizing: border-box;
          padding: 0 0.5em;
        }

        .step {
          flex: 1 1 0;
          position: relative;
        }

        .step:last-child {
          flex: 0 0 auto;
          width: 1em;
        }

        .step-progress {
          width: 100%;
          height: 0.25em;
          background: var(--color-empty);
          overflow: hidden;
        }

        .step-progress-fill {
          height: 100%;
          width: 0;
          background: var(--color-filled);
        }

        .icon-wrapper {
          text-align: center;
          display: inline-block;
        }

        .icon {
          display: inline-block;
          width: 1.5em;
          height: 1.5em;
          fill: none;
          position: relative;
          z-index: 1;
        }

        .icon-wrapper {
          cursor: pointer;
        }

        .icon-checkmark {
          position: absolute;
          top: -0.55em;
          left: -0.125em;
          border: 0.125em solid var(--color-empty);
          background: var(--color-empty);
          width: 1em;
          height: 1em;
          border-radius: 50%;
          padding: 0.125em;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.25s linear;
          z-index: 1;
        }

        .icon-checkmark::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 0;
          background: var(--color-filled);
        }

        .step.circle-done .icon-checkmark {
          border-color: var(--color-filled);
        }

        .step.circle-done .icon-checkmark::before {
          width: 100%;
          transition: width 0.5s linear;
        }

        .icon-checkmark .path1 {
          stroke: var(--color-empty);
          stroke-width: 4;
          stroke-linecap: square;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          fill: none;
        }

        .step.circle-done .icon-checkmark .path1 {
          animation: dash 5s linear forwards;
          animation-delay: 0.5s;
          stroke: var(--color-checkmark);
        }

        .step-text {
          position: relative;
          margin-left: -50%;
          letter-spacing: 1px;
          font-weight: bold;
          color: #aaa;
          margin-top: 0;
          opacity: 0;
          white-space: nowrap;
          font-size: clamp(0.75rem, 2vw, 1rem);
        }

        @media (max-width: 600px) {
          .step-text {
            font-size: clamp(0.6rem, 3.5vw, 0.8rem);
            letter-spacing: 0;
          }
        }

        .step:last-child .icon-wrapper {
          margin-top: 0.25em;
        }

        .step:last-child .step-text {
          margin-left: 0;
          transform: translateX(-50%);
        }

        .step.circle-done .step-text {
          color: var(--color-filled);
          animation: dropText 0.5s linear forwards;
        }

        .step.instant .icon-checkmark {
          transition-duration: 0s !important;
        }
        .step.instant .icon-checkmark::before {
          transition-duration: 0s !important;
        }
        .step.instant .icon-checkmark .path1 {
          animation-duration: 0s !important;
        }
        .step.instant .step-text {
          animation-duration: 0s !important;
        }

        .btn-next {
          display: block;
          margin: 2em auto 0;
          padding: 0.75em 2.5em;
          font-family: 'Roboto Condensed', sans-serif;
          font-size: 1.1rem;
          font-weight: bold;
          letter-spacing: 2px;
          color: var(--btn-text-color);
          background: var(--btn-color);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: filter 0.2s;
        }

        .btn-next:hover { filter: brightness(0.88); }

        ${hideCheckmark ? '.icon-checkmark .path1 { display: none; }' : ''}

        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }

        @keyframes dropText {
          to { padding-top: 1em; opacity: 1; }
        }
      </style>

      ${heading ? `<div class="heading">${heading}</div>` : ''}

      <div class="progress">
        ${labels.map((label, i) => `
          <div class="step">
            ${i < labels.length - 1
              ? '<div class="step-progress"><div class="step-progress-fill"></div></div>'
              : ''}
            <div class="icon-wrapper">
              <div class="icon-checkmark">
                <svg class="icon" viewBox="0 0 32 32">
                  <path class="path1" d="M27 4l-15 15-7-7-5 5 12 12 20-20z"></path>
                </svg>
              </div>
              <div class="step-text">${label}</div>
            </div>
          </div>
        `).join('')}
      </div>

      ${showBtn ? `<button class="btn-next">${btnLabel}</button>` : ''}
    `;

    const steps = shadow.querySelectorAll('.step');
    const btn   = shadow.querySelector('.btn-next');
    let current     = 0;
    let pending     = null; // { timeout, fillEl, nextIdx }

    steps.forEach((step, i) => {
      step.querySelector('.icon-wrapper').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('step-click', { bubbles: true, composed: true, detail: { index: i } }));
      });
    });

    // ── Fireworks ──
    const showFireworks = this.hasAttribute('fireworks');
    let fwCanvas, fwCtx;
    if (showFireworks) {
      fwCanvas = document.createElement('canvas');
      fwCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999999;';
      document.body.appendChild(fwCanvas);
      fwCtx = fwCanvas.getContext('2d');
      const resize = () => { fwCanvas.width = window.innerWidth; fwCanvas.height = window.innerHeight; };
      resize();
      window.addEventListener('resize', resize);
    }

    const fireParticles = (x, y) => {
      if (!fwCtx) return;
      const colors = [colorFilled, colorFilled, colorFilled, '#ffffff', 'rgba(255,255,255,0.6)'];
      const particles = Array.from({ length: 60 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.3;
        return {
          x, y, px: x, py: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          len: Math.random() * 6 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          friction: 0.97,
        };
      });
      const animate = () => {
        fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
        let alive = false;
        particles.forEach(p => {
          p.px = p.x; p.py = p.y;
          p.vx *= p.friction; p.vy *= p.friction;
          p.x += p.vx; p.y += p.vy;
          p.alpha -= 0.006;
          if (p.alpha > 0) {
            alive = true;
            fwCtx.globalAlpha = p.alpha;
            fwCtx.strokeStyle = p.color;
            fwCtx.lineWidth = 2.5;
            fwCtx.lineCap = 'round';
            fwCtx.beginPath();
            fwCtx.moveTo(p.px, p.py);
            fwCtx.lineTo(p.x, p.y);
            fwCtx.stroke();
            fwCtx.fillStyle = p.color;
            fwCtx.beginPath();
            fwCtx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            fwCtx.fill();
          }
        });
        fwCtx.globalAlpha = 1;
        if (alive) requestAnimationFrame(animate);
        else fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
      };
      animate();
    };

    // anima a linha do step via JS (sem depender de classe CSS)
    const animateFill = (fill, instant) => {
      fill.style.transition = 'none';
      fill.style.width = '0';
      fill.offsetWidth; // reflow
      if (instant) {
        fill.style.width = '100%';
      } else {
        fill.style.transition = `width ${ANIM_MS}ms linear`;
        fill.style.width = '100%';
      }
    };

    // preenche o círculo, com ou sem animação
    const fillCircle = (step, instant) => {
      if (instant) step.classList.add('instant');
      step.classList.add('circle-done');
      if (showFireworks && !instant) {
        const checkmark = step.querySelector('.icon-checkmark');
        setTimeout(() => {
          const sr = checkmark.getBoundingClientRect();
          fireParticles(sr.left + sr.width / 2, sr.top + sr.height / 2);
        }, 500);
      }
    };

    const reset = () => {
      if (pending) {
        clearTimeout(pending.timeout);
        pending = null;
      }
      steps.forEach(s => s.classList.remove('circle-done', 'instant'));
      shadow.querySelectorAll('.step-progress-fill').forEach(f => {
        f.style.transition = 'none';
        f.style.width = '0';
      });
      current = 0;
      fillCircle(steps[0], true);
      if (btn) {
        btn.disabled = false;
        btn.textContent = btnLabel;
      }
    };

    this.next = () => {
      // se há animação em curso, acelera a transição para alcançar o usuário
      if (pending) {
        clearTimeout(pending.timeout);
        pending.fillEl.style.transition = `width ${FAST_MS}ms linear`;
        pending.fillEl.style.width = '100%';
        const nextIdx = pending.nextIdx;
        pending.timeout = setTimeout(() => {
          pending = null;
          fillCircle(steps[nextIdx], false);
          if (btn && current >= steps.length - 1) btn.textContent = btnRestart;
        }, FAST_MS);
        return;
      }

      if (current >= steps.length - 1) {
        reset();
        return;
      }

      const fill = steps[current].querySelector('.step-progress-fill');
      animateFill(fill, false);

      const nextIdx = current + 1;
      current++;

      const t = setTimeout(() => {
        pending = null;
        fillCircle(steps[nextIdx], false);
        if (btn && current >= steps.length - 1) btn.textContent = btnRestart;
      }, ANIM_MS);

      pending = { timeout: t, fillEl: fill, nextIdx };
    };

    this.setLabels = (labelsArray) => {
      shadow.querySelectorAll('.step-text').forEach((el, i) => {
        if (labelsArray[i] !== undefined) el.textContent = labelsArray[i];
      });
    };

    this.setProgress = (sectionIndex, ratio) => {
      if (pending) { clearTimeout(pending.timeout); pending = null; }

      steps.forEach((step, i) => {
        const shouldFill = i <= sectionIndex;
        const wasFilled  = step.classList.contains('circle-done');

        if (shouldFill && !wasFilled) {
          fillCircle(step, false);
        } else if (!shouldFill && wasFilled) {
          step.classList.remove('circle-done', 'instant');
        }

        const fill = step.querySelector('.step-progress-fill');
        if (!fill) return;

        const targetWidth = i < sectionIndex  ? '100%'
                          : i === sectionIndex ? `${Math.round(ratio * 100)}%`
                          : '0%';

        if (fill.style.width !== targetWidth) {
          fill.style.transition = 'none';
          fill.style.width = targetWidth;
        }
      });

      current = sectionIndex;
    };

    this.goTo = (index) => {
      if (pending) { clearTimeout(pending.timeout); pending = null; }
      steps.forEach(s => s.classList.remove('circle-done', 'instant'));
      shadow.querySelectorAll('.step-progress-fill').forEach(f => {
        f.style.transition = 'none';
        f.style.width = '0';
      });
      current = 0;
      fillCircle(steps[0], true);
      for (let i = 0; i < index; i++) {
        const fill = steps[i].querySelector('.step-progress-fill');
        if (fill) { fill.style.transition = 'none'; fill.style.width = '100%'; }
        fillCircle(steps[i + 1], true);
        current = i + 1;
      }
    };

    this.reset = reset;
    reset();

    if (btn) btn.addEventListener('click', () => {
      if (btnHref) { window.open(btnHref, '_blank'); return; }
      this.next();
    });
  }
}

customElements.define('progress-bar', ProgressBar);
