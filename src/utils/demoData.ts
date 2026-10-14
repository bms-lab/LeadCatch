import { AppDataPayload, BusinessProfile, Lead, Quote } from '../types';
import { addDaysISO } from './formatters';

/** Empty profile used for a fresh start (nothing pre-filled on the user's quotes). */
export const BLANK_BUSINESS_PROFILE: BusinessProfile = {
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  address: '',
  currency: 'MAD',
  currencySymbol: 'DH',
  defaultTaxRate: 0,
  quoteTerms: '',
  defaultCountryCode: '212',
  messageLanguage: 'fr',
};

/** Profile of the fictional business shown with the sample records. */
export const DEMO_BUSINESS_PROFILE: BusinessProfile = {
  businessName: 'Atlas Services Maison',
  ownerName: 'Youssef El Amrani',
  email: 'contact@atlas-services.example',
  phone: '+212 661-234567',
  address: '12 Rue des Orangers, Maârif, Casablanca',
  currency: 'MAD',
  currencySymbol: 'DH',
  defaultTaxRate: 0,
  quoteTerms:
    'Devis valable 30 jours. Main-d’œuvre et nettoyage de fin de chantier inclus. Acompte de 50 % à la confirmation pour les travaux de plus de 3 000 DH.',
  defaultCountryCode: '212',
  messageLanguage: 'fr',
};

// Kept for backwards compatibility with older imports.
export const DEFAULT_BUSINESS_PROFILE = BLANK_BUSINESS_PROFILE;

const daysAgoISO = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

function buildDemoLeads(): Lead[] {
  return [
    {
      id: 'lead-001',
      contactName: 'Salma Bennani',
      businessOrProperty: 'Villa Les Palmiers, Californie, Casablanca',
      phone: '0661 23 45 67',
      email: 'salma.bennani@example.com',
      serviceType: 'Cleaning',
      leadSource: 'WhatsApp',
      estimatedValue: 900,
      status: 'quote_sent',
      createdAt: daysAgoISO(3),
      nextFollowUpDate: addDaysISO(1),
      notes: 'Requested a deep clean before a family event, plus exterior windows.',
      quoteId: 'quote-001',
    },
    {
      id: 'lead-002',
      contactName: 'Hassan Idrissi',
      businessOrProperty: 'Boulangerie Al Baraka, Rabat',
      phone: '+212 6 62 71 24 43',
      email: 'hassan@albaraka.example',
      serviceType: 'Painting',
      leadSource: 'Referral',
      estimatedValue: 6400,
      status: 'followup_due',
      createdAt: daysAgoISO(6),
      nextFollowUpDate: addDaysISO(-1), // Overdue!
      notes: 'Interior repaint of the shop and counter trim. Must be done over the weekend.',
      quoteId: 'quote-002',
    },
    {
      id: 'lead-003',
      contactName: 'Karim Alaoui',
      businessOrProperty: 'Résidence Al Andalous, Appt 12, Marrakech',
      phone: '0670 90 38 21',
      email: '',
      serviceType: 'Plumbing',
      leadSource: 'Phone Call',
      estimatedValue: 750,
      status: 'contacted',
      createdAt: daysAgoISO(2),
      nextFollowUpDate: addDaysISO(0), // Due today
      notes: 'Pressure regulator is leaking. Needs a visit before Friday.',
    },
    {
      id: 'lead-004',
      contactName: 'Nadia Tazi',
      businessOrProperty: 'Villa Tazi, Souissi, Rabat',
      phone: '0643 81 92 01',
      email: 'nadia.tazi@example.com',
      serviceType: 'Garden Maintenance',
      leadSource: 'Social Media',
      estimatedValue: 2900,
      actualWonRevenue: 2900,
      status: 'won',
      createdAt: daysAgoISO(10),
      nextFollowUpDate: addDaysISO(7),
      notes: 'Seasonal garden refresh, new mulch and irrigation check. Accepted!',
      quoteId: 'quote-003',
    },
    {
      id: 'lead-005',
      contactName: 'Amina Fassi',
      businessOrProperty: 'Cabinet Dr. Fassi, Fès',
      phone: '0632 19 04 22',
      email: 'amina@cabinetfassi.example',
      serviceType: 'Handyman',
      leadSource: 'Referral',
      estimatedValue: 3600,
      status: 'new',
      createdAt: daysAgoISO(1),
      nextFollowUpDate: addDaysISO(0), // Due today
      notes: 'Waiting-room wall repairs, false-ceiling tiles and door thresholds.',
    },
    {
      id: 'lead-006',
      contactName: 'Mehdi Berrada',
      businessOrProperty: 'Riad Berrada, Médina de Marrakech',
      phone: '0660 41 18 80',
      email: 'mehdi@riadberrada.example',
      serviceType: 'Roofing',
      leadSource: 'Other',
      estimatedValue: 9200,
      status: 'lost',
      createdAt: daysAgoISO(14),
      nextFollowUpDate: addDaysISO(-5),
      notes: 'Client chose a larger company with a longer warranty.',
    },
    {
      id: 'lead-007',
      contactName: 'Leila Chraibi',
      businessOrProperty: 'Cabinet Chraibi Avocats, Casablanca',
      phone: '0661 49 23 10',
      email: 'leila@chraibi-avocats.example',
      serviceType: 'Cleaning',
      leadSource: 'Repeat Customer',
      estimatedValue: 1900,
      actualWonRevenue: 1900,
      status: 'won',
      createdAt: daysAgoISO(18),
      nextFollowUpDate: addDaysISO(14),
      notes: 'Monthly office cleaning contract renewed.',
    },
  ];
}

