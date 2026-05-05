# Design references and intent: YouScan alerting

## Design intent

**Who is this human?**
A PR specialist at 9pm. Their phone just buzzed. They're not at a desk, they're not in flow, they're interrupted. They open the product in a state of mild dread: probably nothing, but what if it's something? Every time they open this, that question is in the room.

**What must they accomplish?**
Judge whether an alert is real in under 15 seconds. Act or dismiss. If wrong — edit the rule in under 30 seconds and move on.

**What should this feel like?**
Cold and precise, but not hostile. The closest analogy is a well-calibrated instrument: no decoration, no ceremony, every element earns its place by doing a specific job. The surface should answer "is this credible at 9pm during a crisis?" before any other question.

---

## Domain exploration

**Domain vocabulary**
Signal / noise ratio. Mention stream. Sentiment drift. Alert triage. Crisis velocity. Brand surface area. Author tier. Anomaly spike. Mute rate. Watch cadence. Threshold. Severity tier. Rule health. Forecast window.

**Color world**
If this product were a physical space, it would be a security operations center at 2am: banks of screens in a dark room, one amber warning light glowing softly, a single red indicator for the thing that actually needs attention. The dominant surfaces are gray and white — neutral, non-distracting. Color appears only where something requires a decision.

Natural palette from this domain:
- Near-white: the default surface. Paper white, not snow white.
- Ink gray: primary text. Close to black but with slight warmth — readable at length.
- Saturated red: the crisis signal. One red thing in the room. Everything else steps back.
- Amber: the warning. Warm, visible, not alarming.
- Calm blue: information. Present but deferential.
- Accent blue: the action. Confident, not aggressive.

**Signature element**
The inline rule summary sentence at the bottom of the rule editor. A single sentence in plain English that restates what the rule does: "This rule fires when negative mentions of your brand exceed 5 per hour on Twitter." Updates as the user edits conditions. If the sentence reads wrong, the rule is configured wrong. No other alerting product in the space has this — it's the visible credibility mechanism.

**Named defaults to avoid**
1. The gradient primary button — every B2B SaaS template default, carries no meaning here
2. The red warning banner — overused to the point of blindness; use the side-edge indicator instead
3. Rounded illustrations on empty states — signals "fun product," undermines analytical credibility

---

## Product type and context

Web application, desktop-first. B2B SaaS, brand monitoring / crisis alerting category. Users are professionals working in a paid, team context. Mobile must support inbox triage but is secondary to desktop.

---

## Key screens with visual direction

### Alerts inbox
Dense by design. A user with 50 alerts should not have to scroll past padding to triage. Rows are compact: severity indicator on the left edge (4–6px color bar, full row height), rule name, topic, time. Per-row action icons (mute, dismiss) appear on hover, sized for accuracy not for decoration.

Reference: Linear's issue list — the information hierarchy and hover-to-reveal actions. From Stripe: the discipline of "the table row is the UI."

### Alert detail sidebar
Single viewport. No tabs, no accordions, no "show more." The triggering condition is a sentence at the top ("5 negative mentions in 1 hour exceeded your threshold of 3"). Sample mentions are full cards — the user needs to read the actual content to judge the alert, not a truncated snippet. Primary actions (acknowledge, dismiss, mute) sit clearly at the bottom of the severity + metadata block. "Edit rule" is secondary but prominent.

Reference: Stripe's payment detail panel — clean hierarchy, nothing buried, related data visible without clicking.

### Rule editor (full-page)
Two-column layout: form on the left, forecast chart on the right. The chart is always visible as conditions are edited — the user is calibrating, not filling out a form. Form fields read as sentence fragments ("sentiment is [negative ▾]", "author tier is [medium or higher ▾]") — inline editing, no modals. The inline rule summary sentence anchors the bottom of the form column.

Reference: Mixpanel's query builder for the condition-as-sentence pattern. Datadog's monitor creation for the forecast-alongside-form layout.

### Rule editor (panel mode, from alert detail)
Same component, narrower container. The forecast chart stacks below the conditions rather than side-by-side. The inline summary is visible. Alert detail remains visible to the left — the triggering evidence is the reason for the edit.

