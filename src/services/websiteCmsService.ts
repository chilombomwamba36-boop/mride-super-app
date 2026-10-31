// ============================================================================
// MRIDE ZAMBIA — WEBSITE-ONLY CMS, DESIGN EDITOR, WORKFORCE & PUBLISHING ENGINE
// Strictly isolated from Passenger App and Driver App state.
// ============================================================================

export type WebsitePageSlug =
  | 'home'
  | 'rides'
  | 'cargo'
  | 'boda'
  | 'fairfare'
  | 'food'
  | 'marketplace'
  | 'corporate'
  | 'about'
  | 'faqs'
  | 'contact';

export type WebsitePublishingStatus =
  | 'Draft'
  | 'Preview'
  | 'Submitted for Approval'
  | 'Approved'
  | 'Published';

export interface WebsiteMediaAsset {
  id: string;
  title: string;
  category: 'Hero Banner' | 'Service Card' | 'Logo & Brand' | 'Promotion' | 'Corporate & Team';
  dataUrl: string;
  widthPx: number;
  heightPx: number;
  cropMode: 'cover' | 'contain' | 'center';
  uploadedBy: string;
  uploadedAt: string;
}

export interface WebsitePageContentConfig {
  slug: WebsitePageSlug;
  pageTitle: string;
  heroHeading: string;
  heroSubheading: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  bannerImageUrl: string;
  sectionHeading: string;
  sectionBody: string;
  promoBannerText: string;
  featureBullets: string[];
  visibleInNavbar: boolean;
}

export interface WebsiteThemeAndDesignConfig {
  brandLogoUrl: string;
  primaryColorHex: string;
  secondaryNavyHex: string;
  backgroundLightHex: string;
  surfaceCardHex: string;
  headingFontFamily: 'Inter' | 'Plus Jakarta Sans' | 'System Sans' | 'Georgia Serif';
  layoutDensity: 'Comfortable' | 'Compact' | 'Spacious';
  announcementBarText: string;
  showAnnouncementBar: boolean;
}

