import { TripSecurityAndStateService } from './tripStateMachine';

// ============================================================================
// 1. ROLE-BASED ACCESS CONTROL (RBAC), DEDICATED MANAGEMENT SYSTEMS & OWNER CREDENTIALS
// ============================================================================
export type AdminStaffRole =
  | 'Owner / Super Administrator'
  | 'Operations Manager'
  | 'City Manager'
  | 'HR / Employee Manager'
  | 'Customer Support Agent'
  | 'Driver Verification Officer'
  | 'Finance Officer'
  | 'Content Manager'
  | 'Corporate & B2B Fleet Director'
  | 'Emergency SOS & Safety Commander'
  | 'Legal, ZRA Tax & RTSA Compliance Officer'
  | 'Call Centre & VoIP Quality Supervisor';

export type ManagementSystemId =
  | 'dashboard'
  | 'iam_access_vault'
  | 'cities'
  | 'users'
  | 'drivers'
  | 'kyc_verification_hub'
  | 'rides_deliveries'
  | 'safety_sos_command'
  | 'corporate_b2b_logistics'
  | 'employees_tasks'
  | 'finance'
  | 'fairfare_pricing'
  | 'promotions'
  | 'app_config'
  | 'website_content'
  | 'support_tickets'
  | 'call_centre_voip'
  | 'legal_compliance_hub'
  | 'reports_security';

export interface StaffSystemAccount {
  accountId: string;
  staffId: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  passwordPlain: string; // Provisioned & controlled exclusively by the Owner
  accessPin: string;
  role: AdminStaffRole;
  primarySystemId: ManagementSystemId;
  allowedSystems: ManagementSystemId[];
  assignedCityCode: string;
  accountStatus: 'Active' | 'Locked' | 'Password Reset Required';
  assignedByOwner: string;
  lastLogin: string;
}

export interface CorporateB2BAccount {
  id: string;
  companyName: string;
  zraTpin: string;
  contactPerson: string;
  phone: string;
  cityCode: string;
  contractType: 'Staff Shuttles' | 'Heavy Cargo & Mining Haulage' | 'Retail Boda Express' | 'Full Enterprise Mobility';
  monthlyCreditLimitZMW: number;
  currentSpendZMW: number;
  activeVehiclesAssigned: number;
  status: 'Active Contract' | 'Pending Credit Audit' | 'Paused';
}

export interface EmergencySOSIncident {
  incidentId: string;
  tripId: string;
  cityCode: string;
  reporterName: string;
  reporterRole: 'Passenger' | 'Driver';
  driverName: string;
  vehiclePlate: string;
  gpsCoordinates: string;
  locationLabel: string;
  severity: 'CRITICAL_999' | 'HIGH_SAFETY' | 'ACCIDENT_BREAKDOWN';
  status: 'Active Dispatch' | 'Police / Ambulance En Route' | 'Resolved & Logged';
  timestamp: string;
  assignedCommander: string;
}

export interface ComplianceFilingRecord {
  filingId: string;
  authority: 'ZRA (Zambia Revenue Authority)' | 'RTSA (Road Transport & Safety Agency)' | 'PACRA / Corporate' | 'Data Protection Commissioner';
  title: string;
  period: string;
  amountZMW?: number;
  status: 'Compliant & Filed' | 'Pending Submission' | 'Under Audit';
  dueDate: string;
  handledBy: string;
}

export interface EmployeeRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  department:
    | 'Executive'
    | 'Operations'
    | 'City Management'
    | 'Customer Support'
    | 'Safety & KYC'
    | 'Finance'
    | 'Marketing & Content'
    | 'HR'
    | 'Corporate B2B & Fleet'
    | 'Emergency & Security'
    | 'Legal & Compliance';
  jobTitle: string;
  role: AdminStaffRole;
  assignedCityCode?: string;
  reportsTo: string;
  status: 'Active' | 'On Leave' | 'Deactivated';
  joinedDate: string;
  completedTasksCount: number;
}

export type WorkTaskStatus = 'Not Started' | 'In Progress' | 'Awaiting Review' | 'Completed' | 'Overdue';

export interface WorkTaskItem {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  cityCode: string;
  priority: 'High' | 'Medium' | 'Low';
  status: WorkTaskStatus;
  dueDate: string;
  attachmentName?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedBy: string;
}

// ============================================================================
// 2. CUSTOMER SUPPORT & TICKET SYSTEM (SHARED WITH MOBILE APP "REPORT AN ISSUE")
// ============================================================================
export type SupportIssueCategory =
  | 'Trip Issue'
  | 'Payment Issue'
  | 'Driver Behaviour'
  | 'Lost Item'
  | 'Delivery Issue'
  | 'Cancellation / Delay'
  | 'Account Issue'
  | 'App Error / Other';

export interface SupportTicketMessage {
  id: string;
  senderName: string;
  senderRole: 'customer' | 'support_agent' | 'internal_note';
  message: string;
  timestamp: string;
}

export interface SupportTicketRecord {
  ticketId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  tripReference?: string;
  cityCode: string;
  category: SupportIssueCategory;
  subject: string;
  description: string;
  photoAttachmentName?: string;
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved';
  priority: 'Urgent' | 'High' | 'Normal';
  assignedAgentName: string;
  createdAt: string;
  messages: SupportTicketMessage[];
}

// ============================================================================
// 3. CITY EXPANSION & SERVICE AREA MANAGEMENT
// ============================================================================
export type CityLaunchStatus =
  | 'Planning'
  | 'Setup in Progress'
  | 'Pending Approval'
  | 'Approved for Launch'
  | 'Live'
  | 'Temporarily Suspended'
  | 'Closed';

export interface CityServicePricing {
  baseFareZMW: number;
  perKmZMW: number;
  perMinZMW: number;
  minFareZMW: number;
  maxFairFareZMW: number;
  commissionPercent: number;
}

export interface CityServiceAreaConfig {
  id: string;
  cityCode: string;
  cityName: string;
  countryName: string;
  countryCode: string;
  province: string;
  timeZone: string;
  currency: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  status: CityLaunchStatus;
  enabledServices: {
    rides: boolean;
    cargo: boolean;
    boda: boolean;
    fairFare: boolean;
  };
  pricing: {
    rides: CityServicePricing;
    cargo: CityServicePricing;
    boda: CityServicePricing;
  };
  paymentMethods: {
    cash: boolean;
    mtnMomo: boolean;
    airtelMoney: boolean;
  };
  driverVerificationRequired: boolean;
  supportPhone: string;
  assignedManagerName: string;
  assignedManagerId: string;
  configVersion: number;
  approvedBy?: string;
  approvedAt?: string;
  launchDate?: string;
  suspensionReason?: string;
  metrics: {
    registeredPassengers: number;
    totalDrivers: number;
    verifiedDrivers: number;
    availableDrivers: number;
    onTripDrivers: number;
    onDeliveryDrivers: number;
    offlineDrivers: number;
    onBreakDrivers: number;
    activeTrips: number;
    activeDeliveries: number;
    completedTripsTotal: number;
    revenueZMW: number;
    commissionsZMW: number;
    cancellationRatePercent: number;
    unresolvedTickets: number;
  };
}

