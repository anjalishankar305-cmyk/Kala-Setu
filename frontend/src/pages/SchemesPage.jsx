import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Coins,
  CheckCircle2,
  ExternalLink,
  Volume2,
  Sparkles,
  ArrowRight,
  FileText,
  BadgeCheck,
  Gift
} from 'lucide-react';
import { getTranslation, speakInLanguage } from '../utils/i18n';

export default function SchemesPage({ currentArtisan, preferredLang = 'hi' }) {
  const t = getTranslation(preferredLang);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const artisanState = currentArtisan?.state || 'Telangana';
  const artisanCraft = currentArtisan?.craft_type || 'Pochampally Ikat Handloom';
  const pehchanId = currentArtisan?.pehchan_id || 'P-TEL-WEAV-0924';

  const schemes = [
    {
      id: 'pm-vishwakarma',
      title: preferredLang === 'hi' ? 'पीएम विश्वकर्मा योजना (PM Vishwakarma)' : 'PM Vishwakarma Scheme',
      tag: 'Direct Benefit (DBT)',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      loanAmount: '₹3,00,000',
      grantBenefit: '₹15,000 Tool-Kit E-Voucher',
      interestRate: '5.0% Subsidized',
      stipend: '₹500 / day training',
      description:
        preferredLang === 'hi'
          ? 'पारंपरिक दस्तकारों और बुनकरों के लिए ₹15,000 की निःशुल्क टूलकिट ग्रांट, 5% ब्याज पर ₹3 लाख तक का बिना गारंटी ऋण एवं राष्ट्रीय पहचान पत्र।'
          : 'Free ₹15,000 modern tool-kit grant, collateral-free credit up to ₹3,00,000 at 5% interest, and official Vishwakarma certificate.',
      eligibility: ['Pehchan Artisan Card Holder', 'Age 18+', 'Traditional Craft Practitioner'],
      eligible: true,
      docsNeeded: ['Aadhaar Card', 'Pehchan ID Card', 'Bank Passbook'],
    },
    {
      id: 'ahvy-mosje',
      title:
        preferredLang === 'hi'
          ? 'अम्बेडकर हस्तशिल्प विकास योजना (AHVY - MoSJE)'
          : 'Ambedkar Hastshilp Vikas Yojana (AHVY)',
      tag: 'MoSJE Flagship',
      tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
      loanAmount: 'Cluster Grant',
      grantBenefit: '100% Free Cluster Facility',
      interestRate: 'Zero Interest',
      stipend: 'Skill Upgrade Allowance',
      description:
        preferredLang === 'hi'
          ? 'सामाजिक न्याय एवं अधिकारिता मंत्रालय द्वारा अनुसूचित जाति/जनजाति एवं पिछड़े वर्ग के शिल्प समूहों को साझा सुविधा केंद्र और सीधे विपणन का लाभ।'
          : 'MoSJE flagship program providing Common Facility Centers (CFC), modern design workshops, and direct emporium marketing links.',
      eligibility: ['Rural/Marginalized Artisan Cluster', 'SC/ST/OBC Craftsperson', 'Handloom/Handicraft'],
      eligible: true,
      docsNeeded: ['Pehchan ID', 'Caste Certificate (if applicable)', 'Cluster Recommendation'],
    },
    {
      id: 'nhdp-yarn',
      title:
        preferredLang === 'hi'
          ? 'राष्ट्रीय हथकरघा विकास कार्यक्रम (NHDP Raw Subsidy)'
          : 'National Handloom Development Programme',
      tag: 'Material Subsidy',
      tagColor: 'bg-amber-100 text-amber-800 border-amber-300',
      loanAmount: '₹2,00,000 Weaver Card',
      grantBenefit: '15% Direct Yarn Subsidy',
      interestRate: 'Subsidized Credit',
      stipend: 'Free Solar Loom Lighting',
      description:
        preferredLang === 'hi'
          ? 'रेशम एवं सूत के धागे पर 15% सीधी सब्सिडी, सौर ऊर्जा संचालित हथकरघा लाइटिंग किट एवं राष्ट्रीय मेलों में निःशुल्क स्टॉल आवंटन।'
          : '15% direct subsidy on hank yarn (silk & cotton), free solar loom lighting units, and complimentary stalls at Surajkund & Dilli Haat.',
      eligibility: ['Master Weaver / Handloom Cooperative', 'Valid Loom Registration'],
      eligible: true,
      docsNeeded: ['Weaver Pehchan Card', 'Yarn Passbook', 'Bank Account Details'],
    },
    {
      id: 'mudra-standup',
      title: preferredLang === 'hi' ? 'मुद्रा ऋण / स्टैंड-अप इंडिया (Mudra Craft Loan)' : 'PMMY Mudra Shishu/Kishore Craft Loan',
      tag: 'Collateral-Free',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
      loanAmount: 'Up to ₹10,00,000',
      grantBenefit: 'No Collateral Security',
      interestRate: '3% Interest Subvention',
      stipend: 'Mudra Rupay Card',
      description:
        preferredLang === 'hi'
          ? 'बिना किसी गिरवी या ज़मानत के ₹50,000 से ₹10 लाख तक का कार्यशील पूंजी ऋण। ओएनडीसी पर सत्यापित बिक्री रिकॉर्ड पर त्वरित स्वीकृति।'
          : 'Collateral-free working capital loan up to ₹10 Lakhs. Fast-track approval anchored by verified ONDC catalog sales record.',
      eligibility: ['Active Artisan on ONDC/KalaSetu', 'Clean Credit Track Record'],
      eligible: true,
      docsNeeded: ['Pehchan ID', 'KalaSetu ONDC Catalog Profile', 'PAN Card / Aadhaar'],
    },
  ];

  const handleSpeakScheme = (s) => {
    const text = `${s.title}। ${s.description}। ऋण सहायता: ${s.loanAmount}। लाभ: ${s.grantBenefit}।`;
    speakInLanguage(text, preferredLang);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl border border-amber-900/40 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full mb-3">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Ministry of Social Justice & Empowerment (MoSJE)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            {t.schemesHeader}
          </h2>
          <p className="text-sm text-stone-300 max-w-2xl mb-4 leading-relaxed">
            {t.schemesSub}
          </p>

          {/* Logged in Artisan Verified Profile Chip */}
          <div className="inline-flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs">
            <span className="text-amber-300 font-semibold">{currentArtisan?.name || 'Master Artisan'}</span>
            <span className="text-white/40">•</span>
            <span className="text-stone-200">{artisanCraft}</span>
            <span className="text-white/40">•</span>
            <span className="font-mono text-amber-200">Pehchan #{pehchanId}</span>
            <span className="bg-emerald-500 text-stone-950 px-2 py-0.5 rounded-full font-bold text-[10px]">
              100% ELIGIBLE
            </span>
          </div>
        </div>

        {/* Subtle decorative motif */}
        <div className="absolute right-4 -bottom-6 text-amber-500/10 text-9xl font-serif pointer-events-none select-none">
          क
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${scheme.tagColor}`}>
                    {scheme.tag}
                  </span>
                  <h3 className="font-bold text-stone-900 text-lg mt-2 leading-snug">
                    {scheme.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleSpeakScheme(scheme)}
                  className="p-2 rounded-full bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 flex-shrink-0 transition"
                  title="Listen Scheme Details"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-600 mb-4 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-150">
                {scheme.description}
              </p>

              {/* Financial Benefits Highlights */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-stone-500 block">ऋण सीमा (Credit Limit)</span>
                  <span className="font-black text-amber-900 text-base">{scheme.loanAmount}</span>
                  <span className="text-[10px] text-amber-700 block font-medium mt-0.5">{scheme.interestRate}</span>
                </div>

                <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-stone-500 block">सीधी ग्रांट (Direct Grant)</span>
                  <span className="font-black text-emerald-900 text-xs sm:text-sm">{scheme.grantBenefit}</span>
                  <span className="text-[10px] text-emerald-700 block font-medium mt-0.5">{scheme.stipend}</span>
                </div>
              </div>

              {/* Eligibility Checkmarks */}
              <div className="space-y-1.5 mb-4 text-xs text-stone-700">
                {scheme.eligibility.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application CTA */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>{t.eligible}</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedScheme(scheme)}
                className="min-h-[42px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition"
              >
                <span>{t.applyNow}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Application Instructions Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-6 h-6 text-amber-600" />
                <h3 className="font-black text-stone-900 text-lg">
                  {selectedScheme.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScheme(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              {selectedScheme.description}
            </p>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 mb-4 text-xs space-y-2">
              <span className="font-bold text-stone-800 block">आवश्यक दस्तावेज (Required Documents):</span>
              {selectedScheme.docsNeeded.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-stone-600">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-xs text-emerald-800 mb-6">
              <span className="font-bold block">सत्यापित स्थिति (KalaSetu Verified):</span>
              आपकी पहचान पत्र संख्या <strong className="font-mono">{pehchanId}</strong> और ONDC सूची इस योजना के लिए 100% सत्यापित है।
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedScheme(null)}
                className="flex-1 py-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                बंद करें (Close)
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(
                    preferredLang === 'hi'
                      ? 'आपका आवेदन संदर्भ दर्ज कर लिया गया है। आपके पंजीकृत मोबाइल नंबर पर MoSJE सेवा केंद्र से संपर्क किया जाएगा!'
                      : 'Application reference logged. MoSJE Common Facility Center will follow up on your registered mobile number!'
                  );
                  setSelectedScheme(null);
                }}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow"
              >
                आवेदन शुरू करें (Proceed)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
