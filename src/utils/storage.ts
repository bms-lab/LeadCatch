import { AppDataPayload, BusinessProfile, Lead, Quote } from '../types';
import { DEFAULT_BUSINESS_PROFILE, getInitialDemoData } from './demoData';

const STORAGE_KEY = 'leadcatch_app_data_v1';

export function loadAppData(): AppDataPayload {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDemoData();
      saveAppData(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    const validated = sanitizePayload(parsed);
    return validated;
  } catch (error) {
    console.error('LeadCatch storage load error, resetting to fallback safe state:', error);
    const fallback = getInitialDemoData();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    } catch {
      // Ignore write errors in restricted contexts
    }
    return fallback;
  }
}

export function saveAppData(data: AppDataPayload): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('LeadCatch failed to save to localStorage:', error);
    return false;
  }
}

export function sanitizePayload(raw: any): AppDataPayload {
  const profile: BusinessProfile = {
    businessName: typeof raw?.profile?.businessName === 'string' ? raw.profile.businessName : DEFAULT_BUSINESS_PROFILE.businessName,
    ownerName: typeof raw?.profile?.ownerName === 'string' ? raw.profile.ownerName : DEFAULT_BUSINESS_PROFILE.ownerName,
    email: typeof raw?.profile?.email === 'string' ? raw.profile.email : DEFAULT_BUSINESS_PROFILE.email,
    phone: typeof raw?.profile?.phone === 'string' ? raw.profile.phone : DEFAULT_BUSINESS_PROFILE.phone,
    address: typeof raw?.profile?.address === 'string' ? raw.profile.address : DEFAULT_BUSINESS_PROFILE.address,
    currency: typeof raw?.profile?.currency === 'string' ? raw.profile.currency : DEFAULT_BUSINESS_PROFILE.currency,
    currencySymbol: typeof raw?.profile?.currencySymbol === 'string' ? raw.profile.currencySymbol : DEFAULT_BUSINESS_PROFILE.currencySymbol,
    defaultTaxRate: typeof raw?.profile?.defaultTaxRate === 'number' ? Math.max(0, raw.profile.defaultTaxRate) : DEFAULT_BUSINESS_PROFILE.defaultTaxRate,
    quoteTerms: typeof raw?.profile?.quoteTerms === 'string' ? raw.profile.quoteTerms : DEFAULT_BUSINESS_PROFILE.quoteTerms,
  };

  const leads: Lead[] = Array.isArray(raw?.leads)
    ? raw.leads
        .filter((l: any) => l && typeof l === 'object' && typeof l.contactName === 'string')
        .map((l: any, idx: number) => ({
          id: typeof l.id === 'string' ? l.id : `lead-${Date.now()}-${idx}`,
          contactName: String(l.contactName || 'Unnamed Contact').trim(),
          businessOrProperty: String(l.businessOrProperty || '').trim(),
          phone: String(l.phone || '').trim(),
          email: String(l.email || '').trim(),
          serviceType: l.serviceType || 'Other',
          leadSource: l.leadSource || 'Other',
          estimatedValue: Number(l.estimatedValue) >= 0 ? Number(l.estimatedValue) : 0,
          actualWonRevenue: Number(l.actualWonRevenue) >= 0 ? Number(l.actualWonRevenue) : undefined,
          status: ['new', 'contacted', 'quote_sent', 'followup_due', 'won', 'lost'].includes(l.status)
            ? l.status
            : 'new',
          createdAt: typeof l.createdAt === 'string' ? l.createdAt : new Date().toISOString(),
          nextFollowUpDate: typeof l.nextFollowUpDate === 'string' ? l.nextFollowUpDate : new Date().toISOString().split('T')[0],
          notes: String(l.notes || ''),
          quoteId: typeof l.quoteId === 'string' ? l.quoteId : undefined,
        }))
    : [];

  const quotes: Quote[] = Array.isArray(raw?.quotes)
    ? raw.quotes
        .filter((q: any) => q && typeof q === 'object' && typeof q.quoteNumber === 'string')
        .map((q: any, idx: number) => ({
          id: typeof q.id === 'string' ? q.id : `quote-${Date.now()}-${idx}`,
          quoteNumber: String(q.quoteNumber || `LC-2026-${String(idx + 1).padStart(3, '0')}`),
          leadId: typeof q.leadId === 'string' ? q.leadId : undefined,
          customerName: String(q.customerName || '').trim(),
          customerEmail: String(q.customerEmail || '').trim(),
          customerPhone: String(q.customerPhone || '').trim(),
          customerAddress: String(q.customerAddress || '').trim(),
          issueDate: typeof q.issueDate === 'string' ? q.issueDate : new Date().toISOString().split('T')[0],
          validUntilDate: typeof q.validUntilDate === 'string' ? q.validUntilDate : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          items: Array.isArray(q.items)
            ? q.items.map((item: any, itemIdx: number) => ({
                id: typeof item.id === 'string' ? item.id : `item-${itemIdx}`,
                description: String(item.description || 'Service item'),
                quantity: Math.max(1, Number(item.quantity) || 1),
                unitPrice: Math.max(0, Number(item.unitPrice) || 0),
                total: Math.max(0, (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)),
              }))
            : [],
          subtotal: Number(q.subtotal) >= 0 ? Number(q.subtotal) : 0,
          discountPercent: Math.max(0, Math.min(100, Number(q.discountPercent) || 0)),
          taxPercent: Math.max(0, Number(q.taxPercent) || 0),
          total: Number(q.total) >= 0 ? Number(q.total) : 0,
          status: ['draft', 'sent', 'accepted', 'declined'].includes(q.status) ? q.status : 'draft',
          notes: String(q.notes || ''),
          createdAt: typeof q.createdAt === 'string' ? q.createdAt : new Date().toISOString(),
        }))
    : [];

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    leads,
    quotes,
  };
}

export function validateImportPayload(jsonStr: string): { valid: boolean; error?: string; data?: AppDataPayload } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'File is not a valid JSON object.' };
    }

    if (!Array.isArray(parsed.leads) && !Array.isArray(parsed.quotes)) {
      return { valid: false, error: 'Invalid backup file structure: missing leads or quotes collection.' };
    }

    const sanitized = sanitizePayload(parsed);
    return { valid: true, data: sanitized };
  } catch (err: any) {
    return { valid: false, error: `JSON Parse error: ${err?.message || 'Malformed JSON file'}` };
  }
}

export function exportAppDataAsFile(data: AppDataPayload): void {
  const exportPayload: AppDataPayload = {
    ...data,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  anchor.href = url;
  anchor.download = `leadcatch-backup-${dateStr}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function resetToDemoData(): AppDataPayload {
  const demo = getInitialDemoData();
  saveAppData(demo);
  return demo;
}

export function clearAllStorage(): AppDataPayload {
  const blank: AppDataPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: DEFAULT_BUSINESS_PROFILE,
    leads: [],
    quotes: [],
  };
  saveAppData(blank);
  return blank;
}
