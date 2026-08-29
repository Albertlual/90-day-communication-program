# CURRICULUM_MAP.md

Last updated: 2026-08-26 — Batch 6 (Days 51–60) authored — **Development phase complete**. Days 61–90 (Batches 7–9) are POSTPONED per user decision to move to deployment — see PROJECT_CONTINUATION.md §11 for the postponed roadmap.

This is the structural plan for the full 90-day curriculum. It exists so that
every batch of days — authored in separate sessions, possibly by different AI
sessions — follows the same rules, avoids repeating vocabulary or scenarios,
and keeps the difficulty curve consistent across the whole program. Content
particulars (actual reading text, actual vocabulary definitions, actual
speaking scenarios) live in `server/data/curriculum/days/*.json`. This
document is the plan; those files are the authored content.

---

## 1. Design principle: a spiral curriculum

Rather than dedicating, say, "Days 1–10 to finance" and "Days 11–20 to
logistics," each 10-day block rotates through all nine core professional
domains once, then repeats the rotation in the next block at greater depth.
This is a **spiral curriculum**: the same domains are revisited multiple
times across the 90 days, each time with harder reading, more advanced
vocabulary, and more demanding speaking scenarios. It keeps the program from
front-loading one topic and neglecting others, and it matches how real
professional skill develops — through repeated exposure at increasing
difficulty, not one-time coverage.

## 2. The 10-day domain rotation

Each block of 10 days follows this fixed position → domain mapping:

| Position in block | Domain | Vocabulary category |
|---|---|---|
| 1 | Communication foundations (always includes an interview-style question) | Professional Communication |
| 2 | Procurement | Procurement |
| 3 | Logistics & Supply Chain | Logistics & Supply Chain |
| 4 | Humanitarian Operations / Donor Compliance | Humanitarian Operations |
| 5 | Financial Reporting / Accounting | Finance & Accounting |
| 6 | Inventory & Warehouse Management | Inventory & Warehouse |
| 7 | Audit, Compliance & Systems (incl. QuickBooks-relevant habits) | Audit & Compliance |
| 8 | Cross-functional Teamwork / Meetings | Workplace Communication |
| 9 | Supplier & Stakeholder Communication | Stakeholder & Supplier Relations |
| 10 | **Milestone / Integration review** | Mixed review (fewer new terms, spaced-repetition focus) |

So Days 1, 11, 21, 31, 41, 51, 61, 71, 81 are all "communication foundations"
days; Days 10, 20, 30, 40, 50, 60, 70, 80, 90 are all milestone days, with
Day 90 as the program's final capstone.

## 3. Speaking scenario pattern (applies every day except milestones, which vary)

- **Scenario 1** = a domain-knowledge explanation question, tied to that
  day's rotation position (e.g., explain the procurement cycle, explain a
  budget variance).
- **Scenario 2** = a general workplace-communication skill (raising a
  concern, disagreeing professionally, managing expectations, explaining a
  delay), loosely set in that day's domain context for realism.

## 4. Phase progression rules

| | Foundation (Days 1–30) | Development (Days 31–60) | Advanced (Days 61–90) |
|---|---|---|---|
| Tongue twisters | Basic articulation — short phrases, single-sound focus | Longer, more complex phrases, combined sounds | Advanced articulation, including full professional sentences as warm-ups |
| Reading | Original short pieces (~250–320 words), single concept per piece | Longer pieces, more nuance, comparing two ideas | Longer/denser pieces, ambiguity, executive-style writing |
| Primary framework | PREP (introduced Day 1, reinforced throughout) | STAR introduced (~Day 31), Problem→Cause→Solution, 3-2-1 reinforced | Full mix, plus concise/persuasive "executive" framing, spontaneous unprepared-question days increase |
| Speaking scenarios | Short answers, single-topic, low ambiguity | Longer answers, disagreement, problem-solving, multi-step explanations | Complex/ambiguous situations, presentations, meetings, spontaneous questions |
| Milestone days | Recap + comfort self-check | Recap + a harder integration scenario spanning two domains | Recap + a full mock-interview or mock-presentation style capstone |

