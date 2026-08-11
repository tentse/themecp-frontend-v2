# ThemeCP — Design & Styling Guide

> **Purpose.** This document captures the *exact* visual language of the current ThemeCP frontend so that
> **ThemeCP v2** can reproduce the same look-and-feel that users already like. It is **framework-agnostic**:
> every value below is the source of truth, presented as design tokens + component recipes. You can implement
> them in plain CSS, CSS custom properties, Tailwind, styled-components, or anything else.
>
> The current app uses **plain per-component `.css` files + some inline styles** — no Tailwind, no CSS
> variables, no token system. v2 does **not** have to copy that approach; it only has to reproduce the
> *result*. Treat the tables here as the canonical values.

---

## 1. Design philosophy

ThemeCP's aesthetic is **monospace, black-on-white, lightly neo-brutalist**. The personality comes from a few
consistent moves:

1. **Monospace everywhere.** The entire UI is set in `monospace`. This is the single most important brand
   trait — it makes the app feel like a coding/terminal tool, which fits its competitive-programming audience.
2. **Black & white core, sharp borders.** Containers are white with **solid black borders** and rounded
   corners. Primary buttons are solid black with white text. There is no theme color flooding the page.
3. **Hard offset shadows (neo-brutalist).** Key interactive elements cast a chunky, offset drop-shadow; pressing
   them removes the shadow and nudges the element down/right, simulating a physical button press.
4. **Codeforces-native rating colors.** Anything tied to a rating (problems, performance, the rating chart)
   uses Codeforces' familiar tiered color scale, so the audience reads difficulty/rank instantly.
5. **Small playful accents.** A hotpink animated underline under nav links, a typewriter hero animation, a
   red `CP` in the wordmark, brand-blue Discord/action buttons. Used sparingly against the neutral base.
6. **Fade-on-hover feedback.** Most buttons just drop opacity on hover/active; a few invert their colors.
   Transitions are quick (~0.15s).

**Keep these and the app will feel the same. Lose the monospace font or the black sharp borders and it won't.**

---

## 2. Design tokens

### 2.1 Typography

| Token | Value | Notes |
|---|---|---|
| Font family (global) | `monospace` | Set globally via a universal selector; applies to the whole app. |
| Font family (Donation card only) | `Arial, Helvetica, sans-serif` (titles) / `'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif` (body) | Intentional exception — the donation panel reads as "softer" sans-serif. |
| Base weight | `600` | Global default. |
| Bold weight | `700` / `bold` | Buttons, headings, emphasis. |
| Light weight | `lighter` | Contest-history table cells. |
| Base size | `20px` | Global default font-size. |
| Hero title | `4em` | Home typewriter line. |
| Section title | `45px` (mobile `30–35px`) | "What is ThemeCP?", "Why does it work?" |
| Section body | `30px` | Description panel. |
| List item body | `25px` | Bulleted "why it works" list. |
| Large heading | `3rem` / `50px` | Level-sheet `h1`, Guide header. |
| Small/dense text | `16–17px` | Notes, dropdown items, donation body. |

> **Implementation tip for v2:** apply `font-family: monospace; font-weight: 600;` at the root/`body` level so
> it cascades, exactly like today. Override to sans-serif only inside the donation/contributor area.

### 2.2 Color palette — neutrals & accents

| Role | Value | Where used |
|---|---|---|
| Ink / borders / primary button bg | `#000000` (`black`) | Borders, text, primary buttons. |
| Surface / page background | `#FFFFFF` (`white`) | Page background (implicit default), button text, inverted-button bg. |
| Mid grey (borders, text) | `grey` / `#808080` | Soft borders, secondary container borders, sub-1200 rank text. |
| Light grey (active chip) | `lightgrey` | Active sub-navbar item background. |
| Hairline grey | `#CCC` / `#CCCCCC` | Input/dropdown borders; also the `<1200` problem-difficulty fill. |
| Panel grey | `rgb(210, 206, 206)` | Timer box background. |
| Field grey | `#f1f1f1` | Dropdown button background + hover row. |
| Accent — nav underline | `hotpink` | Animated underline beneath nav links on hover. |
| Accent — Discord brand | `#5562EA` | Discord button (text inverts to this on active). |
| Accent — action blue | `#24A4F2` | Refresh button, "ThemeCP" CTA button. |
| Accent — link blue | `darkblue` | Problem links in the contest table. |
| Accent — chart series (ThemeCP) | `#000033` | ThemeCP rating line on the Highcharts graph. |
| Accent — chart series (CF) | `red` | Codeforces rating line on the graph. |
| Warning / emphasis red | `red` / `#FF0000` | Warnings, timers, donation target, the `CP` in "ThemeCP". |

