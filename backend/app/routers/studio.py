from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.vision_service import VisionService
from app.schemas import VisionEnhanceResponse

router = APIRouter(prefix="/studio", tags=["Vision Studio"])


@router.post("/enhance", response_model=VisionEnhanceResponse)
async def enhance_craft_photo(file: UploadFile = File(...)):
    """
    Accepts raw artisan photo taken with mobile camera or uploaded from gallery.
    Performs:
    1. Color & lighting calibration to preserve handloom dye fidelity under poor workshop lighting.
    2. Background isolation composite onto pristine e-commerce studio background.
    3. Image quality scoring (brightness, contrast).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Image file cannot be empty.")

    try:
        result = VisionService.process_artisan_asset(file_bytes, file.filename or "photo.jpg")
        return VisionEnhanceResponse(
            success=True,
            raw_image_url=result["raw_image_url"],
            processed_image_url=result["processed_image_url"],
            brightness_score=result["brightness_score"],
            contrast_score=result["contrast_score"],
            method_used=result["method_used"],
            message=result["message"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image enhancement failed: {str(e)}")
