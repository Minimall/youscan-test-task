# Design Critique: YouScan alerting prototype

**Date:** 2026-05-05
**Scope:** Overall product feel — entire prototype
**Method:** Code review of `prototype.html` (2,215 lines), framed by 4-lens framework + 4 named tests

---

## Summary

The prototype is **closer to crafted than correct**. It has real signature moves — the forecast chart with click-to-sample-mentions, the summary sentence that flashes on edit, the split-pane edit-from-alert, the warm-neutral palette with `#f7f7f5`/`#1c1c1a` instead of pure white/black, Linear-grade easing curves. A discerning user would feel that someone made decisions here.

But the **largest gap is identity**. The typeface, accent color, design tokens, and several gradients are defaults that any AI or template would reach for. Three named tests fail (Swap, Token, AI-slop borderline). The product looks like every other SaaS observability tool — competent, calm, generic. Closing this gap is mostly about *naming* and *replacing 5 specific defaults*, not redesigning the structure.

---

## Composition

**Rhythm — PASS with caveats.** The shell breathes well: dense sidebar (220px) → spacious topbar → list-pane density → detail-pane breathing room (480→820px when editor opens). The transition from triage list to mention cards in the detail pane is the strongest rhythm in the product. **Caveat:** inside the rule editor form, every field uses the same `margin-bottom:18px` and the same `gap:7px` — Conditions (4 sub-rows), Threshold, Severity, Recipients all weigh the same when Threshold should dominate.

**Proportions — PASS.** 220 sidebar / 480 detail / 380 chart-side are deliberate ratios. The 820px detail-pane-with-editor (380 evidence + 440 editor) is the strongest proportion choice in the product — it says "the triggering evidence stays visible while you calibrate." This is doing real work.

**Focal point — PASS in two views, weak in one.**
- Inbox: critical alerts dominate via severity bar + tabular hierarchy. ✓
- Rule editor: forecast chart with 30 bars is the focal point. ✓
- Rules list: focal point is unclear — the table is monotone. The "New rule" button is the only emphasis. The "Last fired" column is doing as much visual work as the rule name.

**Balance — PASS.** Detail pane (light, content-dense) balances the list (dense, neutral). Editor form (left) balances chart (right). The product does not feel tilted.

---

## Craft

**Spacing — borderline.** The grid is implicit: 3/5/7/8/10/11/14/16/18/20/24 — multiple "half-step" values (7px, 11px, 14px) and many `padding:11px 16px 11px 14px` four-sided variants that feel hand-tuned per element rather than systematized. There is no exposed spacing scale (`--space-1`, `--space-2`...) — the values live as magic numbers in CSS. **Decision needed:** either commit to a scale and refactor, or own the case-by-case discipline (and document it).

**Typography — defaulted.** Inter is the most-overused SaaS typeface of 2024–25; it appears verbatim in `anti-patterns.md`. Hierarchy uses size + weight + opacity correctly (3 text levels, weights 400/500/600/700, tabular numerals — all good craft). But the *typeface itself* says nothing about this product. Half-pixel sizes (`12.5px`, `11.5px`, `10.5px`, `9.5px`) suggest type was tuned by eye, not from a defined scale.

**Surfaces — strong.** Warm neutral palette (`#f7f7f5` / `#ffffff` / `#1c1c1a`) avoids the pure-black/pure-white anti-pattern. Surface elevation uses ~3 percentage points of lightness (`--bg-card` vs `--bg-hover` vs `--bg-active`), which is correct — subtle, perceptible, not dramatic. Shadows are tinted with text color (`rgba(28,28,26,...)`), not pure black. Dark-mode palette is genuinely re-derived, not inverted. Best craft moment in the product.

**Interactive states — mostly strong, one gap.** Hover defined on every clickable element, transitions specified per-property (no `transition: all`), focus-visible defined on `.btn`. Animations use `cubic-bezier(.32,.72,0,1)` — the Linear/Apple ease, deliberate. **Gap:** focus-visible is *only* on `.btn`. `.alert-row`, `.preset-card`, `.tab`, `.filter-pill`, `.cmdk-item` have no keyboard focus ring — keyboard users land on these and can't see where they are.

---

## Content

**Story coherence — strong.** Workspace is "Nike CEE," user is "Kateryna P. · PR Specialist," authors are "Olha Voronova / Kyiv Post / Andrii Kostenko" — Ukrainian PR-monitoring scenario reads as a real workplace. Topics ("Nike Ukraine", "Holiday campaign", "Adidas comparison") cohere with the persona. Mention text feels lived-in: *"Multiple sources confirming Nike Ukraine delayed shipments again. The brand's silence is making things worse. Story developing."*

**Data presentation — strong.** Tabular numerals (`font-variant-numeric:tabular-nums`) used everywhere numbers appear. "Fired 7d / 30d / Mute rate" gives comparison context. Forecast chart shows 30 bars with sample-mention drilldown — the data display is chosen because it serves calibration, not as decoration. The "would have fired N times in last 30 days" framing is the kind of contextual data that turns a number into a decision.

