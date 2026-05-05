# Target audience: YouScan alerting

## Primary archetype: Kateryna — Crisis-watcher (PR Specialist)

The PR specialist is the highest-stakes user in the alerting system. They are accountable when something is missed and pay a credibility cost when they act on something that turns out to be noise. Design decisions should be pressure-tested against this archetype first.

| Field | Content |
|-------|---------|
| Name | Kateryna |
| Role | PR Specialist / PR Manager |
| Experience | 4–6 years, mid to senior |
| Context | In-house at a mid-to-large brand, or agency managing 2–4 client accounts. Paid seat, works in a team. |
| One-line | A PR professional accountable for catching brand crises before they escalate — and personally responsible when one is missed. |

### Behaviors

- Opens YouScan multiple times a day, especially during campaigns or public events
- Keeps monitoring tools open alongside email and comms — treats the mention stream as ambient background signal
- Adds a verification step before escalating after past false alarms made her cautious (checks source, context, reach)
- Checks mobile notifications off-hours for critical alerts
- Doesn't act on a single data point — combines alert signal with experience-based pattern recognition

### Pain points

1. False positives led to unnecessary escalation — she's "cried wolf" to stakeholders and lost credibility for it
2. Each new alert is suspected before it's trusted — a string of false alarms erodes confidence in the next real one *(domain assumption)*
3. No explanation for why an alert fired — the system signals but doesn't reason
4. No way to preview what a rule catches before going live with it
5. Off-hours pings that turn out to be nothing erode her willingness to stay on-call

### Goals

- Respond to real crises in minutes, without a verification step eating the response window
- Stop escalating on false alarms — protect her credibility with management and clients
- Trust the first alert enough to act without double-checking

### Behavior map *(assumed from domain and competitor research)*

- **Hope:** "If I could trust the first alert, I'd catch things 20 minutes earlier and stop carrying the background anxiety of wondering whether I missed something."
- **Pain:** "Every alert asks the same question and I can never answer it without digging in first."
- **Barrier:** "Last time I tuned my rules, I ended up with either more noise or missed a spike I should have caught. There's no in-between."

---

## Secondary archetypes

### Social Media Manager — Opportunity-rider

Reacts in hours. Watches for emerging positive/neutral trends, high-reach posts, influential commenters where the brand is favorably mentioned. Tolerates some false positives but fatigues quickly — too many "opportunities" become indistinguishable from spam.

- Default sensitivity: medium
- Default channels: in-product + business-hours email
- Key tension: sensitivity setting that works during normal periods becomes overwhelming during campaigns

### Brand Manager — Trend-watcher

Reacts in days or weeks. Cares about sentiment shifts week-over-week, new themes entering brand conversations, statistically meaningful changes. Does not want real-time pings.

- Default sensitivity: low, with statistical floor
- Default channels: overnight digest, weekly summary
- Key tension: receives operational alerts designed for the monitoring team, not synthesized signals designed for positioning decisions

### Unstructured user — Power configurator

Behavior-defined, not role-defined. Could be an in-house analyst, agency researcher, or any technically capable user who actively works with raw data and custom filters. Treats presets as starting points to override, not constraints to follow.

- Wants full control over alert logic
- Comfortable with configuration depth — extra fields are control, not tax
- Needs alerts that mirror the custom filters they already use in their topics

---

## Secondary audience: topic owners and watchers

Already exist as roles in YouScan's topic model. Alert recipients should default to these existing roles rather than requiring configuration from scratch.

---

## Cross-cutting context

All four archetypes are B2B SaaS users on paid seats, working in teams, accustomed to monitoring tools. Not a consumer audience — tolerance for some configuration depth exists, but every extra field is a tax (except for the unstructured user, who sees depth as capability).

---

## Evidence notes

- Three primary archetypes confirmed by user research
- PR specialist as highest-stakes archetype: cost asymmetry (missed crisis vs. false alarm) is role-dependent — confirmed
- Behavioral details for PR specialist (verification step, credibility cost of false alarms): domain-informed assumption, not validated on YouScan users specifically
- SMM fatigue behavior, Brand Manager specific frustrations, action trigger: test task assumptions — not validated
