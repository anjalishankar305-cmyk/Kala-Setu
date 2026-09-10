import React, { useState, useEffect } from 'react';
import {
  Store,
  ShieldCheck,
  Share2,
  Filter,
  RefreshCw,
  Copy,
  Download,
  Check,
  X,
  Code2,
  TrendingUp,
  Award,
  Sparkles,
  QrCode
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import DigitalStorefrontModal from '../components/DigitalStorefrontModal';
import ArtisanCertificateModal from '../components/ArtisanCertificateModal';
import { catalogService } from '../services/api';
import { getTranslation } from '../utils/i18n';

export default function CatalogDashboard({ preferredLang = 'hi', onOpenWizard, currentArtisan }) {
  const t = getTranslation(preferredLang);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCraft, setSelectedCraft] = useState('All');
  const [inspectModalData, setInspectModalData] = useState(null);
  const [storefrontProduct, setStorefrontProduct] = useState(null);
  const [certificateProduct, setCertificateProduct] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await catalogService.listProducts();
      setProducts(data);
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleSync = async (productId) => {
    try {
      await catalogService.toggleOndcSync(productId);
      fetchProducts();
    } catch (err) {
      console.error('Toggle sync error:', err);
    }
  };

  const handleInspectOndc = async (product) => {
    try {
      const exportData = await catalogService.getOndcExport(product.id);
      setInspectModalData({ product, exportData });
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Metrics computation
  const totalValue = products.reduce((sum, p) => sum + (p.final_price || 0), 0);
  const totalDays = products.reduce((sum, p) => sum + (p.production_days || 0), 0);
  const totalLaborHours = totalDays * 8;
  const ondcLiveCount = products.filter((p) => p.ondc_synced).length;

  // Distinct craft filters
  const craftFilters = ['All', 'Ikat', 'Madhubani', 'Dhokra', 'Wood', 'Silk'];

  const filteredProducts = products.filter((p) => {
    if (selectedCraft === 'All') return true;
    return (
      p.craft_technique?.toLowerCase().includes(selectedCraft.toLowerCase()) ||
      p.material?.toLowerCase().includes(selectedCraft.toLowerCase())
    );
  });

  return (
    <div className="pb-16 max-w-6xl mx-auto">
      {/* Top Impact Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {t.totalValue}
          </span>
          <p className="text-2xl font-black text-stone-900 mt-1">₹{totalValue.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1">Direct to Artisan Bank</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {t.wageHours}
          </span>
          <p className="text-2xl font-black text-amber-800 mt-1">{totalLaborHours} hrs</p>
          <span className="text-[10px] text-amber-700 font-bold mt-1">State Wage Floor Anchored</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {t.ondcLiveCount}
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{ondcLiveCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1">Discoverable Across India</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {t.safetyMargin}
          </span>
          <p className="text-2xl font-black text-purple-700 mt-1">25.0%</p>
          <span className="text-[10px] text-purple-600 font-bold mt-1">Anti-Exploitation Guarantee</span>
        </div>
      </div>

      {/* Filter & Quick Utilities Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-stone-400 mr-1" />
          {craftFilters.map((craft) => (
            <button
              key={craft}
              type="button"
              onClick={() => setSelectedCraft(craft)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCraft === craft
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {craft === 'All' && t.allCrafts}
              {craft === 'Ikat' && 'Pochampally Ikat'}
              {craft === 'Madhubani' && 'Madhubani'}
              {craft === 'Dhokra' && 'Dhokra Metal'}
              {craft === 'Wood' && 'Channapatna'}
              {craft === 'Silk' && 'Mysore Silk'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Visiting Card Generator Button */}
          <button
            type="button"
            onClick={() => setStorefrontProduct(products[0] || null)}
            className="min-h-[40px] px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
            title="Generate Digital Storefront"
          >
            <Store className="w-4 h-4 text-emerald-700" />
            <span>{t.digitalCard}</span>
          </button>

          <button
            type="button"
            onClick={fetchProducts}
            className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onOpenWizard}
            className="min-h-[40px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow transition"
          >
            + {preferredLang === 'hi' ? 'नया उत्पाद जोड़ें' : 'Catalog New Item'}
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-500 text-sm">
            {preferredLang === 'hi' ? 'कैटलॉग लोड हो रहा है...' : 'Loading verified artisan catalog...'}
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
          <Store className="w-12 h-12 text-stone-400 mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-bold text-stone-800">
            {preferredLang === 'hi' ? 'कोई उत्पाद नहीं मिला' : 'No Products Found'}
          </h4>
          <p className="text-xs text-stone-500 mt-1 mb-4">
            {preferredLang === 'hi'
              ? 'इस शिल्प श्रेणी में अभी कोई उत्पाद नहीं है।'
              : 'There are no listings matching this filter.'}
          </p>
          <button
            type="button"
            onClick={onOpenWizard}
            className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs"
          >
            {preferredLang === 'hi' ? 'पहला उत्पाद बनाएं' : 'Create First Listing'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              preferredLang={preferredLang}
              onInspectOndc={handleInspectOndc}
              onToggleSync={handleToggleSync}
              onOpenStorefront={(p) => setStorefrontProduct(p)}
              onOpenCertificate={(p) => setCertificateProduct(p)}
            />
          ))}
        </div>
      )}

      {/* ONDC Beckn Protocol & Schema.org Export Inspector Modal */}
      {inspectModalData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-300 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">
                    ONDC Beckn Retail Protocol & Schema.org Export
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    Item ID: KALA-ITEM-{String(inspectModalData.product.id).padStart(6, '0')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectModalData(null)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with JSON-LD viewer */}
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-stone-900 text-emerald-400 leading-relaxed">
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(inspectModalData.exportData, null, 2)}
              </pre>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
              <span className="text-xs text-stone-500 font-sans">
                Standard: Beckn Retail v1.2.0 & Schema.org/Product
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(inspectModalData.exportData, null, 2))}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 font-sans text-xs font-bold hover:bg-stone-100 flex items-center gap-1.5 shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadJson(
                      inspectModalData.exportData,
                      `beckn_item_${inspectModalData.product.id}.json`
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-sans text-xs font-black hover:bg-amber-700 flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON-LD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Storefront Modal */}
      {storefrontProduct && (
        <DigitalStorefrontModal
          artisan={storefrontProduct.artisan || currentArtisan}
          product={storefrontProduct}
          preferredLang={preferredLang}
          onClose={() => setStorefrontProduct(null)}
        />
      )}

      {/* Authenticity Certificate Modal */}
      {certificateProduct && (
        <ArtisanCertificateModal
          product={certificateProduct}
          preferredLang={preferredLang}
          onClose={() => setCertificateProduct(null)}
        />
      )}
    </div>
  );
}
