/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Persist every change. (Saving inside a state updater is a side effect React may run twice.)
  const saveWarned = useRef(false);
  useEffect(() => {
    const ok = saveAppData(appData);
    if (!ok && !saveWarned.current) {
      saveWarned.current = true;
      showToast(
        'Could not save on this device',
        'Browser storage is full or blocked. Export a backup from Settings so you do not lose your data.',
        'error'
      );
    }
  }, [appData, showToast]);

  const updateAppData = useCallback((updater: (prev: AppDataPayload) => AppDataPayload) => {
    setAppData((prev) => updater(prev));
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
          if (l.id !== quote.leadId) return l;
          if (quote.status === 'accepted') {
            // Accepted quote = won job (keeps a revenue figure the user already typed in).
            const alreadyWon = l.status === 'won' && l.actualWonRevenue !== undefined;
            return {
              ...l,
              quoteId: quote.id,
              status: 'won' as LeadStatus,
              actualWonRevenue: alreadyWon ? l.actualWonRevenue : quote.total,
            };
          }
          const shouldAdvanceStatus = l.status === 'new' || l.status === 'contacted';
          return {
            ...l,
            quoteId: quote.id,
            status: (shouldAdvanceStatus ? 'quote_sent' : l.status) as LeadStatus,
          };
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
          leads: prev.leads.map((l) => (l.quoteId === quote.id ? { ...l, quoteId: undefined } : l)),
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

  const handleStartFresh = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Start with your own data?',
      message:
        'This removes the sample leads and quotes so you can enter your real business. Nothing you have not added yourself is kept.',
      confirmLabel: 'Remove samples',
      isDestructive: false,
      onConfirm: () => {
        handleClearAllData();
        setConfirmConfig(null);
        setCurrentTab('settings');
        showToast('Ready for your data', 'Fill in your business details, then add your first lead.', 'success');
      },
    });
  };

  const handleImportData = (incoming: AppDataPayload, requestedMode: 'replace' | 'merge') => {
    // Merging a backup into the built-in sample records would keep the fake ones, so replace instead.
    const mode = appData.isDemo ? 'replace' : requestedMode;
    if (mode === 'replace') {
      setAppData({ ...incoming, isDemo: false });
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
          isDemo: false,
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
      <main
        className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${
          quotePrintPreview ? 'no-print' : ''
        }`}
      >
        {currentTab === 'dashboard' && (
          <DashboardView
            leads={appData.leads}
            quotes={appData.quotes}
            profile={appData.profile}
            isDemo={!!appData.isDemo}
            onStartFresh={handleStartFresh}
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
            defaultCountryCode={appData.profile.defaultCountryCode}
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
            onRequestConfirm={(config) =>
              setConfirmConfig({
                ...config,
                isOpen: true,
                onConfirm: () => {
                  setConfirmConfig(null);
                  config.onConfirm();
                },
              })
            }
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
        existingQuoteNumbers={appData.quotes.map((q) => q.quoteNumber)}
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