### 2.3 Borders

| Token | Value | Use |
|---|---|---|
| Container border | `2px solid black` | Default panel/table/card border. |
| Hero panel border | `3px solid black` | Home title/description panels. |
| Soft border | `1px solid grey` (or `#ccc`) | Inputs, problem/link/reroll boxes, dropdowns. |
| Table cell border | `1px solid black` (contest) / `2px solid black` (history grid) | Table dividers. |
| Focus border | `3px solid black` | Inputs gain a thick black border on focus. |

### 2.4 Border radius scale

| Token | Value | Use |
|---|---|---|
| xs | `4–5px` | Inputs, donation logos, dropdowns, small chips. |
| sm | `7–10px` | Most containers/cards, sub-navbar chip. |
| md | `15px` | Refresh button, Contest main container. |
| lg | `20px` | Hero panels, primary/start buttons, login button container. |
| pill | `30px` | "Get Started" hero button. |
| circle | `40px` (on a 32px img) | Round Discord icon. |

### 2.5 Shadow presets (neo-brutalist hard shadows)

| Token | Value | Use |
|---|---|---|
| Login press shadow | `box-shadow: 5px 5px 10px 1px black` | Google login button; removed on `:active`. |
| Card lift shadow | `box-shadow: 8px 8px 10px 5px gray` | Contest main container. |
| Handle button shadow | `box-shadow: 8px 5px 8px grey` | Add-handle button; removed on `:active`. |
| Dropdown soft shadow | `box-shadow: 0 8px 16px rgba(0,0,0,0.2)` | The only "soft" shadow — dropdown menu. |

### 2.6 Motion / transitions

| Token | Value | Use |
|---|---|---|
| Fast | `0.10s` | Reroll box. |
| Default | `0.15s` | Most buttons/links. |
| Medium | `0.20s` | Start button. |
| Slow | `0.25s` | Login/logout/get-started buttons, active sub-nav chip. |
| Nav underline | `opacity 300ms, transform 300ms` | Hotpink underline reveal. |
| Hero typewriter | `typing 2s steps(22)` + `blink .5s step-end infinite alternate` | Home hero line. |

### 2.7 Breakpoints

| Token | Query | Behavior |
|---|---|---|
| Mobile (primary) | `@media (max-width: 730px)` | Used in nearly every component. Logo `200px→100px`, nav font `→10px`, fixed widths collapse to `~94–100%`, hero `*{font-size:8px}` reset then per-element bumps. |
| Desktop-L | `@media (max-width: 1500px)` | Donation container height shrinks. |
| Desktop-M | `@media (max-width: 1400px)` | Donation width shrinks; contest-history grid re-flows column ratios. |
| Desktop-S | `@media (max-width: 1300px)` | Profile data/graph widths `1020/1025px → 850px`. |

> v2 note: today's layout is **fixed-pixel widths** with manual breakpoints. If v2 wants to be more fluid,
> preserve the *proportions and the mobile collapse behavior* rather than the exact pixel widths.

---

## 3. Rating color systems

ThemeCP uses **three** rating-driven color maps. They are central to the product's identity — reproduce them
exactly.

### 3.1 Problem-difficulty background palette (pastel)

Used as the **cell/box background** for a problem based on its Codeforces rating. Appears in the level sheet, the
active-contest problem boxes, the contest-history problem cells, and as Highcharts y-axis `plotBands`.

| Rating range | Hex |
|---|---|
| `0 – 1199` | `#CCCCCC` |
| `1200 – 1399` | `#77FF77` |
| `1400 – 1599` | `#77DDBB` |
| `1600 – 1899` | `#AAAAFF` |
| `1900 – 2099` | `#FF88FF` |
| `2100 – 2299` | `#FFCC88` |
| `2300 – 2399` | `#FFBB55` |
| `2400 – 2599` | `#FF7777` |
| `2600 – 2999` | `#FF3333` |
| `3000 +` | `#AA0000` |

