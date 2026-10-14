import { FollowUpTemplate, FollowUpTemplateKey, Lead, Quote, BusinessProfile } from '../types';
import { formatCurrency } from './formatters';

export const DEFAULT_TEMPLATES: Record<FollowUpTemplateKey, FollowUpTemplate> = {
  first_touch: {
    key: 'first_touch',
    label: 'First Follow-Up (Quick Response)',
    description: 'Send shortly after receiving an inquiry to confirm details and lock in a consultation or site visit.',
    subject: 'Following up on your {serviceType} inquiry — {businessName}',
    body: `Hi {customerName},

Thank you for reaching out to {businessName} regarding your {serviceType} project!

I wanted to quickly check in and confirm if you would like me to stop by for a quick assessment or if you have any photos/details you can share so I can prepare an accurate estimate for you.

Looking forward to helping you with this!

Best regards,
{ownerName}
{businessName}
{businessPhone}`,
  },
  friendly_reminder: {
    key: 'friendly_reminder',
    label: 'Friendly Reminder (2–3 Days Post-Contact)',
    description: 'A polite check-in for leads who haven’t replied to the initial conversation.',
    subject: 'Checking in regarding your {serviceType} project — {businessName}',
    body: `Hi {customerName},

Just following up on our recent chat about your {serviceType} project. 

I know things get busy, so I wanted to make sure you have everything you need or if you have any questions about scheduling and availability for this upcoming week.

Feel free to reply here or give me a call whenever convenient.

Warm regards,
{ownerName}
{businessName}`,
  },
  quote_followup: {
    key: 'quote_followup',
    label: 'Quote Follow-Up (Feedback & Adjustments)',
    description: 'Checking in on a sent quote to answer questions, adjust scope, or confirm approval.',
    subject: 'Your {serviceType} estimate {quoteNumber} — {businessName}',
    body: `Hi {customerName},

I hope you’re having a great week!

I’m checking in to see if you had a chance to review the quote ({quoteNumber}) for your {serviceType} work ({quoteTotal}).

Do you have any questions regarding the itemized breakdown or materials? If you’d like to adjust any part of the scope or get on our schedule before dates fill up, just let me know!

Best regards,
{ownerName}
{businessName}
{businessPhone}`,
  },
  final_checkin: {
    key: 'final_checkin',
    label: 'Final Check-In (Polite Closing Loop)',
    description: 'A low-pressure, courteous message before archiving an unresponsive lead.',
    subject: 'Status of your {serviceType} project — {businessName}',
    body: `Hi {customerName},

I’m following up one final time regarding your {serviceType} project. 

If your plans have shifted or you’ve decided to put the project on hold for now, no worries at all! Just wanted to close the loop so I don’t keep bothering you with reminders.

If you ever need us down the road, our door is always open.

Thanks again,
{ownerName}
{businessName}`,
  },
  won_welcome: {
    key: 'won_welcome',
    label: 'Won / Booking Confirmation',
    description: 'Celebrate winning the job and provide clear next steps for commencement.',
    subject: 'Booking Confirmed! Next steps for your {serviceType} project — {businessName}',
    body: `Hi {customerName},

We’re thrilled to work with you on your {serviceType} project!

Your project has been confirmed. We’ll be in touch shortly to finalize the start date, arrival time, and any preparatory details for {businessOrProperty}.

If you need anything in the meantime, feel free to contact me directly.

Thank you for choosing {businessName}!

Best regards,
{ownerName}
{businessPhone}`,
  },
};

export function renderTemplate(
  template: FollowUpTemplate,
  lead: Lead,
  profile: BusinessProfile,
  quote?: Quote
): { subject: string; body: string } {
  const quoteTotalStr = quote
    ? formatCurrency(quote.total, profile.currencySymbol)
    : formatCurrency(lead.estimatedValue, profile.currencySymbol);

  const replacements: Record<string, string> = {
    '{customerName}': lead.contactName || 'there',
    '{serviceType}': lead.serviceType || 'service',
    '{businessName}': profile.businessName || 'Our Team',
    '{ownerName}': profile.ownerName || 'The Team',
    '{businessPhone}': profile.phone || '',
    '{businessOrProperty}': lead.businessOrProperty || 'your property',
    '{quoteNumber}': quote?.quoteNumber || 'estimate',
    '{quoteTotal}': quoteTotalStr,
  };

  let renderedSubject = template.subject;
  let renderedBody = template.body;

  Object.entries(replacements).forEach(([key, value]) => {
    renderedSubject = renderedSubject.split(key).join(value);
    renderedBody = renderedBody.split(key).join(value);
  });

  return {
    subject: renderedSubject,
    body: renderedBody,
  };
}
