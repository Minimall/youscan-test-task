# MVP requirements: YouScan alerting

## Scope rationale

The hardest interaction problem in the brief is "stay aware without being overwhelmed." The lever for that is trust calibration around individual rules. That makes two moments the anchors: the rule-creation forecast (building trust before a rule goes live) and the alert-to-edit recovery loop (restoring trust after a rule misfires). Everything else — channels, escalation, dedup — is additive and should wait for v1 data.

---

## In scope: v1

### Rule creation flow

**What it is:** A guided flow for creating an alert rule, starting with a preset choice.

**Preset options:** PR specialist / SMM / Brand Manager / Custom. Each preset opens a form pre-filled with sensible defaults for that role. Preset choice is a starting configuration, not a constraint — all fields are editable.

**Editable fields:**
- Topic (defaults to current topic)
- Conditions: keyword, platform, sentiment, language, location, author tier (drawn from existing topic filter primitives)
- Threshold: volume in a time window
- Time window
- Severity: info / important / critical

**Recipients:** Default to the topic's existing watchers/owners. A toggle reveals an override UI. The default is intentionally hidden to test Hypothesis #4 — override rate is instrumented from day one.

**Notification channel:** In-product notification always on. Email opt-in, with one exception: critical severity forces email on in v1 (no opt-out).

**Acceptance criteria:**
- User can create a rule in under 3 minutes starting from a preset
- Custom path is surfaced at the same level as the three presets, not nested behind them
- All conditions map to existing topic filter primitives (no new ML required)
- Recipients show current topic watcher count before the user expands the override

---

### Live forecast preview

**What it is:** A bar chart showing how many times the current rule configuration would have fired per day over the last 30 days, with sample mentions accessible on click. Updates as the user edits any field.

**Warning state:** When projected daily fire rate exceeds a threshold, a warning appears: "This configuration would fire ~[N] times a day based on the last 30 days. Consider narrowing the filter."

**Why it's in v1:** This is the load-bearing trust mechanism. Hypothesis #3 lives here: does seeing this forecast before saving measurably reduce 7-day mute rate? Cutting it removes the primary differentiator and the primary testable hypothesis.

**Fallback if latency is a problem:** Async preview shown after save — "here's what this rule caught in the last 24h." The feature still earns its place; it shifts position in the flow.

**Acceptance criteria:**
- Chart renders within 3 seconds for standard topics; falls back to async mode if not
- Sample mentions on click show the actual mention text, source, and matched condition
- Warning fires at a threshold TBD with engineering (starting point: >50 fires/day projected)
- Every rule edit triggers a chart update (debounced)

---

### Alert detail screen

**What it is:** A sidebar panel that opens when a user clicks a row in the alerts inbox. The inbox stays visible behind it.

**Contents:**
- Which rule triggered it
- Which conditions matched
- Example mentions (the actual content)
- Severity
- Time fired
- Recipients

**Primary actions:** Acknowledge / Dismiss / Mute

**Secondary entry point:** "Edit rule" — shown prominently, not buried. This is the primary entry point for Hypothesis #2 (most rule edits come from this screen, not the settings page).

**Navigation:** Alert detail includes a one-click link to the source rule (in Alert Rules list) and a one-click link to the source topic.

**Acceptance criteria:**
- "Edit rule" opens the rule editor in panel mode alongside the alert detail, pre-populated with current settings, with forecast already rendered
- Muting from the detail view shows an undo toast (5s window), same as inline mute
- The matching conditions are visually highlighted in the example mentions
- Source rule and source topic links are present and functional

---

### Alerts inbox

**What it is:** A list of all fired alerts across the user's topics.

**Filters:** Status (new / acknowledged / dismissed), mute state, severity, topic.

**Sort:** Severity descending, then recency (default). Sort is optionally customizable per session.

**Per-row actions:** Open detail (primary click target), mute, dismiss. Acknowledge is only available from the alert detail — it implies the user has read and understood the alert, not just seen the row.

**No bulk actions in v1** — single-item interaction only.

**Acceptance criteria:**
- Default view shows new/unacknowledged alerts, sorted severity-first then recency
- Mute with undo toast: undo window is 5 seconds
- Filter state is stateless — not persisted between sessions (saved views are v2)

---

### Alert Rules list

**What it is:** A sub-view of the global Alerts area (Alerts > Alert Rules). Shows all rules the user owns or watches, cross-topic. This is the primary entry point for creating new rules and auditing rule health.

**Per-rule health indicators:**
- Fire count: last 7 days / last 30 days
- Mute rate: last 30 days
- Last fired timestamp

**Actions per rule:** Edit / Delete / View alerts (one click → inbox filtered to this rule).

**Acceptance criteria:**
- Health indicators calculated server-side, not client-side
- Mute rate shown as a percentage, not a raw count
- Rules with zero fires in 30 days are visually distinguished (not deleted — just surfaced)
- "View alerts" link from each rule row navigates to inbox pre-filtered to that rule

---

### Instrumentation

Events required for every post-launch hypothesis test:

| Event | Key attributes |
|-------|---------------|
| `alert_rule_created` | preset_used, condition_count, severity, topic_id, recipients_overridden |
| `alert_rule_edited` | source (alert_detail / settings / rules_list), fields_changed |
| `alert_rule_deleted` | source |
| `alert_muted` | source, time_since_fire |
| `alert_unmuted` | time_since_mute |
| `alert_acknowledged` | time_since_fire |
| `alert_dismissed` | time_since_fire |
| `preview_rendered` | rule_id, projected_daily_rate, time_to_render |
| `preview_caused_edit` | fields_changed_after_preview |

---

## Out of scope: v1 (explicit deferrals)

| Feature | Reason for deferral |
|---------|---------------------|
| Multi-condition composition with AND/OR nesting | v1 form supports flat condition list; nesting adds form complexity before we know if flat is insufficient |
| AI-suggested rules | Explicitly excluded by brief |
| Custom severity formulas | Over-engineered for v1; 3-tier scale covers the space |
| Auto-escalation for unacknowledged alerts | Needs escalation policy model not in scope |
| Per-user notification overrides on a shared rule | Adds recipient model complexity; assess after v1 override rate data |
| Slack / Teams / SMS delivery | v2 upsell; email covers the critical-severity case |
| Overnight digests | Brand Manager use case; address in v2 once role data is available |
| Webhooks | Enterprise / developer tier feature |
| Do-not-disturb windows | Valuable but not anchor behavior |
| Bulk actions in inbox | No evidence of volume that requires it yet |
| Saved views and advanced filters | Defer until inbox usage patterns are known |
| Smart grouping / deduplication | Complex ML dependency; excluded by brief |
| Cross-topic alerts | Significant architecture change; v2+ |
| Rule performance dashboard | The rules list health indicators cover the need for v1 |
| Import / export of rules | Power user feature; no evidence of demand yet |
| Team-shared preset library | Interesting but not a trust-calibration feature |

---

## Known risks

**Forecast latency at scale**
High-volume topics may not render the preview fast enough to feel live. Fallback to async (post-save) preview mitigates but does not eliminate the risk. Needs early engineering spike before UI design is finalized.

**Recipient default hiding**
Defaulting to topic watchers and hiding the list is intentional and instrumented, but teams with non-standard watcher setups may be confused. The toggle to override must be immediately visible, and override rate is a week-1 metric.

**Custom path visibility**
If "Custom" reads as an advanced/expert path, the unstructured user archetype gets a worse experience than the named presets. Must be positioned as an equally valid entry point, not an escape hatch.
