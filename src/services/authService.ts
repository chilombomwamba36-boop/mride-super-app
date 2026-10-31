import { UserProfile, UserRole } from '../types';

const STORAGE_KEY = 'mrides_auth_session_v2';
const USERS_REGISTRY_KEY = 'mrides_registered_users_v2';

export interface AuthSession {
  user: UserProfile;
  token: string;
  loginMethod: 'phone_otp' | 'email';
}

export interface RegisteredUserRecord extends UserProfile {
  password?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  licenseNumber?: string;
  eligibleServices?: Array<'rides' | 'cargo' | 'boda'>;
}

const DEFAULT_PASSENGER: RegisteredUserRecord = {
  id: 'usr_zm_0981',
  name: 'Chanda M.',
  phone: '+26097789452',
  email: 'chanda.m@mrides.co.zm',
  role: 'customer',
  isVerified: true,
  city: 'Lusaka',
  countryCode: 'ZM',
  rating: 4.9,
  completedTrips: 23
};

const DEFAULT_DRIVER: RegisteredUserRecord = {
  id: 'drv_chanda',
  name: 'Chanda M. (Driver)',
  phone: '+260977812940',
  email: 'driver.chanda@mrides.co.zm',
  role: 'driver',
  isVerified: true,
  city: 'Lusaka',
  countryCode: 'ZM',
  rating: 4.9,
  completedTrips: 320,
  vehicleModel: 'Toyota Axio • White',
  vehiclePlate: 'BAC 1234',
  licenseNumber: 'ZM-PSV-884120',
  eligibleServices: ['rides', 'cargo']
};

export class AuthService {
  private static instance: AuthService;
  private currentSession: AuthSession | null = null;
  private listeners: Array<(session: AuthSession | null) => void> = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private getRegisteredUsers(): RegisteredUserRecord[] {
    try {
      const raw = localStorage.getItem(USERS_REGISTRY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RegisteredUserRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [DEFAULT_PASSENGER, DEFAULT_DRIVER];
  }

  private saveRegisteredUser(record: RegisteredUserRecord): void {
    try {
      const existing = this.getRegisteredUsers().filter(
        (u) => !(u.phone === record.phone && u.role === record.role)
      );
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify([record, ...existing]));
    } catch {
      // ignore
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentSession = JSON.parse(stored);
      } else {
        this.currentSession = null;
      }
    } catch {
      this.currentSession = null;
    }
  }

  private saveToStorage(): void {
    try {
      if (this.currentSession) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentSession));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    this.notify();
  }

  public isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  public getCurrentUser(): UserProfile {
    return this.currentSession ? this.currentSession.user : DEFAULT_PASSENGER;
  }

  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  public subscribe(callback: (session: AuthSession | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentSession);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.currentSession));
  }

  /**
   * Sign in with Phone OTP for either Passenger ('customer') or Driver ('driver')
   */
  public async signInWithPhoneOTP(
    phone: string,
    otpCode: string,
    role: UserRole = 'customer'
  ): Promise<UserProfile> {
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^\+?\d{8,15}$/.test(cleanPhone)) {
      throw new Error(
        'Enter a valid phone number including country code (for example, +260 97 789 452).'
      );
    }

    if (otpCode !== '1234' && otpCode.length < 4) {
      throw new Error('Invalid verification code. For this preview, use OTP 1234.');
    }

    const normalizedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
    const existing = this.getRegisteredUsers().find(
      (u) => u.phone.replace(/\s+/g, '') === normalizedPhone && u.role === role
    );

    const user: UserProfile = existing || {
      id: `usr_${role}_${Math.random().toString(36).substring(2, 8)}`,
      name: role === 'driver' ? 'Chanda M. (Driver)' : 'Chanda M.',
      phone: normalizedPhone,
      email: `${normalizedPhone.replace(/\D/g, '')}@mrides.co.zm`,
      role,
      isVerified: true,
      city: 'Lusaka',
      countryCode: 'ZM',
      rating: 4.9,
      completedTrips: role === 'driver' ? 320 : 23
    };

    this.currentSession = {
      user,
      token: `jwt_${Date.now()}_${user.id}`,
      loginMethod: 'phone_otp'
    };

    this.saveToStorage();
    return user;
  }

  /**
   * Sign in with Email & Password for Passenger, Driver, or Admin
   */
  public async signInWithEmail(
    email: string,
    pass: string,
    preferredRole?: UserRole
  ): Promise<UserProfile> {
    if (!email || !pass) {
      throw new Error('Email and password are required.');
    }

    const isAdmin = email.toLowerCase().includes('admin');
    const role: UserRole = isAdmin ? 'admin' : preferredRole || 'customer';

    const existing = this.getRegisteredUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    const user: UserProfile = existing || {
      id: `usr_${role}_${Date.now()}`,
      name: isAdmin
        ? 'Mrides Lusaka Admin'
        : role === 'driver'
        ? `${email.split('@')[0]} (Driver)`
        : email.split('@')[0],
      phone: '+260 97 789 452',
      email,
      role,
      isVerified: true,
      city: 'Lusaka',
      countryCode: 'ZM',
      rating: 4.9,
      completedTrips: role === 'driver' ? 120 : 12
    };

    this.currentSession = {
      user,
      token: `jwt_${Date.now()}`,
      loginMethod: 'email'
    };

    this.saveToStorage();
    return user;
  }

  /**
   * Register a new Passenger or Driver account
   */
  public async registerAccount(params: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    countryCode?: string;
    city?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    licenseNumber?: string;
    eligibleServices?: Array<'rides' | 'cargo' | 'boda'>;
  }): Promise<UserProfile> {
    if (!params.name.trim()) {
      throw new Error('Full name is required.');
    }
    const cleanPhone = params.phone.replace(/\s+/g, '');
    if (!/^\+?\d{8,15}$/.test(cleanPhone)) {
      throw new Error('Enter a valid Zambian phone number (e.g. +260 97 789 452).');
    }

    if (params.role === 'driver' && (!params.vehicleModel?.trim() || !params.vehiclePlate?.trim())) {
      throw new Error('Drivers must provide their vehicle make/model and Zambian plate number.');
    }

    const record: RegisteredUserRecord = {
      id: `usr_${params.role}_${Date.now()}`,
      name: params.name.trim(),
      phone: cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`,
      email: params.email.trim() || `${cleanPhone.replace(/\D/g, '')}@mrides.co.zm`,
      role: params.role,
      isVerified: true,
      city: params.city || 'Lusaka',
      countryCode: params.countryCode || 'ZM',
      rating: 5.0,
      completedTrips: 0,
      vehicleModel: params.vehicleModel,
      vehiclePlate: params.vehiclePlate,
      licenseNumber: params.licenseNumber,
      eligibleServices: params.eligibleServices
    };

    this.saveRegisteredUser(record);

    this.currentSession = {
      user: record,
      token: `jwt_${Date.now()}_${record.id}`,
      loginMethod: 'phone_otp'
    };

    this.saveToStorage();
    return record;
  }

  public updateUserRole(role: UserRole): void {
    if (this.currentSession) {
      this.currentSession.user.role = role;
      this.saveToStorage();
    }
  }

  public signOut(): void {
    this.currentSession = null;
    this.saveToStorage();
  }
}
