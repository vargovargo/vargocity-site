---
title: "Survival Budget Index: Data, Sources, and Lessons Learned"
date: "2026-03-28"
tags: ["research", "methods", "data", "housing", "labor", "west"]
excerpt: "A methods and data note for the Survival Budget Index pilot — four counties in Idaho and Nevada. What sources were used, how they disagree, where the data holds, and what national replication would require."
---

**Methods note · March 2026 · Survival Budget Index pilot**

> This is the methods companion to [What It Costs to Not Be Poor in Idaho and Nevada](/writing/blog/2026-03-28-sbi-findings). Read that piece first for the findings. Read this one for how it was built, where the data is strong, and where it isn't.

---

## Why these four counties

Ada County (Boise) and Canyon County (Nampa) share a metropolitan statistical area and a labor market. They don't share costs. The gap between them is the first comparison this project was built to surface — same MSA, different economic realities, driven almost entirely by housing. Understanding affordability in the Treasure Valley requires both counties.

Clark County (Las Vegas) and Washoe County (Reno) bring in the Nevada side. Nevada and Idaho have the largest minimum wage gap between neighboring western states in the country — $4.75 per hour as of 2026. Both states have seen rapid population growth over the past decade, driven partly by people leaving more expensive West Coast markets for what they expected to be more affordable alternatives. The affordability question is already live in both states.

The four counties together support comparisons across two states with meaningfully different labor policy (Nevada versus Idaho), two counties within the same metro area (Ada versus Canyon), and two Nevada markets at different scales (Las Vegas versus Reno). That's a useful set of contrasts for a pilot.

---

## Where these measures sit on the spectrum

Family budget measures occupy a specific band on the spectrum between poverty and prosperity — and understanding where they sit matters for interpreting what the numbers mean.

At the lower end of the spectrum is the federal poverty line. For a family of three in 2025, that's roughly $2,100 per month. It was designed in the 1960s based on food costs alone and has been widely criticized for understating actual need. It is the floor of what official statistics count as "poor" — not a measure of what's required to live without hardship.

Above the poverty line, and below full prosperity, is a set of sufficiency-oriented measures developed by researchers over the past two decades. The Columbia Center on Poverty and Social Policy's Consumer Guide to Family Budget Measures (2025) is the most thorough comparison available. It documents that these measures are not interchangeable — they answer related but distinct questions:

- **Self-Sufficiency Standard (SSS):** The income needed to meet basic needs without any public or private assistance. Most conservative of the three. Uses 75th percentile market rates for childcare, Small Area Fair Market Rents for housing.
- **MIT Living Wage Calculator:** The minimum income consistent with meeting basic needs — enough to avoid reliance on government assistance. Sits in the middle of the ensemble for most counties.
- **EPI Family Budget Calculator:** A modest-adequacy standard — enough to participate in community life at a basic level, not just survive. Produces the ceiling estimate in most counties.

In Ada County for a family with one infant, the SSS floor is $7,200 per month. The EPI ceiling is $8,700 per month. Both are roughly 3.5 times the federal poverty line. The gap between the poverty line and these measures is the gap between what official statistics treat as the problem and what it actually costs to not be poor.

Neither the SSS nor MIT nor EPI measures prosperity. None include retirement contributions, savings beyond a minimal emergency fund, wealth-building, or discretionary spending. They describe the floor of stable adult life. What sits above them — what a full middle-class budget looks like — is a separate question this project doesn't address.

---

## The anchor sources in detail

**The Self-Sufficiency Standard (SSS)** is published by the UW Poverty & Race Research Action Council (Pearce Institute). Available for Idaho (2023 data, CPI-adjusted to 2025) and Nevada (2024 data). Uses 75th percentile market rates for childcare by care type and age group — the most granular childcare methodology of the three. Produces the most conservative total estimates in most cells; it is the floor of the ensemble. Uses Small Area Fair Market Rents for housing, which captures within-metro variation more precisely than county-level FMRs — important for the Ada/Canyon comparison.

