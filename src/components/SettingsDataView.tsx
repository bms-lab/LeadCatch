import React, { useState, useRef } from 'react';
import {
  Building2,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Save,
  DollarSign,
  FileText,
  Archive,
} from 'lucide-react';
import { BusinessProfile, AppDataPayload } from '../types';
import { LeadCatchLogo, LeadCatchIcon } from './Logo';
import {
  exportAppDataAsFile,
  validateImportPayload,
  resetToDemoData,
  clearAllStorage,
} from '../utils/storage';
import { triggerZipDownload } from '../utils/downloadHelper';

interface SettingsDataViewProps {
  profile: BusinessProfile;
  appData: AppDataPayload;
  onUpdateProfile: (updated: BusinessProfile) => void;
  onRestoreDemo: () => void;
  onClearAllData: () => void;
  onImportData: (data: AppDataPayload, mode: 'replace' | 'merge') => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  onRequestConfirm: (config: {
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'CAD', symbol: '$', label: 'Canadian Dollar (CAD $)' },
  { code: 'AUD', symbol: '$', label: 'Australian Dollar (AUD $)' },
];

export const SettingsDataView: React.FC<SettingsDataViewProps> = ({
  profile,
  appData,
  onUpdateProfile,
  onRestoreDemo,
  onClearAllData,
  onImportData,
  onShowToast,
  onRequestConfirm,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>({ ...profile });
  const [importPendingPayload, setImportPendingPayload] = useState<AppDataPayload | null>(null);
  const [importStats, setImportStats] = useState<{ leads: number; quotes: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileFieldChange = (field: keyof BusinessProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
    setFormData((prev) => ({
      ...prev,
      currency: found.code,
      currencySymbol: found.symbol,
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    onShowToast('Settings saved', 'Business details and quote defaults have been updated.', 'success');
  };

  const handleExport = () => {
    exportAppDataAsFile(appData);
    onShowToast(
      'Export downloaded',
      `Saved ${appData.leads.length} leads and ${appData.quotes.length} quotes to JSON.`,
      'success'
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateImportPayload(content);

      if (!result.valid || !result.data) {
        onShowToast('Import Failed', result.error || 'Invalid backup structure.', 'error');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setImportPendingPayload(result.data);
      setImportStats({
        leads: result.data.leads.length,
        quotes: result.data.quotes.length,
      });
      onShowToast(
        'Backup validated',
        `File contains ${result.data.leads.length} leads and ${result.data.quotes.length} quotes. Choose merge or replace below.`,
        'info'
      );
    };

    reader.onerror = () => {
      onShowToast('File read error', 'Unable to read the chosen JSON file.', 'error');
    };

    reader.readAsText(file);
  };

  const handleApplyImport = (mode: 'replace' | 'merge') => {
    if (!importPendingPayload) return;

    const actionText = mode === 'replace' ? 'overwrite your existing records' : 'merge records alongside existing data';

    onRequestConfirm({
      title: mode === 'replace' ? 'Replace All Current Records?' : 'Merge Records with Current Data?',
      message: `This will ${actionText} using the backup file (${importStats?.leads} leads, ${importStats?.quotes} quotes).`,
      confirmLabel: mode === 'replace' ? 'Replace Data' : 'Merge Data',
      isDestructive: mode === 'replace',
      onConfirm: () => {
        onImportData(importPendingPayload, mode);
        setImportPendingPayload(null);
        setImportStats(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onShowToast(
          'Import successful',
          `Successfully ${mode === 'replace' ? 'restored' : 'merged'} data from backup file.`,
          'success'
        );
      },
    });
  };

  const handleRestoreDemoClick = () => {
    onRequestConfirm({
      title: 'Restore Realistic Demo Records?',
      message:
        'This will populate your database with sample home-service leads (cleaning, painting, plumbing, garden care) and itemized quotes for testing.',
      confirmLabel: 'Restore Demo Data',
      isDestructive: false,
      onConfirm: () => {
        onRestoreDemo();
        onShowToast('Demo data restored', 'Loaded 7 home-service leads and 3 itemized quotes.', 'success');
      },
    });
  };

  const handleClearAllClick = () => {
    onRequestConfirm({
      title: 'Delete All Local Records?',
      message:
        'WARNING: This will permanently erase all leads, quotes, and custom business details stored in this browser. Please export a JSON backup first if you want to keep your data.',
      confirmLabel: 'Erase Everything',
      isDestructive: true,
      onConfirm: () => {
        onClearAllData();
        onShowToast('Storage cleared', 'All local leads and quotes have been removed.', 'info');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings & Local Data Management
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Customize your business information, default quote terms, and manage your local data backups.
        </p>
      </div>

      {/* Storage Architecture Advisory */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold text-slate-900 mb-0.5">
            Zero-Cost Browser Storage Architecture ($0 Budget MVP)
          </p>
          LeadCatch stores all your records inside your browser’s secure{' '}
          <code>localStorage</code>. Data does <strong>not</strong> synchronize across separate devices automatically. 
          Clearing browser cache or cookies can erase local records, so we strongly recommend using the{' '}
          <strong>Export Backup (JSON)</strong> feature below to maintain periodic backups of your customer files.
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Business Profile & Quote Defaults (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Business Profile & Quote Defaults</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Information printed on quotes and used in follow-up templates.
              </p>
            </div>
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleProfileFieldChange('businessName', e.target.value)}
                  placeholder="e.g. Summit Craft Home Services"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Owner / Contact Person
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleProfileFieldChange('ownerName', e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
                  placeholder="e.g. +1 (555) 234-8901"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                  placeholder="e.g. contact@myservicebiz.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office / Mailing Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleProfileFieldChange('address', e.target.value)}
                placeholder="e.g. 1420 Heritage Way, Denver, CO 80202"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.defaultTaxRate}
                  onChange={(e) => handleProfileFieldChange('defaultTaxRate', Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.0"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Quote Terms & Warranty Notes
              </label>
              <textarea
                rows={3}
                value={formData.quoteTerms}
                onChange={(e) => handleProfileFieldChange('quoteTerms', e.target.value)}
                placeholder="Standard payment terms, valid turnaround period, workmanship guarantee..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Backup, Import & Reset (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Export & Import Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Backup & Data Portability</h2>
            <p className="text-xs text-slate-500">
              Download your data as a clean JSON backup file or import records from a previous save.
            </p>

            <div className="space-y-3 pt-1">
              {/* Project Source ZIP Download */}
              <a
                href="/leadcatch-project.zip"
                download="leadcatch-project.zip"
                onClick={(e) => {
                  e.preventDefault();
                  triggerZipDownload();
                }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-left group shadow-xs"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-[#B7F34A]" />
                    <span>Download Project ZIP (Ready for GitHub & Vercel)</span>
                  </div>
                  <span className="text-[11px] text-slate-300 block mt-0.5">
                    Complete production-ready source code bundle (excludes node_modules)
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#B7F34A] shrink-0 ml-2">
                  .ZIP (94 KB)
                </span>
              </a>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExport}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-slate-700" />
                    Export Data (JSON)
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Save {appData.leads.length} leads & {appData.quotes.length} quotes to disk
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                  Download
                </span>
              </button>

              {/* Import Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-slate-700" />
                    Import Backup (JSON)
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Select a validated .json file exported from LeadCatch
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                />

                {/* Import Confirmation Buttons if file is staged */}
                {importPendingPayload && importStats && (
                  <div className="p-3 bg-white border border-indigo-200 rounded-lg space-y-2 mt-2 animate-in fade-in">
                    <p className="text-xs font-semibold text-slate-900">
                      File loaded: {importStats.leads} leads, {importStats.quotes} quotes.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyImport('replace')}
                        className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        Replace All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyImport('merge')}
                        className="flex-1 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors cursor-pointer"
                      >
                        Merge
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LeadCatch Official Brand & Logo Assets */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Brand & Logo Assets</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official high-resolution geometric marks and vector assets.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <LeadCatchLogo size="lg" />
                <div className="flex items-center gap-2">
                  <a
                    href="/logo-icon.svg"
                    download="leadcatch-icon.svg"
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Icon (SVG)
                  </a>
                  <a
                    href="/logo-horizontal.svg"
                    download="leadcatch-logo.svg"
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Logo (SVG)
                  </a>
                </div>
              </div>

              {/* Brand Palette Swatches */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                <div className="p-1.5 rounded bg-slate-900 text-white">
                  <div className="w-full h-3 rounded bg-[#111827] mb-1"></div>
                  <span>#111827</span>
                </div>
                <div className="p-1.5 rounded bg-slate-100 text-slate-900 border border-slate-200">
                  <div className="w-full h-3 rounded bg-[#B7F34A] mb-1 border border-slate-300"></div>
                  <span>#B7F34A</span>
                </div>
                <div className="p-1.5 rounded bg-slate-100 text-slate-900 border border-slate-200">
                  <div className="w-full h-3 rounded bg-white mb-1 border border-slate-300"></div>
                  <span>#FFFFFF</span>
                </div>
                <div className="p-1.5 rounded bg-slate-100 text-slate-900 border border-slate-200">
                  <div className="w-full h-3 rounded bg-[#64748B] mb-1"></div>
                  <span>#64748B</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Data & Danger Zone */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Maintenance & Reset</h2>

            <div className="space-y-3">
              {/* Restore Demo */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                    Restore Sample Records
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Reset to clean demo data (cleaning, painting, plumbing)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRestoreDemoClick}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  Restore Demo
                </button>
              </div>

              {/* Erase All */}
              <div className="flex items-center justify-between p-3.5 bg-rose-50/50 border border-rose-200 rounded-lg">
                <div>
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    Delete Local Data
                  </div>
                  <span className="text-[11px] text-rose-700 block mt-0.5">
                    Wipes leads, quotes, and resets storage
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAllClick}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
                >
                  Clear Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
