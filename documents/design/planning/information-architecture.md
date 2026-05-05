# Information architecture: YouScan alerting

## 1. Screen inventory

| ID | Screen | Section | Purpose | User state |
|----|--------|---------|---------|------------|
| S01 | Alerts inbox | Alerts > Inbox | Triage fired alerts across all topics | Returning |
| S01-E | Alerts inbox — empty state | Alerts > Inbox | No fired alerts yet; prompt to set up first rule | First-time |
| S02 | Alert detail | Alerts > Inbox | Review what fired, take action, optionally edit rule | Returning |
| S03 | Alert Rules list | Alerts > Alert Rules | View and manage all rules; review health indicators | Returning |
| S03-E | Alert Rules list — empty state | Alerts > Alert Rules | No rules yet; prompt to create first rule with preset picker | First-time |
| S04a | Preset selection | Alerts > Alert Rules | Choose starting configuration for a new rule | New rule only |
| S04b | Rule editor | Alerts > Alert Rules | Create or edit a rule with live forecast preview | All |

The rule editor (S04b) is one component used in two rendering contexts:
- **Full-page** — when creating or editing from Alert Rules list
- **Panel mode** — when editing from alert detail sidebar (same layout, narrower container)

---

## 2. Navigation structure

### 2.1 Primary navigation

```
YouScan
│
├── [Topics]
├── [Analytics]
├── ...
├── Alerts                ← new top-level item
└── [Settings, etc.]
```

### 2.2 Full hierarchy

```
YouScan
│
├── Notifications bell / feed       ← existing pattern; alerts feed into it as a channel
│   └── Fired alert card            ← taps/clicks navigate to alert detail in Alerts inbox
│
└── Alerts                          ← top-level nav item; peer to Topics
    │
    ├── Inbox (default sub-view)    (S01)
    │   └── Alert detail sidebar   (S02)  [slide-in panel; inbox stays visible]
    │       ├── Acknowledge / Dismiss / Mute  [inline actions]
    │       ├── Edit rule           [opens rule editor in panel mode → S04b]
    │       └── View source topic  [one click → topic view]
    │
    └── Alert Rules (second sub-view)  (S03)
        ├── [New rule button]
        │   └── Preset selection   (S04a)
        │       └── Rule editor    (S04b, full-page)
        └── [Per-rule row]
            ├── Edit               [opens S04b full-page, pre-populated]
            ├── Delete             [confirmation inline]
            └── View alerts        [one click → inbox filtered to this rule]
```

### 2.3 Navigation model

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Pattern | Sidebar (existing YouScan pattern) | B2B desktop SaaS; sidebar already established |
| Alerts placement | Top-level nav, peer to Topics | Fired alerts are time-sensitive; triage is not a settings task |
| Alert Rules placement | Sub-view of Alerts, not Settings | Rules are inseparable from triage; surfacing them together reduces context-switching |
| Alert detail | Sidebar panel | Keeps inbox visible; preserves triage context while reviewing a specific alert |
| Rule editor from alert detail | Panel mode (same component) | Keeps triggering evidence visible while adjusting the rule |
| Rule editor from Alert Rules | Full-page | No alert context to preserve; more room for forecast chart and condition fields |

---

## 3. User flows

### 3.1 Primary flow: first-time rule creation

```
Alert Rules (S03-E, empty)
  → "Create your first rule" CTA
  → Preset selection (S04a)
  → Rule editor, full-page (S04b)
  → Save
  → Alert Rules list (S03)
```

| Step | Screen | User action | System response |
|------|--------|------------|----------------|
| 1 | S03-E | Lands on empty Alert Rules | Shows empty state with 4 preset cards + Custom |
| 2 | S04a | Selects a preset | Opens rule editor pre-filled with preset defaults |
| 3 | S04b | Reviews/adjusts conditions | Forecast chart updates live |
| 4 | S04b | Reviews forecast, adjusts if warned | Warning shows if projected rate exceeds threshold |
| 5 | S04b | Saves | Returns to Alert Rules list with new rule shown |

### 3.2 Secondary flow: triage and edit

```
Notification bell
  → OR → Alerts inbox (S01)
  → Alert detail sidebar (S02)
  → Option A: Acknowledge / Dismiss / Mute  [done; inbox updates]
  → Option B: Edit rule
     → Rule editor panel mode (S04b)
     → Save
     → Panel closes; alert detail remains
```

| Step | Screen | User action | System response |
|------|--------|------------|----------------|
| 1 | S01 | Sees fired alert | Row shows severity chip, rule name, topic, time fired, per-row actions |
| 2 | S02 | Clicks row | Detail sidebar opens; shows what fired, matched conditions, example mentions |
| 3a | S02 | Acknowledges / Dismisses / Mutes | Status updates; undo toast for mute |
| 3b | S02 | Clicks "Edit rule" | Rule editor slides in as a panel; forecast already rendered |
| 4 | S04b | Adjusts conditions | Forecast updates |
| 5 | S04b | Saves | Panel closes; alert detail returns to read state |

### 3.3 Secondary flow: manage rules from Alert Rules list

