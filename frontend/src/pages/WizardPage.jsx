import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Camera,
  Mic,
  Coins,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Send,
  Volume2,
  HelpCircle,
  BrainCircuit,
  Edit3,
  Sliders,
  MapPin,
  Clock
} from 'lucide-react';
import CameraStudio from '../components/CameraStudio';
import AudioRecorder from '../components/AudioRecorder';
import PricingGauge from '../components/PricingGauge';
import AIImageAnalysisModal from '../components/AIImageAnalysisModal';
import { speechService, pricingService, catalogService, mlService } from '../services/api';
import { getTranslation, speakInLanguage } from '../utils/i18n';

export default function WizardPage({ onListingCreated, preferredLang = 'hi', currentArtisan, onCraftAnalyzed }) {
  const [currentStep, setCurrentStep] = useState(1);
  const t = getTranslation(preferredLang);

  // Form & Processing State
  const [photoData, setPhotoData] = useState(null);
  const [voiceData, setVoiceData] = useState(null);
  const [extractedSlots, setExtractedSlots] = useState({
    material: 'Pure Handloom Silk',
    craft_technique: 'Pochampally Ikat Handloom Weaving',
    production_days: 4,
    raw_material_cost: 1600.0,
    state: 'Telangana',
  });
  const [bilingualMetadata, setBilingualMetadata] = useState({
    title_en: 'Authentic Pochampally Ikat Silk Saree',
    title_hi: 'प्रामाणिक पोचमपल्ली इकत सिल्क साड़ी',
    description_en: 'Crafted by master weaver over 4 days with pure handspun silk.',
    description_hi: 'कुशल बुनकर द्वारा 4 दिनों में शुद्ध रेशम से हथकरघे पर निर्मित।',
  });
  const [pricingResult, setPricingResult] = useState(null);
  const [mlEstimate, setMlEstimate] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  // Initial calculation when entering Step 3 or slots change
  useEffect(() => {
    async function updatePricing() {
      try {
        const res = await pricingService.calculatePricing({
          craft_name: extractedSlots.craft_technique,
          state: extractedSlots.state || currentArtisan?.state || 'Telangana',
          production_days: extractedSlots.production_days,
          raw_material_cost: extractedSlots.raw_material_cost,
        });
        setPricingResult(res);
        setFinalPrice(res.recommended_range[1] || res.fair_trade_price);

        // Also query Scikit-Learn ML Market Valuation
        try {
          const mlRes = await mlService.predictPricing({
            craft_cluster: extractedSlots.craft_technique,
            state: extractedSlots.state || currentArtisan?.state || 'Telangana',
            material: extractedSlots.material,
            production_days: Number(extractedSlots.production_days) || 1,
            raw_material_cost: Number(extractedSlots.raw_material_cost) || 0,
            gi_tagged: 1,
            festive_multiplier: 1.25,
          });
          if (mlRes && mlRes.data) {
            setMlEstimate(mlRes.data);
          }
        } catch (mlErr) {
          console.warn('ML price estimate notice:', mlErr);
        }
      } catch (err) {
        console.error('Pricing calculation error:', err);
      }
    }
    if (currentStep === 3 || extractedSlots.craft_technique) {
      updatePricing();
    }
  }, [extractedSlots, currentStep, currentArtisan]);

  const handlePhotoProcessed = (data) => {
    setPhotoData(data);
    if (data?.ai_craft_analysis) {
      setCurrentAnalysis(data.ai_craft_analysis);
      setIsAiModalOpen(true);
      if (onCraftAnalyzed) {
        onCraftAnalyzed({
          ...data.ai_craft_analysis,
          imageUrl: data.processed_image_url || data.raw_image_url,
        });
      }
    }
  };

  const handleConfirmAiAnalysis = () => {
    if (!currentAnalysis) return;
    setExtractedSlots({
      material: currentAnalysis.material,
      craft_technique: currentAnalysis.craft_cluster,
      production_days: Number(currentAnalysis.estimated_production_days) || 1,
      raw_material_cost: Number(currentAnalysis.estimated_raw_material_cost) || 0,
      state: currentAnalysis.state,
    });
    setBilingualMetadata({
      title_en: `Authentic ${currentAnalysis.craft_cluster} (${currentAnalysis.material})`,
      title_hi: `प्रामाणिक ${currentAnalysis.craft_cluster} (${currentAnalysis.material})`,
      description_en: `Master handcrafted ${currentAnalysis.category.toLowerCase()} created over ${currentAnalysis.estimated_production_days} days using authentic ${currentAnalysis.material}.`,
      description_hi: `पारंपरिक ${currentAnalysis.material} से ${currentAnalysis.estimated_production_days} दिनों में निर्मित प्रामाणिक हस्तशिल्प।`,
    });
    setFinalPrice(Number(currentAnalysis.predicted_fair_price) || 0);
    if (onCraftAnalyzed) {
      onCraftAnalyzed({
        ...currentAnalysis,
        imageUrl: photoData?.processed_image_url || photoData?.raw_image_url,
      });
    }
    setIsAiModalOpen(false);
  };

  const handleCustomizeAiAnalysis = () => {
    setIsAiModalOpen(false);
  };

  const handleTranscriptionComplete = async (transcriptText, audioBlob) => {
    try {
      const res = await speechService.extractSlots({
        transcript: transcriptText,
        preferred_lang: preferredLang,
      });

      if (res && res.slots) {
        setExtractedSlots(res.slots);
        setBilingualMetadata({
          title_en: res.title_en,
          title_hi: res.title_hi,
          description_en: res.description_en,
          description_hi: res.description_hi,
        });
        setVoiceData({ transcript: transcriptText, audioBlob });
      }
    } catch (err) {
      console.error('Slot extraction error:', err);
    }
  };

  const handlePublishListing = async () => {
    setIsSubmitting(true);
    try {
      const productPayload = {
        artisan_id: currentArtisan?.id || 1,
        raw_image_path: photoData?.raw_image_url || '/uploads/raw/sample_ikat.jpg',
        processed_image_path: photoData?.processed_image_url || '/uploads/processed/sample_ikat_studio.jpg',
        audio_url: voiceData?.audioBlob ? '/uploads/audio/artisan_voice.webm' : null,
        transcript_raw: voiceData?.transcript || '',

        title_en: bilingualMetadata.title_en,
        title_hi: bilingualMetadata.title_hi,
        description_en: bilingualMetadata.description_en,
        description_hi: bilingualMetadata.description_hi,

        material: extractedSlots.material,
        craft_technique: extractedSlots.craft_technique,
        production_days: Number(extractedSlots.production_days) || 1,

        raw_material_cost: Number(extractedSlots.raw_material_cost) || 0,
        labor_cost: pricingResult?.breakdown?.labor_cost || 2000.0,
        suggested_price: pricingResult?.fair_trade_price || 4500.0,
        final_price: Number(finalPrice) || pricingResult?.fair_trade_price || 4500.0,
        ondc_synced: true, // Direct sync to ONDC Beckn network
      };

      const product = await catalogService.createProduct(productPayload);
      setCreatedProduct(product);
      setPublishSuccess(true);

      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D35400', '#F39C12', '#27AE60', '#2980B9'],
        });
      } catch (e) {
        // ignore
      }

      if (onListingCreated) {
        onListingCreated(product);
      }
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish product. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const speakStepHelp = () => {
    let message = '';
    if (currentStep === 1) {
      message =
        preferredLang === 'hi'
          ? 'कदम एक: अपने शिल्प की एक साफ फोटो लें। हमारा AI अपने आप बैकग्राउंड हटाकर इसे ई-कॉमर्स स्टूडियो जैसा बना देगा।'
          : `${t.step1Title}. ${t.step1Subtitle}.`;
    } else if (currentStep === 2) {
      message =
        preferredLang === 'hi'
          ? 'कदम दो: माइक बटन दबाकर अपने शिल्प के बारे में बोलें। कितने दिन लगे और कितना कच्चा माल लगा, यह बताएं।'
          : `${t.step2Title}. ${t.step2Subtitle}.`;
    } else {
      message =
        preferredLang === 'hi'
          ? 'कदम तीन: उचित मूल्य की गणना देखें। अपनी पसंद का बिक्री मूल्य चुनें और ONDC नेटवर्क पर प्रकाशित करें।'
          : `${t.step3Title}. ${t.step3Subtitle}.`;
    }
    speakInLanguage(message, preferredLang);
  };

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Wizard Step Progress Tracker */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 mb-6">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-800">
            {preferredLang === 'hi' ? `कदम ${currentStep} / 3` : `Step ${currentStep} of 3`}
          </span>

          <button
            type="button"
            onClick={speakStepHelp}
            className="flex items-center gap-1.5 text-xs text-amber-700 font-bold hover:underline"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>{t.listenHelp}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition ${
              currentStep === 1
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold'
                : photoData
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-50 text-stone-600 border-stone-200'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs font-bold">{preferredLang === 'hi' ? '१. फ़ोटो' : '1. Snap'}</span>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition ${
              currentStep === 2
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold'
                : voiceData
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-50 text-stone-600 border-stone-200'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span className="text-xs font-bold">{preferredLang === 'hi' ? '२. बोलें' : '2. Speak'}</span>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition ${
              currentStep === 3
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold'
                : 'bg-stone-50 text-stone-600 border-stone-200'
            }`}
          >
            <Coins className="w-5 h-5" />
            <span className="text-xs font-bold">{preferredLang === 'hi' ? '३. दाम' : '3. Price'}</span>
          </button>
        </div>
      </div>

      {/* Success Celebration View */}
      {publishSuccess && createdProduct ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-emerald-200 animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h3 className="text-2xl font-black text-stone-900 mb-2">
            {preferredLang === 'hi' ? 'उत्पाद ONDC पर सफलतापूर्वक लाइव हुआ!' : 'Published Live to ONDC Beckn Network!'}
          </h3>

          <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
            {preferredLang === 'hi'
              ? `आपकी ${createdProduct.title_hi} अब पूरे देश के ई-कॉमर्स खरीदारों के लिए उपलब्ध है। न्यूनतम मजदूरी गारंटी सुरक्षित है!`
              : `Your ${createdProduct.title_en} is now directly discoverable on ONDC retail apps with verified fair artisan wages.`}
          </p>

          <div className="bg-stone-50 rounded-xl p-4 max-w-sm mx-auto mb-6 text-left border border-stone-200">
            <div className="flex justify-between text-xs py-1 border-b border-stone-200">
              <span className="text-stone-500">Pehchan ID:</span>
              <span className="font-bold text-stone-800">{createdProduct.artisan?.pehchan_id || 'VERIFIED'}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-stone-200">
              <span className="text-stone-500">Listed Price:</span>
              <span className="font-bold text-emerald-700 text-sm">₹{createdProduct.final_price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-stone-500">Beckn Item ID:</span>
              <span className="font-mono text-[11px] text-stone-700">KALA-ITEM-{String(createdProduct.id).padStart(6, '0')}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                setPublishSuccess(false);
                setCurrentStep(1);
                setPhotoData(null);
                setVoiceData(null);
              }}
              className="px-6 py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 font-bold text-sm text-stone-700"
            >
              {preferredLang === 'hi' ? 'एक और नया शिल्प जोड़ें' : 'Catalog Another Craft'}
            </button>
          </div>
        </div>
      ) : (
        /* Multi-Step Wizard Flow */
        <div>
          {/* STEP 1: SNAP PHOTO */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <CameraStudio
                onPhotoProcessed={handlePhotoProcessed}
                preferredLang={preferredLang}
              />

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="min-h-[48px] px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition"
                >
                  <span>{preferredLang === 'hi' ? 'आगे बढ़ें: बोल कर बताएं' : 'Next: Speak Details'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SPEAK AUDIO */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <AudioRecorder
                onTranscriptionComplete={handleTranscriptionComplete}
                preferredLang={preferredLang}
              />

              {/* Verified Extracted Attribute & Predicted Values Cards */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-amber-600" />
                      <span>
                        {preferredLang === 'hi' ? 'पहचाने गए शिल्प विवरण:' : 'Identified Craft Details:'}
                      </span>
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {preferredLang === 'hi'
                        ? 'फ़ोटो और आवाज़ से पहचाने गए सभी मान नीचे दिए गए हैं। आप आवश्यकतानुसार किसी भी बॉक्स पर क्लिक करके मान बदल सकते हैं।'
                        : 'Predicted values from photo and voice. You can click and edit any field directly if needed.'}
                    </p>
                  </div>
                  <span className="text-[11px] self-start sm:self-auto font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    {preferredLang === 'hi' ? 'संपादन योग्य (Editable)' : 'User Editable'}
                  </span>
                </div>

                {/* 6-Slot Grid for All Predicted and Extracted Variables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 1. Craft Technique / Cluster */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-amber-500 focus-within:bg-amber-50/20 transition">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                        {preferredLang === 'hi' ? 'शिल्प शैली (Technique)' : 'Craft Technique'}
                      </span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                        Match
                      </span>
                    </div>
                    <input
                      type="text"
                      value={extractedSlots.craft_technique}
                      onChange={(e) => setExtractedSlots({ ...extractedSlots, craft_technique: e.target.value })}
                      placeholder="e.g. Pochampally Ikat"
                      className="text-xs font-bold text-stone-900 bg-transparent w-full border-b border-stone-300 focus:border-amber-600 focus:outline-none py-1"
                    />
                  </div>

                  {/* 2. Material */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-amber-500 focus-within:bg-amber-50/20 transition">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                        {preferredLang === 'hi' ? 'सामग्री (Material)' : 'Material'}
                      </span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                        Identified
                      </span>
                    </div>
                    <input
                      type="text"
                      value={extractedSlots.material}
                      onChange={(e) => setExtractedSlots({ ...extractedSlots, material: e.target.value })}
                      placeholder="e.g. Pure Handloom Silk"
                      className="text-xs font-bold text-stone-900 bg-transparent w-full border-b border-stone-300 focus:border-amber-600 focus:outline-none py-1"
                    />
                  </div>

                  {/* 3. State / Origin */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-amber-500 focus-within:bg-amber-50/20 transition">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                        {preferredLang === 'hi' ? 'राज्य / क्षेत्र (State)' : 'State / Region'}
                      </span>
                      <span className="text-[9px] bg-stone-200 text-stone-700 font-semibold px-1.5 py-0.5 rounded">
                        Wage Base
                      </span>
                    </div>
                    <input
                      type="text"
                      value={extractedSlots.state || 'Telangana'}
                      onChange={(e) => setExtractedSlots({ ...extractedSlots, state: e.target.value })}
                      placeholder="e.g. Telangana"
                      className="text-xs font-bold text-stone-900 bg-transparent w-full border-b border-stone-300 focus:border-amber-600 focus:outline-none py-1"
                    />
                  </div>

                  {/* 4. Production Days */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-amber-500 focus-within:bg-amber-50/20 transition">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                        {preferredLang === 'hi' ? 'श्रम दिन (Labor Days)' : 'Labor Days Invested'}
                      </span>
                      <span className="text-[9px] bg-orange-100 text-orange-800 font-semibold px-1.5 py-0.5 rounded">
                        Est. Days
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={extractedSlots.production_days}
                        onChange={(e) => setExtractedSlots({ ...extractedSlots, production_days: Number(e.target.value) })}
                        className="text-sm font-bold text-stone-900 bg-transparent w-full border-b border-stone-300 focus:border-amber-600 focus:outline-none py-1"
                      />
                      <span className="text-xs text-stone-500 font-semibold">{preferredLang === 'hi' ? 'दिन' : 'days'}</span>
                    </div>
                  </div>

                  {/* 5. Raw Material Cost */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-amber-500 focus-within:bg-amber-50/20 transition">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                        {preferredLang === 'hi' ? 'कच्चा माल लागत (Raw Cost)' : 'Raw Material Cost (₹)'}
                      </span>
                      <span className="text-[9px] bg-orange-100 text-orange-800 font-semibold px-1.5 py-0.5 rounded">
                        Est. Cost
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-stone-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={extractedSlots.raw_material_cost}
                        onChange={(e) => setExtractedSlots({ ...extractedSlots, raw_material_cost: Number(e.target.value) })}
                        className="text-sm font-bold text-stone-900 bg-transparent w-full border-b border-stone-300 focus:border-amber-600 focus:outline-none py-1"
                      />
                    </div>
                  </div>

                  {/* 6. Predicted Fair Price (Directly Editable by User!) */}
                  <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-xl border-2 border-amber-400 focus-within:border-amber-600 shadow-sm transition">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-amber-900 uppercase font-extrabold tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        {preferredLang === 'hi' ? 'अनुमानित उचित मूल्य (Price)' : 'Predicted Fair Price (₹)'}
                      </span>
                      <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-extrabold text-amber-900">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={finalPrice || mlEstimate?.ml_predicted_price || pricingResult?.fair_trade_price || 0}
                        onChange={(e) => setFinalPrice(Number(e.target.value))}
                        className="text-base font-black text-amber-950 bg-transparent w-full border-b border-amber-400 focus:border-amber-700 focus:outline-none py-0.5"
                      />
                    </div>
                    <div className="text-[10px] text-amber-800/80 font-medium mt-1">
                      {preferredLang === 'hi' ? 'लागत तल' : 'Cost Floor'}: ₹{pricingResult?.cost_floor || mlEstimate?.cost_floor || 0}
                    </div>
                  </div>
                </div>

                {/* Summary Banner with Live Metrics */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-stone-600">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">{preferredLang === 'hi' ? 'लागत तल' : 'Cost Floor'}</span>
                      <span className="font-bold text-stone-900">₹{pricingResult?.cost_floor || mlEstimate?.cost_floor || 0}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">{preferredLang === 'hi' ? 'कारीगर मुनाफा' : 'Artisan Margin'}</span>
                      <span className="font-bold text-emerald-700">+25% Guaranteed</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">{preferredLang === 'hi' ? 'बाज़ार स्थिति' : 'Market Status'}</span>
                      <span className="font-bold text-amber-800">
                        {mlEstimate?.price_elasticity?.split('(')[0]?.trim() || 'Fair Trade Optimal'}
                      </span>
                    </div>
                  </div>

                  {mlEstimate && (
                    <button
                      type="button"
                      onClick={() => setFinalPrice(mlEstimate.ml_predicted_price)}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{preferredLang === 'hi' ? 'सुझाया गया मूल्य पुनः लागू करें' : 'Re-apply Recommended Price'} (₹{mlEstimate.ml_predicted_price})</span>
                    </button>
                  )}
                </div>

                {/* Generated Bilingual Titles Preview */}
                <div className="space-y-2 text-xs bg-amber-50/50 p-3 rounded-xl border border-amber-200/70">
                  <div>
                    <span className="font-semibold text-amber-900">English Title: </span>
                    <span className="text-stone-700">{bilingualMetadata.title_en}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-amber-900">हिन्दी शीर्षक: </span>
                    <span className="text-stone-700">{bilingualMetadata.title_hi}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="min-h-[48px] px-5 py-3 border border-stone-300 rounded-xl text-stone-700 font-semibold hover:bg-stone-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{preferredLang === 'hi' ? 'पीछे (फोटो)' : 'Back'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="min-h-[48px] px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition"
                >
                  <span>{preferredLang === 'hi' ? 'आगे बढ़ें: दाम तय करें' : 'Next: Review Price'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PRICING & ONDC PUBLISH */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Market Price Recommendation Card */}
              {mlEstimate && (
                <div className="p-4 bg-gradient-to-r from-amber-900 to-stone-900 text-white rounded-2xl shadow-md space-y-2 border border-amber-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4 text-amber-400" />
                      {preferredLang === 'hi' ? 'बाज़ार मूल्य सिफारिश' : 'Market Price Recommendation'}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 text-amber-200 rounded-full border border-amber-500/30">
                      {preferredLang === 'hi' ? 'प्रमाणित बेंचमार्क' : 'Verified Benchmark'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <div className="text-2xl font-black text-white">
                        ₹{mlEstimate.ml_predicted_price?.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-stone-300">
                        {mlEstimate.price_elasticity}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFinalPrice(mlEstimate.ml_predicted_price)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow transition transform active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                      <span>{preferredLang === 'hi' ? 'यह सुझाया गया दाम चुनें' : 'Apply Recommended Price'}</span>
                    </button>
                  </div>
                </div>
              )}

              <PricingGauge
                pricingData={pricingResult}
                finalPrice={finalPrice}
                onFinalPriceChange={setFinalPrice}
                preferredLang={preferredLang}
              />

              {/* Publish to ONDC Button */}
              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="min-h-[48px] px-5 py-3 border border-stone-300 rounded-xl text-stone-700 font-semibold hover:bg-stone-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{preferredLang === 'hi' ? 'पीछे (विवरण)' : 'Back'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePublishListing}
                  className="min-h-[48px] px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl flex items-center gap-2 shadow-lg transition transform active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{preferredLang === 'hi' ? 'ONDC पर प्रकाशित करें' : 'Publish to ONDC Network'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Image Analysis & Cost Prediction Modal */}
      <AIImageAnalysisModal
        isOpen={isAiModalOpen}
        analysisData={currentAnalysis}
        processedImageUrl={photoData?.processed_image_url || photoData?.raw_image_url}
        preferredLang={preferredLang}
        onConfirm={handleConfirmAiAnalysis}
        onCustomize={handleCustomizeAiAnalysis}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