export interface WebsiteSnapshotVersion {
  versionId: string;
  versionNumber: number;
  status: WebsitePublishingStatus;
  theme: WebsiteThemeAndDesignConfig;
  pages: Record<WebsitePageSlug, WebsitePageContentConfig>;
  authorName: string;
  authorRole: string;
  changeSummary: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedBy?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface WebsitePublishingPermissions {
  rolesAllowedToEdit: string[];
  rolesAllowedToSubmit: string[];
  rolesAllowedToApprove: string[];
  rolesAllowedToPublish: string[];
  allowSelfApprovalException: boolean;
}

// ============================================================================
// WORKFORCE CONTROL CENTRE (6-STAGE STRICT WORKFLOW)
// Assigned → Accepted → In Progress → Submitted → Under Review → Approved | Returned for Correction
// ============================================================================
export type WorkforceTaskStage =
  | 'Assigned'
  | 'Accepted'
  | 'In Progress'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Returned for Correction';

export interface WorkforceTaskDeliverable {
  id: string;
  title: string;
  department:
    | 'Operations'
    | 'Human Resources'
    | 'Customer Support'
    | 'Finance'
    | 'Driver Verification'
    | 'Content and Website Management'
    | 'Corporate and Business Partnerships'
    | 'Safety and Emergency Management'
    | 'Legal and Regulatory Compliance'
    | 'Call Centre Management';
  assignedByUsername: string;
  assignedByName: string;
  assignedToUsername: string;
  assignedToName: string;
  priority: 'Critical' | 'High' | 'Normal';
  stage: WorkforceTaskStage;
  dueDate: string;
  deliverableInstructions: string;
  employeeSubmissionNotes?: string;
  attachedFileName?: string;
  reviewerUsername?: string;
  reviewerName?: string;
  reviewFeedback?: string;
  selfApprovalExceptionAuthorized?: boolean;
  historyLog: Array<{
    stage: WorkforceTaskStage;
    actorName: string;
    actorUsername: string;
    note: string;
    timestamp: string;
  }>;
}

export interface WorkforcePeriodicReport {
  id: string;
  reportType: 'Daily Report' | 'Weekly Report' | 'Department Performance Report';
  department: WorkforceTaskDeliverable['department'];
  submittedByName: string;
  submittedByUsername: string;
  periodLabel: string;
  keyMetricsSummary: string;
  blockersAndRisks: string;
  status: 'Submitted' | 'Reviewed & Approved by Owner';
  createdAt: string;
}

// ============================================================================
// MRIDE FUNCTIONAL OFFICE SUITE DOCUMENTS, PRESENTATIONS & FORMS
// ============================================================================
export interface OfficeSuiteDocument {
  id: string;
  department: string;
  docType: 'Document' | 'Presentation' | 'Form';
  title: string;
  contentBody: string;
  slidesOrFields: Array<{ heading: string; body: string }>;
  updatedBy: string;
  updatedAt: string;
}

const WEBSITE_LIVE_STORAGE_KEY = 'mride_website_only_published_v1';
const WEBSITE_DRAFT_STORAGE_KEY = 'mride_website_only_working_draft_v1';
const WEBSITE_VERSIONS_STORAGE_KEY = 'mride_website_only_versions_v1';
const WEBSITE_MEDIA_STORAGE_KEY = 'mride_website_only_media_v1';
const WEBSITE_PUB_PERMS_STORAGE_KEY = 'mride_website_only_pub_perms_v1';
const WORKFORCE_TASKS_STORAGE_KEY = 'mride_website_workforce_tasks_v1';
const WORKFORCE_REPORTS_STORAGE_KEY = 'mride_website_workforce_reports_v1';
const OFFICE_DOCS_STORAGE_KEY = 'mride_website_office_docs_v1';
const PORTAL_SESSION_STORAGE_KEY = 'mride_private_portal_auth_session_v1';

const DEFAULT_THEME: WebsiteThemeAndDesignConfig = {
  brandLogoUrl: '/mride-mark.svg',
  primaryColorHex: '#FF6500',
  secondaryNavyHex: '#0B1528',
  backgroundLightHex: '#F4F6F9',
  surfaceCardHex: '#FFFFFF',
  headingFontFamily: 'Plus Jakarta Sans',
  layoutDensity: 'Comfortable',
  announcementBarText: 'Mride Zambia — Transparent FairFare Rides, Cargo Haulage, Boda Delivery & Corporate Mobility across Lusaka, Kitwe, Ndola & Livingstone.',
  showAnnouncementBar: true
};

const DEFAULT_PAGES: Record<WebsitePageSlug, WebsitePageContentConfig> = {
  home: {
    slug: 'home',
    pageTitle: 'Home',
    heroHeading: 'Move Smarter Save More',
    heroSubheading: 'Safe, affordable and reliable passenger rides, cargo transport and boda-boda delivery across Zambia.',
    primaryCtaText: 'Book a Ride',
    primaryCtaLink: 'rides',
    secondaryCtaText: 'Explore FairFare',
    bannerImageUrl: '/twende-lusaka-intro.jpg',
    sectionHeading: 'One Platform for Every Journey & Delivery in Zambia',
    sectionBody: 'Whether you are commuting across Lusaka, moving commercial cargo on the Copperbelt, or sending an express boda parcel with recipient code verification, Mride puts you in control.',
    promoBannerText: 'Zero surge surprises — propose your fare and negotiate directly with verified drivers.',
    featureBullets: [
      'FairFare two-way price negotiation with verified RTSA drivers',
      'Heavy & light Cargo vans, pickups, and mini-trucks on demand',
      'Express Boda-Boda parcel delivery with 4-digit recipient PIN security',
      '24/7 Zambia Support Centre and live GPS trip tracking'
    ],
    visibleInNavbar: true
  },
  rides: {
    slug: 'rides',
    pageTitle: 'Rides',
    heroHeading: 'Reliable Everyday & Executive Rides Across Zambia',
    heroSubheading: 'Choose Economy, Comfort, XL Group vans or Executive Premium sedans with upfront FairFare transparency.',
    primaryCtaText: 'Request a Ride Now',
    primaryCtaLink: 'rides',
    secondaryCtaText: 'How FairFare Works',
    bannerImageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop&q=80',
    sectionHeading: 'Vehicle Tiers Built for Zambian Roads',
    sectionBody: 'Every Mride vehicle passes a strict 5-point RTSA road fitness and interior cleanliness inspection.',
    promoBannerText: 'Save up to 20% on daily Lusaka & Copperbelt commutes with FairFare.',
    featureBullets: ['Economy Hatchbacks & Sedans', 'Comfort AC Sedans', '6-Seater XL Family & Airport Vans', 'Executive Business Class'],
    visibleInNavbar: true
  },
  cargo: {
    slug: 'cargo',
    pageTitle: 'Cargo',
    heroHeading: 'On-Demand Commercial Cargo & Household Moving',
    heroSubheading: 'Book pickup trucks, panel vans, and 3.5T Canter trucks for business logistics, hardware haulage, and home relocations.',
    primaryCtaText: 'Book Cargo Vehicle',
    primaryCtaLink: 'cargo',
    secondaryCtaText: 'Corporate Fleet Inquiry',
    bannerImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    sectionHeading: 'Transparent Tonnage & Distance Pricing',
    sectionBody: 'Track your commercial consignment in real time from warehouse loading to final offloading.',
    promoBannerText: 'Optional driver loading assistance available on every booking.',
    featureBullets: ['Light Cargo (up to 500kg)', 'Hilux / Single-Cab Pickup (1.2 Tons)', 'Enclosed Panel Van', '3.5T – 5T Mitsubishi Canter Box Truck'],
    visibleInNavbar: true
  },
  boda: {
    slug: 'boda',
    pageTitle: 'Boda Delivery',
    heroHeading: 'Fast Boda-Boda Express Parcel & Document Delivery',
    heroSubheading: 'Beat city traffic with verified motorcycle couriers and mandatory pickup/dropoff confirmation codes.',
    primaryCtaText: 'Send a Parcel',
    primaryCtaLink: 'boda',
    secondaryCtaText: 'Track Delivery',
    bannerImageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=80',
    sectionHeading: 'Secure Code-Verified Couriers',
    sectionBody: 'Every parcel is insured and requires a 4-digit recipient verification code before handoff is completed.',
    promoBannerText: 'Average Lusaka CBD pickup time under 6 minutes.',
    featureBullets: ['Instant Document & Legal Courier', 'Pharmacy & Retail Express', 'Spare Parts & Electronics Dispatch', 'Recipient PIN Verification'],
    visibleInNavbar: true
  },
  fairfare: {
    slug: 'fairfare',
    pageTitle: 'FairFare',
    heroHeading: 'FairFare: Your Ride, Your Price Agreement',
    heroSubheading: 'No algorithmic price gouging. Set your route, offer a fair ZMW fare, and choose the best driver based on price, rating, and arrival time.',
    primaryCtaText: 'Try FairFare Calculator',
    primaryCtaLink: 'fairfare',
    secondaryCtaText: 'View City Tariffs',
    bannerImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop&q=80',
    sectionHeading: 'Locked-In Price Guarantee',
    sectionBody: 'Once you and your driver agree on a FairFare amount, that exact ZMW price is cryptographically locked for the entire trip.',
    promoBannerText: '100% transparent negotiation between passenger and driver.',
    featureBullets: ['1. Enter Pickup & Destination', '2. Propose Your ZMW Fare within Fair Floor Limits', '3. Compare Live Driver Offers & Counteroffers', '4. Ride with Locked-In Price'],
    visibleInNavbar: true
  },
  food: {
    slug: 'food',
    pageTitle: 'Food',
    heroHeading: 'Mride Food & Restaurant Delivery Network',
    heroSubheading: 'Partnering with local Zambian restaurants, cafes, and kitchens for hot, insulated Boda express meal delivery.',
    primaryCtaText: 'Register Your Restaurant',
    primaryCtaLink: 'contact',
    secondaryCtaText: 'View Delivery Zones',
    bannerImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    sectionHeading: 'Thermal-Insulated Express Fleet',
    sectionBody: 'Restaurants across Lusaka and Kitwe use Mride Boda couriers for rapid meal dispatch without high marketplace commissions.',
    promoBannerText: 'Zero onboarding fee for Zambian hospitality partners.',
    featureBullets: ['Dedicated Thermal Delivery Boxes', 'Direct Restaurant-to-Customer Dispatch', 'Real-Time Order Tracking', 'Instant Mobile Money Settlement'],
    visibleInNavbar: false
  },
  marketplace: {
    slug: 'marketplace',
    pageTitle: 'Marketplace',
    heroHeading: 'Mride Merchant & Retail Delivery Marketplace',
    heroSubheading: 'Empowering Zambian supermarkets, pharmacies, hardware stores, and e-commerce sellers with same-hour fulfillment.',
    primaryCtaText: 'Become a Merchant Partner',
    primaryCtaLink: 'corporate',
    secondaryCtaText: 'Contact Merchant Desk',
    bannerImageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&auto=format&fit=crop&q=80',
    sectionHeading: 'Same-Hour Citywide Merchant Logistics',
    sectionBody: 'Connect your retail store to Mride’s fleet of Boda couriers, vans, and cargo trucks.',
    promoBannerText: 'Automated ZRA Smart Invoice receipts on every commercial delivery.',
    featureBullets: ['Same-Hour Retail Fulfillment', 'Multi-Stop Route Optimization', 'Proof-of-Delivery Photo & PIN', 'Dedicated Account Manager'],
    visibleInNavbar: false
  },
  corporate: {
    slug: 'corporate',
    pageTitle: 'Corporate Services',
    heroHeading: 'Mride Corporate Mobility & Enterprise Logistics',
    heroSubheading: 'Centralized staff shuttles, executive airport transfers, mining supply haulage, and monthly ZRA TPIN consolidated invoicing.',
    primaryCtaText: 'Open Corporate Account',
    primaryCtaLink: 'corporate',
    secondaryCtaText: 'Download Corporate Brochure',
    bannerImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    sectionHeading: 'Built for Zambian Enterprises, Banks & Mining Houses',
    sectionBody: 'Eliminate petty cash taxi receipts with department cost-centres, monthly credit limits, and automated ZRA tax statements.',
    promoBannerText: 'Trusted by leading enterprises in Lusaka, Kitwe & Ndola.',
    featureBullets: ['Staff Night-Shift & Commuter Shuttles', 'Consolidated Monthly ZRA Smart Invoicing', 'Dedicated Fleet & Priority Dispatch', 'Custom Credit Limits & Cost-Centre Controls'],
    visibleInNavbar: true
  },
  about: {
    slug: 'about',
    pageTitle: 'About Us',
    heroHeading: 'Built in Zambia, For Zambia’s Mobility Future',
    heroSubheading: 'Mride is an original Zambian mobility platform committed to fair driver earnings, passenger safety, and transparent pricing.',
    primaryCtaText: 'Partner With Mride',
    primaryCtaLink: 'corporate',
    secondaryCtaText: 'Contact Our Team',
    bannerImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop&q=80',
    sectionHeading: 'Our Mission & Safety Commitment',
    sectionBody: 'We empower local drivers with low 10% commissions and private reward goals while giving passengers and businesses reliable transport.',
    promoBannerText: 'Headquartered at Great East Road Commercial Hub, Lusaka.',
    featureBullets: ['100% RTSA & KYC Verified Drivers', 'Low 10% Platform Commission', 'In-App Number-Masked VoIP Calling', '24/7 Emergency 999 SOS Integration'],
    visibleInNavbar: true
  },
  faqs: {
    slug: 'faqs',
    pageTitle: 'FAQs',
    heroHeading: 'Frequently Asked Questions & Safety Guide',
    heroSubheading: 'Everything you need to know about FairFare negotiation, driver verification, cargo bookings, and payment methods.',
    primaryCtaText: 'Open Support Centre',
    primaryCtaLink: 'contact',
    secondaryCtaText: 'Report an Issue',
    bannerImageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop&q=80',
    sectionHeading: 'Transparent Answers for Passengers, Drivers & Businesses',
    sectionBody: 'Have a question about Airtel Money, MTN MoMo, cash payments, or lost item recovery? Browse our official answers below.',
    promoBannerText: 'Need immediate help? Our Lusaka & Copperbelt support desk is open 24/7.',
    featureBullets: [
      'How does FairFare work? You propose a fare within fair limits and drivers accept or counteroffer.',
      'Can I pay with Airtel Money, MTN MoMo or Cash? Yes, all three are supported across live cities.',
      'How are drivers verified? Every driver undergoes NRC, RTSA PSV license, and vehicle inspection.',
      'How do I track a complaint? Submit a report in the Customer Portal to get a unique #TKT reference.'
    ],
    visibleInNavbar: true
  },
  contact: {
    slug: 'contact',
    pageTitle: 'Contact & Help',
    heroHeading: '24/7 Mride Zambia Help Centre & Regional Offices',
    heroSubheading: 'Reach our customer support, lost property desk, corporate sales team, or driver verification hubs in Lusaka, Kitwe, Ndola & Livingstone.',
    primaryCtaText: 'Submit Support Ticket',
    primaryCtaLink: 'contact',
    secondaryCtaText: 'Call +260 97 789 4432',
    bannerImageUrl: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=1200&auto=format&fit=crop&q=80',
    sectionHeading: 'Direct Support & Incident Resolution',
    sectionBody: 'Every inquiry generates a tracked #TKT reference handled by our dedicated Customer Support Agents.',
    promoBannerText: 'HQ: Plot 1042, Great East Road Commercial Hub, Lusaka, Zambia',
    featureBullets: [
      'National Support Hotline: +260 97 789 4432',
      'Support Email: support@mrides.co.zm',
      'Enterprise & Fleet Desk: enterprise@mride.co.zm',
      'Emergency Safety Line: 999 / 991'
    ],
    visibleInNavbar: true
  }
};

const DEFAULT_MEDIA_LIBRARY: WebsiteMediaAsset[] = [
  {
    id: 'med_1',
    title: 'Lusaka Skyline & Mride Fleet Hero',
    category: 'Hero Banner',
    dataUrl: '/twende-lusaka-intro.jpg',
    widthPx: 1600,
    heightPx: 900,
    cropMode: 'cover',
    uploadedBy: 'Luyando Zulu (@luyando.brand)',
    uploadedAt: '2026-10-25 10:00'
  },
  {
    id: 'med_2',
    title: 'Official Mride Brand Emblem',
    category: 'Logo & Brand',
    dataUrl: '/mride-mark.svg',
    widthPx: 512,
    heightPx: 512,
    cropMode: 'contain',
    uploadedBy: 'Chilombo M. (Owner)',
    uploadedAt: '2026-10-01 08:00'
  },
  {
    id: 'med_3',
    title: 'Commercial Cargo & Canter Fleet',
    category: 'Service Card',
    dataUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    widthPx: 1200,
    heightPx: 800,
    cropMode: 'cover',
    uploadedBy: 'Luyando Zulu (@luyando.brand)',
    uploadedAt: '2026-10-26 14:20'
  },
  {
    id: 'med_4',
    title: 'Boda Express Courier Dispatch',
    category: 'Service Card',
    dataUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=80',
    widthPx: 1200,
    heightPx: 800,
    cropMode: 'cover',
    uploadedBy: 'Luyando Zulu (@luyando.brand)',
    uploadedAt: '2026-10-26 15:10'
  }
];

const DEFAULT_WORKFORCE_TASKS: WorkforceTaskDeliverable[] = [
  {
    id: 'WF-201',
    title: 'Complete RTSA PSV inspection & NRC audit for 45 Lusaka drivers',
    department: 'Driver Verification',
    assignedByUsername: 'chilombo.owner',
    assignedByName: 'Chilombo M. (Owner)',
    assignedToUsername: 'kelvin.kyc',
    assignedToName: 'Kelvin Banda',
    priority: 'Critical',
    stage: 'Submitted',
    dueDate: '2026-10-29',
    deliverableInstructions: 'Inspect all 45 driver applications, verify RTSA road fitness discs, and attach the signed KYC verification spreadsheet.',
    employeeSubmissionNotes: 'Inspected all 45 drivers: 41 approved with valid RTSA PSV badges, 4 rejected for expired road fitness discs.',
    attachedFileName: 'lusaka_rtsa_kyc_batch_oct27.csv',
    historyLog: [
      { stage: 'Assigned', actorName: 'Chilombo M.', actorUsername: 'chilombo.owner', note: 'Assigned to Driver Verification department.', timestamp: '2026-10-25 09:00' },
      { stage: 'Accepted', actorName: 'Kelvin Banda', actorUsername: 'kelvin.kyc', note: 'Accepted assignment.', timestamp: '2026-10-25 09:15' },
      { stage: 'In Progress', actorName: 'Kelvin Banda', actorUsername: 'kelvin.kyc', note: 'Started physical & digital document checks.', timestamp: '2026-10-26 11:00' },
      { stage: 'Submitted', actorName: 'Kelvin Banda', actorUsername: 'kelvin.kyc', note: 'Submitted 41 approved & 4 rejected records for review.', timestamp: '2026-10-27 08:40' }
    ]
  },
  {
    id: 'WF-202',
    title: 'Reconcile Weekly Airtel Money & MTN MoMo Settlement Ledger',
    department: 'Finance',
    assignedByUsername: 'chilombo.owner',
    assignedByName: 'Chilombo M. (Owner)',
    assignedToUsername: 'thandiwe.finance',
    assignedToName: 'Thandiwe Phiri',
    priority: 'High',
    stage: 'Under Review',
    dueDate: '2026-10-28',
    deliverableInstructions: 'Verify zero discrepancy between mobile money merchant settlements, 10% platform commissions, and ZRA Smart Invoice VAT.',
    employeeSubmissionNotes: 'All K431,560.00 in gross volume reconciled across Lusaka, Kitwe, and Ndola. ZRA VAT return prepared.',
    attachedFileName: 'mride_treasury_reconciliation_w43.csv',
    historyLog: [
      { stage: 'Assigned', actorName: 'Chilombo M.', actorUsername: 'chilombo.owner', note: 'Assigned weekly treasury audit.', timestamp: '2026-10-24 10:00' },
      { stage: 'Accepted', actorName: 'Thandiwe Phiri', actorUsername: 'thandiwe.finance', note: 'Accepted task.', timestamp: '2026-10-24 10:20' },
      { stage: 'Submitted', actorName: 'Thandiwe Phiri', actorUsername: 'thandiwe.finance', note: 'Uploaded reconciled ZMW ledger.', timestamp: '2026-10-26 17:00' },
      { stage: 'Under Review', actorName: 'Chilombo M.', actorUsername: 'chilombo.owner', note: 'Owner reviewing VAT figures.', timestamp: '2026-10-27 09:10' }
    ]
  },
  {
    id: 'WF-203',
    title: 'Update Public Website Corporate Services & FairFare Promotional Banners',
    department: 'Content and Website Management',
    assignedByUsername: 'chilombo.owner',
    assignedByName: 'Chilombo M. (Owner)',
    assignedToUsername: 'luyando.brand',
    assignedToName: 'Luyando Zulu',
    priority: 'Normal',
    stage: 'In Progress',
    dueDate: '2026-10-30',
    deliverableInstructions: 'Refresh Corporate Services copy for Copperbelt mining & banking clients and submit website draft for Owner approval.',
    historyLog: [
      { stage: 'Assigned', actorName: 'Chilombo M.', actorUsername: 'chilombo.owner', note: 'Assigned website update.', timestamp: '2026-10-26 14:00' },
      { stage: 'Accepted', actorName: 'Luyando Zulu', actorUsername: 'luyando.brand', note: 'Accepted task.', timestamp: '2026-10-26 14:30' },
      { stage: 'In Progress', actorName: 'Luyando Zulu', actorUsername: 'luyando.brand', note: 'Editing draft in Website Design Editor.', timestamp: '2026-10-27 09:00' }
    ]
  },
  {
    id: 'WF-204',
    title: 'Livingstone City Expansion Pre-Launch Operational Readiness Audit',
    department: 'Operations',
    assignedByUsername: 'chilombo.owner',
    assignedByName: 'Chilombo M. (Owner)',
    assignedToUsername: 'mulenga.ops',
    assignedToName: 'Mulenga Bwalya',
    priority: 'Critical',
    stage: 'Approved',
    dueDate: '2026-10-27',
    deliverableInstructions: 'Confirm Mosi-oa-Tunya Airport boundary radius, local support hotline, and initial 192 verified drivers.',
    employeeSubmissionNotes: 'All 192 drivers verified and geofence tested.',
    attachedFileName: 'livingstone_readiness_signed.pdf',
    reviewerUsername: 'chilombo.owner',
    reviewerName: 'Chilombo M. (Owner)',
    reviewFeedback: 'Excellent work. Approved for launch.',
    historyLog: [
      { stage: 'Assigned', actorName: 'Chilombo M.', actorUsername: 'chilombo.owner', note: 'Assigned Livingstone audit.', timestamp: '2026-10-22 08:00' },
      { stage: 'Approved', actorName: 'Chilombo M.', actorUsername: 'chilombo.owner', note: 'Approved by Owner.', timestamp: '2026-10-27 08:00' }
    ]
  }
];

const DEFAULT_PERIODIC_REPORTS: WorkforcePeriodicReport[] = [
  {
    id: 'RPT-501',
    reportType: 'Daily Report',
    department: 'Operations',
    submittedByName: 'Mulenga Bwalya',
    submittedByUsername: 'mulenga.ops',
    periodLabel: '27 Oct 2026 — National Dispatch & Fleet Summary',
    keyMetricsSummary: '990 active rides & deliveries across Lusaka, Kitwe, and Ndola. 98.4% driver fulfillment rate; average pickup ETA 4.2 mins.',
    blockersAndRisks: 'Heavy evening rain forecast in Lusaka CBD; peak driver bonus campaign activated.',
    status: 'Reviewed & Approved by Owner',
    createdAt: '2026-10-27 08:30'
  },
  {
    id: 'RPT-502',
    reportType: 'Weekly Report',
    department: 'Finance',
    submittedByName: 'Thandiwe Phiri',
    submittedByUsername: 'thandiwe.finance',
    periodLabel: 'Week 43 (Oct 2026) — Treasury & Mobile Money Settlement',
    keyMetricsSummary: 'Gross volume K482,560.00; Net Mride 10% commission K48,256.00; 100% Airtel Money & MTN MoMo automated driver payouts completed.',
    blockersAndRisks: 'None. ZRA Smart Invoice monthly VAT filing ready Ahead of Nov 18 deadline.',
    status: 'Submitted',
    createdAt: '2026-10-27 09:45'
  },
  {
    id: 'RPT-503',
    reportType: 'Department Performance Report',
    department: 'Customer Support',
    submittedByName: 'Mutinta Mwanza',
    submittedByUsername: 'mutinta.support',
    periodLabel: 'October 2026 — Customer Support & Dispute SLA Report',
    keyMetricsSummary: '94% of customer tickets resolved within 15 minutes. Average post-resolution customer satisfaction score: 4.88 / 5.0.',
    blockersAndRisks: '2 lost-item tickets awaiting passenger pickup at Great East Road hub.',
    status: 'Reviewed & Approved by Owner',
    createdAt: '2026-10-26 17:30'
  }
];

const DEFAULT_OFFICE_DOCS: OfficeSuiteDocument[] = [
  {
    id: 'DOC-101',
    department: 'Executive & Operations',
    docType: 'Document',
    title: 'Mride Zambia 2026 Standard Operating Procedure (SOP) — City Expansion & Driver KYC',
    contentBody:
      '1. PURPOSE: Establish mandatory RTSA verification, FairFare floor calibration, and emergency 999 dispatch readiness before any Zambian city is published live.\n\n2. MANDATORY KYC CHECKLIST:\n- Valid Zambian National Registration Card (NRC)\n- RTSA Public Service Vehicle (PSV) Driver Badge\n- Valid Road Fitness Certificate & Comprehensive Insurance\n\n3. SIGN-OFF AUTHORITY:\nOnly Chilombo M. (Owner / Super Administrator) may execute final city publication and staff credential issuance.',
    slidesOrFields: [],
    updatedBy: 'Chilombo M. (Owner)',
    updatedAt: '2026-10-27 08:00'
  },
  {
    id: 'DOC-102',
    department: 'Corporate and Business Partnerships',
    docType: 'Presentation',
    title: 'Mride Enterprise B2B Pitch Deck — Mining, Banking & Retail Logistics',
    contentBody: 'Executive presentation for corporate fleet partnerships across Lusaka and the Copperbelt.',
    slidesOrFields: [
      {
        heading: 'Slide 1: Why Leading Zambian Enterprises Choose Mride B2B',
        body: 'Eliminate cash taxi vouchers with centralized employee ride accounts, scheduled shift shuttles, and 3.5T Canter cargo logistics.'
      },
      {
        heading: 'Slide 2: FairFare Cost Control & Monthly ZRA Smart Invoicing',
        body: 'Save 18–25% on corporate transport spend with locked-in FairFare pricing and automated monthly ZRA TPIN tax invoices.'
      },
      {
        heading: 'Slide 3: Dedicated Fleet & 24/7 Account Command',
        body: 'Dedicated vehicles assigned to your Lusaka, Kitwe, and Ndola branches with real-time GPS tracking and priority dispatch.'
      }
    ],
    updatedBy: 'Chisomo Tembo (@chisomo.b2b)',
    updatedAt: '2026-10-26 16:15'
  },
  {
    id: 'DOC-103',
    department: 'Driver Verification',
    docType: 'Form',
    title: 'Official RTSA 5-Point Vehicle & Interior Smell/Cleanliness Inspection Form',
    contentBody: 'Standard inspection checklist completed by Driver Verification Officers prior to account activation.',
    slidesOrFields: [
      { heading: 'Field 1: Vehicle Registration Plate & Chassis Match', body: 'Verified against RTSA registration book' },
      { heading: 'Field 2: Interior Cleanliness & Fresh Cabin Scent', body: 'Mandatory pass for Passenger Comfort & FairFare eligibility' },
      { heading: 'Field 3: Braking, Tyres, Indicators & Fire Extinguisher', body: 'Physical inspection at Lusaka / Kitwe hub' }
    ],
    updatedBy: 'Kelvin Banda (@kelvin.kyc)',
    updatedAt: '2026-10-27 09:20'
  }
];

const DEFAULT_PUBLISHING_PERMISSIONS: WebsitePublishingPermissions = {
  rolesAllowedToEdit: ['Owner / Super Administrator', 'Content Manager', 'Operations Manager'],
  rolesAllowedToSubmit: ['Owner / Super Administrator', 'Content Manager', 'Operations Manager'],
  rolesAllowedToApprove: ['Owner / Super Administrator'],
  rolesAllowedToPublish: ['Owner / Super Administrator'],
  allowSelfApprovalException: false
};

export class WebsiteCmsAndWorkforceService {
  // ---------------- PRIVATE MANAGEMENT PORTAL SESSION GUARD ----------------
  public static getAuthenticatedPortalStaffUsername(): string | null {
    try {
      return sessionStorage.getItem(PORTAL_SESSION_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  public static setAuthenticatedPortalStaffUsername(username: string | null): void {
    try {
      if (username) {
        sessionStorage.setItem(PORTAL_SESSION_STORAGE_KEY, username);
      } else {
        sessionStorage.removeItem(PORTAL_SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }

  // ---------------- PUBLISHED WEBSITE STATE (PUBLIC WEBSITE READS THIS) ----------------
  public static getPublishedWebsiteSnapshot(): WebsiteSnapshotVersion {
    try {
      const raw = localStorage.getItem(WEBSITE_LIVE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WebsiteSnapshotVersion;
        if (parsed && parsed.theme && parsed.pages) {
          return {
            ...parsed,
            pages: { ...DEFAULT_PAGES, ...parsed.pages }
          };
        }
      }
    } catch {
      // ignore
    }
    const initial: WebsiteSnapshotVersion = {
      versionId: 'v1_initial',
      versionNumber: 1,
      status: 'Published',
      theme: DEFAULT_THEME,
      pages: DEFAULT_PAGES,
      authorName: 'Chilombo M.',
      authorRole: 'Owner / Super Administrator',
      changeSummary: 'Initial Published Mride Zambia Official Website (v1.0)',
      approvedBy: 'Chilombo M. (Owner)',
      approvedAt: '2026-10-27 08:00',
      publishedBy: 'Chilombo M. (Owner)',
      publishedAt: '2026-10-27 08:00',
      createdAt: '2026-10-27 08:00'
    };
    return initial;
  }

  // ---------------- WORKING DRAFT STATE (WEBSITE DESIGN EDITOR READS/WRITES THIS) ----------------
  public static getWorkingDraftSnapshot(): WebsiteSnapshotVersion {
    try {
      const raw = localStorage.getItem(WEBSITE_DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WebsiteSnapshotVersion;
        if (parsed && parsed.theme && parsed.pages) {
          return {
            ...parsed,
            pages: { ...DEFAULT_PAGES, ...parsed.pages }
          };
        }
      }
    } catch {
      // ignore
    }
    return this.getPublishedWebsiteSnapshot();
  }

  public static saveWorkingDraft(
    draft: WebsiteSnapshotVersion,
    actorName: string,
    actorRole: string,
    summary?: string
  ): WebsiteSnapshotVersion {
    const perms = this.getPublishingPermissions();
    if (!perms.rolesAllowedToEdit.includes(actorRole)) {
      throw new Error(`Permission denied: Role "${actorRole}" is not authorised to edit website drafts.`);
    }
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const updated: WebsiteSnapshotVersion = {
      ...draft,
      status: 'Draft',
      authorName: actorName,
      authorRole: actorRole,
      changeSummary: summary || draft.changeSummary || 'Updated website design & page copy in Visual Editor',
      createdAt: now
    };
    try {
      localStorage.setItem(WEBSITE_DRAFT_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  public static markDraftPreviewed(draft: WebsiteSnapshotVersion): WebsiteSnapshotVersion {
    const updated: WebsiteSnapshotVersion = {
      ...draft,
      status: draft.status === 'Draft' ? 'Preview' : draft.status
    };
    try {
      localStorage.setItem(WEBSITE_DRAFT_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  public static submitDraftForApproval(
    draft: WebsiteSnapshotVersion,
    actorName: string,
    actorRole: string,
    changeSummary: string
  ): { success: boolean; message: string; snapshot?: WebsiteSnapshotVersion } {
    const perms = this.getPublishingPermissions();
    if (!perms.rolesAllowedToSubmit.includes(actorRole)) {
      return {
        success: false,
        message: `Permission denied: Role "${actorRole}" is not authorised to submit website changes for approval.`
      };
    }
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const versions = this.getVersionHistory();
    const nextVersionNum = (versions[0]?.versionNumber || 1) + 1;

    const submitted: WebsiteSnapshotVersion = {
      ...draft,
      versionId: `ver_${Date.now()}`,
      versionNumber: nextVersionNum,
      status: 'Submitted for Approval',
      authorName: actorName,
      authorRole: actorRole,
      changeSummary: changeSummary.trim() || `Website Update v${nextVersionNum}`,
      submittedAt: now,
      createdAt: now
    };

    try {
      localStorage.setItem(WEBSITE_DRAFT_STORAGE_KEY, JSON.stringify(submitted));
      this.saveVersionToHistory(submitted);
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Version v${nextVersionNum} submitted for Owner approval (Draft → Preview → Submitted for Approval).`,
      snapshot: submitted
    };
  }

  public static approveSubmittedWebsiteVersion(
    draft: WebsiteSnapshotVersion,
    approverName: string,
    approverRole: string
  ): { success: boolean; message: string; snapshot?: WebsiteSnapshotVersion } {
    const perms = this.getPublishingPermissions();
    if (!perms.rolesAllowedToApprove.includes(approverRole)) {
      return {
        success: false,
        message: `Permission denied: Only [${perms.rolesAllowedToApprove.join(', ')}] may approve website versions.`
      };
    }
    if (
      draft.authorName === approverName &&
      approverRole !== 'Owner / Super Administrator' &&
      !perms.allowSelfApprovalException
    ) {
      return {
        success: false,
        message: 'Governance block: Employees cannot self-approve their own website submissions without an Owner exception.'
      };
    }

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const approved: WebsiteSnapshotVersion = {
      ...draft,
      status: 'Approved',
      approvedBy: `${approverName} (${approverRole})`,
      approvedAt: now
    };

    try {
      localStorage.setItem(WEBSITE_DRAFT_STORAGE_KEY, JSON.stringify(approved));
      this.saveVersionToHistory(approved);
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Website v${approved.versionNumber} approved by ${approverName}. Ready to publish live!`,
      snapshot: approved
    };
  }

  public static publishApprovedWebsiteVersion(
    draft: WebsiteSnapshotVersion,
    publisherName: string,
    publisherRole: string
  ): { success: boolean; message: string; snapshot?: WebsiteSnapshotVersion } {
    const perms = this.getPublishingPermissions();
    if (!perms.rolesAllowedToPublish.includes(publisherRole)) {
      return {
        success: false,
        message: `Permission denied: Only [${perms.rolesAllowedToPublish.join(', ')}] can publish changes to the live public website.`
      };
    }
    if (draft.status !== 'Approved' && publisherRole !== 'Owner / Super Administrator') {
      return {
        success: false,
        message: 'Workflow violation: A website version must be in "Approved" status before it can be published.'
      };
    }

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const versions = this.getVersionHistory();
    const versionNumber = draft.versionNumber || (versions[0]?.versionNumber || 1) + 1;

    const published: WebsiteSnapshotVersion = {
      ...draft,
      versionId: draft.versionId || `ver_${Date.now()}`,
      versionNumber,
      status: 'Published',
      approvedBy: draft.approvedBy || `${publisherName} (${publisherRole})`,
      approvedAt: draft.approvedAt || now,
      publishedBy: `${publisherName} (${publisherRole})`,
      publishedAt: now
    };

    try {
      localStorage.setItem(WEBSITE_LIVE_STORAGE_KEY, JSON.stringify(published));
      localStorage.setItem(WEBSITE_DRAFT_STORAGE_KEY, JSON.stringify(published));
      this.saveVersionToHistory(published);
      window.dispatchEvent(new CustomEvent('mride:website-published', { detail: published }));
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Published Website v${published.versionNumber} live to the public Mride website! (Passenger & Driver apps untouched).`,
      snapshot: published
    };
  }

  public static rollbackToVersion(
    versionId: string,
    actorName: string,
    actorRole: string
  ): { success: boolean; message: string; snapshot?: WebsiteSnapshotVersion } {
    if (actorRole !== 'Owner / Super Administrator') {
      return {
        success: false,
        message: 'Permission denied: Only the Owner / Super Administrator can execute a live website version rollback.'
      };
    }
    const versions = this.getVersionHistory();
    const target = versions.find((v) => v.versionId === versionId);
    if (!target) return { success: false, message: 'Target version snapshot not found.' };

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const restored: WebsiteSnapshotVersion = {
      ...target,
      status: 'Published',
      publishedBy: `${actorName} (Rollback Restore)`,
      publishedAt: now,
      changeSummary: `Rolled back to v${target.versionNumber}: ${target.changeSummary}`
    };

    try {
      localStorage.setItem(WEBSITE_LIVE_STORAGE_KEY, JSON.stringify(restored));
      localStorage.setItem(WEBSITE_DRAFT_STORAGE_KEY, JSON.stringify(restored));
      window.dispatchEvent(new CustomEvent('mride:website-published', { detail: restored }));
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Restored & republished Website Version v${target.versionNumber} live!`,
      snapshot: restored
    };
  }

  public static getVersionHistory(): WebsiteSnapshotVersion[] {
    try {
      const raw = localStorage.getItem(WEBSITE_VERSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WebsiteSnapshotVersion[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [this.getPublishedWebsiteSnapshot()];
  }

  private static saveVersionToHistory(snapshot: WebsiteSnapshotVersion): void {
    const existing = this.getVersionHistory().filter((v) => v.versionId !== snapshot.versionId);
    const updated = [snapshot, ...existing].slice(0, 20);
    try {
      localStorage.setItem(WEBSITE_VERSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  // ---------------- PUBLISHING PERMISSIONS ----------------
  public static getPublishingPermissions(): WebsitePublishingPermissions {
    try {
      const raw = localStorage.getItem(WEBSITE_PUB_PERMS_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as WebsitePublishingPermissions;
    } catch {
      // ignore
    }
    return { ...DEFAULT_PUBLISHING_PERMISSIONS };
  }

  public static savePublishingPermissions(perms: WebsitePublishingPermissions): void {
    try {
      localStorage.setItem(WEBSITE_PUB_PERMS_STORAGE_KEY, JSON.stringify(perms));
    } catch {
      // ignore
    }
  }

  // ---------------- WEBSITE MEDIA & IMAGE MANAGEMENT ----------------
  public static getMediaLibrary(): WebsiteMediaAsset[] {
    try {
      const raw = localStorage.getItem(WEBSITE_MEDIA_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WebsiteMediaAsset[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_MEDIA_LIBRARY];
  }

  public static saveMediaLibrary(assets: WebsiteMediaAsset[]): void {
    try {
      localStorage.setItem(WEBSITE_MEDIA_STORAGE_KEY, JSON.stringify(assets));
    } catch {
      // ignore
    }
  }

  // ---------------- WORKFORCE CONTROL CENTRE (6-STAGE WORKFLOW & SELF-APPROVAL BLOCK) ----------------
  public static getWorkforceTasks(): WorkforceTaskDeliverable[] {
    try {
      const raw = localStorage.getItem(WORKFORCE_TASKS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WorkforceTaskDeliverable[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_WORKFORCE_TASKS];
  }

  public static saveWorkforceTasks(tasks: WorkforceTaskDeliverable[]): void {
    try {
      localStorage.setItem(WORKFORCE_TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }

  public static transitionWorkforceTask(params: {
    taskId: string;
    nextStage: WorkforceTaskStage;
    actorUsername: string;
    actorName: string;
    actorRole: string;
    note: string;
    attachedFileName?: string;
  }): { success: boolean; message: string; tasks?: WorkforceTaskDeliverable[] } {
    const tasks = this.getWorkforceTasks();
    const target = tasks.find((t) => t.id === params.taskId);
    if (!target) return { success: false, message: 'Workforce task not found.' };

    // Enforce anti-self-approval rule (Section 4)
    if (params.nextStage === 'Approved' || params.nextStage === 'Returned for Correction') {
      const isSelf =
        target.assignedToUsername.toLowerCase() === params.actorUsername.toLowerCase();
      if (
        isSelf &&
        params.actorRole !== 'Owner / Super Administrator' &&
        !target.selfApprovalExceptionAuthorized
      ) {
        return {
          success: false,
          message:
            'Security & Governance Block: Employees are strictly prohibited from approving their own work submissions.'
        };
      }
    }

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const updated = tasks.map((t) => {
      if (t.id !== params.taskId) return t;
      return {
        ...t,
        stage: params.nextStage,
        employeeSubmissionNotes:
          params.nextStage === 'Submitted' ? params.note : t.employeeSubmissionNotes,
        attachedFileName: params.attachedFileName || t.attachedFileName,
        reviewerUsername:
          params.nextStage === 'Approved' || params.nextStage === 'Returned for Correction'
            ? params.actorUsername
            : t.reviewerUsername,
        reviewerName:
          params.nextStage === 'Approved' || params.nextStage === 'Returned for Correction'
            ? params.actorName
            : t.reviewerName,
        reviewFeedback:
          params.nextStage === 'Approved' || params.nextStage === 'Returned for Correction'
            ? params.note
            : t.reviewFeedback,
        historyLog: [
          ...t.historyLog,
          {
            stage: params.nextStage,
            actorName: params.actorName,
            actorUsername: params.actorUsername,
            note: params.note,
            timestamp: now
          }
        ]
      };
    });

    this.saveWorkforceTasks(updated);
    return {
      success: true,
      message: `Task ${params.taskId} transitioned to [${params.nextStage}].`,
      tasks: updated
    };
  }

  public static getPeriodicReports(): WorkforcePeriodicReport[] {
    try {
      const raw = localStorage.getItem(WORKFORCE_REPORTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as WorkforcePeriodicReport[];
    } catch {
      // ignore
    }
    return [...DEFAULT_PERIODIC_REPORTS];
  }

  public static savePeriodicReports(reports: WorkforcePeriodicReport[]): void {
    try {
      localStorage.setItem(WORKFORCE_REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch {
      // ignore
    }
  }

  public static getOfficeDocuments(): OfficeSuiteDocument[] {
    try {
      const raw = localStorage.getItem(OFFICE_DOCS_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as OfficeSuiteDocument[];
    } catch {
      // ignore
    }
    return [...DEFAULT_OFFICE_DOCS];
  }

  public static saveOfficeDocuments(docs: OfficeSuiteDocument[]): void {
    try {
      localStorage.setItem(OFFICE_DOCS_STORAGE_KEY, JSON.stringify(docs));
    } catch {
      // ignore
    }
  }
}
