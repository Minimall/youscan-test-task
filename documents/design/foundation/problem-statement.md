# Problem statement: YouScan alerting

## Executive summary

Social media analysts who monitor brands in YouScan receive too many alerts, can't tell which ones matter, and have no way to tune the system to match their role's tolerance for noise. PR specialists, social media managers, and brand managers are treated identically by the current alerting logic — so the settings that work for one role produce either too much noise or too little signal for the others. Users slow their responses to avoid acting on false alarms, and when a real crisis fires, they hesitate instead of acting.

---

## Core problem definition

### What isn't being solved well

The mention stream inside any active monitoring topic generates far more noise than signal. Real PR crises make up well under 1% of mention spikes; genuine influencer engagement is a fraction of high-engagement posts; meaningful sentiment shifts get buried under daily variance. Even an accurate ML model produces enough false positives on rare events to trigger alert fatigue — a failure mode documented in security operations, healthcare monitoring, and compliance tools alike.

Users have no visibility into why an alert fired, no control over the precision-recall trade-off that shapes every alert they receive, and no way to preview what a rule will catch before they live with it. The ML is a black box at decision time.

A second structural problem sits underneath: one global sensitivity setting cannot serve users with fundamentally different jobs. PR specialists need fast detection of negative anomalies. Social media managers watch for emerging positive trends to amplify. Brand managers want periodic synthesized signals, not raw event notifications. Tuning for one role degrades the experience for the others.

### Who feels this pain most

The sharpest pain sits with PR specialists. They face the worst cost asymmetry: act on a false alarm and waste escalation effort; miss a real alert and face a crisis that wasn't caught in time. When trust in the system degrades, they slow their response to verify before acting — which defeats the purpose of real-time alerting.

Social media managers want early signals on trends before they peak, but a high false-positive rate makes every trend notification feel suspect. They need ambient awareness without manual monitoring.

Brand managers don't need fast alerts — they need relevant, synthesized ones. A raw volume spike notification interrupts their workflow without adding positioning value.

A secondary pain point cuts across all three roles in larger accounts: the person configuring alert rules often isn't the person receiving them. An admin tuning rules company-wide gets no direct feedback when the PR team is drowning in noise.

### How the product makes life better

Before: analysts receive frequent alerts, slow their response because they don't trust the system, and occasionally miss things that matter because everything looks like noise.

After: each role gets alerts calibrated to their actual job and noise tolerance. A crisis alert for the PR team carries enough signal and context that acting on it feels obvious, not risky. Social media managers catch emerging trends before they peak without monitoring manually. Brand managers get synthesized signals on their own cadence, not on the mention stream's cadence.

The measure of success is confidence at the moment of decision — not a reduction in alert volume by itself.

---

## Evidence and open questions

**Validated:**
- Three role archetypes (PR specialist, SMM, Brand Manager) and their incompatible sensitivity defaults — confirmed by user research.
- Cost asymmetry is role-dependent: PR specialists face the highest stakes on both sides; brand managers tolerate misses more.
- Rule ownership is mixed: SMBs self-configure; enterprise accounts use an admin who may not receive the alerts they set up.

**Not yet validated (test task assumptions):**
- How users currently cope with false positives — assumed to be slow response degrading toward non-use, but no behavioral data confirmed.
- Feature abandonment rate — no tracking data available.

---

## Evolution notes

This statement was written before any wireframes, user flows, or technical scoping. Expect it to change once:
- Coping behavior is researched (what do users actually do when a false alarm fires?)
- The precision-recall trade-off is quantified for real YouScan topic data
- The admin/recipient split is validated in enterprise accounts

A statement that never changes means no learning is happening.
