export interface MrideContentSettings {
  heroHeadline: string;
  heroSubheadline: string;
  promoAnnouncement: string;
  baseShortestFareZMW: number;
  minEconomyFareZMW: number;
  minComfortFareZMW: number;
  driverCommissionPercent: number;
  supportPhone: string;
  supportEmail: string;
  hqAddress: string;
  freeDomainUrl: string;
  primaryColor: string;
  heroImageUrl: string;
  appWelcomeText: string;
  appAnnouncement: string;
  appPrimaryColor: string;
  brandName: string;
  brandTagline: string;
  brandLogoUrl: string;
  websiteBackgroundColor: string;
  websiteSurfaceColor: string;
  websiteTextColor: string;
  disabledServices: string[];
  disabledCountryCodes: string[];
  disabledCityKeys: string[];
}

export const MRIDE_CONTENT_STORAGE_KEY = 'mrides_website_content_v3';

export const DEFAULT_MRIDE_CONTENT: MrideContentSettings = {
  heroHeadline: 'More than just a ride. It’s your everyday solution.',
  heroSubheadline: 'Safe, affordable and reliable passenger rides, cargo transport and boda-boda delivery across Zambia.',
  promoAnnouncement: 'FairFare: Adjust your price, receive real driver offers and counteroffers with zero hidden fees.',
  baseShortestFareZMW: 28,
  minEconomyFareZMW: 28,
  minComfortFareZMW: 40,
  driverCommissionPercent: 10,
  supportPhone: '+260 97 789 4432',
  supportEmail: 'support@mrides.co.zm',
  hqAddress: 'Plot 1042, Great East Road Commercial Hub, Lusaka, Zambia',
  freeDomainUrl: 'https://mrides-zambia.vercel.app',
  primaryColor: '#FF6500',
  heroImageUrl: '',
  appWelcomeText: 'Where are you going?',
  appAnnouncement: 'Simulated preview mode — Live driver matching, GPS telemetry, mobile money & emergency dispatch require production credentials.',
  appPrimaryColor: '#FF6500',
  brandName: 'Mrides',
  brandTagline: 'Your Ride. Your Way.',
  brandLogoUrl: '/mride-mark.svg',
  websiteBackgroundColor: '#FFFFFF',
  websiteSurfaceColor: '#F7F7F5',
  websiteTextColor: '#15191C',
  disabledServices: ['food', 'market'],
  disabledCountryCodes: [],
  disabledCityKeys: []
};

export function readMrideContent(): MrideContentSettings {
  try {
    const saved = window.localStorage.getItem(MRIDE_CONTENT_STORAGE_KEY);
    if (!saved) return DEFAULT_MRIDE_CONTENT;
    const parsed = JSON.parse(saved) as Partial<MrideContentSettings>;
    return {
      ...DEFAULT_MRIDE_CONTENT,
      ...parsed,
      brandName: 'Mrides',
      brandTagline: parsed.brandTagline || DEFAULT_MRIDE_CONTENT.brandTagline,
      appPrimaryColor: '#FF6500',
      primaryColor: '#FF6500',
      minEconomyFareZMW: parsed.minEconomyFareZMW ?? DEFAULT_MRIDE_CONTENT.minEconomyFareZMW,
      minComfortFareZMW: parsed.minComfortFareZMW ?? DEFAULT_MRIDE_CONTENT.minComfortFareZMW,
      disabledServices: parsed.disabledServices ?? DEFAULT_MRIDE_CONTENT.disabledServices,
      disabledCountryCodes: parsed.disabledCountryCodes ?? DEFAULT_MRIDE_CONTENT.disabledCountryCodes,
      disabledCityKeys: parsed.disabledCityKeys ?? DEFAULT_MRIDE_CONTENT.disabledCityKeys
    };
  } catch {
    return DEFAULT_MRIDE_CONTENT;
  }
}

export function saveMrideContent(settings: MrideContentSettings) {
  window.localStorage.setItem(MRIDE_CONTENT_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent<MrideContentSettings>('mride:content-updated', { detail: settings }));
}

export function isMrideServiceAvailable(settings: MrideContentSettings, serviceId: string) {
  return !settings.disabledServices.includes(serviceId);
}

export function isMrideLocationAvailable(
  settings: MrideContentSettings,
  countryCode: string,
  city: string
) {
  const cityKey = `${countryCode}:${city.toLowerCase()}`;
  return !settings.disabledCountryCodes.includes(countryCode)
    && !settings.disabledCityKeys.includes(cityKey);
}