*(Highcharts plotBands use the same scale, with the first band `0–1200` = `#CCCCCC` and the last `3000–4500` = `#AA0000`.)*

### 3.2 Codeforces rank text colors

Used as the **text color** for performance/rating numbers (Profile, contest history). This is the standard
Codeforces rank palette.

| Rating range | Hex | CF rank feel |
|---|---|---|
| `1 – 1199` | `#808080` | Gray (newbie/pupil) |
| `1200 – 1399` | `#008000` | Green |
| `1400 – 1599` | `#03A89E` | Cyan |
| `1600 – 1899` | `#0000FF` | Blue |
| `1900 – 2099` | `#AA00AA` | Purple |
| `2100 – 2399` | `#FF8C00` | Orange |
| `2400 +` | `#FF0000` | Red |

### 3.3 Contest-cell status colors

Used as the **background** of a problem cell in contest history, based on solve state.

| State | Hex | Meaning |
|---|---|---|
| Unsolved (`null`) | `#FFE3E3` | Light red/pink — not solved. |
| Upsolved (`-1`) | `#FFCC88` | Orange — solved after the contest. |
| Solved (positive time) | `#D4EDC9` | Light green — solved in-contest. |

> Implement these as simple range→hex functions (today they're `getBackgroundColor` / `getPerformanceColor` /
> `getSolvedColor` `if/else` ladders). A lookup table keyed by range is the cleaner v2 form, but keep the exact
> hex values and boundaries.

---

## 4. Component recipes

Each recipe lists the *intent* + the key values. Build them however your stack prefers.

### 4.1 Buttons

**Primary (solid black).** — login, logout, start, get-started, download, donate.
- `background: black; color: white; border: none; border-radius: 10–20px; cursor: pointer; transition: 0.25s;`
- `:hover { opacity: 0.8 }` · `:active { opacity: 0.5 }`
- Pill variant ("Get Started"): `border-radius: 30px; padding: 8px 20px;`

**Action blue.** — refresh (`#24A4F2`), "ThemeCP" CTA.
- `background: #24A4F2; color: white; border-radius: 10–15px;`
- ThemeCP CTA inverts on hover: `:hover { color: #24A4F2; background: white }`.

**Color-invert.** — donate, download, upload, themecp.
- Start solid (black or blue) and swap bg/text on `:hover`; some restore on `:active`.

**Press-down (hard-shadow).** — Google login, add-handle.
- Rest: a hard offset `box-shadow` (see §2.5).
- `:active { box-shadow: none; margin-left: +2–3px; margin-top: +1–2px; }` — the loss of shadow + nudge reads as a physical press.

**Discord.** — `background: #5562EA; color: white; border-radius: 20px; width: 150px; height: 40px;`
- `:active { background: white; color: #5562EA }`. Contains a round 32px icon (`border-radius: 40px`).

### 4.2 Inputs

- Rest: `border: 1px solid grey; border-radius: 5px; height: ~25–30px; padding-left: 10px;`
- `:focus`: thicken to `border: 3px solid black` and **shrink height/margins a couple px** to keep size stable
  (e.g. `height: 25px → 22px; margin-left: 7px → 4px`).

### 4.3 Containers / panels / cards

- White surface, `border: 2px solid black` (or `2px solid grey` for the profile cards), `border-radius: 7–15px`.
- Hero panels use the heavier `3px solid black`, `border-radius: 20px`.
- Contest main container adds the `8px 8px 10px 5px gray` lift shadow.
- Generous internal padding (`20–50px`) and fixed pixel widths (see §5).

### 4.4 Navbar + animated underline

- `display: flex; align-items: center; justify-content: space-between; padding: 20px 30px;`
- Logo `width: 200px` (mobile `100px`), `cursor: pointer`.
- Links: `list-style: none; text-decoration: none; color: inherit;` items spaced `margin-right: 30px`.
- **Hotpink underline:** a `::after` pseudo-element, `height: 0.1em; background: hotpink;`,
  `transform: scale(0)` at rest → `transform: scale(1)` on `:hover`/`:focus`, with `transition: transform 300ms, opacity 300ms; transform-origin: center;`