**The MIT Living Wage Calculator** is published by the MIT Work, Wages, and Wellbeing project. Measures basic needs: what's required to cover necessities without public assistance. Updated to December 2025 for all four counties. Uses ACA marketplace premiums for healthcare (2025 plan year), toddler and preschool center-based rates as proxies for infant care. Sits in the middle of the ensemble for most counties.

**The EPI Family Budget Calculator** is published by the Economic Policy Institute. Measures modest adequacy: enough to participate in the community at a basic level, not just survive. Updated January 2026. Uses NBER TAXSIM for federal and state tax calculations — the most rigorous tax methodology of the three. Rolls broadband and phone into "Other Necessities" rather than reporting them separately, which required normalization. Produces the ceiling estimate in most counties.

ALICE (United Way) was assessed for inclusion and excluded. Nevada and Idaho county-level ALICE data was not current enough to normalize to 2025 dollars without assumption risk that would have widened the uncertainty band without adding information.

---

## What the sources disagree about, and why

The disagreements are methodological, not errors. Understanding them matters for interpreting the ranges.

**Healthcare** shows the largest spread in most counties — sometimes exceeding 60%. SSS uses employer-sponsored health insurance premiums from the Medical Expenditure Panel Survey; MIT and EPI use ACA marketplace premiums. ACA premiums run materially higher than employer-sponsored premiums in most western markets. Both represent real-world situations faced by families — some have access to employer coverage, many do not.

**Transportation** is the second-largest source of disagreement. SSS uses AAA per-mile driving costs combined with commute distances from the National Household Travel Survey — a bottom-up cost model. MIT and EPI use the Housing and Transportation Affordability Index, which captures total mobility costs and tends to produce higher estimates in car-dependent metros.

**Taxes** show high spread for family types with children, because SSS reports net of tax credits (EITC, Child Care Tax Credit, Child Tax Credit) while EPI and MIT report gross taxes. SSS's net-of-credit figures are lower; they're not wrong — they're answering a different question about take-home pay.

For categories where the sources agree closely — food (USDA Thrifty Plan basis), broadband, most housing — the ensemble is tight. For high-spread categories, cells are flagged and ranges reported prominently.

---

## The proxy pipeline: infrastructure for what comes next

The anchor datasets update annually. They tell you where the floor was in 2025. A monthly proxy pipeline was built alongside the anchor ensemble to track movement between annual updates — and eventually to compare sufficiency cost growth against headline CPI.

The pipeline pulls six categories on a monthly cron:

- **Housing:** Zillow Observed Rent Index (ZORI), county-level monthly median rent by bedroom count
- **Food:** USDA monthly Thrifty Food Plan cost updates
- **Transportation:** EIA weekly fuel prices by state, converted to monthly cost using vehicle miles assumptions for car-dependent metros
- **Healthcare:** KFF Marketplace benchmark silver plan premiums — annual, pulled at plan-year release
- **Childcare:** State market rate survey data (see below)
- **Broadband:** BLS CPI telephone services subcomponent

The comparison this pipeline is designed to enable: sufficiency cost growth versus headline CPI. Housing, childcare, and healthcare all outpace headline inflation in most years; a sufficiency budget built from those categories rises faster than aggregate inflation statistics suggest. That gap — between what the CPI reports and what the floor actually costs — is one of the most important things this kind of index can surface. Making it visible requires 12 months of monthly observations. The pipeline has been running since March 2026. The comparison will be defensible in early 2027.

The findings in the companion piece come entirely from the anchor datasets. The proxy layer is infrastructure for future analysis, not a source for current findings.

---

## Where the data is weakest: childcare

Childcare is the noisiest category and the hardest to source rigorously.

**Nevada:** The Nevada Division of Welfare and Supportive Services conducted a full Child Care Market Rate Survey in 2022 — the most rigorous source available. It covers Clark and Washoe counties directly, with 75th percentile rates by provider type and age group. The center-based infant rate used: $327/week for Clark County ($1,421/month), $305/week for Washoe County ($1,325/month). These are 2022 data. Nevada has since moved to a cost-estimation model for rate-setting rather than conducting a new market survey; the 2022 MRS is the last formal market price survey available.