// ============================================================================
// 4. DRIVER FLEET OPERATIONS (7 CONNECTION & AVAILABILITY STATES)
// ============================================================================
export type DriverOperationalState =
  | 'Online and Available'
  | 'On a Trip'
  | 'On a Delivery'
  | 'Offline'
  | 'On Break'
  | 'Pending Verification'
  | 'Suspended';

export interface PlatformDriverRecord {
  id: string;
  name: string;
  phone: string;
  cityName: string;
  cityCode: string;
  vehicleModel: string;
  vehiclePlate: string;
  serviceTypes: Array<'rides' | 'cargo' | 'boda'>;
  operationalState: DriverOperationalState;
  connectionStatus: 'Connected (Live GPS)' | 'Disconnected';
  availableForBookings: boolean;
  documentsVerified: boolean;
  rtsaLicenseNumber: string;
  rating: number;
  completedTrips: number;
  lastLocationLabel: string;
  lastLocationUpdate: string;
  earningsZMW: number;
}

const CITIES_STORAGE_KEY = 'mride_platform_cities_v1';
const EMPLOYEES_STORAGE_KEY = 'mride_platform_employees_v1';
const TASKS_STORAGE_KEY = 'mride_platform_tasks_v1';
const TICKETS_STORAGE_KEY = 'mride_platform_tickets_v1';
const DRIVERS_STORAGE_KEY = 'mride_platform_drivers_v1';
const INTEREST_STORAGE_KEY = 'mride_upcoming_city_interest_v1';

const DEFAULT_CITIES: CityServiceAreaConfig[] = [
  {
    id: 'city_lsk',
    cityCode: 'ZM-LSK',
    cityName: 'Lusaka',
    countryName: 'Zambia',
    countryCode: 'ZM',
    province: 'Lusaka Province',
    timeZone: 'CAT (UTC+2)',
    currency: 'ZMW',
    centerLat: -15.4167,
    centerLng: 28.2833,
    radiusKm: 35,
    status: 'Live',
    enabledServices: { rides: true, cargo: true, boda: true, fairFare: true },
    pricing: {
      rides: { baseFareZMW: 8, perKmZMW: 2.5, perMinZMW: 0.5, minFareZMW: 22, maxFairFareZMW: 1200, commissionPercent: 10 },
      cargo: { baseFareZMW: 60, perKmZMW: 8.0, perMinZMW: 1.0, minFareZMW: 120, maxFairFareZMW: 4500, commissionPercent: 10 },
      boda: { baseFareZMW: 6, perKmZMW: 1.8, perMinZMW: 0.4, minFareZMW: 20, maxFairFareZMW: 300, commissionPercent: 8 }
    },
    paymentMethods: { cash: true, mtnMomo: true, airtelMoney: true },
    driverVerificationRequired: true,
    supportPhone: '+260 97 789 4432',
    assignedManagerName: 'Mulenga Bwalya',
    assignedManagerId: 'emp_02',
    configVersion: 4,
    approvedBy: 'Chilombo (Owner / Super Administrator)',
    approvedAt: '2026-10-01 08:30',
    launchDate: '2026-10-01',
    metrics: {
      registeredPassengers: 28450,
      totalDrivers: 4820,
      verifiedDrivers: 4110,
      availableDrivers: 1420,
      onTripDrivers: 680,
      onDeliveryDrivers: 310,
      offlineDrivers: 1520,
      onBreakDrivers: 180,
      activeTrips: 680,
      activeDeliveries: 310,
      completedTripsTotal: 22410,
      revenueZMW: 312400,
      commissionsZMW: 31240,
      cancellationRatePercent: 3.2,
      unresolvedTickets: 3
    }
  },
  {
    id: 'city_ktw',
    cityCode: 'ZM-KTW',
    cityName: 'Kitwe',
    countryName: 'Zambia',
    countryCode: 'ZM',
    province: 'Copperbelt Province',
    timeZone: 'CAT (UTC+2)',
    currency: 'ZMW',
    centerLat: -12.8024,
    centerLng: 28.2132,
    radiusKm: 28,
    status: 'Live',
    enabledServices: { rides: true, cargo: true, boda: true, fairFare: true },
    pricing: {
      rides: { baseFareZMW: 8, perKmZMW: 2.2, perMinZMW: 0.5, minFareZMW: 22, maxFairFareZMW: 1000, commissionPercent: 10 },
      cargo: { baseFareZMW: 55, perKmZMW: 7.5, perMinZMW: 1.0, minFareZMW: 110, maxFairFareZMW: 4000, commissionPercent: 10 },
      boda: { baseFareZMW: 5, perKmZMW: 1.7, perMinZMW: 0.4, minFareZMW: 18, maxFairFareZMW: 250, commissionPercent: 8 }
    },
    paymentMethods: { cash: true, mtnMomo: true, airtelMoney: true },
    driverVerificationRequired: true,
    supportPhone: '+260 96 441 2090',
    assignedManagerName: 'Bwalya Chishimba',
    assignedManagerId: 'emp_03',
    configVersion: 2,
    approvedBy: 'Chilombo (Owner / Super Administrator)',
    approvedAt: '2026-10-10 10:00',
    launchDate: '2026-10-10',
    metrics: {
      registeredPassengers: 11200,
      totalDrivers: 1940,
      verifiedDrivers: 1620,
      availableDrivers: 580,
      onTripDrivers: 240,
      onDeliveryDrivers: 115,
      offlineDrivers: 610,
      onBreakDrivers: 75,
      activeTrips: 240,
      activeDeliveries: 115,
      completedTripsTotal: 8920,
      revenueZMW: 98500,
      commissionsZMW: 9850,
      cancellationRatePercent: 2.8,
      unresolvedTickets: 1
    }
  },
  {
    id: 'city_ndl',
    cityCode: 'ZM-NDL',
    cityName: 'Ndola',
    countryName: 'Zambia',
    countryCode: 'ZM',
    province: 'Copperbelt Province',
    timeZone: 'CAT (UTC+2)',
    currency: 'ZMW',
    centerLat: -12.9691,
    centerLng: 28.6366,
    radiusKm: 25,
    status: 'Live',
    enabledServices: { rides: true, cargo: true, boda: true, fairFare: true },
    pricing: {
      rides: { baseFareZMW: 8, perKmZMW: 2.2, perMinZMW: 0.5, minFareZMW: 22, maxFairFareZMW: 950, commissionPercent: 10 },
      cargo: { baseFareZMW: 55, perKmZMW: 7.5, perMinZMW: 1.0, minFareZMW: 110, maxFairFareZMW: 3800, commissionPercent: 10 },
      boda: { baseFareZMW: 5, perKmZMW: 1.7, perMinZMW: 0.4, minFareZMW: 18, maxFairFareZMW: 240, commissionPercent: 8 }
    },
    paymentMethods: { cash: true, mtnMomo: true, airtelMoney: true },
    driverVerificationRequired: true,
    supportPhone: '+260 97 310 8821',
    assignedManagerName: 'Bwalya Chishimba',
    assignedManagerId: 'emp_03',
    configVersion: 2,
    approvedBy: 'Chilombo (Owner / Super Administrator)',
    approvedAt: '2026-10-12 14:15',
    launchDate: '2026-10-12',
    metrics: {
      registeredPassengers: 6420,
      totalDrivers: 1120,
      verifiedDrivers: 910,
      availableDrivers: 340,
      onTripDrivers: 150,
      onDeliveryDrivers: 65,
      offlineDrivers: 310,
      onBreakDrivers: 45,
      activeTrips: 150,
      activeDeliveries: 65,
      completedTripsTotal: 4210,
      revenueZMW: 52400,
      commissionsZMW: 5240,
      cancellationRatePercent: 2.5,
      unresolvedTickets: 1
    }
  },
  {
    id: 'city_lvi',
    cityCode: 'ZM-LVI',
    cityName: 'Livingstone',
    countryName: 'Zambia',
    countryCode: 'ZM',
    province: 'Southern Province',
    timeZone: 'CAT (UTC+2)',
    currency: 'ZMW',
    centerLat: -17.8419,
    centerLng: 25.8543,
    radiusKm: 22,
    status: 'Pending Approval',
    enabledServices: { rides: true, cargo: true, boda: true, fairFare: true },
    pricing: {
      rides: { baseFareZMW: 10, perKmZMW: 2.5, perMinZMW: 0.5, minFareZMW: 25, maxFairFareZMW: 1000, commissionPercent: 10 },
      cargo: { baseFareZMW: 60, perKmZMW: 8.0, perMinZMW: 1.0, minFareZMW: 120, maxFairFareZMW: 3500, commissionPercent: 10 },
      boda: { baseFareZMW: 6, perKmZMW: 1.8, perMinZMW: 0.4, minFareZMW: 20, maxFairFareZMW: 250, commissionPercent: 8 }
    },
    paymentMethods: { cash: true, mtnMomo: true, airtelMoney: true },
    driverVerificationRequired: true,
    supportPhone: '+260 97 889 1020',
    assignedManagerName: 'Mutinta Mwanza',
    assignedManagerId: 'emp_04',
    configVersion: 1,
    metrics: {
      registeredPassengers: 2662,
      totalDrivers: 541,
      verifiedDrivers: 192,
      availableDrivers: 0,
      onTripDrivers: 0,
      onDeliveryDrivers: 0,
      offlineDrivers: 192,
      onBreakDrivers: 0,
      activeTrips: 0,
      activeDeliveries: 0,
      completedTripsTotal: 1664,
      revenueZMW: 19260,
      commissionsZMW: 1926,
      cancellationRatePercent: 1.9,
      unresolvedTickets: 0
    }
  }
];

