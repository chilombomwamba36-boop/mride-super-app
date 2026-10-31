export type UserRole =
  | 'customer'
  | 'driver'
  | 'cargo_operator'
  | 'boda_rider'
  | 'food_vendor'
  | 'market_seller'
  | 'admin';

export type ServiceType = 'home' | 'rides' | 'cargo' | 'boda' | 'food' | 'market' | 'admin';

export type ZambianCity =
  | 'Lusaka'
  | 'Kitwe'
  | 'Ndola'
  | 'Livingstone'
  | 'Kabwe'
  | 'Chipata'
  | 'Solwezi'
  | 'Choma'
  | 'Kasama'
  | 'Mongu';

export type AfricanCity = ZambianCity | string;

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  city: string;
  countryCode?: string;
  rating?: number;
  completedTrips?: number;
  lastTripAgo?: string;
  accountStatus?: 'active' | 'restricted' | 'suspended';
  suspensionReason?: string;
}

// ================= CONTROLLED TRIP & DELIVERY STATE MACHINES =================
export type RideTripStatus =
  | 'requested'
  | 'offers_received'
  | 'fare_agreed'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'passenger_picked_up'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type DeliveryTripStatus =
  | 'requested'
  | 'offer_received'
  | 'fare_agreed'
  | 'driver_assigned'
  | 'arriving_at_pickup'
  | 'item_collected'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'disputed';

// ================= RIDES & FAIRFARE NEGOTIATION TYPES =================
export type RideVehicleType = 'boda' | 'economy' | 'comfort' | 'family_xl';

export interface RideVehicleOption {
  type: RideVehicleType;
  title: string;
  capacity: string;
  etaMinutes: number;
  baseEstimatedZMW: number;
  minAllowedFareZMW: number;
  maxAllowedFareZMW: number;
  description: string;
}

export type NegotiationStatus =
  | 'selecting'
  | 'offering'
  | 'counter_received'
  | 'counter_sent_by_passenger'
  | 'accepted'
  | 'driver_arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface FareOfferAuditEntry {
  id: string;
  round: number;
  actor: 'passenger' | 'driver' | 'system';
  actorName: string;
  amountZMW: number;
  action: 'propose' | 'counteroffer' | 'accept' | 'reject' | 'expire';
  timestamp: string;
  expiresAt?: string;
}

export interface DriverBid {
  id: string;
  driverName: string;
  driverPhoto: string;
  driverPhone?: string;
  rating: number;
  totalTrips: number;
  vehicleModel: string;
  vehiclePlate: string;
  offeredFareZMW: number;
  distanceKm: number;
  etaMinutes: number;
  negotiationRound: number;
  maxRounds?: number;
  expiresInSeconds?: number;
  isVerified?: boolean;
  status: 'pending' | 'countered' | 'accepted' | 'declined' | 'expired';
  offerHistory?: FareOfferAuditEntry[];
}

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  passengerPhoto?: string;
  passengerRating?: number;
  passengerCompletedTrips?: number;
  passengerVerified?: boolean;
  passengerLastTrip?: string;
  paymentMethod?: 'cash' | 'mtn_momo' | 'airtel_money' | 'card';
  pickup: string;
  intermediateStop?: string;
  destination: string;
  vehicleType: RideVehicleType;
  passengerProposedFareZMW: number;
  needAirConditioning?: boolean;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  status?: string;
  notes?: string;
  createdAt: string;
}

export interface RideHistoryItem {
  id: string;
  ticketNumber: string;
  serviceType?: 'rides' | 'cargo' | 'boda';
  date: string;
  time: string;
  pickup: string;
  destination: string;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  driverPhoto?: string;
  vehicleModel: string;
  vehiclePlate: string;
  fareZMW: number;
  paymentMethod: 'cash' | 'mtn_momo' | 'airtel_money' | 'card';
  status: 'completed' | 'cancelled' | 'disputed';
  countryCode: string;
  notes?: string;
}

// ================= DRIVER GOALS & REWARDS TYPES =================
export interface DriverRewardTier {
  id: string;
  targetRides: number;
  rewardAmountZMW: number;
  label: string;
}

export interface DriverGoalCampaign {
  id: string;
  name: string;
  description: string;
  eligibleServices: Array<'rides' | 'cargo' | 'boda'>;
  targetRides: number;
  periodDays: number;
  startDate: string;
  endDate: string;
  rewardAmountZMW: number;
  tiers: DriverRewardTier[];
  isCumulative: boolean;
  minAcceptanceRatePercent: number;
  minCompletionRatePercent: number;
  maxBudgetZMW: number;
  spentBudgetZMW: number;
  eligibleCities: ZambianCity[];
  status: 'active' | 'paused' | 'completed';
}

export interface DriverGoalProgress {
  campaignId: string;
  driverId: string;
  completedEligibleRides: number;
  countedTripIds: string[];
  disqualifiedTrips: Array<{
    tripId: string;
    date: string;
    reason: 'cancelled' | 'fraud_suspected' | 'duplicate' | 'ineligible_service';
  }>;
  rewardStatus: 'in_progress' | 'qualified' | 'approved' | 'paid';
  paidTierIds: string[];
}

export interface RewardLedgerEntry {
  id: string;
  driverId: string;
  driverName: string;
  campaignId: string;
  campaignName: string;
  tierLabel: string;
  amountZMW: number;
  status: 'pending_approval' | 'approved' | 'paid' | 'rejected';
  approvedBy?: string;
  timestamp: string;
}

