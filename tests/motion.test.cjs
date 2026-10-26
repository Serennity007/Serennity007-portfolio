// Lifecycle and scheduler checks. Real visual/pointer checks are documented separately.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../assets/motion.js'), 'utf8');

class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(name, fn) {
    if (!this.listeners.has(name)) this.listeners.set(name, []);
    this.listeners.get(name).push(fn);
  }
  send(name, payload = {}) { (this.listeners.get(name) || []).forEach(fn => fn(payload)); }
}
class Element extends Events {
  constructor(classes = '') {
    super(); this.classes = new Set(classes.split(' ').filter(Boolean));
    this.classList = { add: name => this.classes.add(name), contains: name => this.classes.has(name) };
    this.dataset = {}; this.attributes = {}; this.children = [];
    this.rect = { left: 100, top: 100, width: 400, height: 300 };
    const values = new Map();
    this.style = { setProperty: (k, v) => values.set(k, v), removeProperty: k => values.delete(k), getPropertyValue: k => values.get(k) || '' };
  }
  set className(value) { this.classes = new Set(value.split(' ')); }
  get className() { return [...this.classes].join(' '); }
  append(...nodes) { nodes.forEach(node => { node.parentElement = this; this.children.push(node); }); }
  insertBefore(node) { this.append(node); }
  setAttribute(k, v) { this.attributes[k] = v; if (k === 'class') this.className = v; if (k.startsWith('data-')) this.dataset[this.camel(k.slice(5))] = v; }
  removeAttribute(k) { delete this.attributes[k]; if (k.startsWith('data-')) delete this.dataset[this.camel(k.slice(5))]; }
  camel(k) { return k.replace(/-([a-z])/g, (_, s) => s.toUpperCase()); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k); }
  getBoundingClientRect() { return this.rect; }
  querySelector() { return null; }
  closest(selector) {
    if (selector.startsWith('[') && this.hasAttribute(selector.slice(1, -1))) return this;
    if (selector.startsWith('.') && this.classes.has(selector.slice(1))) return this;
    if (selector.includes('a, button') && this.interactive) return this;
    return this.parentElement?.closest(selector) || null;
  }
}
function fixture(options = {}) {
  const events = new Events(), document = new Events();
  const root = new Element(), body = new Element((options.cv ? 'hud-cv ' : '') + (options.scoped ? 'scoped-motion' : ''));
  const card = new Element('card build-window'), magnet = new Element('btn');
  const readingCard = new Element('card');
  if (options.scoped) { card.setAttribute('data-motion-surface', ''); card.setAttribute('data-motion-zone', ''); body.append(readingCard); }
  const scene = new Element('hero-bg'), typing = options.cv ? null : new Element();
  const nav = new Element(), toolbar = new Element(), reveal = new Element('section');
  card.append(magnet); body.append(card, scene, nav, toolbar, reveal);
  document.documentElement = root; document.body = body; document.hidden = false;
  document.createElement = () => new Element();
  document.createElementNS = () => new Element();
  document.getElementById = () => typing;
  document.querySelectorAll = s => s.startsWith('.card,') ? (options.scoped ? [card, readingCard] : [card]) : s.startsWith('.btn,') ? [magnet] : [reveal];
  document.querySelector = s => s.startsWith('.hero-bg,') ? scene : s === '.hero-bg' ? (options.cv ? null : scene) : s === '.nav-links' ? (options.cv ? null : nav) : toolbar;
  let hit = card;
  document.elementFromPoint = () => hit;
  const frames = new Map(), timers = new Map(), storage = new Map([['zt-motion', options.saved || 'on']]);
  let id = 0, now = 0;
  const queries = new Map();
  const matchMedia = query => {
    if (!queries.has(query)) {
      const result = new Events();
      result.matches = query.includes('reduce') ? !!options.reduced : query === 'print' ? false : !options.coarse;
      queries.set(query, result);
    }
    return queries.get(query);
  };
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.nodes = []; observers.push(this); }
    observe(node) { this.nodes.push(node); }
    unobserve(node) { this.nodes = this.nodes.filter(x => x !== node); }
  }
  const context = {
    document, Element, matchMedia, innerWidth: options.width || 1280, innerHeight: 900,
    localStorage: {
      getItem: key => { if (options.noStorage) throw Error('blocked'); return storage.get(key); },
      setItem: (key, value) => { if (options.noStorage) throw Error('blocked'); storage.set(key, value); }
    },
    addEventListener: events.addEventListener.bind(events),
    requestAnimationFrame: callback => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: handle => frames.delete(handle),
    setTimeout: callback => { timers.set(++id, callback); return id; },
    clearTimeout: handle => timers.delete(handle),
    IntersectionObserver: Observer, ResizeObserver: Observer
  };
  context.window = context;
  vm.runInNewContext(code, context);
  const button = body.children.find(x => x.classList.contains('motion-toggle'));
  function step() {
    const batch = [...frames.values()]; frames.clear(); now += 1000 / 60;
    batch.forEach(callback => callback(now));
  }
  function settle() {
    let count = 0;
    while (frames.size && count++ < 500) step();
    assert.ok(count < 500, 'controller must settle instead of spinning forever');
    return count;
  }
  function move(x, y, target = card, pointerType = 'mouse') {
    hit = target;
    document.send('pointermove', { clientX: x, clientY: y, target, pointerType });
  }
  function media(type, value) {
    const result = [...queries].find(([query]) => query.includes(type))[1];
    result.matches = value; result.send('change');
  }
  return { root, body, card, readingCard, magnet, scene, typing, reveal, button, document, events, frames, timers, storage, observers, settle, step, move, media };
}

