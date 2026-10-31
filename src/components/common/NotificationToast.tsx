import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Car, 
  Truck, 
  UtensilsCrossed, 
  ShoppingBag, 
  MessageSquare
} from 'lucide-react';
import { NotificationService, AppNotification } from '../../services/notificationService';

export const NotificationToast: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifService = NotificationService.getInstance();

  useEffect(() => {
    const unsub = notifService.subscribe((list) => {
      setNotifications(list);
    });
    return () => unsub();
  }, [notifService]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getServiceIcon = (svc: AppNotification['service']) => {
    switch (svc) {
      case 'rides': return <Car className="w-4 h-4 text-[#0F1E36]" />;
      case 'cargo': return <Truck className="w-4 h-4 text-amber-700" />;
      case 'food': return <UtensilsCrossed className="w-4 h-4 text-orange-700" />;
      case 'market': return <ShoppingBag className="w-4 h-4 text-purple-700" />;
      default: return <Bell className="w-4 h-4 text-[#FF7A00]" />;
    }
  };

  return (
    <>
      {/* Floating Notification Bell Trigger */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) notifService.markAllAsRead();
          }}
          className="relative bg-[#0F1E36] hover:bg-[#0A1526] text-[#FF7A00] p-3.5 rounded-full shadow-2xl border-2 border-[#FF7A00] transition-all hover:scale-105 active:scale-95"
          title="Notifications & SMS Alerts"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 sm:bottom-20 sm:right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#0F1E36] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#FF7A00]" />
              <h4 className="font-bold text-sm">Mride Notifications</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 max-h-80 overflow-y-auto space-y-2.5">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    {getServiceIcon(notif.service)}
                    <span>{notif.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{notif.timestamp}</span>
                </div>
                <p className="text-slate-600 leading-snug">{notif.body}</p>
                {notif.carrierSender && (
                  <p className="text-[10px] font-bold text-orange-700 pt-0.5 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> SMS Sender: {notif.carrierSender}
                  </p>
                )}
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                No new notifications.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
