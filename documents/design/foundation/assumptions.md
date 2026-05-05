# Assumptions and hypotheses: YouScan alerting

This is a living document. Update it after every research round, prototype test, or significant product decision.

---

## User assumptions

| ID | Assumption | Risk | Status | Evidence |
|----|-----------|------|--------|----------|
| U1 | PR specialists face the highest cost asymmetry — missing a crisis and acting on a false alarm both carry serious consequences | High | Confirmed | User research |
| U2 | Three archetypes (PR, SMM, Brand Manager) have incompatible sensitivity defaults that one global setting cannot satisfy | High | Confirmed | User research |
| U3 | Trust degradation manifests as slowed response, which eventually becomes non-use | High | Unvalidated | Domain/competitor research |
| U4 | False-positive escalations damage the PR specialist's credibility with stakeholders | Medium | Unvalidated | Domain research |
| U5 | Users can reliably self-identify their archetype and select the matching preset | Medium | Confirmed | Roles are functionally distinct |
| U6 | SMM users reduce engagement with alerts when volume spikes beyond a personal threshold | Medium | Unvalidated | Test task assumption |
| U7 | Brand Managers receive operational alerts not designed for them | Medium | Unvalidated | Test task assumption |
| U8 | A segment of users has disabled alerting features entirely due to fatigue | High | Unvalidated | Test task assumption |
| U9 | Users who mute then unmute may be doing it as deliberate triage, not because the rule is broken | Medium | Unvalidated | Product observation |

---

## Product assumptions

| ID | Assumption | Risk | Status | Evidence |
|----|-----------|------|--------|----------|
| P1 | Role-based presets will match each archetype's noise tolerance well enough to be a useful starting point | High | Unvalidated | Needs usability testing |
| P2 | Most rule edits will originate from an alert detail view, not from a settings page — users only learn whether a rule is good after it fires | High | Unvalidated | H2 — needs behavioral validation |
| P3 | A pre-save forecast ("this rule would have fired N times in the last 30 days") measurably reduces 7-day mute rate because users self-correct before the rule goes live | High | Unvalidated | H3 — needs concept/prototype test |
| P4 | Showing why an alert fired reduces the verification step overhead for PR specialists | Medium | Unvalidated | Needs concept validation |
| P5 | Users don't want to choose recipients manually for most rules; defaulting to the topic's existing watchers/owners covers the common case | Medium | Unvalidated | H4 — consistent with YouScan's existing role model |
| P6 | Role-based presets plus a "manual" path for the unstructured user covers all primary use cases in v1 | Medium | Unvalidated | H5 — needs usability testing |

---

## Behavioral proxies

| ID | Assumption | Risk | Status | Evidence |
|----|-----------|------|--------|----------|
| BP1 | Mute rate in the first 7 days after rule creation is a reasonable proxy for whether a rule is working | High | Unvalidated | H1 — to be validated against usage data |
| BP2 | Pre-save forecast reduces 7-day mute rate | High | Unvalidated | H3 — linked to P3 |

---

## Technical assumptions

| ID | Assumption | Risk | Status | Evidence |
|----|-----------|------|--------|----------|
| T1 | YouScan can run a rule retroactively against recent mention history fast enough (seconds) to render a live pre-save forecast | High | Unvalidated | Technical discovery needed |
| T2 | The ML layer for sentiment and author-tier classification is good enough that role-based presets can lean on it without exposing model parameters | Medium | Unvalidated | To be validated with engineering |
| T3 | Severity is meaningful as a 3-tier scale (info / important / critical) — finer granularity isn't worth the configuration cost in v1 | Low | Reasonable | Consistent with cross-domain alerting patterns |

---

## Scope boundary

**In scope for v1:**
- Rule creation flow
- Alert triage (inbox + detail view)
- Basic alerts inbox

**Out of scope for v1:**
- Full delivery channel configuration
- Escalation policies
- Multi-topic deduplication
- Slack / Teams / SMS channels (v2)

**Minimum viable external channel:** email for critical severity alerts only.

---

## Hypotheses to test first (high value, high risk)

| ID | Hypothesis | Source | Validation method | Priority |
|----|-----------|--------|-------------------|----------|
| H1 | Mute rate in the first 7 days after rule creation is a reliable leading indicator of rule quality | BP1 | Analytics on existing alert data | High |
| H2 | Most rule edits originate from an alert detail view, not a settings page | P2 | User interviews + click analytics | High |
| H3 | A pre-save forecast measurably reduces 7-day mute rate | P3, BP2 | Prototype concept test with PR specialists | High |
| H4 | Defaulting recipients to topic watchers/owners covers the common case without manual selection | P5 | Usability test on rule creation flow | High |
| H5 | Role-based presets are a viable starting point across all three archetypes | P1, P6 | Usability test with mixed-role participants | High |
| H6 | Trust degradation leads to measurable response slowdown or feature non-use | U3, U8 | User interviews + feature engagement analytics | High |

---

## Deprioritize validating

These are not worth testing time in the current phase:
- Visual polish and exact UI treatment
- Precise threshold defaults per preset (will self-tune through mute rate data)
- Exact copy on the forecast warning message

---

## Testing discipline

- Test 3–5 hypotheses per research round, not all at once
- Ask about past behavior, not future intent ("Have you ever muted a rule within a week?" not "Would you mute a rule?")
- Update this document after every round: mark confirmed, invalidated, or inconclusive
