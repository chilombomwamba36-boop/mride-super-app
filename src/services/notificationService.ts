export interface AppNotification {
  id: string;
  title: string;
  body: string;
  service: 'rides' | 'cargo' | 'food' | 'market' | 'system';
  carrierSender?: 'MTN Zambia' | 'Airtel Zambia' | 'Zamtel' | 'Mride HQ' | 'Visa/Mastercard';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private notifications: AppNotification[] = [
    {
      id: 'notif_init_1',
      title: 'Welcome to Mride Zambia!',
      body: 'Your multi-service super app is active across Lusaka, Copperbelt, Livingstone and all provinces.',
      service: 'system',
      carrierSender: 'Mride HQ',
      timestamp: 'Just now',
      isRead: false
    }
  ];
  private listeners: Array<(notifs: AppNotification[]) => void> = [];

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public getNotifications(): AppNotification[] {
    return this.notifications;
  }

  public subscribe(callback: (notifs: AppNotification[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.notifications);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.notifications));
  }

  /**
   * Broadcast a new notification & simulate Zambian carrier SMS gateway delivery
   */
  public pushNotification(params: {
    title: string;
    body: string;
    service: 'rides' | 'cargo' | 'food' | 'market' | 'system';
    carrierSender?: 'MTN Zambia' | 'Airtel Zambia' | 'Zamtel' | 'Mride HQ';
  }): AppNotification {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: params.title,
      body: params.body,
      service: params.service,
      carrierSender: params.carrierSender || 'Mride HQ',
      timestamp: 'Just now',
      isRead: false
    };

    this.notifications = [newNotif, ...this.notifications];
    this.notify();
    return newNotif;
  }

  public markAllAsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    this.notify();
  }
}