function buildDemoQuotes(): Quote[] {
  return [
    {
      id: 'quote-001',
      quoteNumber: `LC-${new Date().getFullYear()}-001`,
      leadId: 'lead-001',
      customerName: 'Salma Bennani',
      customerEmail: 'salma.bennani@example.com',
      customerPhone: '0661 23 45 67',
      customerAddress: 'Villa Les Palmiers, Californie, Casablanca',
      issueDate: addDaysISO(-3),
      validUntilDate: addDaysISO(27),
      items: [
        {
          id: 'item-101',
          description: 'Deep interior cleaning (villa, 3 floors)',
          quantity: 1,
          unitPrice: 600,
          total: 600,
        },
        {
          id: 'item-102',
          description: 'Exterior window cleaning (per window)',
          quantity: 10,
          unitPrice: 30,
          total: 300,
        },
      ],
      subtotal: 900,
      discountPercent: 0,
      taxPercent: 0,
      total: 900,
      status: 'sent',
      notes: 'Eco-friendly products and vacuum equipment included.',
      createdAt: daysAgoISO(3),
    },
    {
      id: 'quote-002',
      quoteNumber: `LC-${new Date().getFullYear()}-002`,
      leadId: 'lead-002',
      customerName: 'Hassan Idrissi',
      customerEmail: 'hassan@albaraka.example',
      customerPhone: '+212 6 62 71 24 43',
      customerAddress: 'Boulangerie Al Baraka, Avenue Mohammed V, Rabat',
      issueDate: addDaysISO(-5),
      validUntilDate: addDaysISO(25),
      items: [
        {
          id: 'item-201',
          description: 'Surface preparation, degreasing and small repairs',
          quantity: 1,
          unitPrice: 1300,
          total: 1300,
        },
        {
          id: 'item-202',
          description: 'Washable satin paint, 2 coats (per room)',
          quantity: 2,
          unitPrice: 2200,
          total: 4400,
        },
        {
          id: 'item-203',
          description: 'Enamel on trim and mouldings',
          quantity: 1,
          unitPrice: 700,
          total: 700,
        },
      ],
      subtotal: 6400,
      discountPercent: 0,
      taxPercent: 0,
      total: 6400,
      status: 'sent',
      notes: 'Work planned over Saturday evening and Sunday so the bakery keeps running.',
      createdAt: daysAgoISO(5),
    },
    {
      id: 'quote-003',
      quoteNumber: `LC-${new Date().getFullYear()}-003`,
      leadId: 'lead-004',
      customerName: 'Nadia Tazi',
      customerEmail: 'nadia.tazi@example.com',
      customerPhone: '0643 81 92 01',
      customerAddress: 'Villa Tazi, Souissi, Rabat',
      issueDate: addDaysISO(-9),
      validUntilDate: addDaysISO(21),
      items: [
        {
          id: 'item-301',
          description: 'Bed clean-up, edging and pruning',
          quantity: 1,
          unitPrice: 900,
          total: 900,
        },
        {
          id: 'item-302',
          description: 'Mulch delivery and installation (per m³)',
          quantity: 4,
          unitPrice: 300,
          total: 1200,
        },
        {
          id: 'item-303',
          description: 'Irrigation system check and sprinkler adjustment',
          quantity: 1,
          unitPrice: 800,
          total: 800,
        },
      ],
      subtotal: 2900,
      discountPercent: 0,
      taxPercent: 0,
      total: 2900,
      status: 'accepted',
      notes: 'Deposit received. Work scheduled for next Tuesday, weather permitting.',
      createdAt: daysAgoISO(9),
    },
  ];
}

export function getInitialDemoData(): AppDataPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: { ...DEMO_BUSINESS_PROFILE },
    leads: buildDemoLeads(),
    quotes: buildDemoQuotes(),
    isDemo: true,
  };
}

export function getBlankData(): AppDataPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: { ...BLANK_BUSINESS_PROFILE },
    leads: [],
    quotes: [],
    isDemo: false,
  };
}
