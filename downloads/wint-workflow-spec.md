# Wint-informed workflow specification

Research date: 13 October 2026. This document separates **Advertised** facts from **Proposed** original requirements for a Swedish AB product. Requirements, states, controls and test cases are our engineering recommendations; they are not claims about Wint internals or implemented functionality.

Only public official pages were examined. Wint's demo landing page requires details for access and expressly describes its demo as a small subset. No form was submitted, account created, private application accessed or sales contact initiated. An exact software replica cannot be specified from this evidence. [Official demo description](https://www.wint.se/signup/testa-wints-granssnitt-sa-enkel-kan-din-bokforing-bli)

This Swedish version supersedes the archived original. The proposed commercial display is SEK2,645/month after three free months and SEK7,935 one-time, preserving the original £200/£600 economic basis using the ECB 13 October 2026 reference calculation. Final contractual SEK prices and VAT treatment remain undecided; see `market-research.md`. These prices are not an accounting-system exchange rate or an approved checkout configuration.

## 1. Shared workflow foundation

**Proposed:** Model each business as an isolated tenant with entity, financial year, currency, accounting policy, authorised users and integrations. Distinguish employee, owner, bookkeeper, reviewer and payment approver permissions. An action inbox should reference source records rather than maintain disconnected copies: amount, reason, due date, responsible person, requested action and evidence.

Use separate workflow states and accounting states. An approved bill may remain unpaid; a payment can settle before a document has been categorised. Completing a task must not pretend either downstream event occurred. Each transition records actor, timestamp, old/new state and version. Concurrent edits require a conflict response, not silent overwriting.

Acceptance: an employee cannot inspect another tenant's record by changing its URL; an approval survives refresh; a failed API request leaves the prior state intact; an inbox item cannot be completed twice to trigger duplicate posting.

