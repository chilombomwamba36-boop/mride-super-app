import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const MockNotice: React.FC<{ message?: string }> = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
      <WifiOff className="h-4 w-4 shrink-0 text-red-600" />
      <p className="min-w-0 leading-snug">
        Mobile data connection is offline. Turn on data or Wi-Fi for live GPS routing, driver matching and in-app voice calls.
      </p>
    </div>
  );
};