**Idaho:** The Idaho Department of Health and Welfare conducted a 2024 market rate study, but the results are behind a portal login. County-level tables were not accessible. The figures used — approximately $1,060/month for Ada County, $950/month for Canyon County — are estimates from secondary sources, cross-checked against the Child Care Aware of America 2024 statewide average of $884/month for center-based infant care in Idaho. These are reasonable estimates, not official survey data. They are tagged as indicative in the database.

The right source for Idaho is the 2024 IDHW market rate study when it becomes accessible, and for both states, the CCDF state market rate surveys that states submit to the federal government.

---

## Wage gap derivation

The anchor datasets report monthly dollar costs. Converting to hourly wage requirements uses the standard full-time work assumption: 2,080 hours per year (40 hours × 52 weeks). For a dual-earner household, the annual cost is divided across two adults each working 2,080 hours.

```
Required hourly wage (dual) = (monthly_cost × 12) / (2 × 2,080)
```

This is computed separately against the floor (SSS minimum) and the ceiling (EPI maximum). The gap is then compared to the state minimum wage.

The single-earner calculation — how many hours per week one adult would need to work at minimum wage to cover the full family budget alone — surfaces a different dimension: when that number exceeds 40 hours, the budget isn't achievable on a standard work schedule. When it exceeds 60, it's structurally impossible regardless of willingness. In Idaho, every family type in the dataset exceeds 60 hours at minimum wage.

Minimum wages used: Idaho $7.25 (federal floor, unchanged since 2009); Nevada $12.00 (constitutionally fixed, effective July 2024).

---

## The H0485 counterfactual

Idaho House Bill 485, pending as of March 2026, would raise Idaho's minimum wage in steps: $12.00 in July 2025, $15.00 in July 2026, $17.00 in July 2027, with CPI indexing from 2028. It has not passed.

The wage gap at $12.00 per hour was computed for all Idaho county-family type combinations. No case flips to covered. The gap narrows significantly — Canyon County's couple scenario goes from a $5.60 gap to $0.85 — but no family with children clears the floor at $12.00 in Ada County. The first step of the proposed increase would represent meaningful progress without fully closing the gap for families with children.

Surfaced as a descriptive counterfactual, not a policy recommendation. Monitor H0485 status at: legislature.idaho.gov.

---

## What national scaling would require

This pilot was designed to answer a specific question: is this methodology replicable, and is the data quality sufficient? The answer is largely yes, with caveats.

**What scales easily:** The EPI Family Budget Calculator and MIT Living Wage Calculator already cover every county and metropolitan area in the country. The anchor ensemble approach works anywhere both sources have data. The wage gap computation is arithmetic once monthly costs are in hand. The proxy pipeline (Zillow, USDA, BLS, EIA) covers the whole country.

**What requires state-by-state work:** Childcare. The CCDF state market rate surveys are the right source and exist for every state — but they're maintained in different formats, update on different schedules, and vary in geographic granularity. Scaling the childcare category nationally means either accepting more imprecision or doing significant data wrangling state by state.

**What requires additional licensing:** The Self-Sufficiency Standard is available for most states but not all. For non-commercial research this isn't a barrier; at commercial scale it would become one. MIT and EPI together — without SSS — still produce a floor/ceiling band; it's narrower but defensible.

The four-county pilot validates the methodology. The pipeline is running. Expansion means adding counties, not rebuilding.

---

## Data and code

All pipeline code, anchor data, and migration scripts are open:

[github.com/vargovargo/cost-of-living](https://github.com/vargovargo/cost-of-living)

Anchor data normalized to 2025 dollars. Pipeline runs monthly via GitHub Actions cron. Proxy signals written to Supabase. Methodology decisions documented in `data/ensemble_normalization_notes.md` in the repository.

Corrections and improvements welcome.