```
Alerts > Alert Rules (S03)
  → Rule row → Edit
  → Rule editor, full-page (S04b, pre-populated)
  → Save
  → Back to Alert Rules (S03)
```

### 3.4 Navigation backbone: three required round-trips

Every alert → its source rule: one click from alert detail sidebar.
Every rule → the alerts it produced: one click from any rule row in Alert Rules list.
Every alert → its source topic: one click from alert detail sidebar.

These three round-trips are required navigation, not optional. They are the connective tissue between triage, rule management, and topic context.

### 3.5 Edge case flows

| Scenario | Screen | What is shown | User path |
|----------|--------|--------------|-----------|
| Inbox empty, no rules exist | S01-E | "No alerts yet. Create your first rule." | CTA → S03-E → preset picker |
| Inbox empty, rules exist | S01-E | "No new alerts." | No CTA needed; rules are running |
| Forecast renders too slowly | S04b | "Analyzing last 30 days…" loading state | Falls back to async: preview shown after save |
| Topic has no watchers | S04b | Warning in recipient section | "No watchers set on this topic — add recipients manually" |
| Mute from inbox row | S01 | Undo toast (5s window) | Tap undo restores alert to active; no confirmation dialog |
| Rule fires 0 times in 30 days | S03 | Health indicator surfaces it | Visual distinction; not deleted automatically |
| Edit rule from alert — no changes made | S04b panel | User closes panel | Panel closes; no save prompt |

---

## 4. Content hierarchy per key screen

### Alerts inbox (S01)

| Priority | Element | Purpose |
|----------|---------|---------|
| 1 | Severity chip | Immediate signal: critical / important / info |
| 2 | Rule name + topic | What this is and where it came from |
| 3 | Time fired | Recency — is this still actionable? |
| 4 | Per-row actions | Mute, dismiss — without opening detail |

Default sort: severity descending, then recency. Sort is optionally customizable per session.

Per-row actions: open detail (primary click target), mute, dismiss. Acknowledge is only available from the detail view, not from the row — it implies the user has read and understood the alert.

### Alert detail sidebar (S02)

| Priority | Element | Purpose |
|----------|---------|---------|
| 1 | Rule name + severity | What triggered this and how serious |
| 2 | Matched conditions | Why it fired — the reasoning |
| 3 | Example mentions | Evidence — the actual content |
| 4 | Primary actions: Acknowledge / Dismiss / Mute | What to do now |
| 5 | Time fired, recipients | Metadata |
| 6 | "Edit rule" entry point | Prominent secondary action |
| 7 | Source topic link | Tertiary — for context |

### Rule editor (S04b)

| Priority | Element | Purpose |
|----------|---------|---------|
| 1 | Forecast chart | Trust signal — see impact before saving |
| 2 | Conditions | What triggers the rule |
| 3 | Threshold + time window | How sensitive |
| 4 | Severity | How urgent |
| 5 | Recipients | Who gets notified (collapsed by default) |
| 6 | Save / Cancel | Commit or abandon |

### Alert Rules list (S03)

| Priority | Element | Purpose |
|----------|---------|---------|
| 1 | Rule name + topic | Identity |
| 2 | Fire count (7d / 30d) | Is this rule active? |
| 3 | Mute rate (30d) | Is this rule trustworthy? |
| 4 | Last fired | Recency signal |
| 5 | Edit / Delete / View alerts | Actions |

---

## 5. Platform considerations

Desktop-first. The forecast chart and multi-column alert detail layout require sufficient screen space for the core creation and triage flows.

Mobile: The Alerts inbox (S01) and alert detail sidebar (S02) should be usable on mobile — PR specialists check alerts off-hours. Rule creation (S04) is desktop-only in v1; the forecast chart does not adapt to small screens.

---

## 6. What is deliberately not in this IA

- No Settings > Notifications preferences page in v1. Channel rules are set at the rule level (severity determines channel). A separate preferences page would invite scope creep before the core flow has usage data.
- No saved views or filter persistence in the inbox. Filters are stateless and re-applied each session. Saved views are a v2 feature once usage patterns are known.
- No rule templates beyond three presets + Custom. A team-shared template library is v2.
- No topic-scoped alerts tab in v1. All triage happens in the global Alerts inbox. A per-topic alerts view is a natural v2 addition once cross-topic triage patterns are established.

---

## 7. Open question (design phase)

The rule editor in panel mode (from alert detail) renders in a narrower container than full-page. The forecast chart must be usable at reduced width. This should be prototyped and tested before committing to the panel interaction for edits — if the chart becomes unreadable at narrow widths, the fallback is navigating to full-page edit with the alert ID as context in the URL.

---

## IA validation checklist

- [x] Every MVP feature has a screen in the inventory
- [x] No navigation path exceeds 4 levels deep
- [x] Primary user flow reaches core value in 5 steps or fewer
- [x] Three required round-trips explicitly documented
- [x] Empty states, edge cases, and error states accounted for
- [x] What is deliberately out of scope is stated

---

## Evolution log

| Version | Date | Changes | Trigger |
|---------|------|---------|---------|
| v1 | 2026-05-05 | Initial IA based on MVP requirements and design review | MVP scope + nav decisions |