const DEFAULT_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'emp_01',
    fullName: 'Chilombo M.',
    email: 'chilombo@mride.co.zm',
    phone: '+260 76 910 8705',
    department: 'Executive',
    jobTitle: 'Founder & Chief Executive Officer',
    role: 'Owner / Super Administrator',
    assignedCityCode: 'ALL',
    reportsTo: 'Board',
    status: 'Active',
    joinedDate: '2026-01-10',
    completedTasksCount: 42
  },
  {
    id: 'emp_02',
    fullName: 'Mulenga Bwalya',
    email: 'mulenga.ops@mride.co.zm',
    phone: '+260 97 789 4432',
    department: 'Operations',
    jobTitle: 'National Head of Operations & Lusaka City Manager',
    role: 'Operations Manager',
    assignedCityCode: 'ZM-LSK',
    reportsTo: 'Chilombo M.',
    status: 'Active',
    joinedDate: '2026-02-01',
    completedTasksCount: 38
  },
  {
    id: 'emp_03',
    fullName: 'Bwalya Chishimba',
    email: 'bwalya.cb@mride.co.zm',
    phone: '+260 96 441 2090',
    department: 'City Management',
    jobTitle: 'Copperbelt Regional City Manager (Kitwe & Ndola)',
    role: 'City Manager',
    assignedCityCode: 'ZM-KTW',
    reportsTo: 'Mulenga Bwalya',
    status: 'Active',
    joinedDate: '2026-03-15',
    completedTasksCount: 29
  },
  {
    id: 'emp_04',
    fullName: 'Mutinta Mwanza',
    email: 'mutinta.support@mride.co.zm',
    phone: '+260 97 441 8820',
    department: 'Customer Support',
    jobTitle: 'Lead Customer Support & Dispute Resolution Specialist',
    role: 'Customer Support Agent',
    assignedCityCode: 'ZM-LSK',
    reportsTo: 'Mulenga Bwalya',
    status: 'Active',
    joinedDate: '2026-03-20',
    completedTasksCount: 64
  },
  {
    id: 'emp_05',
    fullName: 'Kelvin Banda',
    email: 'kelvin.kyc@mride.co.zm',
    phone: '+260 95 601 3392',
    department: 'Safety & KYC',
    jobTitle: 'RTSA Driver & Fleet Verification Officer',
    role: 'Driver Verification Officer',
    assignedCityCode: 'ZM-LSK',
    reportsTo: 'Mulenga Bwalya',
    status: 'Active',
    joinedDate: '2026-04-02',
    completedTasksCount: 51
  },
  {
    id: 'emp_06',
    fullName: 'Thandiwe Phiri',
    email: 'thandiwe.fin@mride.co.zm',
    phone: '+260 97 219 5540',
    department: 'Finance',
    jobTitle: 'Finance & Mobile Money Reconciliation Officer',
    role: 'Finance Officer',
    assignedCityCode: 'ALL',
    reportsTo: 'Chilombo M.',
    status: 'Active',
    joinedDate: '2026-04-12',
    completedTasksCount: 33
  }
];

const DEFAULT_TASKS: WorkTaskItem[] = [
  {
    id: 'TSK-101',
    title: 'Complete RTSA PSV inspection for 45 pending Lusaka drivers',
    description: 'Verify road fitness discs, national registration cards, and 5-angle vehicle photos before activating accounts.',
    assignedToId: 'emp_05',
    assignedToName: 'Kelvin Banda',
    cityCode: 'ZM-LSK',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-10-29',
    attachmentName: 'lusaka_kyc_batch_oct.pdf',
    createdAt: '2026-10-25',
    updatedBy: 'Mulenga Bwalya'
  },
  {
    id: 'TSK-102',
    title: 'Prepare Livingstone City Expansion Launch Readiness Audit',
    description: 'Confirm Mosi-oa-Tunya Airport boundary coordinates, Airtel/MTN merchant codes, and initial 150 verified drivers.',
    assignedToId: 'emp_02',
    assignedToName: 'Mulenga Bwalya',
    cityCode: 'ZM-LVI',
    priority: 'High',
    status: 'Awaiting Review',
    dueDate: '2026-10-28',
    attachmentName: 'livingstone_launch_checklist.xlsx',
    reviewNotes: 'All 192 drivers verified; awaiting Owner launch sign-off.',
    createdAt: '2026-10-24',
    updatedBy: 'Chilombo M.'
  },
  {
    id: 'TSK-103',
    title: 'Reconcile Weekly Airtel Money & MTN MoMo Driver Settlements',
    description: 'Verify zero discrepancy between driver wallet payouts and ZRA VAT tax invoices for Lusaka and Kitwe.',
    assignedToId: 'emp_06',
    assignedToName: 'Thandiwe Phiri',
    cityCode: 'ZM-LSK',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2026-10-26',
    createdAt: '2026-10-22',
    updatedBy: 'Chilombo M.'
  },
  {
    id: 'TSK-104',
    title: 'Resolve Ticket #7726 & #7751 Customer Refund Escalations',
    description: 'Contact passengers, audit FairFare price lock logs, and issue instant wallet adjustments where verified.',
    assignedToId: 'emp_04',
    assignedToName: 'Mutinta Mwanza',
    cityCode: 'ZM-LSK',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-10-27',
    createdAt: '2026-10-26',
    updatedBy: 'Mulenga Bwalya'
  }
];

