(() => {
  const links = [...document.querySelectorAll('.cv-rail a[href^="#"], .resume-section-nav a[href^="#"]')];
  const ids = [...new Set(links.map(link => link.hash.slice(1)))];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  const progress = document.querySelector('[data-cv-progress]');
  const percent = document.querySelector('[data-cv-percent]');
  const reading = document.querySelector('[data-cv-reading]');
  if (reading) reading.hidden = false;
  let queued = false;
  const update = () => {
    queued = false;
    const range = document.documentElement.scrollHeight - innerHeight;
    const value = range > 0 ? Math.min(100, Math.max(0, Math.round(scrollY / range * 100))) : 100;
    if (progress) progress.value = value;
    if (percent) percent.textContent = value + '%';
    let active = null;
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= Math.max(120, innerHeight * .3)) active = section.id;
    });
    if (value === 100) active = sections[sections.length - 1]?.id;
    links.forEach(link => {
      if (link.hash === '#' + active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
  update();
})();
