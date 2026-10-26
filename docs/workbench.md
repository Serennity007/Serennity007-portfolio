# Interactive project desk

The homepage's `#workbench` introduces four public projects through implementation decisions and source links: quant research, futures research, IP/domain research and static source-code scanning. The interactive CV links back to it. `assets/workbench.css` and `assets/workbench.js` add the behavior without a build step or external runtime dependency.

Project tabs support click, touch, Left/Right and Home/End keys. Stage buttons select a design decision and its source. These are project explanations, not a replay of an executed job. The futures and security-tool views list artifact formats and link to archived retrieval records, software guides or local verification receipts.

## Browser calculation

The quant view calculates consensus ranks locally. Its default three rows use the repository's `examples/ensemble/quality.csv` and `momentum.csv` values. The other two presets are explicit synthetic variations for interaction. The page does not fetch prices or execute trades.

For each framework, the percentile is `(number below + average tied rank) / row count × 100`. The consensus is the equal-weight mean of the two percentiles. Sorting uses unrounded consensus, number of top-10-percentile hits, then code. This matches the referenced Python implementation for aligned, complete, two-framework samples. The browser demo does not implement the CLI's CSV loading, partial-pool options, manifest or backtest.

Run the frontend tests:

```sh
node --test tests/motion.test.cjs tests/workbench.test.cjs tests/premiere.test.cjs
```

Tests include the archived 83.3 / 66.7 / 50.0 result, changed momentum, average tied ranks, constant scores, input validation and non-mutation. Check the real interface at 320 px, the desktop sidebar size and a full desktop size. Confirm tab keyboard behavior, all project/stage links, preset changes, the persistent motion switch and the CV return link. Without JavaScript, the default quant explanation, chart values and source links remain readable; enhancement controls stay hidden.

## Source snapshots

Reviewed on 2026-10-26. Interface links use these commits:

- Quant: `0e23df9fbde7d3d9362c52ef9d448daa9e15c668`. [Scoring implementation](https://github.com/Serennity007/awesome-stock-quant-skills/blob/0e23df9fbde7d3d9362c52ef9d448daa9e15c668/my-skills/master-ensemble/scripts/ensemble.py) and [validation records](https://github.com/Serennity007/awesome-stock-quant-skills/blob/0e23df9fbde7d3d9362c52ef9d448daa9e15c668/docs/validation.md).
- Futures: `14c5c364474ea76c1feb8d81c724eee5dc074167`. [Comparison policy](https://github.com/Serennity007/taotao-futures-research/blob/14c5c364474ea76c1feb8d81c724eee5dc074167/references/sector-workflow.md) and [archived retrieval record](https://github.com/Serennity007/taotao-futures-research/blob/14c5c364474ea76c1feb8d81c724eee5dc074167/examples/real-source/VERIFICATION.md). This view describes the preserved sector workflow, not every feature of the newer desk.
- GhostTrack: `d6e529ffbbefd4e67fa0f8c5238da395661106e8`. [Public-data engine](https://github.com/Serennity007/GhostTrack/blob/d6e529ffbbefd4e67fa0f8c5238da395661106e8/public_data.py), [Atlas guide](https://github.com/Serennity007/GhostTrack/blob/d6e529ffbbefd4e67fa0f8c5238da395661106e8/docs/atlas.md) and [report exports](https://github.com/Serennity007/GhostTrack/blob/d6e529ffbbefd4e67fa0f8c5238da395661106e8/reports.py). This is an extension of HunxByts/GhostTrack; source attribution is retained in the showcase.
- XSS Audit Desktop: `018621358082163fe80df8c5d1e8955534d26330`. [Static scanner](https://github.com/Serennity007/xss-audit-desktop/blob/018621358082163fe80df8c5d1e8955534d26330/xss_audit/scanner.py), [AST analysis](https://github.com/Serennity007/xss-audit-desktop/blob/018621358082163fe80df8c5d1e8955534d26330/xss_audit/analysis.py) and [verification](https://github.com/Serennity007/xss-audit-desktop/blob/018621358082163fe80df8c5d1e8955534d26330/docs/VERIFICATION.md). It extends the xss-audit playbook; findings are review signals and require human confirmation.
