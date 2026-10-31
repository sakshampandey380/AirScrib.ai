import io
from pathlib import Path

from PIL import Image

from app.utils.image_tools import ensure_directory


def _composite_on_dark_bg(image: Image.Image, bg_color: tuple[int, int, int] = (7, 17, 32)) -> Image.Image:
    rgba = image.convert("RGBA")
    background = Image.new("RGBA", rgba.size, (*bg_color, 255))
    background.alpha_composite(rgba)
    return background.convert("RGB")


def export_drawing(source_path: str, svg_markup: str | None, output_dir: str | Path, file_format: str) -> tuple[str, float]:
    ensure_directory(output_dir)
    source = Path(source_path)
    target = Path(output_dir) / f"{source.stem}.{file_format}"

    if file_format == "png":
        img = Image.open(source)
        _composite_on_dark_bg(img).save(target, format="PNG")
    elif file_format == "jpg":
        img = Image.open(source)
        _composite_on_dark_bg(img).save(target, format="JPEG", quality=94)
    elif file_format == "pdf":
        img = Image.open(source)
        _composite_on_dark_bg(img).save(target, format="PDF", resolution=150.0)
    elif file_format == "svg":
        if svg_markup:
            target.write_text(svg_markup, encoding="utf-8")
        else:
            image = Image.open(source)
            buffer = io.BytesIO()
            image.save(buffer, format="PNG")
            png_bytes = buffer.getvalue().hex()
            svg = (
                f'<svg xmlns="http://www.w3.org/2000/svg" width="{image.width}" height="{image.height}">'
                f"<desc>AirScribe AI fallback SVG export</desc>"
                f'<rect width="100%" height="100%" fill="#09111f" />'
                f'<text x="32" y="64" fill="#c9f7ff" font-size="24">SVG source unavailable</text>'
                f"<metadata>{png_bytes[:256]}</metadata>"
                "</svg>"
            )
            target.write_text(svg, encoding="utf-8")
    else:
        raise ValueError("Unsupported export format.")

    file_size_kb = round(target.stat().st_size / 1024, 2)
    return str(target).replace("\\", "/"), file_size_kb


