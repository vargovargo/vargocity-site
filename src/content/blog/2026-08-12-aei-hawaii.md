---
title: "AI Exposure in Honolulu"
date: "2026-08-12"
tags: ["AI", "labor", "research", "anthropic", "Hawaii"]
excerpt: "No public dataset measures AI usage below the state level — so this asks a different question. Crossing Honolulu's employment mix with national AI usage puts the city slightly below the national exposure figure, but the composition is the story: a tourism economy sits structurally away from where AI use is densest, and the real channel runs through office and administrative work."
series_slug: "aei"
series_order: 5
---

## What National Usage Data Implies for Hawaii's Workforce — and Why the Direct Data Is So Thin

**Independent research · August 2026 · Work in progress**

> Prompted by questions from Honolulu about local AI use. The honest headline: no public dataset measures AI usage below the state level. Hawaii's position in the state-level data has changed sharply — in the 2025 releases it barely cleared the reporting threshold; in the June 2026 release 19 of 23 occupation groups are visible and Hawaii's per-capita usage index sits above average (1.15×, rank 8 of 51). This piece assembles what the [Anthropic Economic Index](/lab/posts/2026-03-13-aei-longitudinal) (AEI) says about Hawaii, then pivots to an exposure analysis: Honolulu's employment mix (BLS OEWS, May 2025) crossed with national AI usage. Exposure is not observed use; the distinction is load-bearing and repeated throughout.

---

## The Data Situation, Stated Plainly

Three facts constrain everything below.

**First, no sub-state AI usage data exists.** Across all six AEI releases (February 2025 through June 2026), the finest US geography is the state. OpenAI's Signals data is likewise state-level at best. Honolulu-specific *usage* measurement would require the platforms to publish it — though OpenAI has indicated that state officials can request more detailed state data, an avenue worth pursuing for anyone in Hawaii government reading this.

**Second, Hawaii's threshold position has changed.** The AEI suppresses state cells below a conversation-count threshold. In the first three releases where Hawaii appeared (September 2025 through March 2026), only one or two occupation groups cleared the bar per release, and Hawaii's profile was too sparse to read. In the June 2026 release, 19 of 23 SOC major groups are visible. That shift is the most important factual update in this piece, and it is what makes the rest of it possible.

**Third, what state-level signal exists is distinctive.** In September 2025, Anthropic's geography data showed Hawaii's population-adjusted Claude use at 0.42× (rank 18 of 51) — below average, generating too little traffic for stable occupation-level statistics. By April–May 2026, Hawaii's per-capita index had risen to 1.15× (rank 8 of 51), above average for the first time. Whether that reflects genuine growth in Hawaii's AI adoption, a change in Claude's product mix, or threshold dynamics is not separable from the available data. One occupation-agnostic signal persists across releases: Hawaiians ask Claude for help with itinerary planning at roughly **twice the national rate**.

---

## What the AEI Shows for Hawaii

Every Hawaii occupation group above threshold in the June 2026 release, against the national mix:

![Hawaii vs national AI task share, all SOC groups above threshold](/plots/hawaii_soc_mix.png)

Reading the panel release by release — and for the first three releases, Hawaii's shares are computed only over the groups above threshold, so read the mix, not the levels:

- **September 2025:** only Office & Administrative Support cleared the bar, at 2.6% of Hawaii's classified usage against 8.2% nationally.
- **January 2026:** Computer & Mathematical (51.4%) and Education & Library (48.6%) — a two-group denominator, but notable that education work is as prominent as software in Hawaii's visible usage, where nationally software led education by more than 2:1 that release.
- **March 2026:** Education & Library (54.5%) and Arts & Media (45.5%) — software fell *below* threshold while education and media stayed visible.
- **June 2026:** near-complete coverage, and Hawaii's distribution turns out to track the national mix closely. Computer & Mathematical leads at 21.5% (22.1% nationally), then Arts & Media at 13.6% (13.1%), Education & Library at 12.3% (12.2%), and Sales at 11.1% (11.2%). LMI-high groups account for 19.7% of Hawaii's task share against 19.9% nationally — effectively no difference.

