import React, { useEffect, useState } from 'react';
import { 
  X, 
  Banknote, 
  Smartphone, 
  CreditCard,
  CheckCircle2, 
  Printer, 
  ArrowRight,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { 
  PaymentGatewayService, 
  PaymentMethodType, 
  PaymentTransactionResult 
} from '../../services/paymentGateway';
import { NotificationService } from '../../services/notificationService';
import { RideHistoryItem } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
  referenceId: string;
  amountZMW: number;
  customerName: string;
  customerPhone: string;
  onPaymentComplete: (result: PaymentTransactionResult) => void;
  rideDetails: RideHistoryItem;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  serviceTitle,
  referenceId,
  amountZMW,
  customerName,
  customerPhone,
  onPaymentComplete,
  rideDetails
}) => {
  const [method, setMethod] = useState<PaymentMethodType>('cash');
  const [cashTendered, setCashTendered] = useState<number>(amountZMW);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentTransactionResult | null>(null);

  useEffect(() => {
    if (isOpen) setCashTendered(amountZMW);
  }, [amountZMW, isOpen]);

  if (!isOpen) return null;

  const paymentService = PaymentGatewayService.getInstance();
  const notifService = NotificationService.getInstance();

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    let res: PaymentTransactionResult;
    if (method === 'cash') {
      res = paymentService.processCashPayment({
        referenceId,
        amountZMW,
        service: 'rides',
        customerName,
        customerPhone,
        cashTenderedZMW: cashTendered
      });
    } else if (method === 'mtn_momo') {
      res = await paymentService.processMtnMomoPayment({
        referenceId,
        amountZMW,
        service: 'rides',
        customerName,
        customerPhone
      });
    } else if (method === 'airtel_money') {
      res = await paymentService.processAirtelMoneyPayment({
        referenceId,
        amountZMW,
        service: 'rides',
        customerName,
        customerPhone
      });
    } else {
      res = await paymentService.processCardPayment({
        referenceId,
        amountZMW,
        service: 'rides',
        customerName,
        customerPhone,
        cardNumber: cardNumber || '4532 8812 9901 3218',
        cardExpiry: cardExpiry || '12/28',
        cardCvv: cardCvv || '882'
      });
    }

    setIsProcessing(false);
    setReceipt(res);
    onPaymentComplete(res);

    // Push notification
    notifService.pushNotification({
      title: `Payment Successful (ZMW ${amountZMW})`,
      body: `Your payment for ${serviceTitle} was approved via ${method.toUpperCase()}. Ref: ${res.providerReceiptNumber}`,
      service: 'rides',
      carrierSender: method === 'cash' ? 'Mride HQ' : method === 'mtn_momo' ? 'MTN Zambia' : method === 'airtel_money' ? 'Airtel Zambia' : 'Mride HQ'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in">
        {/* Header */}
        <div className="bg-[#1A3038] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold">
              M
            </div>
            <div>
              <h3 className="font-bold text-base">Authorize Payment</h3>
              <p className="text-[11px] text-slate-300">Zambian Kwacha (ZMW) Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {receipt ? (
          /* DIGITAL RIDE RECEIPT */
          <div className="p-6 space-y-4 text-xs">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#E5F3F1] text-[#0F766E] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Payment Settled!</h4>
              <p className="text-slate-500 font-mono text-[11px]">{receipt.providerReceiptNumber}</p>
            </div>

            <div className="bg-[#F1F5F2] p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold text-sm text-[#1A3038] pb-2 border-b border-slate-300">
                <span>Amount Paid:</span>
                <span>ZMW {receipt.amountZMW}</span>
              </div>
              {receipt.changeDueZMW !== undefined && receipt.changeDueZMW > 0 && (
                <div className="flex justify-between text-teal-800 font-bold">
                  <span>Change Handed Back:</span>
                  <span>ZMW {receipt.changeDueZMW}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="uppercase font-bold">{receipt.method}</span>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 p-4 text-slate-700">
              <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                <span className="font-semibold">Tracking ticket</span>
                <span className="font-mono font-bold text-slate-900">{rideDetails.ticketNumber}</span>
              </div>
              <div><span className="text-slate-500">Driver</span><p className="font-bold text-slate-900">{rideDetails.driverName}</p></div>
              <div><span className="text-slate-500">Vehicle</span><p className="font-bold text-slate-900">{rideDetails.vehicleModel} · {rideDetails.vehiclePlate}</p></div>
              <div><span className="text-slate-500">From</span><p className="font-bold text-slate-900">{rideDetails.pickup}</p></div>
              <div><span className="text-slate-500">To</span><p className="font-bold text-slate-900">{rideDetails.destination}</p></div>
            </div>

            <p className="text-center text-[11px] text-slate-600">
              Need help with this ride? Report an issue on the Mride website using ticket <strong>{rideDetails.ticketNumber}</strong>. Your receipt is available in Ride History.
            </p>

            <p className="text-[11px] text-slate-500 italic text-center">
              {receipt.instructions}
            </p>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold py-2.5 rounded-lg text-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT SELECTION FORM */
          <form onSubmit={handlePay} className="p-6 space-y-4">
            <div className="bg-[#F1F5F2] p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-semibold">{serviceTitle}</span>
                <span className="text-2xl font-bold text-[#1A3038]">ZMW {amountZMW}</span>
              </div>
              <span className="bg-[#E5F3F1] text-[#0F625C] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                Locked Agreed Fare
              </span>
            </div>

            {/* Method Pills */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Select Payment Channel</label>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    method === 'cash' 
                      ? 'bg-[#1A3038] text-white border-[#1A3038] ring-2 ring-[#B8DCD7]' 
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span className="text-[11px]">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('mtn_momo')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    method === 'mtn_momo' 
                      ? 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-400' 
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px]">MTN MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('airtel_money')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    method === 'airtel_money' 
                      ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-500' 
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px]">Airtel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    method === 'card' 
                      ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400' 
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[11px]">Bank Card</span>
                </button>
              </div>
            </div>

            {/* Cash Tendered Sub-box */}
            {method === 'cash' && (
              <div className="bg-[#F1F5F2] p-3.5 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700">Cash Amount Handed (ZMW):</label>
                  <input
                    type="number"
                    min={amountZMW}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-24 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-right font-extrabold text-sm"
                  />
                </div>
                {cashTendered > amountZMW && (
                  <p className="text-teal-800 font-bold text-right">
                    Driver will return change: <strong>ZMW {cashTendered - amountZMW}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Bank Card Sub-form */}
            {method === 'card' && (
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Visa & Mastercard 3DS Secure
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Bank of Zambia</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number (4532 •••• •••• 3218)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM / YY (12/28)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="CVV (882)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* MoMo / Airtel Prompt info */}
            {(method === 'mtn_momo' || method === 'airtel_money') && (
              <div className="bg-[#FFF0E6] border border-[#FF6500]/30 p-3.5 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-[#15191C] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF6500]" />
                  Live Mobile Money USSD Push Authorization
                </p>
                <p className="text-slate-600">
                  A live payment authorization prompt is pushed directly to {customerPhone}. Enter your 4-digit Mobile Money PIN on your phone to approve K{amountZMW}.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold py-3.5 rounded-lg text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Authorizing with Carrier Gateway...' : `Confirm & Settle ZMW ${amountZMW}`}
              {!isProcessing && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
