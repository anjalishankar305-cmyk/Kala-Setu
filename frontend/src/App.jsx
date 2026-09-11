import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Smartphone,
  Monitor,
  Globe2,
  User,
  ShoppingBag,
  Wand2,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Award,
  Landmark,
  BrainCircuit
} from 'lucide-react';
import WizardPage from './pages/WizardPage';
import CatalogDashboard from './pages/CatalogDashboard';
import LoginPage from './pages/LoginPage';
import SchemesPage from './pages/SchemesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LanguageModal from './components/LanguageModal';
import { catalogService } from './services/api';
import { LANGUAGES, getTranslation } from './utils/i18n';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kalasetu_artisan');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard', 'catalog', or 'schemes'
  const [preferredLang, setPreferredLang] = useState('hi');
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isMobileEmulation, setIsMobileEmulation] = useState(false);
  const [artisans, setArtisans] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [lastAnalyzedCraft, setLastAnalyzedCraft] = useState(null);

  const t = getTranslation(preferredLang);
  const currentLangObj = LANGUAGES.find((l) => l.code === preferredLang) || LANGUAGES[0];

  useEffect(() => {
    async function loadArtisans() {
      try {
        const list = await catalogService.listArtisans();
        if (list && list.length > 0) {
          setArtisans(list);
          if (!currentUser) {
            setSelectedArtisan(list[0]);
          } else {
            const found = list.find((a) => a.id === currentUser.id);
            setSelectedArtisan(found || currentUser);
          }
        }
      } catch (err) {
        console.warn('Could not load artisans list:', err);
      }
    }
    loadArtisans();
  }, [currentUser]);

  const handleLoginSuccess = (artisan) => {
    setCurrentUser(artisan);
    setSelectedArtisan(artisan);
    try {
      localStorage.setItem('kalasetu_artisan', JSON.stringify(artisan));
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('kalasetu_artisan');
    } catch (e) {
      // ignore
    }
  };

  // If user is not logged in, render the Login Page
  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          preferredLang={preferredLang}
          onToggleLang={() => setIsLangModalOpen(true)}
        />
        {isLangModalOpen && (
          <LanguageModal
            currentLang={preferredLang}
            onSelectLanguage={setPreferredLang}
            onClose={() => setIsLangModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between text-stone-900">
      {/* Top Ministry & Platform Header */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & MoSJE Endorsement */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-white text-xl shadow-md">
              क
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>KalaSetu</span>
                  <span className="text-amber-400">|</span>
                  <span className="font-medium text-amber-200">{t.appName}</span>
                </h1>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  MoSJE
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Ministry of Social Justice & Empowerment • Smart Market Linkage
              </p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode: Mobile Viewport Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileEmulation(!isMobileEmulation)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                isMobileEmulation
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
              title="Toggle Mobile Viewport Simulation"
            >
              {isMobileEmulation ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              <span className="hidden md:inline">
                {isMobileEmulation ? t.mobileView : t.desktopView}
              </span>
            </button>

            {/* 12-Language Selector Button */}
            <button
              type="button"
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 text-xs font-bold transition shadow-sm"
              title="Change Language (12 Indian Languages)"
            >
              <Globe2 className="w-4 h-4 text-amber-400" />
              <span>{currentLangObj.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Logged in Artisan Profile Pill */}
            <div className="flex items-center gap-2 bg-stone-800 py-1 px-2.5 rounded-xl border border-stone-700 text-xs">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-[10px]">
                {currentUser.name ? currentUser.name.charAt(0) : 'A'}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="font-bold text-stone-200 block text-[11px] truncate max-w-[110px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {currentUser.pehchan_id || 'VERIFIED'}
                </span>
              </div>
            </div>

            {/* Logout / Switch Artisan Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl border border-stone-700 bg-stone-800 text-stone-300 hover:text-red-400 hover:border-red-500/50 transition"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher (Wizard, Catalog, Welfare Schemes) */}
        <div className="bg-stone-950/60 border-t border-stone-800">
          <div className="max-w-6xl mx-auto px-4 flex gap-6 text-sm font-semibold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('wizard')}
              className={`py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'wizard'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>{t.wizardTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'catalog'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.catalogTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schemes')}
              className={`py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'schemes'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>{t.schemesTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`py-2.5 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'analytics'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{preferredLang === 'hi' ? 'बाज़ार अंतर्दृष्टि व मूल्यांकन' : 'Market Insights & Valuation'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Full or Mobile Frame */}
      <main className="flex-1 py-6 px-4">
        {isMobileEmulation ? (
          /* Mobile Viewport Emulation Container (iPhone 15 Pro Ratio) */
          <div className="max-w-[420px] mx-auto bg-stone-900 p-3 rounded-[44px] shadow-2xl border-4 border-stone-800">
            {/* Phone Notch / Dynamic Island */}
            <div className="w-28 h-4 bg-stone-950 rounded-full mx-auto mb-2" />

            <div className="bg-stone-100 rounded-[34px] overflow-y-auto max-h-[760px] p-3 shadow-inner">
              {activeTab === 'wizard' && (
                <WizardPage
                  onListingCreated={() => setActiveTab('catalog')}
                  preferredLang={preferredLang}
                  currentArtisan={currentUser || selectedArtisan}
                  onCraftAnalyzed={(analysis) => setLastAnalyzedCraft(analysis)}
                />
              )}
              {activeTab === 'catalog' && (
                <CatalogDashboard
                  preferredLang={preferredLang}
                  currentArtisan={currentUser || selectedArtisan}
                  onOpenWizard={() => setActiveTab('wizard')}
                />
              )}
              {activeTab === 'schemes' && (
                <SchemesPage
                  preferredLang={preferredLang}
                  currentArtisan={currentUser || selectedArtisan}
                />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsPage
                  preferredLang={preferredLang}
                  currentArtisan={currentUser || selectedArtisan}
                  analyzedCraft={lastAnalyzedCraft}
                  onCraftAnalyzed={(analysis) => setLastAnalyzedCraft(analysis)}
                />
              )}
            </div>
          </div>
        ) : (
          /* Full Width Responsive View */
          <div className="max-w-6xl mx-auto">
            {activeTab === 'wizard' && (
              <WizardPage
                onListingCreated={() => setActiveTab('catalog')}
                preferredLang={preferredLang}
                currentArtisan={currentUser || selectedArtisan}
                onCraftAnalyzed={(analysis) => setLastAnalyzedCraft(analysis)}
              />
            )}
            {activeTab === 'catalog' && (
              <CatalogDashboard
                preferredLang={preferredLang}
                currentArtisan={currentUser || selectedArtisan}
                onOpenWizard={() => setActiveTab('wizard')}
              />
            )}
            {activeTab === 'schemes' && (
              <SchemesPage
                preferredLang={preferredLang}
                currentArtisan={currentUser || selectedArtisan}
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsPage
                preferredLang={preferredLang}
                currentArtisan={currentUser || selectedArtisan}
                analyzedCraft={lastAnalyzedCraft}
                onCraftAnalyzed={(analysis) => setLastAnalyzedCraft(analysis)}
              />
            )}
          </div>
        )}
      </main>

      {/* Language Selector Modal */}
      {isLangModalOpen && (
        <LanguageModal
          currentLang={preferredLang}
          onSelectLanguage={setPreferredLang}
          onClose={() => setIsLangModalOpen(false)}
        />
      )}

      {/* Footer & Compliance Bar */}
      <footer className="bg-white border-t border-stone-200 py-6 text-stone-600 text-xs mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-bold text-stone-900">
                KalaSetu • Empowering Marginalized Craftspeople
              </p>
              <p className="text-[11px] text-stone-500">
                Aligned with MoSJE Fair Livelihood Directives & ONDC Beckn Protocol v1.2.0 • 12 Indic Languages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-stone-500 text-[11px]">
            <span>Schema.org / Product Certified</span>
            <span>•</span>
            <span>Pehchan Card Verification</span>
            <span>•</span>
            <span>Zero Hallucination Guaranteed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
