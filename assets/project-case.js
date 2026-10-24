(() => {
  const tabs = [...document.querySelectorAll('[data-evidence-tab]')];
  const panels = [...document.querySelectorAll('[data-evidence-panel]')];
  if (tabs.length && panels.length === tabs.length) {
    const group = document.querySelector('[data-evidence-tabs]');
    group.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      const panel = panels[index];
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
    });
    const select = (index, focus = false) => {
      tabs.forEach((tab, current) => {
        const active = index === current;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[current].hidden = !active;
      });
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); select(next, true); }
      });
    });
    select(0);
    group.hidden = false;
  }
  const copy = document.querySelector('[data-copy-demo]');
  if (copy) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const status = document.querySelector('[data-copy-status]');
      try {
        await navigator.clipboard.writeText(document.querySelector('#demo-command').textContent.trim());
        status.textContent = '已复制运行命令。先按下方说明安装依赖。';
      } catch {
        status.textContent = '请选中下方命令手动复制。';
      }
    });
  }
})();
