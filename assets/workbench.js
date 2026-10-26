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
      index: '03 / NETWORK CHECKS', title: 'GhostTrack Console & Atlas',
      lead: '在原有 GhostTrack 查询工具上增加域名批量检查、DNS/TLS 检查和快照对比，实现任务暂停、取消、失败重试及报告导出。',
      stages: [
        { label: '信息查询', title: 'IP、域名与证书信息查询', body: '并行查询 RDAP、DNS 和 HTTPS/TLS，记录 IP/ASN 归属、原始字段及各数据源状态。', source: ghost + 'public_data.py' },
        { label: '批量检查', title: '域名批量检查与快照对比', body: '批量任务支持暂停、取消和失败重试，检查 DNS、证书有效期及 HTTP 状态。快照对比仅比较两次均成功的数据源。', source: ghost + 'docs/atlas.md' },
        { label: '报告导出', title: '查询结果与检查报告导出', body: '导出 JSON、CSV 和独立 HTML 报告，保留目标、查询时间及数据来源；提供导出预览和脱敏选项。', source: ghost + 'reports.py' }
      ],
      evidence: ghost + 'docs/atlas.md', evidenceLabel: '批量检查说明与使用文档',
      repo: 'https://github.com/Serennity007/GhostTrack',
      artifacts: ['JSON · 查询字段与数据来源', 'CSV · 批量检查结果', 'HTML · 检查报告与快照对比'],
      artifactNote: 'HTTPS/TLS 和证书检查使用本地引擎；Web 托管版的查询范围见文档。'
    },
    audit: {
      index: '04 / STATIC SCANNING', title: 'XSS Audit Desktop',
      lead: '在 xss-audit 审计方法基础上新增源码静态扫描引擎，实现规则匹配、JS/TS/Python AST 分析、源码行定位及结果复核。',
      stages: [
        { label: '规则扫描', title: '源码规则扫描', body: '扫描本地目录或导入的公开 GitHub 代码，按规则输出审查线索，记录扫描范围、跳过文件和解析异常。', source: audit + 'xss_audit/scanner.py' },
        { label: 'AST 分析', title: 'AST 流向分析', body: '使用 Tree-sitter 解析 JS/TS，使用标准库 AST 解析 Python，输出输入来源、赋值传播及敏感调用对应的源码行。', source: audit + 'xss_audit/analysis.py' },
        { label: '复核导出', title: '人工复核与报告导出', body: '按优先级和类别筛选，保存复核状态与笔记，导出 HTML、Markdown、JSON 和 SARIF 2.1.0 报告。', source: audit + 'xss_audit/reports.py' }
      ],
      evidence: audit + 'docs/VERIFICATION.md', evidenceLabel: '本地测试与导出检查记录',
      repo: 'https://github.com/Serennity007/xss-audit-desktop',
      artifacts: ['HTML / Markdown · 审查报告', 'JSON / SARIF 2.1.0 · 结构化扫描结果', '复核记录 · 状态、笔记与源码位置'],
      artifactNote: '本地验证记录为 43 项通过、1 项跳过，另完成 8 组 CLI 导出检查。扫描线索由人工确认。'
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
