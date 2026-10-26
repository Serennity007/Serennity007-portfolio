/* Small, inspectable browser calculation and source-backed project walkthrough. */
(() => {
  'use strict';
  const samples = {
    default: [{ code: '000001', quality: 10, momentum: 30 }, { code: '000002', quality: 20, momentum: 10 }, { code: '000003', quality: 30, momentum: 20 }],
    momentum: [{ code: '000001', quality: 10, momentum: 10 }, { code: '000002', quality: 20, momentum: 30 }, { code: '000003', quality: 30, momentum: 20 }],
    tied: [{ code: '000001', quality: 10, momentum: 30 }, { code: '000002', quality: 10, momentum: 10 }, { code: '000003', quality: 30, momentum: 20 }]
  };
  function computeConsensus(rows) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('A non-empty, aligned sample is required.');
    const codes = new Set();
    rows.forEach(row => {
      if (!row || typeof row.code !== 'string' || !/^\d{6}$/.test(row.code) || codes.has(row.code)) throw new Error('Codes must be unique six-digit strings.');
      codes.add(row.code);
      if (![row.quality, row.momentum].every(value => typeof value === 'number' && Number.isFinite(value))) throw new Error('Both framework scores must be finite numbers.');
    });
    const percentile = (field, value) => {
      const below = rows.filter(row => row[field] < value).length;
      const equal = rows.filter(row => row[field] === value).length;
      return (below + (equal + 1) / 2) / rows.length * 100;
    };
    return rows.map(row => {
      const qualityPct = percentile('quality', row.quality);
      const momentumPct = percentile('momentum', row.momentum);
      return { ...row, qualityPct, momentumPct, score: (qualityPct + momentumPct) / 2,
        topHits: Number(qualityPct >= 90) + Number(momentumPct >= 90) };
    }).sort((a, b) => b.score - a.score || b.topHits - a.topHits || a.code.localeCompare(b.code));
  }
  if (typeof module === 'object' && module.exports) module.exports = { computeConsensus, samples };
  if (typeof document === 'undefined') return;
  const desk = document.getElementById('workbench');
  if (!desk) return;
  const quant = 'https://github.com/Serennity007/awesome-stock-quant-skills/blob/0e23df9fbde7d3d9362c52ef9d448daa9e15c668/';
  const futures = 'https://github.com/Serennity007/taotao-futures-research/blob/14c5c364474ea76c1feb8d81c724eee5dc074167/';
  const ghost = 'https://github.com/Serennity007/GhostTrack/blob/d6e529ffbbefd4e67fa0f8c5238da395661106e8/';
  const audit = 'https://github.com/Serennity007/xss-audit-desktop/blob/018621358082163fe80df8c5d1e8955534d26330/';
  const projects = {
    quant: {
      index: '01 / QUANT RESEARCH', title: 'AI 选股与量化投研工具链',
      lead: '我把财务筛选、共识排序和含成本回测写成脚本，保留每一步的输入与计算结果。',
      stages: [
        { label: '数据口径', title: '先对齐数据，再评分', body: '对齐年报期间与 TTM 估值字段，标记财务缺失状态；不完整评分会在合成前报错。', source: quant + 'my-skills/buffett-value-investing/scripts/research_data.py' },
        { label: '排名合成', title: '保留原始分数，解释排序', body: '先算框架内百分位，再等权平均。并列原始分使用平均排名，结果同时保留覆盖数和输入哈希。', source: quant + 'my-skills/master-ensemble/scripts/ensemble.py' },
        { label: '持仓核算', title: '把成本落实到逐期持仓', body: '按价格漂移后的权重计算调仓额，分别输出毛净收益、换手与建仓成本，并记录输入版本。', source: quant + 'my-skills/framework-backtest/scripts/backtest.py' }
      ],
      evidence: quant + 'docs/validation.md', evidenceLabel: '真实取数与验证记录',
      repo: 'https://github.com/Serennity007/awesome-stock-quant-skills',
      artifacts: []
    },
    futures: {
      index: '02 / FUTURES RESEARCH', title: '涛涛的期货研究',
      lead: '我把板块比较、价格结构和复盘串成一套工作台，固定合约、比较窗口与输入版本。',
      stages: [
        { label: '可知时间', title: '区分观测期与可知时间', body: '保留数据的观测期、公布时点和取数版本。截止时刻以后才可用的数据，不进入旧报告。', source: futures + 'scripts/sector_engine.py' },
        { label: '同窗比较', title: '比较同一段日期的固定合约', body: '明确起止日期、合约、单位和样本覆盖。缺失的终点不补齐，也不把换月拼接当成固定合约表现。', source: futures + 'references/sector-workflow.md' },
        { label: '冻结复盘', title: '保存输入，再比较两次记录', body: '用 SHA-256 检查文件一致性；复盘时识别换月、窗口变化和人工条件修改，把不可比原因写出来。', source: futures + 'scripts/compare_reports.py' }
      ],
      evidence: futures + 'examples/real-source/VERIFICATION.md', evidenceLabel: '公开日线取数记录',
      repo: 'https://github.com/Serennity007/taotao-futures-research',
      artifacts: ['index.html · 交互研究报告', 'REPORT.md / bundle.json · 计算与口径', 'inputs/ · 本次输入与配置'],
      artifactNote: '查看已归档的 AU2612、RB2701、M2701 取数记录，日期为 2026-10-25。'
    },
    ghost: {
      index: '03 / NETWORK RESEARCH', title: 'GhostTrack Console & Atlas',
      lead: '我在 GhostTrack 基础上扩展桌面、移动与 Web 工作台，把 IP、域名和证书查询的来源与结果放在同一处。',
      stages: [
        { label: '来源汇总', title: '整合 IP、域名与证书证据', body: '域名概览并行查询 RDAP、DNS 与 HTTPS/TLS；IP/ASN 模块保留注册范围、网络组织及来源状态。', source: ghost + 'public_data.py' },
        { label: '快照比较', title: '把一次查询保留为可比较的记录', body: 'Atlas 支持快照比较、分批查询、收藏和来源状态，区分托管版与本地引擎的可用能力。', source: ghost + 'docs/atlas.md' },
        { label: '脱敏报告', title: '查询上下文随结果一起导出', body: '导出 JSON、CSV 和独立 HTML，保留工具、输入与查询时间；Atlas 提供脱敏预览，便于分享选定的证据。', source: ghost + 'reports.py' }
      ],
      evidence: ghost + 'docs/atlas.md', evidenceLabel: '软件功能与版本说明',
      repo: 'https://github.com/Serennity007/GhostTrack',
      artifacts: ['JSON · 结果字段、来源与查询上下文', 'CSV · 可筛选的查询表格', 'HTML · 独立研究报告与脱敏结果'],
      artifactNote: '已发布 Windows、Android 与 Web 版本；各端能力与来源限制见项目指南。'
    },
    audit: {
      index: '04 / SOURCE SECURITY', title: 'XSS Audit Desktop',
      lead: '我将 xss-audit 审计方法扩展为双语桌面软件和 CLI，把源码导入、AST 证据、人工分诊与报告串成审查流程。',
      stages: [
        { label: '源码导入', title: '从本地目录或固定 GitHub 快照开始', body: '支持导入公开 GitHub 仓库并指定分支、标签或提交，结合本地目录扫描保留检查范围。', source: audit + 'xss_audit/importer.py' },
        { label: 'AST 证据', title: '把输入、传播与敏感调用放在一起看', body: '对 JS/TS/Python 提供有限 AST 流向证据，展示源码行与传播步骤；自动信号用于辅助人工确认。', source: audit + 'xss_audit/analysis.py' },
        { label: '人工复核', title: '保存判断，再导出可交接的报告', body: '按优先级、类别和关键词筛选，保存待复核、风险、误报或已修复状态，输出离线 HTML、JSON、Markdown 与 SARIF。', source: audit + 'xss_audit/reports.py' }
      ],
      evidence: audit + 'docs/VERIFICATION.md', evidenceLabel: '已归档的本地验证记录',
      repo: 'https://github.com/Serennity007/xss-audit-desktop',
      artifacts: ['HTML / Markdown · 可读审查报告', 'JSON / SARIF 2.1.0 · 结构化线索', '复核记录 · 状态、笔记与源码上下文'],
      artifactNote: '公开验证记录含 43 项通过、1 项跳过及 8 组 CLI 导出检查；审查线索需人工确认。'
    }
  };
  let selected = 'quant', stage = 1, scenario = 'default';
  const tabs = [...desk.querySelectorAll('[data-bench-project]')];
  const stageButtons = [...desk.querySelectorAll('[data-bench-stage]')];
  const scenarioButtons = [...desk.querySelectorAll('[data-bench-sample]')];
  const find = name => desk.querySelector(`[data-bench-${name}]`);
  const chartRows = new Map([...desk.querySelectorAll('[data-bench-row]')].map(row => [row.dataset.benchRow, row]));
  const panel = find('panel');
  function renderChart() {
    const output = computeConsensus(samples[scenario]);
    output.forEach((item, index) => {
      const row = chartRows.get(item.code);
      row.style.order = String(index);
      row.parentElement.append(row);
      row.querySelector('[data-bench-score]').textContent = item.score.toFixed(1);
      row.querySelector('[data-bench-fill]').style.width = item.score.toFixed(3) + '%';
      row.querySelector('[data-bench-raw]').textContent = `质量 ${item.quality} / 动量 ${item.momentum}`;
    });
    scenarioButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.benchSample === scenario)));
  }
  function render(announce = true) {
    const project = projects[selected], step = project.stages[stage];
    tabs.forEach(button => {
      const active = button.dataset.benchProject === selected;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', 'bench-tab-' + selected);
    find('index').textContent = project.index;
    find('title').textContent = project.title;
    find('lead').textContent = project.lead;
    stageButtons.forEach((button, index) => {
      button.querySelector('span').textContent = project.stages[index].label;
      button.setAttribute('aria-pressed', String(index === stage));
    });
    find('step-title').textContent = step.title;
    find('step-body').textContent = step.body;
    find('source').href = step.source;
    find('evidence').href = project.evidence;
    find('evidence').textContent = project.evidenceLabel + ' ↗';
    find('repo').href = project.repo;
    find('demo').hidden = selected !== 'quant';
    find('artifacts').hidden = selected === 'quant';
    if (selected === 'quant') renderChart();
    else {
      find('files').replaceChildren(...project.artifacts.map(text => {
        const item = document.createElement('li'); item.textContent = text; return item;
      }));
      find('artifact-note').textContent = project.artifactNote;
    }
    if (announce) find('status').textContent = `${project.title}：${step.title}`;
    desk.dataset.project = selected;
  }
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => { selected = button.dataset.benchProject; stage = 1; render(); });
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); tabs[next].click(); tabs[next].focus();
    });
  });
  stageButtons.forEach((button, index) => button.addEventListener('click', () => { stage = index; render(); }));
  scenarioButtons.forEach(button => button.addEventListener('click', () => {
    scenario = button.dataset.benchSample; renderChart();
    find('status').textContent = `已切换为「${button.textContent}」，排序首位为 ${computeConsensus(samples[scenario])[0].code}。`;
  }));
  render(false);
  desk.querySelectorAll('[data-bench-controls]').forEach(node => { node.hidden = false; });
})();
