/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AppDataPayload,
  BusinessProfile,
  Lead,
  LeadStatus,
  Quote,
  QuoteStatus,
} from './types';
import {
  loadAppData,
  saveAppData,
  resetToDemoData,
  clearAllStorage,
} from './utils/storage';
import { Navbar, NavTab } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DashboardView } from './components/DashboardView';
import { LeadsView } from './components/LeadsView';
import { LeadModal } from './components/LeadModal';
import { QuotesView } from './components/QuotesView';
import { QuoteModal } from './components/QuoteModal';
import { QuotePrintPreview } from './components/QuotePrintPreview';
import { FollowUpAssistantView } from './components/FollowUpAssistantView';
import { ReportsView } from './components/ReportsView';
import { SettingsDataView } from './components/SettingsDataView';

export default function App() {
  const [appData, setAppData] = useState<AppDataPayload>(() => loadAppData());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteToEdit, setQuoteToEdit] = useState<Quote | null>(null);
  const [quoteInitialLead, setQuoteInitialLead] = useState<Lead | null>(null);

  const [quotePrintPreview, setQuotePrintPreview] = useState<Quote | null>(null);
  const [followUpInitialLeadId, setFollowUpInitialLeadId] = useState<string | null>(null);

  // Confirmation dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync state changes to storage
  const updateAppData = useCallback((updater: (prev: AppDataPayload) => AppDataPayload) => {
    setAppData((prev) => {
      const updated = updater(prev);
      saveAppData(updated);
      return updated;
    });
  }, []);

  // --- Lead Handlers ---
  const handleSaveLead = (lead: Lead) => {
    updateAppData((prev) => {
      const exists = prev.leads.some((l) => l.id === lead.id);
      const leads = exists
        ? prev.leads.map((l) => (l.id === lead.id ? lead : l))
        : [lead, ...prev.leads];
      return { ...prev, leads };
    });
    setIsLeadModalOpen(false);
    setLeadToEdit(null);
    showToast(
      leadToEdit ? 'Lead Updated' : 'Lead Created',
      `${lead.contactName} saved successfully.`
    );
  };

  const handleDeleteLead = (lead: Lead) => {
    setConfirmConfig({
      isOpen: true,
      title: `Delete lead for ${lead.contactName}?`,
      message:
        'This will permanently delete this lead from your pipeline. Any linked quotes will remain available.',
      confirmLabel: 'Delete Lead',
      isDestructive: true,
      onConfirm: () => {
        updateAppData((prev) => ({
          ...prev,
          leads: prev.leads.filter((l) => l.id !== lead.id),
        }));
        setConfirmConfig(null);
        showToast('Lead Deleted', `${lead.contactName} was removed.`, 'info');
      },
    });
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    updateAppData((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => {
        if (l.id === leadId) {
          const actualWonRevenue =
            newStatus === 'won' ? l.actualWonRevenue ?? l.estimatedValue : l.actualWonRevenue;
          return { ...l, status: newStatus, actualWonRevenue };
        }
        return l;
      }),
    }));
    showToast('Status Updated', 'Lead status changed successfully.');
  };

  const handleUpdateLeadFollowUp = (leadId: string, nextDate: string, newStatus?: LeadStatus) => {
    updateAppData((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            nextFollowUpDate: nextDate,
            status: newStatus || l.status,
          };
        }
        return l;
      }),
    }));
  };

  // --- Quote Handlers ---
  const handleSaveQuote = (quote: Quote) => {
    updateAppData((prev) => {
      const exists = prev.quotes.some((q) => q.id === quote.id);
      const quotes = exists
        ? prev.quotes.map((q) => (q.id === quote.id ? quote : q))
        : [quote, ...prev.quotes];

      // If linked to lead, link lead's quoteId and set status to quote_sent if currently new/contacted
      let leads = prev.leads;
      if (quote.leadId) {
        leads = prev.leads.map((l) => {
          if (l.id === quote.leadId) {
            const shouldAdvanceStatus = l.status === 'new' || l.status === 'contacted';
            return {
              ...l,
              quoteId: quote.id,
              status: shouldAdvanceStatus ? 'quote_sent' : l.status,
            };
          }
          return l;
        });
      }

      return { ...prev, quotes, leads };
    });

    setIsQuoteModalOpen(false);
    setQuoteToEdit(null);
    setQuoteInitialLead(null);
    showToast(
      quoteToEdit ? 'Quote Updated' : 'Quote Created',
      `Quote ${quote.quoteNumber} saved.`
    );
  };

  const handleDeleteQuote = (quote: Quote) => {
    setConfirmConfig({
      isOpen: true,
      title: `Delete quote ${quote.quoteNumber}?`,
      message: `Are you sure you want to delete this quote for ${quote.customerName}? This action cannot be undone.`,
      confirmLabel: 'Delete Quote',
      isDestructive: true,
      onConfirm: () => {
        updateAppData((prev) => ({
          ...prev,
          quotes: prev.quotes.filter((q) => q.id !== quote.id),
        }));
        setConfirmConfig(null);
        showToast('Quote Deleted', `Quote ${quote.quoteNumber} was removed.`, 'info');
      },
    });
  };

  const handleUpdateQuoteStatus = (quoteId: string, status: QuoteStatus) => {
    updateAppData((prev) => {
      const targetQuote = prev.quotes.find((q) => q.id === quoteId);
      const quotes = prev.quotes.map((q) => (q.id === quoteId ? { ...q, status } : q));

      // If quote is accepted, also mark linked lead as won
      let leads = prev.leads;
      if (targetQuote?.leadId && status === 'accepted') {
        leads = prev.leads.map((l) =>
          l.id === targetQuote.leadId
            ? { ...l, status: 'won', actualWonRevenue: targetQuote.total }
            : l
        );
      }

      return { ...prev, quotes, leads };
    });
    showToast('Quote Updated', `Quote marked as ${status}.`);
  };

  // --- Shortcut Actions ---
  const handleStartFollowUpForLead = (lead: Lead) => {
    setFollowUpInitialLeadId(lead.id);
    setCurrentTab('followups');
  };

  const handleCreateQuoteForLead = (lead: Lead) => {
    setQuoteInitialLead(lead);
    setQuoteToEdit(null);
    setIsQuoteModalOpen(true);
  };

  const handleFollowUpOnQuote = (quote: Quote) => {
    // If quote is linked to lead, jump to that lead in follow-up assistant
    const linked = appData.leads.find(
      (l) => l.id === quote.leadId || l.contactName.toLowerCase() === quote.customerName.toLowerCase()
    );
    if (linked) {
      setFollowUpInitialLeadId(linked.id);
    }
    setCurrentTab('followups');
  };

  // --- Profile & Data Management ---
  const handleUpdateProfile = (updatedProfile: BusinessProfile) => {
    updateAppData((prev) => ({ ...prev, profile: updatedProfile }));
  };

  const handleRestoreDemo = () => {
    const demo = resetToDemoData();
    setAppData(demo);
  };

  const handleClearAllData = () => {
    const blank = clearAllStorage();
    setAppData(blank);
  };

  const handleImportData = (incoming: AppDataPayload, mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      saveAppData(incoming);
      setAppData(incoming);
    } else {
      updateAppData((prev) => {
        const mergedLeads = [...prev.leads];
        incoming.leads.forEach((inLead) => {
          if (!mergedLeads.some((l) => l.id === inLead.id)) {
            mergedLeads.push(inLead);
          }
        });

        const mergedQuotes = [...prev.quotes];
        incoming.quotes.forEach((inQuote) => {
          if (!mergedQuotes.some((q) => q.id === inQuote.id)) {
            mergedQuotes.push(inQuote);
          }
        });

        return {
          ...prev,
          leads: mergedLeads,
          quotes: mergedQuotes,
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Bar Contract */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewLead={() => {
          setLeadToEdit(null);
          setIsLeadModalOpen(true);
        }}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            leads={appData.leads}
            quotes={appData.quotes}
            profile={appData.profile}
            onNavigateToLeads={() => setCurrentTab('leads')}
            onNavigateToQuotes={() => setCurrentTab('quotes')}
            onNavigateToFollowUps={(leadId) => {
              if (leadId) setFollowUpInitialLeadId(leadId);
              setCurrentTab('followups');
            }}
            onOpenCreateLead={() => {
              setLeadToEdit(null);
              setIsLeadModalOpen(true);
            }}
            onOpenCreateQuote={() => {
              setQuoteToEdit(null);
              setQuoteInitialLead(null);
              setIsQuoteModalOpen(true);
            }}
          />
        )}

        {currentTab === 'leads' && (
          <LeadsView
            leads={appData.leads}
            currencySymbol={appData.profile.currencySymbol}
            onOpenCreate={() => {
              setLeadToEdit(null);
              setIsLeadModalOpen(true);
            }}
            onOpenEdit={(lead) => {
              setLeadToEdit(lead);
              setIsLeadModalOpen(true);
            }}
            onDeleteLead={handleDeleteLead}
            onUpdateStatus={handleUpdateLeadStatus}
            onStartFollowUp={handleStartFollowUpForLead}
            onCreateQuoteForLead={handleCreateQuoteForLead}
          />
        )}

        {currentTab === 'quotes' && (
          <QuotesView
            quotes={appData.quotes}
            leads={appData.leads}
            profile={appData.profile}
            onOpenCreate={() => {
              setQuoteToEdit(null);
              setQuoteInitialLead(null);
              setIsQuoteModalOpen(true);
            }}
            onOpenEdit={(quote) => {
              setQuoteToEdit(quote);
              setQuoteInitialLead(null);
              setIsQuoteModalOpen(true);
            }}
            onDeleteQuote={handleDeleteQuote}
            onUpdateStatus={handleUpdateQuoteStatus}
            onPrintPreview={(quote) => setQuotePrintPreview(quote)}
            onFollowUpOnQuote={handleFollowUpOnQuote}
          />
        )}

        {currentTab === 'followups' && (
          <FollowUpAssistantView
            leads={appData.leads}
            quotes={appData.quotes}
            profile={appData.profile}
            initialLeadId={followUpInitialLeadId}
            onUpdateLeadFollowUp={handleUpdateLeadFollowUp}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            leads={appData.leads}
            quotes={appData.quotes}
            profile={appData.profile}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsDataView
            profile={appData.profile}
            appData={appData}
            onUpdateProfile={handleUpdateProfile}
            onRestoreDemo={handleRestoreDemo}
            onClearAllData={handleClearAllData}
            onImportData={handleImportData}
            onShowToast={showToast}
            onRequestConfirm={(config) => setConfirmConfig({ ...config, isOpen: true })}
          />
        )}
      </main>

      {/* Modals */}
      <LeadModal
        isOpen={isLeadModalOpen}
        leadToEdit={leadToEdit}
        currencySymbol={appData.profile.currencySymbol}
        onClose={() => {
          setIsLeadModalOpen(false);
          setLeadToEdit(null);
        }}
        onSave={handleSaveLead}
      />

      <QuoteModal
        isOpen={isQuoteModalOpen}
        quoteToEdit={quoteToEdit}
        initialLead={quoteInitialLead}
        leads={appData.leads}
        profile={appData.profile}
        existingQuotesCount={appData.quotes.length}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setQuoteToEdit(null);
          setQuoteInitialLead(null);
        }}
        onSave={handleSaveQuote}
      />

      {quotePrintPreview && (
        <QuotePrintPreview
          quote={quotePrintPreview}
          profile={appData.profile}
          onClose={() => setQuotePrintPreview(null)}
        />
      )}

      {confirmConfig && (
        <ConfirmDialog
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          isDestructive={confirmConfig.isDestructive}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
