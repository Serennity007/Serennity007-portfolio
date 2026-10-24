(() => {
  document.querySelectorAll('[data-print-resume]').forEach(button => {
    button.addEventListener('click', () => window.print());
  });
  const versionMenu = document.querySelector('.resume-versions');
  if (versionMenu) {
    document.addEventListener('click', event => {
      if (!versionMenu.contains(event.target)) versionMenu.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && versionMenu.open) {
        versionMenu.open = false;
        versionMenu.querySelector('summary').focus();
      }
    });
  }
  const menu = document.querySelector('.mobile-btn');
  const links = document.querySelector('.nav-links');
  if (menu && links) {
    const close = () => {
      links.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    };
    links.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && links.classList.contains('open')) {
        close();
        menu.focus();
      }
    });
  }
})();
