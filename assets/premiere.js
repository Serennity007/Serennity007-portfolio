/* Finite opening sequence. Content remains usable if GSAP, storage or JS fails. */
(() => {
  'use strict';
  const root = document.documentElement;
  const hero = document.querySelector('.portfolio-premiere .hero');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const print = matchMedia('print');
  const replay = document.querySelector('[data-replay-opening]');
  const seenKey = 'zt-opening-v2';
  let seen = false, overlay = null, timeline = null, heroTimeline = null, fallback = 0, handedOff = false;
  try { seen = sessionStorage.getItem(seenKey) === 'seen'; } catch (_) { /* Optional. */ }
  const permitted = () => !reduced.matches && !print.matches && root.dataset.motion !== 'off';
  const entryNodes = () => [...hero.querySelectorAll('[data-entry]')];
  function clearHero() {
    heroTimeline?.kill(); heroTimeline = null;
    // Do not clear pointer-controller styles on the inner workbench.
    entryNodes().forEach(node => ['opacity', 'transform', 'visibility'].forEach(name => node.style.removeProperty(name)));
  }
  function revealHero() {
    clearHero();
    if (!permitted() || !window.gsap || scrollY > 100 || location.hash) return;
    heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out', duration: .65 }, onComplete: clearHero });
    heroTimeline.addLabel('identity', 0)
      .fromTo(hero.querySelector('h1'), { y: 24, opacity: 0 }, { y: 0, opacity: 1 }, 'identity')
      .fromTo(hero.querySelector('.hero-research'), { y: 16, opacity: 0 }, { y: 0, opacity: 1 }, 'identity+=0.13')
      .fromTo(hero.querySelector('.hero-details'), { y: 12, opacity: 0 }, { y: 0, opacity: 1 }, 'identity+=0.24')
      .fromTo(hero.querySelector('.hero-work'), { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, 'identity+=0.32');
  }
  function finish(reveal = false) {
    if (!overlay && !heroTimeline) return;
    const wasPlaying = Boolean(overlay);
    timeline?.kill(); timeline = null;
    clearTimeout(fallback); fallback = 0;
    const focused = overlay?.contains(document.activeElement);
    overlay?.remove(); overlay = null;
    root.removeAttribute('data-opening');
    if (focused) replay?.focus({ preventScroll: true });
    if (reveal && wasPlaying) { if (!handedOff) revealHero(); }
    else clearHero();
  }
  function play() {
    finish();
    if (!permitted() || !window.gsap || document.hidden) return;
    handedOff = false;
    try { sessionStorage.setItem(seenKey, 'seen'); } catch (_) { /* Still one finite sequence. */ }
    overlay = document.createElement('div');
    overlay.className = 'opening-scene';
    overlay.dataset.phase = 'identity';
    overlay.setAttribute('role', 'region');
    overlay.setAttribute('aria-label', '主页开场动画');
    overlay.innerHTML = `
      <div class="opening-space" aria-hidden="true">
        <svg class="opening-lines" viewBox="0 0 1200 800" fill="none" preserveAspectRatio="xMidYMid slice">
          <defs><linearGradient id="opening-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c0f6f5"/><stop offset=".45" stop-color="#70e5ea" stop-opacity=".16"/><stop offset="1" stop-color="#70e5ea" stop-opacity=".8"/></linearGradient></defs>
          <g class="opening-geometry" stroke="url(#opening-metal)">
            <ellipse cx="600" cy="400" rx="480" ry="260"/>
            <ellipse cx="600" cy="400" rx="480" ry="260" transform="rotate(-35 600 400)"/>
            <ellipse cx="600" cy="400" rx="480" ry="260" transform="rotate(35 600 400)"/>
          </g>
          <g class="opening-meridians" stroke="#70e5ea" stroke-opacity=".2"><path d="M-40 120L600 400L1240 120M-40 680L600 400L1240 680M600 -80V880"/><circle cx="600" cy="400" r="340" stroke-dasharray="1 17"/></g>
          <g class="opening-nodes" fill="#a2f0f0"><circle cx="155" cy="280" r="2.5"/><circle cx="1045" cy="520" r="2.5"/><circle cx="930" cy="170" r="2"/><circle cx="270" cy="630" r="2"/></g>
        </svg>
        <span class="opening-sweep"></span>
      </div>
      <div class="opening-profile" aria-hidden="true">
        <div class="opening-name"><span class="opening-name-char">梁</span><span class="opening-name-char">正</span><span class="opening-name-char">涛</span></div>
        <p class="opening-english">Zhengtao Liang</p>
        <p class="opening-school">北京理工大学 · 智能科学与技术硕士在读</p>
        <ul class="opening-research"><li>智能体协作研究</li><li>智能体安全</li><li>多模态大模型安全研究</li></ul>
        <ul class="opening-projects"><li>AI 选股与量化投研工具链</li><li>GhostTrack · 域名检查</li><li>XSS Audit Desktop · 源码扫描</li></ul>
        <div class="opening-proof"><span class="opening-paper">CCF-C 已中稿</span><span>贵州大学专业第一（1/69）</span><span>华为 ICT 国家一等奖</span></div>
      </div>
      <button type="button" class="opening-skip">跳过开场 <span aria-hidden="true">↗</span></button>`;
    document.body.prepend(overlay);
    overlay.querySelector('button').addEventListener('click', () => finish(true));
    root.dataset.opening = 'playing';
    // Also backed by a CSS timeout; no scroll lock or hidden page content.
    fallback = setTimeout(() => finish(true), 7500);
    try {
      timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => finish(true) });
      timeline.addLabel('identity', 0)
        .fromTo('.opening-space', { scale: .76, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: 0, duration: 1.5 }, 'identity')
        .fromTo('.opening-geometry', { scale: .7, rotation: -18, transformOrigin: '600px 400px' }, { scale: 1, rotation: 0, duration: 2.5, ease: 'power2.out' }, 'identity')
        .fromTo('.opening-sweep', { yPercent: -100, opacity: 0 }, { yPercent: 100, opacity: .7, duration: 2, ease: 'power2.inOut' }, 'identity+=0.1')
        .fromTo('.opening-name-char', { yPercent: 105, rotationX: 35, opacity: 0 }, { yPercent: 0, rotationX: 0, opacity: 1, duration: .7, stagger: .08 }, 'identity+=0.12')
        .fromTo('.opening-english', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .5 }, 'identity+=0.35')
        .fromTo('.opening-school', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .55 }, 'identity+=0.48')
        .addLabel('research', .66)
        .fromTo('.opening-research li', { x: 16, opacity: 0 }, { x: 0, opacity: 1, duration: .55, stagger: .07 }, 'research')
        .fromTo('.opening-projects li', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .07 }, 'research+=0.3')
        .fromTo('.opening-proof span', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .07 }, 'research+=0.55')
        .call(() => { if (overlay) overlay.dataset.phase = 'profile'; }, [], 1.9)
        .addLabel('handoff', 5.45)
        .call(() => { if (overlay) overlay.dataset.phase = 'handoff'; handedOff = true; revealHero(); }, [], 'handoff')
        .to('.opening-profile', { y: -12, opacity: 0, duration: .3 }, 'handoff')
        .to('.opening-space', { scale: 1.3, opacity: 0, duration: .55 }, 'handoff')
        .to(overlay, { opacity: 0, duration: .35 }, 'handoff+=0.2');
    } catch (_) { finish(); }
  }
  function policyChanged() {
    if (replay) replay.disabled = !permitted() || !window.gsap;
    if (!permitted()) finish();
  }
  replay?.addEventListener('click', () => {
    window.scrollTo?.({ top: 0, behavior: 'instant' });
    play();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') finish(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
  addEventListener('pagehide', () => finish());
  addEventListener('beforeprint', () => finish());
  addEventListener('hashchange', () => finish());
  addEventListener('wheel', () => finish(), { passive: true });
  addEventListener('touchstart', event => { if (!overlay?.contains(event.target)) finish(); }, { passive: true });
  reduced.addEventListener('change', policyChanged);
  print.addEventListener('change', policyChanged);
  new MutationObserver(policyChanged).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
  policyChanged();
  if (!seen && !location.hash && scrollY < 20) play();
})();