### 4.5 Sub-navbar (tab chips)

- Active chip: `background: lightgrey; border-radius: 5px; padding: 0 5px; transition: 0.25s;`
- Inactive: same padding, no background. Both `cursor: pointer`, `margin-right: 10px`.

### 4.6 Tables

- **Problem boxes / level sheet:** CSS grid, fixed column template, cells centered with flex; cell background from the §3.1 palette.
  - Level sheet grid: `grid-template-columns: 1fr 1.5fr 2fr 2fr 2fr 2fr 2fr;` cells `border: 1px solid black` on all sides.
- **Contest history:** a 15-column `fr` grid (`0.4fr 1.6fr 1.9fr 0.7fr 0.8fr ...`), header row + data rows share the same template; cells `border: 2px solid black`, body text `font-weight: lighter`. Column ratios re-flow at `max-width: 1400px`.
- **Active contest table:** real `<table>` with `border-collapse: collapse`, `th/td { border: 1px solid black; padding: 8px; text-align: left; }`, fixed `width: 800px`.

### 4.7 Timer box

- `border: 2px solid black; border-radius: 10px; width: 280px; height: 120px; background: rgb(210,206,206);` The 2-minute warning timer text is `red`.

### 4.8 Donation card (the sans-serif exception)

- `width: 400px; border: 2px solid black; border-radius: 10px;` collapses across the 1500/1400/730 breakpoints.
- Title: `Arial` sans-serif, `font-size: 28px`, hover inverts to `background: black; color: white`.
- Body: Gill-Sans stack, `~17px`. Payment logos: `140×30`, `border: 2px solid black; border-radius: 5px`.
- Donation target text: `red`, `font-weight: bolder`.

### 4.9 Hero typewriter

- `.typing-demo { width: 22ch; white-space: nowrap; overflow: hidden; border-right: 3px solid; font: bold 4em monospace; animation: typing 2s steps(22), blink .5s step-end infinite alternate; }`
- `@keyframes typing { from { width: 0 } }` · `@keyframes blink { 50% { border-color: transparent } }`
- The text is `Welcome to ThemeCP...` with `CP` wrapped in `.make-red` (`color: red; font: bold 1em monospace`).

### 4.10 Highcharts rating graph theme

- `chart: { type: 'line', height: 450, zoomType: 'xy' }`, `credits.enabled: false`, `title: ''`.
- `xAxis: { type: 'datetime', dateTimeLabelFormats: { day: '%e %b' }, gridLineWidth: 1, title: 'Date' }`.
- `yAxis: { min: 0, title: 'Rating', tickPositions: [], plotBands: <§3.1 palette> }`.
- Two series with shared marker style `{ enabled: true, radius: 3, fillColor: 'white', lineWidth: 2, lineColor: 'black' }`:
  - `ThemeCP_Rating` → `color: '#000033'`
  - `CF_Rating` → `color: 'red'`
- `rangeSelector.enabled: true`, reset-zoom button bottom-right.

---

## 5. Layout & spacing

- **Fixed-pixel, left-anchored layouts.** Representative widths: contest main `800px`, donation `400px`,
  profile data `1020px`, profile graph `1025px`, importer `50%`, level table `75%`.
- **Manual margins** create the spacing rhythm (e.g. `margin-left: 30px / 50px`, up to `margin-left: 510px` on
  the Guide header). There is no spacing scale — values are hand-tuned per component.
- **Flexbox** for the navbar, button rows, and centering (`display: flex; justify-content: center; align-items: center;`).
- **CSS grid** for the level-sheet and contest-history tables.
- No explicit page background → defaults to white. No global container/max-width wrapper.

> v2 recommendation: introduce a small spacing scale and a max-width content wrapper, but keep the *visual
> density and left-anchored feel*. Don't center everything into a narrow column if you want it to feel the same.

---

## 6. Responsive behavior

- **Primary mobile breakpoint: `max-width: 730px`**, present in almost every component.
  - Logo shrinks `200px → 100px`; nav font drops to `~10px`; `nav-right li` margin `30px → 10px`.
  - Fixed-width containers collapse to `~94–100%` and `margin-left` resets to `1–5px`.
  - Home applies a blunt `* { font-size: 8px }` reset, then bumps specific elements (`title 35px`, `title-2 30px`, buttons `20px`) and switches `.description-box` from `row` to `block`.