The last point deserves emphasis because it cuts against the intuition that drove this analysis: **the "tourism state" profile does not show up in Hawaii's AI task distribution at all.** Once enough of Hawaii's usage is visible to measure, Hawaii looks like the country. The distinctiveness of Hawaii's economy shows up in its *employment*, not in what its Claude users do — which is exactly why the exposure pivot below is the more informative exercise.

Two further state-level signals:

- **Hawaii's automation rate has fluctuated.** 48.5% in September 2025, falling to roughly 39% in January and March 2026, then rising to 50.6% in June 2026 — slightly above that release's national 48.8%. The earlier augmentation lean is likely a threshold artifact: the only groups visible in those releases were education and arts, both augmentation-heavy nationally.
- **Task success estimates track the national average** (64.6 in January 2026, 69.8 in March 2026). This is Claude's self-assessed capability on the tasks it is given, not an audited performance measure.

---

## The Pivot: From Usage to Exposure

Since direct Honolulu usage data cannot exist yet, the analyzable question changes. Following the logic of Kneebone and Holmes (2025) — who ask which workers *could* be affected given what AI can do — this crosses two sources:

1. **Honolulu's employment structure.** BLS Occupational Employment and Wage Statistics for the Urban Honolulu metro area, which holds 71% of the state's jobs (446,390 of 627,530 in May 2025), by SOC major group, alongside Hawaii statewide and the US.
2. **National AI usage per occupation.** The AEI's task share and automation/augmentation character for each SOC group, June 2026 release.

The output is an **exposure profile**: how much of Honolulu's employment sits in occupations where national AI usage concentrates, and where that usage leans automation. To be maximally clear: *if* AI engagement in Honolulu workplaces follows national patterns, this is where it would land. It is not evidence that it has.

![Honolulu employment mix versus the US, ordered by national AI usage](/plots/honolulu_exposure.png)

Headline exposure metrics:

| Metric | Honolulu | Hawaii | US |
|---|---|---|---|
| Usage-weighted exposure index | 4.76 | 4.62 | 5.01 |
| Employment share in top-quartile-usage occupations | 35.7% | 34.9% | 37.4% |
| Employment share in automation-leaning occupations | 56.1% | 57.8% | 53.7% |
| Employment share in K&H LMI-high occupations | 31.0% | 31.5% | 33.9% |

Three of the four metrics put Honolulu slightly *below* the national figure, and every gap is small — a few percentage points at most. The composition behind them is more interesting than the totals.

Honolulu is light on most of the occupations where national AI usage actually concentrates. Computer & Mathematical leads the June 2026 release at 22.1% of national task share but is 2.3% of Honolulu employment against 3.4% nationally; Business & Financial Operations runs 1.2 points below national. The pattern has one clear exception, and it is worth naming: Educational Instruction & Library carries 12.2% of national AI usage and is 0.9 points *above* national in Honolulu employment — the one high-usage group where Honolulu is over-weighted, which is consistent with the education signal that has been the most persistent finding in Hawaii's own AEI rows. Otherwise Honolulu is heavy on occupations with almost no measured AI task share: Food Preparation & Serving is 12.2% of Honolulu employment against 8.8% nationally — the largest gap in either direction — while carrying 0.6% of national AI usage, and Building & Grounds Cleaning is 1.6 points above national at 0.2% of usage. That trade is what pulls the usage-weighted index to 4.76 against 5.01. A tourism economy sits structurally away from where current AI use is densest.

The one metric where Honolulu runs *above* national — automation-leaning employment share, 56.1% against 53.7% — needs care, because it is not a stronger-automation-risk finding. It rises on the same tourism occupations: Protective Service (80.5% automation-leaning nationally), Construction & Extraction (71.5%), Food Preparation (52.1%), Building & Grounds (52.0%). Those rates describe the character of whatever usage occurs, on a very small base of usage. A high automation share on 0.4% of national task share is a statement about a thin slice, not a large exposure. Read that row as a caution about the metric, not a finding about Honolulu.

