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
  HelpCircle
} from 'lucide-react';
import CameraStudio from '../components/CameraStudio';
import AudioRecorder from '../components/AudioRecorder';
import PricingGauge from '../components/PricingGauge';
import { speechService, pricingService, catalogService } from '../services/api';
import { getTranslation, speakInLanguage } from '../utils/i18n';

export default function WizardPage({ onListingCreated, preferredLang = 'hi', currentArtisan }) {
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
  const [finalPrice, setFinalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);

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

              {/* Verified Extracted Attribute Cards */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>
                    {preferredLang === 'hi' ? 'पहचाने गए शिल्प गुण (Verified Slots):' : 'AI Extracted Craft Slots:'}
                  </span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 uppercase block">Material</span>
                    <input
                      type="text"
                      value={extractedSlots.material}
                      onChange={(e) => setExtractedSlots({ ...extractedSlots, material: e.target.value })}
                      className="text-xs font-bold text-stone-900 bg-transparent w-full border-b border-transparent focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 uppercase block">Technique</span>
                    <input
                      type="text"
                      value={extractedSlots.craft_technique}
                      onChange={(e) => setExtractedSlots({ ...extractedSlots, craft_technique: e.target.value })}
                      className="text-xs font-bold text-stone-900 bg-transparent w-full border-b border-transparent focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 uppercase block">Days Invested</span>
                    <input
                      type="number"
                      value={extractedSlots.production_days}
                      onChange={(e) => setExtractedSlots({ ...extractedSlots, production_days: Number(e.target.value) })}
                      className="text-xs font-bold text-stone-900 bg-transparent w-full border-b border-transparent focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] text-stone-500 uppercase block">Raw Cost (₹)</span>
                    <input
                      type="number"
                      value={extractedSlots.raw_material_cost}
                      onChange={(e) => setExtractedSlots({ ...extractedSlots, raw_material_cost: Number(e.target.value) })}
                      className="text-xs font-bold text-stone-900 bg-transparent w-full border-b border-transparent focus:border-amber-500 focus:outline-none"
                    />
                  </div>
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
    </div>
  );
}
