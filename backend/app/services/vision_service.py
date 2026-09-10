import os
import uuid
from pathlib import Path
from typing import Tuple, Dict, Any
import numpy as np
from PIL import Image, ImageEnhance, ImageOps
import cv2

from app.config import settings

# Attempt to import rembg; if unavailable or onnx model downloading, fallback gracefully
try:
    import rembg
    REMBG_AVAILABLE = True
except Exception:
    REMBG_AVAILABLE = False


class VisionService:
    @staticmethod
    def calculate_lighting_metrics(cv_image: np.ndarray) -> Dict[str, float]:
        """Calculate image brightness and contrast scores."""
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        brightness = float(np.mean(gray))  # 0 to 255
        contrast = float(np.std(gray))      # Standard deviation of luminance
        return {
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2)
        }

    @staticmethod
    def calibrate_color_and_lighting(pil_img: Image.Image) -> Image.Image:
        """
        Enhances brightness, contrast, and color balance to restore handloom dye
        fidelity under poor ambient or dim artisanal workshop lighting.
        """
        # Auto-contrast with 1% cut-off
        enhanced = ImageOps.autocontrast(pil_img, cutoff=1)

        # Subtle contrast and color vibrancy boost
        enhancer = ImageEnhance.Contrast(enhanced)
        enhanced = enhancer.enhance(1.12)

        color_enhancer = ImageEnhance.Color(enhanced)
        enhanced = color_enhancer.enhance(1.10)

        # Smart brightness correction if too dark or too bright
        np_img = np.array(enhanced.convert("RGB"))
        gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
        mean_lum = np.mean(gray)

        if mean_lum < 110:
            bright_factor = 1.0 + (110 - mean_lum) / 180.0
            enhanced = ImageEnhance.Brightness(enhanced).enhance(bright_factor)
        elif mean_lum > 210:
            dark_factor = 210 / mean_lum
            enhanced = ImageEnhance.Brightness(enhanced).enhance(dark_factor)

        return enhanced

    @staticmethod
    def fallback_studio_isolate(pil_img: Image.Image) -> Image.Image:
        """
        Smart fallback studio segmentation using OpenCV GrabCut/vignette composite
        if rembg is unavailable or model download is delayed.
        """
        rgb_img = pil_img.convert("RGB")
        cv_img = cv2.cvtColor(np.array(rgb_img), cv2.COLOR_RGB2BGR)
        h, w = cv_img.shape[:2]

        # Use GrabCut with border bounding box
        mask = np.zeros((h, w), np.uint8)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        margin_x = max(10, int(w * 0.05))
        margin_y = max(10, int(h * 0.05))
        rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)

        try:
            cv2.grabCut(cv_img, mask, rect, bgd_model, fgd_model, 3, cv2.GC_INIT_WITH_RECT)
            mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
            
            # Smooth mask edges
            mask2 = cv2.GaussianBlur(mask2 * 255, (7, 7), 0)
            alpha = mask2 / 255.0

            # Composite onto clean pristine studio off-white background (#F9FAFB)
            bg_color = np.array([249, 250, 251], dtype=np.float32)
            fg = cv_img.astype(np.float32)
            composite = fg * alpha[:, :, np.newaxis] + bg_color * (1.0 - alpha[:, :, np.newaxis])
            composite = np.clip(composite, 0, 255).astype(np.uint8)
            result = Image.fromarray(cv2.cvtColor(composite, cv2.COLOR_BGR2RGB))
            return result
        except Exception:
            # If grabcut fails, return cleanly calibrated image on subtle light border
            return rgb_img

    @classmethod
    def remove_background_and_composite(cls, pil_img: Image.Image) -> Tuple[Image.Image, str]:
        """
        Removes cluttered workshop background using rembg and composites onto
        an e-commerce pristine studio background (#FAFAFA).
        """
        method = "opencv_grabcut"
        if REMBG_AVAILABLE:
            try:
                # Remove background with rembg
                no_bg = rembg.remove(pil_img)
                # Composite onto pristine e-commerce studio background
                studio_bg = Image.new("RGBA", no_bg.size, (250, 250, 250, 255))
                studio_bg.paste(no_bg, (0, 0), no_bg)
                return studio_bg.convert("RGB"), "rembg_studio"
            except Exception as e:
                # Fallback to OpenCV grabcut
                pass

        isolated = cls.fallback_studio_isolate(pil_img)
        return isolated, method

    @classmethod
    def process_artisan_asset(cls, file_bytes: bytes, original_filename: str) -> Dict[str, Any]:
        """
        Complete vision pipeline:
        1. Save raw image
        2. Analyze lighting
        3. Calibrate color/contrast for textile/dye fidelity
        4. Isolate background to studio white
        5. Save processed image
        """
        file_id = uuid.uuid4().hex[:12]
        ext = Path(original_filename).suffix.lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            ext = ".jpg"

        raw_filename = f"raw_{file_id}{ext}"
        processed_filename = f"studio_{file_id}.jpg"

        raw_save_path = settings.RAW_DIR / raw_filename
        processed_save_path = settings.PROCESSED_DIR / processed_filename

        # Write raw image
        with open(raw_save_path, "wb") as f:
            f.write(file_bytes)

        # Open PIL image
        pil_raw = Image.open(raw_save_path).convert("RGB")
        cv_raw = cv2.cvtColor(np.array(pil_raw), cv2.COLOR_RGB2BGR)

        # Lighting metrics
        metrics = cls.calculate_lighting_metrics(cv_raw)

        # Step 1: Color & lighting calibration
        calibrated = cls.calibrate_color_and_lighting(pil_raw)

        # Step 2: Background removal & studio white composite
        studio_image, method = cls.remove_background_and_composite(calibrated)

        # Save processed
        studio_image.save(processed_save_path, format="JPEG", quality=92, optimize=True)

        return {
            "raw_filename": raw_filename,
            "processed_filename": processed_filename,
            "raw_image_url": f"/uploads/raw/{raw_filename}",
            "processed_image_url": f"/uploads/processed/{processed_filename}",
            "brightness_score": metrics["brightness"],
            "contrast_score": metrics["contrast"],
            "method_used": method,
            "message": "Asset successfully enhanced and calibrated for e-commerce."
        }
