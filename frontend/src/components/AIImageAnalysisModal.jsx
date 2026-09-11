import React from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  X,
  Award,
  TrendingUp,
  Clock,
  Layers,
  Coins,
  ArrowRight,
  Sliders
} from 'lucide-react';

export default function AIImageAnalysisModal({
  isOpen,
  analysisData,
  processedImageUrl,
  preferredLang = 'hi',
  onConfirm,
  onCustomize,
  onClose
}) {
  if (!isOpen || !analysisData) return null;

  const isHindi = preferredLang === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-500/30 flex flex-col max-h-[92vh]">
        {/* Header with AI Gradient */}
        <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-stone-900 text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
              <BrainCircuit className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {isHindi ? 'स्मार्ट शिल्प व मूल्य विश्लेषण' : 'Smart Craft & Value Analysis'}
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {isHindi ? 'शिल्प पहचान व उचित मूल्य अनुमान' : 'Craft Identified & Fair Cost Estimated'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            {isHindi
              ? 'आपकी फोटो से शिल्प शैली, सामग्री व उचित मूल्य का विश्लेषण किया गया है।'
              : 'We analyzed your craft photo, identified the craft cluster, and estimated fair market value.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Detected Craft Card */}
          <div className="flex gap-4 items-center p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            {processedImageUrl && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-inner shrink-0 bg-stone-200">
                <img
                  src={processedImageUrl}
                  alt="Detected Craft"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-amber-300 font-mono py-0.5">
                  SMART SCAN
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                <span>{analysisData.category}</span>
                <span>•</span>
                <span className="text-amber-800 font-bold">{analysisData.state}</span>
              </div>
              <div className="text-base font-extrabold text-stone-900 truncate mt-0.5">
                {analysisData.craft_cluster}
              </div>
              <div className="text-xs text-stone-600 truncate mt-0.5">
                {analysisData.material}
              </div>

              {/* Confidence Meter */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-24 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.round(analysisData.confidence_score * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-emerald-700">
                  {Math.round(analysisData.confidence_score * 100)}% {isHindi ? 'सटीकता' : 'Match'}
                </span>
              </div>
            </div>
          </div>

          {/* Predicted Valuation & Fair Cost Card */}
          <div className="p-4 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-600/5 rounded-2xl border border-amber-300/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {isHindi ? 'अनुमानित उचित बाज़ार दाम' : 'Predicted Fair Market Price'}
              </span>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                {analysisData.price_elasticity?.split('(')[0]?.trim() || 'Fair Trade'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-stone-900">
                ₹{Number(analysisData.predicted_fair_price).toLocaleString()}
              </span>
              <span className="text-xs text-stone-500">
                ({isHindi ? 'लागत तल' : 'Cost Floor'}: ₹{Number(analysisData.cost_floor).toLocaleString()})
              </span>
            </div>

            {/* Extracted Variables Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2 bg-white rounded-xl border border-stone-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">
                    {isHindi ? 'अनुमानित श्रम' : 'Est. Labor'}
                  </div>
                  <div className="font-bold text-stone-800">
                    {analysisData.estimated_production_days} {isHindi ? 'दिन' : 'Days'}
                  </div>
                </div>
              </div>

              <div className="p-2 bg-white rounded-xl border border-stone-200 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">
                    {isHindi ? 'कच्चा माल' : 'Raw Material'}
                  </div>
                  <div className="font-bold text-stone-800">
                    ₹{Number(analysisData.estimated_raw_material_cost).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Signatures Tags */}
          {analysisData.visual_signatures && analysisData.visual_signatures.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                {isHindi ? 'पहचाने गए शिल्प हस्ताक्षर' : 'Detected Visual Signatures'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysisData.visual_signatures.map((sig, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg border border-stone-200"
                  >
                    ✓ {sig}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* User Confirmation Prompt Question */}
          <div className="p-3 bg-stone-100/70 rounded-xl border border-stone-200 text-center">
            <p className="text-xs font-semibold text-stone-800">
              {isHindi
                ? 'क्या यह आपके उत्पाद व अनुमानित लागत से मेल खाता है?'
                : 'Does this match your handcraft and estimated cost?'}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition transform active:scale-95 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isHindi ? 'हाँ, यह सही है (स्वीकार करें)' : 'Yes, Accept & Apply'}</span>
          </button>

          <button
            type="button"
            onClick={onCustomize}
            className="py-3 px-4 bg-white hover:bg-stone-100 text-stone-700 font-semibold rounded-xl border border-stone-300 flex items-center justify-center gap-1.5 transition text-sm"
          >
            <Sliders className="w-4 h-4 text-stone-500" />
            <span>{isHindi ? 'विवरण बदलें' : 'Customize'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
