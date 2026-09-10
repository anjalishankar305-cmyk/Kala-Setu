import React, { useState } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Award,
  Phone,
  Store,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function DigitalStorefrontModal({ artisan, product, onClose, preferredLang = 'hi' }) {
  const [copied, setCopied] = useState(false);
  const t = getTranslation(preferredLang);

  const artisanName = artisan?.name || 'Narsimha Chary';
  const craftName = artisan?.craft_type || 'Pochampally Ikat Handloom';
  const state = artisan?.state || 'Telangana';
  const pehchanId = artisan?.pehchan_id || 'P-TEL-WEAV-0924';
  const phone = artisan?.phone || '+91 98480 12345';

  const productTitle = product
    ? (preferredLang === 'hi' ? product.title_hi : product.title_en)
    : `${craftName} Pure Handcrafted Masterpiece`;

  const price = product?.final_price || 5400;

  // WhatsApp formatted share text
  const shareText = `*कलासेतु प्रामाणिक कारीगर कैटलॉग / KalaSetu Artisan Catalog*\n\n` +
    `👤 *कारीगर (Artisan)*: ${artisanName}\n` +
    `📜 *Pehchan ID*: ${pehchanId}\n` +
    `📍 *राज्य (State)*: ${state}\n` +
    `🎨 *शिल्प (Craft)*: ${craftName}\n` +
    `🏷️ *उत्पाद (Item)*: ${productTitle}\n` +
    `💰 *उचित मूल्य (Fair Price)*: ₹${price.toLocaleString()} (Guaranteed State Minimum Wage & Fair Trade)\n` +
    `🌐 *ONDC Store Link*: https://kalasetu.mosje.gov.in/artisan/${pehchanId}\n\n` +
    `_MoSJE सामाजिक न्याय एवं अधिकारिता मंत्रालय द्वारा सत्यापित_`;

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-300 overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold text-sm">
              {preferredLang === 'hi' ? 'कारीगर डिजिटल विज़िटिंग कार्ड' : 'Artisan Digital Storefront Card'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Digital Visiting Card Canvas */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-stone-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-amber-300/40">
            {/* Background Pattern */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            {/* Top Row: MoSJE Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/20">
                <ShieldCheck className="w-3 h-3 text-amber-300" />
                <span>MoSJE KalaSetu Node</span>
              </div>
              <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded text-amber-200">
                {pehchanId}
              </span>
            </div>

            {/* Middle: Artisan Name & Craft */}
            <div className="mb-4">
              <h3 className="text-xl font-black tracking-tight">{artisanName}</h3>
              <p className="text-xs text-amber-200 font-medium">{craftName}</p>
              <p className="text-[11px] text-stone-300 mt-0.5">{state}, India</p>
            </div>

            {/* Bottom Row: QR & Guarantee Seal */}
            <div className="flex items-center justify-between pt-3 border-t border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white p-1 rounded-xl shadow flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-stone-900" />
                </div>
                <div className="text-[10px] leading-tight text-stone-300">
                  <span className="block font-bold text-white">Scan to Buy on ONDC</span>
                  <span>100% Fair Wage Guaranteed</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Contact</span>
                <span className="text-xs font-mono font-bold text-white">{phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 min-h-[46px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition"
          >
            <Share2 className="w-4 h-4" />
            <span>{preferredLang === 'hi' ? 'व्हाट्सएप पर शेयर करें' : 'Share on WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[46px] py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (preferredLang === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : (preferredLang === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
