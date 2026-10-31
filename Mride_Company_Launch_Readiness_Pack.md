# Mride Zambia — Company Launch Readiness Pack

**Working document · 25 October 2026**

> This is an operational planning pack, not legal advice, a certificate of incorporation, a licence, an insurance policy, or a government filing. Company owners must confirm current requirements, fees, forms and deadlines directly with the relevant Zambian authorities and qualified local advisers before launch. Do not represent the preview application as a live transport or payment service.

## 1. Company and service profile

- **Proposed brand:** Mride
- **Tagline:** Your ride. Your way.
- **Initial market:** Lusaka, Zambia
- **Currency:** Zambian Kwacha (ZMW)
- **Services shown in the current preview:** rides, cargo, food and local market
- **Operating status:** software preview with demo records; production dispatch, payment processing, driver tracking and regulatory approvals are not established by this repository.

Before public launch, confirm the legal entity name and brand availability, register the entity, set up official company records, and document ownership, directors, registered office, decision authority and delegated signing limits.

## 2. Readiness checklist

### Corporate, tax and finance

- [ ] Confirm the company structure and register with the **Patents and Companies Registration Agency (PACRA)**.
- [ ] Confirm beneficial ownership, annual return, registered-office and statutory-record obligations.
- [ ] Obtain the required **Zambia Revenue Authority (ZRA)** registrations and confirm income tax, VAT, withholding and any other applicable obligations with a tax adviser.
- [ ] Open a company bank account and maintain separation between company, driver, merchant and customer funds.
- [ ] Agree an accounting method, reconciliation schedule, invoice/receipt process, expense approvals and record-retention policy.
- [ ] Obtain written advice on the treatment of fares, platform commissions, refunds, cash collections and marketplace settlements.

### Transport, drivers and vehicles

- [ ] Ask the **Road Transport and Safety Agency (RTSA)** and local counsel to confirm the permits, operator approvals, passenger-service rules and vehicle categories required for each service and city.
- [ ] Verify driver identity, licence class, any required professional/PSV credentials, eligibility, references and emergency contact.
- [ ] Verify vehicle ownership/authorisation, inspection/fitness, registration, passenger capacity and required commercial/passenger insurance before activation.
- [ ] Define onboarding, document expiry alerts, vehicle inspection, suspension, appeal and re-verification procedures.
- [ ] Confirm whether motorcycle passenger services are permitted before enabling them; do not infer approval from parcel delivery permission.
- [ ] Obtain broker/legal review of motor, passenger, goods-in-transit, employer and public-liability cover as applicable.

### Privacy, safety and customer support

- [ ] Have a Zambian privacy professional review the **Data Protection Act, 2021**, the role of the Office of the Data Protection Commissioner, registration/notification obligations and cross-border processing.
- [ ] Publish a privacy notice explaining precise-location collection, purpose, retention, sharing, access requests and deletion/contact channels.
- [ ] Minimise location collection; restrict access; define retention and incident-response procedures; never expose customer or driver contact details in public UI.
- [ ] Write passenger and driver safety procedures, emergency escalation, incident reporting, lost-property handling, trip cancellation and safeguarding guidance.
- [ ] Provide a staffed support channel, response-time target, complaint case log, escalation owner and refunds/chargeback workflow.
- [ ] Have local counsel review platform terms, driver/merchant agreements, consumer disclosures, cancellation/refund rules and liability language before publication.

### Payments and marketplace operations

- [ ] Contract with an appropriately authorised bank/payment service provider; verify the status, permitted activity and current terms of every mobile-money integration.
- [ ] Keep card/mobile-money credentials out of this frontend. Use provider-hosted or backend-mediated flows and never store payment secrets in browser storage.
- [ ] Document fare disclosure, negotiated offers, driver acceptance, cancellation charges, payment confirmation, settlement timing, reconciliation and dispute handling.
- [ ] Obtain written merchant agreements covering catalogue accuracy, food safety/allergens, delivery handoff, refunds and settlement.
- [ ] Obtain cargo terms covering declared goods, prohibited items, packaging, proof of collection/delivery, loss/damage claims, porter charges and insurance.

## 3. Minimum operating controls before pilot

1. Named accountable owners for transport compliance, customer safety, privacy, finance and incident response.
2. A documented service area and operating hours; no unapproved city or vehicle type.
3. Manual fallback for outages, emergency escalation and booking reconciliation.
4. Driver and merchant verification before operational access.
5. Tested end-to-end booking, cancellation, support, refund and data-deletion procedures.
6. A small, controlled pilot with written participant consent, incident logging and a stop/go review.
7. Production backend with authenticated roles, server-side validation, transactional booking acceptance, audit records, backups and monitoring.
8. Security and privacy review before storing real identity documents, precise location, payment or trip-history data.

## 4. Draft policy documents to commission

These are document names for a counsel-led drafting process, not completed legal instruments:

- Company constitution/articles and shareholder/director resolutions
- Passenger Terms of Service and Privacy Notice
- Driver Partner Agreement and Driver Safety Handbook
- Merchant/Restaurant Partner Agreement and food/allergen handling process
- Cargo Transporter Agreement and Goods-in-Transit terms
- Fare, cancellation, refund and payment disclosure
- Data retention and deletion schedule
- Safety, safeguarding, emergency and serious-incident response procedure
- Complaints, lost-property, accessibility and service-animal procedures
- Business continuity, cyber incident response and disaster recovery plan
- Employee/contractor agreements, code of conduct and workplace safety process

## 5. Decision and approval record template

| Field | Record |
|---|---|
| Decision / policy | |
| Business owner | |
| Legal / regulatory reviewer | |
| Version and effective date | |
| Cities and service categories covered | |
| Risks and mitigations | |
| Approving director(s) | |
| Next review date | |

## 6. External dependencies in the software preview

- The interactive map uses OpenStreetMap tiles, public Nominatim place search and the public OSRM demonstration route service. Their availability, rate limits, terms and suitability are not guaranteed for a commercial production service. Confirm provider terms and select a supported production geocoding/routing arrangement before launch.
- Browser GPS in the driver preview requires user permission and a secure context. The current local location channel works only in same-origin preview tabs; it is not authenticated, persistent, multi-device dispatch.
- Browser voice uses local text-to-speech and can only speak while the driver interface is active and the browser permits it.
- Booking acceptance, bid lists, payments, live tracking and admin changes currently include preview/demo behavior. The browser-storage CMS is not a multi-user publishing system and is not protected by admin authentication.

**Prepared for planning; review and replace this document with advice specific to the registered company and its actual operating model.**
