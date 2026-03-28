# Feature Priority Matrix (MoSCoW)

Date: 2026-03-15  
Source Basis: market-farmer-and-art-market-app-research-2026-03-15.md

## Scope

This matrix translates the completed market research into implementation priorities for a farmer and art market app serving customers, vendors, and market managers.

## Must Have

| Feature | Why It Is Must | Primary Problem Solved | Suggested KPI | Core Dependencies |
|---|---|---|---|---|
| Real-time vendor attendance status | Core trust driver and pre-visit go/no-go input | Customers cannot verify who is present before travel | Attendance status freshness rate | Vendor check-in flow, manager override |
| Product availability + exception states (sold out, running late, not attending) | Directly reduces failed trips and decision friction | Mismatch between expected and actual inventory/status | Failed-trip rate reduction | Vendor quick update UI, timestamping |
| Payment and incentive clarity (including SNAP eligibility indicators where applicable) | Essential for value-sensitive and low-income segments | Payment uncertainty and affordability friction | Checkout/payment confusion incidents | Vendor payment profile, market rules config |
| Confidence signal with freshness timestamp | Converts raw updates into actionable trust | Users cannot assess reliability of claims | Confidence-backed conversion uplift | Signal model, event logs, explainability UI |
| Manager operations dashboard for disruptions | Required for multi-actor truth and rapid correction | Fragmented communication during market-day issues | Time-to-resolution for disruptions | Role-based access, alerting |
| Market-wide broadcast + targeted alerts | Critical for same-day incident response | Customers and vendors miss urgent updates | Alert delivery success and engagement | Notification infrastructure |

## Should Have

| Feature | Why It Is Should | Primary Problem Solved | Suggested KPI | Core Dependencies |
|---|---|---|---|---|
| Intent-based shopper planner (find item -> vendor -> market path) | Strong conversion and convenience multiplier | Planning uncertainty and wasted browsing | Planned-list completion rate | Search index, vendor catalog normalization |
| Substitution and fallback suggestions | Prevents abandonment when confidence drops | Stockout-driven churn and frustration | Session-to-purchase continuity after stockout | Availability graph, recommendation rules |
| Vendor reliability analytics (accuracy, lateness, no-show history) | Supports manager policy and trust governance | Repeated low-quality status behavior | Reliability score improvement over time | Historical event store, policy engine |
| Shared activity feed for status changes | Improves transparency across actors | Invisible updates and communication lag | Feed view-to-action rate | Event streaming, filtering |
| Route/time-aware market-day planning | Increases utility for time-constrained users | Travel burden and scheduling mismatch | Trip-success rate for planned visits | Mapping integration, market hours data |

## Could Have

| Feature | Why It Is Could | Primary Problem Solved | Suggested KPI | Core Dependencies |
|---|---|---|---|---|
| Cross-market comparison view | Helpful for advanced users, not required for MVP trust loop | Multi-market decision complexity | Cross-market usage rate | Expanded market coverage |
| Personalized confidence thresholds | Better fit for user preference diversity | One-size-fits-all trust interpretation | Preference-adjusted conversion lift | User profile settings |
| Loyalty and rewards hooks | Can improve retention after trust baseline is stable | Repeat engagement optimization | 30/60-day repeat rate | Reward framework, partner agreements |
| In-app storytelling/vendor profiles | Nice engagement layer after operational reliability | Limited emotional connection with producers | Content engagement rate | Content moderation workflow |

## Won't Have (Initial Release)

| Excluded Capability | Why Deferred |
|---|---|
| Full end-to-end e-commerce checkout replacement for all vendors | High integration burden; not required to prove confidence-first value proposition |
| Complex dynamic pricing engine | Not core to the current failed-trip and trust problem set |
| Multi-region regulatory automation suite | Useful later; early release can use configurable policy templates |

## Recommended Release Slices

### Release 1 (Trust Foundation)

- Real-time attendance
- Availability/exception states
- Payment and incentive clarity
- Confidence + freshness metadata
- Manager disruption dashboard
- Broadcast alerts

### Release 2 (Conversion Layer)

- Intent planner
- Substitutions/fallbacks
- Activity feed
- Reliability analytics

### Release 3 (Optimization Layer)

- Route-aware planning
- Cross-market compare
- Personalization and retention enhancements

## Research Traceability

Key supporting references:

- https://doi.org/10.1111/j.1470-6431.2009.00771.x
- https://doi.org/10.1111/j.1748-0159.2008.00119.x
- https://doi.org/10.34068/joe.53.01.24
- https://doi.org/10.34068/joe.60.02.08
- https://doi.org/10.1016/j.foodpol.2014.06.002
- https://doi.org/10.1016/j.jneb.2025.05.021
