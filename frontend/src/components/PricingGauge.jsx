import React from 'react';
import { ShieldCheck, TrendingUp, Info, Volume2, Coins, ArrowRight, Award } from 'lucide-react';
import { getTranslation, speakInLanguage } from '../utils/i18n';

export default function PricingGauge({
  pricingData,
  finalPrice,
  onFinalPriceChange,
  preferredLang = 'hi'
}) {
  const t = getTranslation(preferredLang);

  if (!pricingData || !pricingData.breakdown) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 text-center text-stone-500">
        {preferredLang === 'hi'
          ? 'मूल्य गणना के लिए कृपया सामग्री व दिनों का विवरण भरें'
          : 'Please speak or enter craft details to compute fair wage pricing'}
      </div>
    );
  }

  const { breakdown, cost_floor, fair_trade_price, market_ceiling, explanation_en, explanation_hi, gi_tagged } = pricingData;
  const currentPrice = finalPrice || fair_trade_price;

  const minAllowed = cost_floor;
  const maxAllowed = market_ceiling || (cost_floor * 2.8);

  const profitOverFloor = Math.max(0, currentPrice - cost_floor);
  const profitPercentage = Math.round((profitOverFloor / cost_floor) * 100);

  const speakExplanation = () => {
    const textToSpeak = preferredLang === 'hi' ? explanation_hi : (preferredLang === 'en' ? explanation_en : `${t.step3Title}. ${t.fairTradePrice} ₹${fair_trade_price}. ${t.netProfit} ₹${profitOverFloor}.`);
    speakInLanguage(textToSpeak, preferredLang);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg">
              {t.step3Title}
            </h3>
            <p className="text-xs text-stone-500">
              {t.step3Subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={speakExplanation}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition shadow-sm"
          title="Explain price breakdown aloud"
        >
          <Volume2 className="w-4 h-4 text-emerald-700" />
          <span>{t.audioHelp}</span>
        </button>
      </div>

      {/* Cost Floor Visual Stack */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
        {/* Raw Materials */}
        <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200">
          <p className="text-[11px] font-bold text-blue-800">
            {t.rawMaterials}
          </p>
          <p className="text-base font-black text-blue-900 mt-1">₹{breakdown.raw_material_cost.toLocaleString()}</p>
          <p className="text-[10px] text-blue-600 mt-0.5 font-medium">{preferredLang === 'hi' ? 'प्रमाणित लागत' : 'Input Cost'}</p>
        </div>

        {/* Skilled Labor */}
        <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200">
          <p className="text-[11px] font-bold text-amber-800">
            {t.skilledLabor}
          </p>
          <p className="text-base font-black text-amber-900 mt-1">₹{breakdown.labor_cost.toLocaleString()}</p>
          <p className="text-[10px] text-amber-600 mt-0.5 font-medium">
            ₹{breakdown.notified_daily_wage}/day × {breakdown.total_labor_hours / 8}d
          </p>
        </div>

        {/* Guaranteed Margin */}
        <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200">
          <p className="text-[11px] font-bold text-emerald-800">
            {t.artisanMargin}
          </p>
          <p className="text-base font-black text-emerald-900 mt-1">₹{breakdown.fair_trade_margin_amount.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">{preferredLang === 'hi' ? 'सुरक्षित मुनाफा' : 'Fair Livelihood'}</p>
        </div>
      </div>

      {/* Summary Card with Guaranteed Badge */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center justify-between shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3 h-3" />
            {t.costFloor}
          </span>
          <p className="text-xs text-stone-600 font-medium">
            {t.fairTradePrice}
          </p>
          <p className="text-2xl font-black text-stone-900">
            ₹{fair_trade_price.toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-stone-500 font-medium block">
            {t.marketCeiling}
          </span>
          <span className="text-sm font-black text-stone-700">₹{Math.round(market_ceiling).toLocaleString()}</span>
          {gi_tagged && (
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              <Award className="w-3 h-3" /> GI Tag
            </span>
          )}
        </div>
      </div>

      {/* Interactive Price Selector Slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="price-slider" className="text-sm font-black text-stone-800">
            {t.setPrice}
          </label>
          <span className="text-lg font-black text-amber-700">₹{Math.round(currentPrice).toLocaleString()}</span>
        </div>

        <input
          id="price-slider"
          type="range"
          min={minAllowed}
          max={maxAllowed}
          step={50}
          value={currentPrice}
          onChange={(e) => onFinalPriceChange(Number(e.target.value))}
          className="w-full h-3 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
        />

        <div className="flex justify-between text-[11px] text-stone-500 mt-1">
          <span>₹{Math.round(minAllowed).toLocaleString()} (Floor)</span>
          <span className="font-bold text-emerald-700">₹{Math.round(fair_trade_price).toLocaleString()} (Fair Trade)</span>
          <span>₹{Math.round(maxAllowed).toLocaleString()} (Market Max)</span>
        </div>
      </div>

      {/* Net Profit Callout */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-700" />
          <span className="text-stone-700 font-bold">
            {t.netProfit}
          </span>
        </div>
        <span className="font-black text-emerald-800 text-sm">
          +₹{Math.round(profitOverFloor).toLocaleString()} ({profitPercentage}%)
        </span>
      </div>
    </div>
  );
}
