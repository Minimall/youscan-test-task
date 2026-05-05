# Business plan: YouScan alerting

## Framing

This is a feature inside an existing product, not a standalone business. The relevant questions are positioning, value capture, and prioritization — not market sizing.

---

## Strategic role in the YouScan portfolio

Alerts are the bridge between passive monitoring (topics + analytics, where the user comes to the product) and active workflow (the user being served by the product).

Strong alerting:
- Increases daily active usage
- Justifies seat expansion (alerts are per-recipient)
- Is the most-cited feature in churn conversations across the social listening category

Weak alerting is a silent churn driver. Users don't complain; they stop logging in.

---

## Positioning vs. competitors

Most competitors lean on the model to decide what's important and offer users limited recourse when it gets things wrong.

The wedge: user-controlled calibration.
- Role presets as defaults
- Pre-save forecast as a trust signal
- Fast edit-from-alert as a recovery loop

Two of the three patterns are largely missing in social listening (pre-save preview is rare; edit-from-alert as the primary entry point is not standard). The short version of the pitch: Datadog-style trust controls applied to social listening.

---

## Value capture

**v1:** No standalone monetization. The feature lifts retention and seat expansion on existing plans.

**v2 upsell hooks (natural enterprise tier features):**
- Multi-channel delivery (Slack / Teams / SMS)
- Escalation policies
- Webhooks
- Custom severity formulas
- Cross-topic deduplication

---

## Build vs. defer

All v1 capability is buildable on top of existing topic infrastructure — mention stream, filters, watcher roles. The forecast preview is the only non-trivial backend dependency: it requires running a candidate rule against recent topic history fast enough to feel live.

**Fallback if preview is too expensive at scale:** async preview ("we'll show you what this rule caught in the last 24h") rather than cutting the feature entirely.

---

## Risks to the business case

**Forecast performance on high-volume topics (headline risk)**
If the preview can't render in a few seconds, the trust mechanism collapses. The feature's core value proposition depends on it feeling immediate.

**Preset misfit for the "manual" user segment**
If presets feel constraining rather than helpful, the feature reads as opinionated rather than thoughtful. Addressed in v1 by making the manual path first-class, not a fallback.

---

## Success definition (business-side)

- Higher 30-day retention on accounts with at least one active alert rule vs. those without (directional signal already exists; widen the gap)
- Reduced alert-related support tickets
- Fewer "we turned off all alerts" moments in customer success calls
- Seat expansion correlated with alert recipient additions
