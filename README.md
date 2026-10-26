[English](README.md) · [简体中文](README.zh-CN.md)

# Zhengtao Liang — Portfolio & Resume

BIT M.S. student · Paper accepted at KSEM (CCF-C) · agent collaboration, agent safety, and multimodal large language model safety research.

[Portfolio](https://serennity007.github.io/Serennity007-portfolio/) · [中文简历](https://serennity007.github.io/Serennity007-portfolio/resume.html) · [English Resume](https://serennity007.github.io/Serennity007-portfolio/resume-en.html)

Selected projects cover quant AI Skills, IP/domain research, static source-code scanning, agent CLI tools and financial RSS tooling. Each entry links to its public source.

Serve this folder locally with `python -m http.server 8080`. Static HTML/CSS/JavaScript; no build step. The main branch deploys through `.github/workflows/deploy.yml` to GitHub Pages.

The homepage and interactive CV share ambient light, rotating wireframes, pointer lighting, damped cursor feedback, card tilt and a persistent motion toggle. Mouse tracking works in narrow desktop windows too; touch input hides the mouse follower and reduced-motion settings use a static view. See [motion behavior and checks](docs/motion.md); run `node --test tests/motion.test.cjs` for the controller tests.

The [interactive project desk](docs/workbench.md) explains quant, futures, IP/domain research and static source-code scanning with pinned source links. A synthetic consensus-ranking demo runs in the browser. The interactive CV returns to this desk; no API key or market-data service is required.

Resume variants: `resume.html`, `resume-en.html`, `resume-dark.html`, `resume-dynamic.html`. Keep publication wording and selected projects aligned across all four pages.

Every resume includes a persistent homepage link, version switcher, contact link, Print/PDF action and footer return links. `index.html#resumes` lists all four editions. Shared navigation styles and behavior live in `assets/navigation.css` and `assets/navigation.js`; print hides navigation, and dark editions print with a light background.

Publication wording follows the owner’s instructions: venue and count only; no title, year, author order or publication-status claims.

Language scope: this repository has English and Chinese guides and separate English/Chinese resume pages. It is a static website, not a desktop Release. Some homepage branding and project content remain Chinese.
