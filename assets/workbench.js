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
  const ppt = 'https://github.com/Serennity007/beiligong-ppt-skill/blob/decc6c099b374165181eb3d714c928db278e5100/';
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
    ppt: {
      index: '03 / DOCUMENT AUTOMATION', title: 'PPT 批量改造与验收工作流',
      lead: '我把版式扫描、字号放大、PowerPoint 实测与验收写成可复跑的工作流。',
      stages: [
        { label: '版式扫描', title: '先识别版式骨架', body: '扫描形状、颜色、文字与标题层级，用配置记录修改范围和标题方案，再进行批量改造。', source: ppt + 'scripts/ppt_chrome.py' },
        { label: '实测回退', title: '用实际排版结果约束字号', body: '放大字号后调用 Windows PowerPoint 测量越框，放不下就按档回退，再把实测结果写回文件。', source: ppt + 'scripts/ppt_fit.py' },
        { label: '逐项验收', title: '把教师要求变成验收项', body: '检查配色、版面和实测结果；自动检查判不了的内容进入人工核对清单，保留源文件与分版本输出。', source: ppt + 'scripts/ppt_audit.py' }
      ],
      evidence: ppt + 'README.md', evidenceLabel: '工作流与复现命令',
      repo: 'https://github.com/Serennity007/beiligong-ppt-skill',
      artifacts: ['chrome.json · 版式扫描结果', 'fit.json · PowerPoint 实测与回退', 'audit.md · 检查结果与人工核对项'],
      artifactNote: '这里展示产物格式。实测步骤需要 Windows 与 Microsoft PowerPoint。'
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