**Minor blemish:** `(m.engagement.lk*1000).toLocaleString().replace(/,000$/,'k').replace(/(\d+)000$/,'$1k')` is a regex chain to format engagement numbers. It works for tidy values (8.4k) but produces unpredictable output for edge cases. Use a single formatter.

---

## Structure

**Layout integrity — mixed.** Inline styles appear in ~30+ places: `style="flex:1;display:flex;align-items:center;gap:10px"` repeated as a layout primitive, `style="font-size:11px;text-transform:none;letter-spacing:0;font-weight:500"` resetting tokens inline. The token system exists but layout primitives don't. This is the largest structural smell.

**Simplicity — mostly OK.** No `!important`, no `calc()` workarounds, no negative-margin escapes. One absolute-positioned region (the `.editor-panel` over the detail pane) — and that one is correct because it slides over and detaches from flow. The `setTimeout(()=>{...},0)` pattern after every `innerHTML` to bind events is a code smell, but a contained one.

**Consistency — borderline.** Severity is signaled three different ways: 3px left bar on `.alert-row`, 4px-wide × 18px tall `.rule-bar` on rules-table rows, 4px wide on `.notif-row-bar`. Same concept, three implementations, three sets of magic numbers.

---

## The 4 Named Tests

### Swap Test — **FAIL**

| Decision | Generic alternative | Would anyone notice? |
|---|---|---|
| Inter typeface | SF Pro / system sans | **No** |
| `--accent: #2563eb` | Tailwind blue-600 | **No — it *is* Tailwind blue-600** |
| 220px sidebar + 48px topbar | Linear / Superhuman / Notion proportions | **No** |
| User avatar `linear-gradient(135deg, #a78bfa, #7c3aed)` | Any purple gradient | **No** |
| Border radius scale 3/5/8 | 4/6/8 | Maybe — small signature |
| Severity reds (`#c92a2a` warm) | Tailwind red-700 | Slightly — perceptible warmth |

Five of six core decisions could swap silently. **Two clear signatures hold:** the radius scale and the warm severity hues.

### Squint Test — **PASS**

Blurring the inbox: severity bars remain perceptible as colored verticals on the left edge, list/detail boundary holds via subtle border + tone shift, no element screams. Critical badges (`--critical-soft` background, `--critical-border` border) are present without alarm-flashing. Hierarchy survives. Structure survives. Nothing harsh.

### Signature Test — **PASS**, narrowly

Five specific places where intent appears:
1. **Forecast chart with click-to-sample-mentions** — `prototype.html:1543–1559`. Genuinely unique to this product. Bars are the calibration tool, not decoration.
2. **Summary sentence box that flashes on edit** — `prototype.html:1500–1503` + `summaryFlash` keyframe. "If the sentence reads wrong, the rule is wrong" is a real product idea expressed in a real component.
3. **820px detail-pane-with-editor** — `prototype.html:365`. The triggering evidence stays beside the editor. Few alerting tools do this.
4. **Severity left-bar (`.alert-bar`, `.rule-bar`, `.notif-row-bar`)** — listed as a possible anti-pattern, but here it carries semantic load (severity), not decoration. Earns its place.
5. **Warm neutral palette `#f7f7f5` / `#1c1c1a` + tinted shadows** — refuses pure-white, refuses pure-black. The product feels paper-toned, not screen-toned.

Pass — but #4 and #5 are quiet signatures, not loud ones.

### Token Test — **FAIL**

Read the tokens: `--bg`, `--bg-card`, `--bg-hover`, `--text-1`, `--text-2`, `--text-3`, `--critical`, `--important`, `--info`, `--accent`, `--destructive`, `--warn`, `--r-sm`, `--r`, `--r-lg`, `--shadow-sm`, `--shadow-lg`, `--t-fast`, `--t-base`, `--t-slow`, `--ease`.

**Sentence:** "This product is _generic_ because the tokens use words like _critical_, _accent_, _bg-card_."

These are the canonical Tailwind / shadcn / generic-design-system names. They could belong to a project-management tool, a logging tool, a healthcare app. Nothing in the token list says *brand monitoring*, *signal*, *triage*, *watch*, *fire*, *calibrate*. The tokens are functional but anonymous.

### AI Slop Test — **borderline FAIL**

Show this and say "an AI made this." Would they believe it?

**On the "designed" side:**
- Realistic Ukrainian persona content
- Linear-grade ease curves
- Forecast-chart calibration affordance
- Considered light/dark surface re-derivation
- Severity pattern is semantic, not decorative

**On the "AI default" side:**
- Inter typeface
- Tailwind blue accent
- Purple-blue gradient on user avatar (the canonical AI palette tell)
- Generic tokens
- Cards-with-soft-borders aesthetic
- Inline styles substituting for layout primitives
- 220px/240px/280px sidebar (every SaaS template)

