# Portfolio direction

Audience: research collaborators and engineering recruiters. Preserve the established geek style; use actual research and reproducible projects as the subject.

Palette: deep ink #050b12, ice #e8f2f5, cyan #70e5ea, muted blue #adc2cf, existing theme-aware surface and line tokens. Noto Sans SC carries Chinese content; JetBrains Mono is limited to code, project identifiers and the opening monogram.

Layout: identity and research on the left, runnable workbench on the right. Below research, give the quant toolchain a full-width feature and use four compact rows for supporting projects. On mobile, stack in reading order. In the interactive CV, research and projects have direct links and quieter editorial entries. Standard Chinese/English printable sources and PDF downloads remain unchanged.

The memorable moment is a finite 1.53-second orbital/monogram opening, followed by identity, research, supporting information and workbench. No fake loading percentage, scroll lock, indefinite loader, or external runtime request. Session revisits and deep links bypass it; an explicit replay button is available. Escape, skip, wheel, pagehide, backgrounding, print and reduced-motion changes terminate it. The global motion toggle also controls it. A 2.4s JS watchdog and 2.8s CSS escape prevent blocking content if GSAP fails.

GSAP is vendored with its license header; transforms and opacity are animated through a labeled timeline. Normal content is visible without JavaScript or GSAP. Pointer sheen/tilt is scoped to the workbench and quant feature; long CV text stays flat. The existing demand-driven pointer controller is retained.

References: [frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), [GSAP timeline](https://github.com/greensock/gsap-skills/blob/main/skills/gsap-timeline/SKILL.md), [GSAP performance](https://github.com/greensock/gsap-skills/blob/main/skills/gsap-performance/SKILL.md).
