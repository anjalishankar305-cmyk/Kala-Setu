"""Generates realistic sample craft images for the seeded catalog items."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

backend_dir = Path(__file__).resolve().parent.parent
raw_dir = backend_dir / "uploads" / "raw"
proc_dir = backend_dir / "uploads" / "processed"

raw_dir.mkdir(parents=True, exist_ok=True)
proc_dir.mkdir(parents=True, exist_ok=True)


def create_sample_craft_image(title: str, subtext: str, bg_color, accent_color, output_raw: Path, output_proc: Path):
    # Create raw version (simulating workshop ambient light)
    w, h = 600, 600
    img = Image.new("RGB", (w, h), bg_color)
    draw = ImageDraw.Draw(img)

    # Decorative geometric pattern representing artisan craft
    for i in range(20, 580, 40):
        draw.line([(i, 60), (i + 20, 100), (i, 140)], fill=accent_color, width=3)
        draw.line([(i, 460), (i + 20, 500), (i, 540)], fill=accent_color, width=3)

    # Central craft medallion
    draw.ellipse([150, 180, 450, 420], outline=accent_color, width=4)
    draw.ellipse([180, 210, 420, 390], fill=accent_color)
    draw.ellipse([210, 240, 390, 360], fill=bg_color)

    # Text overlay
    draw.text((w // 2 - 80, 285), title, fill=(255, 255, 255))
    draw.text((w // 2 - 70, 315), subtext, fill=(230, 230, 230))

    img.save(output_raw, quality=88)

    # Processed version (clean white studio lighting #FAFAFA)
    studio = Image.new("RGB", (w, h), (250, 250, 250))
    s_draw = ImageDraw.Draw(studio)
    
    # Shadow underneath
    s_draw.ellipse([120, 470, 480, 520], fill=(225, 225, 225))

    # Center composite
    studio.paste(img.crop((100, 100, 500, 500)), (100, 70))
    studio.save(output_proc, quality=94)


if __name__ == "__main__":
    create_sample_craft_image(
        "POCHAMPALLY IKAT", "Pure Handloom Silk",
        (160, 44, 40), (235, 180, 50),
        raw_dir / "sample_ikat.jpg", proc_dir / "sample_ikat_studio.jpg"
    )
    create_sample_craft_image(
        "MADHUBANI ART", "Natural Twig & Paper",
        (40, 90, 70), (240, 160, 40),
        raw_dir / "sample_madhubani.jpg", proc_dir / "sample_madhubani_studio.jpg"
    )
    create_sample_craft_image(
        "DHOKRA METAL", "Lost-Wax Bell Metal",
        (80, 60, 45), (210, 155, 45),
        raw_dir / "sample_dhokra.jpg", proc_dir / "sample_dhokra_studio.jpg"
    )
    print("Sample craft assets generated.")
