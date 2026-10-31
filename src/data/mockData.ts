import {
  RideVehicleOption,
  DriverBid,
  CargoVehicleTierOption,
  CargoQuoteBid,
  FoodRestaurant,
  MarketProduct,
  AdminMetric,
  UserProfile,
  RideRequest,
  RideHistoryItem,
  BodaRiderBid,
  ZambianCity
} from '../types';

export const ZAMBIAN_CITIES: ZambianCity[] = [
  'Lusaka',
  'Kitwe',
  'Ndola',
  'Livingstone',
  'Kabwe',
  'Chipata',
  'Solwezi',
  'Choma',
  'Kasama',
  'Mongu'
];

export const ZAMBIA_NATIONWIDE_HUBS: Record<ZambianCity, string[]> = {
  Lusaka: [
    'Cavendish University (Great North Rd)',
    'EastPark Mall (Great East Road)',
    'Manda Hill Shopping Mall',
    'Levy Junction Mall (Church Road)',
    'Cairo Road (Lusaka CBD)',
    'Woodlands Shopping Mall',
    'Pinnacle Mall (Woodlands)',
    'Kabulonga Shopping Centre',
    'Crossroads Mall (Kabulonga)',
    'Northmead Commercial Area',
    'Rhodes Park (Addis Ababa Drive)',
    'Longacres (Haile Selassie Ave)',
    'UNZA Great East Campus',
    'University Teaching Hospital (UTH)',
    'Intercity Bus Terminus',
    'Soweto Main Market',
    'City Market (Lusaka CBD)',
    'Kamwala South / Luburma Market',
    'Kabwata Cultural Village / Burma Rd',
    'Chilenje South (Muramba Rd)',
    'Kalingalinga (Alick Nkhata Rd)',
    'Chelstone Market / Great East Rd',
    'Avondale Shopping Centre',
    'Ibex Hill (Twin Palm Mall)',
    'Salama Park',
    'Roma Park (Zambezi Road)',
    'Kalundu (Near UNZA)',
    'Olympia Park (Katima Mulilo Rd)',
    'Matero Main Market',
    'Chawama Market',
    'Kanyama Main Market',
    'Makeni Mall (Kafue Road)',
    'Lilayi (Police Camp & Game Ranch)',
    'Chilanga (Kafue Road)',
    'Silverest Gardens (Chongwe Rd)',
    'Kenneth Kaunda Int. Airport (KKIA)'
  ],
  Kitwe: [
    'Kitwe Town Centre (Matuka Ave)',
    'ECL Mall (Freedom Park)',
    'Mukuba Mall (Kitwe)',
    'Parklands Commercial Hub',
    'Riverside (CBU Campus Area)',
    'Copperbelt University (CBU Main Gate)',
    'Chimwemwe Main Market',
    'Nkana East / Golf Club',
    'Wusakile Compound',
    'Kwacha Market'
  ],
  Ndola: [
    'Ndola Broadway CBD',
    'Kafubu Mall',
    'Rekay Shopping Mall',
    'Kansenshi Residential & Commercial',
    'Simon Mwansa Kapwepwe Int. Airport',
    'Itawa Area / Golf Course',
    'Chifubu Market',
    'Masala Market'
  ],
  Livingstone: [
    'Livingstone Town Centre',
    'Victoria Falls (Mosi-oa-Tunya National Park)',
    'Maramba Cultural Market',
    'Harry Mwaanga Nkumbula Airport',
    'Fairmount / Zambezi River Front',
    'Dambwa North & Central'
  ],
  Kabwe: [
    'Kabwe Town Centre (Independence Ave)',
    'Mulungushi University Main Campus',
    'Kabwe Mall',
    'Bwacha Residential & Market',
    'High Ridge Residential Area'
  ],
  Chipata: [
    'Chipata Main Bus Terminus',
    'Protea Hotel Chipata',
    'Great East Road Junction (Malawi Border Rd)',
    'Down Town Market',
    'Mwami Border Route'
  ],
  Solwezi: [
    'Solwezi Town Centre / City Mall',
    'Kansanshi Mine Main Gate & Golf Club',
    'Kyawama Market',
    'Independence Avenue Commercial'
  ],
  Choma: [
    'Choma Town Centre (Macha Road)',
    'Choma Spar & Bus Station',
    'Macha Road Junction',
    'Shampande Market Area'
  ],
  Kasama: [
    'Kasama CBD (Mwizenge Avenue)',
    'TAZARA Railway Station Hub',
    'Location Main Market'
  ],
  Mongu: [
    'Mongu Town Centre',
    'Barotse Floodplain Causeway',
    'Limulunga Royal Palace Road',
    'Mongu Airport Road'
  ]
};

