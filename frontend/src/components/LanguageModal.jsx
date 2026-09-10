import React from 'react';
import { Globe2, X, Check, Volume2 } from 'lucide-react';
import { LANGUAGES, speakInLanguage } from '../utils/i18n';

export default function LanguageModal({ currentLang, onSelectLanguage, onClose }) {
  const handleSelect = (lang) => {
    onSelectLanguage(lang.code);
    speakInLanguage(`आपने ${lang.name} चुनी है`, lang.code);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 font-black flex items-center justify-center shadow-sm">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg">
                अपनी भाषा चुनें / Select Your Language
              </h3>
              <p className="text-xs text-stone-500">
                12 भारतीय भाषाएं उपलब्ध (12 Official Indic Languages Supported)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {LANGUAGES.map((l) => {
            const isSelected = currentLang === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => handleSelect(l)}
                className={`text-left p-3.5 rounded-2xl border transition flex items-center justify-between group ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md font-bold'
                    : 'bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border-stone-200 text-stone-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold">{l.name}</span>
                    <span className={`text-[11px] ${isSelected ? 'text-stone-900 font-semibold' : 'text-stone-500'}`}>
                      ({l.englishName})
                    </span>
                  </div>
                  <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-stone-900/80 font-medium' : 'text-stone-400'}`}>
                    {l.region}
                  </p>
                </div>

                {isSelected ? (
                  <Check className="w-5 h-5 text-stone-950 flex-shrink-0" />
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakInLanguage(`नमस्ते, यह ${l.name} है`, l.code);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-amber-700 hover:bg-amber-200 transition"
                    title="Audio sample"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-center text-xs text-stone-500">
          <span>Supported across speech recognition, text-to-speech audio, and AI catalog generation.</span>
        </div>
      </div>
    </div>
  );
}