In the Kneebone and Holmes framework, the substantive indirect exposure runs through the administrative work attached to a tourism economy. Office & Administrative Support is 11.9% of Honolulu employment (11.4% nationally), carries 7.7% of national AI usage, and has the most automation-leaning profile of any large LMI-high group at 59.6%. It is the one place where sizeable local employment, real measured usage, and automation-leaning character coincide — and it is consistent with what [the longitudinal panel](/lab/posts/2026-03-13-aei-longitudinal) and [the SOC 43 deep-dive](/lab/posts/2026-03-17-soc43-subgroup) have been tracking nationally. Honolulu's below-national LMI-high share is driven by Healthcare Support (1.7 points below) and Sales (1.0 below), not by Office & Admin, which sits slightly above national.

---

## What This Doesn't Show

- **Exposure ≠ use ≠ displacement.** The exposure table says nothing about whether Honolulu employers or workers actually use AI, and observed usage says nothing about job loss. Three different claims; only fragments of the first two are measurable today.
- **Hawaii's earlier AEI rows are small-n.** The September 2025 through March 2026 releases rest on one- and two-occupation denominators under threshold censoring — directional reading only. The June 2026 release is far better (19 of 23 groups) but is still a single release, and it averages two months rather than sampling one week as earlier releases did.
- **The employment and usage sides are 13 months apart.** May 2025 employment against April–May 2026 usage. At SOC-major resolution the employment mix moves slowly, but the gap is real.
- **The state is mostly, not entirely, Oahu.** Urban Honolulu holds 71% of state employment, so state-level AEI signals are Oahu-weighted. Neighbor-island economies differ — more agriculture, a different tourism mix — and are invisible in all of this.
- **Claude ≠ AI.** The AEI reflects one platform's users. ChatGPT's consumer base is larger and demographically different; Hawaii's rank there would be checkable against OpenAI Signals, which is not yet wired into this analysis.

---

## What Would Actually Answer Honolulu's Question

1. **Ask the platforms.** OpenAI has said state officials can request state-specific data, and Anthropic's Economic Futures program has fielded similar research requests. A Hawaii-specific cut is a request away from being possible, and public agencies are well-positioned to make it.
2. **Survey locally.** A short employer and worker AI-use survey through UHERO, the Chamber of Commerce Hawaii, or DBEDT would measure what no platform dataset can: adoption inside Honolulu workplaces, including the non-frontier tools that dominate actual office practice.
3. **Watch the education signal.** Educational Instruction & Library is the one group visible in Hawaii's data across every 2026 release, consistent with heavy AI uptake in teaching workflows nationally. Hawaii DOE and UH system policy will shape more of the state's near-term AI experience than tech-sector trends will.

---

## Data and Code

Pipeline, processed outputs (`hawaii_profile.csv`, `honolulu_exposure.csv`, `state_usage_v3.csv`), and schema documentation: [github.com/vargovargo/economic-index-trends](https://github.com/vargovargo/economic-index-trends)

Sources: Anthropic Economic Index (HuggingFace [`Anthropic/EconomicIndex`](https://huggingface.co/datasets/Anthropic/EconomicIndex), CC-BY); BLS Occupational Employment and Wage Statistics, May 2025 research files.

---

## References

Kneebone, E. and Holmes, N. (2025). "On-the-Job Exposure to AI Among Lower-Income Workers." Federal Reserve Bank of San Francisco Working Paper 2025-03.

Anthropic (2025). "Anthropic Economic Index report: Uneven geographic and enterprise AI adoption." September 2025.

Chatterji, A., et al. (2025). "How People Use ChatGPT." NBER Working Paper 34255.

U.S. Bureau of Labor Statistics. Occupational Employment and Wage Statistics, Urban Honolulu, HI MSA, May 2025.