// ================= CARGO TYPES =================
export type CargoVehicleTier =
  | 'boda_courier'
  | 'light_van'
  | 'one_ton_pickup'
  | 'canter_3_5ton'
  | 'heavy_flatbed';

export interface CargoVehicleTierOption {
  tier: CargoVehicleTier;
  title: string;
  payloadCapacity: string;
  baseZMW: number;
  bestFor: string;
}

export interface CargoQuoteBid {
  id: string;
  operatorId: string;
  operatorName: string;
  truckPlate: string;
  vehicleType: string;
  rating: number;
  quotedFareZMW: number;
  etaToPickupMins: number;
  includesHelpersCount: number;
  message?: string;
}

export interface CargoOrder {
  id: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pickupLocation: string;
  destinationLocation: string;
  cargoCategory: string;
  weightApproxKg: number;
  description: string;
  helpersCount: number;
  isFragile: boolean;
  proposedFareZMW: number;
  selectedTier: CargoVehicleTier;
  status: DeliveryTripStatus;
  assignedOperator?: CargoQuoteBid;
  pickupConfirmationCode?: string;
  deliveryConfirmationCode?: string;
  proofOfDeliveryNote?: string;
  createdAt: string;
}

// ================= BODA DELIVERY TYPES =================
export interface BodaRiderBid {
  id: string;
  riderId: string;
  riderName: string;
  riderPhoto: string;
  riderPhone: string;
  bikeModel: string;
  bikePlate: string;
  rating: number;
  completedDeliveries: number;
  isVerified: boolean;
  offeredFareZMW: number;
  etaMinutes: number;
  status: 'pending' | 'countered' | 'accepted' | 'declined';
}

export interface BodaDeliveryOrder {
  id: string;
  ticketNumber: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  pickup: string;
  destination: string;
  packageCategory: 'Documents & Envelopes' | 'Small Parcel / Box' | 'Pharmacy & Medical' | 'Groceries & Everyday Items' | 'Spare Parts & Keys';
  packageWeightKg: number;
  handlingNotes: string;
  proposedFareZMW: number;
  agreedFareZMW?: number;
  status: DeliveryTripStatus;
  pickupPinCode: string;
  deliveryPinCode: string;
  assignedRider?: BodaRiderBid;
  deliveryProofPhoto?: string;
  createdAt: string;
}

// ================= LEGACY FOOD & MARKET TYPES (Retained for compile compatibility, disabled in UI) =================
export interface FoodAddonOption {
  id: string;
  name: string;
  priceZMW: number;
}

export interface FoodMenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  priceZMW: number;
  category: 'Local Zambian' | 'Grills' | 'Fast Food' | 'Bakery' | 'Drinks';
  imageUrl: string;
  isPopular?: boolean;
  availableAddons?: FoodAddonOption[];
}

export interface FoodRestaurant {
  id: string;
  name: string;
  tagline: string;
  cuisine: string;
  area: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMins: string;
  deliveryFeeZMW: number;
  minOrderZMW: number;
  imageUrl: string;
  isVerified: boolean;
  menu: FoodMenuItem[];
}

export interface SelectedAddon {
  addonId: string;
  name: string;
  priceZMW: number;
}

export interface CartItem {
  item: FoodMenuItem;
  quantity: number;
  selectedAddons?: SelectedAddon[];
  specialInstructions?: string;
}

export type FoodOrderStatus =
  | 'placed'
  | 'kitchen_preparing'
  | 'courier_assigned'
  | 'on_the_way'
  | 'delivered';

export interface FoodOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: CartItem[];
  subtotalZMW: number;
  deliveryFeeZMW: number;
  totalZMW: number;
  status: FoodOrderStatus;
  paymentMethod: 'Cash on Delivery' | 'MTN MoMo (Staged)' | 'Airtel Money (Staged)';
  placedAt: string;
  estimatedDeliveryMins: number;
}

export type MarketCategory =
  | 'All'
  | 'Electronics'
  | 'Farm & Agri'
  | 'Fashion & Chitenge'
  | 'Home & Hardware'
  | 'Automotive';

export interface MarketProduct {
  id: string;
  title: string;
  priceZMW: number;
  category: MarketCategory;
  condition: 'Brand New' | 'Refurbished' | 'Fairly Used';
  location: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  isVerifiedSeller: boolean;
  description: string;
  imageUrl: string;
  postedDate: string;
  status: 'available' | 'reserved' | 'sold';
}

// ================= ADMIN & AUDIT TYPES =================
export interface AdminMetric {
  totalUsers: number;
  activeDrivers: number;
  registeredVendors: number;
  totalMarketListings: number;
  grossMerchandiseZMW: number;
  platformCommissionsZMW: number;
  commissionRatePercent: number;
  pendingApprovals: number;
  openDisputes: number;
  activeRewardCampaigns?: number;
  rewardLiabilityZMW?: number;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  category: 'fare_config' | 'commission_rule' | 'reward_campaign' | 'account_status' | 'trip_state' | 'privacy_access';
  targetId: string;
  summary: string;
  timestamp: string;
}

export function formatZMW(amount: number): string {
  return Number.isInteger(amount) ? `K${amount}` : `K${amount.toFixed(2)}`;
}