## 5. Vocabulary rules

- Vocabulary terms are **never repeated** across the 90 days — each term is
  authored once, the first time its domain/category comes up. A running
  "used terms" list is maintained below so future batches can check before
  adding a term.
- Each non-milestone day introduces **5–6 new terms**. Milestone days
  introduce only **3 new terms** and rely on the spaced-repetition queue
  (via `VocabularyProgress`) to resurface older terms for review instead.
- Categories map to the domain rotation table in §2, but a later block
  revisiting the same domain will pull genuinely new terms, not rephrase
  earlier ones (e.g., Day 3's Logistics vocabulary ≠ Day 13's Logistics
  vocabulary, even though both are "Logistics & Supply Chain").

## 6. Milestone-day rule

Every day where `dayNumber % 10 === 0` is flagged `isMilestone: true` in its
`DailyProgram` document. Milestone days: fewer new vocabulary terms (see §5),
reflection questions specific to reviewing the prior block, and speaking
scenarios that ask the user to synthesize/summarize rather than learn
something new. Days 30, 60, and 90 are **phase capstones** — treat these as
slightly larger milestones marking the Foundation → Development → Advanced
transitions, with Day 90 as the full program capstone.

## 7. CV-safety rule for speaking model answers

Any speaking-scenario model answer that references the user's own
professional background (e.g., "Tell me about yourself") draws **only** from
these confirmed facts:
- Logistics & Administrative Assistant — Mayar Medical Centre
- Finance & Administrative Assistant — Favor Africa Ministries International
- Bachelor of Business Administration (Accounting)
- Training: Logistics & Procurement Management, Computerised Accounting,
  QuickBooks, financial reporting, inventory management, procurement, supply
  chain, warehouse operations
- Skills: financial management, accounting, procurement, supply chain,
  logistics, inventory management, donor compliance, audit-ready
  documentation, QuickBooks, Excel, financial reporting, procurement
  planning, supplier management, warehouse operations, stock reconciliation,
  expenditure tracking, operational reporting, cross-functional teamwork
- Context: humanitarian operations in South Sudan

No employer, achievement, project outcome, date, or number is invented
beyond this list. Where a scenario needs a specific personal achievement
story the CV doesn't provide detail for, the model answer stays illustrative
("here's an example of how you might structure this...") rather than
presenting an invented event as the user's own.

## 8. Full 90-day index

Status legend: ✅ authored and validated · ⬜ planned, not yet authored

