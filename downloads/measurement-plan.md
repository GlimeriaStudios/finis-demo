# Measurement plan and acceptance tests

Market: Sweden. Language: Swedish. Currency: SEK. Timezone: Europe/Stockholm.

Status: implementation specification; no property or account created. All identifiers must come from the organisation-owned accounts. Do not send financial or personally identifying data to GA4.

| Event | Trigger | Safe parameters | Conversion role |
|---|---|---|---|
| page_view | Public-page route viewed after analytics opt-in | canonical page path without query or fragment | Diagnostic |
| view_pricing | Pricing section visibly opened | offer_id | Diagnostic |
| select_plan | User selects monthly or year-end | offer_id, location_id | Diagnostic |
| form_start | First interaction with enquiry form | form_id, offer_id | Diagnostic |
| generate_lead | Server confirms valid enquiry persisted; once per submission | form_id, offer_id, random event_id | Secondary until quality established |
| qualify_lead | CRM confirms service fit and genuine prospect | random lead reference, offer_id; only consented integration | Initial primary Ads conversion |
| sign_up | Actual account created; not clicking a CTA | offer_id, method | Secondary |
| trial_activated | Customer completes defined onboarding milestone | offer_id | Secondary; no invented revenue |
| purchase | Confirmed collected payment | opaque transaction_id, currency SEK, collected net/gross convention documented, value | Primary when reliable |
| refund | Confirmed refund tied to transaction | transaction_id, currency, value | Revenue correction |

No names, email addresses, telephone numbers, freeform messages, company tax identifiers, financial record text, bank account details or uploaded filenames in event parameters. A random identifier remains potentially personal data in context; minimise it and enforce appropriate retention/access. Never place customer IDs or email addresses in URLs. Payment revenue refers to the service subscription, not the customer's business transactions.

GA4 account configuration: organisation ownership; SEK; Europe/Stockholm; document owner/admin roles; exclude internal/debug traffic appropriately; disable unwanted automatic form interactions if they duplicate custom events; review data retention and Google signals/advertising settings; leave optional advertising personalisation off unless justified and consented. Decide one primary Ads conversion source for each business outcome. Use supported consented offline-conversion integration only after CRM and click attribution are implemented and reviewed.

Use a fixed UTM vocabulary: utm_source=google, utm_medium=cpc, utm_campaign=se_bokforing_search or se_bokslut_search, and utm_content as an internal creative code. Do not put personal data in UTMs. Prefer Ads auto-tagging and a reviewed attribution pipeline where available. Preserve campaign attribution across public conversion steps only according to consent choices. Do not treat UTMs as proof of incrementality.

Acceptance tests before go-live:

1. Fresh browser with no choice: no GA/Ads script fetch, cookies or tracking requests. Essential application requests may work.
2. Reject all: no GA/Ads requests on every public route and after reload.
3. Analytics only: GA4 diagnostic event reaches DebugView; Ads tags and advertising consent remain denied.
4. Marketing opt-in: intended conversion reaches the correct test account/action exactly once.
5. Withdrawal: stop subsequent tracking and clear relevant locally controlled optional cookies; reload safely where necessary. Document third-party limitations honestly.
6. Invalid form: no lead conversion. Successful server persistence: exactly one lead. Repeated refresh: no duplicate lead.
7. Payment decline or trial signup: no purchase revenue. Payment success: one transaction; retry/webhook duplicate does not duplicate revenue. Refund corrects revenue.
8. Inspect network payloads for email, company name, bank/tax information and freeform text; none may be present. Verify query-string redaction.
9. Authenticated ledger/document screens: no public marketing measurement unless separately reviewed and intentionally enabled.
10. Link tests, consent tests and GA4 realtime/DebugView checks must be recorded with date, tester and result. Missing IDs means integration is unconfigured, not validated.

Weekly dashboard: eligible public sessions, consent rate, pricing views, valid leads, qualified leads, activated trials, first paid customers, retained customers, paid revenue, refund rate, media and fully loaded CAC, contribution after service labour, onboarding hours and response time. Report monthly/year-end offers and traffic channels separately. Conversion windows mean recent cohorts are incomplete.

Sources: [GA4 setup](https://support.google.com/analytics/answer/14183469?hl=en), [Google consent mode](https://developers.google.com/tag-platform/security/guides/consent), [PTS cookie rules](https://www.pts.se/internet-och-telefoni/kakor-cookies/) and [IMY consent](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/rattslig-grund/samtycke/).

Swedish consent controls: Acceptera alla / Avvisa valfria / Inställningar; separate Statistik and Marknadsföring. PTS rules govern non-necessary cookie consent; no UK statistical exception is assumed. Never send personnummer or organisationsnummer associated with identifiable sole traders to analytics. Swedish customer-facing service prices remain TBD; original GBP references are not revenue values.
