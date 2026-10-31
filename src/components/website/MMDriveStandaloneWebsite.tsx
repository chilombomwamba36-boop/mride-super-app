import React, { useEffect, useState } from 'react';
import {
  Car,
  Truck,
  Bike,
  Sparkles,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Headphones,
  CheckCircle2,
  UserRound,
  AlertTriangle,
  Receipt,
  Lock,
  Bell,
  Send,
  Briefcase,
  Building2,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { CountryStreetMap } from '../common/CountryStreetMap';
import { AdminPreview } from '../admin/AdminPreview';
import { CountryConfig, DEFAULT_COUNTRY } from '../../data/africanCountries';
import {
  DEFAULT_MRIDE_CONTENT,
  MrideContentSettings,
  readMrideContent
} from '../../services/contentSettings';
import {
  MridePlatformStore,
  SupportIssueCategory,
  SupportTicketRecord,
  CityServiceAreaConfig,
  StaffSystemAccount
} from '../../services/mridePlatformStore';
import {
  WebsiteCmsAndWorkforceService,
  WebsiteSnapshotVersion
} from '../../services/websiteCmsService';
import { AuthService } from '../../services/authService';
import { INITIAL_RIDE_HISTORY } from '../../data/mockData';
import { RideHistoryItem } from '../../types';
import { KeyRound } from 'lucide-react';

interface MMDriveStandaloneWebsiteProps {
  onSwitchToMobileApp?: () => void;
  country?: CountryConfig;
  onCountryChange?: (c: CountryConfig) => void;
  activeCity?: string;
  onCityChange?: (city: string) => void;
  initialReportTripRef?: string;
  forceManagementPortal?: boolean;
}

type WebsiteTopPage =
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
  | 'contact'
  | 'help'
  | 'customer_portal'
  | 'admin_portal';

type CustomerPortalTab =
  | 'profile'
  | 'trips'
  | 'cargo_orders'
  | 'receipts'
  | 'notifications'
  | 'security'
  | 'report_issue'
  | 'my_tickets';

export const MMDriveStandaloneWebsite: React.FC<MMDriveStandaloneWebsiteProps> = ({
  onSwitchToMobileApp,
  country = DEFAULT_COUNTRY,
  activeCity = country.defaultCity,
  onCityChange,
  initialReportTripRef,
  forceManagementPortal = false
}) => {
  const authService = AuthService.getInstance();
  const currentUser = authService.getCurrentUser();

  const [content, setContent] = useState<MrideContentSettings>(() => {
    try {
      return readMrideContent();
    } catch {
      return DEFAULT_MRIDE_CONTENT;
    }
  });

  // Published Website Snapshot (Edited & Published from the Website Design Editor)
  const [publishedSite, setPublishedSite] = useState<WebsiteSnapshotVersion>(() =>
    WebsiteCmsAndWorkforceService.getPublishedWebsiteSnapshot()
  );

  // Private Management Portal Authentication State (Inaccessible to unauthenticated public visitors)
  const [authenticatedPortalAccount, setAuthenticatedPortalAccount] =
    useState<StaffSystemAccount | null>(() => {
      const savedUser = WebsiteCmsAndWorkforceService.getAuthenticatedPortalStaffUsername();
      if (!savedUser) return null;
      return (
        MridePlatformStore.getStaffSystemAccounts().find(
          (a) => a.username.toLowerCase() === savedUser.toLowerCase()
        ) || null
      );
    });
  const [portalUsernameInput, setPortalUsernameInput] = useState('');
  const [portalPasswordInput, setPortalPasswordInput] = useState('');
  const [portalPinInput, setPortalPinInput] = useState('');
  const [portalAuthError, setPortalAuthError] = useState<string | null>(null);

  const [activePage, setActivePage] = useState<WebsiteTopPage>(() => {
    if (forceManagementPortal) return 'admin_portal';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'management' || window.location.hash === '#management-portal') {
        return 'admin_portal';
      }
    }
    return 'home';
  });
  const [portalTab, setPortalTab] = useState<CustomerPortalTab>('report_issue');

  // Shared Backend Cities & Tickets
  const [cities, setCities] = useState<CityServiceAreaConfig[]>(() => MridePlatformStore.getCities());
  const [tickets, setTickets] = useState<SupportTicketRecord[]>(() =>
    MridePlatformStore.getSupportTickets()
  );

  // Homepage / Rides Page Booking Bar State
  const [pickupInput, setPickupInput] = useState('Cavendish University, Lusaka');
  const [destinationInput, setDestinationInput] = useState('EastPark Mall, Great East Rd');
  const [selectedRideTier, setSelectedRideTier] = useState<'Economy' | 'Comfort' | 'XL' | 'Premium'>('Economy');
  const [fairFareDemoPrice, setFairFareDemoPrice] = useState<number>(80);

  // Customer Portal & Report an Issue Form State (Matches Screen 5 of Uploaded Reference)
  const [issueCategory, setIssueCategory] = useState<SupportIssueCategory>('Trip Issue');
  const [issueTripRef, setIssueTripRef] = useState<string>(initialReportTripRef || 'MR-4987');
  const [issueMessage, setIssueMessage] = useState<string>('');
  const [issuePhotoName, setIssuePhotoName] = useState<string>('');
  const [createdTicketBanner, setCreatedTicketBanner] = useState<string | null>(null);
  const [customerReplyInput, setCustomerReplyInput] = useState<Record<string, string>>({});

  // Driver / Partner & Upcoming City Interest State
  const [partnerCompany, setPartnerCompany] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('+260 97 ');
  const [partnerToast, setPartnerToast] = useState<string | null>(null);
  const [upcomingCityName, setUpcomingCityName] = useState('');
  const [upcomingCityPhone, setUpcomingCityPhone] = useState('+260 97 ');

  const rideHistory: RideHistoryItem[] = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('mrides-ride-history');
      if (raw) {
        const parsed = JSON.parse(raw) as RideHistoryItem[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_RIDE_HISTORY;
  }, []);

  useEffect(() => {
    if (initialReportTripRef) {
      setIssueTripRef(initialReportTripRef);
      setActivePage('customer_portal');
      setPortalTab('report_issue');
    }
  }, [initialReportTripRef]);

  useEffect(() => {
    if (forceManagementPortal) {
      setActivePage('admin_portal');
    }
  }, [forceManagementPortal]);

  useEffect(() => {
    const onContentChange = () => setContent(readMrideContent());
    const onCitiesChange = () => setCities(MridePlatformStore.getCities());
    const onTicketsChange = () => setTickets(MridePlatformStore.getSupportTickets());
    const onWebsitePublished = () =>
      setPublishedSite(WebsiteCmsAndWorkforceService.getPublishedWebsiteSnapshot());

    const onHashChange = () => {
      if (window.location.hash === '#management-portal') {
        setActivePage('admin_portal');
      } else if (window.location.hash === '#public-website') {
        setActivePage('home');
      }
    };

    window.addEventListener('mride:content-updated', onContentChange);
    window.addEventListener('mride:cities-updated', onCitiesChange);
    window.addEventListener('mride:tickets-updated', onTicketsChange);
    window.addEventListener('mride:website-published', onWebsitePublished);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('mride:content-updated', onContentChange);
      window.removeEventListener('mride:cities-updated', onCitiesChange);
      window.removeEventListener('mride:tickets-updated', onTicketsChange);
      window.removeEventListener('mride:website-published', onWebsitePublished);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const handlePortalAuthentication = (e: React.FormEvent) => {
    e.preventDefault();
    const res = MridePlatformStore.authenticateStaffAccount(
      portalUsernameInput,
      portalPasswordInput
    );
    if (!res.success || !res.account) {
      setPortalAuthError(res.message);
      return;
    }
    if (portalPinInput.trim() && portalPinInput.trim() !== res.account.accessPin) {
      setPortalAuthError('Invalid 4-digit staff security PIN.');
      return;
    }
    WebsiteCmsAndWorkforceService.setAuthenticatedPortalStaffUsername(res.account.username);
    setAuthenticatedPortalAccount(res.account);
    setPortalAuthError(null);
  };

  const handlePortalLogout = () => {
    WebsiteCmsAndWorkforceService.setAuthenticatedPortalStaffUsername(null);
    setAuthenticatedPortalAccount(null);
    setActivePage('home');
  };

  const handleSubmitIssueReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueMessage.trim()) return;

    const ticket = MridePlatformStore.createSupportTicket({
      customerId: currentUser.id,
      customerName: currentUser.name || 'Chilombo M.',
      customerPhone: currentUser.phone || '+260 76 910 8705',
      tripReference: issueTripRef || 'MR-4987',
      cityCode: 'ZM-LSK',
      category: issueCategory,
      subject: `${issueCategory} (${issueTripRef || 'General'})`,
      description: issueMessage.trim(),
      photoAttachmentName: issuePhotoName || undefined
    });

    setTickets(MridePlatformStore.getSupportTickets());
    setIssueMessage('');
    setIssuePhotoName('');
    setCreatedTicketBanner(
      `Report submitted! Your unique tracking reference is #${ticket.ticketId}. You can view live staff replies in "My Support Tickets".`
    );
  };

  const handleCustomerReply = (ticketId: string) => {
    const msg = customerReplyInput[ticketId];
    if (!msg || !msg.trim()) return;
    const updated = MridePlatformStore.addTicketReply({
      ticketId,
      senderName: currentUser.name || 'Chilombo M.',
      senderRole: 'customer',
      message: msg.trim()
    });
    setTickets(updated);
    setCustomerReplyInput({ ...customerReplyInput, [ticketId]: '' });
  };

  const liveCities = cities.filter((c) => c.status === 'Live');

  return (
    <div
      className="min-h-screen text-[#15191C] flex flex-col font-sans"
      style={{
        backgroundColor: publishedSite.theme.backgroundLightHex,
        fontFamily: publishedSite.theme.headingFontFamily
      }}
    >
      {/* Top Published Announcement Ribbon (Editable in Website Design Editor) */}
      {publishedSite.theme.showAnnouncementBar && activePage !== 'admin_portal' && (
        <div
          className="text-white text-[11px] font-extrabold py-1.5 px-4 text-center"
          style={{ backgroundColor: publishedSite.theme.primaryColorHex }}
        >
          {publishedSite.theme.announcementBarText}
        </div>
      )}

      {/* ================= TOP OFFICIAL PUBLIC MRIDE WEBSITE NAVBAR (NO ADMIN LINKS ON PUBLIC SITE) ================= */}
      {activePage !== 'admin_portal' && (
        <header
          className="sticky top-0 z-40 text-white border-b border-white/10 shadow-md"
          style={{ backgroundColor: publishedSite.theme.secondaryNavyHex }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            {/* Brand Logo */}
            <div
              onClick={() => setActivePage('home')}
              className="flex items-center gap-2.5 cursor-pointer shrink-0"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: publishedSite.theme.primaryColorHex }}
              >
                <img src={publishedSite.theme.brandLogoUrl} alt="Mride" className="w-7 h-7" />
              </div>
              <div>
                <span className="font-display font-extrabold text-xl tracking-tight text-white block leading-none">
                  Mride
                </span>
                <span className="text-[10px] text-slate-300 font-semibold tracking-wider">
                  Your Ride. Your Way.
                </span>
              </div>
            </div>

            {/* Center Public Navigation Links (Driven by Published Website Snapshot) */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-bold">
              {([
                { id: 'home', label: 'Home' },
                { id: 'rides', label: 'Rides' },
                { id: 'cargo', label: 'Cargo' },
                { id: 'boda', label: 'Boda Delivery' },
                { id: 'fairfare', label: 'FairFare' },
                { id: 'corporate', label: 'Corporate Services' },
                { id: 'about', label: 'About Us' },
                { id: 'faqs', label: 'FAQs' },
                { id: 'contact', label: 'Contact & Help' }
              ] as const)
                .filter((nav) => publishedSite.pages[nav.id]?.visibleInNavbar !== false)
                .map((nav) => {
                  const active = activePage === nav.id;
                  return (
                    <button
                      key={nav.id}
                      onClick={() => setActivePage(nav.id)}
                      className={`px-3 py-2 rounded-xl transition-all ${
                        active
                          ? 'bg-[#FF6500] text-white font-extrabold'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {nav.label}
                    </button>
                  );
                })}
            </nav>

            {/* Right Public Actions: Customer Portal & Get the App ONLY (No Staff/Admin Links on Public Website) */}
            <div className="flex items-center gap-2">
              <select
                aria-label="Website Page"
                value={activePage}
                onChange={(e) => setActivePage(e.target.value as WebsiteTopPage)}
                className="lg:hidden rounded-xl bg-[#162238] border border-white/15 px-2.5 py-1.5 text-xs font-bold text-white"
              >
                <option value="home">Home</option>
                <option value="rides">Rides</option>
                <option value="cargo">Cargo</option>
                <option value="boda">Boda Delivery</option>
                <option value="fairfare">FairFare</option>
                <option value="corporate">Corporate Services</option>
                <option value="food">Food Delivery</option>
                <option value="marketplace">Marketplace</option>
                <option value="about">About Us</option>
                <option value="faqs">FAQs</option>
                <option value="contact">Contact & Help</option>
                <option value="customer_portal">Customer Portal</option>
              </select>

              <button
                onClick={() => setActivePage('customer_portal')}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                  activePage === 'customer_portal'
                    ? 'bg-white text-[#0B1528] border-white'
                    : 'bg-transparent text-white border-white/25 hover:bg-white/10'
                }`}
              >
                <UserRound className="w-3.5 h-3.5 text-[#FF6500]" />
                <span className="hidden sm:inline">Customer Portal</span>
              </button>

              {onSwitchToMobileApp && (
                <button
                  onClick={onSwitchToMobileApp}
                  className="bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Get the App</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ================= MAIN VIEWPORT ================= */}
      <main className="flex-1">
        {/* =========================================================================
            1. HOMEPAGE (Connected to Published Website Design Editor Snapshot)
           ========================================================================= */}
        {activePage === 'home' && (
          <div className="space-y-10 pb-12">
            {/* Sunset City Skyline Hero Banner with Dynamic Published Content */}
            <section
              className="relative text-white overflow-hidden"
              style={{ backgroundColor: publishedSite.theme.secondaryNavyHex }}
            >
              <div className="absolute inset-0 opacity-45">
                <img
                  src={publishedSite.pages.home.bannerImageUrl || '/lusaka-driver-hero.jpg'}
                  alt={publishedSite.pages.home.pageTitle || 'Mride Lusaka Skyline'}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/85 to-transparent" />
              </div>

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 text-xs font-extrabold text-[#FFE500]">
                    <ShieldCheck className="w-4 h-4 text-[#FF6500]" />
                    <span>
                      {publishedSite.pages.home.promoBannerText ||
                        `Active in ${liveCities.map((c) => c.cityName).join(', ')}`}
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                    {publishedSite.pages.home.heroHeading}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-200 max-w-xl leading-relaxed">
                    {publishedSite.pages.home.heroSubheading}
                  </p>

                  {/* App Store / Google Play & Quick Action Pills */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {onSwitchToMobileApp && (
                      <button
                        onClick={onSwitchToMobileApp}
                        className="rounded-xl bg-black/80 hover:bg-black border border-white/20 px-4 py-2.5 flex items-center gap-2.5 text-left transition-colors"
                      >
                        <Smartphone className="w-5 h-5 text-[#FF6500]" />
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-300 block">
                            Launch Live Web App
                          </span>
                          <span className="text-xs font-extrabold text-white">Google Play / iOS App</span>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => setActivePage('fairfare')}
                      className="rounded-xl text-white font-extrabold px-5 py-3 text-xs shadow-md transition-colors"
                      style={{ backgroundColor: publishedSite.theme.primaryColorHex }}
                    >
                      {publishedSite.pages.home.primaryCtaText || 'Explore FairFare Negotiation'}
                    </button>

                    <button
                      onClick={() => {
                        setActivePage('customer_portal');
                        setPortalTab('report_issue');
                      }}
                      className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold px-4 py-3 text-xs"
                    >
                      {publishedSite.pages.home.secondaryCtaText || 'Report an Issue / Track Ticket'}
                    </button>
                  </div>
                </div>

                {/* Right Branded Fleet Showcase Card */}
                <div className="lg:col-span-5">
                  <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-5 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Service Areas
                      </span>
                      <span className="bg-[#FF6500] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                        FairFare Enabled
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {liveCities.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => onCityChange?.(c.cityName)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                            activeCity === c.cityName
                              ? 'bg-[#FF6500] text-white'
                              : 'bg-white/10 text-slate-200 hover:bg-white/20'
                          }`}
                        >
                          {c.cityName} (Min K{c.pricing.rides.minFareZMW})
                        </button>
                      ))}
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-white/15">
                      <CountryStreetMap
                        country={country}
                        activeCity={activeCity}
                        pickupName={pickupInput}
                        destinationName={destinationInput}
                        heightClass="h-48"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Signature Service Cards Overlapping Hero (Rides, Cargo, Boda Delivery, FairFare) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    id: 'rides' as WebsiteTopPage,
                    title: 'Rides',
                    desc: 'Safe & affordable rides across Zambia.',
                    icon: Car
                  },
                  {
                    id: 'cargo' as WebsiteTopPage,
                    title: 'Cargo',
                    desc: 'Move your goods, big or small.',
                    icon: Truck
                  },
                  {
                    id: 'boda' as WebsiteTopPage,
                    title: 'Boda Delivery',
                    desc: 'Fast and reliable parcel delivery.',
                    icon: Bike
                  },
                  {
                    id: 'fairfare' as WebsiteTopPage,
                    title: 'FairFare',
                    desc: 'Negotiate your fare. Your way.',
                    icon: Sparkles
                  }
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.id}
                      onClick={() => setActivePage(card.id)}
                      className="cursor-pointer bg-white hover:border-[#FF6500] rounded-2xl p-5 border border-slate-200 shadow-md transition-all group space-y-2.5"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#FFF0E6] text-[#FF6500] group-hover:bg-[#FF6500] group-hover:text-white flex items-center justify-center transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-[#15191C]">{card.title}</h3>
                      <p className="text-xs text-slate-500">{card.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Where Are You Going? Interactive Booking Bar */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-extrabold text-[#15191C]">Where are you going?</h2>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5 flex items-center gap-2.5 rounded-2xl bg-[#F4F6F9] border border-slate-200 px-4 py-3">
                    <MapPin className="w-4 h-4 text-[#FF6500] shrink-0" />
                    <input
                      type="text"
                      value={pickupInput}
                      onChange={(e) => setPickupInput(e.target.value)}
                      placeholder="Pickup location"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#15191C] outline-none"
                    />
                  </div>
                  <div className="md:col-span-5 flex items-center gap-2.5 rounded-2xl bg-[#F4F6F9] border border-slate-200 px-4 py-3">
                    <MapPin className="w-4 h-4 text-[#0B1528] shrink-0" />
                    <input
                      type="text"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      placeholder="Destination"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#15191C] outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={() => (onSwitchToMobileApp ? onSwitchToMobileApp() : setActivePage('rides'))}
                      className="w-full rounded-2xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3.5 text-xs sm:text-sm shadow-sm transition-colors"
                    >
                      Book Ride
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Request Mride in an Upcoming City */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="rounded-3xl bg-[#0B1528] text-white p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500]">
                    City Expansion Network
                  </span>
                  <h3 className="text-xl font-extrabold">
                    Want Mride in your town or province?
                  </h3>
                  <p className="text-xs text-slate-300">
                    Mride is currently live in {liveCities.map((c) => c.cityName).join(', ')}. Register your interest for upcoming cities or apply as a local driver partner.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!upcomingCityName.trim()) return;
                    MridePlatformStore.registerCustomerCityInterest(upcomingCityName, upcomingCityPhone);
                    setPartnerToast(`Thank you! Your vote for ${upcomingCityName} has been logged in our City Expansion queue.`);
                    setUpcomingCityName('');
                  }}
                  className="flex flex-wrap items-center gap-2 w-full lg:w-auto"
                >
                  <input
                    type="text"
                    value={upcomingCityName}
                    onChange={(e) => setUpcomingCityName(e.target.value)}
                    placeholder="City name (e.g. Chipata, Kasama)"
                    className="rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400"
                    required
                  />
                  <input
                    type="text"
                    value={upcomingCityPhone}
                    onChange={(e) => setUpcomingCityPhone(e.target.value)}
                    placeholder="+260 97..."
                    className="rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold px-4 py-2.5 text-xs"
                  >
                    Register City Interest
                  </button>
                </form>
              </div>
              {partnerToast && (
                <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-extrabold text-emerald-800">
                  {partnerToast}
                </div>
              )}
            </section>
          </div>
        )}

        {/* =========================================================================
            2. RIDES PAGE (Matches Screen 2 Top-Second of Uploaded Reference)
           ========================================================================= */}
        {activePage === 'rides' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="rounded-3xl bg-[#0B1528] text-white p-6 sm:p-10 space-y-3">
              <span className="bg-[#FF6500] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                Mride Passenger Rides
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold">Rides</h1>
              <p className="text-sm text-slate-300 max-w-lg">
                Comfortable, safe and affordable rides for every journey across {activeCity}.
              </p>
            </div>

            {/* Tier Selector: Economy, Comfort, XL, Premium */}
            <div className="flex flex-wrap gap-2">
              {(['Economy', 'Comfort', 'XL', 'Premium'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedRideTier(tier)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    selectedRideTier === tier
                      ? 'bg-[#FF6500] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#FF6500]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              {[
                { title: 'Affordable', sub: 'FairFare from K22' },
                { title: 'Safe & Verified', sub: 'RTSA PSV certified drivers' },
                { title: 'Live Tracking', sub: 'Real-time GPS & share trip' },
                { title: 'Cash & Mobile Money', sub: 'Cash, Airtel Money & MTN MoMo' }
              ].map((b, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-[#FF6500] mx-auto" />
                  <strong className="text-[#15191C] block">{b.title}</strong>
                  <span className="text-[11px] text-slate-500">{b.sub}</span>
                </div>
              ))}
            </div>

            {/* Book a Ride Box + Phone Map Preview */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-xl font-extrabold text-[#15191C]">
                  Book a {selectedRideTier} Ride
                </h2>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-500 block mb-1">From</label>
                    <input
                      type="text"
                      value={pickupInput}
                      onChange={(e) => setPickupInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-[#F4F6F9] px-3.5 py-3 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-500 block mb-1">To</label>
                    <input
                      type="text"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-[#F4F6F9] px-3.5 py-3 text-sm font-semibold"
                    />
                  </div>
                  <button
                    onClick={() => onSwitchToMobileApp?.()}
                    className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3.5 text-sm shadow-sm"
                  >
                    Find Drivers in Mobile App
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <CountryStreetMap
                  country={country}
                  activeCity={activeCity}
                  pickupName={pickupInput}
                  destinationName={destinationInput}
                  heightClass="h-64"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. CARGO & BODA DELIVERY PAGE (Matches Screen 3 Top-Third of Reference)
           ========================================================================= */}
        {(activePage === 'cargo' || activePage === 'boda') && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="rounded-3xl bg-[#0B1528] text-white p-6 sm:p-10 space-y-2">
              <span className="bg-[#FF6500] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                Logistics & Express Courier
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold">Cargo & Boda Delivery</h1>
              <p className="text-sm text-slate-300 max-w-xl">
                Move your goods, big or small — fast and secure with PIN-verified pickup and recipient confirmation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6500] flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-[#15191C]">Cargo</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For large and small shipments: Light vans, 1-ton pickups and 3.5-ton commercial Canters with optional loading porters and digital waybills.
                </p>
                <button
                  onClick={() => onSwitchToMobileApp?.()}
                  className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3 text-xs"
                >
                  Book Cargo
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6500] flex items-center justify-center">
                  <Bike className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-[#15191C]">Boda Delivery</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fast motorcycle delivery within the city for parcels, documents, groceries and spare parts up to 25 kg with sender & recipient PIN verification.
                </p>
                <button
                  onClick={() => onSwitchToMobileApp?.()}
                  className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3 text-xs"
                >
                  Book Delivery
                </button>
              </div>
            </div>

            {/* Business Solution Banner */}
            <div className="rounded-3xl bg-[#0B1528] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold">Need a business solution?</h3>
                <p className="text-xs text-slate-300">
                  Bulk orders, regular store deliveries and corporate accounts with monthly invoicing.
                </p>
              </div>
              <button
                onClick={() => setActivePage('about')}
                className="rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold px-5 py-3 text-xs shrink-0"
              >
                Contact Sales
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. FAIRFARE EXPLANATION PAGE (Matches Screen 4 Top-Fourth of Reference)
           ========================================================================= */}
        {activePage === 'fairfare' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#15191C]">FairFare</h1>
              <p className="text-sm text-slate-600">Negotiate your fare. Ride with confidence.</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#FF6500] to-[#E05500] text-white p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
              <div className="lg:col-span-7 space-y-5">
                <h2 className="text-2xl font-extrabold">How it works</h2>
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-white text-[#FF6500] font-extrabold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <strong className="block text-base">Request a ride or delivery</strong>
                      <span className="text-white/90">
                        Enter your pickup and destination to see the estimated distance and indicative fare range.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-white text-[#FF6500] font-extrabold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <strong className="block text-base">Negotiate the fare</strong>
                      <span className="text-white/90">
                        Propose your preferred fare or review counteroffers from nearby verified drivers (up to 3 rounds).
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-white text-[#FF6500] font-extrabold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <strong className="block text-base">Confirm and ride</strong>
                      <span className="text-white/90">
                        Once accepted by both sides, the agreed price is locked for your trip — zero surprise charges.
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSwitchToMobileApp?.()}
                  className="rounded-xl bg-white text-[#15191C] hover:bg-slate-100 font-extrabold px-6 py-3 text-xs shadow-md"
                >
                  Try FairFare Now
                </button>
              </div>

              {/* Interactive Phone Preview Card */}
              <div className="lg:col-span-5">
                <div className="bg-white text-[#15191C] rounded-3xl p-5 shadow-2xl border-4 border-[#0B1528] max-w-xs mx-auto space-y-4 text-center">
                  <span className="text-xs font-extrabold text-[#FF6500] uppercase tracking-wider block">
                    Mride FairFare
                  </span>
                  <p className="text-xs text-slate-500">Propose your fare (ZMW)</p>
                  <div className="text-4xl font-black text-[#15191C]">K{fairFareDemoPrice}</div>
                  <input
                    type="range"
                    min={22}
                    max={250}
                    step={5}
                    value={fairFareDemoPrice}
                    onChange={(e) => setFairFareDemoPrice(Number(e.target.value))}
                    className="w-full accent-[#FF6500]"
                  />
                  <button
                    onClick={() => onSwitchToMobileApp?.()}
                    className="w-full rounded-xl bg-[#FF6500] text-white font-extrabold py-3 text-xs"
                  >
                    Send Offer (K{fairFareDemoPrice})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            5. ABOUT, DRIVER REGISTRATION & FLEET PARTNERSHIPS PAGE
           ========================================================================= */}
        {activePage === 'about' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
              <span className="bg-[#FFF0E6] text-[#FF6500] text-xs font-extrabold px-3 py-1 rounded-full">
                About Mride Zambia
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15191C]">
                Built for Passengers, Drivers & Businesses Across Zambia
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Mride provides passenger ride-hailing, cargo transportation and boda-boda parcel delivery with transparent FairFare price negotiation, private driver reward goals, RTSA PSV verification, and in-app data voice calling.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-2xl bg-[#F4F6F9] space-y-1.5">
                  <Car className="w-5 h-5 text-[#FF6500]" />
                  <h3 className="font-extrabold text-sm text-[#15191C]">Driver Registration</h3>
                  <p className="text-slate-500">
                    Sign up in the Mride Driver Portal with your RTSA PSV license and vehicle fitness certificate. Earn weekly Driver Goal bonuses and priority dispatch orders.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F6F9] space-y-1.5">
                  <Building2 className="w-5 h-5 text-[#FF6500]" />
                  <h3 className="font-extrabold text-sm text-[#15191C]">Fleet & Business Partnerships</h3>
                  <p className="text-slate-500">
                    Onboard commercial trucks, corporate staff transport accounts, or multi-vehicle taxi fleets under one unified dashboard.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F6F9] space-y-1.5">
                  <ShieldCheck className="w-5 h-5 text-[#FF6500]" />
                  <h3 className="font-extrabold text-sm text-[#15191C]">Safety, Privacy & Terms</h3>
                  <p className="text-slate-500">
                    Passenger phone numbers remain masked until booking confirmation. Direct SOS 999 / 991 dispatch and full audit logs protect every trip.
                  </p>
                </div>
              </div>
            </div>

            {/* Fleet / Business Partnership Application */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPartnerToast('Partnership inquiry received! Our Lusaka Operations team will contact you shortly.');
                setPartnerCompany('');
              }}
              className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 text-xs"
            >
              <h2 className="text-lg font-extrabold text-[#15191C] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#FF6500]" />
                Apply as a Fleet Partner or Business Account
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={partnerCompany}
                  onChange={(e) => setPartnerCompany(e.target.value)}
                  placeholder="Company or Fleet Owner Name"
                  className="rounded-xl border border-slate-300 px-3.5 py-2.5 font-semibold"
                  required
                />
                <input
                  type="text"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  placeholder="Zambian Phone (+260...)"
                  className="rounded-xl border border-slate-300 px-3.5 py-2.5 font-semibold"
                  required
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-2.5 px-4"
                >
                  Submit Partnership Request
                </button>
              </div>
              {partnerToast && (
                <p className="text-emerald-700 font-extrabold">{partnerToast}</p>
              )}
            </form>
          </div>
        )}

        {/* =========================================================================
            5B. DYNAMIC CMS PAGES (CORPORATE SERVICES, FOOD, MARKETPLACE, FAQS, CONTACT)
           ========================================================================= */}
        {(activePage === 'corporate' ||
          activePage === 'food' ||
          activePage === 'marketplace' ||
          activePage === 'faqs' ||
          activePage === 'contact') && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div
              className="rounded-3xl text-white p-6 sm:p-10 space-y-3"
              style={{ backgroundColor: publishedSite.theme.secondaryNavyHex }}
            >
              <span
                className="text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full inline-block"
                style={{ backgroundColor: publishedSite.theme.primaryColorHex }}
              >
                {publishedSite.pages[activePage].pageTitle}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold">
                {publishedSite.pages[activePage].heroHeading}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                {publishedSite.pages[activePage].heroSubheading}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => (onSwitchToMobileApp ? onSwitchToMobileApp() : setActivePage('customer_portal'))}
                  className="rounded-xl text-white font-extrabold px-5 py-2.5 text-xs"
                  style={{ backgroundColor: publishedSite.theme.primaryColorHex }}
                >
                  {publishedSite.pages[activePage].primaryCtaText}
                </button>
                <button
                  onClick={() => setActivePage('customer_portal')}
                  className="rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 text-xs"
                >
                  {publishedSite.pages[activePage].secondaryCtaText}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#15191C]">
                {publishedSite.pages[activePage].sectionHeading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {publishedSite.pages[activePage].sectionBody}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {publishedSite.pages[activePage].featureBullets.map((b, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#F4F6F9] border border-slate-200 space-y-1">
                    <CheckCircle2
                      className="w-5 h-5"
                      style={{ color: publishedSite.theme.primaryColorHex }}
                    />
                    <p className="text-xs font-extrabold text-[#15191C]">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            6. CUSTOMER PORTAL & REPORT AN ISSUE (Matches Screen 5 Top-Right of Reference)
           ========================================================================= */}
        {(activePage === 'customer_portal' || activePage === 'help') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Customer Portal Left Sidebar */}
              <aside className="lg:col-span-3 bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-4 h-fit">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-[#FFF0E6] text-[#FF6500] font-extrabold flex items-center justify-center text-base">
                    {(currentUser.name || 'C').charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#FF6500] block">
                      Customer Portal
                    </span>
                    <h3 className="font-extrabold text-sm text-[#15191C]">
                      {currentUser.name || 'Chilombo M.'}
                    </h3>
                    <p className="text-[11px] text-slate-400">{currentUser.phone || '+260 76 910 8705'}</p>
                  </div>
                </div>

                <nav className="space-y-1 text-xs font-bold">
                  {([
                    { id: 'report_issue', label: 'Report an Issue', icon: AlertTriangle },
                    { id: 'my_tickets', label: `My Support Tickets (${tickets.length})`, icon: Headphones },
                    { id: 'profile', label: 'My Profile', icon: UserRound },
                    { id: 'trips', label: 'My Trips & Bookings', icon: Car },
                    { id: 'cargo_orders', label: 'Cargo & Boda Orders', icon: Truck },
                    { id: 'receipts', label: 'Payment History & Receipts', icon: Receipt },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'security', label: 'Account Security & Safety', icon: Lock }
                  ] as const).map((item) => {
                    const Icon = item.icon;
                    const active = portalTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setPortalTab(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                          active
                            ? 'bg-[#FF6500] text-white font-extrabold'
                            : 'text-slate-600 hover:bg-[#F4F6F9] hover:text-[#15191C]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* Customer Portal Main Content Area */}
              <div className="lg:col-span-9 space-y-5">
                {/* TAB: REPORT AN ISSUE (Matches Screen 5 Top-Right of Uploaded Reference) */}
                {portalTab === 'report_issue' && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                    <div>
                      <h2 className="text-xl font-extrabold text-[#15191C]">Report an Issue</h2>
                      <p className="text-xs text-slate-500">
                        Tell us what happened. We’ll take it from here and generate an instant tracking ticket ID.
                      </p>
                    </div>

                    {createdTicketBanner && (
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-extrabold text-emerald-900 flex items-center justify-between">
                        <span>{createdTicketBanner}</span>
                        <button
                          onClick={() => setPortalTab('my_tickets')}
                          className="rounded-lg bg-emerald-700 text-white px-3 py-1.5 ml-3 shrink-0"
                        >
                          View My Tickets
                        </button>
                      </div>
                    )}

                    {/* 6 Visual Issue Category Cards (Matches Reference Screen 5) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      {([
                        { id: 'Trip Issue' as SupportIssueCategory, title: 'Trip Issue', desc: 'Driver, route or ride problem' },
                        { id: 'Payment Issue' as SupportIssueCategory, title: 'Payment Issue', desc: 'Fares, payment, refund' },
                        { id: 'Driver Behaviour' as SupportIssueCategory, title: 'Driver Behaviour', desc: 'Rude, unsafe or unprofessional' },
                        { id: 'Lost Item' as SupportIssueCategory, title: 'Lost Item', desc: 'Item left in a vehicle' },
                        { id: 'Delivery Issue' as SupportIssueCategory, title: 'Cargo / Boda Delivery', desc: 'Delayed or damaged package' },
                        { id: 'Account Issue' as SupportIssueCategory, title: 'Account / App Error', desc: 'Login, verification or general' }
                      ]).map((cat) => {
                        const active = issueCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setIssueCategory(cat.id)}
                            className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                              active
                                ? 'border-[#FF6500] bg-[#FFF0E6] ring-1 ring-[#FF6500]'
                                : 'border-slate-200 bg-[#F4F6F9] hover:bg-white'
                            }`}
                          >
                            <span className="font-extrabold text-sm text-[#15191C] block">{cat.title}</span>
                            <span className="text-[11px] text-slate-500 block">{cat.desc}</span>
                          </button>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSubmitIssueReport} className="space-y-4 text-xs">
                      <div>
                        <label className="font-extrabold text-[#15191C] block mb-1">
                          Select related trip or delivery (optional)
                        </label>
                        <select
                          value={issueTripRef}
                          onChange={(e) => setIssueTripRef(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-[#F4F6F9] px-3.5 py-2.5 font-bold"
                        >
                          <option value="MR-4987">MR-4987 • Lusaka Ride (Cavendish → EastPark Mall) — K80</option>
                          {rideHistory.map((item) => (
                            <option key={item.id} value={item.ticketNumber || item.id}>
                              {item.ticketNumber || item.id} • {item.pickup} → {item.destination} (K{item.fareZMW})
                            </option>
                          ))}
                          <option value="General">General Account / App Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-extrabold text-[#15191C] block mb-1">Your message</label>
                        <textarea
                          rows={4}
                          value={issueMessage}
                          onChange={(e) => setIssueMessage(e.target.value)}
                          placeholder="Describe the issue in detail..."
                          className="w-full rounded-xl border border-slate-300 bg-[#F4F6F9] p-3.5 text-xs font-medium outline-none focus:border-[#FF6500]"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-extrabold text-[#15191C] block mb-1">
                          Add photos or receipt evidence (optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setIssuePhotoName(e.target.files?.[0]?.name || '')}
                          className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-[#F4F6F9] file:px-3.5 file:py-2 file:font-extrabold file:text-[#15191C]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3.5 text-sm shadow-sm"
                      >
                        Submit Report
                      </button>
                      <p className="text-[11px] text-slate-400 text-center">
                        You’ll receive a unique ticket ID to track your report and reply to support staff.
                      </p>
                    </form>
                  </div>
                )}

                {/* TAB: MY SUPPORT TICKETS & LIVE REPLIES */}
                {portalTab === 'my_tickets' && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                    <h2 className="text-lg font-extrabold text-[#15191C]">
                      My Support Tickets ({tickets.length})
                    </h2>
                    <div className="space-y-4">
                      {tickets.map((tkt) => (
                        <div
                          key={tkt.ticketId}
                          className="rounded-2xl bg-[#F4F6F9] p-4 border border-slate-200 space-y-3 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="font-mono font-extrabold text-sm text-[#15191C]">
                                #{tkt.ticketId} • {tkt.category}
                              </span>
                              <p className="text-slate-500">
                                Trip Ref: <strong>{tkt.tripReference}</strong> • Created: {tkt.createdAt}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                                tkt.status === 'Resolved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-[#FFF0E6] text-[#FF6500]'
                              }`}
                            >
                              {tkt.status}
                            </span>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-200">
                            {tkt.messages
                              .filter((m) => m.senderRole !== 'internal_note')
                              .map((m) => (
                                <div
                                  key={m.id}
                                  className={`p-3 rounded-xl ${
                                    m.senderRole === 'support_agent'
                                      ? 'bg-[#FFF0E6] border border-[#FF6500]/30'
                                      : 'bg-white border border-slate-200'
                                  }`}
                                >
                                  <div className="flex justify-between font-extrabold text-[11px] mb-1">
                                    <span>{m.senderName}</span>
                                    <span className="text-slate-400">{m.timestamp}</span>
                                  </div>
                                  <p>{m.message}</p>
                                </div>
                              ))}
                          </div>

                          {tkt.status !== 'Resolved' && (
                            <div className="flex gap-2 pt-1">
                              <input
                                type="text"
                                value={customerReplyInput[tkt.ticketId] || ''}
                                onChange={(e) =>
                                  setCustomerReplyInput({
                                    ...customerReplyInput,
                                    [tkt.ticketId]: e.target.value
                                  })
                                }
                                placeholder="Reply to Mride Support..."
                                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2"
                              />
                              <button
                                type="button"
                                onClick={() => handleCustomerReply(tkt.ticketId)}
                                className="rounded-xl bg-[#15191C] text-white font-extrabold px-4 py-2 flex items-center gap-1"
                              >
                                <Send className="w-3.5 h-3.5" /> Reply
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB: MY TRIPS, CARGO ORDERS, RECEIPTS, PROFILE, NOTIFICATIONS, SECURITY */}
                {(portalTab === 'trips' ||
                  portalTab === 'cargo_orders' ||
                  portalTab === 'receipts' ||
                  portalTab === 'profile' ||
                  portalTab === 'notifications' ||
                  portalTab === 'security') && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 text-xs">
                    <h2 className="text-lg font-extrabold text-[#15191C] capitalize">
                      {portalTab.replace('_', ' ')}
                    </h2>
                    {portalTab === 'profile' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[#F4F6F9]">
                          <span className="text-slate-400 block">Full Name</span>
                          <strong className="text-sm text-[#15191C]">{currentUser.name || 'Chilombo M.'}</strong>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F4F6F9]">
                          <span className="text-slate-400 block">Verified Phone</span>
                          <strong className="text-sm text-[#15191C]">{currentUser.phone || '+260 76 910 8705'}</strong>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F4F6F9]">
                          <span className="text-slate-400 block">Default City</span>
                          <strong className="text-sm text-[#15191C]">{activeCity}, Zambia</strong>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#F4F6F9]">
                          <span className="text-slate-400 block">Default Payment Method</span>
                          <strong className="text-sm text-[#FF6500]">Airtel Money / ZMW Cash</strong>
                        </div>
                      </div>
                    )}

                    {(portalTab === 'trips' || portalTab === 'cargo_orders' || portalTab === 'receipts') && (
                      <div className="space-y-2.5">
                        {rideHistory.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-[#F4F6F9] border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div>
                              <span className="font-mono font-extrabold text-[#FF6500] block">
                                {item.ticketNumber || item.id} • {item.date} ({item.time})
                              </span>
                              <strong className="text-sm text-[#15191C] block">
                                {item.pickup} → {item.destination}
                              </strong>
                              <span className="text-slate-500">
                                Driver: {item.driverName} ({item.vehicleModel} • {item.vehiclePlate})
                              </span>
                            </div>
                            <div className="text-right space-y-1">
                              <span className="text-base font-extrabold text-[#15191C] block">
                                K{item.fareZMW}
                              </span>
                              <button
                                onClick={() => {
                                  setIssueTripRef(item.ticketNumber || item.id);
                                  setPortalTab('report_issue');
                                }}
                                className="text-[11px] font-extrabold text-[#FF6500] hover:underline"
                              >
                                Report Issue on This Trip
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(portalTab === 'notifications' || portalTab === 'security') && (
                      <div className="p-4 rounded-2xl bg-[#F4F6F9] space-y-2">
                        <p className="font-bold text-[#15191C]">
                          {portalTab === 'security'
                            ? 'Anti-Theft Role Lock & Number Masking Active'
                            : 'Live Trip & Ticket Notifications Active'}
                        </p>
                        <p className="text-slate-600">
                          Your Mride account is protected with OTP verification, masked phone numbers prior to booking confirmation, and direct emergency 999 / 991 dispatch.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            7. PRIVATE MANAGEMENT PORTAL (STRICT STAFF AUTHENTICATION GATE)
           ========================================================================= */}
        {activePage === 'admin_portal' && (
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-6">
            {!authenticatedPortalAccount ? (
              <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#0B1528] text-[#FF6500] flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500] block">
                      Private Staff & Owner Portal
                    </span>
                    <h2 className="text-lg font-extrabold text-[#15191C]">
                      Mride Management Portal Sign-In
                    </h2>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Access to the Mride Website Management Portal, Website Design Editor, Workforce Control Centre, and Department Workspaces is strictly restricted to the Owner and authorised staff accounts.
                </p>

                {portalAuthError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-extrabold text-rose-800">
                    {portalAuthError}
                  </div>
                )}

                <form onSubmit={handlePortalAuthentication} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Staff Username</label>
                    <input
                      type="text"
                      value={portalUsernameInput}
                      onChange={(e) => setPortalUsernameInput(e.target.value)}
                      placeholder="e.g. cj.owner or luyando.cms"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Owner-Issued Password</label>
                    <input
                      type="password"
                      value={portalPasswordInput}
                      onChange={(e) => setPortalPasswordInput(e.target.value)}
                      placeholder="Enter staff password"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">4-Digit Security PIN (Optional)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={portalPinInput}
                      onChange={(e) => setPortalPinInput(e.target.value)}
                      placeholder="e.g. 9900"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3 text-xs shadow-sm"
                  >
                    Authenticate & Enter Management Portal
                  </button>
                </form>

                {/* Quick Demo Credentials for Owner / Content Manager Verification */}
                <div className="pt-3 border-t border-slate-200 space-y-2 text-[11px]">
                  <span className="font-extrabold text-slate-500 block">
                    Quick 1-Click Sign-In (Authorised Staff Accounts):
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {MridePlatformStore.getStaffSystemAccounts()
                      .slice(0, 5)
                      .map((acc) => (
                        <button
                          key={acc.accountId}
                          type="button"
                          onClick={() => {
                            setPortalUsernameInput(acc.username);
                            setPortalPasswordInput(acc.passwordPlain);
                            setPortalPinInput(acc.accessPin);
                            WebsiteCmsAndWorkforceService.setAuthenticatedPortalStaffUsername(acc.username);
                            setAuthenticatedPortalAccount(acc);
                            setPortalAuthError(null);
                          }}
                          className="text-left px-3 py-2 rounded-xl bg-[#F4F6F9] hover:bg-[#FFF0E6] border border-slate-200 hover:border-[#FF6500] font-bold text-[#15191C] flex items-center justify-between transition-all"
                        >
                          <div>
                            <span className="block text-xs font-extrabold">{acc.fullName}</span>
                            <span className="text-[10px] text-slate-500">{acc.role}</span>
                          </div>
                          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-[#FF6500]">
                            {acc.username}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage('home')}
                  className="w-full text-center text-xs font-extrabold text-slate-500 hover:text-[#15191C]"
                >
                  ← Return to Public Mride Website
                </button>
              </div>
            ) : (
              <AdminPreview
                country={country}
                activeCity={activeCity}
                onExitAdmin={handlePortalLogout}
              />
            )}
          </div>
        )}
      </main>

      {/* ================= FOOTER (PUBLIC CUSTOMER LINKS ONLY — NO ADMIN LINKS) ================= */}
      {activePage !== 'admin_portal' && (
        <footer
          className="text-slate-400 text-xs py-10 border-t border-white/10"
          style={{ backgroundColor: publishedSite.theme.secondaryNavyHex }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-extrabold"
                  style={{ backgroundColor: publishedSite.theme.primaryColorHex }}
                >
                  M
                </div>
                <span className="font-display font-extrabold text-base text-white">Mride</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {publishedSite.pages.home.sectionBody ||
                  'Your Ride. Your Way. Passenger rides, cargo transportation, boda delivery and FairFare negotiation across Zambia.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white uppercase tracking-wider">Services</h4>
              <ul className="space-y-1">
                <li><button onClick={() => setActivePage('rides')} className="hover:text-white">Passenger Rides</button></li>
                <li><button onClick={() => setActivePage('cargo')} className="hover:text-white">Cargo Transportation</button></li>
                <li><button onClick={() => setActivePage('boda')} className="hover:text-white">Boda Delivery</button></li>
                <li><button onClick={() => setActivePage('fairfare')} className="hover:text-white">FairFare Negotiation</button></li>
                <li><button onClick={() => setActivePage('corporate')} className="hover:text-white">Corporate Services</button></li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white uppercase tracking-wider">Customer Support</h4>
              <ul className="space-y-1">
                <li><button onClick={() => { setActivePage('customer_portal'); setPortalTab('report_issue'); }} className="hover:text-white">Report an Issue</button></li>
                <li><button onClick={() => { setActivePage('customer_portal'); setPortalTab('my_tickets'); }} className="hover:text-white">Track Support Ticket</button></li>
                <li><button onClick={() => setActivePage('faqs')} className="hover:text-white">FAQs & Safety</button></li>
                <li><button onClick={() => setActivePage('about')} className="hover:text-white">Driver & Fleet Registration</button></li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white uppercase tracking-wider">Contact & Help</h4>
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#FF6500]" /> {content.supportPhone}</p>
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#FF6500]" /> {content.supportEmail}</p>
              <p className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-[#FF6500]" /> {content.hqAddress}</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