test('scoped pages keep long reading cards flat while featured surfaces retain highlights', () => {
  const f = fixture({ scoped: true });
  assert.ok(f.card.classList.contains('motion-card'));
  assert.ok(!f.readingCard.classList.contains('motion-card'));
  assert.equal(f.readingCard.children.length, 0);
  f.move(300, 150); f.settle(); assert.equal(f.root.dataset.pointerZone, 'on');
  f.move(500, 500, f.readingCard); f.settle(); assert.equal(f.root.dataset.pointerZone, 'off');
  assert.equal(parseFloat(f.card.style.getPropertyValue('--motion-rx')), 0);
});

test('the controller has no perpetual idle frame loop', () => {
  const f = fixture(); assert.equal(f.root.dataset.motion, 'on'); f.settle(); assert.equal(f.frames.size, 0);
});
test('pointer inputs coalesce into one scheduled frame and settle at the last point', () => {
  const f = fixture(); f.settle();
  for (let i = 0; i < 100; i++) f.move(120 + i, 160 + i);
  assert.equal(f.frames.size, 1); f.settle();
  const ring = f.body.children.find(x => x.classList.contains('motion-reticle'));
  assert.equal(ring.style.transform, 'translate3d(219.00px, 259.00px, 0)');
});
test('large and reversed movement stays bounded and reaches the latest point', () => {
  const f = fixture(); f.move(900, 200); f.settle();
  f.move(100, 800); f.step(); f.move(1100, 100); f.settle();
  assert.ok(Math.abs(parseFloat(f.card.style.getPropertyValue('--motion-ry'))) <= 4.5);
  assert.ok(!f.card.style.getPropertyValue('--motion-rx').includes('NaN'));
});
test('leaving a card returns the tilt to neutral and clears hover', () => {
  const f = fixture(); f.move(450, 140); f.settle();
  assert.notEqual(parseFloat(f.card.style.getPropertyValue('--motion-rx')), 0);
  f.move(800, 800, f.body); f.settle();
  assert.equal(parseFloat(f.card.style.getPropertyValue('--motion-rx')), 0);
  assert.equal(f.card.dataset.motionHover, undefined);
});
test('scroll invalidates card bounds without a new pointer event', () => {
  const f = fixture(); f.move(450, 200); f.settle();
  const before = f.card.style.getPropertyValue('--motion-gy');
  f.card.rect = { left: 100, top: 150, width: 400, height: 300 };
  f.events.send('scroll'); f.settle();
  assert.notEqual(f.card.style.getPropertyValue('--motion-gy'), before);
});
test('magnetic translation is bounded and resets on keyboard navigation', () => {
  const f = fixture(); f.move(1000, 1000, f.magnet); f.settle();
  assert.ok(Math.abs(parseFloat(f.magnet.style.getPropertyValue('--motion-tx'))) <= 6);
  assert.ok(Math.abs(parseFloat(f.magnet.style.getPropertyValue('--motion-ty'))) <= 4);
  f.document.send('keydown', { key: 'Tab' }); f.settle();
  assert.equal(parseFloat(f.magnet.style.getPropertyValue('--motion-tx')), 0);
  assert.equal(f.root.dataset.pointerActive, undefined);
});
test('turning off clears transforms, timers and persists the preference', () => {
  const f = fixture(); f.move(480, 160); f.settle(); f.button.send('click');
  assert.equal(f.root.dataset.motion, 'off'); assert.equal(f.frames.size, 0); assert.equal(f.timers.size, 0);
  assert.equal(f.card.style.getPropertyValue('--motion-rx'), ''); assert.equal(f.storage.get('zt-motion'), 'off');
  assert.ok(f.typing.textContent.includes('做 AI 研究'));
});
test('stored off preference also applies to the interactive CV', () => {
  const f = fixture({ cv: true, saved: 'off' });
  assert.equal(f.root.dataset.motion, 'off'); f.move(300, 200); assert.equal(f.frames.size, 0);
});
test('cross-tab storage changes update the policy without a reload', () => {
  const f = fixture(); f.events.send('storage', { key: 'zt-motion', newValue: 'off' });
  assert.equal(f.root.dataset.motion, 'off');
  f.events.send('storage', { key: 'zt-motion', newValue: 'on' }); assert.equal(f.root.dataset.motion, 'on');
});
test('system reduced motion takes priority and responds to live changes', () => {
  const f = fixture({ reduced: true }); assert.equal(f.root.dataset.motion, 'off'); assert.equal(f.button.disabled, true);
  f.media('reduce', false); assert.equal(f.root.dataset.motion, 'on');
  f.move(450, 150); f.media('reduce', true); assert.equal(f.frames.size, 0); assert.equal(f.timers.size, 0);
});
test('452px desktop sidebars retain ambient motion and mouse tracking', () => {
  const f = fixture({ width: 452 });
  assert.equal(f.root.dataset.motion, 'on'); assert.equal(f.button.disabled, false);
  f.move(300, 200); f.settle();
  assert.equal(f.root.dataset.pointerMotion, 'on'); assert.equal(f.root.dataset.pointerActive, 'true');
});
test('touch devices retain ambient motion without a ghost mouse follower', () => {
  const f = fixture({ coarse: true, width: 390 }); f.settle();
  assert.equal(f.root.dataset.motion, 'on'); assert.equal(f.root.dataset.pointerMotion, 'off');
  f.move(300, 200, f.card, 'touch'); f.settle();
  assert.equal(f.root.dataset.pointerActive, undefined); assert.equal(f.root.dataset.pointerMotion, 'off');
});
test('actual mouse input enables tracking even when the device media query is coarse', () => {
  const f = fixture({ coarse: true, width: 452 });
  f.move(300, 200); f.settle();
  assert.equal(f.root.dataset.pointerMotion, 'on'); assert.equal(f.root.dataset.pointerActive, 'true');
});
test('touch input on a hybrid laptop removes the mouse follower', () => {
  const f = fixture(); f.move(300, 200); f.settle();
  assert.equal(f.root.dataset.pointerActive, 'true');
  f.document.send('pointerdown', { pointerType: 'touch' }); f.settle();
  assert.equal(f.root.dataset.pointerActive, undefined);
  assert.equal(f.root.dataset.pointerMotion, 'off');
  f.move(300, 200, f.card, 'touch'); assert.equal(f.root.dataset.pointerActive, undefined);
  f.move(300, 200); f.settle(); assert.equal(f.root.dataset.pointerMotion, 'on');
});
test('print cancels tracking and returns to interactive policy afterwards', () => {
  const f = fixture(); f.move(450, 150); f.media('print', true);
  assert.equal(f.root.dataset.motion, 'off'); assert.equal(f.frames.size, 0);
  f.media('print', false); assert.equal(f.root.dataset.motion, 'on');
});
test('background tabs stop animation and typing, then resume without old pointer', () => {
  const f = fixture(); f.move(450, 150); f.document.hidden = true; f.document.send('visibilitychange');
  assert.equal(f.frames.size, 0); assert.equal(f.timers.size, 0);
  f.document.hidden = false; f.document.send('visibilitychange'); f.settle();
  assert.equal(f.root.dataset.pointerActive, undefined); assert.equal(f.timers.size, 1);
});
test('storage restrictions do not disable the toggle or the page', () => {
  const f = fixture({ noStorage: true }); f.button.send('click'); assert.equal(f.root.dataset.motion, 'off');
  f.button.send('click'); assert.equal(f.root.dataset.motion, 'on');
});
test('each reveal is unobserved once visible, regardless of list length', () => {
  const f = fixture(); const observer = f.observers.find(x => x.nodes.includes(f.reveal));
  assert.ok(f.reveal.classList.contains('motion-reveal'));
  observer.callback([{ target: f.reveal, isIntersecting: true }]);
  assert.ok(f.reveal.classList.contains('is-revealed')); assert.equal(observer.nodes.length, 0);
});

