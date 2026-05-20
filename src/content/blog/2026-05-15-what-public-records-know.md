---
title: "Finding Community in Public Records"
date: "2026-05-15"
tags: ["research", "social capital", "data", "methodology", "public health"]
excerpt: "Raj Chetty's team used billions of Facebook friendships to map social capital across America. The index described here was built from library card records and IRS filings. The pictures look more alike than they should."
series_slug: "social-fabric"
series_order: 2
---

*On what administrative data reveals about community — and where it gets complicated.*

---

Raj Chetty's Social Capital Atlas is one of the more striking research achievements of the last decade. His team at Opportunity Insights got access to the friendship networks of 72 million Americans on Facebook — who was friends with whom, filtered by income — and used that data to map economic connectedness county by county across the United States. It's a rich, behavioral picture of who actually knows whom across class lines, derived from the revealed preferences of people adding friends on a social network.

The index was built from library visit rates, the density of nonprofit organizations filed with the IRS, and establishment counts from the Census Bureau's business data. Public records. The kind of thing anyone could access.

Compared across 3,000 counties, the correlation between the two pictures was 0.39. For the civic infrastructure dimension specifically — the layer most directly measuring the density of institutions where people can show up — the correlation with Chetty's civic organizations measure was 0.55.

That's not a perfect match. It shouldn't be. Chetty is measuring who people are actually friends with. The index measures whether the institutions exist that make those friendships more likely. Supply versus utilization. But the two pictures rhyme. The places where the institutional infrastructure of civic life is dense are, broadly, the places where cross-class social connection is happening.

![Chetty validation scatter](/plots/chetty_scatter.png)

What this suggests is something useful: the footprint of community life shows up in government records even when no one is looking for it. Library visit rates and nonprofit density are not designed as social capital measures. They're administrative artifacts — program statistics, tax filings. But they're encoding something real about the places they describe.

The metro/non-metro sorting visible in the chart is part of that signal. Metro counties score higher on the civic infrastructure and bridging dimensions — cities have denser institutional infrastructure and more cross-group mixing. Non-metro counties score higher on the bonding dimension, Chetty's social cohesiveness measure included — rural communities tend toward stronger within-group ties. That's Putnam's framework visible in the data, and it matters for what comes next.

---

Here is where it gets complicated.

The same places with dense civic infrastructure also tend to have higher incomes, higher educational attainment, and lower poverty rates. This isn't a surprise — it's Putnam's core finding, extended. Wealthy communities have more of everything, including social infrastructure. In models that include both social capital infrastructure and income as predictors of health and economic outcomes, the two eat into each other's explanatory power. The VIF on median household income in the full specification exceeds six — a technical way of saying that income and social infrastructure are so correlated that the data struggles to distinguish their separate effects.

This doesn't mean the effects aren't there. Across 36 specification variants — different control sets, different fixed effects, different functional forms — the direction of the effect is consistent across nearly every one. What changes is whether it's statistically distinguishable from noise. In the sparsest specifications, it is. In the richest ones, the income correlation absorbs most of the variance and social capital fades into the background.

The honest interpretation: there is probably a real relationship between social capital infrastructure and community outcomes. Cross-sectional data can't cleanly size it because the infrastructure and the income arrived together in the same places, and cross-sectional analysis can't tell us which came first.

---

That's not nothing, though. The place where the cross-sectional picture is clearest is drug overdose mortality. Communities with denser bonding infrastructure — religious organizations, social associations, the institutions where people know each other's names — have meaningfully lower overdose death rates, even after controlling for income, education, poverty, and urbanicity. The association is not subtle. It holds across specifications and it's in the right direction for the theory.

Deaths of despair are, in part, deaths of disconnection. The bonding result is consistent with that frame. It's associational — the finding doesn't claim the religious organization caused the lower mortality rate. But it's the kind of finding that points in a direction worth following.

---

The research described here will attempt to give this a cleaner answer. Newspaper closures happened at different times in different communities — which creates the conditions to compare what happened to social infrastructure in places that lost their local paper against similar places that didn't, controlling for everything else that was changing at the same time. That design can cut through the income entanglement that cross-sectional analysis can't.

The other piece coming: the geographic picture. Where is the fabric thin, where is it strong, and what does the national map actually look like. That's the post after this one.

---

*A social fabric score for every U.S. county and a causal analysis of what drives these patterns will appear here as the work develops. If you want to follow along or have data or context to contribute, [reach out](/about).*