export const LUSAKA_POPULAR_HUBS = ZAMBIA_NATIONWIDE_HUBS['Lusaka'];

export const CURRENT_MOCK_USER: UserProfile = {
  id: 'usr_zm_0981',
  name: 'Chanda M.',
  phone: '+260 97 789 452',
  email: 'chanda.m@mrides.co.zm',
  role: 'customer',
  isVerified: true,
  city: 'Lusaka',
  rating: 4.9,
  completedTrips: 23,
  lastTripAgo: '2 days ago'
};

export const MOCK_RIDE_VEHICLES: RideVehicleOption[] = [
  {
    type: 'economy',
    title: 'Economy',
    capacity: '4 seats • Everyday affordable rides',
    etaMinutes: 4,
    baseEstimatedZMW: 60,
    minAllowedFareZMW: 28,
    maxAllowedFareZMW: 350,
    description: 'Reliable everyday hatchbacks & sedans (Toyota Vitz, Fit, IST) • Min K28'
  },
  {
    type: 'comfort',
    title: 'Comfort',
    capacity: '4 seats • AC & Newer Sedans',
    etaMinutes: 5,
    baseEstimatedZMW: 80,
    minAllowedFareZMW: 40,
    maxAllowedFareZMW: 500,
    description: 'Spacious air-conditioned sedans (Toyota Axio, Allion, Premio) • Min K40'
  },
  {
    type: 'boda',
    title: 'Boda Express',
    capacity: 'Fast motorcycle dispatch',
    etaMinutes: 3,
    baseEstimatedZMW: 35,
    minAllowedFareZMW: 22,
    maxAllowedFareZMW: 200,
    description: 'Quick traffic-beating boda-boda dispatch with verified rider & helmet'
  }
];

export const INITIAL_DRIVER_BIDS: DriverBid[] = [
  {
    id: 'bid_drv_1',
    driverName: 'Chanda M.',
    driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    driverPhone: '+260 97 781 2940',
    rating: 4.9,
    totalTrips: 320,
    vehicleModel: 'Toyota Axio • White',
    vehiclePlate: 'BAC 1234',
    offeredFareZMW: 80,
    distanceKm: 1.1,
    etaMinutes: 4,
    negotiationRound: 1,
    maxRounds: 3,
    expiresInSeconds: 75,
    isVerified: true,
    status: 'pending'
  },
  {
    id: 'bid_drv_2',
    driverName: 'Mwamba K.',
    driverPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    driverPhone: '+260 96 612 8871',
    rating: 4.8,
    totalTrips: 210,
    vehicleModel: 'Honda Fit • Silver',
    vehiclePlate: 'BLA 8492',
    offeredFareZMW: 85,
    distanceKm: 1.8,
    etaMinutes: 5,
    negotiationRound: 1,
    maxRounds: 3,
    expiresInSeconds: 82,
    isVerified: true,
    status: 'countered'
  },
  {
    id: 'bid_drv_3',
    driverName: 'Blessings P.',
    driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    driverPhone: '+260 95 554 3219',
    rating: 4.7,
    totalTrips: 180,
    vehicleModel: 'Toyota Vitz • Grey',
    vehiclePlate: 'BAV 3819',
    offeredFareZMW: 75,
    distanceKm: 2.3,
    etaMinutes: 6,
    negotiationRound: 1,
    maxRounds: 3,
    expiresInSeconds: 65,
    isVerified: true,
    status: 'pending'
  }
];

