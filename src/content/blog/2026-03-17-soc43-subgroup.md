---
title: "Inside SOC 43: AI Use Across Office and Administrative Support Subgroups"
date: "2026-03-17"
tags: ["AI", "labor", "research", "anthropic"]
excerpt: "Three subgroups account for over 90% of SOC 43's AI task share. One saw its automation rate drop 14 points in a single release cycle. A supplemental look at how AI engagement is distributed within the occupation group most concentrated among lower-income workers."
---

## Part of a Larger Analysis

SOC 43 — Office and Administrative Support — appears repeatedly in the [main longitudinal analysis](/writing/blog/2026-03-13-aei-longitudinal) as the occupation group with the highest AI task share among those where lower-income workers are concentrated: 8.35% of all Claude interactions in the most recent release. But "SOC 43" is not one thing.

This supplement drills into the seven O\*NET broad groups that make up SOC 43 — from supervisors to data entry workers to switchboard operators — to ask: where within SOC 43 is AI use actually concentrated, and how does the automation/augmentation character of that use vary across subgroups?

---

## Methods in Brief

**Task share**: Derived from V4 raw intermediate data (Jan 2026), US geography. Each task is matched to its O\*NET broad group via the first four characters of the O\*NET-SOC code (e.g., `43-4051.00` → `43-4`), then deduplicated to prevent double-counting when a task spans multiple detailed codes within the same broad group. Shares are normalized within SOC 43 — they sum to 100% of SOC 43's AI task interactions, not of the full panel.

**Collaboration breakdown (automation/augmentation)**: Derived from V3 (Sep 2025) and V4 (Jan 2026) using global geography — the only geography available for this facet in either release. Task share uses US data; collaboration uses global data. This mismatch cannot be corrected without additional data and is flagged throughout.

**Collaboration classification**: `directive` → automation; `feedback loop`, `task iteration`, `learning`, `validation` → augmentation; `not_classified`, `none` → other. The denominator includes `other`, consistent with the main panel's approach.

Full methods: [soc43_methods.md](https://github.com/vargovargo/economic-index-trends/blob/main/soc43_methods.md)

---

## Findings

### 1. Task share is heavily concentrated in one subgroup

43-9 — Other Office and Administrative Support, the O\*NET catch-all that includes data entry keyers, word processors, and office machine operators — holds 57.6% of SOC 43's AI task share in V4, despite covering the most routine and substitutable work in the major group. The three largest subgroups (43-9, 43-4, and 43-6) together account for 91% of task share.

The four small-n subgroups — supervisors (43-1), financial clerks (43-3), material recording clerks (43-5), and communications equipment operators (43-2) — together represent less than 9% of SOC 43's AI task volume. Their collaboration findings are included in the chart below but should be treated as indicative rather than conclusive.

![SOC 43 subgroup: task share within SOC 43 and automation rate shift V3 to V4](/plots/soc43_subgroup.png)

### 2. Secretaries had the highest automation rate in V3 — and the largest drop by V4

Secretaries and Administrative Assistants (43-6) registered the highest automation rate of any SOC 43 subgroup in V3: 56.8%. By V4 (January 2026), that figure had fallen to 42.9% — a 14-point drop — while augmentation rose from 31.7% to 45.9%.

What's behind the shift is unclear. It could reflect a genuine change in how people use AI for secretarial tasks. It could reflect model behavior changes between release windows. It could be sampling variation — V3 and V4 each cover a single week. The size of the shift is notable; the mechanism is not established.

### 3. Information and Record Clerks are persistently the most automation-heavy

43-4 — Information and Record Clerks, which includes customer service representatives, correspondence clerks, and file clerks — shows the highest automation rate in V4 (40.2%) and was near the top in V3 (46.6%) as well. This is the subgroup where directive AI use — AI completing tasks end-to-end without ongoing human input — is most consistently concentrated. It is also the largest by task count: 44 distinct tasks.

---

## A Tension With the Main Panel

The main longitudinal analysis shows SOC 43 as a major group moving toward automation over time (V2 through V4). The subgroup analysis shows the opposite — most broad groups moving toward *augmentation* from V3 to V4.

These aren't necessarily inconsistent. The main panel captures the V2→V3 transition (March 2025 to September 2025), where the automation shift may be most pronounced. The subgroup analysis only covers V3→V4. It is also possible that the main-panel automation trend for SOC 43 is concentrated in those earlier releases, and more recent data shows a reversal.

This tension deserves explicit treatment in any use of these findings. Both observations are real; neither alone tells the full story.

---

## What This Doesn't Show

- **No causal claims.** Task share concentration and automation rates describe patterns in Claude usage, not what AI will or won't do to employment, wages, or specific workers.
- **V4 only for task share.** A comparable subgroup task share for V3 was not computed. The share figures are a snapshot of the most recent release, not a trend.
- **US vs. global geography mismatch.** Task share and collaboration data come from different geographic filters because of what's available in the source data.
- **One week per release.** Seasonal variation and week-specific sampling cannot be distinguished from genuine trend.

---

## Data and Code

Part of the larger [AEI longitudinal project](https://github.com/vargovargo/economic-index-trends). The subgroup panel (`soc43_subgroup_panel.csv`) and the functions that build it (`build_soc43_subgroup_panel`, `plot_soc43_subgroup` in `harmonize.py`) are in the same repo.

Full methods appendix: [`soc43_methods.md`](https://github.com/vargovargo/economic-index-trends/blob/main/soc43_methods.md)

---

## Reference

Kneebone, E. and Holmes, N. (2025). "On-the-Job Exposure to AI Among Lower-Income Workers." Federal Reserve Bank of San Francisco Working Paper 2025-03.
