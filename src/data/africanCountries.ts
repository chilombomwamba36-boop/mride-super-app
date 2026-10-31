export interface CountryRecentDestination {
  name: string;
  subtitle: string;
  etaMins: number;
}

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  phoneCode: string;
  defaultCity: string;
  cities: string[];
  exchangeRateFromZMW: number; // 1 ZMW = X local currency units
  mobileMoneyProviders: string[];
  defaultPickup: string;
  defaultDestination: string;
  recentDestinations: CountryRecentDestination[];
  mapStreets: string[];
  mapCoordinates: { lat: number; lng: number };
}

export const AFRICAN_COUNTRIES: CountryConfig[] = [
  {
    code: 'ZM',
    name: 'Zambia',
    currency: 'ZMW',
    currencySymbol: 'K',
    phoneCode: '+260',
    defaultCity: 'Lusaka',
    cities: ['Lusaka', 'Kitwe', 'Ndola', 'Livingstone', 'Kabwe', 'Chipata', 'Solwezi', 'Choma', 'Kasama', 'Mongu'],
    exchangeRateFromZMW: 1.0,
    mobileMoneyProviders: ['MTN MoMo', 'Airtel Money', 'Zamtel Kwacha'],
    defaultPickup: 'Wamalunga Road, 6163',
    defaultDestination: 'Garden chimwansa',
    recentDestinations: [
      { name: 'Garden chimwansa', subtitle: 'Lusaka, Garden', etaMins: 9 },
      { name: 'Sadzu Rd 27455', subtitle: 'Independence, Lusaka', etaMins: 7 },
      { name: 'Manda Hill Mall', subtitle: 'Great East Road, Lusaka', etaMins: 12 },
      { name: 'Woodlands Shopping Mall', subtitle: 'Woodlands, Lusaka', etaMins: 14 }
    ],
    mapStreets: ['Great East Rd', 'Wamalunga Road', 'Makishi Rd', 'Petroda Station', 'Matebeto Grill', 'Manchinchi Rd', 'Buchi Rd'],
    mapCoordinates: { lat: -15.4167, lng: 28.2833 }
  },
  {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    phoneCode: '+254',
    defaultCity: 'Nairobi',
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
    exchangeRateFromZMW: 4.8,
    mobileMoneyProviders: ['Safaricom M-Pesa', 'Airtel Money', 'T-Kash'],
    defaultPickup: 'Kenyatta Avenue, CBD',
    defaultDestination: 'Westlands Square Mall',
    recentDestinations: [
      { name: 'Westlands Square Mall', subtitle: 'Waiyaki Way, Nairobi', etaMins: 11 },
      { name: 'Kilimani Adlife Plaza', subtitle: 'Ring Road Kilimani', etaMins: 8 },
      { name: 'JKIA Airport Terminal 1', subtitle: 'Airport North Rd', etaMins: 25 },
      { name: 'Two Rivers Mall', subtitle: 'Limuru Road', etaMins: 18 }
    ],
    mapStreets: ['Kenyatta Ave', 'Uhuru Highway', 'Waiyaki Way', 'Moi Ave', 'Mama Ngina St', 'Haile Selassie Ave'],
    mapCoordinates: { lat: -1.2921, lng: 36.8219 }
  },
  {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    phoneCode: '+234',
    defaultCity: 'Lagos',
    cities: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'],
    exchangeRateFromZMW: 58.0,
    mobileMoneyProviders: ['OPay', 'Palmpay', 'Moniepoint', 'MTN MoMo'],
    defaultPickup: 'Admiralty Way, Lekki Phase 1',
    defaultDestination: 'Victoria Island Palms Mall',
    recentDestinations: [
      { name: 'Victoria Island Palms Mall', subtitle: 'Ozumba Mbadiwe Ave', etaMins: 10 },
      { name: 'Ikeja City Mall', subtitle: 'Alausa, Ikeja', etaMins: 15 },
      { name: 'Murtala Muhammed Airport', subtitle: 'Ikeja, Lagos', etaMins: 28 }
    ],
    mapStreets: ['Admiralty Way', 'Ozumba Mbadiwe', 'Ahmadu Bello Way', 'Lekki Expressway', 'Bourdillon Rd'],
    mapCoordinates: { lat: 6.5244, lng: 3.3792 }
  },
  {
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    phoneCode: '+27',
    defaultCity: 'Johannesburg',
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Gqeberha'],
    exchangeRateFromZMW: 0.67,
    mobileMoneyProviders: ['Capitec Pay', 'Ozow Instant EFT', 'Vodapay'],
    defaultPickup: 'Rivonia Road, Sandton',
    defaultDestination: 'Rosebank Mall Centre',
    recentDestinations: [
      { name: 'Rosebank Mall Centre', subtitle: 'Oxford Road, Rosebank', etaMins: 9 },
      { name: 'Nelson Mandela Square', subtitle: '5th Street, Sandton', etaMins: 6 },
      { name: 'OR Tambo International Airport', subtitle: 'Kempton Park', etaMins: 22 }
    ],
    mapStreets: ['Rivonia Rd', 'Sandton Drive', 'Oxford Rd', 'Grayston Drive', 'Katherine St'],
    mapCoordinates: { lat: -26.2041, lng: 28.0473 }
  },
  {
    code: 'GH',
    name: 'Ghana',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    phoneCode: '+233',
    defaultCity: 'Accra',
    cities: ['Accra', 'Kumasi', 'Takoradi', 'Tamale', 'Tema'],
    exchangeRateFromZMW: 0.58,
    mobileMoneyProviders: ['MTN MoMo', 'Telecel Cash', 'AT Money'],
    defaultPickup: 'Oxford Street, Osu',
    defaultDestination: 'Accra Mall, Tetteh Quarshie',
    recentDestinations: [
      { name: 'Accra Mall', subtitle: 'Tetteh Quarshie Interchange', etaMins: 12 },
      { name: 'Kotoka International Airport', subtitle: 'Airport Residential', etaMins: 10 }
    ],
    mapStreets: ['Oxford Street', 'Liberation Road', 'Ring Road Central', 'Independence Ave', 'Cantonments Rd'],
    mapCoordinates: { lat: 5.6037, lng: -0.1870 }
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    currencySymbol: 'TSh',
    phoneCode: '+255',
    defaultCity: 'Dar es Salaam',
    cities: ['Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Zanzibar'],
    exchangeRateFromZMW: 96.0,
    mobileMoneyProviders: ['M-Pesa Vodacom', 'Tigo Pesa', 'Airtel Money'],
    defaultPickup: 'Samora Avenue, City Centre',
    defaultDestination: 'Mlimani City Shopping Mall',
    recentDestinations: [
      { name: 'Mlimani City Shopping Mall', subtitle: 'Sam Nujoma Rd, Dar', etaMins: 14 },
      { name: 'Julius Nyerere Airport', subtitle: 'Nyerere Rd', etaMins: 24 }
    ],
    mapStreets: ['Samora Avenue', 'Ali Hassan Mwinyi Rd', 'Morogoro Rd', 'Nyerere Rd'],
    mapCoordinates: { lat: -6.7924, lng: 39.2083 }
  },
  {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    currencySymbol: 'USh',
    phoneCode: '+256',
    defaultCity: 'Kampala',
    cities: ['Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu'],
    exchangeRateFromZMW: 135.0,
    mobileMoneyProviders: ['MTN MoMo', 'Airtel Money'],
    defaultPickup: 'Kampala Road, Central CBD',
    defaultDestination: 'Acacia Mall, Kisementi',
    recentDestinations: [
      { name: 'Acacia Mall', subtitle: 'Kisementi, Kololo', etaMins: 8 },
      { name: 'Entebbe Airport Terminal', subtitle: 'Entebbe Express Highway', etaMins: 35 }
    ],
    mapStreets: ['Kampala Road', 'Jinja Road', 'Yusuf Lule Rd', 'Kira Road'],
    mapCoordinates: { lat: 0.3476, lng: 32.5825 }
  },
  {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    currencySymbol: 'FRw',
    phoneCode: '+250',
    defaultCity: 'Kigali',
    cities: ['Kigali', 'Rubavu', 'Musanze', 'Huye'],
    exchangeRateFromZMW: 50.0,
    mobileMoneyProviders: ['MTN MoMo', 'Airtel Money'],
    defaultPickup: 'KN 3 Avenue, Nyarugenge',
    defaultDestination: 'Kigali Heights Mall (Kimihurura)',
    recentDestinations: [
      { name: 'Kigali Heights Mall', subtitle: 'Kimihurura, Kigali', etaMins: 7 },
      { name: 'Kigali International Airport', subtitle: 'Kanombe', etaMins: 15 }
    ],
    mapStreets: ['KN 3 Avenue', 'KG 1 Roundabout', 'KG 7 Ave', 'Boulevard de l’Umuganda'],
    mapCoordinates: { lat: -1.9441, lng: 30.0619 }
  },
  {
    code: 'EG',
    name: 'Egypt',
    currency: 'EGP',
    currencySymbol: 'E£',
    phoneCode: '+20',
    defaultCity: 'Cairo',
    cities: ['Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh'],
    exchangeRateFromZMW: 1.8,
    mobileMoneyProviders: ['Vodafone Cash', 'InstaPay', 'Fawry'],
    defaultPickup: 'Tahrir Square, Downtown',
    defaultDestination: 'Cairo Festival City Mall',
    recentDestinations: [
      { name: 'Cairo Festival City Mall', subtitle: 'New Cairo', etaMins: 19 },
      { name: 'Cairo International Airport', subtitle: 'Heliopolis', etaMins: 26 }
    ],
    mapStreets: ['Tahrir St', 'El Galaa St', 'Salah Salem St', 'Ring Road'],
    mapCoordinates: { lat: 30.0444, lng: 31.2357 }
  },
  {
    code: 'CD',
    name: 'DR Congo',
    currency: 'USD',
    currencySymbol: '$',
    phoneCode: '+243',
    defaultCity: 'Kinshasa',
    cities: ['Kinshasa', 'Lubumbashi', 'Goma', 'Kolwezi'],
    exchangeRateFromZMW: 0.037,
    mobileMoneyProviders: ['M-Pesa', 'Orange Money', 'Airtel Money'],
    defaultPickup: 'Boulevard du 30 Juin, Gombe',
    defaultDestination: 'Grand Hôtel Kinshasa',
    recentDestinations: [
      { name: 'Grand Hôtel Kinshasa', subtitle: 'Gombe, Kinshasa', etaMins: 6 },
      { name: 'Ndjili International Airport', subtitle: 'Ndjili Corridor', etaMins: 45 }
    ],
    mapStreets: ['Boulevard du 30 Juin', 'Avenue de la Justice', 'Avenue des Huileries', 'Boulevard Triomphal'],
    mapCoordinates: { lat: -4.4419, lng: 15.2663 }
  }
];

export const DEFAULT_COUNTRY = AFRICAN_COUNTRIES[0]; // Zambia default

export const formatPrice = (amountZMW: number, country: CountryConfig): string => {
  const converted = Math.round(amountZMW * country.exchangeRateFromZMW);
  if (country.currency === 'USD') {
    return `${country.currencySymbol}${(amountZMW * country.exchangeRateFromZMW).toFixed(2)}`;
  }
  return `${country.currency} ${converted.toLocaleString()}`;
};
