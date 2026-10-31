# MMDrive — Comprehensive Operating Costs & Infrastructure Architecture (Zambia)

> **Document Version:** 1.0.0  
> **Currency:** Zambian Kwacha (ZMW) & US Dollar (USD)  
> **Exchange Rate Baseline:** ~1 USD = 27 ZMW (Indicative Bank of Zambia rate)  
> **Applicable Regulations:** ZICTA Data Protection Act, RTSA Public Service Vehicle (PSV) regulations, ZRA Smart Invoice (VIMS)

---

## Executive Summary

MMDrive operates as a high-volume, low-margin multi-service digital platform. Keeping operational expenditure (OpEx) sustainable requires a hybrid cloud model: utilizing generous cloud free-tiers and OpenStreetMap routing during the initial launch, while establishing direct or aggregated Mobile Money APIs with MTN Zambia and Airtel Money Zambia.

---

## 1. Cloud Backend & Database Infrastructure

### Option A: Google Cloud / Firebase (Recommended for Initial Launch & Stage 4)
* **Hosting & CDN:** Firebase Hosting (Free Tier up to 10 GB storage / 360 MB/day transfer).
* **Cloud Firestore:**
  - *Free Tier:* 50,000 reads, 20,000 writes, 20,000 deletes daily; 1 GB stored data.
  - *Blaze Tier (Pay as you go):* $0.06 per 100,000 reads, $0.18 per 100,000 writes.
* **Cloud Functions (Server-side validation & price locks):**
  - *Free Tier:* 2 million invocations/month.
  - *Overage:* $0.40 per 1 million invocations.
* **Firebase Authentication:**
  - Email/Password & Anonymous: Free and unlimited.
  - Phone OTP (via Google Identity): 10,000 free verifications/month globally (rates vary by country; Zambia SMS via Google Identity costs ~$0.06 / ZMW 1.62 per SMS if not using local gateway).

### Option B: AWS Africa (Cape Town `af-south-1`)
* Low network latency to Zambia (<40ms via Liquid Intelligent Technologies / CEC Liquid Telecom fibre backbones).
* EC2 `t4g.small` ARM instance: ~$14.50/month (~ZMW 390/month).
* RDS PostgreSQL `db.t4g.micro`: ~$18/month (~ZMW 485/month).

---

## 2. Zambian Telecom & Mobile Money Integration Costs

MMDrive supports cash upon arrival and prepares for direct integration with **MTN MoMo API** and **Airtel Money OpenAPI**, as well as licensed Zambian fintech aggregators (such as Flutterwave, Kazang, Cellulant, or Lipila).

| Payment Channel | Setup / Access Fee | Transaction Processing Fee | Settlement Time | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Cash Settlement** | ZMW 0 | 0% (Driver collects full fare; MMDrive deducts commission from driver wallet) | Instant | Primary launch method across Zambian cities |
| **MTN MoMo (Direct OpenAPI)** | Free Sandbox; ZICTA/Bank of Zambia Merchant KYC | 1.5% - 2.0% per collection | T+1 to Merchant Bank Account | Supported via MoMo Developer Portal (Collections API) |
| **Airtel Money (Direct OpenAPI)** | Free Sandbox; Airtel Business Enterprise KYC | 1.5% - 2.2% per collection | T+1 to Merchant Bank Account | Supported via Airtel Developer Portal |
| **Fintech Aggregator (e.g., Lipila, Kazang, Cellulant)** | ZMW 0 - ZMW 2,500 onboarding | 2.5% - 3.5% per successful transaction | T+1 to T+2 | Single API covering MTN, Airtel, and Zamtel Kwacha |

---

## 3. SMS & OTP Telephony Costs (Zambia)

Critical for rider verification, driver dispatches, and order delivery notifications.

| Provider | Cost Per SMS (ZMW) | Sender ID Registration | Delivery Reliability in Zambia |
| :--- | :--- | :--- | :--- |
| **Africa's Talking (Zambia Gateway)** | ~ZMW 0.28 ($0.0105 USD) | ZMW 1,500 one-off via ZICTA (Alphanumeric "MMDrive") | 98.5% across MTN, Airtel & Zamtel |
| **Twilio (International Gateway)** | ~ZMW 1.20 ($0.0440 USD) | Standard Twilio Shortcode / Longcode | High, but expensive for local scale |
| **In-App Web Push (VAPID / FCM)** | **FREE** | None | 100% free; used whenever the app is open |

> **Cost-Saving Recommendation:** Use Free In-App Push notifications for ride bids and status changes; restrict billable SMS OTP to account registration and critical security alerts.

