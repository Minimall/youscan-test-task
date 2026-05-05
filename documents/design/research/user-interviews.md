# User interviews: YouScan alerting

## Status

Not conducted as part of this exercise. The brief is a 6–10 hour design task, not a research engagement. The design leans on documented competitor behavior, role descriptions in the brief, and stated hypotheses to be validated post-launch.

---

## Who to interview (when a research week is available)

- 5–7 users per role: PR specialist, SMM, Brand Manager
- 3–5 "manual" users who don't fit a preset
- Mix of customer sizes: large accounts have very different alert volumes than mid-market and need separate sampling

---

## Key questions

### On current pain

- Walk me through the last alert you got that wasted your time. What was wrong with it?
- Walk me through the last alert that mattered. What made it useful?
- When you mute an alert rule, what are you actually doing — fixing it, ignoring it, or using mute as a triage tool?

### On rule creation

- When you create a new alert, how do you decide the threshold?
- Have you ever wished you could see what a rule would do before saving it?
- How often do you edit a rule after it fires versus tuning it preemptively?

### On recipients

- Who currently sees alerts from your topics? Is that the right group?
- When does the recipient list need to differ from the topic's watchers?

### On trust

- When the system tells you something is "critical," do you believe it?
- What would make you trust the severity label more?

---

## Post-launch validation plan (instead of pre-launch interviews)

Given the time budget, the five hypotheses are framed as measurable post-launch tests. These are cheaper than interviews and produce defensible numbers for v2 prioritization.

| Hypothesis | Measurement | Method |
|-----------|-------------|--------|
| H1: Mute rate = rule quality proxy | 7-day mute rate by role segment | Analytics |
| H2: Most rule edits originate from alert detail view | Edit source tracking (alert detail vs. settings page) | Analytics |
| H3: Pre-save forecast reduces mute rate | Rule edit rate before save; 7-day mute rate by cohort | A/B test |
| H4: Default recipients = topic watchers covers common case | Recipient override rate | Analytics |
| H5: Role presets fit actual user roles | Preset selection vs. self-reported role | Analytics + NPS survey |