- **Desktop step-downs:** `1500px` (donation height), `1400px` (donation width + history grid ratios),
  `1300px` (profile widths `→ 850px`).

---

## 7. "Reproduce-it" checklist

Tick all of these and v2 will feel like v1:

- [ ] **Everything is `monospace`**, weight 600 base / 700 bold. (Donation card is the only sans-serif area.)
- [ ] Page is **white**; primary buttons are **solid black with white text**.
- [ ] Containers have **sharp solid borders** — `2px solid black` default, `3px` on hero panels, `1px solid grey` on inputs/soft boxes.
- [ ] Corners are **rounded** on the §2.4 scale (inputs ~5px, cards ~10px, panels/buttons ~20px, the hero CTA is a 30px pill).
- [ ] Key buttons cast a **hard offset shadow** and **lose it + nudge down/right on press** (login, add-handle).
- [ ] Buttons **fade on hover** (`opacity 0.8`) and dim further on active (`0.5–0.6`); a few **invert colors** instead.
- [ ] Inputs **thicken to a 3px black border on focus** (and shrink a touch to compensate).
- [ ] Nav links reveal a **hotpink underline** that scales in on hover (~300ms).
- [ ] Rating-tied cells use the **pastel difficulty palette** (§3.1); rating/performance **text** uses the **CF rank colors** (§3.2); contest cells use the **solved/upsolved/unsolved** colors (§3.3).
- [ ] The rating chart is a **Highcharts line chart** with the difficulty-palette plotBands, a dark-navy ThemeCP line (`#000033`) and a red CF line.
- [ ] Accents stay sparing: **Discord blue `#5562EA`**, **action blue `#24A4F2`**, **link `darkblue`**, **red `#FF0000`** for warnings and the `CP` in the wordmark.
- [ ] Home hero uses the **typewriter animation** with a blinking caret.
- [ ] Layout collapses cleanly at the **730px mobile breakpoint** (logo/font shrink, widths → ~100%).

---

## Appendix — where each value lives today (for cross-checking)

| Concern | File(s) |
|---|---|
| Global monospace + navbar | `frontend/ThemeCP/src/components/Navbar/Navbar.css` |
| Hero, sections, typewriter, Discord/Get-Started buttons | `frontend/ThemeCP/src/pages/Home/Home.css` + `Home.jsx` |
| Login press-down button | `frontend/ThemeCP/src/pages/LoginPage/LoginPage.css` |
| Login/Logout buttons | `frontend/ThemeCP/src/components/UserButton/LogIn.css`, `Logout.css` |
| Add-handle press button | `frontend/ThemeCP/src/components/AddHandle/AddHandle.css` |
| Contest setup (inputs, dropdown, start/themecp buttons) | `frontend/ThemeCP/src/pages/Contest/Contest.css` |
| Active contest table + refresh button + timer | `frontend/ThemeCP/src/pages/StartContest/StartContest.css` |
| Problem-difficulty palette | `Level_Sheet.jsx`, `StartContest.jsx`, `ContestHistory.jsx` (`getBackgroundColor`) |
| CF rank text colors | `Profile.jsx`, `ContestHistory.jsx` (`getPerformanceColor`) |
| Solved/upsolved/unsolved colors | `ContestHistory.jsx` (`getSolvedColor`) |
| Contest-history & level-sheet grids | `Profile/ContestHistory.css`, `Level_Sheet/Level_Sheet.css` |
| Profile layout + breakpoints | `Profile/Profile.css` |
| Rating chart theme | `components/Chart/Chart.jsx` |
| Timer box | `components/Timer/Timer.css` (empty) + inline styles in `Timer_2hr.jsx` / `Timer_2min.jsx` |
| Donation card (sans-serif exception) | `components/Donation/Donation.css` |
| Sub-navbar chips | `components/SubNavbar/SubNavbar.css` |
| Import/export panel | `components/ImportExport/ImportExport.css` |
| Guide page | `pages/Guide/Guide.css` |
| (Empty stylesheets) | `src/index.css`, `Chart.css`, `Timer.css` |

> ⚠️ These file paths describe **v1**, for verification only. v2 should treat §1–§7 as the spec, not these files.
