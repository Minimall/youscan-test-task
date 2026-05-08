# Prototype notes: YouScan alerting

## What this file is

A companion to `index.html` (previously `prototype.html`) — covers how to use it, what interactions exist, and which design decisions are embedded in the code. Read alongside the design documents in `documents/design/`.

---

## How to open

Open `index.html` directly in a browser. No build step, no server required. It works from `file://`. Google Fonts loads over network; if offline, Inter falls back to system sans-serif gracefully.

**Recommended:** Chrome or Safari. Firefox works but CSS `backdrop-filter` blurs may not render on some configurations.

---

## Navigation

The sidebar is the only navigation. It mirrors what a real YouScan product nav would look like. There is no prototype meta-nav — you are always inside the product.

| Sidebar item | What it opens |
|---|---|
| Inbox (under Alerts) | Alerts inbox — triage view |
| Alert Rules (under Alerts) | Rules list — manage and create rules |
| Topics, Analytics, Mentions, etc. | Placeholder views (not in scope for this feature) |

Clicking the bell icon (top right) opens the notification center as a slide-in panel.

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `⌘K` or `/` | Open command palette |
| `G` then `I` | Go to Inbox |
| `G` then `R` | Go to Alert Rules |
| `D` | Toggle debug/demo panel |
| `ESC` | Close command palette, notification center, or debug panel |

---

## Core flows to exercise

### 1. Triage an alert

1. Navigate to **Inbox**
2. Click any alert row — the detail pane slides in from the right
3. Read the triggered conditions banner and example mentions
4. Take an action: Acknowledge, Dismiss, or Mute
5. Mute shows an undo toast with an 8-second countdown bar

### 2. Edit a rule from an alert

1. Open any alert detail (step 1–2 above)
2. Click **Edit rule** in the detail pane footer
3. The detail pane widens to 820px and the rule editor slides in alongside it — the triggering evidence stays visible on the left
4. Edit any field (name, sentiment, platform, threshold, severity)
5. Watch the **summary sentence** update at the bottom of the form
6. Watch the **forecast chart** update (debounced 200ms after last keystroke)
7. Click a forecast bar to see sample mentions for that day
8. Save — editor closes, detail pane returns to read state

### 3. Create a rule from scratch

1. Navigate to **Alert Rules**
2. Click **New rule**
3. Choose a preset (PR Specialist, SMM, Brand Manager, or Custom)
4. Adjust conditions — the forecast reflects the current configuration
5. Observe the warning state if the projected daily fire rate is high
6. Save — returns to rules list with the new rule visible

### 4. Command palette

1. Press `⌘K` or `/`
2. Type a rule name, topic, or alert keyword
3. Use arrow keys to navigate results, Enter to jump

---

## Debug / demo panel

Open with `D` key or the floating **Demo controls** button (bottom-right corner).

The panel has six sections:

### Trigger events
Inject synthetic alerts into the running state:

| Button | What it does |
|---|---|
| Critical alert | Adds a new critical-severity alert, shows a notification |
| Important alert | Adds an important-severity alert |
| Info alert | Adds a low-priority info alert |
| Toast — warning | Shows a sample warning toast |
| Toast — success | Shows a sample success toast |

### Scenarios
Pre-scripted product states for demo walkthroughs:

| Scenario | What it sets up |
|---|---|
| Crisis active | Injects 3 critical alerts, activates crisis-mode visual filter on the app shell |
| Calm baseline | Resets to a healthy single-alert state |
| Empty inbox | Clears all alerts — shows the empty state |

### Quick jumps
Navigate to specific states without clicking through the UI:

| Jump | Destination |
|---|---|
| Inbox | Alerts inbox |
| Alert Rules | Rules list |
| Edit from alert | Opens alert #1 detail with the rule editor pre-loaded alongside |
| Rule with warning | Opens a rule editor pre-configured to trigger the high-fire-rate warning |

### View toggles
- **Dark mode** — toggles `:root.dark` class; persists across navigation

### State readout
Live display of `state.route`, alert count by severity, unread notification count. Updates on every action.

### Reset
Returns mock data to its initial state (undoes any mutes, dismissals, or rule edits made during the session).

---

## Mock data

The prototype ships with:

- **12 alerts** across 3 severities and 4 topics, with realistic timestamps spanning the past 7 days
- **8 rules** covering brand monitoring, sentiment spikes, crisis keywords, and influencer mentions
- **4 topics**: Kvitneva Cosmetics (primary brand), Competitor tracking, Industry trends, Leadership
- **10 authors** with platform, tier (high/medium/low), and follower counts
- **8 mention templates** used to generate realistic example content in alert detail cards

Mutes, dismissals, and rule saves are written to the in-memory state object and survive navigation within the session. They reset on page reload (or via the Reset button in the debug panel).

---

## Design decisions embedded in the code

### Severity left-edge bar
Every alert row has a 4px left border in the severity color (critical red / important amber / info gray-blue). This is the only place row color appears — the row background stays neutral. This trains peripheral vision without causing alarm-blindness. Implemented as `.sev-bar` in CSS, not as a row background.

### Summary sentence
The rule editor shows a plain-English sentence below the form: "This rule fires when negative mentions of [brand] exceed [N] per hour on [platform]." It updates as the user types, with a brief flash animation on change. The sentence is generated by `ruleSummary()` from the draft state — if the sentence reads wrong, the rule is configured wrong. No other field replaces this as the config legibility check.

### Forecast chart as calibration tool
The bar chart in the rule editor shows how many times the current configuration would have fired per day over the last 30 days. It updates live (debounced 200ms). Bars are clickable — they show sample mentions for that day's volume. The chart is not decorative; it is the mechanism for calibrating threshold before a rule goes live. The warning state (amber banner) fires when projected daily rate exceeds 8 fires/day.

### Acknowledge from detail only
Mute and Dismiss are available from the inbox row (hover actions) and from the detail pane. Acknowledge is only available from the detail pane. This is intentional: acknowledging implies the user has read and understood the alert, not just seen it in a list.

### Undo toast, not confirmation dialog
Destructive per-alert actions (mute, dismiss) use an 8-second undo toast instead of a confirmation dialog. This follows Linear's pattern: confirmation dialogs interrupt flow; undo restores it. The toast includes a progress bar so the user knows exactly how long the undo window is open.

### Edit-panel width expansion
When Edit rule is triggered from the detail pane, the pane expands to 820px (from 480px default) via the `.with-editor` class. This gives ~380px for alert context and 440px for the editor. The triggering evidence stays visible — the user calibrates the rule against the thing that caused them to edit it. At viewport widths below 1300px, the editor stacks below the detail content instead of side-by-side.

### Focus preservation on live updates
When the user is typing in a rule form field, `refreshSummaryAndForecast()` updates the summary text in-place and rebuilds only the chart container (not the form). This means input focus, cursor position, and field values are never disrupted by live updates. The form and the chart are separate DOM regions.

### Crisis mode
When multiple critical alerts are injected simultaneously (via the Scenarios panel), the app shell applies `filter: brightness(.92) contrast(1.04)` — a subtle visual cue that the ambient state of the product has shifted. No full-screen overlay, no modal. The inbox content is the actual signal.

---

## What is not in the prototype

Per the MVP scope (see `planning/mvp-requirements.md`):

- No multi-condition AND/OR nesting (flat condition list only)
- No AI-suggested rules
- No Slack/Teams/SMS delivery
- No bulk actions in inbox
- No saved filter views
- No cross-topic alerts
- Mobile triage is responsive (inbox and detail) but rule creation is desktop-only
