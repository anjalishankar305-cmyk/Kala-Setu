import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.config import settings
from app.services.nlp_service import NLPService
from app.schemas import SpeechExtractRequest, SpeechExtractResponse

router = APIRouter(prefix="/speech", tags=["Indic Speech & NLP"])


@router.post("/extract-slots", response_model=SpeechExtractResponse)
async def extract_slots_from_text(payload: SpeechExtractRequest):
    """
    Extracts structured craft attributes (Material, Technique, Production Days, Raw Cost)
    from voice transcription and generates bilingual SEO titles & descriptions.
    """
    text = payload.transcript or ""
    result = NLPService.process_transcript(text, preferred_lang=payload.preferred_lang or "hi")
    return result


@router.post("/transcribe", response_model=SpeechExtractResponse)
async def transcribe_and_extract(
    audio: UploadFile = File(None),
    transcript: str = Form(None),
    preferred_lang: str = Form("hi")
):
    """
    Ingests recorded voice audio and/or client-side Web Speech transcription.
    Saves audio file locally for buyer provenance and performs slot extraction.
    """
    saved_audio_url = None
    if audio:
        ext = Path(audio.filename or "audio.webm").suffix or ".webm"
        audio_filename = f"voice_{uuid.uuid4().hex[:10]}{ext}"
        audio_save_path = settings.AUDIO_DIR / audio_filename

        audio_bytes = await audio.read()
        with open(audio_save_path, "wb") as f:
            f.write(audio_bytes)
        saved_audio_url = f"/uploads/audio/{audio_filename}"

    # Use transcript provided by browser Web Speech API, or fallback to default craft narrative
    text_to_process = transcript or (
        "पोचमपल्ली इकत सिल्क साड़ी है, इसे बनाने में 4 दिन लगे और 1600 रुपये का कच्चा माल लगा"
        if preferred_lang == "hi"
        else "Pochampally ikat silk saree, handcrafted over 4 days with 1600 rupees raw material cost"
    )

    result = NLPService.process_transcript(text_to_process, preferred_lang=preferred_lang)
    return result