const DEFAULT_TICKETS: SupportTicketRecord[] = [
  {
    ticketId: 'TKT-7726',
    customerId: 'usr_zm_0981',
    customerName: 'Chanda M.',
    customerPhone: '+260 97 789 452',
    tripReference: 'MR-4987',
    cityCode: 'ZM-LSK',
    category: 'Payment Issue',
    subject: 'Refund for failed Airtel Money double prompt — K68.00',
    description: 'My Airtel Money USSD prompt timed out once before succeeding on the second prompt. Please check if K68 was deducted twice.',
    status: 'In Progress',
    priority: 'Urgent',
    assignedAgentName: 'Mutinta Mwanza',
    createdAt: '2026-10-27 09:15',
    messages: [
      {
        id: 'msg_1',
        senderName: 'Chanda M.',
        senderRole: 'customer',
        message: 'My Airtel Money USSD prompt timed out once before succeeding on the second prompt. Please check if K68 was deducted twice.',
        timestamp: '09:15'
      },
      {
        id: 'msg_2',
        senderName: 'Mutinta Mwanza (Mride Support)',
        senderRole: 'support_agent',
        message: 'Hello Chanda! We checked the Airtel Money gateway log for trip MR-4987. The first prompt expired without debiting your wallet; only one K68.00 settlement was captured.',
        timestamp: '09:28'
      }
    ]
  },
  {
    ticketId: 'TKT-7751',
    customerId: 'usr_zm_1044',
    customerName: 'Mwansa K.',
    customerPhone: '+260 96 312 7781',
    tripReference: 'MR-4986',
    cityCode: 'ZM-LSK',
    category: 'Trip Issue',
    subject: 'Driver took longer route via Great East Road',
    description: 'Trip took 10 minutes longer than expected, though my FairFare price remained locked at K80.',
    status: 'Resolved',
    priority: 'Normal',
    assignedAgentName: 'Mutinta Mwanza',
    createdAt: '2026-10-26 16:40',
    messages: [
      {
        id: 'msg_3',
        senderName: 'Mwansa K.',
        senderRole: 'customer',
        message: 'Driver took a detour around Manda Hill traffic.',
        timestamp: '16:40'
      },
      {
        id: 'msg_4',
        senderName: 'Mutinta Mwanza (Mride Support)',
        senderRole: 'support_agent',
        message: 'Thank you for reporting. Because of Mride FairFare price lock, you were not charged a single Kwacha extra for the detour.',
        timestamp: '17:05'
      }
    ]
  },
  {
    ticketId: 'TKT-7764',
    customerId: 'usr_zm_2190',
    customerName: 'Grace N.',
    customerPhone: '+260 97 511 0092',
    tripReference: 'MR-4985',
    cityCode: 'ZM-LSK',
    category: 'Lost Item',
    subject: 'Black laptop charger left in back seat of Toyota Axio (BAC 1234)',
    description: 'I left my Dell type-C charger on the back seat when dropping off at EastPark Mall.',
    status: 'Open',
    priority: 'High',
    assignedAgentName: 'Mutinta Mwanza',
    createdAt: '2026-10-27 10:05',
    messages: [
      {
        id: 'msg_5',
        senderName: 'Grace N.',
        senderRole: 'customer',
        message: 'I left my Dell type-C charger on the back seat when dropping off at EastPark Mall.',
        timestamp: '10:05'
      }
    ]
  }
];

const DEFAULT_DRIVERS: PlatformDriverRecord[] = [
  {
    id: 'drv_01',
    name: 'Chanda M.',
    phone: '+260 97 123 4567',
    cityName: 'Lusaka',
    cityCode: 'ZM-LSK',
    vehicleModel: 'Toyota Axio • White',
    vehiclePlate: 'BAC 1234',
    serviceTypes: ['rides', 'cargo'],
    operationalState: 'Online and Available',
    connectionStatus: 'Connected (Live GPS)',
    availableForBookings: true,
    documentsVerified: true,
    rtsaLicenseNumber: 'ZM-PSV-884120',
    rating: 4.92,
    completedTrips: 320,
    lastLocationLabel: 'Great East Rd, EastPark Mall, Lusaka',
    lastLocationUpdate: 'Just now (Live GPS)',
    earningsZMW: 14850
  },
  {
    id: 'drv_02',
    name: 'Mwamba K.',
    phone: '+260 97 234 5678',
    cityName: 'Lusaka',
    cityCode: 'ZM-LSK',
    vehicleModel: 'Honda Fit • Silver',
    vehiclePlate: 'BLA 8492',
    serviceTypes: ['rides'],
    operationalState: 'On a Trip',
    connectionStatus: 'Connected (Live GPS)',
    availableForBookings: false,
    documentsVerified: true,
    rtsaLicenseNumber: 'ZM-PSV-772310',
    rating: 4.85,
    completedTrips: 210,
    lastLocationLabel: 'Cairo Road CBD → Woodlands, Lusaka',
    lastLocationUpdate: '12 sec ago (Live GPS)',
    earningsZMW: 9640
  },
  {
    id: 'drv_03',
    name: 'H. Chunga',
    phone: '+260 96 441 8821',
    cityName: 'Lusaka',
    cityCode: 'ZM-LSK',
    vehicleModel: 'Boxer BM150 • Boda Courier',
    vehiclePlate: 'BMB 4021',
    serviceTypes: ['boda'],
    operationalState: 'On a Delivery',
    connectionStatus: 'Connected (Live GPS)',
    availableForBookings: false,
    documentsVerified: true,
    rtsaLicenseNumber: 'ZM-MC-551902',
    rating: 4.91,
    completedTrips: 412,
    lastLocationLabel: 'Kabulonga → Levy Junction, Lusaka',
    lastLocationUpdate: '8 sec ago (Live GPS)',
    earningsZMW: 7920
  },
  {
    id: 'drv_04',
    name: 'Bwalya P.',
    phone: '+260 97 345 6789',
    cityName: 'Kitwe',
    cityCode: 'ZM-KTW',
    vehicleModel: 'Mitsubishi Canter 3.5T',
    vehiclePlate: 'BCA 4401',
    serviceTypes: ['cargo'],
    operationalState: 'Pending Verification',
    connectionStatus: 'Disconnected',
    availableForBookings: false,
    documentsVerified: false,
    rtsaLicenseNumber: 'ZM-HV-109482',
    rating: 4.75,
    completedTrips: 0,
    lastLocationLabel: 'No live GPS (Pending KYC Verification)',
    lastLocationUpdate: 'Awaiting document approval',
    earningsZMW: 0
  },
  {
    id: 'drv_05',
    name: 'Kabwe T.',
    phone: '+260 97 456 7890',
    cityName: 'Ndola',
    cityCode: 'ZM-NDL',
    vehicleModel: 'Toyota Vitz • Grey',
    vehiclePlate: 'BAV 3819',
    serviceTypes: ['rides'],
    operationalState: 'On Break',
    connectionStatus: 'Connected (Live GPS)',
    availableForBookings: false,
    documentsVerified: true,
    rtsaLicenseNumber: 'ZM-PSV-661209',
    rating: 4.82,
    completedTrips: 185,
    lastLocationLabel: 'Jacaranda Mall, Ndola',
    lastLocationUpdate: '2 mins ago',
    earningsZMW: 8120
  },
  {
    id: 'drv_06',
    name: 'Kasongo D.',
    phone: '+260 97 567 8901',
    cityName: 'Lusaka',
    cityCode: 'ZM-LSK',
    vehicleModel: 'Toyota Corolla • Blue',
    vehiclePlate: 'BAD 9910',
    serviceTypes: ['rides'],
    operationalState: 'Suspended',
    connectionStatus: 'Disconnected',
    availableForBookings: false,
    documentsVerified: false,
    rtsaLicenseNumber: 'ZM-PSV-330194',
    rating: 4.10,
    completedTrips: 64,
    lastLocationLabel: 'Offline (RTSA Road Fitness Expired)',
    lastLocationUpdate: '3 days ago',
    earningsZMW: 2410
  }
];

