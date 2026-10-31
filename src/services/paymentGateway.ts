/**
 * Mride Payment Gateway Architecture for Zambia
 * 
 * Supports:
 * 1. Cash Payment Provider (with exact change calculation).
 * 2. MTN Mobile Money Zambia (OpenAPI Collections v1.0 standard).
 * 3. Airtel Money Africa (Merchant Payments OpenAPI).
 * 4. Bank Card (Visa / Mastercard / 3D-Secure).
 * 5. ZRA (Zambia Revenue Authority) VAT & Tax Invoice Receipt Generator.
 */

export type PaymentMethodType = 'cash' | 'mtn_momo' | 'airtel_money' | 'card';

export interface PaymentInitiationRequest {
  referenceId: string;
  amountZMW: number;
  service: 'rides' | 'cargo' | 'food' | 'market';
  customerName: string;
  customerPhone: string;
  cashTenderedZMW?: number;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export interface PaymentTransactionResult {
  transactionId: string;
  referenceId: string;
  status: 'SUCCESS' | 'PENDING_USSD_PROMPT' | 'FAILED';
  amountZMW: number;
  changeDueZMW?: number;
  method: PaymentMethodType;
  providerReceiptNumber: string;
  zraTaxInvoiceNumber: string;
  vatAmountZMW: number;
  netRevenueZMW: number;
  instructions?: string;
}

export class PaymentGatewayService {
  private static instance: PaymentGatewayService;

  public static getInstance(): PaymentGatewayService {
    if (!PaymentGatewayService.instance) {
      PaymentGatewayService.instance = new PaymentGatewayService();
    }
    return PaymentGatewayService.instance;
  }

  /**
   * Cash on Delivery / Cash to Driver with change calculator
   */
  public processCashPayment(req: PaymentInitiationRequest): PaymentTransactionResult {
    const tendered = req.cashTenderedZMW || req.amountZMW;
    const changeDue = Math.max(0, tendered - req.amountZMW);
    const vat = Number((req.amountZMW * 0.16).toFixed(2)); // 16% Zambian VAT

    return {
      transactionId: `CASH-ZM-${Date.now()}`,
      referenceId: req.referenceId,
      status: 'SUCCESS',
      amountZMW: req.amountZMW,
      changeDueZMW: changeDue,
      method: 'cash',
      providerReceiptNumber: `CSH-REC-${Math.floor(100000 + Math.random() * 900000)}`,
      zraTaxInvoiceNumber: `ZRA-INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      vatAmountZMW: vat,
      netRevenueZMW: Number((req.amountZMW - vat).toFixed(2)),
      instructions: `Cash received: ZMW ${tendered}. Change handed to passenger: ZMW ${changeDue}.`
    };
  }

  /**
   * MTN Mobile Money Zambia (RequestToPay API simulation)
   */
  public async processMtnMomoPayment(req: PaymentInitiationRequest): Promise<PaymentTransactionResult> {
    const vat = Number((req.amountZMW * 0.16).toFixed(2));
    const txId = `MTN-ZM-${Date.now()}`;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transactionId: txId,
          referenceId: req.referenceId,
          status: 'SUCCESS',
          amountZMW: req.amountZMW,
          method: 'mtn_momo',
          providerReceiptNumber: `MTN-MOMO-${Math.floor(10000000 + Math.random() * 90000000)}`,
          zraTaxInvoiceNumber: `ZRA-INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          vatAmountZMW: vat,
          netRevenueZMW: Number((req.amountZMW - vat).toFixed(2)),
          instructions: `USSD push sent to ${req.customerPhone}. Transaction approved via MTN Mobile Money Zambia wallet.`
        });
      }, 1500);
    });
  }

  /**
   * Airtel Money Zambia (Merchant Pay API simulation)
   */
  public async processAirtelMoneyPayment(req: PaymentInitiationRequest): Promise<PaymentTransactionResult> {
    const vat = Number((req.amountZMW * 0.16).toFixed(2));
    const txId = `AIRTEL-ZM-${Date.now()}`;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transactionId: txId,
          referenceId: req.referenceId,
          status: 'SUCCESS',
          amountZMW: req.amountZMW,
          method: 'airtel_money',
          providerReceiptNumber: `ATL-AIRTEL-${Math.floor(10000000 + Math.random() * 90000000)}`,
          zraTaxInvoiceNumber: `ZRA-INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          vatAmountZMW: vat,
          netRevenueZMW: Number((req.amountZMW - vat).toFixed(2)),
          instructions: `USSD prompt confirmed on ${req.customerPhone}. Instant authorization received from Airtel Money Zambia.`
        });
      }, 1500);
    });
  }

  /**
   * Bank Card Payment (Visa, Mastercard, 3D Secure / Cybersource / DPO gateway simulation)
   */
  public async processCardPayment(req: PaymentInitiationRequest): Promise<PaymentTransactionResult> {
    const vat = Number((req.amountZMW * 0.16).toFixed(2));
    const txId = `CARD-ZM-${Date.now()}`;
    const maskedCard = req.cardNumber ? `•••• ${req.cardNumber.replace(/\s+/g, '').slice(-4)}` : '•••• 8821';

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transactionId: txId,
          referenceId: req.referenceId,
          status: 'SUCCESS',
          amountZMW: req.amountZMW,
          method: 'card',
          providerReceiptNumber: `VISA-MC-${Math.floor(10000000 + Math.random() * 90000000)}`,
          zraTaxInvoiceNumber: `ZRA-INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          vatAmountZMW: vat,
          netRevenueZMW: Number((req.amountZMW - vat).toFixed(2)),
          instructions: `Authorized via Visa/Mastercard 3D Secure (${maskedCard}). Verified by Bank of Zambia clearing switch.`
        });
      }, 1400);
    });
  }
}