| Day | Phase | Domain focus | Status |
|---|---|---|---|
| 1 | Foundation | Communication foundations | ✅ |
| 2 | Foundation | Procurement | ✅ |
| 3 | Foundation | Logistics & Supply Chain | ✅ |
| 4 | Foundation | Humanitarian Operations | ✅ |
| 5 | Foundation | Financial Reporting | ✅ |
| 6 | Foundation | Inventory & Warehouse | ✅ |
| 7 | Foundation | Audit & Compliance | ✅ |
| 8 | Foundation | Teamwork / Meetings | ✅ |
| 9 | Foundation | Supplier & Stakeholder Comm | ✅ |
| 10 | Foundation | **Milestone 1** | ✅ |
| 11 | Foundation | Communication foundations | ✅ |
| 12 | Foundation | Procurement | ✅ |
| 13 | Foundation | Logistics & Supply Chain | ✅ |
| 14 | Foundation | Humanitarian Operations | ✅ |
| 15 | Foundation | Financial Reporting | ✅ |
| 16 | Foundation | Inventory & Warehouse | ✅ |
| 17 | Foundation | Audit & Compliance | ✅ |
| 18 | Foundation | Teamwork / Meetings | ✅ |
| 19 | Foundation | Supplier & Stakeholder Comm | ✅ |
| 20 | Foundation | **Milestone 2** | ✅ |
| 21 | Foundation | Communication foundations | ✅ |
| 22 | Foundation | Procurement | ✅ |
| 23 | Foundation | Logistics & Supply Chain | ✅ |
| 24 | Foundation | Humanitarian Operations | ✅ |
| 25 | Foundation | Financial Reporting | ✅ |
| 26 | Foundation | Inventory & Warehouse | ✅ |
| 27 | Foundation | Audit & Compliance | ✅ |
| 28 | Foundation | Teamwork / Meetings | ✅ |
| 29 | Foundation | Supplier & Stakeholder Comm | ✅ |
| 30 | Foundation | **Milestone 3 + Foundation phase capstone** | ✅ |
| 31 | Development | Communication foundations | ✅ |
| 32 | Development | Procurement | ✅ |
| 33 | Development | Logistics & Supply Chain | ✅ |
| 34 | Development | Humanitarian Operations | ✅ |
| 35 | Development | Financial Reporting | ✅ |
| 36 | Development | Inventory & Warehouse | ✅ |
| 37 | Development | Audit & Compliance | ✅ |
| 38 | Development | Teamwork / Meetings | ✅ |
| 39 | Development | Supplier & Stakeholder Comm | ✅ |
| 40 | Development | **Milestone 4** | ✅ |
| 41 | Development | Communication foundations | ✅ |
| 42 | Development | Procurement | ✅ |
| 43 | Development | Logistics & Supply Chain | ✅ |
| 44 | Development | Humanitarian Operations | ✅ |
| 45 | Development | Financial Reporting | ✅ |
| 46 | Development | Inventory & Warehouse | ✅ |
| 47 | Development | Audit & Compliance | ✅ |
| 48 | Development | Teamwork / Meetings | ✅ |
| 49 | Development | Supplier & Stakeholder Comm | ✅ |
| 50 | Development | **Milestone 5** | ✅ |
| 51 | Development | Communication foundations | ✅ |
| 52 | Development | Procurement | ✅ |
| 53 | Development | Logistics & Supply Chain | ✅ |
| 54 | Development | Humanitarian Operations | ✅ |
| 55 | Development | Financial Reporting | ✅ |
| 56 | Development | Inventory & Warehouse | ✅ |
| 57 | Development | Audit & Compliance | ✅ |
| 58 | Development | Teamwork / Meetings | ✅ |
| 59 | Development | Supplier & Stakeholder Comm | ✅ |
| 60 | Development | **Milestone 6 + Development→Advanced phase capstone** | ✅ |
| 61–70 | Advanced | Same rotation, advanced articulation | 🛑 POSTPONED |
| 71–80 | Advanced | Same rotation, greater depth | 🛑 POSTPONED |
| 81–90 | Advanced | Same rotation + **Day 90 program capstone** | 🛑 POSTPONED |

## 9. Used vocabulary terms (running list — check before adding new terms)

**Batch 1 (Days 1–10):** Conciseness, Audience awareness, Filler words,
Active listening, Elevator pitch, PREP framework, Purchase order, Tendering,
Supplier evaluation, Requisition, Lead time, Procurement plan, Inventory
turnover, Stock reconciliation, Dispatch, Distribution, Buffer stock, Supply
chain visibility, Donor compliance, Accountability, Audit-ready
documentation, Programme support, Needs assessment, Beneficiary, Accounts
payable, Accounts receivable, Budget variance, Financial controls, General
ledger, Bank reconciliation, Reorder point, Bin card, Cycle count, Stock
write-off, Warehouse layout, FIFO (First-In, First-Out), Audit trail,
Internal controls, Supporting documentation, Compliance, Journal entry,
Chart of accounts, Agenda, Action item, Follow-up, Consensus, Escalation,
Stakeholder alignment, Service level agreement, Supplier performance,
Contract compliance, Grace period, Goodwill, Relationship management,
Professional presence, Concise reporting, Follow-through. (57 terms)

