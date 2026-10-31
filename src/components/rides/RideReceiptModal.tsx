import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  AlertCircle, 
  MapPin, 
  Car, 
  Phone, 
  Star, 
  Copy, 
  Check, 
} from 'lucide-react';
import { CountryConfig, formatPrice } from '../../data/africanCountries';
import { RideHistoryItem } from '../../types';

interface RideReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: RideHistoryItem;
  country: CountryConfig;
  onReportIssue?: (ticketNumber: string) => void;
}

export const RideReceiptModal: React.FC<RideReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptData,
  country,
  onReportIssue
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showSupportNote, setShowSupportNote] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyTicket = () => {
    navigator.clipboard?.writeText(receiptData.ticketNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = () => {
    if (onReportIssue) {
      onReportIssue(receiptData.ticketNumber);
    }
    handleCopyTicket();
    setShowSupportNote(true);
    setTimeout(() => setShowSupportNote(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1A3038] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-display font-bold text-lg">
              M
            </div>
            <div>
              <h3 className="font-bold text-base">Mride Official Trip Receipt</h3>
              <p className="text-[11px] text-slate-300">Ride receipt and support reference</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
          {/* Status and Ticket Badge */}
          <div className="text-center space-y-1.5 pb-2 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-[#E5F3F1] text-[#0F766E] mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Ride Completed</h4>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono font-bold text-slate-500">Tracking Ticket:</span>
              <span className="font-mono font-extrabold text-xs bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                {receiptData.ticketNumber}
              </span>
              <button
                onClick={handleCopyTicket}
                className="text-slate-500 hover:text-[#0F766E] p-1"
                title="Copy Ticket Number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#0F766E]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {receiptData.date} • {receiptData.time}
            </p>
          </div>

          {/* Fare Summary Box */}
          <div className="bg-[#F4F7F7] p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-600 font-semibold">Total Fare Paid:</span>
              <span className="text-xl font-bold text-[#1A3038]">
                {formatPrice(receiptData.fareZMW, country)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Channel:</span>
              <span className="uppercase font-bold text-slate-900">
                {receiptData.paymentMethod.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Pricing Guarantee:</span>
              <span className="text-[#0F766E] font-semibold">Agreed fare</span>
            </div>
          </div>

          {/* Complete Driver & Vehicle Information (Matching User Requirement) */}
          <div className="bg-[#F4F7F7] p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Car className="w-4 h-4 text-[#0F766E]" />
              <span>Assigned Driver & Vehicle Details</span>
            </h5>

            <div className="flex items-center gap-3">
              {receiptData.driverPhoto ? (
                <img 
                  src={receiptData.driverPhoto} 
                  alt={receiptData.driverName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#D8E6E4]" 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#E5F3F1] text-[#0F766E] flex items-center justify-center font-bold text-base">
                  {receiptData.driverName.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h6 className="font-extrabold text-sm text-slate-900 truncate">
                    {receiptData.driverName}
                  </h6>
                  <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                    {receiptData.driverRating}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{receiptData.driverPhone}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
              <div>
                <span className="text-slate-500 block">Car Model:</span>
                <strong className="text-slate-800">{receiptData.vehicleModel}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Vehicle Plate:</span>
                <span className="font-mono font-bold text-xs bg-[#E5F3F1] text-[#0F625C] px-2 py-0.5 rounded">
                  {receiptData.vehiclePlate}
                </span>
              </div>
            </div>
          </div>

          {/* Route Details (From & To) */}
          <div className="bg-[#F4F7F7] p-4 rounded-xl border border-slate-200 space-y-2">
            <h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-[#0F766E]" />
              <span>Trip Route</span>
            </h5>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E] mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">From (Pickup):</span>
                  <p className="font-bold text-slate-900">{receiptData.pickup}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1A3038] mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">To (Destination):</span>
                  <p className="font-bold text-slate-900">{receiptData.destination}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up & Reporting Option (User Instruction) */}
          <div className="bg-[#E5F3F1] border border-[#CEE5E1] rounded-xl p-3.5 space-y-2">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-[#1A3038]">
                  Follow Up & Lost Item Protection
                </p>
                <p className="text-[11px] text-slate-700 leading-snug mt-0.5">
                  Need to report an issue or follow up? Give Mride support ticket <strong>#{receiptData.ticketNumber}</strong> and the trip details above.
                </p>
              </div>
            </div>

            {showSupportNote && (
              <div className="bg-white text-slate-800 p-2 rounded-lg text-xs font-semibold text-center animate-in fade-in">
                Ticket copied. Contact Mride support to submit your request; this demo does not send reports.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleReport}
                className="w-full bg-[#FF6500] hover:bg-[#e55a00] text-white font-extrabold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Report Issue in Portal</span>
              </button>
              <button
                onClick={handleCopyTicket}
                className="w-full bg-white hover:bg-[#F4F7F7] text-slate-800 border border-[#B8DCD7] font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Copy Ticket Reference</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold py-2.5 rounded-lg text-xs shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