export const MOCK_BODA_RIDERS: BodaRiderBid[] = [
  {
    id: 'boda_1',
    riderId: 'rdr_mutale_01',
    riderName: 'Mutale Kangwa',
    riderPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    riderPhone: '+260 97 811 2245',
    bikeModel: 'Boxer BM 150 • Orange Carrier Box',
    bikePlate: 'BMB 4021 ZM',
    rating: 4.95,
    completedDeliveries: 540,
    isVerified: true,
    offeredFareZMW: 40,
    etaMinutes: 3,
    status: 'pending'
  },
  {
    id: 'boda_2',
    riderId: 'rdr_daka_02',
    riderName: 'Lazarous Daka',
    riderPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    riderPhone: '+260 96 420 7781',
    bikeModel: 'TVS HLX 125 • Sealed Thermal Box',
    bikePlate: 'BMC 1190 ZM',
    rating: 4.85,
    completedDeliveries: 310,
    isVerified: true,
    offeredFareZMW: 45,
    etaMinutes: 5,
    status: 'countered'
  }
];

export const INITIAL_RIDE_HISTORY: RideHistoryItem[] = [
  {
    id: 'trip_zm_901',
    ticketNumber: 'MRD-8924-ZM',
    serviceType: 'rides',
    date: 'Today, 27 Oct 2026',
    time: '09:41 AM',
    pickup: 'Cavendish University',
    destination: 'EastPark Mall',
    driverName: 'Chanda M.',
    driverPhone: '+260 97 781 2940',
    driverRating: 4.9,
    driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    vehicleModel: 'Toyota Axio • White',
    vehiclePlate: 'BAC 1234',
    fareZMW: 80,
    paymentMethod: 'cash',
    status: 'completed',
    countryCode: 'ZM',
    notes: 'FairFare agreed at K80. Arrived on time at main entrance.'
  },
  {
    id: 'trip_zm_902',
    ticketNumber: 'MRD-7815-ZM',
    serviceType: 'boda',
    date: 'Yesterday, 26 Oct 2026',
    time: '15:20 PM',
    pickup: 'Cairo Road CBD',
    destination: 'Woodlands Shopping Mall',
    driverName: 'Mutale Kangwa',
    driverPhone: '+260 97 811 2245',
    driverRating: 4.95,
    driverPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    vehicleModel: 'Boxer BM 150 (Boda Delivery)',
    vehiclePlate: 'BMB 4021 ZM',
    fareZMW: 45,
    paymentMethod: 'airtel_money',
    status: 'completed',
    countryCode: 'ZM',
    notes: 'Boda parcel delivery confirmed via PIN code.'
  },
  {
    id: 'trip_zm_903',
    ticketNumber: 'MRD-6502-ZM',
    serviceType: 'cargo',
    date: '23 Oct 2026',
    time: '11:15 AM',
    pickup: 'Manda Hill Shopping Mall',
    destination: 'Roma Park',
    driverName: 'Lusaka Swift Haulers',
    driverPhone: '+260 95 554 3219',
    driverRating: 4.9,
    driverPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    vehicleModel: '1-Ton Pickup Bakkie',
    vehiclePlate: 'BAH 9012 ZM',
    fareZMW: 320,
    paymentMethod: 'mtn_momo',
    status: 'completed',
    countryCode: 'ZM',
    notes: 'Office furniture & boxes delivered intact.'
  }
];

