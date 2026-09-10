import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, RotateCcw, Play, Square } from 'lucide-react';
import { LANGUAGES, getTranslation, speakInLanguage } from '../utils/i18n';

export default function AudioRecorder({ onTranscriptionComplete, preferredLang = 'hi' }) {
  const t = getTranslation(preferredLang);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Comprehensive multilingual voice prompts for testing across Indian languages
  const samplePrompts = [
    {
      label: '🇮🇳 हिन्दी (पोचमपल्ली इकत)',
      text: 'यह पोचमपल्ली इकत सिल्क साड़ी है, इसे बनाने में 4 दिन लगे और 1600 रुपये का कच्चा माल लगा',
      lang: 'hi'
    },
    {
      label: '🇮🇳 తెలుగు (పోచంపల్లి ఇక్కత్)',
      text: 'ఇది పోచంపల్లి ఇక్కత్ పట్టు చీర, 4 రోజులు పట్టింది మరియు 1600 రూపాయల ఖర్చు అయింది',
      lang: 'te'
    },
    {
      label: '🇮🇳 தமிழ் (காஞ்சிபுரம் பட்டு)',
      text: 'இது பாரம்பரிய பட்டு கைத்தறி நெசவு, 5 நாட்கள் ஆனது மற்றும் 2200 ரூபாய் மூலப்பொருள் செலவு',
      lang: 'ta'
    },
    {
      label: '🇮🇳 ಕನ್ನಡ (ಚೆನ್ನಪಟ್ಟಣ ಮರ)',
      text: 'ಇದು ಚೆನ್ನಪಟ್ಟಣ ಮರದ ಆಟಿಕೆ, 2 ದಿನಗಳು ಬೇಕಾಯಿತು ಮತ್ತು 450 ರೂಪಾಯಿ ಕಚ್ಚಾ ವಸ್ತು ವೆಚ್ಚ',
      lang: 'kn'
    },
    {
      label: '🇮🇳 বাংলা (মধুবনী / কাঁথা)',
      text: 'এটি প্রাকৃতিক রঙের কাঁথা সিল্ক কারুশিল্প, তৈরি করতে ৩ দিন লেগেছে এবং ৮০০ টাকা খরচ',
      lang: 'bn'
    },
    {
      label: '🇮🇳 ગુજરાતી (અજરખ બ્લોક)',
      text: 'આ અજરખ બ્લોક પ્રિન્ટ સુતરાઉ કાપડ છે, 3 દિવસ લાગ્યા અને 750 રૂપિયા કાચો માલ ખર્ચ',
      lang: 'gu'
    },
    {
      label: '🇬🇧 English (Channapatna Wood)',
      text: 'This is Channapatna lacquer woodcraft toy made from ivory wood, took 2 days and 450 rupees material cost',
      lang: 'en'
    }
  ];

  useEffect(() => {
    // Check Web Speech Recognition support with language-specific IETF code
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      const langObj = LANGUAGES.find((l) => l.code === preferredLang) || LANGUAGES[0];
      recognition.lang = langObj.voiceCode || 'hi-IN';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition warning:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, [preferredLang]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    setTranscript('');
    setAudioUrl(null);
    setAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start Web Speech if supported
      if (recognitionRef.current) {
        try {
          const langObj = LANGUAGES.find((l) => l.code === preferredLang) || LANGUAGES[0];
          recognitionRef.current.lang = langObj.voiceCode || 'hi-IN';
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Speech rec already active or not started:', e);
        }
      }
    } catch (err) {
      console.warn('Microphone permission denied or not available:', err);
      alert(
        preferredLang === 'hi'
          ? 'माइक्रोफ़ोन अनुमति उपलब्ध नहीं है। कृपया नीचे दिए गए नमूना वाक् बटन पर टैप करें!'
          : 'Microphone access is unavailable. Please tap one of the demonstration voice samples below!'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const handleProcessVoice = async (textToProcess, blobToPass = audioBlob) => {
    setIsProcessing(true);
    try {
      if (onTranscriptionComplete) {
        await onTranscriptionComplete(textToProcess || transcript, blobToPass);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const speakGuide = (text) => {
    speakInLanguage(text, preferredLang);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shadow-sm">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg">
              {t.step2Title}
            </h3>
            <p className="text-xs text-stone-500">
              {t.step2Subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            speakGuide(
              preferredLang === 'hi'
                ? 'माइक बटन दबाकर बोलें: जैसे कि, यह पोचमपल्ली इकत साड़ी सिल्क से बनी है, 4 दिन लगे और 1600 रुपये का कच्चा माल लगा।'
                : `${t.step2Title}. ${t.step2Subtitle}.`
            )
          }
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition shadow-sm"
          title="Audio guidance"
        >
          <Volume2 className="w-4 h-4 text-amber-700" />
          <span>{t.audioHelp}</span>
        </button>
      </div>

      {/* Main Microphone Action Area */}
      <div className="flex flex-col items-center justify-center py-6 bg-stone-50 rounded-2xl border border-stone-200">
        <div className="relative mb-4">
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
          )}

          <button
            type="button"
            id="mic-record-btn"
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700 ring-4 ring-red-200 scale-105'
                : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-xl'
            }`}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? <Square className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>

        {/* Dynamic Waveform Visualizer */}
        {isRecording ? (
          <div className="flex items-center gap-1.5 h-10 mb-2">
            <div className="w-1.5 bg-red-500 rounded-full wave-bar-1" />
            <div className="w-1.5 bg-red-600 rounded-full wave-bar-2" />
            <div className="w-1.5 bg-amber-500 rounded-full wave-bar-3" />
            <div className="w-1.5 bg-red-600 rounded-full wave-bar-2" />
            <div className="w-1.5 bg-red-500 rounded-full wave-bar-1" />
          </div>
        ) : (
          <p className="text-xs font-bold text-stone-600 mb-2">
            {t.tapToSpeak}
          </p>
        )}

        {/* Live / Transcribed Text Box */}
        <div className="w-full px-4 mt-2">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={
              preferredLang === 'hi'
                ? 'आपकी आवाज़ यहाँ दिखाई देगी... (उदा: पोचमपल्ली इकत साड़ी, 4 दिन लगे, 1600 रु. कच्चा माल)'
                : 'Your voice text will appear here in your selected Indian language...'
            }
            className="w-full p-3.5 text-sm rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white text-stone-800 resize-none h-20 shadow-inner"
          />
        </div>

        {/* Confirm / Process Voice Button */}
        {transcript && (
          <div className="flex gap-2 mt-3 w-full px-4">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleProcessVoice(transcript)}
              className="flex-1 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t.extractSlots}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setTranscript('');
                setAudioUrl(null);
              }}
              className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl transition"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Preset Voice Demonstrations Across Indian Languages */}
      <div className="mt-5 pt-4 border-t border-stone-200">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-2.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>
            {preferredLang === 'hi'
              ? 'विभिन्न भारतीय भाषाओं में तैयार नमूना बोलें (One-Tap Indic Audio Presets):'
              : 'One-Tap Multilingual Voice Demo Presets:'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTranscript(p.text);
                handleProcessVoice(p.text, null);
              }}
              className="text-left p-3 rounded-xl border border-stone-200 bg-stone-50/80 hover:bg-amber-50 hover:border-amber-300 transition text-xs text-stone-700 flex flex-col justify-between shadow-xs"
            >
              <span className="font-extrabold text-amber-900">{p.label}</span>
              <span className="text-[11px] text-stone-600 italic mt-0.5 line-clamp-1">"{p.text}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