test('the pointer ribbon follows reversals with finite geometry and disappears at rest', () => {
  const f = fixture({ width: 452 }); f.move(100, 100); f.settle();
  const ribbon = f.body.children.find(node => node.classList.contains('motion-ribbon'));
  f.move(400, 600); f.step(); f.step();
  assert.equal(ribbon.style.opacity, '1');
  const first = ribbon.children[1].getAttribute('d');
  assert.ok(first.startsWith('M')); assert.ok(!/NaN|Infinity/.test(first));
  f.move(50, 140); f.step();
  assert.notEqual(ribbon.children[1].getAttribute('d'), first);
  f.settle(); assert.equal(ribbon.style.opacity, '0'); assert.equal(f.frames.size, 0);
});
test('turning motion off removes an active ribbon without another frame', () => {
  const f = fixture(); f.move(100, 100); f.settle(); f.move(600, 400); f.step();
  const ribbon = f.body.children.find(node => node.classList.contains('motion-ribbon'));
  assert.equal(ribbon.style.opacity, '1'); f.button.send('click');
  assert.equal(ribbon.style.opacity, '0'); assert.equal(f.frames.size, 0);
});
test('leaving and reentering does not flash a ribbon at the previous pointer position', () => {
  const f = fixture(); f.move(100, 100); f.settle(); f.move(600, 400); f.step();
  const ribbon = f.body.children.find(node => node.classList.contains('motion-ribbon'));
  assert.equal(ribbon.style.opacity, '1'); f.events.send('blur');
  assert.equal(ribbon.style.opacity, '0'); f.move(200, 200); f.step();
  assert.equal(ribbon.style.opacity, '0'); f.settle();
});
test('surface highlights and shadows follow opposite corners and return to neutral', () => {
  const f = fixture(); f.move(120, 120); f.settle();
  const before = parseFloat(f.card.style.getPropertyValue('--motion-specular'));
  assert.ok(before < 50); assert.ok(parseFloat(f.card.style.getPropertyValue('--motion-shadow-x')) > 0);
  f.move(480, 380); f.settle();
  assert.ok(parseFloat(f.card.style.getPropertyValue('--motion-specular')) > 50);
  assert.ok(parseFloat(f.card.style.getPropertyValue('--motion-shadow-x')) < 0);
  f.move(800, 800, f.body); f.settle();
  assert.equal(parseFloat(f.card.style.getPropertyValue('--motion-specular')), 50);
  assert.equal(parseFloat(f.card.style.getPropertyValue('--motion-shadow-x')), 0);
});
test('the compact CV scene is decorative and belongs to the existing header', () => {
  const f = fixture({ cv: true, width: 452 });
  const sigil = f.scene.children.find(node => node.classList.contains('motion-cv-sigil'));
  assert.ok(sigil); assert.equal(sigil.getAttribute('aria-hidden'), 'true');
});
