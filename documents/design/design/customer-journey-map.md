# Customer journey map: Kateryna (PR specialist)

## Overview

**Feature:** YouScan alerting — first week experience
**User:** Kateryna, PR Specialist / Crisis-watcher (primary archetype)
**Trigger:** Onboards to the new alerting feature; creates first rule
**Desired end state:** Trusts alerts enough to act without a verification step; becomes the team's early warning system

---

## Journey map

| # | Moment | Type | Delight | Description |
|---|--------|------|---------|-------------|
| 1 | Opens Alert Rules for the first time, sees preset cards | Transition | Medium | She sees "PR specialist" and recognizes it immediately. Not overwhelming. Cautious — she's been burned by alerting tools before. |
| 2 | Adjusts conditions, watches forecast chart update in real time | **Peak** | High | "This rule would have fired 4 times in the last 30 days." She recognizes 3 events she knows about. Saves with confidence — first time she knows what she's getting into before the rule goes live. |
| 3 | First alert fires; notification appears | Transition | Medium-low | Old reflex kicks in: probably nothing. Past experience has trained her to assume noise first. |
| 4 | Opens alert detail; sees matched conditions and example mentions | Jump | Medium-high | A verified journalist, 3 aligned mentions, conditions she set. The doubt clears in ~10 seconds. "I can see exactly why this fired." |
| 5 | A rule fires that shouldn't have — false alarm | Drop | Low | Trust dips. Same feeling as before. But a next step is visibly available. |
| 6 | Edits the rule from the detail panel in ~30 seconds | Jump | Medium-high | Adjusts threshold while the triggering evidence is still on screen. Forecast updates. Saves. "I fixed it and I understand why it happened." |
| 7 | Real crisis fires — she acts without a verification step for the first time | **Peak** | High | Trusts the alert enough to escalate immediately. Catches something before anyone asks. Identity shift complete: early warning system, not noise manager. |

---

## Emotional arc

Starts at medium (curious but guarded). Spikes at the forecast preview (first time a rule feels knowable before it goes live). Dips at the first notification (old reflex — noise assumption). Recovers fast when the alert detail makes the signal legible. Drops on the false alarm. Recovers again quickly with the slide-in edit. Ends on the highest point — confident action on a real crisis.

The arc's shape is intentional: the design earns trust at moment 2 (before any alert fires), which raises the floor at moments 3–5. Without the forecast, the journey would flatline at medium-low until moment 7 — if it ever arrives.

---

## Improvement opportunities

### Elevate the Peak (moment 7)
The fast confident response is the identity payoff but it happens silently. Surface it: show response time on the rule's health indicators ("You responded in 4 minutes"). Small acknowledgment, but it reinforces the new identity in a visible way.

### Fill the Biggest Pit (moment 5)
The false alarm is unavoidable. Its depth is controlled by two things already in the design: the forecast warning that should have caught a too-loose threshold pre-save, and the slide-in edit panel that closes the recovery loop in ~30 seconds. The pit's duration is the real problem — in the old experience it was open-ended. Here it has a defined exit.

### Mark the Transition (moment 2)
The forecast preview is already doing this work. Reinforce with a post-save confirmation: "Rule is active — watching for [conditions] on [topic]." Makes the milestone feel earned, not just completed.

### Reorder steps (already applied)
The forecast delivers the reward (confidence) before asking for the commitment (save). This is Hyperbolic Discounting applied directly — a smaller immediate reward ("I know what this rule will do") over a larger deferred one ("I'll find out when it fires"). Already baked into the design; named here for reference.

---

## "In Real Life" test

If this were a person, it would be an experienced analyst at a desk who hands you a printed report before you commit to anything — shows you the evidence, explains why it flagged something, and lets you correct them face to face when they're wrong. That's the interaction this design is trying to replicate. It would feel professional and respectful of your time.
