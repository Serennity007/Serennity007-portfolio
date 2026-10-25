[English](README.md) · [简体中文](README.zh-CN.md)

# 梁正涛 — 作品集与简历

北京理工大学硕士在读 · KSEM（CCF-C）会议论文 1 篇 · AI 研究与开源工程。

[在线作品集](https://serennity007.github.io/Serennity007-portfolio/) · [中文简历](https://serennity007.github.io/Serennity007-portfolio/resume.html) · [English Resume](https://serennity007.github.io/Serennity007-portfolio/resume-en.html)

代表项目涵盖量化 AI Skills、组卷与考试系统、PPT 自动化、地图演示应用及 Agent/Git CLI 工具，每项均附公开源码链接。

本地运行：`python -m http.server 8080`。纯 HTML/CSS/JavaScript，无需构建。推送 main 后通过 `.github/workflows/deploy.yml` 部署至 GitHub Pages。

主页与交互简历共用鼠标跟随光场、阻尼光标、卡片倾斜和动效开关；手机及系统减少动画设置使用静态排版。详见[动效说明与检查方法](docs/motion.md)，运行 `node --test tests/motion.test.cjs` 可检查控制器逻辑。

简历版本：`resume.html`、`resume-en.html`、`resume-dark.html`、`resume-dynamic.html`。论文表述与代表项目在四个页面保持一致。

每个简历版本都提供固定的返回主页、版本切换、联系与打印/PDF 入口，页尾也有返回链接。`index.html#resumes` 汇总四个版本。共用导航样式与交互在 `assets/navigation.css`、`assets/navigation.js`；打印时隐藏导航，深色版本使用浅底打印。

论文按本人要求仅写会议名称与篇数，不写题目、年份、作者顺序或录用/发表状态。

语言范围：本仓库提供中英文指南及独立的中英文简历页面，采用静态网站交付，不包装为桌面 Release；部分主页品牌和项目内容仍为中文。
