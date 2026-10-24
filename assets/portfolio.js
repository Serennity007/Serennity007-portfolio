(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('themeBtn');
  try { const saved = localStorage.getItem('theme'); if (saved === 'dark' || saved === 'light') root.dataset.theme = saved; } catch (_) {}
  const syncTheme = () => toggle.setAttribute('aria-label', root.dataset.theme === 'dark' ? '切换浅色主题' : '切换深色主题');
  syncTheme();
  toggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (_) {}
    syncTheme();
  });
  const menu = document.querySelector('.mobile-btn');
  const links = document.getElementById('navLinks');
  const closeMenu = () => { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => menu.setAttribute('aria-expanded', String(links.classList.toggle('open'))));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('open')) { closeMenu(); menu.focus(); } });
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    const subject = encodeURIComponent('Portfolio 留言 — ' + fields.get('name'));
    const body = encodeURIComponent(fields.get('message') + '\n\n' + fields.get('name') + ' <' + fields.get('email') + '>');
    document.getElementById('formStatus').textContent = '已请求打开邮件客户端，请在邮件客户端确认发送。';
    location.href = 'mailto:1392452425a@gmail.com?subject=' + subject + '&body=' + body;
  });
})();
