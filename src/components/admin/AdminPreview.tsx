import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Car,
  Truck,
  Wallet,
  Sliders,
  Megaphone,
  Smartphone,
  Globe2,
  FileBarChart,
  Headphones,
  MapPin,
  Briefcase,
  ClipboardList,
  Plus,
  Search,
  Bell,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Send,
  PauseCircle,
  PlayCircle,
  KeyRound,
  ShieldAlert,
  Building2,
  Scale,
  PhoneCall,
  FileCheck2,
  Eye,
  EyeOff,
  FileSpreadsheet
} from 'lucide-react';
import { CountryConfig, DEFAULT_COUNTRY } from '../../data/africanCountries';
import { CountryStreetMap } from '../common/CountryStreetMap';
import { OfficeSpreadsheetEngine, SpreadsheetColumn, SpreadsheetRow } from './OfficeSpreadsheetEngine';
import { OfficeSuiteWorkspace } from './OfficeSuiteWorkspace';
import { WebsiteDesignEditorModule } from './WebsiteDesignEditorModule';
import { WorkforceControlCentreModule } from './WorkforceControlCentreModule';
import { FileText } from 'lucide-react';
import { FairFareEngine } from '../../services/fairFareEngine';
import { DriverGoalsService } from '../../services/driverGoalsService';
import { TripSecurityAndStateService } from '../../services/tripStateMachine';
import {
  MridePlatformStore,
  AdminStaffRole,
  ManagementSystemId,
  StaffSystemAccount,
  CorporateB2BAccount,
  EmergencySOSIncident,
  ComplianceFilingRecord,
  CityServiceAreaConfig,
  EmployeeRecord,
  WorkTaskItem,
  WorkTaskStatus,
  SupportTicketRecord,
  PlatformDriverRecord,
  DriverOperationalState
} from '../../services/mridePlatformStore';
import {
  MrideContentSettings,
  readMrideContent,
  saveMrideContent
} from '../../services/contentSettings';

interface AdminPreviewProps {
  country?: CountryConfig;
  activeCity?: string;
  onExitAdmin?: () => void;
}

type AdminNavSection = ManagementSystemId;

const ALL_MANAGEMENT_SYSTEM_META: Array<{
  id: ManagementSystemId;
  label: string;
  category: string;
  dedicatedRole: AdminStaffRole;
}> = [
  { id: 'dashboard', label: 'Executive Dashboard', category: 'Executive', dedicatedRole: 'Owner / Super Administrator' },
  { id: 'iam_access_vault', label: 'Owner IAM & Password Vault', category: 'Owner Exclusive', dedicatedRole: 'Owner / Super Administrator' },
  { id: 'cities', label: 'Cities & Expansion System', category: 'Regional Ops', dedicatedRole: 'City Manager' },
  { id: 'rides_deliveries', label: 'National Dispatch & Trips', category: 'Operations', dedicatedRole: 'Operations Manager' },
  { id: 'drivers', label: 'Driver Fleet & Live GPS', category: 'Operations', dedicatedRole: 'Operations Manager' },
  { id: 'kyc_verification_hub', label: 'RTSA Driver KYC & Vehicle Lab', category: 'Verification', dedicatedRole: 'Driver Verification Officer' },
  { id: 'safety_sos_command', label: '999 SOS & Safety Command', category: 'Security', dedicatedRole: 'Emergency SOS & Safety Commander' },
  { id: 'corporate_b2b_logistics', label: 'Corporate B2B & Enterprise Fleet', category: 'Enterprise', dedicatedRole: 'Corporate & B2B Fleet Director' },
  { id: 'users', label: 'Passenger Accounts CRM', category: 'Customer Ops', dedicatedRole: 'Customer Support Agent' },
  { id: 'support_tickets', label: 'Support & Dispute Resolution', category: 'Customer Ops', dedicatedRole: 'Customer Support Agent' },
  { id: 'call_centre_voip', label: 'VoIP Call Centre & Audio QA', category: 'Telecom', dedicatedRole: 'Call Centre & VoIP Quality Supervisor' },
  { id: 'employees_tasks', label: 'HR, Payroll & Work Tasks', category: 'People Ops', dedicatedRole: 'HR / Employee Manager' },
  { id: 'finance', label: 'Finance, Treasury & Mobile Money', category: 'Finance', dedicatedRole: 'Finance Officer' },
  { id: 'fairfare_pricing', label: 'FairFare & Tariff Engine', category: 'Finance', dedicatedRole: 'Finance Officer' },
  { id: 'promotions', label: 'Promotions & Growth Engine', category: 'Marketing', dedicatedRole: 'Content Manager' },
  { id: 'website_content', label: 'Website & Brand CMS', category: 'Marketing', dedicatedRole: 'Content Manager' },
  { id: 'app_config', label: 'Mobile App Release & Flags', category: 'Engineering', dedicatedRole: 'Operations Manager' },
  { id: 'legal_compliance_hub', label: 'ZRA Tax & RTSA Legal Hub', category: 'Compliance', dedicatedRole: 'Legal, ZRA Tax & RTSA Compliance Officer' },
  { id: 'reports_security', label: 'Security & Immutable Audit Trail', category: 'Governance', dedicatedRole: 'Owner / Super Administrator' }
];

