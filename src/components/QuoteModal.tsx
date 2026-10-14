import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, FileText, User, MapPin, Phone, Mail, Hash } from 'lucide-react';
import { Quote, QuoteItem, Lead, BusinessProfile, QuoteStatus } from '../types';
import { formatCurrency } from '../utils/formatters';

interface QuoteModalProps {
  isOpen: boolean;
  quoteToEdit: Quote | null;
  initialLead?: Lead | null;
  leads: Lead[];
  profile: BusinessProfile;
  existingQuotesCount: number;
  onClose: () => void;
  onSave: (quote: Quote) => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  quoteToEdit,
  initialLead,
  leads,
  profile,
  existingQuotesCount,
  onClose,
  onSave,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [validUntilDate, setValidUntilDate] = useState('');
  const [status, setStatus] = useState<QuoteStatus>('draft');
  const [notes, setNotes] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(profile.defaultTaxRate || 0);

  const [items, setItems] = useState<QuoteItem[]>([
    { id: 'item-1', description: 'Standard Service Labor', quantity: 1, unitPrice: 150, total: 150 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (quoteToEdit) {
      setSelectedLeadId(quoteToEdit.leadId || '');
      setQuoteNumber(quoteToEdit.quoteNumber);
      setCustomerName(quoteToEdit.customerName);
      setCustomerEmail(quoteToEdit.customerEmail);
      setCustomerPhone(quoteToEdit.customerPhone);
      setCustomerAddress(quoteToEdit.customerAddress);
      setIssueDate(quoteToEdit.issueDate);
      setValidUntilDate(quoteToEdit.validUntilDate);
      setStatus(quoteToEdit.status);
      setNotes(quoteToEdit.notes);
      setDiscountPercent(quoteToEdit.discountPercent || 0);
      setTaxPercent(quoteToEdit.taxPercent || 0);
      setItems(
        quoteToEdit.items.length > 0
          ? quoteToEdit.items
          : [{ id: 'item-1', description: '', quantity: 1, unitPrice: 0, total: 0 }]
      );
    } else {
      const today = new Date().toISOString().split('T')[0];
      const validUntil = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const nextNum = `LC-${new Date().getFullYear()}-${String(existingQuotesCount + 1).padStart(3, '0')}`;

      setQuoteNumber(nextNum);
      setIssueDate(today);
      setValidUntilDate(validUntil);
      setStatus('draft');
      setNotes(profile.quoteTerms || '');
      setDiscountPercent(0);
      setTaxPercent(profile.defaultTaxRate || 0);

      if (initialLead) {
        setSelectedLeadId(initialLead.id);
        setCustomerName(initialLead.contactName);
        setCustomerEmail(initialLead.email);
        setCustomerPhone(initialLead.phone);
        setCustomerAddress(initialLead.businessOrProperty);
        setItems([
          {
            id: `item-${Date.now()}`,
            description: `${initialLead.serviceType} Work - Scope per initial inquiry`,
            quantity: 1,
            unitPrice: initialLead.estimatedValue || 200,
            total: initialLead.estimatedValue || 200,
          },
        ]);
      } else {
        setSelectedLeadId('');
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setCustomerAddress('');
        setItems([
          {
            id: `item-${Date.now()}`,
            description: 'Service Scope & Materials',
            quantity: 1,
            unitPrice: 150,
            total: 150,
          },
        ]);
      }
    }
    setErrors({});
  }, [quoteToEdit, initialLead, isOpen, existingQuotesCount, profile]);

  if (!isOpen) return null;

  const handleSelectLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setCustomerName(lead.contactName);
      setCustomerEmail(lead.email);
      setCustomerPhone(lead.phone);
      setCustomerAddress(lead.businessOrProperty);
      if (items.length === 1 && !items[0].description) {
        setItems([
          {
            id: items[0].id,
            description: `${lead.serviceType} Service`,
            quantity: 1,
            unitPrice: lead.estimatedValue || 150,
            total: lead.estimatedValue || 150,
          },
        ]);
      }
    }
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Math.max(0, parseFloat(value) || 0) : item.quantity;
      const u = field === 'unitPrice' ? Math.max(0, parseFloat(value) || 0) : item.unitPrice;
      item.total = q * u;
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const discountAmount = (subtotal * (discountPercent || 0)) / 100;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableBase * (taxPercent || 0)) / 100;
  const grandTotal = taxableBase + taxAmount;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!quoteNumber.trim()) {
      newErrors.quoteNumber = 'Quote number is required.';
    }

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required.';
    }

    if (!issueDate) {
      newErrors.issueDate = 'Issue date is required.';
    }

    if (!validUntilDate) {
      newErrors.validUntilDate = 'Validity date is required.';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one line item is required.';
    } else {
      const hasEmptyDesc = items.some((item) => !item.description.trim());
      if (hasEmptyDesc) {
        newErrors.items = 'All line items must have a description.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const savedQuote: Quote = {
      id: quoteToEdit ? quoteToEdit.id : `quote-${Date.now()}`,
      quoteNumber: quoteNumber.trim(),
      leadId: selectedLeadId || undefined,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      issueDate,
      validUntilDate,
      items,
      subtotal,
      discountPercent: Number(discountPercent) || 0,
      taxPercent: Number(taxPercent) || 0,
      total: grandTotal,
      status,
      notes: notes.trim(),
      createdAt: quoteToEdit ? quoteToEdit.createdAt : new Date().toISOString(),
    };

    onSave(savedQuote);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {quoteToEdit ? 'Edit Service Quote' : 'Create Service Quote'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Itemize tasks, apply optional taxes or discounts, and generate printable estimates.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close quote modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Lead Autofill */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Autofill from existing lead:
            </span>
            <select
              value={selectedLeadId}
              onChange={(e) => handleSelectLeadChange(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-md px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-slate-800"
            >
              <option value="">-- Manual Entry / No Linked Lead --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.contactName} ({l.serviceType}) — {formatCurrency(l.estimatedValue, profile.currencySymbol)}
                </option>
              ))}
            </select>
          </div>

          {/* Quote Meta & Customer Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Quote Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                placeholder="LC-2026-001"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
              />
              {errors.quoteNumber && <p className="text-xs text-rose-600 mt-1">{errors.quoteNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Issue Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Valid Until Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={validUntilDate}
                onChange={(e) => setValidUntilDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden focus:ring-2 ${
                  errors.customerName ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.customerName && <p className="text-xs text-rose-600 mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Customer Address / Location
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="e.g. 442 Oak Valley Dr, Denver CO"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. +1 (555) 849-2104"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. sarah@example.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Itemized Scope & Services
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-slate-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            {errors.items && <p className="text-xs text-rose-600">{errors.items}</p>}

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-28 text-right">Unit Price ({profile.currencySymbol})</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="e.g. Interior paint 2 coats + trim"
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 text-xs text-center border border-slate-200 rounded-md font-mono tabular-nums focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 text-xs text-right border border-slate-200 rounded-md font-mono tabular-nums focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                        />
                      </td>
                      <td className="p-2 text-right font-mono tabular-nums font-semibold text-slate-800">
                        {formatCurrency(item.total, profile.currencySymbol)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-6 pt-2">
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(subtotal, profile.currencySymbol)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 gap-2">
                  <span className="flex items-center gap-1">Discount (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 px-2 py-0.5 text-right border border-slate-200 rounded text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-between text-slate-600 gap-2">
                  <span className="flex items-center gap-1">Tax Rate (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 px-2 py-0.5 text-right border border-slate-200 rounded text-xs font-mono"
                  />
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono tabular-nums text-base">
                    {formatCurrency(grandTotal, profile.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quote Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent to Customer</option>
                <option value="accepted">Accepted / Won</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Notes & Terms (shown on printable quote)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, warranty conditions, or turnaround details..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              {quoteToEdit ? 'Save Changes' : 'Save Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
