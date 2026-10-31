import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Headphones,
  MapPin,
  Settings,
  Gift,
  CreditCard,
  Compass,
  Bookmark,
  Briefcase,
  Shield,
  Info,
  ChevronRight,
  BadgeCheck,
  Check,
  LogOut,
  Plus,
  Trash2,
  Camera
} from 'lucide-react';
import { UserProfile } from '../../types';
import { AuthService } from '../../services/authService';
import { ZAMBIAN_CITIES } from '../../data/mockData';
import {
  MridePlatformStore,
  SupportIssueCategory
} from '../../services/mridePlatformStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onOpenHistory?: () => void;
  onSwitchToDriver?: () => void;
  onSignOut?: () => void;
  onOpenWebsiteSupport?: (tripReference?: string) => void;
}

type ProfileSubView =
  | 'main'
  | 'support'
  | 'addresses'
  | 'settings'
  | 'discounts'
  | 'payments'
  | 'improve_maps'
  | 'business'
  | 'safety'
  | 'reliability'
  | 'info';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onOpenHistory,
  onSwitchToDriver,
  onSignOut,
  onOpenWebsiteSupport
}) => {
  const authService = AuthService.getInstance();
  const [subView, setSubView] = useState<ProfileSubView>('main');

  // Connected Support Ticket State
  const [supportCategory, setSupportCategory] = useState<SupportIssueCategory>('Trip Issue');
  const [supportTripRef, setSupportTripRef] = useState('MR-4987');
  const [supportMessage, setSupportMessage] = useState('');
  const [myTickets, setMyTickets] = useState(() => MridePlatformStore.getSupportTickets());

  // Editable Profile State
  const [editName, setEditName] = useState(currentUser.name || 'CHILOMBO');
  const [editPhone, setEditPhone] = useState(currentUser.phone || '+260 769108705');
  const [editCity, setEditCity] = useState(currentUser.city || 'Lusaka');
  const [avatarUrl, setAvatarUrl] = useState(
    currentUser.avatarUrl ||
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'
  );

  // Payment Method State
  const [selectedPayment, setSelectedPayment] = useState<'airtel' | 'mtn' | 'cash'>('airtel');

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [activePromos, setActivePromos] = useState<Array<{ code: string; desc: string }>>([
    { code: 'LUSAKA15', desc: 'K15 off your next Comfort or XL ride' }
  ]);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<Array<{ label: string; address: string }>>([
    { label: 'Home', address: 'Woodlands Extension, Plot 412, Lusaka' },
    { label: 'University / Work', address: 'Cavendish University, Great North Road' },
    { label: 'Shopping', address: 'EastPark Mall, Great East Road' }
  ]);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrValue, setNewAddrValue] = useState('');

  // Map suggestion state
  const [landmarkName, setLandmarkName] = useState('');
  const [landmarkArea, setLandmarkArea] = useState('Lusaka');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      phone: editPhone.trim() || currentUser.phone,
      city: editCity,
      avatarUrl
    };
    onUserChange(updated);
    showToast('Profile settings saved!');
    setSubView('main');
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setActivePromos([
      { code: promoCode.toUpperCase(), desc: 'K20 Mrides FairFare discount activated' },
      ...activePromos
    ]);
    setPromoCode('');
    showToast('Promo code applied!');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLabel.trim() || !newAddrValue.trim()) return;
    setSavedAddresses([
      ...savedAddresses,
      { label: newAddrLabel.trim(), address: newAddrValue.trim() }
    ]);
    setNewAddrLabel('');
    setNewAddrValue('');
    showToast('Saved address added!');
  };

  const handleEarnAsDriver = () => {
    // Anti-theft role isolation: switching to Driver requires signing in at the Driver Portal on the intro gate
    onClose();
    if (onSwitchToDriver) {
      onSwitchToDriver();
    } else {
      authService.signOut();
    }
  };

  const paymentLabel =
    selectedPayment === 'airtel'
      ? 'Airtel'
      : selectedPayment === 'mtn'
      ? 'MTN MoMo'
      : 'Cash';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-[400px] sm:rounded-[36px] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col justify-between text-[#15191C]">
        <div className="p-5 space-y-5">
          {/* Top Bar with Back Arrow */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => (subView === 'main' ? onClose() : setSubView('main'))}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-[#15191C] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {subView !== 'main' && (
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Mrides Profile
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                if (onSignOut) {
                  onClose();
                  onSignOut();
                } else {
                  authService.signOut();
                  onClose();
                }
              }}
              className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center gap-1"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {toastMsg && (
            <div className="rounded-2xl bg-[#FFF0E6] border border-[#FF6500]/30 px-3.5 py-2.5 text-xs font-extrabold text-[#FF6500] text-center">
              {toastMsg}
            </div>
          )}

          {/* ================= MAIN PASSENGER PROFILE SCREEN ================= */}
          {subView === 'main' && (
            <div className="space-y-6">
              {/* Centered Avatar, Bold Uppercase Name + Blue Verified Badge, and Phone */}
              <div className="flex flex-col items-center text-center">
                <div
                  onClick={() => setSubView('settings')}
                  className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#FF6500]/20 to-sky-100 cursor-pointer group"
                >
                  <img
                    src={avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-[#FF6500]">
                    <Camera className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <h2 className="text-xl font-black uppercase tracking-tight text-[#15191C]">
                    {currentUser.name || 'CHILOMBO'}
                  </h2>
                  <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500 stroke-white" />
                </div>

                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {currentUser.phone || '+260 769108705'}
                </p>
              </div>

              {/* 4 Circular Quick Action Buttons: Orders, Support, Addresses, Settings */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenHistory) {
                      onClose();
                      onOpenHistory();
                    }
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#F4F4F4] group-hover:bg-[#FFF0E6] flex items-center justify-center text-[#15191C] group-hover:text-[#FF6500] transition-colors">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#15191C]">Orders</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('support')}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#F4F4F4] group-hover:bg-[#FFF0E6] flex items-center justify-center text-[#15191C] group-hover:text-[#FF6500] transition-colors">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#15191C]">Support</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('addresses')}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#F4F4F4] group-hover:bg-[#FFF0E6] flex items-center justify-center text-[#15191C] group-hover:text-[#FF6500] transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#15191C]">Addresses</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('settings')}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#F4F4F4] group-hover:bg-[#FFF0E6] flex items-center justify-center text-[#15191C] group-hover:text-[#FF6500] transition-colors">
                    <Settings className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#15191C]">Settings</span>
                </button>
              </div>

              {/* Group 1: Discounts & Payment Methods */}
              <div className="rounded-3xl bg-[#F5F5F5] divide-y divide-slate-200/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSubView('discounts')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-200/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <Gift className="w-5 h-5 text-[#FF6500]" />
                    <div>
                      <span className="text-sm font-black text-[#15191C] block leading-tight">
                        Discounts & Coupons
                      </span>
                      <span className="text-xs text-slate-500">Enter FairFare promo codes</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('payments')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-200/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <CreditCard className="w-5 h-5 text-[#FF6500]" />
                    <div>
                      <span className="text-sm font-black text-[#15191C] block leading-tight">
                        Payment methods
                      </span>
                      <span className="text-xs text-slate-500">
                        {paymentLabel} • Cash, MoMo, Visa Card
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedPayment === 'airtel' && (
                      <span className="border border-slate-300 bg-white rounded-md px-2 py-0.5 text-[11px] font-extrabold text-red-600 shadow-2xs">
                        airtel
                      </span>
                    )}
                    {selectedPayment === 'mtn' && (
                      <span className="border border-amber-300 bg-amber-400 rounded-md px-2 py-0.5 text-[11px] font-extrabold text-[#15191C] shadow-2xs">
                        MTN
                      </span>
                    )}
                    {selectedPayment === 'cash' && (
                      <span className="border border-emerald-300 bg-emerald-50 rounded-md px-2 py-0.5 text-[11px] font-extrabold text-emerald-700 shadow-2xs">
                        ZMW Cash
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              </div>

              {/* Group 2: Earn as a driver, Improve maps, Business account, Safety, Reliability */}
              <div className="rounded-3xl bg-[#F5F5F5] divide-y divide-slate-200/60 overflow-hidden">
                <button
                  type="button"
                  onClick={handleEarnAsDriver}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-200/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <Compass className="w-5 h-5 text-[#15191C]" />
                    <span className="text-sm font-semibold text-[#15191C]">Earn as a driver</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('improve_maps')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-200/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <Bookmark className="w-5 h-5 text-[#15191C] fill-[#15191C]" />
                    <div>
                      <span className="text-sm font-semibold text-[#15191C] block leading-tight">
                        Improve maps
                      </span>
                      <span className="text-xs text-slate-400">Add places, fix errors</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('business')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-200/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <Briefcase className="w-5 h-5 text-[#15191C]" />
                    <span className="text-sm font-semibold text-[#15191C]">Business account</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('safety')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-200/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <Shield className="w-5 h-5 text-[#15191C]" />
                    <span className="text-sm font-semibold text-[#15191C]">Safety</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('reliability')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-200/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-5 h-5 rounded-full border-[3px] border-emerald-500 border-t-slate-300 inline-block shrink-0" />
                    <div>
                      <span className="text-sm font-semibold text-[#15191C] block leading-tight">
                        Great! Few canceled rides
                      </span>
                      <span className="text-xs text-slate-400">
                        This affects ride search speed
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Group 3: Information */}
              <div className="rounded-3xl bg-[#F5F5F5] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSubView('info')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-200/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <Info className="w-5 h-5 text-[#15191C] fill-[#15191C] stroke-white" />
                    <span className="text-sm font-semibold text-[#15191C]">Information</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* ================= SUB-VIEW: PAYMENT METHODS ================= */}
          {subView === 'payments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold">Payment methods</h3>
              <p className="text-xs text-slate-500">
                Choose your default payment method for Mrides Rides, Cargo and Boda deliveries across Zambia.
              </p>
              <div className="space-y-2.5">
                {([
                  { id: 'airtel', title: 'Airtel Money Zambia', subtitle: 'Instant mobile money prompt (+260 97 / 77)', badge: 'airtel', badgeClass: 'text-red-600 border-slate-300 bg-white' },
                  { id: 'mtn', title: 'MTN MoMo Zambia', subtitle: 'Instant USSD PIN prompt (+260 96 / 76)', badge: 'MTN', badgeClass: 'text-[#15191C] border-amber-300 bg-amber-400' },
                  { id: 'cash', title: 'Cash (Zambian Kwacha)', subtitle: 'Pay your driver directly in cash after the trip', badge: 'ZMW', badgeClass: 'text-emerald-700 border-emerald-200 bg-emerald-50' }
                ] as const).map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => {
                      setSelectedPayment(pm.id);
                      showToast(`Default payment set to ${pm.title}`);
                      setSubView('main');
                    }}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left ${
                      selectedPayment === pm.id
                        ? 'border-[#FF6500] bg-[#FFF0E6]/40'
                        : 'border-slate-200 bg-[#F7F7F5]'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-sm text-[#15191C] block">{pm.title}</span>
                      <span className="text-xs text-slate-500">{pm.subtitle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`border rounded-md px-2 py-0.5 text-[11px] font-extrabold ${pm.badgeClass}`}>
                        {pm.badge}
                      </span>
                      {selectedPayment === pm.id && <Check className="w-4 h-4 text-[#FF6500]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= SUB-VIEW: DISCOUNTS ================= */}
          {subView === 'discounts' && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold">Discounts & Promo Codes</h3>
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code (e.g. ZAMBIA20)"
                  className="flex-1 rounded-xl border border-slate-300 bg-[#F7F7F5] px-3.5 py-2.5 text-xs font-extrabold uppercase text-[#15191C]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF6500] text-white font-extrabold px-4 py-2.5 text-xs"
                >
                  Apply
                </button>
              </form>
              <div className="space-y-2">
                {activePromos.map((p, i) => (
                  <div key={i} className="rounded-2xl bg-[#FFF0E6] border border-[#FF6500]/30 p-3.5">
                    <span className="font-mono font-extrabold text-xs bg-[#FF6500] text-white px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    <p className="text-xs font-bold text-[#15191C] mt-1.5">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SUB-VIEW: SAVED ADDRESSES ================= */}
          {subView === 'addresses' && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold">Saved Addresses</h3>
              <div className="space-y-2">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-[#F5F5F5] p-3.5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-xs text-[#15191C] block">{addr.label}</span>
                      <span className="text-xs text-slate-500">{addr.address}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSavedAddresses(savedAddresses.filter((_, i) => i !== idx))
                      }
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddAddress} className="space-y-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={newAddrLabel}
                  onChange={(e) => setNewAddrLabel(e.target.value)}
                  placeholder="Label (e.g. Gym, Parents House)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
                <input
                  type="text"
                  value={newAddrValue}
                  onChange={(e) => setNewAddrValue(e.target.value)}
                  placeholder="Street or landmark in Lusaka..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#FF6500] text-white font-extrabold py-2.5 text-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Save Address
                </button>
              </form>
            </div>
          )}

          {/* ================= SUB-VIEW: SETTINGS ================= */}
          {subView === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
              <h3 className="text-lg font-extrabold">Profile Settings</h3>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-[#F7F7F5] px-3 py-2.5 text-sm font-extrabold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-[#F7F7F5] px-3 py-2.5 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Default Zambian City</label>
                <select
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-[#F7F7F5] px-3 py-2.5 text-sm font-bold"
                >
                  {ZAMBIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Avatar Photo URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-[#F7F7F5] px-3 py-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#FF6500] text-white font-extrabold py-3 text-sm"
              >
                Save Changes
              </button>
            </form>
          )}

          {/* ================= SUB-VIEW: SUPPORT & REPORT AN ISSUE ================= */}
          {subView === 'support' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold">Report an Issue & Support</h3>
                {onOpenWebsiteSupport && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenWebsiteSupport(supportTripRef);
                    }}
                    className="rounded-xl bg-[#0B1528] text-white font-extrabold px-3 py-1.5 text-[11px]"
                  >
                    Open Web Portal
                  </button>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!supportMessage.trim()) return;
                  const ticket = MridePlatformStore.createSupportTicket({
                    customerId: currentUser.id,
                    customerName: currentUser.name || 'CHILOMBO',
                    customerPhone: currentUser.phone || '+260 769108705',
                    tripReference: supportTripRef || 'MR-4987',
                    cityCode: 'ZM-LSK',
                    category: supportCategory,
                    subject: `${supportCategory} (${supportTripRef})`,
                    description: supportMessage.trim()
                  });
                  setMyTickets(MridePlatformStore.getSupportTickets());
                  setSupportMessage('');
                  showToast(`Ticket #${ticket.ticketId} created & synced to Support Portal!`);
                }}
                className="rounded-2xl bg-[#F5F5F5] p-3.5 space-y-2.5"
              >
                <p className="font-extrabold text-[#15191C]">Submit a Ticket (Connected to Mride Support)</p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value as SupportIssueCategory)}
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 font-bold text-[#15191C]"
                  >
                    <option value="Trip Issue">Trip Issue</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Driver Behaviour">Driver Behaviour</option>
                    <option value="Lost Item">Lost Item</option>
                    <option value="Cargo / Boda Delivery">Cargo / Boda Delivery</option>
                    <option value="Account / App Error">Account / App Error</option>
                  </select>
                  <input
                    type="text"
                    value={supportTripRef}
                    onChange={(e) => setSupportTripRef(e.target.value)}
                    placeholder="Trip Ref (e.g. MR-4987)"
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 font-mono font-bold text-[#15191C]"
                  />
                </div>
                <textarea
                  rows={2}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe your issue (e.g. fare dispute, lost item, driver delay)..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-[#15191C]"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#FF6500] text-white font-extrabold py-2.5 text-xs shadow-xs"
                >
                  Submit Complaint & Get Ticket #
                </button>
              </form>

              <div className="space-y-2">
                <p className="font-extrabold text-slate-600 uppercase tracking-wider text-[10px]">
                  Your Active Support Tickets ({myTickets.length})
                </p>
                {myTickets.slice(0, 3).map((t) => (
                  <div key={t.ticketId} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[#FF6500]">#{t.ticketId}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                        {t.status}
                      </span>
                    </div>
                    <p className="font-bold text-[#15191C]">{t.category} • Ref: {t.tripReference}</p>
                    <p className="text-slate-500 text-[11px] line-clamp-2">{t.description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-[#F5F5F5] p-3.5 space-y-1">
                <p className="font-bold text-xs">24/7 Passenger & Delivery Helpdesk</p>
                <p className="text-slate-600">Phone: <strong>+260 97 789 4432</strong> • Email: <strong>support@mrides.co.zm</strong></p>
              </div>
            </div>
          )}

          {/* ================= SUB-VIEW: IMPROVE MAPS ================= */}
          {subView === 'improve_maps' && (
            <div className="space-y-3 text-xs">
              <h3 className="text-lg font-extrabold">Improve Zambia Maps</h3>
              <p className="text-slate-500">
                Help drivers find pickups faster by adding missing Lusaka compounds, gates, mall entrances or local landmarks.
              </p>
              <input
                type="text"
                value={landmarkName}
                onChange={(e) => setLandmarkName(e.target.value)}
                placeholder="Landmark or street name..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              />
              <input
                type="text"
                value={landmarkArea}
                onChange={(e) => setLandmarkArea(e.target.value)}
                placeholder="Neighborhood / City (e.g. Woodlands, Lusaka)"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              />
              <button
                type="button"
                onClick={() => {
                  setLandmarkName('');
                  showToast('Thank you! Map place submitted for verification.');
                  setSubView('main');
                }}
                className="w-full rounded-xl bg-[#FF6500] text-white font-extrabold py-3"
              >
                Submit Map Place
              </button>
            </div>
          )}

          {/* ================= SUB-VIEW: BUSINESS, SAFETY, RELIABILITY & INFO ================= */}
          {(subView === 'business' ||
            subView === 'safety' ||
            subView === 'reliability' ||
            subView === 'info') && (
            <div className="space-y-3 text-xs">
              <h3 className="text-lg font-extrabold capitalize">
                {subView === 'reliability' ? 'Great! Few canceled rides' : subView}
              </h3>
              <div className="rounded-2xl bg-[#F5F5F5] p-4 space-y-2 text-slate-600 leading-relaxed">
                {subView === 'business' && (
                  <p>
                    <strong>Mrides Business Account:</strong> Manage staff rides, scheduled cargo haulage and monthly ZRA Smart Invoice statements for your company in Zambia.
                  </p>
                )}
                {subView === 'safety' && (
                  <p>
                    <strong>Safety Center:</strong> Share live trip links with family, verify driver RTSA PSV plates before boarding, and dial <strong>999 / 991</strong> in an emergency.
                  </p>
                )}
                {subView === 'reliability' && (
                  <p>
                    <strong>98% Completion Score:</strong> Because you rarely cancel confirmed rides, your requests are prioritized to nearby high-rated drivers.
                  </p>
                )}
                {subView === 'info' && (
                  <p>
                    <strong>Mrides Zambia (v1.0):</strong> Your Ride. Your Way. Passenger rides, cargo transport & boda-boda delivery built for Zambia.
                  </p>
                )}
              </div>
              {subView === 'info' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut?.();
                  }}
                  className="w-full rounded-xl bg-red-50 text-red-600 font-extrabold py-3 border border-red-200"
                >
                  Log Out of Mrides
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