### Alert Rules list
Table view. Columns: rule name, topic, fire count (7d), fire count (30d), mute rate (30d), last fired, actions. Numbers are tabular figures — columns scan as columns, not as decorative text. Rules with high mute rates are visually distinguished (desaturated, slightly lower contrast — readable but surfaced).

Reference: Linear's project health view — status indicators per row, no visual noise, health surfaced at a glance.

---

## Reference apps: what to take from each

### Linear
- Information hierarchy in list views: clear without chrome
- Hover-state action reveal (mute, dismiss icons) — keeps rows uncluttered at rest
- Status indicators as left-edge chips — the eye learns the pattern fast
- Dark mode as a fully considered surface, not an afterthought
- **Not to replicate:** Linear's purple brand accent; the slightly playful empty states

### Stripe
- Data table discipline: every column earns its width, every row is scannable
- Panel detail views: related information visible without navigating away
- Badge + status chip encoding: small, consistent, meaningful
- Typography hierarchy that works at data density
- **Not to replicate:** Stripe's marketing-site warmth; the conversational onboarding tone (wrong register for triage)

### Mixpanel
- Chart integration within forms/editors — not chart-as-hero, chart-as-tool
- Condition-building UI that reads as structured language, not as a form
- Color as signal in analytics surfaces: used precisely, not liberally
- **Not to replicate:** Mixpanel's chart emphasis (forecasts here are secondary to the alert evidence, not the centerpiece); the dense chart-first dashboard layout

---

## WHY checkpoint

| Element | Decision | Why |
|---------|----------|-----|
| Palette | Near-white surface, ink gray text, three severity colors (red / amber / blue-gray), one accent blue | Color communicates state or action — decorative color doesn't exist. The severity palette must be legible in peripheral vision and in dim light. |
| Depth | Borders over shadows on data surfaces; subtle elevation only for panels over content | Shadows on data tables read as decorative. Borders are crisper, faster to process. Panel elevation (alert detail over inbox) needs enough lift to feel distinct, not floating. |
| Surfaces | Light mode default; dark mode available | Light reads as more credible for analytical work. Dark exists because triage happens at 11pm and the choice should be the user's. |
| Typography | Inter, 3–4 sizes, weight-based hierarchy | Proven legibility at data density. Tabular figures for all numeric columns — non-negotiable for scanning counts and rates. No color or decoration in hierarchy — weight and size only. |
| Spacing | Generous in the rule editor; dense in the inbox and rules list | Density is earned where the user is doing real work (triage, scanning). The editor needs room because the user is configuring something they'll live with. |
| Motion | Under 200ms on forecast updates, precise easing; minimal on navigation | The chart updating must feel responsive to input — it's part of the calibration loop. Page transitions should not feel like route changes. |
| Forecast chart | Bar chart, clean baseline, no gradients or soft shadows, subtle grid lines | Matches the register: data manipulation, not visualization showcase. The chart is a trust tool, not a marketing asset. |
| Severity indicators | Left-edge color bar (4–6px, full row height) everywhere severity appears | Consistent encoding trains the eye in two encounters. Never a row background — that would compete with content. Never a banner — that would trigger alarm-blindness. |

---

## Overall visual direction

Quiet surfaces, precise color, type doing the heavy lifting. The product should feel like the instrument a surgeon would design for themselves: nothing unnecessary, nothing ambiguous, everything in service of the decision at hand. Linear's structural clarity, Stripe's data discipline, Mixpanel's analytical component palette — but tighter than any of them because the surface area is smaller and the stakes of each signal are higher.

---

## Anti-patterns to explicitly avoid

- Gradient buttons or headers
- Red warning banners (use the left-edge indicator; reserve full-width red for genuine emergencies only)
- Rounded illustrations, mascots, or celebratory empty states
- Color as decoration (every color must carry a specific meaning)
- Monospace-everywhere terminal aesthetic (the Bloomberg failure mode)
- "✨" or conversational microcopy ("You're all set!", "Nice work!") — wrong register entirely
- Chart-as-hero layout where the visualization dominates over the alert evidence
- Soft shadows on table rows or list items