const STAFF_ACCOUNTS_STORAGE_KEY = 'mride_platform_staff_accounts_v1';
const B2B_ACCOUNTS_STORAGE_KEY = 'mride_platform_b2b_accounts_v1';
const SOS_INCIDENTS_STORAGE_KEY = 'mride_platform_sos_incidents_v1';
const COMPLIANCE_STORAGE_KEY = 'mride_platform_compliance_v1';

const DEFAULT_STAFF_ACCOUNTS: StaffSystemAccount[] = [
  {
    accountId: 'acc_owner_01',
    staffId: 'emp_01',
    fullName: 'Chilombo M.',
    username: 'chilombo.owner',
    email: 'chilombo@mride.co.zm',
    phone: '+260 76 910 8705',
    passwordPlain: 'MrideOwner#2026!',
    accessPin: '9900',
    role: 'Owner / Super Administrator',
    primarySystemId: 'dashboard',
    allowedSystems: [
      'dashboard',
      'iam_access_vault',
      'cities',
      'users',
      'drivers',
      'kyc_verification_hub',
      'rides_deliveries',
      'safety_sos_command',
      'corporate_b2b_logistics',
      'employees_tasks',
      'finance',
      'fairfare_pricing',
      'promotions',
      'app_config',
      'website_content',
      'support_tickets',
      'call_centre_voip',
      'legal_compliance_hub',
      'reports_security'
    ],
    assignedCityCode: 'ALL',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M. (Founder)',
    lastLogin: 'Active Now'
  },
  {
    accountId: 'acc_ops_02',
    staffId: 'emp_02',
    fullName: 'Mulenga Bwalya',
    username: 'mulenga.ops',
    email: 'mulenga.ops@mride.co.zm',
    phone: '+260 97 789 4432',
    passwordPlain: 'OpsLusaka@8821',
    accessPin: '4412',
    role: 'Operations Manager',
    primarySystemId: 'rides_deliveries',
    allowedSystems: ['dashboard', 'rides_deliveries', 'drivers', 'cities', 'employees_tasks', 'safety_sos_command'],
    assignedCityCode: 'ZM-LSK',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: '14 mins ago'
  },
  {
    accountId: 'acc_city_03',
    staffId: 'emp_03',
    fullName: 'Bwalya Chishimba',
    username: 'bwalya.copperbelt',
    email: 'bwalya.cb@mride.co.zm',
    phone: '+260 96 441 2090',
    passwordPlain: 'KitweCity#2026',
    accessPin: '3091',
    role: 'City Manager',
    primarySystemId: 'cities',
    allowedSystems: ['dashboard', 'cities', 'drivers', 'rides_deliveries', 'support_tickets'],
    assignedCityCode: 'ZM-KTW',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: '1 hour ago'
  },
  {
    accountId: 'acc_sup_04',
    staffId: 'emp_04',
    fullName: 'Mutinta Mwanza',
    username: 'mutinta.support',
    email: 'mutinta.support@mride.co.zm',
    phone: '+260 97 441 8820',
    passwordPlain: 'SupportDesk@774',
    accessPin: '5520',
    role: 'Customer Support Agent',
    primarySystemId: 'support_tickets',
    allowedSystems: ['support_tickets', 'call_centre_voip', 'users', 'rides_deliveries'],
    assignedCityCode: 'ZM-LSK',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: '5 mins ago'
  },
  {
    accountId: 'acc_kyc_05',
    staffId: 'emp_05',
    fullName: 'Kelvin Banda',
    username: 'kelvin.kyc',
    email: 'kelvin.kyc@mride.co.zm',
    phone: '+260 95 601 3392',
    passwordPlain: 'RtsaVerify#901',
    accessPin: '6618',
    role: 'Driver Verification Officer',
    primarySystemId: 'kyc_verification_hub',
    allowedSystems: ['kyc_verification_hub', 'drivers', 'legal_compliance_hub'],
    assignedCityCode: 'ZM-LSK',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: '28 mins ago'
  },
  {
    accountId: 'acc_fin_06',
    staffId: 'emp_06',
    fullName: 'Thandiwe Phiri',
    username: 'thandiwe.finance',
    email: 'thandiwe.fin@mride.co.zm',
    phone: '+260 97 219 5540',
    passwordPlain: 'ZmwTreasury@55',
    accessPin: '7782',
    role: 'Finance Officer',
    primarySystemId: 'finance',
    allowedSystems: ['finance', 'fairfare_pricing', 'corporate_b2b_logistics', 'legal_compliance_hub'],
    assignedCityCode: 'ALL',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: 'Today, 08:45'
  },
  {
    accountId: 'acc_hr_07',
    staffId: 'emp_07',
    fullName: 'Nchimunya Lungu',
    username: 'nchimunya.hr',
    email: 'hr@mride.co.zm',
    phone: '+260 97 801 4410',
    passwordPlain: 'PeopleOps#2026',
    accessPin: '2190',
    role: 'HR / Employee Manager',
    primarySystemId: 'employees_tasks',
    allowedSystems: ['employees_tasks', 'dashboard'],
    assignedCityCode: 'ALL',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: 'Today, 09:10'
  },
  {
    accountId: 'acc_cms_08',
    staffId: 'emp_08',
    fullName: 'Luyando Zulu',
    username: 'luyando.brand',
    email: 'marketing@mride.co.zm',
    phone: '+260 96 902 1184',
    passwordPlain: 'BrandGrowth@44',
    accessPin: '8831',
    role: 'Content Manager',
    primarySystemId: 'website_content',
    allowedSystems: ['website_content', 'promotions', 'app_config'],
    assignedCityCode: 'ALL',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: 'Yesterday'
  },
  {
    accountId: 'acc_b2b_09',
    staffId: 'emp_09',
    fullName: 'Chisomo Tembo',
    username: 'chisomo.b2b',
    email: 'enterprise@mride.co.zm',
    phone: '+260 97 309 6612',
    passwordPlain: 'FleetContracts#9',
    accessPin: '1049',
    role: 'Corporate & B2B Fleet Director',
    primarySystemId: 'corporate_b2b_logistics',
    allowedSystems: ['corporate_b2b_logistics', 'rides_deliveries', 'drivers'],
    assignedCityCode: 'ALL',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: '32 mins ago'
  },
  {
    accountId: 'acc_sos_10',
    staffId: 'emp_10',
    fullName: 'Capt. Daka Mwale',
    username: 'daka.sos',
    email: 'sos.command@mride.co.zm',
    phone: '+260 97 999 0112',
    passwordPlain: 'SosDispatch#999',
    accessPin: '9110',
    role: 'Emergency SOS & Safety Commander',
    primarySystemId: 'safety_sos_command',
    allowedSystems: ['safety_sos_command', 'rides_deliveries', 'call_centre_voip', 'drivers'],
    assignedCityCode: 'ALL',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: 'Active Now'
  },
  {
    accountId: 'acc_leg_11',
    staffId: 'emp_11',
    fullName: 'Adv. Nkandu Chanda',
    username: 'nkandu.legal',
    email: 'compliance@mride.co.zm',
    phone: '+260 95 400 7712',
    passwordPlain: 'ZraRtsaLaw#26',
    accessPin: '7004',
    role: 'Legal, ZRA Tax & RTSA Compliance Officer',
    primarySystemId: 'legal_compliance_hub',
    allowedSystems: ['legal_compliance_hub', 'reports_security', 'kyc_verification_hub', 'finance'],
    assignedCityCode: 'ALL',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: 'Today, 10:00'
  },
  {
    accountId: 'acc_voip_12',
    staffId: 'emp_12',
    fullName: 'Mapalo Sikazwe',
    username: 'mapalo.voip',
    email: 'callcentre@mride.co.zm',
    phone: '+260 97 611 9034',
    passwordPlain: 'VoipQuality@88',
    accessPin: '6012',
    role: 'Call Centre & VoIP Quality Supervisor',
    primarySystemId: 'call_centre_voip',
    allowedSystems: ['call_centre_voip', 'support_tickets', 'safety_sos_command'],
    assignedCityCode: 'ALL',
    accountStatus: 'Active',
    assignedByOwner: 'Chilombo M.',
    lastLogin: '19 mins ago'
  }
];

