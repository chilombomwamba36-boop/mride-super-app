# Mrides — Zambian Mobility Platform

> **Tagline:** *Your Ride. Your Way.*  
> **Services (Release 1):** Passenger Rides • Cargo Transport • Boda-Boda Delivery  
> **Launch Cities:** Lusaka, Kitwe, Ndola, Livingstone, Kabwe, Chipata, Solwezi, Choma, Kasama, Mongu  
> **Currency:** Zambian Kwacha (`ZMW`, displayed as `K80` or `K80.00`)  
> **Brand Palette:** Primary Orange `#FF6500` | White `#FFFFFF` | Dark Text `#15191C` | Light Background `#F7F7F5` | Light Orange `#FFF0E6` | Accent Yellow `#FFE500`

---

## 1. Three Connected Applications

1. **Passenger App (`Passenger` toggle in Header):**
   - Route planning with pickup, destination, and swap controls (`Cavendish University -> EastPark Mall`).
   - Service selection: **Rides** (`Economy`, `Comfort`, `XL`), **Cargo**, and **Boda Delivery**.
   - **Mrides FairFare**: Two-way fare negotiation with proposed fare slider, driver offers (`Chanda M.`, `Mwamba K.`, `Blessings P.`), counteroffer inspection, up to 3 negotiation rounds, offer expiry checks, and locked agreed fares.
   - Controlled live trip state machine (`driver_arriving` -> `passenger_picked_up` -> `in_progress` -> `completed`), trip sharing, cancellation fee disclosure, and 5-star rating with receipts.
2. **Driver App (`Driver` toggle in Header):**
   - Online/Offline availability toggle, today's earnings (`K420 • 8 trips`), and visual bar chart.
   - Incoming request review with route distance/ETA, proposed fare, and expected net earnings after commission.
   - **Passenger Details Privacy Gate**: Displays masked passenger phone (`+260 97 *** 452`), verification status, rating, pickup note, and payment method before acceptance; unlocks full contact only after trip acceptance and records an audit log entry.
   - **Mrides Driver Goals & Rewards**: Tracks active challenges (*Consistent Driver Challenge: 50 rides in 7 days -> K300 reward*, tiered milestones at 20/50/80 rides, and *Weekend Bonus*), disqualified trip explanations, and auditable reward payout ledger.
3. **Admin Dashboard (`Admin` toggle in Header):**
   - Overview metrics, fleet map, user/driver/vehicle KYC verification, and account suspension with recorded reasons.
   - Configurable **FairFare** rules (minimum/maximum fares, negotiation rounds, and commission rates).
   - **Driver Goal Campaign Manager** and double-payout-protected reward approval ledger.
   - Dispute resolution and immutable **Administrator Audit Logs**.

---

## 2. Running Locally & Executing Tests

```bash
# Start development server
npm run dev

# Run TypeScript check and production bundle
npm run build

# Run the 15-scenario automated test suite
npm test
```

---

## 3. Simulated vs. Production Integrations Disclosure

- **Simulated in Frontend Preview:** Live driver GPS telemetry, SMS OTP delivery (use code `1234`), MTN MoMo / Airtel Money USSD push prompts, and 999/991 emergency dispatch.
- **Required for Production Launch:** Configure credentials in `.env` (see `.env.example`) for PostgreSQL/Firestore backend, licensed routing/geocoding provider, Africa's Talking SMS gateway, and MTN/Airtel Merchant OpenAPI keys.
