import React, { useMemo } from 'react';
import {
  Users,
  FileCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  Send,
  MessageSquare,
  Sparkles,
  Download,
  Archive,
} from 'lucide-react';
import { Lead, Quote, BusinessProfile } from '../types';
import { formatCurrency, formatDate, isOverdue, isDueToday } from '../utils/formatters';
import { triggerZipDownload } from '../utils/downloadHelper';

interface DashboardViewProps {
  leads: Lead[];
  quotes: Quote[];
  profile: BusinessProfile;
  onNavigateToLeads: () => void;
  onNavigateToQuotes: () => void;
  onNavigateToFollowUps: (leadId?: string) => void;
  onOpenCreateLead: () => void;
  onOpenCreateQuote: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  quotes,
  profile,
  onNavigateToLeads,
  onNavigateToQuotes,
  onNavigateToFollowUps,
  onOpenCreateLead,
  onOpenCreateQuote,
}) => {
  // Aggregate Metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const quotesAwaitingResponse = quotes.filter((q) => q.status === 'sent').length;
  const wonOpportunities = leads.filter((l) => l.status === 'won').length;
  const lostOpportunities = leads.filter((l) => l.status === 'lost').length;

  // Revenue distinctions:
  // Estimated Pipeline Value = sum of estimated values of all active leads (not won and not lost)
  const activePipelineValue = useMemo(() => {
    return leads
      .filter((l) => l.status !== 'won' && l.status !== 'lost')
      .reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
  }, [leads]);

  // Actual Won Revenue = sum of actualWonRevenue (or estimatedValue if actual won was not overridden) for won leads
  const actualWonRevenue = useMemo(() => {
    return leads
      .filter((l) => l.status === 'won')
      .reduce((acc, curr) => acc + (curr.actualWonRevenue ?? curr.estimatedValue ?? 0), 0);
  }, [leads]);

  // Upcoming & Overdue follow-ups
  const actionableFollowUps = useMemo(() => {
    return leads
      .filter((l) => l.status !== 'won' && l.status !== 'lost')
      .sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate))
      .slice(0, 6);
  }, [leads]);

  const overdueCount = leads.filter(
    (l) => l.status !== 'won' && l.status !== 'lost' && isOverdue(l.nextFollowUpDate)
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Welcome / Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {profile.ownerName || 'Craftsperson'}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Overview of your current pipeline for <strong className="text-slate-800">{profile.businessName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/leadcatch-project.zip"
            download="leadcatch-project.zip"
            onClick={(e) => {
              e.preventDefault();
              triggerZipDownload();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            title="Download full project source code as ZIP"
          >
            <Download className="w-4 h-4 text-slate-700" />
            <span>Download .ZIP</span>
          </a>
          <button
            onClick={onOpenCreateLead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
          <button
            onClick={onOpenCreateQuote}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <FileCheck className="w-4 h-4 text-slate-600" />
            <span>New Quote</span>
          </button>
        </div>
      </div>

      {/* Direct Project ZIP Download Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-slate-800 text-[#B7F34A] shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                Download Complete Project ZIP (GitHub & Vercel Ready)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-[#B7F34A] font-semibold">
                95 KB
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Contains all React 19 components, vector logo SVGs, Tailwind styles, config files, <code className="text-[#B7F34A]">vercel.json</code>, <code className="text-[#B7F34A]">.gitignore</code>, <code className="text-[#B7F34A]">.env.example</code>, and <code className="text-[#B7F34A]">README.md</code>. Ready to unzip, push to GitHub, and deploy.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <a
            href="/leadcatch-project.zip"
            download="leadcatch-project.zip"
            onClick={(e) => {
              e.preventDefault();
              triggerZipDownload();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-[#B7F34A] hover:bg-[#a6e63a] rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Download Project ZIP</span>
          </a>
        </div>
      </div>

      {/* Overdue Alert Bar if any */}
      {overdueCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-950">
                You have {overdueCount} overdue {overdueCount === 1 ? 'follow-up' : 'follow-ups'}
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Prospective clients convert 60% faster when checked on within 48 hours.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToFollowUps()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-amber-950 bg-amber-200/80 rounded-lg hover:bg-amber-200 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>Review Overdue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Pipeline Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Estimated Pipeline
            </span>
            <span className="text-xs font-medium text-slate-400">Potential</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {formatCurrency(activePipelineValue, profile.currencySymbol)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {leads.filter((l) => l.status !== 'won' && l.status !== 'lost').length} open opportunities
          </p>
        </div>

        {/* Actual Won Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Won Revenue
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Closed
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-2">
            {formatCurrency(actualWonRevenue, profile.currencySymbol)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Actual booked jobs from {wonOpportunities} won deals
          </p>
        </div>

        {/* Quotes Awaiting Response */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quotes Awaiting Reply
            </span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-700 mt-2">
            {quotesAwaitingResponse}
          </div>
          <button
            onClick={onNavigateToQuotes}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-1 flex items-center gap-1 cursor-pointer"
          >
            <span>View outstanding quotes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Total Inquiries & New */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Inquiries
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {totalLeads}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            <strong className="text-blue-700 font-semibold">{newLeads} new</strong> awaiting first contact
          </p>
        </div>
      </div>

      {/* Revenue Distinction Clarification Card */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Financial Metric Clarification
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              <strong>Estimated Pipeline ({formatCurrency(activePipelineValue, profile.currencySymbol)})</strong> represents uncommitted prospective work in conversation. 
              <strong> Realized Won Revenue ({formatCurrency(actualWonRevenue, profile.currencySymbol)})</strong> reflects closed contracts where terms were accepted.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToLeads}
              className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Manage Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Upcoming Follow-ups & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Upcoming & Due Follow-ups */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Upcoming & Due Follow-Ups</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prioritized queue of prospects needing outreach
              </p>
            </div>
            <button
              onClick={() => onNavigateToFollowUps()}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {actionableFollowUps.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active follow-ups scheduled right now.
              </div>
            ) : (
              actionableFollowUps.map((lead) => {
                const overdue = isOverdue(lead.nextFollowUpDate);
                const dueToday = isDueToday(lead.nextFollowUpDate);

                return (
                  <div
                    key={lead.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {lead.contactName}
                        </span>
                        <span className="text-xs text-slate-500 font-normal">
                          · {lead.serviceType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-mono tabular-nums">
                        <span>{formatCurrency(lead.estimatedValue, profile.currencySymbol)}</span>
                        <span>·</span>
                        <span
                          className={`font-medium ${
                            overdue ? 'text-rose-600 font-semibold' : dueToday ? 'text-amber-600 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          {overdue ? 'Overdue: ' : dueToday ? 'Due Today: ' : 'Scheduled: '}
                          {formatDate(lead.nextFollowUpDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onNavigateToFollowUps(lead.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                        aria-label={`Send follow-up to ${lead.contactName}`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Recent Leads Pipeline Snapshot */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Inquiries</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest prospective opportunities logged</p>
            </div>
            <button
              onClick={onNavigateToLeads}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {leads.slice(0, 6).map((lead) => (
              <div
                key={lead.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">
                    {lead.contactName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span>{lead.serviceType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{lead.leadSource}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono tabular-nums font-semibold text-sm text-slate-900">
                    {formatCurrency(lead.estimatedValue, profile.currencySymbol)}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mt-0.5">
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