// Open ride & delivery requests in Lusaka visible to drivers
export const MOCK_OPEN_RIDE_REQUESTS: RideRequest[] = [
  {
    id: 'req_lusaka_101',
    passengerId: 'usr_p1',
    passengerName: 'Chanda M.',
    passengerPhone: '+260 97 789 452',
    passengerPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    passengerRating: 4.9,
    passengerCompletedTrips: 23,
    passengerVerified: true,
    passengerLastTrip: '2 days ago',
    paymentMethod: 'cash',
    pickup: 'Cavendish University',
    destination: 'EastPark Mall',
    vehicleType: 'comfort',
    passengerProposedFareZMW: 80,
    distanceKm: 5.2,
    estimatedDurationMinutes: 12,
    needAirConditioning: true,
    notes: 'Main entrance',
    createdAt: 'Just now'
  },
  {
    id: 'req_lusaka_102',
    passengerId: 'usr_p2',
    passengerName: 'David Banda',
    passengerPhone: '+260 96 440 2110',
    passengerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    passengerRating: 4.85,
    passengerCompletedTrips: 41,
    passengerVerified: true,
    passengerLastTrip: 'Yesterday',
    paymentMethod: 'mtn_momo',
    pickup: 'Manda Hill Mall',
    destination: 'Kenneth Kaunda Int. Airport (KKIA)',
    vehicleType: 'family_xl',
    passengerProposedFareZMW: 240,
    distanceKm: 19.4,
    estimatedDurationMinutes: 28,
    needAirConditioning: true,
    notes: '2 suitcases in boot. Pickup at main taxi bay.',
    createdAt: '2 mins ago'
  }
];

export const MOCK_CARGO_TIERS: CargoVehicleTierOption[] = [
  {
    tier: 'boda_courier',
    title: 'Boda Parcel Express',
    payloadCapacity: 'Up to 25 kg',
    baseZMW: 40,
    bestFor: 'Documents, small boxes, urgent parcels'
  },
  {
    tier: 'light_van',
    title: 'Cargo Town Van',
    payloadCapacity: 'Up to 500 kg',
    baseZMW: 180,
    bestFor: 'Boxes, retail goods, appliances'
  },
  {
    tier: 'one_ton_pickup',
    title: '1-Ton Pickup / Bakkie',
    payloadCapacity: 'Up to 1,000 kg',
    baseZMW: 320,
    bestFor: 'Small furniture, generators, hardware load'
  },
  {
    tier: 'canter_3_5ton',
    title: '3.5-Ton Canter Truck',
    payloadCapacity: 'Up to 3,500 kg',
    baseZMW: 650,
    bestFor: 'Full house moving, commercial freight'
  },
  {
    tier: 'heavy_flatbed',
    title: '10-Ton Commercial Rig',
    payloadCapacity: 'Up to 10,000 kg',
    baseZMW: 1400,
    bestFor: 'Building cement, timber, bulk cargo'
  }
];

export const MOCK_CARGO_QUOTES: CargoQuoteBid[] = [
  {
    id: 'quote_swifthaul',
    operatorId: 'op_swifthaul',
    operatorName: 'Lusaka Swift Haulers',
    truckPlate: 'BAH 9012 ZM',
    vehicleType: '1-Ton Mitsubishi Canter / Dropside',
    rating: 4.9,
    quotedFareZMW: 320,
    etaToPickupMins: 18,
    includesHelpersCount: 1,
    message: 'Tarp cover included to protect goods from dust/rain. Verified crew ready.'
  },
  {
    id: 'quote_zambezi',
    operatorId: 'op_zambezi',
    operatorName: 'Zambezi Freight Logistics',
    truckPlate: 'BAM 3302 ZM',
    vehicleType: '1-Ton Box Van (Enclosed & Lockable)',
    rating: 4.85,
    quotedFareZMW: 350,
    etaToPickupMins: 14,
    includesHelpersCount: 2,
    message: 'Fully enclosed lockable box body. Straps & blankets included.'
  }
];

export const MOCK_FOOD_RESTAURANTS: FoodRestaurant[] = [];
export const MOCK_MARKET_PRODUCTS: MarketProduct[] = [];

export const MOCK_ADMIN_METRICS: AdminMetric = {
  totalUsers: 14820,
  activeDrivers: 640,
  registeredVendors: 118,
  totalMarketListings: 0,
  grossMerchandiseZMW: 1280450,
  platformCommissionsZMW: 128045,
  commissionRatePercent: 10,
  pendingApprovals: 14,
  openDisputes: 3,
  activeRewardCampaigns: 2,
  rewardLiabilityZMW: 19300
};