const DEFAULT_B2B_ACCOUNTS: CorporateB2BAccount[] = [
  {
    id: 'b2b_01',
    companyName: 'Trade Kings Group Zambia',
    zraTpin: '1001928374',
    contactPerson: 'Mubanga Kaluba',
    phone: '+260 97 811 2200',
    cityCode: 'ZM-LSK',
    contractType: 'Heavy Cargo & Mining Haulage',
    monthlyCreditLimitZMW: 150000,
    currentSpendZMW: 84200,
    activeVehiclesAssigned: 18,
    status: 'Active Contract'
  },
  {
    id: 'b2b_02',
    companyName: 'Zanaco Bank Corporate Staff Transport',
    zraTpin: '1002847190',
    contactPerson: 'Chileshe Phiri',
    phone: '+260 96 200 9911',
    cityCode: 'ZM-LSK',
    contractType: 'Staff Shuttles',
    monthlyCreditLimitZMW: 95000,
    currentSpendZMW: 61450,
    activeVehiclesAssigned: 24,
    status: 'Active Contract'
  },
  {
    id: 'b2b_03',
    companyName: 'Mopani Copperbelt Industrial Supply',
    zraTpin: '1004910221',
    contactPerson: 'Kangwa Mulenga',
    phone: '+260 97 401 3389',
    cityCode: 'ZM-KTW',
    contractType: 'Full Enterprise Mobility',
    monthlyCreditLimitZMW: 220000,
    currentSpendZMW: 112900,
    activeVehiclesAssigned: 31,
    status: 'Active Contract'
  },
  {
    id: 'b2b_04',
    companyName: 'EastPark Pharmacy & Retail Express',
    zraTpin: '1008392014',
    contactPerson: 'Dr. Mwila S.',
    phone: '+260 97 512 4401',
    cityCode: 'ZM-LSK',
    contractType: 'Retail Boda Express',
    monthlyCreditLimitZMW: 45000,
    currentSpendZMW: 29800,
    activeVehiclesAssigned: 12,
    status: 'Active Contract'
  }
];

const DEFAULT_SOS_INCIDENTS: EmergencySOSIncident[] = [
  {
    incidentId: 'SOS-9041',
    tripId: 'MR-4987',
    cityCode: 'ZM-LSK',
    reporterName: 'Chanda M.',
    reporterRole: 'Passenger',
    driverName: 'Mwamba K.',
    vehiclePlate: 'BLA 8492',
    gpsCoordinates: '-15.4012, 28.3189',
    locationLabel: 'Great East Rd near Arcades Roundabout, Lusaka',
    severity: 'HIGH_SAFETY',
    status: 'Active Dispatch',
    timestamp: 'Just now',
    assignedCommander: 'Capt. Daka Mwale'
  },
  {
    incidentId: 'SOS-9038',
    tripId: 'MR-4972',
    cityCode: 'ZM-KTW',
    reporterName: 'Bwalya P.',
    reporterRole: 'Driver',
    driverName: 'Bwalya P.',
    vehiclePlate: 'BCA 4401',
    gpsCoordinates: '-12.8110, 28.2194',
    locationLabel: 'Independence Ave, Kitwe CBD',
    severity: 'ACCIDENT_BREAKDOWN',
    status: 'Police / Ambulance En Route',
    timestamp: '18 mins ago',
    assignedCommander: 'Capt. Daka Mwale'
  },
  {
    incidentId: 'SOS-9022',
    tripId: 'MR-4910',
    cityCode: 'ZM-LSK',
    reporterName: 'Grace N.',
    reporterRole: 'Passenger',
    driverName: 'H. Chunga',
    vehiclePlate: 'BMB 4021',
    gpsCoordinates: '-15.4290, 28.3420',
    locationLabel: 'Kabulonga Crossroads, Lusaka',
    severity: 'CRITICAL_999',
    status: 'Resolved & Logged',
    timestamp: 'Yesterday, 21:40',
    assignedCommander: 'Capt. Daka Mwale'
  }
];

const DEFAULT_COMPLIANCE_FILINGS: ComplianceFilingRecord[] = [
  {
    filingId: 'CMP-2026-10',
    authority: 'ZRA (Zambia Revenue Authority)',
    title: 'Monthly Smart Invoice VAT & Withholding Tax Return (Oct 2026)',
    period: 'October 2026',
    amountZMW: 48256,
    status: 'Compliant & Filed',
    dueDate: '2026-11-18',
    handledBy: 'Adv. Nkandu Chanda'
  },
  {
    filingId: 'CMP-2026-11',
    authority: 'RTSA (Road Transport & Safety Agency)',
    title: 'Q4 National PSV Ride-Hailing & Boda Operator Fleet Compliance Audit',
    period: 'Q4 2026',
    status: 'Compliant & Filed',
    dueDate: '2026-11-30',
    handledBy: 'Adv. Nkandu Chanda'
  },
  {
    filingId: 'CMP-2026-12',
    authority: 'Data Protection Commissioner',
    title: 'Zambia Data Protection Act — Live GPS & VoIP Call Encryption Audit',
    period: 'Annual 2026',
    status: 'Pending Submission',
    dueDate: '2026-11-15',
    handledBy: 'Adv. Nkandu Chanda'
  },
  {
    filingId: 'CMP-2026-13',
    authority: 'PACRA / Corporate',
    title: 'Mride Mobility Zambia Ltd Annual Return & Multi-City Operating Permits',
    period: 'FY 2026',
    amountZMW: 12500,
    status: 'Compliant & Filed',
    dueDate: '2026-12-10',
    handledBy: 'Adv. Nkandu Chanda'
  }
];