A designer skimming this would say *"competent SaaS prototype, looks like every observability tool, what's the signature?"* That is what a default looks like.

---

## Priority Fixes

These are ordered by impact-to-effort, not difficulty.

### 1. Replace the user-avatar purple-blue gradient

`prototype.html:93` — `background:linear-gradient(135deg,#a78bfa,#7c3aed)`.

This is the single most visible AI-default in the product. The workspace avatar (gold/amber gradient at line 67) is fine because it's brand-tied. The user avatar should be a flat warm tone tied to the product palette — e.g., a flat `--text-1` background with `--bg-card` initials, or a desaturated derived tone. Five-minute fix, removes the most recognizable tell.

### 2. Rename tokens to product language

Add domain-specific tokens *alongside* the generic ones (don't remove yet, to avoid churn). Examples:

```css
--signal-critical: var(--critical);
--signal-important: var(--important);
--signal-info: var(--info);
--surface-watch: var(--bg-card);
--surface-triage: var(--bg);
--ink-primary: var(--text-1);
--ink-meta: var(--text-2);
--ink-quiet: var(--text-3);
--fire-rate-warn: var(--warn);
```

Use the new names in new code. The token test goes from "generic" to "this is a brand monitoring product." Ten-minute fix that compounds.

### 3. Pick a non-default typeface

Inter is the strongest tell after the purple gradient. The product positioning (PR specialist, brand monitoring, signal triage) suggests an editorial pairing, not a developer-generic sans. Candidates that read as decisions:
- **Söhne** — newsroom warmth, neutral but distinctive
- **Geist** / **Geist Mono** — current Vercel-ish but specific
- **Inter Tight** + **Inter Display** — same family but differentiated, lower cost
- A serif headline (e.g., **Editorial New**, **GT Sectra**) for `.list-title` and `.detail-title`, sans for body

The cheapest signature is *one* serif heading + Inter body. The most distinctive is full-stack non-Inter.

### 4. Replace `--accent: #2563eb` with a non-Tailwind blue

If the brand stays blue, shift hue and chroma so it isn't recognizable as `blue-600`. Options:
- A muted teal-blue like `#1e6b7a` (signal-tower)
- A warmer slate-blue like `#3b4a6b`
- An inverted approach: no chromatic accent at all — `--text-1` becomes the primary, blue used only for links and forecast bars

The accent appears in: primary buttons (dark mode), focus rings, forecast `active` bars, links, badge counts, `accent-soft` selection background. Changing it touches a few definitions, lots of surface area.

### 5. Define a real spacing scale

Replace magic-number padding with tokens:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
```

Then refactor — but in a *spike*, not a sweep. Replace one component (e.g., `.detail-pane` and its children) and see whether the result is more legible. If yes, propagate. If no, keep the case-by-case discipline and document the `padding:11px 16px 11px 14px` pattern as intentional.

### 6. Add focus-visible to all interactive elements

`.alert-row`, `.preset-card`, `.tab`, `.filter-pill`, `.cmdk-item`, `.notif-row` need a focus ring. The pattern from `.btn` (`outline:2px solid var(--accent); outline-offset:1px`) extends cleanly. Keyboard users currently navigate blind through the most-clicked elements in the product.

### 7. Strengthen rule editor field rhythm

In `.field` — vary `margin-bottom` to reflect importance. Suggestion:

| Field | Current | Proposed | Reason |
|---|---|---|---|
| Name | 18px | 24px | Identity, separates from rest |
| Topic | 18px | 18px | Setup, equal weight |
| Conditions | 18px | 24px | Primary configuration, deserves space |
| Threshold | 18px | 18px | Co-equal with Conditions |
| Severity | 18px | 12px | Tag-like, less weighty |
| Recipients | 18px | 12px | Mostly informational |
| Summary | 8px (mt) | 24px (mt) | The legibility check, deserves separation |

Tiny change, gives the form rhythm instead of monotone.

---

## What to preserve (do not refactor)

- `cubic-bezier(.32,.72,0,1)` ease — keep
- Warm neutral palette `#f7f7f5` / `#1c1c1a` — keep, this is the strongest craft signature
- Tinted shadows — keep
- Forecast chart click-to-sample interaction — keep, this is the product's idea
- Severity left-bar pattern — keep, it serves semantic load
- 820px split detail-pane-with-editor — keep, it expresses the product's calibration philosophy
- Tabular numerals — keep
- Realistic mock content (Ukrainian PR persona) — keep

---

## The Question

> "If they said this lacks craft, what would they point to?"

They would point to: **the user avatar's purple gradient, the Inter typeface, the Tailwind blue accent, and the `--accent` / `--bg-card` / `--text-1` token names.** Four small fixes — none of them structural — close 80% of the gap between *competent SaaS prototype* and *YouScan, specifically*.
