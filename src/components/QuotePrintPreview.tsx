import React from 'react';
import { X, Printer, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import { Quote, BusinessProfile } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface QuotePrintPreviewProps {
  quote: Quote;
  profile: BusinessProfile;
  onClose: () => void;
}

export const QuotePrintPreview: React.FC<QuotePrintPreviewProps> = ({
  quote,
  profile,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const discountAmount = (quote.subtotal * (quote.discountPercent || 0)) / 100;
  const taxableBase = Math.max(0, quote.subtotal - discountAmount);
  const taxAmount = (taxableBase * (quote.taxPercent || 0)) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-4xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-4 sm:my-8 print:shadow-none print:border-none print:m-0 print:rounded-none">
        {/* Screen Toolbar (hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Document Preview
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {quote.quoteNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print or Save to PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 sm:p-12 print-area bg-white text-slate-900">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {profile.businessName || 'Service Provider'}
              </h1>
              {profile.ownerName && (
                <p className="text-sm text-slate-600 mt-1 font-medium">{profile.ownerName}</p>
              )}
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                {profile.address && <p>{profile.address}</p>}
                {profile.phone && <p>{profile.phone}</p>}
                {profile.email && <p>{profile.email}</p>}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Service Estimate
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {quote.quoteNumber}
              </div>
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <p>
                  <span className="text-slate-400">Date Issued:</span>{' '}
                  <span className="font-mono tabular-nums font-medium">{formatDate(quote.issueDate)}</span>
                </p>
                <p>
                  <span className="text-slate-400">Valid Until:</span>{' '}
                  <span className="font-mono tabular-nums font-medium">{formatDate(quote.validUntilDate)}</span>
                </p>
                <p>
                  <span className="text-slate-400">Status:</span>{' '}
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-800">
                    {quote.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Client Recipient Details */}
          <div className="py-6 border-b border-slate-200">
            <span className="text-xs font-bold tracking-wider uppercase text-slate-400 block mb-2">
              Prepared For:
            </span>
            <div className="text-sm">
              <h2 className="text-base font-semibold text-slate-900">{quote.customerName}</h2>
              {quote.customerAddress && (
                <p className="text-slate-600 mt-0.5">{quote.customerAddress}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                {quote.customerPhone && (
                  <span className="font-mono tabular-nums">Tel: {quote.customerPhone}</span>
                )}
                {quote.customerEmail && <span>Email: {quote.customerEmail}</span>}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-2">Description</th>
                  <th className="py-3 px-2 w-20 text-center">Quantity</th>
                  <th className="py-3 px-2 w-28 text-right">Unit Price</th>
                  <th className="py-3 px-2 w-28 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {quote.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3.5 px-2">
                      <p className="font-medium text-slate-900">{item.description}</p>
                    </td>
                    <td className="py-3.5 px-2 text-center font-mono tabular-nums text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono tabular-nums text-slate-600">
                      {formatCurrency(item.unitPrice, profile.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatCurrency(item.total, profile.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary / Totals */}
          <div className="flex flex-col sm:flex-row justify-end pt-4 pb-8 border-b border-slate-200">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {formatCurrency(quote.subtotal, profile.currencySymbol)}
                </span>
              </div>

              {quote.discountPercent > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount ({quote.discountPercent}%)</span>
                  <span className="font-mono tabular-nums text-rose-600">
                    -{formatCurrency(discountAmount, profile.currencySymbol)}
                  </span>
                </div>
              )}

              {quote.taxPercent > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({quote.taxPercent}%)</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    +{formatCurrency(taxAmount, profile.currencySymbol)}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-bold text-slate-900">
                <span>Total Amount Due</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(quote.total, profile.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes, Terms & Disclaimer */}
          <div className="pt-6 space-y-4 print-break-inside-avoid">
            {quote.notes && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Scope Notes & Payment Terms
                </span>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 print:bg-transparent p-3.5 rounded-lg border border-slate-200 print:border-none print:p-0">
                  {quote.notes}
                </p>
              </div>
            )}

            <div className="text-[11px] text-slate-400 leading-normal pt-2 border-t border-slate-100">
              <p>
                <strong>Estimate Terms:</strong> Pricing based on visible conditions upon date of quote. 
                Any structural anomalies, hidden water damage, or unforeseen scope adjustments will be discussed with the customer prior to continuation. 
                This document is a service quotation and not a final invoice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