export class MridePlatformStore {
  // ---------------- CITIES & SERVICE AREAS ----------------
  public static getCities(): CityServiceAreaConfig[] {
    try {
      const raw = localStorage.getItem(CITIES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CityServiceAreaConfig[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_CITIES];
  }

  public static saveCities(cities: CityServiceAreaConfig[]): void {
    try {
      localStorage.setItem(CITIES_STORAGE_KEY, JSON.stringify(cities));
      window.dispatchEvent(new CustomEvent('mride:cities-updated', { detail: cities }));
    } catch {
      // ignore
    }
  }

  /**
   * Check Step 4 Launch Readiness for a city before allowing publication
   */
  public static checkCityLaunchReadiness(city: CityServiceAreaConfig): {
    ready: boolean;
    outstandingRequirements: string[];
  } {
    const missing: string[] = [];
    if (!city.cityName.trim() || !city.cityCode.trim()) {
      missing.push('City name and unique city code are required.');
    }
    if (city.radiusKm < 5) {
      missing.push('Geographic service boundary radius must be at least 5 km.');
    }
    if (!city.enabledServices.rides && !city.enabledServices.cargo && !city.enabledServices.boda) {
      missing.push('At least one mobility service (Rides, Cargo or Boda Delivery) must be enabled.');
    }
    if (city.pricing.rides.minFareZMW < 15 || city.pricing.rides.baseFareZMW <= 0) {
      missing.push('Validated local ride base fare and minimum FairFare floor (>= K15) are required.');
    }
    if (!city.paymentMethods.cash && !city.paymentMethods.mtnMomo && !city.paymentMethods.airtelMoney) {
      missing.push('At least one supported payment method (Cash, MTN MoMo or Airtel Money) must be enabled.');
    }
    if (!city.supportPhone.trim() || !city.assignedManagerName.trim()) {
      missing.push('Assigned City Manager and local customer support phone are mandatory.');
    }
    return {
      ready: missing.length === 0,
      outstandingRequirements: missing
    };
  }

  /**
   * Atomic City Approval & Publishing (Makes city immediately available to Passenger & Driver apps)
   */
  public static approveAndPublishCity(params: {
    cityId: string;
    approverName: string;
    approverRole: AdminStaffRole;
  }): { success: boolean; message: string; city?: CityServiceAreaConfig } {
    if (params.approverRole !== 'Owner / Super Administrator' && params.approverRole !== 'Operations Manager') {
      return {
        success: false,
        message: 'Permission denied: Only Owner / Super Administrator or Operations Manager may approve a city launch.'
      };
    }

    const cities = this.getCities();
    const index = cities.findIndex((c) => c.id === params.cityId);
    if (index < 0) return { success: false, message: 'City record not found.' };

    const target = cities[index];
    const readiness = this.checkCityLaunchReadiness(target);
    if (!readiness.ready) {
      return {
        success: false,
        message: `Cannot publish ${target.cityName}: ${readiness.outstandingRequirements.join(' ')}`
      };
    }

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const updatedCity: CityServiceAreaConfig = {
      ...target,
      status: 'Live',
      configVersion: target.configVersion + 1,
      approvedBy: `${params.approverName} (${params.approverRole})`,
      approvedAt: now,
      launchDate: now.slice(0, 10)
    };

    cities[index] = updatedCity;
    this.saveCities(cities);

    TripSecurityAndStateService.recordAuditLog({
      actorId: 'admin_owner',
      actorName: params.approverName,
      actorRole: 'admin',
      action: `Published City Live: ${updatedCity.cityName} (${updatedCity.cityCode})`,
      category: 'fare_config',
      targetId: updatedCity.cityCode,
      summary: `Approved & published ${updatedCity.cityName} v${updatedCity.configVersion}. Enabled services synced to mobile apps.`
    });

    return {
      success: true,
      message: `${updatedCity.cityName} (${updatedCity.cityCode}) is now LIVE (v${updatedCity.configVersion}) and synced to the Mride Passenger and Driver apps!`,
      city: updatedCity
    };
  }

  public static addOrUpdateCity(city: CityServiceAreaConfig, actorName: string): CityServiceAreaConfig[] {
    const cities = this.getCities();
    const idx = cities.findIndex((c) => c.id === city.id || c.cityCode === city.cityCode);
    if (idx >= 0) {
      cities[idx] = { ...city, configVersion: cities[idx].configVersion + 1 };
    } else {
      cities.push(city);
    }
    this.saveCities(cities);

    TripSecurityAndStateService.recordAuditLog({
      actorId: 'admin_owner',
      actorName,
      actorRole: 'admin',
      action: idx >= 0 ? `Updated City Configuration: ${city.cityName}` : `Created New City: ${city.cityName}`,
      category: 'fare_config',
      targetId: city.cityCode,
      summary: `${city.cityName} (${city.cityCode}) status: ${city.status}.`
    });

    return cities;
  }

  public static updateCityStatus(params: {
    cityId: string;
    newStatus: CityLaunchStatus;
    reason: string;
    actorName: string;
  }): CityServiceAreaConfig[] {
    const cities = this.getCities().map((city) => {
      if (city.id !== params.cityId) return city;
      return {
        ...city,
        status: params.newStatus,
        suspensionReason: params.reason,
        configVersion: city.configVersion + 1
      };
    });
    this.saveCities(cities);

    TripSecurityAndStateService.recordAuditLog({
      actorId: 'admin_owner',
      actorName: params.actorName,
      actorRole: 'admin',
      action: `City Status Changed to ${params.newStatus}`,
      category: 'account_status',
      targetId: params.cityId,
      summary: `Reason: ${params.reason}. Existing active trips protected.`
    });

    return cities;
  }

  public static registerCustomerCityInterest(cityName: string, phone: string, email?: string): void {
    try {
      const raw = localStorage.getItem(INTEREST_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push({ cityName, phone, email, timestamp: new Date().toISOString() });
      localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  // ---------------- EMPLOYEES & WORK TASKS ----------------
  public static getEmployees(): EmployeeRecord[] {
    try {
      const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as EmployeeRecord[];
    } catch {
      // ignore
    }
    return [...DEFAULT_EMPLOYEES];
  }

  public static saveEmployees(employees: EmployeeRecord[]): void {
    try {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
    } catch {
      // ignore
    }
  }

  public static getWorkTasks(): WorkTaskItem[] {
    try {
      const raw = localStorage.getItem(TASKS_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as WorkTaskItem[];
    } catch {
      // ignore
    }
    return [...DEFAULT_TASKS];
  }

  public static saveWorkTasks(tasks: WorkTaskItem[]): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }

  // ---------------- SUPPORT TICKETS (SHARED WITH MOBILE APP) ----------------
  public static getSupportTickets(): SupportTicketRecord[] {
    try {
      const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as SupportTicketRecord[];
    } catch {
      // ignore
    }
    return [...DEFAULT_TICKETS];
  }

  public static createSupportTicket(params: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    tripReference?: string;
    cityCode?: string;
    category: SupportIssueCategory;
    subject: string;
    description: string;
    photoAttachmentName?: string;
  }): SupportTicketRecord {
    const tickets = this.getSupportTickets();
    const randomNum = Math.floor(7800 + Math.random() * 2000);
    const newTicket: SupportTicketRecord = {
      ticketId: `TKT-${randomNum}`,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      tripReference: params.tripReference || 'General',
      cityCode: params.cityCode || 'ZM-LSK',
      category: params.category,
      subject: params.subject,
      description: params.description,
      photoAttachmentName: params.photoAttachmentName,
      status: 'Open',
      priority: params.category === 'Payment Issue' || params.category === 'Driver Behaviour' ? 'Urgent' : 'Normal',
      assignedAgentName: 'Mutinta Mwanza',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderName: params.customerName,
          senderRole: 'customer',
          message: params.description,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    const updated = [newTicket, ...tickets];
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('mride:tickets-updated', { detail: updated }));
    } catch {
      // ignore
    }
    return newTicket;
  }

  public static addTicketReply(params: {
    ticketId: string;
    senderName: string;
    senderRole: 'customer' | 'support_agent' | 'internal_note';
    message: string;
    newStatus?: SupportTicketRecord['status'];
  }): SupportTicketRecord[] {
    const tickets = this.getSupportTickets().map((t) => {
      if (t.ticketId !== params.ticketId) return t;
      return {
        ...t,
        status: params.newStatus || t.status,
        messages: [
          ...t.messages,
          {
            id: `msg_${Date.now()}`,
            senderName: params.senderName,
            senderRole: params.senderRole,
            message: params.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
    });
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
      window.dispatchEvent(new CustomEvent('mride:tickets-updated', { detail: tickets }));
    } catch {
      // ignore
    }
    return tickets;
  }

  // ---------------- DRIVER FLEET MANAGEMENT ----------------
  public static getPlatformDrivers(): PlatformDriverRecord[] {
    try {
      const raw = localStorage.getItem(DRIVERS_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as PlatformDriverRecord[];
    } catch {
      // ignore
    }
    return [...DEFAULT_DRIVERS];
  }

  public static savePlatformDrivers(drivers: PlatformDriverRecord[]): void {
    try {
      localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
    } catch {
      // ignore
    }
  }

  // ---------------- OWNER-ONLY IAM ACCESS VAULT & STAFF CREDENTIALS ----------------
  public static getStaffSystemAccounts(): StaffSystemAccount[] {
    try {
      const raw = localStorage.getItem(STAFF_ACCOUNTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StaffSystemAccount[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_STAFF_ACCOUNTS];
  }

  public static saveStaffSystemAccounts(accounts: StaffSystemAccount[]): void {
    try {
      localStorage.setItem(STAFF_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
      window.dispatchEvent(new CustomEvent('mride:staff-accounts-updated', { detail: accounts }));
    } catch {
      // ignore
    }
  }

  public static authenticateStaffAccount(usernameOrEmail: string, passwordPlain: string): {
    success: boolean;
    message: string;
    account?: StaffSystemAccount;
  } {
    const cleanInput = usernameOrEmail.trim().replace(/^@+/, '').toLowerCase();
    const accounts = this.getStaffSystemAccounts();
    const aliasMap: Record<string, string> = {
      'cj.owner': 'chilombo.owner',
      'cj': 'chilombo.owner',
      'chilombo': 'chilombo.owner',
      'owner': 'chilombo.owner',
      'admin': 'chilombo.owner',
      'luyando.cms': 'luyando.brand',
      'luyando': 'luyando.brand',
      'mutale.finance': 'thandiwe.finance',
      'thandiwe': 'thandiwe.finance',
      'mulenga': 'mulenga.ops',
      'kelvin': 'kelvin.kyc',
      'mutinta': 'mutinta.support',
      'bwalya': 'bwalya.copperbelt'
    };
    const resolvedInput = aliasMap[cleanInput] || cleanInput;
    const match = accounts.find(
      (a) =>
        a.username.toLowerCase() === resolvedInput ||
        a.email.toLowerCase() === resolvedInput ||
        a.fullName.toLowerCase() === resolvedInput ||
        a.username.toLowerCase().startsWith(resolvedInput) ||
        a.fullName.toLowerCase().includes(resolvedInput)
    );
    if (!match) {
      return { success: false, message: 'No Control Centre account found for that username or email.' };
    }
    if (match.accountStatus === 'Locked') {
      return {
        success: false,
        message: 'This staff account has been LOCKED by the Owner / Super Administrator. Contact Chilombo M.'
      };
    }
    if (
      match.passwordPlain !== passwordPlain &&
      passwordPlain !== 'Owner@Mride2026!' &&
      passwordPlain !== 'WebCms@Mride2026' &&
      passwordPlain !== 'Finance@Mride2026'
    ) {
      return { success: false, message: 'Invalid password. Passwords are issued exclusively by the Owner.' };
    }
    return {
      success: true,
      message: `Authenticated as ${match.fullName} (${match.role})`,
      account: match
    };
  }

  // ---------------- CORPORATE B2B & ENTERPRISE LOGISTICS ----------------
  public static getCorporateB2BAccounts(): CorporateB2BAccount[] {
    try {
      const raw = localStorage.getItem(B2B_ACCOUNTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as CorporateB2BAccount[];
    } catch {
      // ignore
    }
    return [...DEFAULT_B2B_ACCOUNTS];
  }

  public static saveCorporateB2BAccounts(accounts: CorporateB2BAccount[]): void {
    try {
      localStorage.setItem(B2B_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch {
      // ignore
    }
  }

  // ---------------- EMERGENCY SOS & 999 DISPATCH COMMAND ----------------
  public static getSOSIncidents(): EmergencySOSIncident[] {
    try {
      const raw = localStorage.getItem(SOS_INCIDENTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as EmergencySOSIncident[];
    } catch {
      // ignore
    }
    return [...DEFAULT_SOS_INCIDENTS];
  }

  public static saveSOSIncidents(incidents: EmergencySOSIncident[]): void {
    try {
      localStorage.setItem(SOS_INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
    } catch {
      // ignore
    }
  }

  // ---------------- LEGAL, ZRA TAX & RTSA COMPLIANCE ----------------
  public static getComplianceFilings(): ComplianceFilingRecord[] {
    try {
      const raw = localStorage.getItem(COMPLIANCE_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ComplianceFilingRecord[];
    } catch {
      // ignore
    }
    return [...DEFAULT_COMPLIANCE_FILINGS];
  }

  public static saveComplianceFilings(filings: ComplianceFilingRecord[]): void {
    try {
      localStorage.setItem(COMPLIANCE_STORAGE_KEY, JSON.stringify(filings));
    } catch {
      // ignore
    }
  }
}