---

## 4. Maps, Routing & Geocoding Services

| Service | Free Monthly Quota | Cost After Quota | Suitability for MMDrive |
| :--- | :--- | :--- | :--- |
| **OpenStreetMap + Leaflet / MapLibre** | **100% Free & Open Source** | Self-hosted tile cache (~$20/mo server) | **Recommended for Launch & Prototype** |
| **Google Maps Platform** | $200 free credit monthly (~28,000 map loads) | $7.00 per 1,000 dynamic map loads | Accurate Zambian POIs (Manda Hill, EastPark, Levy Mall), but costly at scale |
| **Mapbox GL** | 50,000 free monthly loads | $5.00 per 1,000 loads | Highly customizable vector styles with offline caching |

---

## 5. Regulatory, Compliance & Licensing in Zambia

1. **PACRA (Patents and Companies Registration Agency):**
   - Company registration for MMDrive Technology Ltd: ~ZMW 1,200.
2. **ZICTA (Zambia Information & Communications Technology Authority):**
   - Electronic Communications Service License / Value Added Service (VAS): ~ZMW 15,000 to ZMW 35,000 depending on category.
   - Data Protection Registration (Compliance with Data Protection Act No. 3 of 2021).
3. **RTSA (Road Transport and Safety Agency):**
   - Compliance with PSV e-hailing guidelines; driver criminal record clearance and roadworthiness certification.
4. **ZRA (Zambia Revenue Authority):**
   - TPIN Registration (Free).
   - Smart Invoice / Electronic Fiscal Device (EFD/VIMS) integration: Platform must record standard 16% VAT on platform commissions.

---

## 6. App Store Developer Accounts

* **Google Play Console (Android):** $25 USD one-time registration fee (~ZMW 675).
* **Apple Developer Program (iOS):** $99 USD annual renewal fee (~ZMW 2,670/year).

---

## 7. Monthly Projected Operating Budgets

### Tier 1: Launch Phase (Lusaka & Copperbelt Pilot — 1,000 to 5,000 MAU)
* **Cloud Backend (Firebase Blaze Free Tier + Minor overages):** $15 / ZMW 400
* **SMS OTP (Africa's Talking ~2,000 SMS):** $21 / ZMW 560
* **Maps & Routing (OpenStreetMap + Free tier Google Geocoding):** $0 / ZMW 0
* **Dev Server / Domain & SSL (Cloudflare):** $10 / ZMW 270
* **Estimated Monthly Core Tech Run Rate:** **~$46 USD / ~ZMW 1,230/month**

### Tier 2: Nationwide Growth Phase (10 Zambian Cities — 50,000 MAU)
* **Cloud Infrastructure (High availability Firestore + Cloud Functions):** $120 / ZMW 3,240
* **SMS Verification (25,000 SMS):** $260 / ZMW 7,020
* **Mapbox Vector Tiles & Routing:** $150 / ZMW 4,050
* **Customer Support Desk (WhatsApp Business API / Twilio):** $80 / ZMW 2,160
* **Estimated Monthly Core Tech Run Rate:** **~$610 USD / ~ZMW 16,470/month**

### Tier 3: National Scale Phase (250,000 MAU)
* **Cloud Backend & Database cluster:** $450 / ZMW 12,150
* **Telephony & Carrier SMS:** $950 / ZMW 25,650
* **Turn-by-turn routing servers:** $300 / ZMW 8,100
* **Monitoring, Security & ZRA Compliance:** $200 / ZMW 5,400
* **Estimated Monthly Core Tech Run Rate:** **~$1,900 USD / ~ZMW 51,300/month**

---

## 8. Revenue & Unit Economics Model

* **MMDrive Rides:** 12% platform commission on completed trips (configurable via Admin Cockpit between 5% - 25%).
* **MMDrive Cargo:** 10% commission on commercial haulage & freight bookings.
* **MMDrive Food:** 15% vendor commission + ZMW 15 - ZMW 35 courier delivery fee.
* **MMDrive Market:** Free basic listing; ZMW 20 - ZMW 50 promoted listings; 3% escrow fee on delivery-guaranteed transactions.

At 5,000 rides/deliveries monthly with an average order value of ZMW 80:
* Gross Merchandise Value (GMV): ZMW 400,000
* Gross Revenue at 12%: **ZMW 48,000/month**
* Operating Costs: **ZMW 1,230/month**
* **Gross Margin:** **> 95%** prior to local marketing, field ops, and office overheads.
