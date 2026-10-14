export function formatCurrency(amount: number, symbol: string = '$'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0.00`;
  }
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function isOverdue(dateString: string): boolean {
  if (!dateString) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    return target.getTime() < today.getTime();
  } catch {
    return false;
  }
}

export function isDueToday(dateString: string): boolean {
  if (!dateString) return false;
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const targetStr = dateString.split('T')[0];
    return todayStr === targetStr;
  } catch {
    return false;
  }
}

export function safeDiv(numerator: number, denominator: number): number {
  if (!denominator || isNaN(denominator) || denominator === 0) return 0;
  if (!numerator || isNaN(numerator)) return 0;
  return (numerator / denominator) * 100;
}

/**
 * Sanitizes phone numbers by stripping non-digit characters.
 * Retains leading plus sign if present for international numbers.
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

export function getWhatsAppUrl(phone: string, text: string): string | null {
  const clean = sanitizePhone(phone);
  if (!clean || clean.length < 7) return null;
  // WhatsApp wa.me requires digits only without plus sign or leading zeroes
  const waNumber = clean.replace(/^\+/, '');
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}

export function getMailtoUrl(email: string, subject: string, body: string): string | null {
  if (!email || !email.includes('@')) return null;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