**Swedish foundation, proposed:** Default to Swedish language, SEK amounts in integer öre, Europe/Stockholm dates, organisationsnummer and separate bank/skattekonto balances. Store currency explicitly even in an SEK-only release. Map journals to a reviewed, versioned BAS chart, preserving imported account mappings rather than renumbering history. BAS publishes a 2026 chart; using BAS is a design choice and does not itself certify compliant accounts. [BAS charts](https://www.bas.se/kontoplaner/)

Offer BankID only after a genuine provider agreement and verified integration. Identity authentication is separate from authority to act for an AB, approve a payment or sign a document. BankID's business guidance describes a contractual onboarding route; a branded button is not that integration. [BankID business service](https://www.bankid.com/foretag/tjansten)

## 2. Invoice lifecycle and revenue recognition

**Advertised:** Wint supports allocating invoice income to a date interval for a multi-month project. This is more than issuing a PDF: it affects the period in which revenue appears. [Revenue allocation FAQ](https://www.wint.se/faq-fraga/jag-jobbar-med-langvariga-projekt-kan-jag-periodisera-mina-kundfakturor)

**Proposed:** Maintain customer records, draft lines, currency, tax treatment, supply date, issue date, due date, project and optional service interval. Validate totals using decimal arithmetic. Require a preview before issue, allocate an immutable invoice number once, preserve the issued document, and record delivery attempts independently.

Suggested lifecycle: draft → approved → issued; delivery may be pending, delivered or failed; settlement may be unpaid, partial, paid or overpaid. Credits and write-offs are linked accounting events, not edits to issued history. A recurring schedule generates a new draft with its own period key; retrying a scheduled job must not produce another invoice.

Revenue allocation should create an explicit schedule whose rounded portions equal the original net amount. Changing it after period close requires controlled adjustment. Collection status and recognised revenue must remain separate.

Acceptance: repeated issue requests create one invoice; a bounced email does not undo the ledger entry; a partial credit reduces receivable correctly; a February-crossing service interval allocates exactly; duplicate recurring-job execution produces one draft; a zero-value invoice follows an explicit policy.

## 3. Receivables, matching and collections

**Advertised:** Wint checks customer payments against the bank account and notifies the business when an invoice passes its due date unpaid; the business can decide how to pursue it. [Payment-status FAQ](https://www.wint.se/faq-fraga/hur-ser-jag-att-mina-kunder-har-betalat)

**Proposed:** Import immutable bank events with provider identifier, booking/value dates, amount, currency and source account. Keep raw bank data separate from accounting classifications. Suggest matches using reference, currency, amount and counterparty, exposing why the candidate was selected. Never infer customer identity solely from a common name.

Support one payment covering several invoices, several payments covering one invoice, fees withheld, refunds, chargebacks and overpayments. Unmatching must reverse the relationship without deleting bank evidence. Reconciliation compares opening balance plus movements to statement closing balance, with an unresolved difference shown clearly.

Reminders require an enabled policy and eligible invoice state; pause on dispute, promised payment or unreliable feed. Preserve delivery history and allow a human to stop escalation. Bank-feed delay must not be described as customer nonpayment.

Acceptance: importing the same provider event twice creates one record; a SEK10,000 payment can settle SEK6,000 and SEK4,000 invoices; a refund reopens the appropriate balance; changing the timezone does not make a not-yet-due invoice overdue; lost bank consent shows a stale-data warning.

## 4. Receipts and reimbursement

**Advertised:** A designated receipt-responsible role can approve employee receipts before Wint books and reimburses them. [Receipt approval FAQ](https://www.wint.se/faq-fraga/far-jag-godkanna-mina-anstalldas-kvitton-innan-de-blir-utbetalda)

**Proposed:** A claim contains original evidence, employee, merchant, transaction date, currency, gross/tax amounts, business purpose, payment method and project. OCR outputs are suggestions with confidence and provenance. Preserve the original file when a user corrects extracted fields.

Workflow: draft → submitted → needs information/approved/rejected → posted → reimbursement pending → reimbursed. Company-card purchases must not generate employee reimbursement. Detect repeat files and probable duplicates across differing image crops using merchant/date/amount signals, then request review rather than silently deleting evidence.

Acceptance: claimant cannot approve their own claim where policy forbids it; a rejected claim needs a reason; editing the amount after approval invalidates approval; missing evidence cannot masquerade as attached; a failed payout remains pending/failed; reimbursement retries use one payment identity.

## 5. Supplier bills and approval chains

**Advertised:** Wint gives a new supplier invoice address and assists customers in notifying suppliers. Sequential approval chains lead to a final approver before payment and bookkeeping. [Bill intake FAQ](https://www.wint.se/faq-fraga/hur-kommer-fakturor-in-till-wint-), [Approval-chain FAQ](https://www.wint.se/faq-fraga/jag-vill-att-mina-anstallda-ska-attestera-sina-inkop-funkar-det)

**Proposed:** Intake accepts controlled uploads or a verified dedicated mailbox. Quarantine unsupported/unsafe files; store extraction errors and original attachments. Compare supplier, invoice number and total against earlier bills. Separate expense allocation approval from bank payment approval.

Approval rules should specify thresholds, departments, substitutions and final authority. Changes to payee account, amount or currency after approval reset the affected approvals. Recurring-bill automation needs an explicit rule, maximum amount, expiry and exceptions; a near match is not enough to approve automatically.

Acceptance: a substitute approver operates only during delegation dates; a departed employee cannot block the queue indefinitely; a forged email cannot change supplier bank details; insufficient funds creates a visible payment failure; a credit note can offset the original bill; two approvers acting concurrently cannot release two payments.

## 6. Time, projects and payroll

**Advertised:** Reported hours can generate a Wint invoice draft for review and adjustment. Wint also advertises flexible salary withdrawals with associated Swedish tax and accounting handling. These are separate capabilities, not independent verification of payroll execution. [Time-to-invoice FAQ](https://www.wint.se/faq-fraga/kan-jag-fakturera-direkt-fran-tidrapporteringen), [Flexible pay FAQ](https://www.wint.se/faq-fraga/kan-jag-ta-ut-lon-nar-jag-vill-med-wint)

**Proposed:** A time entry stores employee, project, date, duration, activity, billable flag and rate version. Submitted timesheets lock until rejected or recalled. Approval creates invoice candidates, not immediate customer charges. Each billed entry links to one invoice allocation, including deliberate partial billing. Keep payroll hours separate from billable hours.

A Swedish payroll integration needs employee identity and employment dates, pay frequency, applicable withholding instructions, employer contributions, benefits, leave, absence, pensions and current Swedish rules. AGI preparation must use the actual Skatteverket reporting period and authorised representative. Preparation, approval, tax submission and bank payment are separate statuses. The interface must identify the payroll provider and show accepted/rejected submission receipts.

Acceptance: overlapping time is flagged; changing a rate affects future work unless explicitly adjusted; an amended billed timesheet creates an adjustment rather than double billing; payroll approval shows net pay and employer total; a leaver's final run remains reproducible; late adjustments cannot silently mutate an already-filed run.

**Official Swedish constraints:** AGI must use the actual reporting period, representative permissions and submission acknowledgement; a registered employer may need a zero declaration. Employer contribution rules vary with circumstances and effective dates, so do not hardcode one percentage for every employee. [Skatteverket AGI](https://www.skatteverket.se/foretag/arbetsgivare/lamnaarbetsgivardeklaration.4.41f1c61d16193087d7fcaeb.html), [Employer contributions](https://www.skatteverket.se/foretag/arbetsgivare/arbetsgivaravgifterochskatteavdrag/arbetsgivaravgifter.4.233f91f71260075abe8800020817.html)

## 7. Year end and reporting

**Advertised:** Wint files annual work after customer approval; its K3 year-end work carries an additional charge. This illustrates why “everything included” requires scope detail. [Annual approval FAQ](https://www.wint.se/faq-fraga/hur-snabbt-kan-jag-lamna-in-min-arsredovisning), [K3 scope FAQ](https://www.wint.se/faq-fraga/hanterar-ni-k3)

**Proposed:** Start year end with a readiness checklist: bank reconciliation, receivables/payables, fixed assets, loans, payroll liabilities, missing documents and prior-year balances. Assign outstanding questions and show whether each blocks completion. Report totals must drill into journal lines and source evidence.

Choose the eligible, financial-year-specific K2 or K3 rules and freeze a versioned trial balance for preparation. Draft bokslut, årsredovisning, tax computations and INK2 documents require professional review and the appropriate board/signatory approvals. Approval attaches to exact document hashes/versions; any material revision requires renewed approval. Bolagsverket annual-report submission and Skatteverket INK2 submission are separate workflows, complete only when the respective authority returns verifiable acknowledgement. Tax payment deadlines remain separate from filing deadlines.

Acceptance: unbalanced journals cannot post; a late invoice in a locked period requires a controlled adjustment; regenerated documents revoke obsolete approval; one authority accepting a return does not mark every filing complete; exported reports reproduce the same balances and period filters; reopening a year produces a recorded reason.

**Official Swedish constraints:** Annual-report timing is tied to the general meeting and the seven-month year-end limit. K2/K3 eligibility and rule versions must be checked for the financial year; not every small AB qualifies for K2. INK2 and owner K10 work must remain distinct services. [Bolagsverket annual reports](https://bolagsverket.se/foretag/aktiebolag/arsredovisningforaktiebolag.759.html), [BFN current frameworks](https://www.bfn.se/redovisningsregler/vagledningar/k-regelverk/), [Skatteverket AB declaration](https://www.skatteverket.se/foretag/inkomstdeklaration/deklareraatettaktiebolagellerenekonomiskforening.4.46ae6b26141980f1e2d1261.html)

**VAT, proposed:** Store registered VAT period and accounting method. Support reviewable momskoder, eligible input VAT and separately represented VAT liabilities. A 25% example is only an illustration, not a classifier for every purchase. Retain declaration versions and reconcile the skattekonto payment separately. Never convert a dashboard estimate directly into a claimed accepted declaration. [Skatteverket VAT timing](https://www.skatteverket.se/foretag/moms/deklareramoms/narskajagdeklareramoms.4.6d02084411db6e252fe80008988.html)

## 8. Support, advice and accountability

**Advertised:** Wint explicitly describes specialist-team support instead of assigning one economist to every customer question. A dedicated personal accountant is therefore not an established Wint-parity requirement. [Support operating-model FAQ](https://www.wint.se/faq-fraga/varfor-far-jag-ingen-kontaktperson-hos-wint)

**Proposed:** Tickets link to the relevant record, use a category and severity, and expose a responsible team plus next update. Distinguish requests for accounting treatment, product defects, payment incidents and commercial changes. Customer-visible conversation must remain separate from internal notes.

Offer a named relationship owner only if staffing and pricing support it. Automated answers should indicate their status and escalate tax judgments to qualified review. Track resolution and reopened cases rather than treating a sent reply as success.

Acceptance: employees cannot view confidential director tax questions; sensitive attachments require appropriate access; reassignment preserves history; approaching filing deadlines elevate priority; a software outage cannot falsely close a customer's issue; offboarding includes unresolved matters and evidence export.

## 9. Migration and company formation

**Advertised:** Wint imports prior bookkeeping through SIE files and quotes separately for required catch-up work. Its formation offer supplies an already established Swedish company under stated conditions. [Migration FAQ](https://www.wint.se/faq-fraga/hur-flyttar-jag-over-min-gamla-bokforing-till-wint), [Formation offering](https://www.wint.se/for-vem/starta-bolag)

**Proposed:** Swedish migration should inventory source ledgers, attachments, tax records and outstanding balances; stage import; map BAS accounts and dimensions; reconcile totals; obtain review; then choose a cutover date. An import must be reversible before adoption. Contacting an incumbent requires the customer's authority. A CSV upload is not equivalent to importing a complete accounting history.

Formation should be a separate eligibility and authorised-provider workflow: identity checks, proposed entity details, directors/ownership, addresses, consent, fees and evidence of registration. Do not show “company created” from a local form submission. Separate bank application from bank approval.

Acceptance: duplicate imports are detected; failed row mappings produce a downloadable report; balances reconcile before activation; historical attachments remain attributable; rejected formation requests preserve reasons; statutory and service fees are distinguishable; no invented organisationsnummer is issued.

## 10. Accounting partners and estate-agent vertical

**Advertised:** Wint's partner models split relationship/advisory work from routine delivery. Its estate-agent offer addresses deposits and commissions. Neither page establishes permissions or contracts for the new provider. [Partner models](https://www.wint.se/redovisningsbyraer), [Estate-agent offering](https://www.wint.se/for-vem/fastighetsmaklare)

**Proposed partner requirements:** Maintain client consent, assigned firm, access scope, delivery responsibilities, referral attribution and fee agreement. A partner portal should show only authorised clients and distinguish financial review from marketing referrals. Removing a relationship must revoke access without corrupting retained records.

**Proposed estate requirements:** Treat each property transaction as a case with parties, milestones, deposit instructions and commission rules. Client funds and business revenue need distinct handling. No deposit release should follow merely from an invoice checkbox; it needs the actual legal/provider workflow and authorised evidence. Start with a research-only vertical until specialist delivery and permissions exist.

Acceptance: a revoked partner loses access immediately; reassignment preserves client history; a commission split totals correctly; a cancelled sale reverses the appropriate accrual; beneficiary changes require renewed review; an incomplete completion event blocks deposit release.

## 11. Prioritisation and release evidence

Phase one should prove one coherent service-business journey: customer creation → invoice → evidence-backed payment match → report; and receipt → review → expense record. Add a transparent task inbox, exports and support history. A local prototype may demonstrate those states but must clearly identify sample data and simulated integrations.

Phase two adds secure tenant persistence, genuine identity and document controls, qualified accounting review, migration and live integration sandboxes. Phase three adds production bank connectivity, filing, payroll and approved payments, each independently verified. Formation, partner operations and client-money verticals are separate operational launches.

For every release record: expected result, observed result, test data, environment and remaining limitation. Prioritise duplicate-event handling, permission boundaries, reversals, period locks and external failure recovery. A polished success screen is not evidence of settlement, submission or statutory compliance.

## 12. Swedish operational gates

**Official context:** Professional bookkeeping services can trigger registration in the anti-money-laundering register; the actual operator must establish its obligations before onboarding live clients. Bank-account information and payment initiation require an appropriate permitted operating model. [Bolagsverket AML register](https://bolagsverket.se/omoss/flerverksamheter/registretmotpenningtvatt.2557.html), [Finansinspektionen payment services](https://www.fi.se/sv/betalningar/sok-tillstand/betaltjanster/)

**Proposed:** Keep customer due diligence, beneficial-owner evidence, engagements, risk review and access permissions in secure operational systems. Do not expose personal identity numbers or financial documents to marketing analytics. Verify data-processing contracts, retention controls, secure backups and restore procedures. BFN's retention guidance uses seven years after the calendar year in which the financial year ends and imposes safeguards on digital transfers; storage deletion policy must account for this. [BFN archiving](https://www.bfn.se/fragor-och-svar/arkivering/)

Before live release, test SIE round trips, BAS mapping, SEK rounding, Swedish invoice corrections, AGI rejection/retry and separate Bolagsverket/Skatteverket acknowledgements with qualified Swedish accounting review. All external actions remain disabled until the real entity, providers, authorisations and operational staff are established.

