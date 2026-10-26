const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../assets/premiere.js'), 'utf8');
function fixture(options = {}) {
  const events = new Map(), media = new Map(), timers = new Map(), timelines = [], timeoutDelays = [], storageKeys = [];
  let observer, overlay = null, stored = options.seen ? 'seen' : null;
  function node() {
    const listeners = {};
    return { dataset: {}, removed: false, style: { opacity: '', transform: '', visibility: '', removeProperty(name) { this[name] = ''; } },
      setAttribute() {}, addEventListener(name, fn) { listeners[name] = fn; },
      removeAttribute(name) { delete this.dataset[name.replace('data-', '')]; },
      remove() { this.removed = true; if (overlay === this) overlay = null; },
      contains(other) { return other === this || other === this.button; },
      focus() { document.activeElement = this; }, click() { listeners.click?.(); } };
  }
  const root = node(); root.dataset.motion = options.off ? 'off' : 'on';
  const entries = [node(), node(), node(), node()];
  const replay = node(), hero = node();
  hero.querySelectorAll = () => entries;
  hero.querySelector = selector => entries[['h1', '.hero-research', '.hero-details', '.hero-work'].indexOf(selector)];
  const document = {
    documentElement: root, hidden: !!options.hidden, activeElement: null,
    querySelector: selector => selector.includes('.hero') ? hero : replay,
    createElement: () => { const el = node(); el.button = node(); el.querySelector = () => el.button; return el; },
    body: { prepend(el) { overlay = el; } },
    addEventListener(name, fn) { events.set(name, fn); }
  };
  const context = {
    document, location: { hash: options.hash || '' }, scrollY: options.scroll || 0,
    sessionStorage: { getItem(key) { if (options.noStorage) throw Error('blocked'); return options.oldSeen && key === 'zt-opening-v1' ? 'seen' : stored; }, setItem(key, value) { if (options.noStorage) throw Error('blocked'); storageKeys.push(key); stored = value; } },
    matchMedia(query) { const state = { matches: query.includes('reduce') ? !!options.reduced : false, addEventListener(_, fn) { this.change = fn; } }; media.set(query, state); return state; },
    MutationObserver: class { constructor(fn) { observer = fn; } observe() {} },
    addEventListener(name, fn) { events.set(name, fn); },
    setTimeout(fn, delay) { timeoutDelays.push(delay); timers.set(timers.size + 1, fn); return timers.size; }, clearTimeout(id) { timers.delete(id); }
  };
  if (!options.noGsap) context.gsap = {
    timeline(config) {
      if (options.throwGsap) throw Error('failed');
      const tl = { config, killed: false, kill() { this.killed = true; }, call(fn) { this.handoff = fn; return this; }, addLabel() { return this; }, to() { return this; }, fromTo(target) { if (typeof target !== 'string') { target.style.opacity = '0'; target.style.transform = 'translateY(20px)'; } return this; } };
      timelines.push(tl); return tl;
    }
  };
  context.window = context;
  vm.runInNewContext(source, context);
  return { root, document, replay, entries, timelines, timers, timeoutDelays, storageKeys, media, get overlay() { return overlay; }, get stored() { return stored; }, event(name, detail = {}) { events.get(name)?.(detail); }, policyOff() { root.dataset.motion = 'off'; observer(); } };
}
test('opening completes into a finite hero sequence and releases inline styles', () => {
  const f = fixture(); assert.ok(f.overlay); assert.equal(f.stored, 'seen');
  f.timelines[0].config.onComplete();
  assert.equal(f.overlay, null); assert.equal(f.timers.size, 0); assert.equal(f.root.dataset.opening, undefined);
  assert.equal(f.timelines.length, 2);
  f.timelines[1].config.onComplete();
  assert.ok(f.entries.every(x => !x.style.opacity && !x.style.transform));
});
test('skip returns keyboard focus to replay and still reveals the hero', () => {
  const f = fixture(); f.document.activeElement = f.overlay.button;
  f.overlay.button.click();
  assert.equal(f.overlay, null); assert.equal(f.document.activeElement, f.replay); assert.equal(f.timelines.length, 2);
});
test('hero handoff starts under the fading opening and is not restarted on completion', () => {
  const f = fixture(); f.timelines[0].handoff();
  assert.equal(f.timelines.length, 2); assert.ok(f.overlay);
  f.timelines[0].config.onComplete();
  assert.equal(f.overlay, null); assert.equal(f.timelines.length, 2);
  assert.equal(f.timelines[1].killed, false);
  f.timelines[1].config.onComplete(); assert.ok(f.entries.every(x => !x.style.opacity));
});
test('a watchdog releases the page even if animation completion never arrives', () => {
  const f = fixture(); assert.ok(f.timeoutDelays[0] >= 4500 && f.timeoutDelays[0] <= 6000);
  [...f.timers.values()][0]();
  assert.equal(f.overlay, null); assert.equal(f.timers.size, 0);
});
test('the personal introduction retains the supplied identity, research and achievement facts', () => {
  const f = fixture();
  const visibleText = f.overlay.innerHTML.replace(/<[^>]*>/g, '');
  for (const fact of ['梁正涛', '北京理工大学', '智能体协作研究', '智能体安全', '多模态大模型安全研究', 'KSEM（CCF-C）已中稿', '贵州大学专业第一（1/69）', '华为 ICT 国家一等奖', 'GhostTrack', 'XSS Audit Desktop']) assert.ok(visibleText.includes(fact), fact);
  assert.ok(!/PPT|法律 AI|全球.*三等奖|1 篇/.test(visibleText));
});
test('an existing visitor can see the new introduction without clearing old session data', () => {
  const f = fixture({ oldSeen: true }); assert.ok(f.overlay); assert.equal(f.storageKeys[0], 'zt-opening-v2');
});
test('missing or broken animation dependency leaves the page usable', () => {
  for (const options of [{ noGsap: true }, { throwGsap: true }]) {
    const f = fixture(options); assert.equal(f.overlay, null); assert.equal(f.timers.size, 0);
    assert.ok(f.entries.every(x => !x.style.opacity));
  }
});
test('reduced motion and saved off preferences prevent opening and replay', () => {
  for (const options of [{ reduced: true }, { off: true }]) {
    const f = fixture(options); f.replay.click(); assert.equal(f.overlay, null); assert.equal(f.replay.disabled, true);
  }
});
test('revisits, deep links, scroll restoration and hidden tabs bypass opening', () => {
  for (const options of [{ seen: true }, { hash: '#workbench' }, { scroll: 400 }, { hidden: true }]) {
    const f = fixture(options); assert.equal(f.overlay, null); assert.equal(f.timelines.length, 0);
  }
});
test('session storage restrictions do not break opening or cleanup', () => {
  const f = fixture({ noStorage: true }); assert.ok(f.overlay); f.event('keydown', { key: 'Escape' }); assert.equal(f.overlay, null);
});
test('motion toggle cancels both the opening and a running hero sequence', () => {
  const f = fixture(); f.timelines[0].config.onComplete(); assert.equal(f.entries[0].style.opacity, '0');
  f.policyOff(); assert.ok(f.timelines.every(x => x.killed)); assert.ok(f.entries.every(x => !x.style.opacity)); assert.equal(f.replay.disabled, true);
});
test('print and live reduced-motion changes cancel immediately', () => {
  for (const query of ['print', '(prefers-reduced-motion: reduce)']) {
    const f = fixture(); const state = f.media.get(query); state.matches = true; state.change();
    assert.equal(f.overlay, null); assert.equal(f.timers.size, 0);
  }
});
test('navigation, scrolling and backgrounding release all animation state', () => {
  for (const event of ['hashchange', 'pagehide', 'beforeprint', 'wheel', 'visibilitychange']) {
    const f = fixture(); if (event === 'visibilitychange') f.document.hidden = true;
    f.event(event); assert.equal(f.overlay, null); assert.equal(f.timers.size, 0); assert.ok(f.timelines[0].killed);
  }
});
