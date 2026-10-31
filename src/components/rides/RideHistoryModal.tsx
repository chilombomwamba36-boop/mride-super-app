import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  Car, 
  ChevronRight, 
  Search
} from 'lucide-react';
import { CountryConfig, formatPrice } from '../../data/africanCountries';
import { RideHistoryItem } from '../../types';
import { RideReceiptModal } from './RideReceiptModal';

interface RideHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: CountryConfig;
  historyItems: RideHistoryItem[];
  onTrackOnWebsite?: (ticketNumber: string) => void;
}

export const RideHistoryModal: React.FC<RideHistoryModalProps> = ({
  isOpen,
  onClose,
  country,
  historyItems,
  onTrackOnWebsite
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<RideHistoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredItems = historyItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.ticketNumber.toLowerCase().includes(q) ||
      item.destination.toLowerCase().includes(q) ||
      item.pickup.toLowerCase().includes(q) ||
      item.driverName.toLowerCase().includes(q) ||
      item.vehiclePlate.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in duration-150 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-[#0F1E36] text-white p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF7A00] text-[#0F1E36] flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">My Trips & Ride History</h3>
                <p className="text-[11px] text-slate-300">View receipts, trace tickets & report follow-ups</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ticket #, driver, street or destination..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          {/* Ride List */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
            {filteredItems.map((ride) => (
              <div
                key={ride.id}
                className="bg-[#F8FAFC] hover:bg-slate-100 rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 transition-colors"
              >
                {/* Trip Header: Date & Ticket */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-[11px] bg-slate-900 text-[#FF7A00] px-2 py-0.5 rounded">
                      {ride.ticketNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {ride.date} • {ride.time}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-[#0F1E36]">
                    {formatPrice(ride.fareZMW, country)}
                  </span>
                </div>

                {/* Route */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF7A00] mt-1 shrink-0" />
                    <p className="text-slate-700 font-medium truncate">{ride.pickup}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-sm bg-[#0F1E36] mt-1 shrink-0" />
                    <p className="text-slate-900 font-bold truncate">{ride.destination}</p>
                  </div>
                </div>

                {/* Driver & Car Summary */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{ride.driverName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{ride.vehicleModel}</span>
                    <span className="font-mono text-slate-600 bg-slate-200/60 px-1 rounded">
                      {ride.vehiclePlate}
                    </span>
                  </div>

                  {/* View Attached Receipt Button */}
                  <button
                    onClick={() => setSelectedReceipt(ride)}
                    className="bg-[#FF7A00] hover:bg-[#E66800] text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition-colors shrink-0"
                  >
                    <span>View Receipt</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-sm text-slate-600">No rides found</p>
                <p className="text-xs">Your completed trip receipts will appear here.</p>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
            <span>Need to follow up on a ride? Click <strong>View Receipt</strong> on any trip.</span>
          </div>
        </div>
      </div>

      {/* Submodal: Detailed Trip Receipt */}
      {selectedReceipt && (
        <RideReceiptModal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          receiptData={selectedReceipt}
          country={country}
          onReportIssue={(ticketNum) => {
            setSelectedReceipt(null);
            onClose();
            onTrackOnWebsite?.(ticketNum);
          }}
        />
      )}
    </>
  );
};
