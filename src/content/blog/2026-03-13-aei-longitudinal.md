---
title: "AI Use in Lower-Income Worker Occupations"
date: "2026-03-13"
tags: ["AI", "labor", "research", "anthropic"]
excerpt: "A longitudinal panel of the Anthropic Economic Index shows AI task share growing in occupations where lower-income workers are concentrated — and shifting toward automation. Preliminary findings from an independent replication."
---

## Preliminary Findings from a Longitudinal Panel of the Anthropic Economic Index
**Independent research · March 2026 · Work in progress**

> This is a preliminary write-up of an ongoing independent project. Findings are descriptive, not causal. Methods are open and reproducible — see [Data and Code](#data-and-code) below.

---

## What This Is

Kneebone & Holmes (2025) ask: *given what AI can do, which occupations could be affected?* They identify which jobs held disproportionately by lower-income workers are theoretically exposed to AI displacement.

This project asks a different but related question: *what is AI actually being used for in those occupations, and how is that changing?*

The [Anthropic Economic Index](https://huggingface.co/datasets/Anthropic/EconomicIndex) (AEI) publishes data on the tasks people bring to Claude — organized by occupation, collaboration type, and (in recent releases) capability estimates. Across four public releases spanning February 2025 through January 2026, this project builds a unified longitudinal panel for all 23 Standard Occupational Classification (SOC) major groups, then cross-walks it to the Kneebone & Holmes exposure framework. The result is a time-series view of actual AI use in occupations the research literature identifies as most at risk.

---

## Methods in Brief

**Panel construction:** Each AEI release uses a different schema. A harmonization pipeline normalizes task share, collaboration type, and SOC-level aggregates across releases into a consistent format — 92 rows (23 SOC groups × 4 releases) × 16 columns. Key decisions:

- **Task share (SOC rollup):** AEI reports the share of Claude interactions that map to each task. Tasks are distributed equally across all SOC major groups the task spans (via O\*NET crosswalk), then re-normalized to 100%. This is the most conservative, assumption-free allocation: if a task belongs to three SOC groups, each gets one-third. When SOC 43's share shifts from 7.87% to 8.35%, that is a real change in Claude usage — not an artifact of allocation rules.
- **Temporal comparability:** The four releases differ in denominator definitions and data structure. V1 figures are conditional on the 84.21% of interactions that were classifiable; V4 ships raw intermediate files only and carries additional derivation uncertainty. This analysis tracks directional change across releases rather than fitting trend lines.
- **LMI exposure flags:** Kneebone & Holmes (2025) identify SOC groups 31, 41, 43, and 53 as overrepresented among LMI high-exposure workers. Here it is extended into a four-category ordinal flag (high/moderate/low/none) by also categorizing groups K&H describe as underrepresented-but-present (low) and secondarily mentioned (moderate). This extension is a new construction and should not be attributed to K&H.

**LMI exposure by SOC group:**

| Flag | Occupation groups |
|------|------------------|
| **High** | Healthcare Support (31), Sales (41), Office & Admin Support (43), Transportation (53) |
| **Moderate** | Educational Instruction & Library (25) |
| **Low** | Management (11), Business & Financial (13), Computer & Mathematical (15), Architecture & Engineering (17) |
| None | All other groups (14 total) |

---

## Preliminary Findings

### 1. AI task share is growing in LMI-high occupations

Measured as the share of Claude interactions that map to each SOC group, AI usage is increasing in occupations where lower-income workers are most concentrated. Office and Administrative Support (SOC 43) shows a consistent upward trend across all four releases. Educational Instruction and Library (SOC 25, moderate) also shows elevated and growing task share.

![Task share trends by SOC group and LMI flag, Feb 2025–Jan 2026](/plots/task_pct_trends.png)

### 2. The nature of that use is shifting toward automation

Per-SOC collaboration data (available from V2 onward) shows LMI-high occupations — particularly SOC 43 — moving toward automation-type interactions over time rather than augmentation. This is not simply more AI use; it is AI use of a different character.

![Automation vs. augmentation trends by LMI flag](/plots/automation_augmentation_trends.png)

### 3. AI success rates are below average in three of four LMI-high occupation groups

*Note: this finding draws on V4 data only, which carries additional derivation uncertainty (see Methods). "Success rate" is Claude's self-assessed estimate of its capability on each task type — not an independently measured performance metric.*

The V4 release introduces capability primitives including AI autonomy and task success estimates. Across the LMI-high SOC groups, Claude's self-assessed success rate on tasks mapped to those occupations falls below the cross-occupational average in three of four cases.

The pattern is not "AI is displacing these workers because it is good at their jobs." It is closer to: AI is being applied to tasks in lower-income occupations despite lower estimated capability at those tasks. A possible explanation is that office, healthcare support, and sales work is structured on its surface but depends heavily on institutional context, interpersonal relationships, and tacit knowledge — AI may engage with the form of the task while underperforming on the substance.

Within the LMI-high group, autonomy scores are higher in occupations with lower average education requirements, consistent with routine task logic. More autonomous AI engagement is concentrated where workers have fewer credentials and potentially less capacity to contest or correct AI output.

![AI autonomy vs. education level by SOC group (V4 primitives)](/plots/primitives_scatter.png)

### 4. Full SOC picture

The table below shows all 23 SOC groups across all four releases with LMI flags, task share, and collaboration breakdown.

![SOC summary table — all releases](/plots/soc_summary_table.png)

---

## What This Doesn't Show

- **No causal claims.** Growing task share and shifting collaboration types in LMI-high occupations are consistent with displacement pressure, but do not establish it.
- **No cross-platform comparability.** The AEI reflects Claude users only. Claude's user base reflects Anthropic's market positioning; sectors with stronger enterprise penetration may appear more AI-engaged than they would in a cross-platform measure.
- **No formal statistical tests.** LMI-high occupations are compared to the full distribution as a reference point, not as the result of significance testing.
- **Success rate is not observed performance.** It is Claude's self-model of its own capability, derived from V4 raw intermediates. It may not reflect how workers or employers experience AI output quality.

---

## What This Adds

This is, to my knowledge, the first attempt to track the AEI's actual-use signal longitudinally across multiple releases and cross-walk it to the Kneebone & Holmes LMI exposure framework. The finding that AI is being applied most actively to occupations where it estimates lower success raises questions about who benefits when AI engagement grows — and whether growth in AI use in lower-income worker occupations translates to worker benefit, employer efficiency, or neither.

---

## Data and Code

Pipeline, processed outputs, and panel schema documentation are available at:
[github.com/vargovargo/economic-index-trends](https://github.com/vargovargo/economic-index-trends)

Raw data: HuggingFace [`Anthropic/EconomicIndex`](https://huggingface.co/datasets/Anthropic/EconomicIndex) (public dataset).

---

## Reference

Kneebone, E. and Holmes, N. (2025). "On-the-Job Exposure to AI Among Lower-Income Workers." Federal Reserve Bank of San Francisco Working Paper 2025-03.
