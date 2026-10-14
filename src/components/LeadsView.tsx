import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  FileCheck,
  Edit2,
  Trash2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Lead, LeadStatus, ServiceType, LeadSource } from '../types';
import { formatCurrency, formatDate, isOverdue, isDueToday, getWhatsAppUrl } from '../utils/formatters';

interface LeadsViewProps {
  leads: Lead[];
  currencySymbol: string;
  onOpenCreate: () => void;
  onOpenEdit: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
  onStartFollowUp: (lead: Lead) => void;
  onCreateQuoteForLead: (lead: Lead) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  currencySymbol,
  onOpenCreate,
  onOpenEdit,
  onDeleteLead,
  onUpdateStatus,
  onStartFollowUp,
  onCreateQuoteForLead,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'followup' | 'value' | 'created'>('followup');

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = lead.contactName.toLowerCase().includes(query);
        const matchesProperty = lead.businessOrProperty.toLowerCase().includes(query);
        const matchesPhone = lead.phone.toLowerCase().includes(query);
        const matchesEmail = lead.email.toLowerCase().includes(query);
        const matchesNotes = lead.notes.toLowerCase().includes(query);
        if (!matchesName && !matchesProperty && !matchesPhone && !matchesEmail && !matchesNotes) {
          return false;
        }
      }

      if (statusFilter !== 'all' && lead.status !== statusFilter) {
        return false;
      }

      if (serviceFilter !== 'all' && lead.serviceType !== serviceFilter) {
        return false;
      }

      if (sourceFilter !== 'all' && lead.leadSource !== sourceFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'followup') {
        return a.nextFollowUpDate.localeCompare(b.nextFollowUpDate);
      }
      if (sortBy === 'value') {
        return b.estimatedValue - a.estimatedValue;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [leads, searchQuery, statusFilter, serviceFilter, sourceFilter, sortBy]);

  const statusLabel = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'New Inquiry';
      case 'contacted':
        return 'Contacted';
      case 'quote_sent':
        return 'Quote Sent';
      case 'followup_due':
        return 'Follow-Up Due';
      case 'won':
        return 'Won';
      case 'lost':
        return 'Lost';
      default:
        return status;
    }
  };

  const statusColorClass = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'contacted':
        return 'text-slate-700 bg-slate-100 border-slate-200';
      case 'quote_sent':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'followup_due':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'won':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'lost':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads & Inquiries</h1>
          <p className="text-sm text-slate-600 mt-1">
            Organize prospective jobs, track pipeline statuses, and never lose follow-up momentum.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, property address, phone, email..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Segmented/Select Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="new">New Inquiry</option>
              <option value="contacted">Contacted</option>
              <option value="quote_sent">Quote Sent</option>
              <option value="followup_due">Follow-Up Due</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-slate-700"
            >
              <option value="all">All Services</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Painting">Painting</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Garden Maintenance">Garden Maintenance</option>
              <option value="Electrical">Electrical</option>
              <option value="Handyman">Handyman</option>
              <option value="Roofing">Roofing</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-slate-700"
            >
              <option value="followup">Sort: Follow-up Date</option>
              <option value="value">Sort: Highest Value</option>
              <option value="created">Sort: Recently Added</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span>Showing {filteredLeads.length} of {leads.length} leads</span>
            {(statusFilter !== 'all' || serviceFilter !== 'all' || searchQuery) && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setServiceFilter('all');
                    setSourceFilter('all');
                  }}
                  className="text-slate-700 hover:text-slate-900 underline font-medium cursor-pointer"
                >
                  Reset filters
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leads Table Container */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No leads found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || serviceFilter !== 'all'
              ? 'Try adjusting your search terms or filters to find what you are looking for.'
              : 'Start logging inquiries to track your sales pipeline and schedule follow-ups.'}
          </p>
          <div className="mt-5">
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Lead</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Contact & Property</th>
                  <th className="py-3 px-4">Service & Source</th>
                  <th className="py-3 px-4 text-right">Estimated Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Next Follow-Up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  const overdue = isOverdue(lead.nextFollowUpDate);
                  const dueToday = isDueToday(lead.nextFollowUpDate);

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Contact & Property */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-900">{lead.contactName}</div>
                        {lead.businessOrProperty && (
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {lead.businessOrProperty}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                          {lead.phone && (
                            <span className="flex items-center gap-1 font-mono tabular-nums">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {lead.phone}
                            </span>
                          )}
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[140px]">{lead.email}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Service & Source - Unboxed metadata */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="text-slate-900 font-medium">{lead.serviceType}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>{lead.leadSource}</span>
                          <span aria-hidden="true">·</span>
                          <span>Added {formatDate(lead.createdAt)}</span>
                        </div>
                        {lead.notes && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                            "{lead.notes}"
                          </div>
                        )}
                      </td>

                      {/* Estimated Value */}
                      <td className="py-3.5 px-4 align-top text-right font-mono tabular-nums">
                        <div className="font-semibold text-slate-900">
                          {formatCurrency(lead.estimatedValue, currencySymbol)}
                        </div>
                        {lead.status === 'won' && lead.actualWonRevenue !== undefined && (
                          <div className="text-xs text-emerald-700 font-medium mt-0.5">
                            Won: {formatCurrency(lead.actualWonRevenue, currencySymbol)}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top">
                        <select
                          value={lead.status}
                          onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md border cursor-pointer focus:outline-hidden ${statusColorClass(
                            lead.status
                          )}`}
                        >
                          <option value="new">New Inquiry</option>
                          <option value="contacted">Contacted</option>
                          <option value="quote_sent">Quote Sent</option>
                          <option value="followup_due">Follow-Up Due</option>
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>

                      {/* Next Follow-Up */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-mono tabular-nums text-slate-700">
                            {formatDate(lead.nextFollowUpDate)}
                          </span>
                        </div>
                        {overdue && lead.status !== 'won' && lead.status !== 'lost' && (
                          <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">
                            Overdue
                          </span>
                        )}
                        {dueToday && lead.status !== 'won' && lead.status !== 'lost' && (
                          <span className="text-[11px] font-semibold text-amber-600 block mt-0.5">
                            Due Today
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Follow up button */}
                          <button
                            onClick={() => onStartFollowUp(lead)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Generate follow-up message"
                            aria-label={`Follow up with ${lead.contactName}`}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Quote button */}
                          <button
                            onClick={() => onCreateQuoteForLead(lead)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Create quote for this lead"
                            aria-label={`Create quote for ${lead.contactName}`}
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onOpenEdit(lead)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit lead details"
                            aria-label={`Edit ${lead.contactName}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteLead(lead)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete lead"
                            aria-label={`Delete ${lead.contactName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
