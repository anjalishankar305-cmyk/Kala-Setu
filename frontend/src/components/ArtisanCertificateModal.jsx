import React from 'react';
import { X, Award, ShieldCheck, Printer, CheckCircle2 } from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function ArtisanCertificateModal({ product, onClose, preferredLang = 'hi' }) {
  const t = getTranslation(preferredLang);

  if (!product) return null;

  const artisan = product.artisan || {
    name: 'Narsimha Chary',
    pehchan_id: 'P-TEL-WEAV-0924',
    state: 'Telangana',
    craft_type: product.craft_technique || 'Pochampally Ikat Handloom'
  };

  const title = preferredLang === 'hi' ? product.title_hi : product.title_en;
  const days = product.production_days || 4;
  const finalPrice = product.final_price || 5400;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-300 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold text-sm">
              {preferredLang === 'hi' ? 'प्रामाणिकता एवं उचित मजदूरी प्रमाण पत्र' : 'Artisan Authenticity & Fair Wage Certificate'}
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

        {/* Certificate Body (Parchment Texture Style) */}
        <div className="p-6 sm:p-8 bg-[#FAF6EE] border-8 border-double border-amber-900/30 m-4 rounded-2xl relative text-center">
          {/* Emblem & Watermark */}
          <div className="w-16 h-16 rounded-full bg-amber-800 text-amber-100 flex items-center justify-center mx-auto mb-3 border-2 border-amber-600 shadow-md">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900 block mb-1">
            Government of India • MoSJE & ONDC Initiative
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight font-serif mb-1">
            CERTIFICATE OF AUTHENTICITY
          </h2>
          <p className="text-xs text-amber-900/80 font-medium italic mb-4">
            प्रामाणिक भारतीय हस्तशिल्प एवं हथकरघा धरोहर प्रमाण पत्र
          </p>

          <div className="h-0.5 w-32 bg-amber-800/40 mx-auto mb-4" />

          {/* Core Certification Text */}
          <p className="text-xs text-stone-700 leading-relaxed mb-4">
            This certifies that the product <strong className="text-stone-900 font-bold block mt-1 text-sm">"{title}"</strong>
            was handcrafted through traditional indigenous techniques by registered artisan:
          </p>

          {/* Artisan & Pehchan Details Box */}
          <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-amber-800/20 max-w-sm mx-auto mb-4 text-xs space-y-1 text-left">
            <div className="flex justify-between">
              <span className="text-stone-500">Master Artisan:</span>
              <span className="font-bold text-stone-900">{artisan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Pehchan Card ID:</span>
              <span className="font-mono font-bold text-amber-900">{artisan.pehchan_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Cluster & State:</span>
              <span className="font-medium text-stone-800">{product.craft_technique} ({artisan.state})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Labor Invested:</span>
              <span className="font-medium text-stone-800">{days} Full Artisan Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Wage Compliance:</span>
              <span className="font-bold text-emerald-700">100% Notified State Wage Protected</span>
            </div>
          </div>

          {/* Seal & Verification Badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-amber-950 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Zero Exploitation • Direct Artisan Livelihood Guarantee</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100"
          >
            {preferredLang === 'hi' ? 'बंद करें' : 'Close'}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>{preferredLang === 'hi' ? 'प्रमाण पत्र प्रिंट करें' : 'Print Certificate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
