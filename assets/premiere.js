/* Finite opening sequence. Content remains usable if GSAP, storage or JS fails. */
(() => {
  'use strict';
  const root = document.documentElement;
  const hero = document.querySelector('.portfolio-premiere .hero');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const print = matchMedia('print');
  const replay = document.querySelector('[data-replay-opening]');
  const seenKey = 'zt-opening-v1';
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
    overlay.setAttribute('role', 'region');
    overlay.setAttribute('aria-label', '主页开场动画');
    overlay.innerHTML = '<div class="opening-art" aria-hidden="true"><svg class="opening-lines" viewBox="0 0 700 420" fill="none"><g class="opening-orbits"><ellipse cx="350" cy="210" rx="245" ry="94"/><ellipse cx="350" cy="210" rx="245" ry="94" transform="rotate(60 350 210)"/><ellipse cx="350" cy="210" rx="245" ry="94" transform="rotate(120 350 210)"/></g><path class="opening-axis" d="M10 210H690M350 20V400"/><circle class="opening-point" cx="350" cy="210" r="4"/></svg><span class="opening-monogram">ZT<span>_</span></span><span class="opening-caption">梁正涛 · 研究与开源</span><span class="opening-rule"></span></div><button type="button" class="opening-skip">跳过开场 <span aria-hidden="true">↗</span></button>';
    document.body.prepend(overlay);
    overlay.querySelector('button').addEventListener('click', () => finish(true));
    root.dataset.opening = 'playing';
    // Also backed by a CSS timeout; no scroll lock or hidden page content.
    fallback = setTimeout(() => finish(true), 2400);
    try {
      timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => finish(true) });
      timeline.addLabel('gather', 0)
        .fromTo('.opening-orbits', { scale: .62, opacity: 0, rotation: -24, transformOrigin: '350px 210px' }, { scale: 1, opacity: .8, rotation: 0, duration: .8 }, 'gather')
        .fromTo('.opening-axis', { opacity: 0 }, { opacity: .2, duration: .5 }, 'gather+=0.15')
        .fromTo('.opening-monogram', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .55 }, 'gather+=0.2')
        .fromTo('.opening-caption', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .5 }, 'gather+=0.38')
        .fromTo('.opening-rule', { scaleX: 0 }, { scaleX: 1, duration: .85, ease: 'power2.inOut' }, 'gather+=0.3')
        .addLabel('handoff', 1.08)
        .call(() => { handedOff = true; revealHero(); }, [], 'handoff')
        .to('.opening-art', { scale: 1.06, opacity: 0, duration: .38 }, 'handoff')
        .to(overlay, { opacity: 0, duration: .32 }, 'handoff+=0.13');
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
