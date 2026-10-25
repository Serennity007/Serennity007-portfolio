/* Shared pointer controller: one demand-driven animation frame, native cursor intact. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 769px)');
  const print = matchMedia('print');
  const key = 'zt-motion';
  let preference = 'on';
  try { preference = localStorage.getItem(key) === 'off' ? 'off' : 'on'; } catch (_) { /* Storage is optional. */ }
  let enabled = false;
  let frame = 0;
  let previousTime = 0;
  let pointerKnown = false;
  let layoutDirty = true;
  let activeCard = null;
  let activeMagnet = null;
  let typingTimer = 0;
  let typingIndex = 0;
  let typingCount = 0;
  let deleting = false;
  const typing = document.getElementById('typingText');
  const phrases = [
    '做 AI 研究，写开源代码，偶尔打比赛拿奖。',
    '研究方向：司法判决认知智能 + 多模态安全对齐。',
    'AI Skills · 在线考试系统 · Agent 工具。',
    '北京理工大学 · 智能科学与技术 · 硕士在读。'
  ];
  typingCount = phrases[0].length;
  const point = { x: 0, y: 0, rx: 0, ry: 0, vx: 0, vy: 0 };
  const pose = { x: 0, y: 0 };
  const cards = [...document.querySelectorAll('.card, .build-window, .resume-choice, .stat-card, .value-item')].map(node => {
    node.classList.add('motion-card');
    const sheen = document.createElement('span');
    sheen.className = 'motion-sheen motion-decoration';
    sheen.setAttribute('aria-hidden', 'true');
    node.append(sheen);
    return { node, rect: null, x: 0, y: 0, targetX: 0, targetY: 0 };
  });
  const cardMap = new Map(cards.map(card => [card.node, card]));
  const magnets = [...document.querySelectorAll('.btn, .nav-cta')].map(node => {
    node.classList.add('motion-magnet');
    return { node, rect: null, x: 0, y: 0, targetX: 0, targetY: 0 };
  });
  const magnetMap = new Map(magnets.map(item => [item.node, item]));
  const scene = document.querySelector('.hero-bg, .hud-cv .header');
  let sceneVisible = true;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'motion-toggle';
  button.setAttribute('aria-label', '鼠标跟随与页面动效');
  const homeNav = document.querySelector('.nav-links');
  if (homeNav) {
    const item = document.createElement('li');
    item.append(button);
    homeNav.insertBefore(item, homeNav.querySelector('li:has(.theme-btn)'));
  } else {
    document.querySelector('.resume-toolbar')?.append(button);
  }

  const field = document.createElement('div');
  field.className = 'motion-field motion-decoration';
  field.setAttribute('aria-hidden', 'true');
  const reticle = document.createElement('div');
  reticle.className = 'motion-reticle motion-decoration';
  reticle.setAttribute('aria-hidden', 'true');
  reticle.innerHTML = '<svg viewBox="0 0 44 44" fill="none" stroke="currentColor"><g class="motion-reticle-ring"><path d="M8 15V8h7M29 8h7v7M36 29v7h-7M15 36H8v-7"/><circle cx="22" cy="22" r="15" stroke-dasharray="1 5"/></g></svg>';
  document.body.append(field, reticle);
  const hero = document.querySelector('.hero-bg');
  if (hero) {
    const orbital = document.createElement('div');
    orbital.className = 'motion-orbital motion-decoration';
    orbital.setAttribute('aria-hidden', 'true');
    orbital.innerHTML = '<svg viewBox="0 0 540 540"><g class="orbit-path"><circle cx="270" cy="270" r="220"/><circle cx="270" cy="270" r="195" stroke-dasharray="1 16"/><ellipse cx="270" cy="270" rx="220" ry="70"/><ellipse cx="270" cy="270" rx="220" ry="150"/><ellipse cx="270" cy="270" rx="70" ry="220"/><ellipse cx="270" cy="270" rx="150" ry="220"/><path d="M30 270h480M270 30v480" stroke-dasharray="2 10"/><circle class="orbit-equator" cx="270" cy="270" r="244"/></g><g class="orbit-core"><circle cx="50" cy="270" r="3"/><circle cx="270" cy="50" r="3"/><circle cx="490" cy="270" r="3"/></g></svg>';
    hero.append(orbital);
  }

  const revealNodes = [...new Set(document.querySelectorAll('.anim:not(.stagger), .stagger > *, .hud-cv .header, .hud-cv .section'))];
  let revealObserver;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: .08, rootMargin: '0px 0px -16px 0px' });
    if (scene) {
      new IntersectionObserver(entries => {
        sceneVisible = entries[0].isIntersecting;
        if (!sceneVisible) { pose.x = 0; pose.y = 0; }
        schedule();
      }).observe(scene);
    }
  }

  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const converge = (value, target, amount) => Math.abs(target - value) < .005 ? target : value + (target - value) * amount;
  function schedule() {
    if (enabled && !document.hidden && !frame) frame = requestAnimationFrame(draw);
  }
  function locate(target) {
    const element = target instanceof Element ? target : null;
    const card = cardMap.get(element?.closest('.motion-card')) || null;
    const magnet = magnetMap.get(element?.closest('.motion-magnet')) || null;
    if (activeCard !== card) {
      if (activeCard) {
        activeCard.targetX = activeCard.targetY = 0;
        activeCard.node.removeAttribute('data-motion-hover');
      }
      activeCard = card;
      if (card) card.node.setAttribute('data-motion-hover', 'true');
      layoutDirty = true;
    }
    if (activeMagnet !== magnet) {
      if (activeMagnet) activeMagnet.targetX = activeMagnet.targetY = 0;
      activeMagnet = magnet;
      layoutDirty = true;
    }
    reticle.dataset.interactive = String(Boolean(element?.closest('a, button, summary, input, textarea, select')));
  }
  function clearPointer() {
    pointerKnown = false;
    root.removeAttribute('data-pointer-active');
    locate(null);
    schedule();
  }
  function pointerMove(event) {
    if (event.pointerType === 'touch') { clearPointer(); return; }
    if (!enabled) return;
    if (!pointerKnown) {
      point.rx = event.clientX; point.ry = event.clientY;
      point.vx = point.vy = 0;
    }
    pointerKnown = true;
    point.x = event.clientX; point.y = event.clientY;
    root.dataset.pointerActive = 'true';
    locate(event.target);
    schedule();
  }
  function draw(time) {
    frame = 0;
    if (!enabled || document.hidden) { previousTime = 0; return; }
    const dt = previousTime ? clamp((time - previousTime) / 1000, .001, .032) : 1 / 60;
    previousTime = time;
    const amount = 1 - Math.exp(-16 * dt);
    // Read layout first. Scroll, resize and target changes invalidate these bounds.
    if (layoutDirty) {
      if (pointerKnown) locate(document.elementFromPoint(point.x, point.y));
      if (activeCard) activeCard.rect = activeCard.node.getBoundingClientRect();
      if (activeMagnet) activeMagnet.rect = activeMagnet.node.getBoundingClientRect();
      layoutDirty = false;
    }
    if (activeCard?.rect) {
      const r = activeCard.rect;
      activeCard.targetX = clamp((point.x - r.left) / r.width - .5, -.5, .5);
      activeCard.targetY = clamp((point.y - r.top) / r.height - .5, -.5, .5);
    }
    if (activeMagnet?.rect) {
      const r = activeMagnet.rect;
      activeMagnet.targetX = clamp((point.x - r.left - r.width / 2) * .09, -6, 6);
      activeMagnet.targetY = clamp((point.y - r.top - r.height / 2) * .09, -4, 4);
    }
    let moving = false;
    if (pointerKnown) {
      // Critically damped spring: movement can reverse without restarting a CSS transition.
      point.vx += ((point.x - point.rx) * 200 - point.vx * 28) * dt;
      point.vy += ((point.y - point.ry) * 200 - point.vy * 28) * dt;
      point.rx += point.vx * dt; point.ry += point.vy * dt;
      const resting = Math.abs(point.x - point.rx) + Math.abs(point.y - point.ry) + Math.abs(point.vx) + Math.abs(point.vy) < .04;
      if (resting) { point.rx = point.x; point.ry = point.y; point.vx = point.vy = 0; }
      else moving = true;
      reticle.style.transform = `translate3d(${point.rx.toFixed(2)}px, ${point.ry.toFixed(2)}px, 0)`;
      field.style.transform = `translate3d(${point.x.toFixed(2)}px, ${point.y.toFixed(2)}px, 0)`;
    }
    cards.forEach(card => {
      const wasMoving = card.x !== card.targetX || card.y !== card.targetY;
      if (!wasMoving && card !== activeCard) return;
      card.x = converge(card.x, card.targetX, amount); card.y = converge(card.y, card.targetY, amount);
      const tilt = document.body.classList.contains('hud-cv') ? 3 : card.node.classList.contains('build-window') ? 9 : 5;
      card.node.style.setProperty('--motion-rx', `${(-card.y * tilt).toFixed(3)}deg`);
      card.node.style.setProperty('--motion-ry', `${(card.x * tilt).toFixed(3)}deg`);
      if (card === activeCard && card.rect) {
        card.node.style.setProperty('--motion-gx', `${((card.targetX + .5) * card.rect.width).toFixed(1)}px`);
        card.node.style.setProperty('--motion-gy', `${((card.targetY + .5) * card.rect.height).toFixed(1)}px`);
      }
      moving ||= card.x !== card.targetX || card.y !== card.targetY;
    });
    magnets.forEach(item => {
      if (item.x === item.targetX && item.y === item.targetY) return;
      item.x = converge(item.x, item.targetX, amount); item.y = converge(item.y, item.targetY, amount);
      item.node.style.setProperty('--motion-tx', `${item.x.toFixed(3)}px`);
      item.node.style.setProperty('--motion-ty', `${item.y.toFixed(3)}px`);
      moving ||= item.x !== item.targetX || item.y !== item.targetY;
    });
    const tx = pointerKnown && sceneVisible ? clamp(point.x / innerWidth - .5, -.5, .5) : 0;
    const ty = pointerKnown && sceneVisible ? clamp(point.y / innerHeight - .5, -.5, .5) : 0;
    pose.x = converge(pose.x, tx, amount); pose.y = converge(pose.y, ty, amount);
    if (scene) {
      scene.style.setProperty('--motion-hx', `${(-pose.x * 20).toFixed(2)}px`);
      scene.style.setProperty('--motion-hy', `${(-pose.y * 16).toFixed(2)}px`);
      scene.style.setProperty('--motion-orbit-x', `${(-pose.y * 24).toFixed(2)}deg`);
      scene.style.setProperty('--motion-orbit-y', `${(pose.x * 30).toFixed(2)}deg`);
      scene.style.setProperty('--motion-zt-x', `${(pose.x * 8).toFixed(2)}px`);
      scene.style.setProperty('--motion-zt-y', `${(pose.y * 8).toFixed(2)}px`);
    }
    moving ||= pose.x !== tx || pose.y !== ty;
    if (moving) schedule();
    else previousTime = 0;
  }
  function typeNext() {
    if (!typing || !enabled || document.hidden) return;
    const text = phrases[typingIndex];
    typingCount += deleting ? -1 : 1;
    typing.textContent = text.slice(0, typingCount);
    let delay = deleting ? 26 : 60;
    if (!deleting && typingCount >= text.length) { deleting = true; delay = 2400; }
    else if (deleting && typingCount <= 0) { deleting = false; typingIndex = (typingIndex + 1) % phrases.length; delay = 450; }
    typingTimer = setTimeout(typeNext, delay);
  }
  function updatePolicy() {
    enabled = preference !== 'off' && !reduced.matches && fine.matches && !print.matches;
    root.dataset.motion = enabled ? 'on' : 'off';
    button.setAttribute('aria-pressed', String(enabled));
    button.disabled = reduced.matches || !fine.matches;
    button.textContent = enabled ? '动效：开' : '动效：关';
    button.title = reduced.matches ? '已遵循系统的减少动态效果设置' : !fine.matches ? '触屏或窄屏使用静态效果' : '切换鼠标跟随、卡片景深和页面动效';
    clearTimeout(typingTimer);
    cancelAnimationFrame(frame); frame = 0; previousTime = 0;
    clearPointer();
    if (!enabled) {
      cards.forEach(card => {
        card.x = card.y = card.targetX = card.targetY = 0;
        card.node.style.removeProperty('--motion-rx'); card.node.style.removeProperty('--motion-ry');
      });
      magnets.forEach(item => {
        item.x = item.y = item.targetX = item.targetY = 0;
        item.node.style.removeProperty('--motion-tx'); item.node.style.removeProperty('--motion-ty');
      });
      if (typing) { typing.textContent = phrases[0]; typingIndex = 0; typingCount = phrases[0].length; deleting = false; }
    } else {
      layoutDirty = true;
      if (typing) typingTimer = setTimeout(typeNext, 450);
    }
  }
  button.addEventListener('click', () => {
    preference = preference === 'off' ? 'on' : 'off';
    try { localStorage.setItem(key, preference); } catch (_) { /* Keep the session preference. */ }
    updatePolicy();
  });
  addEventListener('storage', event => {
    if (event.key === key) { preference = event.newValue === 'off' ? 'off' : 'on'; updatePolicy(); }
  });
  document.addEventListener('pointermove', pointerMove, { passive: true });
  document.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') clearPointer(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', clearPointer);
  document.addEventListener('pointercancel', clearPointer);
  document.addEventListener('keydown', event => { if (event.key === 'Tab') clearPointer(); });
  addEventListener('blur', clearPointer);
  addEventListener('scroll', () => { layoutDirty = true; schedule(); }, { passive: true });
  addEventListener('resize', () => { layoutDirty = true; schedule(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => { layoutDirty = true; schedule(); }).observe(document.body);
  document.fonts?.ready.then(() => { layoutDirty = true; schedule(); });
  document.addEventListener('visibilitychange', () => {
    clearTimeout(typingTimer);
    cancelAnimationFrame(frame); frame = 0; previousTime = 0;
    clearPointer();
    if (!document.hidden && enabled) {
      layoutDirty = true;
      if (typing) typingTimer = setTimeout(typeNext, 450);
    }
  });
  [reduced, fine, print].forEach(query => query.addEventListener('change', updatePolicy));
  updatePolicy();
  if (enabled && revealObserver) revealNodes.forEach(node => {
    node.classList.add('motion-reveal');
    if (node.parentElement?.classList.contains('stagger')) {
      node.style.setProperty('--motion-delay', `${Math.min([...node.parentElement.children].indexOf(node), 4) * 45}ms`);
    }
    revealObserver.observe(node);
  });
})();