export const AdminPreview: React.FC<AdminPreviewProps> = ({
  country = DEFAULT_COUNTRY,
  activeCity = 'Lusaka',
  onExitAdmin
}) => {
  const [activeSection, setActiveSection] = useState<AdminNavSection>('dashboard');
  const [currentStaffRole, setCurrentStaffRole] = useState<AdminStaffRole>('Owner / Super Administrator');
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Shared Backend Store States
  const [cities, setCities] = useState<CityServiceAreaConfig[]>(() => MridePlatformStore.getCities());
  const [drivers, setDrivers] = useState<PlatformDriverRecord[]>(() => MridePlatformStore.getPlatformDrivers());
  const [employees, setEmployees] = useState<EmployeeRecord[]>(() => MridePlatformStore.getEmployees());
  const [tasks, setTasks] = useState<WorkTaskItem[]>(() => MridePlatformStore.getWorkTasks());
  const [tickets, setTickets] = useState<SupportTicketRecord[]>(() => MridePlatformStore.getSupportTickets());
  const [contentSettings, setContentSettings] = useState<MrideContentSettings>(readMrideContent);
  const [staffAccounts, setStaffAccounts] = useState<StaffSystemAccount[]>(() =>
    MridePlatformStore.getStaffSystemAccounts()
  );
  const [b2bAccounts, setB2bAccounts] = useState<CorporateB2BAccount[]>(() =>
    MridePlatformStore.getCorporateB2BAccounts()
  );
  const [sosIncidents, setSosIncidents] = useState<EmergencySOSIncident[]>(() =>
    MridePlatformStore.getSOSIncidents()
  );
  const [complianceFilings, setComplianceFilings] = useState<ComplianceFilingRecord[]>(() =>
    MridePlatformStore.getComplianceFilings()
  );
  const [, setTick] = useState(0);

  // Active Authenticated Staff Session (Defaults to Owner Chilombo M., can test login as any staff with Owner-assigned password)
  const [activeStaffAccount, setActiveStaffAccount] = useState<StaffSystemAccount>(
    () => MridePlatformStore.getStaffSystemAccounts()[0]
  );
  const [showStaffLoginModal, setShowStaffLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Owner IAM Provisioning Form State
  const [newAccFullName, setNewAccFullName] = useState('');
  const [newAccUsername, setNewAccUsername] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPhone, setNewAccPhone] = useState('+260 97 ');
  const [newAccPassword, setNewAccPassword] = useState('MrideStaff#2026');
  const [newAccPin, setNewAccPin] = useState('4020');
  const [newAccRole, setNewAccRole] = useState<AdminStaffRole>('City Manager');
  const [newAccPrimarySystem, setNewAccPrimarySystem] = useState<ManagementSystemId>('cities');
  const [newAccAllowedSystems, setNewAccAllowedSystems] = useState<ManagementSystemId[]>(['cities', 'drivers', 'rides_deliveries']);
  const [newAccCity, setNewAccCity] = useState('ZM-LSK');

  // New B2B Enterprise Account Form State
  const [b2bCompanyInput, setB2bCompanyInput] = useState('');
  const [b2bTpinInput, setB2bTpinInput] = useState('');
  const [b2bContactInput, setB2bContactInput] = useState('');
  const [b2bLimitInput, setB2bLimitInput] = useState<number>(80000);

  // Office Workspace Mode: Toggle between Visual Management Console, Live Google Sheets / Excel Record Book & Office Suite Docs/Slides/Forms
  const [officeViewTab, setOfficeViewTab] = useState<'operations' | 'spreadsheet_ledger' | 'office_docs'>('operations');

  // User Management Sub-tab
  const [userSubTab, setUserSubTab] = useState<'passengers' | 'drivers'>('drivers');
  const [driverFilterState, setDriverFilterState] = useState<string>('ALL');
  const [driverFilterCity, setDriverFilterCity] = useState<string>('ALL');

  // Live Trips Filter
  const [liveTripFilter, setLiveTripFilter] = useState<'ALL' | 'Ride' | 'Cargo' | 'Boda'>('ALL');

  // Employee & Task View Mode
  const [taskViewMode, setTaskViewMode] = useState<'board' | 'list' | 'calendar'>('board');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('emp_02');
  const [newTaskCity] = useState('ZM-LSK');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newTaskDue, setNewTaskDue] = useState('2026-11-02');

  // Add Employee State
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('+260 97 ');
  const [empTitle, setEmpTitle] = useState('City Operations Coordinator');
  const [empDept] = useState<EmployeeRecord['department']>('Operations');
  const [empRole, setEmpRole] = useState<AdminStaffRole>('City Manager');
  const [empCity] = useState('ZM-LSK');

  // Add New City 5-Step Wizard State
  const [showAddCityWizard, setShowAddCityWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [draftCity, setDraftCity] = useState<CityServiceAreaConfig>({
    id: `city_${Date.now()}`,
    cityCode: 'ZM-SOL',
    cityName: 'Solwezi',
    countryName: 'Zambia',
    countryCode: 'ZM',
    province: 'North-Western Province',
    timeZone: 'CAT (UTC+2)',
    currency: 'ZMW',
    centerLat: -12.1833,
    centerLng: 26.4,
    radiusKm: 25,
    status: 'Setup in Progress',
    enabledServices: { rides: true, cargo: true, boda: true, fairFare: true },
    pricing: {
      rides: { baseFareZMW: 8, perKmZMW: 2.0, perMinZMW: 0.5, minFareZMW: 20, maxFairFareZMW: 900, commissionPercent: 10 },
      cargo: { baseFareZMW: 55, perKmZMW: 7.5, perMinZMW: 1.0, minFareZMW: 110, maxFairFareZMW: 3500, commissionPercent: 10 },
      boda: { baseFareZMW: 5, perKmZMW: 1.6, perMinZMW: 0.4, minFareZMW: 18, maxFairFareZMW: 220, commissionPercent: 8 }
    },
    paymentMethods: { cash: true, mtnMomo: true, airtelMoney: true },
    driverVerificationRequired: true,
    supportPhone: '+260 97 789 4432',
    assignedManagerName: 'Mulenga Bwalya',
    assignedManagerId: 'emp_02',
    configVersion: 1,
    metrics: {
      registeredPassengers: 420,
      totalDrivers: 85,
      verifiedDrivers: 64,
      availableDrivers: 32,
      onTripDrivers: 0,
      onDeliveryDrivers: 0,
      offlineDrivers: 32,
      onBreakDrivers: 0,
      activeTrips: 0,
      activeDeliveries: 0,
      completedTripsTotal: 0,
      revenueZMW: 0,
      commissionsZMW: 0,
      cancellationRatePercent: 0,
      unresolvedTickets: 0
    }
  });

  // FairFare & Pricing Service Tab
  const [pricingServiceTab, setPricingServiceTab] = useState<'rides' | 'cargo' | 'boda' | 'fairfare'>('fairfare');
  const [selectedPricingCityId, setSelectedPricingCityId] = useState<string>(cities[0]?.id || 'city_lsk');
  const [baseFareInput, setBaseFareInput] = useState<number>(8.0);
  const [perKmInput, setPerKmInput] = useState<number>(2.0);
  const [perMinInput, setPerMinInput] = useState<number>(0.5);
  const [minFareInput, setMinFareInput] = useState<number>(contentSettings.minEconomyFareZMW || 28);
  const [minComfortFareInput, setMinComfortFareInput] = useState<number>(contentSettings.minComfortFareZMW || 40);
  const [serviceFeeInput, setServiceFeeInput] = useState<number>(contentSettings.driverCommissionPercent || 10);

  // Support Ticket Selection & Reply
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRecord | null>(tickets[0] || null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketNoteMode, setTicketNoteMode] = useState<'support_agent' | 'internal_note'>('support_agent');

  // App Configuration Feature Flags
  const [featureFlags, setFeatureFlags] = useState({
    fairFare: true,
    cargoService: true,
    bodaDelivery: true,
    liveTracking: true,
    inAppVoipCalls: true,
    referralProgram: true
  });

  // Promotions State
  const [promotions, setPromotions] = useState([
    { id: 'prm_1', title: 'Weekend Ride Promo', type: 'Coupon (LUSAKA15)', start: '24 Oct 2026', end: '31 Oct 2026', status: 'Active' },
    { id: 'prm_2', title: 'First Boda Delivery Discount', type: 'Coupon (BODA10)', start: '20 Oct 2026', end: '15 Nov 2026', status: 'Active' },
    { id: 'prm_3', title: 'Refer & Earn K30 Credit', type: 'Referral', start: '01 Oct 2026', end: '31 Dec 2026', status: 'Active' }
  ]);
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoCode, setNewPromoCode] = useState('');

  const showNotice = (msg: string) => {
    setAdminToast(msg);
    window.setTimeout(() => setAdminToast(null), 4000);
  };

  // Aggregated Executive Metrics from Cities Store
  const totalPassengers = cities.reduce((acc, c) => acc + c.metrics.registeredPassengers, 0);
  const totalDrivers = cities.reduce((acc, c) => acc + c.metrics.totalDrivers, 0);
  const totalVerifiedDrivers = cities.reduce((acc, c) => acc + c.metrics.verifiedDrivers, 0);
  const totalPendingDrivers = Math.max(0, totalDrivers - totalVerifiedDrivers);
  const totalTrips = cities.reduce((acc, c) => acc + c.metrics.completedTripsTotal, 0);
  const totalRevenueZMW = cities.reduce((acc, c) => acc + c.metrics.revenueZMW, 0);

  const liveTripsTable = [
    { id: 'MR-4987', type: 'Ride', customer: 'Chanda M.', driver: 'Mwamba K.', location: 'Lusaka (CBD)', fareZMW: 80, status: 'On trip' },
    { id: 'MR-4986', type: 'Cargo', customer: 'Mwansa K.', driver: 'Bwalya P.', location: 'Kitwe (CBD)', fareZMW: 340, status: 'Picked up' },
    { id: 'MR-4985', type: 'Boda', customer: 'Grace N.', driver: 'H. Chunga', location: 'Kabulonga', fareZMW: 45, status: 'In transit' },
    { id: 'MR-4984', type: 'Ride', customer: 'Kelvin B.', driver: 'David K.', location: 'Woodlands', fareZMW: 65, status: 'Arriving' },
    { id: 'MR-4983', type: 'Cargo', customer: 'Mujo P.', driver: 'Fisher B.', location: 'Matero', fareZMW: 280, status: 'Delivered' }
  ];

  const filteredLiveTrips = liveTripsTable.filter(
    (t) => liveTripFilter === 'ALL' || t.type === liveTripFilter
  );

  // Handlers
  const handleDriverStateChange = (driverId: string, nextState: DriverOperationalState) => {
    if (
      currentStaffRole !== 'Owner / Super Administrator' &&
      currentStaffRole !== 'Operations Manager' &&
      currentStaffRole !== 'Driver Verification Officer'
    ) {
      showNotice('Permission denied: Your current role cannot modify driver verification or suspension status.');
      return;
    }

    const updated = drivers.map((d) => {
      if (d.id !== driverId) return d;
      const isAvailable = nextState === 'Online and Available';
      const isVerified = nextState !== 'Pending Verification' && nextState !== 'Suspended';
      return {
        ...d,
        operationalState: nextState,
        availableForBookings: isAvailable,
        documentsVerified: isVerified,
        connectionStatus:
          nextState === 'Offline' || nextState === 'Suspended' || nextState === 'Pending Verification'
            ? ('Disconnected' as const)
            : ('Connected (Live GPS)' as const)
      };
    });

    setDrivers(updated);
    MridePlatformStore.savePlatformDrivers(updated);
    TripSecurityAndStateService.recordAuditLog({
      actorId: 'admin_1',
      actorName: currentStaffRole,
      actorRole: 'admin',
      action: `Driver State Updated (${nextState})`,
      category: 'account_status',
      targetId: driverId,
      summary: `Set driver ${driverId} state to ${nextState}.`
    });
    showNotice(`Driver ${driverId} updated to "${nextState}".`);
  };

  const handleSavePricingChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      currentStaffRole !== 'Owner / Super Administrator' &&
      currentStaffRole !== 'Finance Officer' &&
      currentStaffRole !== 'Operations Manager'
    ) {
      showNotice('Permission denied: Only Owner, Finance Officer or Operations Manager can change pricing.');
      return;
    }

    FairFareEngine.updateConfig('admin', {
      minFareZMW: minFareInput,
      commissionRatePercent: serviceFeeInput
    });

    const updatedContent: MrideContentSettings = {
      ...contentSettings,
      baseShortestFareZMW: minFareInput,
      minEconomyFareZMW: minFareInput,
      minComfortFareZMW: minComfortFareInput,
      driverCommissionPercent: serviceFeeInput
    };
    setContentSettings(updatedContent);
    saveMrideContent(updatedContent);

    const updatedCities = cities.map((c) => {
      if (c.id !== selectedPricingCityId) return c;
      return {
        ...c,
        configVersion: c.configVersion + 1,
        pricing: {
          ...c.pricing,
          rides: {
            ...c.pricing.rides,
            baseFareZMW: baseFareInput,
            perKmZMW: perKmInput,
            perMinZMW: perMinInput,
            minFareZMW: minFareInput,
            commissionPercent: serviceFeeInput
          }
        }
      };
    });
    setCities(updatedCities);
    MridePlatformStore.saveCities(updatedCities);
    showNotice('Fare & FairFare rules saved and published to connected mobile apps.');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const assignee = employees.find((emp) => emp.id === newTaskAssigneeId) || employees[0];
    const newTask: WorkTaskItem = {
      id: `TSK-${Math.floor(105 + Math.random() * 890)}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Assigned via Mride Control Centre.',
      assignedToId: assignee.id,
      assignedToName: assignee.fullName,
      cityCode: newTaskCity,
      priority: newTaskPriority,
      status: 'Not Started',
      dueDate: newTaskDue,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedBy: currentStaffRole
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    MridePlatformStore.saveWorkTasks(updated);
    setNewTaskTitle('');
    setNewTaskDesc('');
    showNotice(`Work task ${newTask.id} assigned to ${assignee.fullName}.`);
  };

  const handleUpdateTaskStatus = (taskId: string, nextStatus: WorkTaskStatus) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus, updatedBy: currentStaffRole } : t));
    setTasks(updated);
    MridePlatformStore.saveWorkTasks(updated);
    showNotice(`Task ${taskId} moved to "${nextStatus}".`);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim()) return;
    const newEmp: EmployeeRecord = {
      id: `emp_${Date.now()}`,
      fullName: empName.trim(),
      email: empEmail.trim(),
      phone: empPhone.trim(),
      department: empDept,
      jobTitle: empTitle.trim(),
      role: empRole,
      assignedCityCode: empCity,
      reportsTo: 'Mulenga Bwalya',
      status: 'Active',
      joinedDate: new Date().toISOString().slice(0, 10),
      completedTasksCount: 0
    };
    const updated = [...employees, newEmp];
    setEmployees(updated);
    MridePlatformStore.saveEmployees(updated);
    setShowAddEmployeeModal(false);
    setEmpName('');
    setEmpEmail('');
    showNotice(`Employee ${newEmp.fullName} (${newEmp.role}) added.`);
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;
    const updated = MridePlatformStore.addTicketReply({
      ticketId: selectedTicket.ticketId,
      senderName: `Mride Support (${currentStaffRole})`,
      senderRole: ticketNoteMode,
      message: ticketReplyText.trim(),
      newStatus: ticketNoteMode === 'support_agent' ? 'In Progress' : selectedTicket.status
    });
    setTickets(updated);
    const refreshed = updated.find((t) => t.ticketId === selectedTicket.ticketId) || null;
    setSelectedTicket(refreshed);
    setTicketReplyText('');
    showNotice(
      ticketNoteMode === 'internal_note'
        ? `Private internal note recorded on ${selectedTicket.ticketId}.`
        : `Reply sent to customer on ${selectedTicket.ticketId}.`
    );
  };

  const handleResolveTicket = (ticketId: string) => {
    const updated = MridePlatformStore.addTicketReply({
      ticketId,
      senderName: `Mride Support (${currentStaffRole})`,
      senderRole: 'support_agent',
      message: 'Issue marked as Resolved by Mride Support. Thank you for riding with Mride!',
      newStatus: 'Resolved'
    });
    setTickets(updated);
    setSelectedTicket(updated.find((t) => t.ticketId === ticketId) || null);
    showNotice(`Ticket ${ticketId} marked as Resolved.`);
  };

  const handlePublishNewCity = () => {
    const savedList = MridePlatformStore.addOrUpdateCity(
      { ...draftCity, status: 'Approved for Launch' },
      currentStaffRole
    );
    const res = MridePlatformStore.approveAndPublishCity({
      cityId: draftCity.id,
      approverName: 'Chilombo M.',
      approverRole: currentStaffRole
    });
    if (!res.success) {
      showNotice(res.message);
      return;
    }
    setCities(MridePlatformStore.getCities());
    setShowAddCityWizard(false);
    setWizardStep(1);
    showNotice(res.message);
    void savedList;
  };

  const handleToggleCitySuspension = (city: CityServiceAreaConfig) => {
    const nextStatus = city.status === 'Live' ? 'Temporarily Suspended' : 'Live';
    const updated = MridePlatformStore.updateCityStatus({
      cityId: city.id,
      newStatus: nextStatus,
      reason:
        nextStatus === 'Temporarily Suspended'
          ? 'Temporarily suspended by Admin for operational review (active trips protected)'
          : 'Operations restored after administrative review',
      actorName: currentStaffRole
    });
    setCities(updated);
    showNotice(`${city.cityName} status updated to "${nextStatus}".`);
  };

  const auditLogs = TripSecurityAndStateService.getAuditLogs();
  const campaigns = DriverGoalsService.getCampaigns();
  const isOwner = currentStaffRole === 'Owner / Super Administrator';

  // Owner-Only Handler: Assign Staff Member to a Dedicated Management System & Issue Password
  const handleOwnerProvisionStaffAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      showNotice('Access Denied: Only the Owner / Super Administrator (Chilombo M.) can assign staff to systems or issue passwords.');
      return;
    }
    if (!newAccFullName.trim() || !newAccUsername.trim() || !newAccPassword.trim()) {
      showNotice('Please enter the staff full name, username, and assigned password.');
      return;
    }

    const ensuredSystems = Array.from(new Set([newAccPrimarySystem, ...newAccAllowedSystems]));
    const newAccount: StaffSystemAccount = {
      accountId: `acc_${Date.now()}`,
      staffId: `emp_${Date.now()}`,
      fullName: newAccFullName.trim(),
      username: newAccUsername.trim().toLowerCase(),
      email: newAccEmail.trim() || `${newAccUsername.trim().toLowerCase()}@mride.co.zm`,
      phone: newAccPhone.trim(),
      passwordPlain: newAccPassword.trim(),
      accessPin: newAccPin.trim() || '1234',
      role: newAccRole,
      primarySystemId: newAccPrimarySystem,
      allowedSystems: ensuredSystems,
      assignedCityCode: newAccCity,
      accountStatus: 'Active',
      assignedByOwner: 'Chilombo M. (Owner)',
      lastLogin: 'Never (Newly Issued)'
    };

    const updated = [newAccount, ...staffAccounts];
    setStaffAccounts(updated);
    MridePlatformStore.saveStaffSystemAccounts(updated);

    TripSecurityAndStateService.recordAuditLog({
      actorId: 'admin_owner',
      actorName: 'Chilombo M. (Owner)',
      actorRole: 'admin',
      action: `Assigned Staff "${newAccount.fullName}" to System [${newAccount.primarySystemId}]`,
      category: 'account_status',
      targetId: newAccount.username,
      summary: `Issued credentials for ${newAccount.username} (${newAccount.role}) in ${newAccount.assignedCityCode}.`
    });

    setNewAccFullName('');
    setNewAccUsername('');
    setNewAccEmail('');
    showNotice(
      `Staff account "${newAccount.username}" created! Assigned to ${newAccount.role} with your custom password.`
    );
  };

  const handleOwnerResetStaffPassword = (accountId: string, newPassword: string) => {
    if (!isOwner) {
      showNotice('Access Denied: Only the Owner can reset or change staff passwords.');
      return;
    }
    const updated = staffAccounts.map((acc) =>
      acc.accountId === accountId ? { ...acc, passwordPlain: newPassword } : acc
    );
    setStaffAccounts(updated);
    MridePlatformStore.saveStaffSystemAccounts(updated);
    showNotice('Staff password updated by Owner.');
  };

  const handleOwnerToggleAccountLock = (accountId: string) => {
    if (!isOwner) {
      showNotice('Access Denied: Only the Owner can lock or unlock staff system access.');
      return;
    }
    const updated = staffAccounts.map((acc) => {
      if (acc.accountId !== accountId) return acc;
      if (acc.role === 'Owner / Super Administrator') return acc;
      const nextStatus: StaffSystemAccount['accountStatus'] =
        acc.accountStatus === 'Active' ? 'Locked' : 'Active';
      return { ...acc, accountStatus: nextStatus };
    });
    setStaffAccounts(updated);
    MridePlatformStore.saveStaffSystemAccounts(updated);
    showNotice('Staff system access status updated by Owner.');
  };

  const handleStaffCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = MridePlatformStore.authenticateStaffAccount(loginUsername, loginPassword);
    if (!res.success || !res.account) {
      setLoginError(res.message);
      return;
    }
    setActiveStaffAccount(res.account);
    setCurrentStaffRole(res.account.role);
    setActiveSection(res.account.primarySystemId);
    setShowStaffLoginModal(false);
    setLoginError(null);
    setLoginUsername('');
    setLoginPassword('');
    showNotice(
      `Signed in as ${res.account.fullName} (${res.account.role}). Routed to assigned system: ${res.account.primarySystemId}.`
    );
  };

  const handleAddB2BContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b2bCompanyInput.trim() || !b2bTpinInput.trim()) return;
    const created: CorporateB2BAccount = {
      id: `b2b_${Date.now()}`,
      companyName: b2bCompanyInput.trim(),
      zraTpin: b2bTpinInput.trim(),
      contactPerson: b2bContactInput.trim() || 'Corporate Fleet Manager',
      phone: '+260 97 700 1122',
      cityCode: 'ZM-LSK',
      contractType: 'Full Enterprise Mobility',
      monthlyCreditLimitZMW: b2bLimitInput,
      currentSpendZMW: 0,
      activeVehiclesAssigned: 10,
      status: 'Active Contract'
    };
    const updated = [created, ...b2bAccounts];
    setB2bAccounts(updated);
    MridePlatformStore.saveCorporateB2BAccounts(updated);
    setB2bCompanyInput('');
    setB2bTpinInput('');
    setB2bContactInput('');
    showNotice(`Enterprise B2B contract created for ${created.companyName}.`);
  };

  const handleUpdateSOSStatus = (incidentId: string, status: EmergencySOSIncident['status']) => {
    const updated = sosIncidents.map((inc) =>
      inc.incidentId === incidentId ? { ...inc, status } : inc
    );
    setSosIncidents(updated);
    MridePlatformStore.saveSOSIncidents(updated);
    showNotice(`Emergency SOS ${incidentId} updated to "${status}".`);
  };

  const handleUpdateComplianceStatus = (filingId: string, status: ComplianceFilingRecord['status']) => {
    const updated = complianceFilings.map((f) =>
      f.filingId === filingId ? { ...f, status } : f
    );
    setComplianceFilings(updated);
    MridePlatformStore.saveComplianceFilings(updated);
    showNotice(`Compliance record ${filingId} marked as "${status}".`);
  };

  const allSidebarItems: Array<{
    id: AdminNavSection;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string | number;
    ownerOnly?: boolean;
  }> = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'iam_access_vault', label: 'Owner IAM & Passwords', icon: KeyRound, badge: 'OWNER', ownerOnly: true },
    { id: 'cities', label: 'Cities & Expansion', icon: MapPin, badge: cities.length },
    { id: 'rides_deliveries', label: 'National Dispatch & Trips', icon: Truck },
    { id: 'drivers', label: 'Driver Fleet & GPS', icon: Car, badge: drivers.length },
    { id: 'kyc_verification_hub', label: 'RTSA Driver KYC Lab', icon: FileCheck2, badge: drivers.filter((d) => !d.documentsVerified).length },
    { id: 'safety_sos_command', label: '999 SOS & Safety Command', icon: ShieldAlert, badge: sosIncidents.filter((i) => i.status !== 'Resolved & Logged').length },
    { id: 'corporate_b2b_logistics', label: 'Corporate B2B & Fleet', icon: Building2, badge: b2bAccounts.length },
    { id: 'users', label: 'Passenger CRM', icon: Users },
    { id: 'support_tickets', label: 'Support & Disputes', icon: Headphones, badge: tickets.filter((t) => t.status !== 'Resolved').length },
    { id: 'call_centre_voip', label: 'VoIP Call Centre & QA', icon: PhoneCall },
    { id: 'employees_tasks', label: 'HR, Staff & Work Tasks', icon: Briefcase, badge: tasks.filter((t) => t.status !== 'Completed').length },
    { id: 'finance', label: 'Finance & Treasury', icon: Wallet },
    { id: 'fairfare_pricing', label: 'FairFare & Tariffs', icon: Sliders },
    { id: 'promotions', label: 'Promotions & Growth', icon: Megaphone },
    { id: 'website_content', label: 'Website & Brand CMS', icon: Globe2 },
    { id: 'app_config', label: 'Mobile App Config', icon: Smartphone },
    { id: 'legal_compliance_hub', label: 'ZRA Tax & RTSA Legal', icon: Scale },
    { id: 'reports_security', label: 'Security & Audit Logs', icon: FileBarChart }
  ];

  // Filter visible management systems: Owner sees ALL 19 systems; other staff only see the systems assigned to them by the Owner
  const sidebarItems = isOwner
    ? allSidebarItems
    : allSidebarItems.filter(
        (item) => !item.ownerOnly && activeStaffAccount.allowedSystems.includes(item.id)
      );

  const draftReadiness = MridePlatformStore.checkCityLaunchReadiness(draftCity);
  const currentSystemMeta =
    ALL_MANAGEMENT_SYSTEM_META.find((m) => m.id === activeSection) || ALL_MANAGEMENT_SYSTEM_META[0];
  const assignedOfficerForSystem =
    staffAccounts.find((a) => a.primarySystemId === activeSection) || activeStaffAccount;

  const getOfficeSheetSpec = (
    section: AdminNavSection
  ): {
    sheetTitle: string;
    sheetSubtitle: string;
    officeBadge: string;
    columns: SpreadsheetColumn[];
    initialRows: SpreadsheetRow[];
    sumColumnKeys: string[];
  } => {
    switch (section) {
      case 'finance':
      case 'fairfare_pricing':
        return {
          sheetTitle: 'Mride National Finance, Treasury & Mobile Money Master Ledger',
          sheetSubtitle:
            'Daily ZMW revenue, 10% platform commissions, Airtel Money / MTN MoMo settlements, driver payouts & ZRA 16% VAT records',
          officeBadge: 'Finance & Treasury Office Sheet',
          columns: [
            { key: 'txRef', label: 'Settlement Ref' },
            { key: 'date', label: 'Date' },
            { key: 'city', label: 'City Office' },
            { key: 'channel', label: 'Payment Channel' },
            { key: 'grossZMW', label: 'Gross Fare Volume (ZMW)', type: 'currency_zmw' },
            { key: 'commissionZMW', label: 'Mride 10% Commission (ZMW)', type: 'currency_zmw' },
            { key: 'driverPayoutZMW', label: 'Net Driver Payout (ZMW)', type: 'currency_zmw' },
            { key: 'zraVatZMW', label: 'ZRA Smart Invoice VAT (ZMW)', type: 'currency_zmw' },
            { key: 'status', label: 'Reconciliation Status', type: 'status' }
          ],
          initialRows: [
            {
              id: 'fin_1',
              cells: {
                txRef: 'FIN-2026-8801',
                date: '2026-10-27',
                city: 'Lusaka (ZM-LSK)',
                channel: 'Airtel Money Zambia',
                grossZMW: 142500,
                commissionZMW: 14250,
                driverPayoutZMW: 128250,
                zraVatZMW: 2280,
                status: 'Reconciled'
              }
            },
            {
              id: 'fin_2',
              cells: {
                txRef: 'FIN-2026-8802',
                date: '2026-10-27',
                city: 'Lusaka (ZM-LSK)',
                channel: 'MTN MoMo Zambia',
                grossZMW: 118900,
                commissionZMW: 11890,
                driverPayoutZMW: 107010,
                zraVatZMW: 1902.4,
                status: 'Reconciled'
              }
            },
            {
              id: 'fin_3',
              cells: {
                txRef: 'FIN-2026-8803',
                date: '2026-10-27',
                city: 'Kitwe (ZM-KTW)',
                channel: 'Airtel Money & MTN MoMo',
                grossZMW: 98500,
                commissionZMW: 9850,
                driverPayoutZMW: 88650,
                zraVatZMW: 1576,
                status: 'Reconciled'
              }
            },
            {
              id: 'fin_4',
              cells: {
                txRef: 'FIN-2026-8804',
                date: '2026-10-27',
                city: 'Ndola (ZM-NDL)',
                channel: 'ZMW Cash & Mobile Money',
                grossZMW: 52400,
                commissionZMW: 5240,
                driverPayoutZMW: 47160,
                zraVatZMW: 838.4,
                status: 'Verified'
              }
            },
            {
              id: 'fin_5',
              cells: {
                txRef: 'FIN-2026-8805',
                date: '2026-10-27',
                city: 'Livingstone (ZM-LVI)',
                channel: 'Pre-Launch Pilot Settlement',
                grossZMW: 19260,
                commissionZMW: 1926,
                driverPayoutZMW: 17334,
                zraVatZMW: 308.16,
                status: 'Pending Audit'
              }
            }
          ],
          sumColumnKeys: ['grossZMW', 'commissionZMW', 'driverPayoutZMW', 'zraVatZMW']
        };

      case 'employees_tasks':
        return {
          sheetTitle: 'Mride HR, Staff Payroll, NAPSA & Work Performance Master Sheet',
          sheetSubtitle:
            'Official employee register, monthly ZMW salaries, NAPSA / PAYE statutory deductions & completed task scores',
          officeBadge: 'HR & Payroll Office Sheet',
          columns: [
            { key: 'empCode', label: 'Staff ID' },
            { key: 'fullName', label: 'Employee Full Name' },
            { key: 'department', label: 'Department Office' },
            { key: 'role', label: 'Assigned System Role' },
            { key: 'city', label: 'City Station' },
            { key: 'grossSalaryZMW', label: 'Monthly Gross Salary (ZMW)', type: 'currency_zmw' },
            { key: 'napsaZMW', label: 'NAPSA 5% Deduction (ZMW)', type: 'currency_zmw' },
            { key: 'netPayZMW', label: 'Net Take-Home Pay (ZMW)', type: 'currency_zmw' },
            { key: 'tasksCompleted', label: 'Tasks Completed', type: 'number' },
            { key: 'status', label: 'Payroll Status', type: 'status' }
          ],
          initialRows: employees.map((e, idx) => ({
            id: `hr_${e.id}`,
            cells: {
              empCode: `EMP-00${idx + 1}`,
              fullName: e.fullName,
              department: e.department,
              role: e.role,
              city: e.assignedCityCode || 'ZM-LSK',
              grossSalaryZMW: idx === 0 ? 45000 : 18500 - idx * 1200,
              napsaZMW: idx === 0 ? 1350 : 925,
              netPayZMW: idx === 0 ? 43650 : 17575 - idx * 1200,
              tasksCompleted: e.completedTasksCount,
              status: e.status
            }
          })),
          sumColumnKeys: ['grossSalaryZMW', 'napsaZMW', 'netPayZMW', 'tasksCompleted']
        };

      case 'drivers':
      case 'kyc_verification_hub':
        return {
          sheetTitle: 'RTSA Driver Fleet, PSV License & Earnings Record Sheet',
          sheetSubtitle:
            'Complete national registry of Mride drivers, vehicle plates, RTSA PSV permit numbers, GPS status & ZMW earnings',
          officeBadge: 'Driver Fleet & KYC Office Sheet',
          columns: [
            { key: 'drvCode', label: 'Driver ID' },
            { key: 'name', label: 'Driver Full Name' },
            { key: 'phone', label: 'Phone Number' },
            { key: 'city', label: 'City' },
            { key: 'vehicle', label: 'Vehicle & Plate' },
            { key: 'rtsaPermit', label: 'RTSA PSV Permit #' },
            { key: 'trips', label: 'Completed Trips', type: 'number' },
            { key: 'earningsZMW', label: 'Total Earnings (ZMW)', type: 'currency_zmw' },
            { key: 'status', label: 'Operational State', type: 'status' }
          ],
          initialRows: drivers.map((d) => ({
            id: `drv_row_${d.id}`,
            cells: {
              drvCode: d.id.toUpperCase(),
              name: d.name,
              phone: d.phone,
              city: d.cityName,
              vehicle: `${d.vehicleModel} (${d.vehiclePlate})`,
              rtsaPermit: d.rtsaLicenseNumber,
              trips: d.completedTrips,
              earningsZMW: d.earningsZMW,
              status: d.operationalState
            }
          })),
          sumColumnKeys: ['trips', 'earningsZMW']
        };

      case 'corporate_b2b_logistics':
        return {
          sheetTitle: 'Corporate B2B Contracts, ZRA TPIN Billing & Fleet Credit Sheet',
          sheetSubtitle:
            'Enterprise client ledger, monthly ZMW credit limits, active invoice balances & assigned shuttle/cargo vehicles',
          officeBadge: 'Corporate B2B Office Sheet',
          columns: [
            { key: 'contractId', label: 'Contract ID' },
            { key: 'company', label: 'Corporate Client Name' },
            { key: 'tpin', label: 'ZRA TPIN' },
            { key: 'contact', label: 'Account Manager' },
            { key: 'serviceType', label: 'Contract Tier' },
            { key: 'creditLimitZMW', label: 'Credit Limit (ZMW)', type: 'currency_zmw' },
            { key: 'currentSpendZMW', label: 'Current Spend (ZMW)', type: 'currency_zmw' },
            { key: 'vehicles', label: 'Assigned Vehicles', type: 'number' },
            { key: 'status', label: 'Contract Status', type: 'status' }
          ],
          initialRows: b2bAccounts.map((b) => ({
            id: `b2b_row_${b.id}`,
            cells: {
              contractId: b.id.toUpperCase(),
              company: b.companyName,
              tpin: b.zraTpin,
              contact: b.contactPerson,
              serviceType: b.contractType,
              creditLimitZMW: b.monthlyCreditLimitZMW,
              currentSpendZMW: b.currentSpendZMW,
              vehicles: b.activeVehiclesAssigned,
              status: b.status
            }
          })),
          sumColumnKeys: ['creditLimitZMW', 'currentSpendZMW', 'vehicles']
        };

      case 'cities':
        return {
          sheetTitle: 'Mride City Expansion & Regional Performance Master Sheet',
          sheetSubtitle:
            'City-by-city passenger registrations, verified drivers, completed trips, gross ZMW revenue & commissions',
          officeBadge: 'City Expansion Office Sheet',
          columns: [
            { key: 'cityCode', label: 'City Code' },
            { key: 'cityName', label: 'City Name' },
            { key: 'manager', label: 'Assigned City Manager' },
            { key: 'passengers', label: 'Registered Passengers', type: 'number' },
            { key: 'verifiedDrivers', label: 'Verified Drivers', type: 'number' },
            { key: 'completedTrips', label: 'Completed Trips', type: 'number' },
            { key: 'revenueZMW', label: 'City Revenue (ZMW)', type: 'currency_zmw' },
            { key: 'commissionsZMW', label: 'Net Commission (ZMW)', type: 'currency_zmw' },
            { key: 'status', label: 'Launch Status', type: 'status' }
          ],
          initialRows: cities.map((c) => ({
            id: `city_row_${c.id}`,
            cells: {
              cityCode: c.cityCode,
              cityName: c.cityName,
              manager: c.assignedManagerName,
              passengers: c.metrics.registeredPassengers,
              verifiedDrivers: c.metrics.verifiedDrivers,
              completedTrips: c.metrics.completedTripsTotal,
              revenueZMW: c.metrics.revenueZMW,
              commissionsZMW: c.metrics.commissionsZMW,
              status: c.status
            }
          })),
          sumColumnKeys: ['passengers', 'verifiedDrivers', 'completedTrips', 'revenueZMW', 'commissionsZMW']
        };

      case 'legal_compliance_hub':
        return {
          sheetTitle: 'ZRA Tax Returns, RTSA Permits & Statutory Filings Register',
          sheetSubtitle:
            'Official statutory compliance log for Zambia Revenue Authority (ZRA), RTSA, PACRA & Data Protection Commissioner',
          officeBadge: 'Legal & Tax Office Sheet',
          columns: [
            { key: 'filingId', label: 'Filing Ref #' },
            { key: 'authority', label: 'Regulatory Authority' },
            { key: 'title', label: 'Statutory Filing Description' },
            { key: 'period', label: 'Tax / Audit Period' },
            { key: 'dueDate', label: 'Statutory Due Date' },
            { key: 'amountZMW', label: 'Remittance Amount (ZMW)', type: 'currency_zmw' },
            { key: 'officer', label: 'Compliance Officer' },
            { key: 'status', label: 'Filing Status', type: 'status' }
          ],
          initialRows: complianceFilings.map((f) => ({
            id: `cmp_row_${f.filingId}`,
            cells: {
              filingId: f.filingId,
              authority: f.authority,
              title: f.title,
              period: f.period,
              dueDate: f.dueDate,
              amountZMW: f.amountZMW || 0,
              officer: f.handledBy,
              status: f.status
            }
          })),
          sumColumnKeys: ['amountZMW']
        };

      default:
        return {
          sheetTitle: `${currentSystemMeta.label} — Official Office Record Sheet`,
          sheetSubtitle: `Structured Google Sheets / Excel operational register for ${currentSystemMeta.dedicatedRole}`,
          officeBadge: `${currentSystemMeta.category} Record Sheet`,
          columns: [
            { key: 'recordId', label: 'Record ID' },
            { key: 'date', label: 'Date' },
            { key: 'city', label: 'City Office' },
            { key: 'title', label: 'Item / Activity Description' },
            { key: 'owner', label: 'Responsible Officer' },
            { key: 'amountZMW', label: 'Financial Value (ZMW)', type: 'currency_zmw' },
            { key: 'status', label: 'Record Status', type: 'status' }
          ],
          initialRows: [
            {
              id: 'gen_1',
              cells: {
                recordId: 'REC-2026-101',
                date: '2026-10-27',
                city: 'Lusaka (ZM-LSK)',
                title: `${currentSystemMeta.label} — Daily Operational Log & Audit`,
                owner: assignedOfficerForSystem.fullName,
                amountZMW: 48500,
                status: 'Verified'
              }
            },
            {
              id: 'gen_2',
              cells: {
                recordId: 'REC-2026-102',
                date: '2026-10-27',
                city: 'Kitwe (ZM-KTW)',
                title: `Copperbelt Regional ${currentSystemMeta.label} Settlement`,
                owner: 'Bwalya Chishimba',
                amountZMW: 19400,
                status: 'Verified'
              }
            },
            {
              id: 'gen_3',
              cells: {
                recordId: 'REC-2026-103',
                date: '2026-10-27',
                city: 'Ndola (ZM-NDL)',
                title: `Ndola Office ${currentSystemMeta.label} Verification`,
                owner: assignedOfficerForSystem.fullName,
                amountZMW: 12300,
                status: 'Active'
              }
            }
          ],
          sumColumnKeys: ['amountZMW']
        };
    }
  };

  const activeSheetSpec = getOfficeSheetSpec(activeSection);

  return (
    <div className="min-h-[820px] rounded-3xl overflow-hidden border border-slate-200 bg-[#F4F6F9] flex flex-col lg:flex-row shadow-xl text-[#15191C]">
      {/* ================= LEFT DARK NAVY SIDEBAR (Matches Uploaded Reference Bottom-Left) ================= */}
      <aside className="w-full lg:w-64 bg-[#0B1528] text-white flex flex-col justify-between shrink-0">
        <div>
          {/* Top Brand Logo */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF6500] flex items-center justify-center font-extrabold text-white shadow-md">
                <img src="/mride-mark.svg" alt="Mride" className="w-7 h-7" />
              </div>
              <div>
                <span className="font-display font-extrabold text-lg tracking-tight text-white block leading-none">
                  Mride
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Control Centre
                </span>
              </div>
            </div>
          </div>

          {/* Grouped Office Departments Navigation Menu */}
          <nav className="p-3 space-y-1 overflow-x-auto lg:overflow-visible flex lg:flex-col gap-1 max-h-[640px] lg:overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const meta = ALL_MANAGEMENT_SYSTEM_META.find((m) => m.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 lg:w-full text-left ${
                    isActive
                      ? 'bg-[#FF6500] text-white shadow-md'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <span className="block truncate leading-tight">{item.label}</span>
                      {meta && (
                        <span
                          className={`block text-[9px] truncate ${
                            isActive ? 'text-white/80' : 'text-slate-400'
                          }`}
                        >
                          {meta.category} Office
                        </span>
                      )}
                    </div>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isActive ? 'bg-white text-[#FF6500]' : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Admin Profile, Staff Login Gate & Role Selector */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#081020]">
          <div className="flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80"
              alt="Admin"
              className="w-9 h-9 rounded-full object-cover border border-[#FF6500]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-white truncate">{activeStaffAccount.fullName}</p>
              <p className="text-[10px] text-[#FF6500] truncate font-semibold">{currentStaffRole}</p>
              <p className="text-[9px] text-slate-400 truncate font-mono">
                @{activeStaffAccount.username} • {activeStaffAccount.allowedSystems.length} Systems
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setLoginError(null);
                setShowStaffLoginModal(true);
              }}
              className="rounded-lg bg-white/10 hover:bg-white/20 text-white px-2 py-1.5 text-[10px] font-extrabold flex items-center justify-center gap-1"
            >
              <KeyRound className="w-3 h-3 text-[#FF6500]" />
              <span>Staff Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const ownerAcc = staffAccounts[0];
                setActiveStaffAccount(ownerAcc);
                setCurrentStaffRole('Owner / Super Administrator');
                setActiveSection('iam_access_vault');
                showNotice('Switched to Owner / Super Administrator Master Vault (Chilombo M.).');
              }}
              className="rounded-lg bg-[#FF6500] hover:bg-[#e55a00] text-white px-2 py-1.5 text-[10px] font-extrabold flex items-center justify-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Owner Vault</span>
            </button>
          </div>

          <div>
            <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              Preview / Switch Role System
            </label>
            <select
              value={currentStaffRole}
              onChange={(e) => {
                const nextRole = e.target.value as AdminStaffRole;
                setCurrentStaffRole(nextRole);
                const matchingAcc = staffAccounts.find((a) => a.role === nextRole);
                if (matchingAcc) {
                  setActiveStaffAccount(matchingAcc);
                  setActiveSection(matchingAcc.primarySystemId);
                }
              }}
              className="w-full rounded-lg bg-[#0B1528] border border-white/15 px-2 py-1.5 text-[11px] text-white font-semibold"
            >
              {([
                'Owner / Super Administrator',
                'Operations Manager',
                'City Manager',
                'HR / Employee Manager',
                'Customer Support Agent',
                'Driver Verification Officer',
                'Finance Officer',
                'Content Manager',
                'Corporate & B2B Fleet Director',
                'Emergency SOS & Safety Commander',
                'Legal, ZRA Tax & RTSA Compliance Officer',
                'Call Centre & VoIP Quality Supervisor'
              ] as AdminStaffRole[]).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="w-full flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white pt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Return to Public Website</span>
            </button>
          )}
        </div>
      </aside>

      {/* ================= RIGHT MAIN WORKSPACE ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Utility Bar */}
        <header className="bg-white border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drivers, trips, cities, tickets..."
              className="w-full rounded-xl bg-[#F4F6F9] border border-slate-200 pl-9 pr-3 py-2 text-xs font-medium text-[#15191C] outline-none focus:border-[#FF6500]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-[#F4F6F9] px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-[#FF6500]" />
              <span>Oct 2026 • {activeCity}, {country.name}</span>
            </div>

            <button
              onClick={() => {
                setShowAddCityWizard(true);
                setActiveSection('cities');
              }}
              className="rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold px-3.5 py-2 text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add New City
            </button>

            <button
              onClick={() => setActiveSection('support_tickets')}
              className="relative p-2 rounded-xl bg-[#F4F6F9] text-slate-700 hover:text-[#FF6500]"
              title="Unresolved Support Tickets"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                {tickets.filter((t) => t.status !== 'Resolved').length}
              </span>
            </button>
          </div>
        </header>

        {adminToast && (
          <div className="mx-5 mt-4 rounded-2xl bg-[#FFF0E6] border border-[#FF6500] px-4 py-3 text-xs font-extrabold text-[#15191C] flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF6500] shrink-0" />
              {adminToast}
            </span>
            <button onClick={() => setAdminToast(null)} className="text-[#FF6500] underline ml-3">
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* ================= UNIFIED OFFICE COMMAND HEADER & GOOGLE SHEETS / EXCEL SWITCHER ================= */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0B1528] text-[#FF6500] flex items-center justify-center font-extrabold shrink-0 shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#FF6500]">
                    {currentSystemMeta.category} Office
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Dedicated Role: <strong className="text-[#15191C]">{currentSystemMeta.dedicatedRole}</strong>
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Assigned: {assignedOfficerForSystem.fullName} (@{assignedOfficerForSystem.username})
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#15191C] mt-0.5">
                  {currentSystemMeta.label}
                </h2>
              </div>
            </div>

            {/* Workspace Mode Switcher: Visual Office Console vs Google Sheets / Excel Record Book vs Office Docs/Slides/Forms */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="bg-[#F4F6F9] p-1 rounded-xl border border-slate-200 flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setOfficeViewTab('operations')}
                  className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center gap-1.5 ${
                    officeViewTab === 'operations'
                      ? 'bg-[#0B1528] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-[#15191C]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Office Console</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOfficeViewTab('spreadsheet_ledger')}
                  className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center gap-1.5 ${
                    officeViewTab === 'spreadsheet_ledger'
                      ? 'bg-[#0F4C29] text-white shadow-2xs'
                      : 'text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Google Sheets / Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOfficeViewTab('office_docs')}
                  className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center gap-1.5 ${
                    officeViewTab === 'office_docs'
                      ? 'bg-[#FF6500] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-[#15191C]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Office Docs, Slides & Forms</span>
                </button>
              </div>

              {isOwner && activeSection !== 'iam_access_vault' && (
                <button
                  type="button"
                  onClick={() => setActiveSection('iam_access_vault')}
                  className="rounded-xl bg-[#FFF0E6] hover:bg-[#FF6500] text-[#FF6500] hover:text-white border border-[#FF6500]/30 font-extrabold px-3 py-2 text-xs flex items-center gap-1 transition-colors"
                  title="Assign staff or change password for this office"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Assign Staff / Password</span>
                </button>
              )}
            </div>
          </div>

          {/* ================= LIVE INTERACTIVE GOOGLE SHEETS / EXCEL WORKBOOK FOR THIS OFFICE ================= */}
          {officeViewTab === 'spreadsheet_ledger' && (
            <OfficeSpreadsheetEngine
              key={activeSection}
              sheetTitle={activeSheetSpec.sheetTitle}
              sheetSubtitle={activeSheetSpec.sheetSubtitle}
              officeBadge={activeSheetSpec.officeBadge}
              columns={activeSheetSpec.columns}
              initialRows={activeSheetSpec.initialRows}
              storageKey={`mride_office_sheet_${activeSection}_v1`}
              sumColumnKeys={activeSheetSpec.sumColumnKeys}
              onSaveNotice={showNotice}
            />
          )}

          {/* ================= FUNCTIONAL MRIDE OFFICE SUITE: DOCUMENTS, PRESENTATIONS & FORMS ================= */}
          {officeViewTab === 'office_docs' && (
            <OfficeSuiteWorkspace
              key={`docs_${activeSection}`}
              departmentName={currentSystemMeta.label}
              actorName={`${activeStaffAccount.fullName} (${currentStaffRole})`}
              onNotice={showNotice}
            />
          )}

          {/* =====================================================================
              MODULE 1: EXECUTIVE DASHBOARD (Matches Uploaded Reference Bottom-Left)
             ===================================================================== */}
          {activeSection === 'dashboard' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl font-extrabold text-[#15191C]">Dashboard</h1>
                  <p className="text-xs text-slate-500">Overview of your platform's performance across {cities.filter((c) => c.status === 'Live').length} live cities</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-[#FFF0E6] text-[#FF6500] text-xs font-extrabold">
                    In Progress ({tasks.filter((t) => t.status !== 'Completed').length})
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold">
                    Live Cities ({cities.filter((c) => c.status === 'Live').length})
                  </span>
                </div>
              </div>

              {/* 6 Executive KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {[
                  { label: 'Total Passengers', value: totalPassengers.toLocaleString(), trend: '+12%', up: true },
                  { label: 'Total Drivers', value: totalDrivers.toLocaleString(), trend: '+8%', up: true },
                  { label: 'Active Drivers', value: totalVerifiedDrivers.toLocaleString(), trend: '+5%', up: true },
                  { label: 'Pending Verification', value: totalPendingDrivers.toLocaleString(), trend: '-3%', up: false },
                  { label: 'Total Trips', value: totalTrips.toLocaleString(), trend: '+18%', up: true },
                  { label: 'Total Revenue', value: `K${totalRevenueZMW.toLocaleString()}`, trend: '+14%', up: true }
                ].map((kpi, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 block">{kpi.label}</span>
                    <span className="text-xl font-extrabold text-[#15191C] block">{kpi.value}</span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                        kpi.up ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {kpi.trend} vs last week
                    </span>
                  </div>
                ))}
              </div>

              {/* Middle Row: Bookings & Deliveries Chart + Service Distribution Donut + Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Bookings & Deliveries Trend Chart */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#15191C]">Bookings & Deliveries</h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-[#FF6500]">
                        <span className="w-2 h-2 rounded-full bg-[#FF6500]" /> Rides
                      </span>
                      <span className="flex items-center gap-1 text-sky-600">
                        <span className="w-2 h-2 rounded-full bg-sky-600" /> Cargo
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" /> Boda Delivery
                      </span>
                    </div>
                  </div>

                  {/* Clean SVG Multi-Line Chart */}
                  <div className="pt-2">
                    <svg viewBox="0 0 360 140" className="w-full h-36 overflow-visible">
                      <defs>
                        <linearGradient id="ridesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF6500" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#FF6500" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {[25, 55, 85, 115].map((y) => (
                        <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                      ))}
                      <path
                        d="M 10 95 L 65 80 L 120 84 L 175 62 L 230 50 L 285 55 L 350 25 L 350 125 L 10 125 Z"
                        fill="url(#ridesGrad)"
                      />
                      {/* Rides Line */}
                      <polyline
                        fill="none"
                        stroke="#FF6500"
                        strokeWidth="3"
                        points="10,95 65,80 120,84 175,62 230,50 285,55 350,25"
                      />
                      {/* Cargo Line */}
                      <polyline
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="2.5"
                        points="10,110 65,104 120,100 175,92 230,86 285,82 350,72"
                      />
                      {/* Boda Line */}
                      <polyline
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2.5"
                        points="10,118 65,114 120,108 175,105 230,98 285,91 350,84"
                      />
                    </svg>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>

                {/* Service Distribution Donut */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#15191C]">Service Distribution</h3>
                    <span className="text-[11px] font-bold text-[#FF6500]">Live Mix</span>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#FF6500"
                          strokeWidth="4.5"
                          strokeDasharray="55 100"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#0284C7"
                          strokeWidth="4.5"
                          strokeDasharray="22 100"
                          strokeDashoffset="-55"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="4.5"
                          strokeDasharray="23 100"
                          strokeDashoffset="-77"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-extrabold text-[#15191C]">{totalTrips.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400">Total Trips</span>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6500]" /> Rides
                        </span>
                        <strong className="text-[#15191C]">62% (23,046)</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Cargo
                        </span>
                        <strong className="text-[#15191C]">22% (8,170)</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Boda Delivery
                        </span>
                        <strong className="text-[#15191C]">16% (5,988)</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-[#15191C]">Recent Activity</h3>
                    <button
                      onClick={() => setActiveSection('reports_security')}
                      className="text-[11px] font-bold text-[#FF6500] hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {[
                      { title: 'New driver registered', sub: 'Daniel M. • 2 min ago', dot: 'bg-[#FF6500]' },
                      { title: 'Trip completed', sub: 'Lusaka → Kabulonga • 12 min ago', dot: 'bg-emerald-500' },
                      { title: 'New cargo booking', sub: 'Kelvin B. • 25 min ago', dot: 'bg-sky-500' },
                      { title: 'Driver verification approved', sub: 'Grace N. • 38 min ago', dot: 'bg-amber-500' }
                    ].map((act, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.dot}`} />
                        <div>
                          <p className="font-bold text-[#15191C] leading-tight">{act.title}</p>
                          <p className="text-[11px] text-slate-400">{act.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Live Trips & Deliveries Table + Recent Support Tickets + Quick Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Live Trips & Deliveries */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-[#15191C]">Live Trips & Deliveries</h3>
                    <div className="flex items-center gap-1 bg-[#F4F6F9] p-1 rounded-xl text-[11px] font-bold">
                      {(['ALL', 'Ride', 'Cargo', 'Boda'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setLiveTripFilter(tab)}
                          className={`px-2.5 py-1 rounded-lg transition-colors ${
                            liveTripFilter === tab
                              ? 'bg-[#FF6500] text-white'
                              : 'text-slate-600 hover:text-[#15191C]'
                          }`}
                        >
                          {tab === 'ALL' ? 'All (42)' : tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="py-2">ID</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Customer</th>
                          <th className="py-2">Driver</th>
                          <th className="py-2">Location</th>
                          <th className="py-2">Status</th>
                          <th className="py-2 text-right">Fare</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLiveTrips.map((tr) => (
                          <tr key={tr.id} className="hover:bg-slate-50">
                            <td className="py-2.5 font-mono font-bold text-[#15191C]">{tr.id}</td>
                            <td className="py-2.5 font-semibold">{tr.type}</td>
                            <td className="py-2.5">{tr.customer}</td>
                            <td className="py-2.5 font-semibold text-slate-700">{tr.driver}</td>
                            <td className="py-2.5 text-slate-500">{tr.location}</td>
                            <td className="py-2.5">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  tr.status === 'On trip' || tr.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : tr.status === 'Picked up' || tr.status === 'In transit'
                                    ? 'bg-sky-50 text-sky-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {tr.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-extrabold text-[#15191C]">K{tr.fareZMW}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Support Tickets & Quick Alerts */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-[#15191C]">Recent Support Tickets</h3>
                      <button
                        onClick={() => setActiveSection('support_tickets')}
                        className="text-[11px] font-bold text-[#FF6500] hover:underline"
                      >
                        View all
                      </button>
                    </div>
                    <div className="space-y-2">
                      {tickets.slice(0, 3).map((tkt) => (
                        <div
                          key={tkt.ticketId}
                          onClick={() => {
                            setSelectedTicket(tkt);
                            setActiveSection('support_tickets');
                          }}
                          className="cursor-pointer rounded-xl bg-[#F4F6F9] hover:bg-[#FFF0E6]/60 p-3 flex items-center justify-between gap-2 transition-colors"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-extrabold text-[#15191C] block truncate">
                              #{tkt.ticketId} • {tkt.category}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">{tkt.subject}</span>
                          </div>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                              tkt.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tkt.status === 'In Progress'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {tkt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Alerts */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                    <h3 className="text-sm font-extrabold text-[#15191C]">Quick Operational Alerts</h3>
                    <div className="space-y-2 text-xs">
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 flex items-center justify-between">
                        <div>
                          <strong className="text-amber-900 block">Livingstone Expansion Ready for Review</strong>
                          <span className="text-[11px] text-amber-700">192 drivers verified • Awaiting Owner approval</span>
                        </div>
                        <button
                          onClick={() => setActiveSection('cities')}
                          className="text-[11px] font-extrabold text-[#FF6500] shrink-0"
                        >
                          Review
                        </button>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-between">
                        <div>
                          <strong className="text-[#15191C] block">Driver Document Expiry Check</strong>
                          <span className="text-[11px] text-slate-500">14 drivers have RTSA fitness discs expiring in 30 days</span>
                        </div>
                        <button
                          onClick={() => setActiveSection('drivers')}
                          className="text-[11px] font-extrabold text-[#FF6500] shrink-0"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 2: CITIES & SERVICE AREA EXPANSION SYSTEM (5-STEP WIZARD)
             ===================================================================== */}
          {activeSection === 'cities' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500] block">
                    Dynamic Multi-City Expansion Engine
                  </span>
                  <h2 className="text-lg font-extrabold text-[#15191C]">
                    Cities & Service Areas Directory ({cities.length} Configured)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Launch new cities, configure local FairFare pricing & service boundaries, and publish directly to Passenger & Driver mobile apps without a new app-store release.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowAddCityWizard(!showAddCityWizard);
                    setWizardStep(1);
                  }}
                  className="rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddCityWizard ? 'Close City Wizard' : 'Add New City (5-Step Launch)'}</span>
                </button>
              </div>

              {/* 5-STEP ADD NEW CITY WORKFLOW */}
              {showAddCityWizard && (
                <div className="bg-white rounded-3xl p-5 border-2 border-[#FF6500] shadow-lg space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500]">
                        Step {wizardStep} of 5 • Atomic City Launch Workflow
                      </span>
                      <h3 className="text-base font-extrabold text-[#15191C]">
                        {wizardStep === 1 && 'Step 1 — City Details & Service Boundary'}
                        {wizardStep === 2 && 'Step 2 — Select Independent Services'}
                        {wizardStep === 3 && 'Step 3 — Configure Local Pricing, Commissions & Support'}
                        {wizardStep === 4 && 'Step 4 — Automated Launch Readiness Verification'}
                        {wizardStep === 5 && 'Step 5 — Final Owner Approval & Live App Publishing'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setWizardStep(st as 1 | 2 | 3 | 4 | 5)}
                          className={`w-7 h-7 rounded-full text-xs font-extrabold ${
                            wizardStep === st
                              ? 'bg-[#FF6500] text-white'
                              : wizardStep > st
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STEP 1: CITY DETAILS */}
                  {wizardStep === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">City Name</label>
                        <input
                          type="text"
                          value={draftCity.cityName}
                          onChange={(e) => setDraftCity({ ...draftCity, cityName: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                          placeholder="e.g. Solwezi or Chipata"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Unique City Code</label>
                        <input
                          type="text"
                          value={draftCity.cityCode}
                          onChange={(e) => setDraftCity({ ...draftCity, cityCode: e.target.value.toUpperCase() })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono font-bold"
                          placeholder="ZM-SOL"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Province / Region</label>
                        <input
                          type="text"
                          value={draftCity.province}
                          onChange={(e) => setDraftCity({ ...draftCity, province: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Service Radius Boundary (km)</label>
                        <input
                          type="number"
                          min={5}
                          max={120}
                          value={draftCity.radiusKm}
                          onChange={(e) => setDraftCity({ ...draftCity, radiusKm: Number(e.target.value) })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Center Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={draftCity.centerLat}
                          onChange={(e) => setDraftCity({ ...draftCity, centerLat: Number(e.target.value) })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Center Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={draftCity.centerLng}
                          onChange={(e) => setDraftCity({ ...draftCity, centerLng: Number(e.target.value) })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SELECT SERVICES */}
                  {wizardStep === 2 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {([
                        { key: 'rides', title: 'Passenger Rides (Economy, Comfort, XL)', desc: 'Enable on-demand passenger taxi hailing in this city' },
                        { key: 'cargo', title: 'Mride Cargo Transportation', desc: 'Enable light vans, 1-ton pickups and heavy commercial haulage' },
                        { key: 'boda', title: 'Boda-Boda Motorcycle Delivery', desc: 'Enable fast parcel and document courier riders' },
                        { key: 'fairFare', title: 'FairFare Two-Way Price Negotiation', desc: 'Allow passengers and drivers to propose and counteroffer fares' }
                      ] as const).map((svc) => (
                        <label
                          key={svc.key}
                          className="flex items-start justify-between p-4 rounded-2xl border border-slate-200 bg-[#F4F6F9] cursor-pointer"
                        >
                          <div>
                            <span className="font-extrabold text-sm text-[#15191C] block">{svc.title}</span>
                            <span className="text-slate-500 text-[11px]">{svc.desc}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={draftCity.enabledServices[svc.key]}
                            onChange={(e) =>
                              setDraftCity({
                                ...draftCity,
                                enabledServices: {
                                  ...draftCity.enabledServices,
                                  [svc.key]: e.target.checked
                                }
                              })
                            }
                            className="w-4 h-4 accent-[#FF6500] mt-1"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  {/* STEP 3: CONFIGURE OPERATIONS & CITY PRICING */}
                  {wizardStep === 3 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Ride Base Fare (K)</label>
                        <input
                          type="number"
                          value={draftCity.pricing.rides.baseFareZMW}
                          onChange={(e) =>
                            setDraftCity({
                              ...draftCity,
                              pricing: {
                                ...draftCity.pricing,
                                rides: { ...draftCity.pricing.rides, baseFareZMW: Number(e.target.value) }
                              }
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Per Km Rate (K)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={draftCity.pricing.rides.perKmZMW}
                          onChange={(e) =>
                            setDraftCity({
                              ...draftCity,
                              pricing: {
                                ...draftCity.pricing,
                                rides: { ...draftCity.pricing.rides, perKmZMW: Number(e.target.value) }
                              }
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Minimum Permitted FairFare (K)</label>
                        <input
                          type="number"
                          value={draftCity.pricing.rides.minFareZMW}
                          onChange={(e) =>
                            setDraftCity({
                              ...draftCity,
                              pricing: {
                                ...draftCity.pricing,
                                rides: { ...draftCity.pricing.rides, minFareZMW: Number(e.target.value) }
                              }
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Platform Commission (%)</label>
                        <input
                          type="number"
                          value={draftCity.pricing.rides.commissionPercent}
                          onChange={(e) =>
                            setDraftCity({
                              ...draftCity,
                              pricing: {
                                ...draftCity.pricing,
                                rides: { ...draftCity.pricing.rides, commissionPercent: Number(e.target.value) }
                              }
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Assigned City Manager</label>
                        <input
                          type="text"
                          value={draftCity.assignedManagerName}
                          onChange={(e) => setDraftCity({ ...draftCity, assignedManagerName: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Local Support Helpline</label>
                        <input
                          type="text"
                          value={draftCity.supportPhone}
                          onChange={(e) => setDraftCity({ ...draftCity, supportPhone: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: LAUNCH READINESS CHECK */}
                  {wizardStep === 4 && (
                    <div className="space-y-3 text-xs">
                      <div
                        className={`p-4 rounded-2xl border ${
                          draftReadiness.ready
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-red-50 border-red-200 text-red-900'
                        }`}
                      >
                        <p className="font-extrabold text-sm flex items-center gap-2">
                          {draftReadiness.ready ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              All Mandatory Launch Requirements Verified for {draftCity.cityName} ({draftCity.cityCode})
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              Outstanding Launch Requirements Found
                            </>
                          )}
                        </p>
                        {!draftReadiness.ready && (
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {draftReadiness.outstandingRequirements.map((req, idx) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-xl bg-[#F4F6F9]">
                          <span className="text-slate-500 block">Boundary Radius</span>
                          <strong className="text-[#15191C]">{draftCity.radiusKm} km</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F4F6F9]">
                          <span className="text-slate-500 block">Min FairFare</span>
                          <strong className="text-[#15191C]">K{draftCity.pricing.rides.minFareZMW}</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F4F6F9]">
                          <span className="text-slate-500 block">Payment Channels</span>
                          <strong className="text-[#15191C]">Cash, MTN, Airtel</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F4F6F9]">
                          <span className="text-slate-500 block">City Manager</span>
                          <strong className="text-[#15191C]">{draftCity.assignedManagerName}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: APPROVAL & PUBLISHING */}
                  {wizardStep === 5 && (
                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-2xl bg-[#FFF0E6] border border-[#FF6500]/30 space-y-1.5">
                        <p className="font-extrabold text-sm text-[#15191C]">
                          Final Confirmation: Publish {draftCity.cityName} ({draftCity.cityCode}) Live
                        </p>
                        <p className="text-slate-600">
                          Approving this launch atomically marks <strong>{draftCity.cityName}</strong> as <strong>Live</strong> in the shared backend, records your administrator signature and timestamp in the audit history, and immediately enables bookings in compatible Mride Passenger and Driver mobile apps.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!draftReadiness.ready}
                        onClick={handlePublishNewCity}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold py-3.5 text-xs shadow-md"
                      >
                        Approve & Publish {draftCity.cityName} Live to Mobile Apps
                      </button>
                    </div>
                  )}

                  {/* Wizard Navigation Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWizardStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4 | 5)}
                      disabled={wizardStep === 1}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-40"
                    >
                      Previous Step
                    </button>
                    {wizardStep < 5 && (
                      <button
                        type="button"
                        onClick={() => setWizardStep((s) => Math.min(5, s + 1) as 1 | 2 | 3 | 4 | 5)}
                        className="rounded-xl bg-[#15191C] text-white px-5 py-2 text-xs font-extrabold"
                      >
                        Next Step →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* City Directory Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cities.map((city) => (
                  <div
                    key={city.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-extrabold bg-[#F4F6F9] px-2 py-0.5 rounded text-slate-700">
                            {city.cityCode}
                          </span>
                          <h3 className="text-base font-extrabold text-[#15191C]">
                            {city.cityName}, {city.province}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Manager: <strong>{city.assignedManagerName}</strong> • Radius: {city.radiusKm} km • Config v{city.configVersion}
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                          city.status === 'Live'
                            ? 'bg-emerald-100 text-emerald-800'
                            : city.status === 'Pending Approval'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {city.status}
                      </span>
                    </div>

                    {/* Enabled Services Pills */}
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                      {city.enabledServices.rides && (
                        <span className="bg-[#FFF0E6] text-[#FF6500] px-2.5 py-0.5 rounded-full">
                          Rides (Min K{city.pricing.rides.minFareZMW})
                        </span>
                      )}
                      {city.enabledServices.cargo && (
                        <span className="bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full">
                          Cargo (Min K{city.pricing.cargo.minFareZMW})
                        </span>
                      )}
                      {city.enabledServices.boda && (
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">
                          Boda (Min K{city.pricing.boda.minFareZMW})
                        </span>
                      )}
                      {city.enabledServices.fairFare && (
                        <span className="bg-slate-100 text-[#15191C] px-2.5 py-0.5 rounded-full">
                          FairFare Active
                        </span>
                      )}
                    </div>

                    {/* City Metrics Grid */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                      <div className="bg-[#F4F6F9] p-2 rounded-xl">
                        <span className="font-extrabold text-[#15191C] block">
                          {city.metrics.registeredPassengers.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500">Passengers</span>
                      </div>
                      <div className="bg-[#F4F6F9] p-2 rounded-xl">
                        <span className="font-extrabold text-emerald-700 block">
                          {city.metrics.verifiedDrivers}/{city.metrics.totalDrivers}
                        </span>
                        <span className="text-[10px] text-slate-500">Verified Drv</span>
                      </div>
                      <div className="bg-[#F4F6F9] p-2 rounded-xl">
                        <span className="font-extrabold text-[#FF6500] block">
                          {city.metrics.availableDrivers}
                        </span>
                        <span className="text-[10px] text-slate-500">Available Now</span>
                      </div>
                      <div className="bg-[#F4F6F9] p-2 rounded-xl">
                        <span className="font-extrabold text-[#15191C] block">
                          K{city.metrics.revenueZMW.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500">Revenue</span>
                      </div>
                    </div>

                    {/* Actions: Approve Launch or Suspend/Restore */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-400">
                        {city.approvedBy ? `Approved by ${city.approvedBy}` : 'Awaiting launch approval'}
                      </span>
                      <div className="flex items-center gap-2">
                        {city.status !== 'Live' && (
                          <button
                            onClick={() => {
                              const res = MridePlatformStore.approveAndPublishCity({
                                cityId: city.id,
                                approverName: 'Chilombo M.',
                                approverRole: currentStaffRole
                              });
                              setCities(MridePlatformStore.getCities());
                              showNotice(res.message);
                            }}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 text-xs flex items-center gap-1"
                          >
                            <PlayCircle className="w-3.5 h-3.5" /> Approve & Publish Live
                          </button>
                        )}
                        {city.status === 'Live' && (
                          <button
                            onClick={() => handleToggleCitySuspension(city)}
                            className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-3 py-1.5 text-xs flex items-center gap-1"
                          >
                            <PauseCircle className="w-3.5 h-3.5" /> Suspend City
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 3 & 4: USER & DRIVER MANAGEMENT (Matches Reference Middle-Right)
             ===================================================================== */}
          {(activeSection === 'users' || activeSection === 'drivers') && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-[#15191C]">User & Driver Fleet Management</h2>
                  <p className="text-xs text-slate-500">
                    Distinguishes live connection status from booking availability across all 7 operational states.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-[#F4F6F9] p-1 rounded-xl text-xs font-extrabold">
                  <button
                    onClick={() => setUserSubTab('passengers')}
                    className={`px-3.5 py-1.5 rounded-lg ${
                      userSubTab === 'passengers' ? 'bg-white text-[#FF6500] shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Passengers
                  </button>
                  <button
                    onClick={() => setUserSubTab('drivers')}
                    className={`px-3.5 py-1.5 rounded-lg ${
                      userSubTab === 'drivers' ? 'bg-white text-[#FF6500] shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Drivers ({drivers.length})
                  </button>
                </div>
              </div>

              {userSubTab === 'drivers' ? (
                <>
                  {/* Filter Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <select
                      value={driverFilterState}
                      onChange={(e) => setDriverFilterState(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-[#F4F6F9] px-3 py-2 text-xs font-bold"
                    >
                      <option value="ALL">All 7 Operational States</option>
                      <option value="Online and Available">Online and Available</option>
                      <option value="On a Trip">On a Trip</option>
                      <option value="On a Delivery">On a Delivery</option>
                      <option value="On Break">On Break</option>
                      <option value="Offline">Offline</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Suspended">Suspended</option>
                    </select>

                    <select
                      value={driverFilterCity}
                      onChange={(e) => setDriverFilterCity(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-[#F4F6F9] px-3 py-2 text-xs font-bold"
                    >
                      <option value="ALL">All Cities</option>
                      {cities.map((c) => (
                        <option key={c.cityCode} value={c.cityName}>
                          {c.cityName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Drivers Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5">Driver & Vehicle</th>
                          <th className="py-2.5">Phone & City</th>
                          <th className="py-2.5">Operational Status</th>
                          <th className="py-2.5">Connection vs Availability</th>
                          <th className="py-2.5">Documents (RTSA)</th>
                          <th className="py-2.5">Live Location Update</th>
                          <th className="py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {drivers
                          .filter(
                            (d) =>
                              (driverFilterState === 'ALL' || d.operationalState === driverFilterState) &&
                              (driverFilterCity === 'ALL' || d.cityName === driverFilterCity) &&
                              (searchQuery === '' ||
                                d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                d.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()))
                          )
                          .map((drv) => (
                            <tr key={drv.id} className="hover:bg-slate-50">
                              <td className="py-3">
                                <span className="font-extrabold text-[#15191C] block">{drv.name}</span>
                                <span className="text-[11px] text-slate-500">
                                  {drv.vehicleModel} • <strong>{drv.vehiclePlate}</strong> ({drv.rating}★)
                                </span>
                              </td>
                              <td className="py-3">
                                <span className="font-mono block">{drv.phone}</span>
                                <span className="text-[11px] text-slate-500">{drv.cityName}</span>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                                    drv.operationalState === 'Online and Available'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : drv.operationalState === 'On a Trip' || drv.operationalState === 'On a Delivery'
                                      ? 'bg-sky-100 text-sky-800'
                                      : drv.operationalState === 'Pending Verification'
                                      ? 'bg-amber-100 text-amber-800'
                                      : drv.operationalState === 'Suspended'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {drv.operationalState}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className="block font-bold text-[#15191C]">{drv.connectionStatus}</span>
                                <span className="text-[10px] text-slate-500">
                                  {drv.availableForBookings ? 'Eligible for new bookings' : 'Not accepting new requests'}
                                </span>
                              </td>
                              <td className="py-3">
                                {drv.documentsVerified ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified ({drv.rtsaLicenseNumber})
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Pending / Expired
                                  </span>
                                )}
                              </td>
                              <td className="py-3 text-[11px] text-slate-600">
                                <span className="block font-semibold text-[#15191C]">{drv.lastLocationLabel}</span>
                                <span className="text-[10px] text-slate-400">{drv.lastLocationUpdate}</span>
                              </td>
                              <td className="py-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {drv.operationalState !== 'Online and Available' && (
                                    <button
                                      onClick={() => handleDriverStateChange(drv.id, 'Online and Available')}
                                      className="rounded-lg bg-emerald-600 text-white font-bold px-2.5 py-1 text-[11px]"
                                    >
                                      Verify & Activate
                                    </button>
                                  )}
                                  {drv.operationalState !== 'Suspended' && (
                                    <button
                                      onClick={() => handleDriverStateChange(drv.id, 'Suspended')}
                                      className="rounded-lg bg-red-50 text-red-600 border border-red-200 font-bold px-2.5 py-1 text-[11px]"
                                    >
                                      Suspend
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* Passengers Directory */
                <div className="space-y-2.5 text-xs">
                  {[
                    { id: 'usr_zm_0981', name: 'Chilombo M.', phone: '+260 76 910 8705', city: 'Lusaka', trips: 42, status: 'Active & Verified' },
                    { id: 'usr_zm_1044', name: 'Mwansa K.', phone: '+260 96 312 7781', city: 'Kitwe', trips: 19, status: 'Active & Verified' },
                    { id: 'usr_zm_2190', name: 'Grace N.', phone: '+260 97 511 0092', city: 'Lusaka', trips: 28, status: 'Active & Verified' },
                    { id: 'usr_zm_3012', name: 'Kelvin B.', phone: '+260 95 401 2219', city: 'Ndola', trips: 11, status: 'Active & Verified' }
                  ].map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-[#F4F6F9] border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-extrabold text-sm text-[#15191C] block">{p.name}</span>
                        <span className="text-slate-500">
                          {p.phone} • {p.city} • {p.trips} completed trips
                        </span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              MODULE 5: EMPLOYEES & WORK ASSIGNMENT / MONITORING
             ===================================================================== */}
          {activeSection === 'employees_tasks' && (
            <div className="space-y-5">
              {/* Employee Directory Header */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#15191C]">
                      Employee Directory & Department Roles ({employees.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage staff departments, reporting lines, city assignments and role-based permissions.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddEmployeeModal(!showAddEmployeeModal)}
                    className="rounded-xl bg-[#FF6500] text-white font-extrabold px-3.5 py-2 text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Employee
                  </button>
                </div>

                {showAddEmployeeModal && (
                  <form
                    onSubmit={handleAddEmployee}
                    className="p-4 rounded-2xl bg-[#F4F6F9] border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
                  >
                    <input
                      type="text"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      placeholder="Full Name"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold"
                      required
                    />
                    <input
                      type="email"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      placeholder="Work Email (@mride.co.zm)"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                      required
                    />
                    <input
                      type="text"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      placeholder="Phone (+260...)"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <input
                      type="text"
                      value={empTitle}
                      onChange={(e) => setEmpTitle(e.target.value)}
                      placeholder="Job Title"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <select
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value as AdminStaffRole)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold"
                    >
                      <option value="City Manager">City Manager</option>
                      <option value="Operations Manager">Operations Manager</option>
                      <option value="Customer Support Agent">Customer Support Agent</option>
                      <option value="Driver Verification Officer">Driver Verification Officer</option>
                      <option value="Finance Officer">Finance Officer</option>
                      <option value="HR / Employee Manager">HR / Employee Manager</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-xl bg-[#15191C] text-white font-extrabold py-2 px-4"
                    >
                      Save Staff Record
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {employees.map((emp) => (
                    <div key={emp.id} className="p-3.5 rounded-2xl bg-[#F4F6F9] border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#15191C]">{emp.fullName}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {emp.status}
                        </span>
                      </div>
                      <p className="font-bold text-[#FF6500] text-[11px]">{emp.jobTitle}</p>
                      <p className="text-slate-500 text-[11px]">
                        Dept: {emp.department} • Role: <strong>{emp.role}</strong>
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        City Scope: <strong>{emp.assignedCityCode}</strong> • Completed Tasks: {emp.completedTasksCount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6-Stage Workforce Control Centre, Submissions, Daily/Weekly Reports & 10-Department KPIs */}
              <WorkforceControlCentreModule
                activeStaffAccount={activeStaffAccount}
                currentStaffRole={currentStaffRole}
                staffAccounts={staffAccounts}
                onNotice={showNotice}
              />

              {/* Work Assignment & Monitoring (Board, List & Calendar Views) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-[#15191C] flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-[#FF6500]" />
                      Work Assignment & Task Monitoring
                    </h3>
                    <p className="text-xs text-slate-500">
                      Assign operational tasks, set deadlines, review submitted deliverables and track completion rates.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F4F6F9] p-1 rounded-xl text-xs font-bold">
                    {(['board', 'list', 'calendar'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setTaskViewMode(mode)}
                        className={`px-3 py-1 rounded-lg capitalize ${
                          taskViewMode === mode ? 'bg-[#FF6500] text-white' : 'text-slate-600'
                        }`}
                      >
                        {mode} View
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create Task Bar */}
                <form
                  onSubmit={handleCreateTask}
                  className="p-3.5 rounded-2xl bg-[#F4F6F9] border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-2.5 text-xs"
                >
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="New task title (e.g. Audit Ndola Cargo Fleet)..."
                    className="sm:col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold"
                    required
                  />
                  <select
                    value={newTaskAssigneeId}
                    onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 font-semibold"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 font-bold"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-2"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-2 px-3"
                  >
                    Assign Task
                  </button>
                </form>

                {/* Task Board / List / Calendar Display */}
                {taskViewMode === 'board' ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    {(['Not Started', 'In Progress', 'Awaiting Review', 'Completed'] as WorkTaskStatus[]).map(
                      (colStatus) => (
                        <div key={colStatus} className="rounded-2xl bg-[#F4F6F9] p-3 space-y-2.5 border border-slate-200">
                          <div className="flex items-center justify-between font-extrabold text-[#15191C]">
                            <span>{colStatus}</span>
                            <span className="bg-white px-2 py-0.5 rounded-full text-[10px]">
                              {tasks.filter((t) => t.status === colStatus).length}
                            </span>
                          </div>
                          {tasks
                            .filter((t) => t.status === colStatus)
                            .map((task) => (
                              <div key={task.id} className="bg-white rounded-xl p-3 border border-slate-200 space-y-2 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-bold text-slate-400">{task.id}</span>
                                  <span
                                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                      task.priority === 'High'
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>
                                <p className="font-extrabold text-[#15191C] leading-snug">{task.title}</p>
                                <p className="text-[11px] text-slate-500">{task.description}</p>
                                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
                                  <span>Assignee: <strong>{task.assignedToName}</strong></span>
                                  <span>Due: {task.dueDate}</span>
                                </div>
                                {colStatus !== 'Completed' && (
                                  <div className="flex gap-1 pt-1">
                                    {colStatus === 'Not Started' && (
                                      <button
                                        onClick={() => handleUpdateTaskStatus(task.id, 'In Progress')}
                                        className="flex-1 rounded-lg bg-[#FFF0E6] text-[#FF6500] font-bold py-1 text-[10px]"
                                      >
                                        Start
                                      </button>
                                    )}
                                    {colStatus === 'In Progress' && (
                                      <button
                                        onClick={() => handleUpdateTaskStatus(task.id, 'Awaiting Review')}
                                        className="flex-1 rounded-lg bg-sky-50 text-sky-700 font-bold py-1 text-[10px]"
                                      >
                                        Submit for Review
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleUpdateTaskStatus(task.id, 'Completed')}
                                      className="flex-1 rounded-lg bg-emerald-600 text-white font-bold py-1 text-[10px]"
                                    >
                                      Approve Done
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {tasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-2xl bg-[#F4F6F9] border border-slate-200 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-extrabold text-[#15191C]">
                            {t.id} • {t.title}
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Assigned to: <strong>{t.assignedToName}</strong> ({t.cityCode}) • Due: {t.dueDate}
                          </p>
                        </div>
                        <span className="bg-white border border-slate-200 px-3 py-1 rounded-full font-extrabold text-[11px]">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 6A: FINANCE, TREASURY & GOOGLE SHEETS / EXCEL MASTER RECORD OFFICE
             ===================================================================== */}
          {activeSection === 'finance' && (
            <div className="space-y-5">
              {/* Top 4 Treasury KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-bold block">Gross National Volume (ZMW)</span>
                  <span className="text-2xl font-black text-[#15191C] block mt-1">
                    K{totalRevenueZMW.toLocaleString()}.00
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    ✓ Airtel Money, MTN MoMo & Cash
                  </span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-bold block">Mride 10% Platform Commission</span>
                  <span className="text-2xl font-black text-emerald-700 block mt-1">
                    K{Math.round(totalRevenueZMW * 0.1).toLocaleString()}.00
                  </span>
                  <span className="text-[11px] text-slate-500">Settled to Mride Treasury</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-bold block">Net Driver Payouts (90%)</span>
                  <span className="text-2xl font-black text-[#15191C] block mt-1">
                    K{Math.round(totalRevenueZMW * 0.9).toLocaleString()}.00
                  </span>
                  <span className="text-[11px] text-[#FF6500] font-bold">Instant Mobile Money Wallet</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 font-bold block">ZRA Smart Invoice 16% VAT</span>
                  <span className="text-2xl font-black text-slate-800 block mt-1">
                    K{Math.round(totalRevenueZMW * 0.016).toLocaleString()}.00
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold">ZRA TPIN Auto-Reconciled</span>
                </div>
              </div>

              {/* Embedded Google Sheets / Excel Master Financial Spreadsheet */}
              {officeViewTab !== 'spreadsheet_ledger' && (
                <OfficeSpreadsheetEngine
                  key="finance_embedded_sheet"
                  sheetTitle={activeSheetSpec.sheetTitle}
                  sheetSubtitle={activeSheetSpec.sheetSubtitle}
                  officeBadge="Google Sheets / Excel Live Ledger"
                  columns={activeSheetSpec.columns}
                  initialRows={activeSheetSpec.initialRows}
                  storageKey="mride_office_sheet_finance_v1"
                  sumColumnKeys={activeSheetSpec.sumColumnKeys}
                  onSaveNotice={showNotice}
                />
              )}
            </div>
          )}

          {/* =====================================================================
              MODULE 6B: FAIRFARE & PRICING MANAGEMENT (Matches Reference Top-Right)
             ===================================================================== */}
          {activeSection === 'fairfare_pricing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <form
                onSubmit={handleSavePricingChanges}
                className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#15191C]">Fare & FairFare Management</h2>
                    <p className="text-xs text-slate-500">
                      Configure city-specific base fares, distance rates and permitted FairFare negotiation floors.
                    </p>
                  </div>

                  <select
                    value={selectedPricingCityId}
                    onChange={(e) => setSelectedPricingCityId(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-[#F4F6F9] px-3 py-1.5 text-xs font-extrabold"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cityName} ({c.cityCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Pills: Rides, Cargo, Boda Delivery, FairFare */}
                <div className="flex flex-wrap gap-1.5 bg-[#F4F6F9] p-1.5 rounded-xl text-xs font-extrabold">
                  {([
                    { id: 'rides', label: 'Rides' },
                    { id: 'cargo', label: 'Cargo' },
                    { id: 'boda', label: 'Boda Delivery' },
                    { id: 'fairfare', label: 'FairFare' }
                  ] as const).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPricingServiceTab(tab.id)}
                      className={`px-3.5 py-1.5 rounded-lg transition-all ${
                        pricingServiceTab === tab.id
                          ? 'bg-[#FF6500] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#15191C]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Base fare (K)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={baseFareInput}
                      onChange={(e) => setBaseFareInput(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-extrabold text-[#15191C]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Per km (K)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={perKmInput}
                      onChange={(e) => setPerKmInput(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-extrabold text-[#15191C]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Per minute (K)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={perMinInput}
                      onChange={(e) => setPerMinInput(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-extrabold text-[#15191C]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Economy Minimum Fare Floor (K)</label>
                    <input
                      type="number"
                      value={minFareInput}
                      onChange={(e) => setMinFareInput(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-extrabold text-[#15191C]"
                    />
                    <span className="text-[10px] text-slate-500">Lowest fare a passenger can propose on Economy (Default K28)</span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Comfort Minimum Fare Floor (K)</label>
                    <input
                      type="number"
                      value={minComfortFareInput}
                      onChange={(e) => setMinComfortFareInput(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-extrabold text-[#15191C]"
                    />
                    <span className="text-[10px] text-slate-500">Lowest fare a passenger can propose on Comfort (Default K40)</span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Service fee / Commission (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={serviceFeeInput}
                      onChange={(e) => setServiceFeeInput(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-extrabold text-[#FF6500]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3 text-xs shadow-sm"
                >
                  Save Changes & Sync to Mobile Apps
                </button>
              </form>

              {/* Financial Reconciliation & Driver Goal Liabilities */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 text-xs">
                <h3 className="text-base font-extrabold text-[#15191C]">
                  Finance, Commissions & Mobile Money Reconciliation
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#FFF0E6]">
                    <span className="text-slate-600 font-semibold block">Gross Bookings Volume</span>
                    <span className="text-xl font-extrabold text-[#15191C]">K{totalRevenueZMW.toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50">
                    <span className="text-slate-600 font-semibold block">Net Commissions (10%)</span>
                    <span className="text-xl font-extrabold text-emerald-700">
                      K{Math.round(totalRevenueZMW * 0.1).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-[#15191C] block">Active Driver Goal Reward Campaigns</span>
                  {campaigns.map((cmp) => (
                    <div key={cmp.id} className="p-3 rounded-xl bg-[#F4F6F9] flex items-center justify-between">
                      <div>
                        <strong className="text-[#15191C] block">{cmp.name}</strong>
                        <span className="text-[11px] text-slate-500">
                          {cmp.targetRides} rides → K{cmp.rewardAmountZMW} bonus
                        </span>
                      </div>
                      <span className="font-extrabold text-[#FF6500]">
                        K{cmp.spentBudgetZMW.toLocaleString()} / K{cmp.maxBudgetZMW.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 7: SUPPORT TICKETS & ESCALATION QUEUE (Shared with App & Portal)
             ===================================================================== */}
          {activeSection === 'support_tickets' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Ticket Queue List */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                <h2 className="text-base font-extrabold text-[#15191C]">
                  Customer Support Queue ({tickets.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Connected directly to the mobile app's "Report an Issue" and the Website Customer Portal.
                </p>

                <div className="space-y-2">
                  {tickets.map((tkt) => {
                    const isSelected = selectedTicket?.ticketId === tkt.ticketId;
                    return (
                      <div
                        key={tkt.ticketId}
                        onClick={() => setSelectedTicket(tkt)}
                        className={`cursor-pointer p-3.5 rounded-2xl border transition-all space-y-1 ${
                          isSelected
                            ? 'border-[#FF6500] bg-[#FFF0E6]/40'
                            : 'border-slate-200 bg-[#F4F6F9] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-extrabold text-xs text-[#15191C]">
                            #{tkt.ticketId} • {tkt.category}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              tkt.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tkt.status === 'In Progress'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {tkt.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#15191C]">{tkt.subject}</p>
                        <p className="text-[11px] text-slate-500">
                          Customer: {tkt.customerName} ({tkt.customerPhone}) • Trip: {tkt.tripReference}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ticket Conversation & Internal Notes */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                {selectedTicket ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500] block">
                          Ticket Reference #{selectedTicket.ticketId} • Trip {selectedTicket.tripReference}
                        </span>
                        <h3 className="text-base font-extrabold text-[#15191C]">{selectedTicket.subject}</h3>
                        <p className="text-xs text-slate-500">
                          Submitted by <strong>{selectedTicket.customerName}</strong> ({selectedTicket.customerPhone}) • Assigned to {selectedTicket.assignedAgentName}
                        </p>
                      </div>

                      {selectedTicket.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveTicket(selectedTicket.ticketId)}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 text-xs"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {selectedTicket.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-2xl text-xs ${
                            m.senderRole === 'internal_note'
                              ? 'bg-amber-50 border border-amber-200 text-amber-900'
                              : m.senderRole === 'support_agent'
                              ? 'bg-[#FFF0E6] border border-[#FF6500]/30 text-[#15191C]'
                              : 'bg-[#F4F6F9] border border-slate-200 text-[#15191C]'
                          }`}
                        >
                          <div className="flex items-center justify-between font-extrabold text-[11px] mb-1">
                            <span>
                              {m.senderName}{' '}
                              {m.senderRole === 'internal_note' && '(PRIVATE INTERNAL STAFF NOTE)'}
                            </span>
                            <span className="text-slate-400">{m.timestamp}</span>
                          </div>
                          <p>{m.message}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendTicketReply} className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTicketNoteMode('support_agent')}
                          className={`px-3 py-1 rounded-lg font-extrabold ${
                            ticketNoteMode === 'support_agent'
                              ? 'bg-[#FF6500] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Reply to Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => setTicketNoteMode('internal_note')}
                          className={`px-3 py-1 rounded-lg font-extrabold ${
                            ticketNoteMode === 'internal_note'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Private Internal Note
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ticketReplyText}
                          onChange={(e) => setTicketReplyText(e.target.value)}
                          placeholder={
                            ticketNoteMode === 'internal_note'
                              ? 'Add private internal escalation note...'
                              : 'Write a reply to the customer...'
                          }
                          className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-[#15191C] text-white font-extrabold px-4 py-2.5 flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Send
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">Select a support ticket to inspect or reply.</p>
                )}
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 8A: FULL VISUAL WEBSITE DESIGN EDITOR & PUBLISHING PIPELINE
             ===================================================================== */}
          {activeSection === 'website_content' && (
            <WebsiteDesignEditorModule
              actorName={activeStaffAccount.fullName}
              actorRole={currentStaffRole}
              onNotice={showNotice}
            />
          )}

          {/* =====================================================================
              MODULE 8B: APP CONFIGURATION & PROMOTIONS (Matches Reference Bottom-Right)
             ===================================================================== */}
          {(activeSection === 'app_config' || activeSection === 'promotions') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* App Configuration & Feature Flags */}
              <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                <h2 className="text-base font-extrabold text-[#15191C]">
                  Mride App Configuration & Feature Flags
                </h2>
                <div className="rounded-2xl bg-[#0B1528] text-white p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-[#FF6500]">Active App Banner</span>
                    <h4 className="text-base font-extrabold">More Rides. More Places. Only on Mride.</h4>
                    <p className="text-xs text-slate-300">FairFare pricing across Lusaka, Kitwe & Ndola.</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-[#FF6500] flex items-center justify-center font-extrabold">
                    M
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-extrabold text-[#15191C]">Live Feature Flags</h4>
                  {([
                    { key: 'fairFare', label: 'FairFare Two-Way Price Negotiation' },
                    { key: 'cargoService', label: 'Mride Cargo Service' },
                    { key: 'bodaDelivery', label: 'Boda-Boda Express Parcel Delivery' },
                    { key: 'liveTracking', label: 'Real-Time OpenStreetMap & GPS Telemetry' },
                    { key: 'inAppVoipCalls', label: 'In-App Data Voice Calling (VoIP)' },
                    { key: 'referralProgram', label: 'Passenger & Driver Referral Rewards' }
                  ] as const).map((flag) => (
                    <label
                      key={flag.key}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F4F6F9] border border-slate-200 cursor-pointer"
                    >
                      <span className="font-bold text-[#15191C]">{flag.label}</span>
                      <input
                        type="checkbox"
                        checked={featureFlags[flag.key]}
                        onChange={(e) =>
                          setFeatureFlags({ ...featureFlags, [flag.key]: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#FF6500]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Website Content & Promotions */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                  <h3 className="text-base font-extrabold text-[#15191C]">Website Content & Hero Editor</h3>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Main Heading</label>
                    <input
                      type="text"
                      value={contentSettings.heroHeadline}
                      onChange={(e) =>
                        setContentSettings({ ...contentSettings, heroHeadline: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Subheading</label>
                    <input
                      type="text"
                      value={contentSettings.heroSubheadline}
                      onChange={(e) =>
                        setContentSettings({ ...contentSettings, heroSubheadline: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Mobile App Welcome Prompt</label>
                    <input
                      type="text"
                      value={contentSettings.appWelcomeText}
                      onChange={(e) =>
                        setContentSettings({ ...contentSettings, appWelcomeText: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        saveMrideContent(contentSettings);
                        setTick((t) => t + 1);
                        showNotice('Website & Mobile App content published live!');
                      }}
                      className="flex-1 rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-2.5"
                    >
                      Save & Publish Changes
                    </button>
                  </div>
                </div>

                {/* Promotions & Announcements */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-[#15191C]">Promotions & Coupons</h3>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPromoTitle}
                      onChange={(e) => setNewPromoTitle(e.target.value)}
                      placeholder="Campaign Title"
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-2"
                    />
                    <input
                      type="text"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                      placeholder="Code (e.g. ZAMBIA20)"
                      className="w-36 rounded-xl border border-slate-300 px-3 py-2 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPromoTitle.trim() || !newPromoCode.trim()) return;
                        setPromotions([
                          {
                            id: `prm_${Date.now()}`,
                            title: newPromoTitle.trim(),
                            type: `Coupon (${newPromoCode.trim()})`,
                            start: 'Today',
                            end: '30 Nov 2026',
                            status: 'Active'
                          },
                          ...promotions
                        ]);
                        setNewPromoTitle('');
                        setNewPromoCode('');
                        showNotice('New promotional campaign published!');
                      }}
                      className="rounded-xl bg-[#FF6500] text-white font-extrabold px-3 py-2"
                    >
                      + Create
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {promotions.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-[#F4F6F9] flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-[#15191C] block">{p.title}</strong>
                          <span className="text-[11px] text-slate-500">
                            {p.type} • {p.start} – {p.end}
                          </span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 9: LIVE OPERATIONS & REPORTS / SECURITY AUDIT LOGS
             ===================================================================== */}
          {(activeSection === 'rides_deliveries' || activeSection === 'reports_security') && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                <h2 className="text-base font-extrabold text-[#15191C]">
                  Live Operations Radar ({activeCity}, {country.name})
                </h2>
                <CountryStreetMap
                  country={country}
                  activeCity={activeCity}
                  pickupName="Cavendish University"
                  destinationName="EastPark Mall"
                  heightClass="h-72"
                />
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#15191C] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#FF6500]" />
                      Immutable Governance & Security Audit Trail ({auditLogs.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Every city launch approval, pricing change, driver verification and dispute action is recorded with actor identity and timestamp.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-[#15191C]">{log.action}</span>
                        <span className="ml-2 bg-[#FFF0E6] text-[#FF6500] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {log.category}
                        </span>
                        <p className="text-slate-600 mt-0.5">{log.summary}</p>
                      </div>
                      <div className="text-right text-[11px] text-slate-400 shrink-0">
                        <strong className="text-slate-700 block">
                          {log.actorName} ({log.actorRole})
                        </strong>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 10: OWNER-ONLY IAM ACCESS VAULT & PASSWORD PROVISIONING SYSTEM
             ===================================================================== */}
          {activeSection === 'iam_access_vault' && (
            <div className="space-y-5">
              {/* Header Banner */}
              <div className="bg-[#0B1528] text-white rounded-2xl p-5 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold bg-[#FF6500] text-white px-2.5 py-0.5 rounded-full mb-2">
                    <KeyRound className="w-3 h-3" /> Owner Exclusive Command System
                  </span>
                  <h2 className="text-xl font-extrabold">
                    Owner Identity, System Assignment & Password Vault
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                    Only you (<strong>Chilombo M. — Owner / Super Administrator</strong>) can create staff logins, issue or reset passwords, assign a person to a dedicated Management System, or lock their access across the Mride enterprise.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginError(null);
                      setShowStaffLoginModal(true);
                    }}
                    className="rounded-xl bg-white text-[#0B1528] hover:bg-slate-100 font-extrabold px-4 py-2.5 text-xs flex items-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4 text-[#FF6500]" />
                    Test Staff System Login
                  </button>
                </div>
              </div>

              {!isOwner ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
                  <Lock className="w-8 h-8 text-red-600 mx-auto" />
                  <h3 className="text-base font-extrabold text-red-900">
                    Restricted to Owner / Super Administrator Only
                  </h3>
                  <p className="text-xs text-red-700 max-w-md mx-auto">
                    You are currently previewing as <strong>{currentStaffRole}</strong>. Only the Owner can assign staff to management systems or issue passwords.
                  </p>
                </div>
              ) : (
                <>
                  {/* Role-to-Dedicated Management System Matrix */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-[#15191C]">
                          Enterprise Role → Dedicated Management System Architecture (19 Systems)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Every role in your company has its own dedicated management system. Click any system to open it or assign a staff member below.
                        </p>
                      </div>
                      <span className="text-xs font-extrabold bg-[#FFF0E6] text-[#FF6500] px-3 py-1 rounded-full">
                        12 Roles • 19 Management Systems
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 text-xs">
                      {ALL_MANAGEMENT_SYSTEM_META.map((sys) => (
                        <div
                          key={sys.id}
                          onClick={() => setActiveSection(sys.id)}
                          className="p-3 rounded-xl border border-slate-200 hover:border-[#FF6500] bg-[#F4F6F9]/60 cursor-pointer transition-all flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-[#FF6500] block">
                              {sys.category}
                            </span>
                            <strong className="text-[#15191C] block">{sys.label}</strong>
                            <span className="text-[11px] text-slate-500">
                              Role: <strong>{sys.dedicatedRole}</strong>
                            </span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Owner Provisioning Form: Assign Staff to System & Issue Password */}
                  <form
                    onSubmit={handleOwnerProvisionStaffAccount}
                    className="bg-white rounded-2xl p-5 border-2 border-[#FF6500]/30 space-y-4 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#15191C]">
                          Assign a Person to a Management System & Issue Password
                        </h3>
                        <p className="text-xs text-slate-500">
                          Create credentials for a manager, officer, or supervisor and choose the exact Management System(s) they are allowed to open.
                        </p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full text-[10px]">
                        Owner-Controlled Credentials
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Staff Full Name</label>
                        <input
                          type="text"
                          value={newAccFullName}
                          onChange={(e) => setNewAccFullName(e.target.value)}
                          placeholder="e.g. Chileshe Mumba"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">System Username</label>
                        <input
                          type="text"
                          value={newAccUsername}
                          onChange={(e) => setNewAccUsername(e.target.value)}
                          placeholder="e.g. chileshe.ops"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Work Email</label>
                        <input
                          type="email"
                          value={newAccEmail}
                          onChange={(e) => setNewAccEmail(e.target.value)}
                          placeholder="chileshe@mride.co.zm"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={newAccPhone}
                          onChange={(e) => setNewAccPhone(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#FF6500] block mb-1">
                          Assigned Password (Issued by You)
                        </label>
                        <input
                          type="text"
                          value={newAccPassword}
                          onChange={(e) => setNewAccPassword(e.target.value)}
                          placeholder="Enter strong password..."
                          className="w-full rounded-xl border-2 border-[#FF6500] bg-[#FFF0E6]/40 px-3 py-2 font-mono font-extrabold text-[#15191C]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">4-Digit Security PIN</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={newAccPin}
                          onChange={(e) => setNewAccPin(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Assigned Company Role</label>
                        <select
                          value={newAccRole}
                          onChange={(e) => {
                            const roleVal = e.target.value as AdminStaffRole;
                            setNewAccRole(roleVal);
                            const defaultSys = ALL_MANAGEMENT_SYSTEM_META.find(
                              (m) => m.dedicatedRole === roleVal
                            );
                            if (defaultSys) {
                              setNewAccPrimarySystem(defaultSys.id);
                              setNewAccAllowedSystems([defaultSys.id]);
                            }
                          }}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                        >
                          {([
                            'Operations Manager',
                            'City Manager',
                            'HR / Employee Manager',
                            'Customer Support Agent',
                            'Driver Verification Officer',
                            'Finance Officer',
                            'Content Manager',
                            'Corporate & B2B Fleet Director',
                            'Emergency SOS & Safety Commander',
                            'Legal, ZRA Tax & RTSA Compliance Officer',
                            'Call Centre & VoIP Quality Supervisor',
                            'Owner / Super Administrator'
                          ] as AdminStaffRole[]).map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">
                          Primary Dedicated Management System
                        </label>
                        <select
                          value={newAccPrimarySystem}
                          onChange={(e) => {
                            const sysId = e.target.value as ManagementSystemId;
                            setNewAccPrimarySystem(sysId);
                            if (!newAccAllowedSystems.includes(sysId)) {
                              setNewAccAllowedSystems([...newAccAllowedSystems, sysId]);
                            }
                          }}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-[#FF6500]"
                        >
                          {ALL_MANAGEMENT_SYSTEM_META.map((sys) => (
                            <option key={sys.id} value={sys.id}>
                              {sys.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Multi-System Checkboxes */}
                    <div className="pt-2">
                      <label className="font-bold text-slate-600 block mb-1.5">
                        Additional Management Systems This Person Is Allowed to Open:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {ALL_MANAGEMENT_SYSTEM_META.filter((m) => m.id !== 'iam_access_vault').map(
                          (sys) => {
                            const checked =
                              newAccPrimarySystem === sys.id ||
                              newAccAllowedSystems.includes(sys.id);
                            return (
                              <label
                                key={sys.id}
                                className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer text-[11px] font-semibold ${
                                  checked
                                    ? 'border-[#FF6500] bg-[#FFF0E6]/60 text-[#15191C]'
                                    : 'border-slate-200 bg-[#F4F6F9] text-slate-600'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    if (newAccAllowedSystems.includes(sys.id)) {
                                      setNewAccAllowedSystems(
                                        newAccAllowedSystems.filter((id) => id !== sys.id)
                                      );
                                    } else {
                                      setNewAccAllowedSystems([...newAccAllowedSystems, sys.id]);
                                    }
                                  }}
                                />
                                <span className="truncate">{sys.label}</span>
                              </label>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <label className="font-bold text-slate-600">Assigned City Scope:</label>
                        <select
                          value={newAccCity}
                          onChange={(e) => setNewAccCity(e.target.value)}
                          className="rounded-xl border border-slate-300 px-3 py-1.5 font-bold"
                        >
                          <option value="ALL">ALL CITIES (National Scope)</option>
                          {cities.map((c) => (
                            <option key={c.cityCode} value={c.cityCode}>
                              {c.cityName} ({c.cityCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="rounded-xl bg-[#FF6500] hover:bg-[#e55a00] text-white font-extrabold px-5 py-2.5 text-xs shadow-sm flex items-center gap-1.5"
                      >
                        <KeyRound className="w-4 h-4" />
                        Assign Person to System & Issue Password
                      </button>
                    </div>
                  </form>

                  {/* Staff Credentials & Assigned Systems Directory */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                    <h3 className="text-base font-extrabold text-[#15191C]">
                      Active Staff System Accounts & Owner-Issued Passwords ({staffAccounts.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 text-[11px]">
                            <th className="py-2 font-bold">Staff Member</th>
                            <th className="py-2 font-bold">Username</th>
                            <th className="py-2 font-bold">Owner-Issued Password & PIN</th>
                            <th className="py-2 font-bold">Assigned Role</th>
                            <th className="py-2 font-bold">Dedicated Primary System</th>
                            <th className="py-2 font-bold">City Scope</th>
                            <th className="py-2 font-bold">Status</th>
                            <th className="py-2 font-bold text-right">Owner Controls</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {staffAccounts.map((acc) => {
                            const isVisible = Boolean(revealedPasswords[acc.accountId]);
                            const primaryMeta = ALL_MANAGEMENT_SYSTEM_META.find(
                              (m) => m.id === acc.primarySystemId
                            );
                            return (
                              <tr key={acc.accountId} className="hover:bg-slate-50">
                                <td className="py-3 font-extrabold text-[#15191C]">
                                  {acc.fullName}
                                  <span className="block text-[10px] text-slate-400 font-normal">
                                    {acc.email}
                                  </span>
                                </td>
                                <td className="py-3 font-mono font-bold text-slate-700">
                                  @{acc.username}
                                </td>
                                <td className="py-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-extrabold bg-[#F4F6F9] border border-slate-200 px-2 py-0.5 rounded text-[#15191C]">
                                      {isVisible ? acc.passwordPlain : '••••••••••••'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setRevealedPasswords({
                                          ...revealedPasswords,
                                          [acc.accountId]: !isVisible
                                        })
                                      }
                                      className="text-slate-400 hover:text-[#FF6500] p-1"
                                      title="Show / Hide Password"
                                    >
                                      {isVisible ? (
                                        <EyeOff className="w-3.5 h-3.5" />
                                      ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <span className="text-[10px] font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                                      PIN: {acc.accessPin}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 font-bold text-slate-800">{acc.role}</td>
                                <td className="py-3">
                                  <button
                                    type="button"
                                    onClick={() => setActiveSection(acc.primarySystemId)}
                                    className="bg-[#FFF0E6] text-[#FF6500] font-extrabold px-2.5 py-1 rounded-lg text-[11px] hover:underline"
                                  >
                                    {primaryMeta?.label || acc.primarySystemId}
                                  </button>
                                  <span className="block text-[10px] text-slate-400 mt-0.5">
                                    +{Math.max(0, acc.allowedSystems.length - 1)} linked systems
                                  </span>
                                </td>
                                <td className="py-3 font-mono font-bold text-slate-600">
                                  {acc.assignedCityCode}
                                </td>
                                <td className="py-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                      acc.accountStatus === 'Active'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {acc.accountStatus}
                                  </span>
                                </td>
                                <td className="py-3 text-right space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextPass = window.prompt(
                                        `Enter new Owner-assigned password for ${acc.fullName} (@${acc.username}):`,
                                        acc.passwordPlain
                                      );
                                      if (nextPass && nextPass.trim()) {
                                        handleOwnerResetStaffPassword(acc.accountId, nextPass.trim());
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#0B1528] text-white font-bold text-[11px] hover:bg-slate-800"
                                  >
                                    Change Password
                                  </button>
                                  {acc.role !== 'Owner / Super Administrator' && (
                                    <button
                                      type="button"
                                      onClick={() => handleOwnerToggleAccountLock(acc.accountId)}
                                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                                        acc.accountStatus === 'Active'
                                          ? 'bg-red-50 text-red-700 border border-red-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}
                                    >
                                      {acc.accountStatus === 'Active' ? 'Lock' : 'Unlock'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =====================================================================
              MODULE 11: RTSA DRIVER KYC & VEHICLE INSPECTION LAB
             ===================================================================== */}
          {activeSection === 'kyc_verification_hub' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500] bg-[#FFF0E6] px-2.5 py-0.5 rounded-full">
                    Dedicated System • Driver Verification Officer
                  </span>
                  <h2 className="text-lg font-extrabold text-[#15191C] mt-1">
                    RTSA Driver KYC, Criminal Record & Vehicle Inspection Lab
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verify Zambian National Registration Cards (NRC), RTSA PSV Badges, Road Fitness Discs, and 4-angle vehicle photos before activating drivers.
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-slate-500 block">Assigned Officer:</span>
                  <strong className="text-[#15191C]">Kelvin Banda (@kelvin.kyc)</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {drivers.map((drv) => (
                  <div
                    key={drv.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#15191C]">{drv.name}</h3>
                        <p className="text-slate-500">
                          {drv.phone} • {drv.cityName} ({drv.cityCode})
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          drv.documentsVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {drv.documentsVerified ? 'KYC Approved & Active' : 'Pending KYC Inspection'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#F4F6F9]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Vehicle & Plate</span>
                        <strong className="text-[#15191C]">
                          {drv.vehicleModel} ({drv.vehiclePlate})
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">RTSA PSV Permit</span>
                        <strong className="font-mono text-[#15191C]">{drv.rtsaLicenseNumber}</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        ✓ Zambian NRC Verified
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        ✓ RTSA Road Fitness Disc
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        ✓ Comprehensive Insurance
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleDriverStateChange(drv.id, 'Online and Available')}
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2"
                      >
                        Approve KYC & Activate Driver
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDriverStateChange(drv.id, 'Suspended')}
                        className="rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold px-4 py-2"
                      >
                        Reject / Suspend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 12: 999 EMERGENCY SOS & NATIONAL SAFETY COMMAND SYSTEM
             ===================================================================== */}
          {activeSection === 'safety_sos_command' && (
            <div className="space-y-5">
              <div className="bg-red-950 text-white rounded-2xl p-5 border border-red-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                    Dedicated System • Emergency SOS & Safety Commander
                  </span>
                  <h2 className="text-lg font-extrabold mt-1 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    999 / 991 Emergency SOS & Rapid Response Dispatch Command
                  </h2>
                  <p className="text-xs text-red-200">
                    Real-time GPS telemetry lock for panic button triggers, Zambia Police 999 coordination, and roadside medical response.
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-red-300 block">Commander on Duty:</span>
                  <strong className="text-white">Capt. Daka Mwale (@daka.sos)</strong>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {sosIncidents.map((inc) => (
                  <div
                    key={inc.incidentId}
                    className="bg-white rounded-2xl p-5 border-2 border-red-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                          {inc.incidentId}
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          Trip #{inc.tripId}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                          {inc.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-extrabold text-[10px]">
                          {inc.status}
                        </span>
                      </div>
                      <p className="font-extrabold text-sm text-[#15191C]">
                        Triggered by {inc.reporterName} ({inc.reporterRole}) • Driver: {inc.driverName} ({inc.vehiclePlate})
                      </p>
                      <p className="text-slate-600">
                        Live GPS: <strong>{inc.locationLabel}</strong> ({inc.gpsCoordinates}) • {inc.timestamp}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSOSStatus(inc.incidentId, 'Police / Ambulance En Route')
                        }
                        className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold px-3.5 py-2"
                      >
                        Dispatch 999 Police / Medical
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSOSStatus(inc.incidentId, 'Resolved & Logged')}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2"
                      >
                        Mark Safe & Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 13: CORPORATE B2B & ENTERPRISE FLEET LOGISTICS SYSTEM
             ===================================================================== */}
          {activeSection === 'corporate_b2b_logistics' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500] bg-[#FFF0E6] px-2.5 py-0.5 rounded-full">
                    Dedicated System • Corporate & B2B Fleet Director
                  </span>
                  <h2 className="text-lg font-extrabold text-[#15191C] mt-1">
                    Corporate B2B Contracts, Staff Shuttles & Heavy Cargo Haulage
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage enterprise credit limits, ZRA TPIN corporate billing, mining & retail cargo fleets, and dedicated company shuttles.
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-500 block">Assigned Director:</span>
                  <strong className="text-[#15191C]">Chisomo Tembo (@chisomo.b2b)</strong>
                </div>
              </div>

              <form
                onSubmit={handleAddB2BContract}
                className="bg-white rounded-2xl p-5 border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs items-end"
              >
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Enterprise Name</label>
                  <input
                    type="text"
                    value={b2bCompanyInput}
                    onChange={(e) => setB2bCompanyInput(e.target.value)}
                    placeholder="e.g. Shoprite Zambia Logistics"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">ZRA TPIN Number</label>
                  <input
                    type="text"
                    value={b2bTpinInput}
                    onChange={(e) => setB2bTpinInput(e.target.value)}
                    placeholder="10-digit ZRA TPIN"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={b2bContactInput}
                    onChange={(e) => setB2bContactInput(e.target.value)}
                    placeholder="Fleet Manager Name"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Monthly Credit (ZMW)</label>
                  <input
                    type="number"
                    value={b2bLimitInput}
                    onChange={(e) => setB2bLimitInput(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-extrabold"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF6500] hover:bg-[#e55a00] text-white font-extrabold py-2.5 px-4"
                >
                  + Add B2B Contract
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {b2bAccounts.map((b2b) => (
                  <div
                    key={b2b.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#15191C]">{b2b.companyName}</h3>
                        <p className="text-slate-500">
                          ZRA TPIN: <strong className="font-mono">{b2b.zraTpin}</strong> • {b2b.cityCode}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                        {b2b.status}
                      </span>
                    </div>
                    <p className="font-bold text-[#FF6500]">{b2b.contractType}</p>
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#F4F6F9]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Credit Limit</span>
                        <strong className="text-[#15191C]">
                          K{b2b.monthlyCreditLimitZMW.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Current Spend</span>
                        <strong className="text-emerald-700">
                          K{b2b.currentSpendZMW.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Assigned Fleet</span>
                        <strong className="text-[#15191C]">{b2b.activeVehiclesAssigned} Vehicles</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 14: VOIP CALL CENTRE & IN-APP AUDIO QUALITY SUPERVISOR SYSTEM
             ===================================================================== */}
          {activeSection === 'call_centre_voip' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500] bg-[#FFF0E6] px-2.5 py-0.5 rounded-full">
                    Dedicated System • Call Centre & VoIP Quality Supervisor
                  </span>
                  <h2 className="text-lg font-extrabold text-[#15191C] mt-1">
                    In-App Data VoIP Call Centre & Telecom Quality Monitor
                  </h2>
                  <p className="text-xs text-slate-500">
                    Monitor WebRTC Passenger ↔ Driver data calls, number masking privacy, call connection latency across MTN/Airtel/Zamtel, and support hotline queues.
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-500 block">Supervisor:</span>
                  <strong className="text-[#15191C]">Mapalo Sikazwe (@mapalo.voip)</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <span className="text-slate-400 font-bold">Active In-App VoIP Calls</span>
                  <p className="text-2xl font-black text-[#15191C] mt-1">48 Live</p>
                  <span className="text-[11px] text-emerald-600 font-bold">100% Number Masked</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <span className="text-slate-400 font-bold">Avg Audio Latency (Zambia)</span>
                  <p className="text-2xl font-black text-[#15191C] mt-1">34 ms</p>
                  <span className="text-[11px] text-emerald-600 font-bold">Opus HD Low-Data Codec</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <span className="text-slate-400 font-bold">Hotline QueueWait</span>
                  <p className="text-2xl font-black text-[#FF6500] mt-1">12 sec</p>
                  <span className="text-[11px] text-slate-500">+260 97 789 4432</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <span className="text-slate-400 font-bold">Call Success Rate</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">99.4%</p>
                  <span className="text-[11px] text-slate-500">Zero airtime required</span>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              MODULE 15: LEGAL, ZRA SMART INVOICE TAX & RTSA COMPLIANCE HUB
             ===================================================================== */}
          {activeSection === 'legal_compliance_hub' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500] bg-[#FFF0E6] px-2.5 py-0.5 rounded-full">
                    Dedicated System • Legal, ZRA Tax & RTSA Compliance Officer
                  </span>
                  <h2 className="text-lg font-extrabold text-[#15191C] mt-1">
                    ZRA Smart Invoice Tax, RTSA Licensing & Statutory Compliance Hub
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage Zambia Revenue Authority (ZRA) VAT filings, RTSA National Public Service Vehicle operator permits, PACRA corporate returns, and Data Protection audits.
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-500 block">Chief Compliance Officer:</span>
                  <strong className="text-[#15191C]">Adv. Nkandu Chanda (@nkandu.legal)</strong>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {complianceFilings.map((f) => (
                  <div
                    key={f.filingId}
                    className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#FF6500]">{f.filingId}</span>
                      <span className="mx-2 text-slate-300">•</span>
                      <strong className="text-[#15191C]">{f.authority}</strong>
                      <p className="font-bold text-sm text-[#15191C] mt-0.5">{f.title}</p>
                      <p className="text-slate-500">
                        Period: {f.period} • Due: {f.dueDate}
                        {f.amountZMW ? ` • Statutory Amount: K${f.amountZMW.toLocaleString()}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                          f.status === 'Compliant & Filed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.status}
                      </span>
                      {f.status !== 'Compliant & Filed' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateComplianceStatus(f.filingId, 'Compliant & Filed')
                          }
                          className="rounded-xl bg-[#0B1528] text-white font-extrabold px-3 py-1.5"
                        >
                          Mark Filed with Authority
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= STAFF SYSTEM LOGIN MODAL (AUTHENTICATES WITH OWNER-ISSUED PASSWORD) ================= */}
      {showStaffLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF6500] text-white flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#15191C]">
                    Mride Staff System Login
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sign in with the username & password issued by the Owner
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStaffLoginModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleStaffCredentialLogin} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Staff Username or Work Email
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. mulenga.ops or kelvin.kyc"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Owner-Assigned Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password given by Owner..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#FF6500] hover:bg-[#e55a00] text-white font-extrabold py-3 text-xs shadow-sm"
              >
                Sign In to Assigned Management System
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">
                Quick Fill Demo Accounts (Issued by Owner):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {staffAccounts.slice(0, 6).map((acc) => (
                  <button
                    key={acc.accountId}
                    type="button"
                    onClick={() => {
                      setLoginUsername(acc.username);
                      setLoginPassword(acc.passwordPlain);
                    }}
                    className="px-2 py-1 rounded-lg bg-[#F4F6F9] hover:bg-[#FFF0E6] text-[#15191C] font-mono text-[10px] border border-slate-200"
                  >
                    @{acc.username}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