**Batch 2 (Days 11–20):** Rapport, Tone of voice, Paraphrasing, Body
language, Open-ended question, Closed-ended question, Framework agreement,
Direct/sole-source procurement, Bid evaluation criteria, Procurement
threshold, Vendor pre-qualification, Value for money, Last-mile delivery,
Transport modality, Customs clearance, Cold chain, Freight forwarder,
Consignment, Do no harm, Targeting criteria, Cash-based transfer,
Post-distribution monitoring, Grant agreement, Burn rate, Cash flow,
Accrual accounting, Fixed asset, Depreciation, Cost allocation, Petty cash,
Pick list, Goods received note, Perishable goods handling, Stock aging,
Consolidation (warehousing), Put-away process, Segregation of duties,
Sampling (audit), Red flag (audit), Reconciliation statement, Approval
matrix, Non-compliance, Minutes (meeting minutes), Facilitation,
Groupthink, Devil's advocate, Handover, Cross-functional team, Negotiation,
Leverage (negotiation), Win-win outcome, Vendor lock-in, Due diligence,
Trust deficit, Self-assessment, Communication gap, Momentum
(habit-building). (57 terms)

**Batch 3 (Days 21–30):** Storytelling (professional), Executive summary,
Signposting, Vocal variety, Strategic pause, Perceived confidence,
Incoterms, Local purchase order (LPO), Emergency procurement, Procurement
committee, Conflict of interest, Market survey, Waybill, Demurrage, Load
planning, Fleet management, Route optimization, Proof of delivery, Logframe
(logical framework), Indicator (M&E), Baseline (M&E), Complaints and
feedback mechanism, Duty of care, No-cost extension, Cost center, Unit
cost, Exchange rate gain/loss, Advance (financial), Financial statement,
Ineligible expenditure, Warehouse capacity, Stock-out, Slow-moving stock,
Physical inventory count, Inventory valuation, Loading dock, External
audit, Internal audit, Management letter, Corrective action plan,
Materiality (audit), Whistleblower policy, Delegation, Constructive
feedback, Accountability partner, Time-boxing, Parking lot (meeting
technique), Psychological safety, Stakeholder mapping, Key account
management, Renewal (contract), Penalty clause, Terms of reference (ToR),
Expectation management, Synthesis, Transferable skill, Readiness.
(57 terms)

**Batch 4 (Days 31–40):** STAR framework, Framing (communication), Active
voice, Redundancy (communication), Precision (word choice), De-escalation
(language), Request for proposal (RFP), Request for quotation (RFQ), Total
cost of ownership, Supplier diversification, Warranty terms, Procurement
risk, Cross-docking, Third-party logistics (3PL), Supply chain resilience,
Transit time, Bill of lading, Backhaul, Localization (humanitarian),
Protection mainstreaming, Sphere standards, Multi-sectoral response, Exit
strategy (programme), Sustainability (programme), Financial forecasting,
Cash flow forecast, Break-even point, Overhead cost, Restricted funds,
Unrestricted funds, Just-in-time (JIT) inventory, Economic order quantity,
Barcode/asset tagging, Damage claim, Warehouse management system (WMS),
Kitting, Fraud triangle, Forensic accounting, Anti-corruption policy, Risk
register, Records retention policy, Zero-tolerance policy, Conflict
resolution, Mediation, One-on-one (meeting), Team charter, Blameless
post-mortem, Constructive dissent, Supplier scorecard, Force majeure,
Exclusivity clause, Onboarding (supplier/partner), Referral, Reputation
risk, Ambiguity tolerance, Composure, Growth mindset. (57 terms)

**Batch 5 (Days 41–50):** Anchoring (communication), Call to action, Empathy
statement, Common ground, Question stacking, Verbal tic, Aggregated demand,
Specification (procurement), Reverse auction, Consortium purchasing,
Ethical sourcing, Supplier code of conduct, Milk run, Modal shift, Dunnage,
Reverse logistics, Supply chain mapping, Chain of custody, Accountability
to affected populations (AAP), Conflict sensitivity, Cluster system, Early
warning system, Response plan, Humanitarian access, Cost driver,
Zero-based budgeting, Multi-year budgeting, Provision (accounting),
Statutory reporting, Grant budget, Obsolescence, Vendor-managed inventory,
Stock rotation, Pallet, Warehouse audit, Shrinkage, Compliance calendar,
Data protection, Confidentiality agreement, Ethics hotline, Audit finding,
Control environment, Standup meeting, Retrospective, Async communication,
Meeting cadence, RACI matrix, Sidebar conversation, Escrow, Letter of
intent, Non-disclosure agreement (NDA), Dispute resolution clause, Vendor
rationalization, Preferred supplier status, Skill consolidation, Plateau
(learning), Deliberate practice. (57 terms)

