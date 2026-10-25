# Portfolio motion

The homepage and `resume-dynamic.html` share `assets/motion.css` and `assets/motion.js`.

On a desktop with a fine pointer, move across the featured project and project cards. A light field follows the pointer, a damped reticle trails it, and the cards tilt toward the pointer. The homepage wireframe and the CV's ZT orbit respond on two axes. Action buttons shift by at most 6 px horizontally and 4 px vertically. CV cards tilt at most 1.5 degrees to keep long text readable.

Use the floating **动效：开 / 关** control in the bottom-left corner to change the setting. It stays reachable when the navigation collapses. The preference uses the `zt-motion` local-storage key and carries across these two pages. Storage restrictions leave the session toggle usable. System reduced-motion settings take priority. Printing and background tabs stop pointer tracking. Touch input clears the follower; an actual mouse movement enables it again, including on hybrid devices. Window width controls layout, not mouse availability: a 452 px desktop sidebar supports the same follower. The native cursor remains visible.

An ambient light field drifts without pointer input. The homepage wireframe rotates slowly, and the CV's ZT rings turn in opposite directions. These CSS animations follow the same off, background and reduced-motion policy. Touch devices keep this gentle ambient motion without displaying a mouse reticle.

Inputs update targets; one `requestAnimationFrame` scheduler renders the response and stops after it settles. Scrolling, resizing and font loading invalidate element bounds. The old independent cursor, particle, magnetic-button and typewriter loops were removed. The typewriter uses a separate timer only while the page is active and motion is enabled. Existing CSS marquee motion follows the same on/off setting.

Content is visible without the motion script. Entrance effects opt into an intersection observer, reveal each item once, and allow keyboard focus to reveal an item immediately. Print CSS removes decorations and resets opacity, translation and tilt. The downloadable PDF assets are unchanged.

## Checks

Run from the repository root with Node.js:

```sh
node --test tests/motion.test.cjs
```

These tests cover scheduling and settling, reversal, neutral resets, layout invalidation, bounded magnetic movement, stored preferences, cross-tab changes, reduced motion, 452 px desktop mouse input, coarse-query mouse fallback, touch, print, background tabs, unavailable storage and observer cleanup. They use a DOM harness; they do not replace a real-browser visual check.

For a visual check, serve the repository with `python -m http.server 8080` and check both pages: hover opposite card corners, move out, scroll while hovering, switch the light/dark theme, toggle motion, navigate between the pages, and tab through the controls. Also check 320 px and 390 px widths, the mobile menu, chapter links and print preview. Do not submit the contact form as part of visual testing.

## Design reference

Reviewed [Oil Motion](https://github.com/oil-oil/oil-motion), especially its [runtime input and lifecycle guidance](https://github.com/oil-oil/oil-motion/blob/main/references/runtime.md). Its skill scope directs CSS/JS/SVG interface effects to regular frontend implementation. This change follows that route; it uses code-drawn geometry and does not require a generated video, sprite atlas, external model account or paid API.
