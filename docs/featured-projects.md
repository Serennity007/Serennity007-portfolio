# Six focus projects / 六个重点项目

The homepage's `#featured-projects` offers six selected source projects with purpose, inputs, outputs, implementation, environment, limits and first-run links. It is static HTML and remains readable without JavaScript. Existing motion, research sections and source-backed workbench demos remain available.

首页增加六个重点项目的用途、输入、产物、实现、环境和边界，提供首次运行、源码指南与验证入口。该区域直接生成静态 HTML，不依赖 JS、GitHub 实时 API 或外部数据服务。

## Shared content

The authoritative selection is [repo-catalog/data/projects.json](https://github.com/Serennity007/repo-catalog/blob/main/data/projects.json). From the catalog checkout, with the profile and portfolio checked out beside it:

```sh
python scripts/build_catalog.py --offline
python scripts/featured_projects.py --profile ../profile --portfolio ../portfolio
python scripts/featured_projects.py --profile ../profile --portfolio ../portfolio --check
```

Only the `featured-projects:start` / `featured-projects:end` block is generated here; edit the manifest, not the generated block. Publication stays with each repository's own Git workflow. This is not a newly enabled background sync.

重点项目统一从导航清单导出；只替换标记块，不改个人介绍。需要维护者执行、检查并分别推送，未启用跨仓库后台同步。

## Verification scope · 2026-10-30

- Six first-run paths were exercised locally with synthetic inputs. XSS scanned two fixture files into an HTML report. Quant ran the consensus/cost demo; futures generated the bilingual ferrous desk; paper passed extraction/build/QA; PPT checked scan/size/source preservation without Office; Agent Trace parsed the public fixture without personal logs.
- Existing frontend motion/workbench/opening checks remain applicable. Check the focus area at a narrow mobile viewport and a two-column desktop viewport, including link focus and overflow.
- Counts in HTML resumes, the terminal variant and quant detail page were refreshed to 31 original Skills / 33 scripts and the source project's dated 60-test record. This does not claim 60 tests were rerun in this website update.
- Existing downloadable PDF resumes were not regenerated. The homepage labels them as archived snapshots; the current six-project entrypoints are the maintained source for project scope.
- The archived four-project workbench intentionally retains pinned source commits and their historical dates. Its calculation demo and coverage do not represent every newer source feature.

No real paper translation, Office rendering, live-market research, npm publication or desktop-binary rebuild is claimed by this website update.
