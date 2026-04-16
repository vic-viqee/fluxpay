export const VAT_RATE = 16;

export interface VatCalculation {
  amount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

export const calculateVat = (amount: number, rate: number = VAT_RATE): VatCalculation => {
  const vatAmount = Math.round((amount * rate) / 100);
  const total = amount + vatAmount;
  
  return {
    amount,
    vatRate: rate,
    vatAmount,
    total,
  };
};

export const removeVat = (total: number, rate: number = VAT_RATE): VatCalculation => {
  const amount = Math.round((total * 100) / (100 + rate));
  const vatAmount = total - amount;
  
  return {
    amount,
    vatRate: rate,
    vatAmount,
    total,
  };
};

export const isValidVatRate = (rate: number): boolean => {
  return rate >= 0 && rate <= 100;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
};

export const generateInvoiceNumber = (sequence: number): string => {
  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(5, '0');
  return `INV-${year}-${seq}`;
};

export const parseInvoiceNumber = (invoiceNumber: string): { year: number; sequence: number } | null => {
  const match = invoiceNumber.match(/^INV-(\d{4})-(\d+)$/);
  if (!match) return null;
  
  return {
    year: parseInt(match[1], 10),
    sequence: parseInt(match[2], 10),
  };
};