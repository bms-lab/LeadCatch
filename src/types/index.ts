export type LeadStatus = 'new' | 'contacted' | 'quote_sent' | 'followup_due' | 'won' | 'lost';

export type ServiceType =
  | 'Cleaning'
  | 'Painting'
  | 'Plumbing'
  | 'Garden Maintenance'
  | 'Electrical'
  | 'Handyman'
  | 'Roofing'
  | 'Other';

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'Google Search'
  | 'Social Media'
  | 'Flyer / Van'
  | 'Repeat Customer'
  | 'Other';

export interface Lead {
  id: string;
  contactName: string;
  businessOrProperty: string;
  phone: string;
  email: string;
  serviceType: ServiceType;
  leadSource: LeadSource;
  estimatedValue: number;
  actualWonRevenue?: number;
  status: LeadStatus;
  createdAt: string; // ISO String
  nextFollowUpDate: string; // YYYY-MM-DD
  notes: string;
  quoteId?: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined';

export interface Quote {
  id: string;
  quoteNumber: string;
  leadId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  issueDate: string; // YYYY-MM-DD
  validUntilDate: string; // YYYY-MM-DD
  items: QuoteItem[];
  subtotal: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
  status: QuoteStatus;
  notes: string;
  createdAt: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  defaultTaxRate: number;
  quoteTerms: string;
}

export type FollowUpTemplateKey =
  | 'first_touch'
  | 'friendly_reminder'
  | 'quote_followup'
  | 'final_checkin'
  | 'won_welcome';

export interface FollowUpTemplate {
  key: FollowUpTemplateKey;
  label: string;
  subject: string;
  body: string;
  description: string;
}

export interface AppDataPayload {
  version: number;
  exportedAt: string;
  profile: BusinessProfile;
  leads: Lead[];
  quotes: Quote[];
}