**Batch 6 (Days 51–60):** Persuasion (professional), Rhetorical question,
Analogy, Register (language), Bottom line up front (BLUF), Cognitive load,
Procurement audit, Bid rigging, Debarment, Call-off order, Spend analysis,
Tail spend, Consignee, Consignor, Detention (transport), Multimodal
transport, Transport insurance, Landed cost, Triangulation (data),
Beneficiary registration, Double-dipping (aid), Referral pathway
(humanitarian), Surge capacity, Contextual analysis, Working capital,
Liquidity, Solvency, Budget holder, Financial year-end close, Cost
recovery, LIFO (Last-In, First-Out), Minimum order quantity (MOQ),
Inventory carrying cost, Bulk storage, Fixed-location storage,
Random-location storage, Audit opinion, Qualified opinion, Compliance
testing, Walkthrough (audit), Governance (organizational), Assurance,
Executive presence, Stakeholder briefing, Pre-read (meeting), Decision
log, Upward communication, Downward communication, BATNA (Best Alternative
to a Negotiated Agreement), Anchoring (negotiation), Concession
(negotiation), Multi-party negotiation, Contract amendment, Vendor exit
plan, Spontaneity (speaking), Gravitas, Calibration (self-assessment).
(57 terms)

**Total so far: 342 unique terms across Days 1–60 — the entire Foundation
and Development phases.** Validated with zero collisions by
`validateCurriculum.js`, and independently re-verified by a separate
script. **Batches 7–9 (Days 61–90, the Advanced phase) are postponed** per
the user's decision in Batch 6's session to move to deployment — see
PROJECT_CONTINUATION.md §11 for the documented, resumable roadmap.

**Framework note (Batch 4):** STAR and Problem→Cause→Solution are now in
active use alongside PREP and the ad-hoc structures established in the
Foundation phase (Headline→Detail→Next Step, Acknowledge→Clarify→Propose,
Problem→Cause→Update, etc.). 17 distinct framework/structure labels are in
use across Days 1–40. Development-phase readings are also measurably
longer than Foundation-phase readings (290 words average → 384 words
average in Batch 4), confirming the phase-4 rule change actually shows up
in the content, not just in the plan.

## 10. Batch authoring log

| Batch | Days | Status | Date |
|---|---|---|---|
| 1 | 1–10 | ✅ Complete, validated | 2026-08-22 |
| 2 | 11–20 | ✅ Complete, validated | 2026-08-23 |
| 3 | 21–30 | ✅ Complete, validated — **Foundation phase done** | 2026-08-23 |
| 4 | 31–40 | ✅ Complete, validated — **STAR + Problem-Cause-Solution introduced** | 2026-08-24 |
| 5 | 41–50 | ✅ Complete, validated | 2026-08-25 |
| 6 | 51–60 | ✅ Complete, validated — **Development phase done, Day 60 = phase capstone** | 2026-08-26 |
| 7 | 61–70 | 🛑 **POSTPONED** — see PROJECT_CONTINUATION.md §11 | — |
| 8 | 71–80 | 🛑 **POSTPONED** — see PROJECT_CONTINUATION.md §11 | — |
| 9 | 81–90 | 🛑 **POSTPONED** — see PROJECT_CONTINUATION.md §11 | — |
| 4 | 31–40 | ⬜ Not started | — |
| 5 | 41–50 | ⬜ Not started | — |
| 6 | 51–60 | ⬜ Not started | — |
| 7 | 61–70 | ⬜ Not started | — |
| 8 | 71–80 | ⬜ Not started | — |
| 9 | 81–90 | ⬜ Not started | — |
