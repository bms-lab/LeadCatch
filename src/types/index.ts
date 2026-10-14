export type LeadStatus = 'new' | 'contacted' | 'quote_sent' | 'followup_due' | 'won' | 'lost';

export const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New Inquiry' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'followup_due', label: 'Follow-Up Due' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

export const SERVICE_TYPES = [
  'Cleaning',
  'Painting',
  'Plumbing',
  'Electrical',
  'Garden Maintenance',
  'Handyman',
  'Tiling',
  'Carpentry',
  'Masonry',
  'AC & Heating',
  'Roofing',
  'Other',
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const LEAD_SOURCES = [
  'WhatsApp',
  'Phone Call',
  'Referral',
  'Social Media',
  'Website',
  'Google Search',
  'Flyer / Van',
  'Repeat Customer',
  'Other',
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

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
  nextFollowUpDate: string; // YYYY-MM-DD (local calendar day)
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

/** Language used for follow-up messages and the printed quote. */
export type MessageLanguage = 'en' | 'fr' | 'darija';

export const MESSAGE_LANGUAGES: { value: MessageLanguage; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'darija', label: 'Darija (الدارجة)' },
  { value: 'en', label: 'English' },
];

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
  /** International dialling code without "+", used to turn local numbers (06…) into WhatsApp links. */
  defaultCountryCode: string;
  messageLanguage: MessageLanguage;
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
  /** True while the app is showing the built-in sample records. */
  isDemo?: boolean;
}
