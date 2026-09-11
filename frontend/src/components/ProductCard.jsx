import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Share2,
  Eye,
  Award,
  CheckCircle2,
  Clock,
  Store,
  FileCheck
} from 'lucide-react';
import { getTranslation, speakInLanguage } from '../utils/i18n';
import { getAssetUrl } from '../services/api';

export default function ProductCard({
  product,
  onInspectOndc,
  onToggleSync,
  onOpenStorefront,
  onOpenCertificate,
  preferredLang = 'hi'
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const t = getTranslation(preferredLang);

  const title = preferredLang === 'hi' ? product.title_hi : product.title_en;
  const description = preferredLang === 'hi' ? product.description_hi : product.description_en;
  const rawImage = product.processed_image_path || product.raw_image_path || '/uploads/processed/sample_ikat_studio.jpg';
  const imageSrc = getAssetUrl(rawImage);

  const speakProductDetails = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const narration = preferredLang === 'hi'
      ? `${product.title_hi}। कारीगरी: ${product.craft_technique}। सामग्री: ${product.material}। बनाने में लगे ${product.production_days} दिन। उचित बिक्री मूल्य: ${product.final_price} रुपये।`
      : `${product.title_en}. Craft technique: ${product.craft_technique}. Material: ${product.material}. Production time: ${product.production_days} days. Fair selling price: ${product.final_price} rupees.`;

    setIsSpeaking(true);
    speakInLanguage(narration, preferredLang);
    setTimeout(() => setIsSpeaking(false), 5000);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-stone-50 overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-contain p-3 transition duration-300 hover:scale-105"
        />

        {/* Sync Status Badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {product.ondc_synced ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              <span>ONDC LIVE</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-stone-800/80 text-stone-200 backdrop-blur">
              <Clock className="w-3 h-3" />
              <span>DRAFT</span>
            </span>
          )}

          {/* Quick Certificate Icon Trigger */}
          {onOpenCertificate && (
            <button
              type="button"
              onClick={() => onOpenCertificate(product)}
              className="p-1.5 rounded-full bg-white/90 backdrop-blur text-amber-800 hover:bg-amber-100 shadow border border-amber-200"
              title="View Authenticity Certificate"
            >
              <Award className="w-4 h-4 text-amber-700" />
            </button>
          )}
        </div>

        {/* Pehchan ID & GI Badge */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-amber-100/95 text-amber-900 backdrop-blur border border-amber-300/70 shadow-sm">
            <Award className="w-3 h-3 text-amber-700" />
            <span>Pehchan #{product.artisan?.pehchan_id || 'VERIFIED'}</span>
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="font-bold text-stone-900 text-base leading-snug line-clamp-2">
              {title}
            </h4>
            <button
              type="button"
              onClick={speakProductDetails}
              className={`p-2 rounded-full border transition flex-shrink-0 ${
                isSpeaking
                  ? 'bg-red-50 text-red-600 border-red-300'
                  : 'bg-stone-50 text-stone-700 hover:bg-amber-50 hover:text-amber-800 border-stone-200'
              }`}
              title="Audio readout"
              aria-label="Audio readout"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2.5">
            <span className="font-medium text-stone-700">{product.craft_technique}</span>
            <span>•</span>
            <span>{product.production_days} {preferredLang === 'hi' ? 'दिन' : 'days'}</span>
          </div>

          <p className="text-xs text-stone-600 line-clamp-3 mb-3 bg-stone-50 p-2.5 rounded-xl border border-stone-150 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                {t.fairTradePrice}
              </span>
              <span className="text-2xl font-black text-stone-900">
                ₹{product.final_price?.toLocaleString() || product.suggested_price?.toLocaleString()}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-emerald-700 font-bold block">
                {t.fairWageCertified}
              </span>
              <span className="text-xs font-medium text-stone-500">
                Floor: ₹{product.suggested_price?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onInspectOndc(product)}
                className="flex-1 min-h-[44px] py-2 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 text-stone-600" />
                <span>{t.inspectJson}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSync(product.id)}
                className={`min-h-[44px] py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm ${
                  product.ondc_synced
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{product.ondc_synced ? t.unsync : t.publish}</span>
              </button>
            </div>

            {/* Direct WhatsApp Storefront Share Button */}
            {onOpenStorefront && (
              <button
                type="button"
                onClick={() => onOpenStorefront(product)}
                className="w-full min-h-[40px] py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{preferredLang === 'hi' ? 'व्हाट्सएप / विज़िटिंग कार्ड साझा करें' : 'Share Storefront & WhatsApp'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
