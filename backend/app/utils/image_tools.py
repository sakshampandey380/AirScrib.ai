import base64
import io
import uuid
from pathlib import Path

from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True


def ensure_directory(path: str | Path) -> Path:
    directory = Path(path)
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def save_data_url_image(data_url: str, output_dir: str | Path, prefix: str = "drawing") -> tuple[str, str]:
    ensure_directory(output_dir)

    _, encoded = data_url.split(",", 1) if "," in data_url else ("", data_url)
    raw_bytes = base64.b64decode(encoded)
    fg = Image.open(io.BytesIO(raw_bytes)).convert("RGBA")

    # Composite onto dark studio background so gallery previews and exports always have rich contrast
    bg = Image.new("RGBA", fg.size, (7, 17, 32, 255))
    bg.alpha_composite(fg)
    image = bg

    filename = f"{prefix}_{uuid.uuid4().hex}.png"
    image_path = Path(output_dir) / filename
    image.save(image_path, format="PNG")

    thumb = image.copy()
    thumb.thumbnail((480, 320))
    thumb_name = f"thumb_{filename}"
    thumb_path = Path(output_dir) / thumb_name
    thumb.save(thumb_path, format="PNG")

    return str(image_path).replace("\\", "/"), str(thumb_path).replace("\\", "/")


def save_profile_image(file_bytes: bytes, output_dir: str | Path, extension: str = "png") -> str:
    ensure_directory(output_dir)
    requested_extension = (extension or "png").lower().strip(".")
    image = Image.open(io.BytesIO(file_bytes))

    # JPEG cannot store alpha channels, so flatten transparent uploads safely.
    if requested_extension in {"jpg", "jpeg"}:
        flattened = Image.new("RGB", image.size, (10, 16, 28))
        alpha_ready = image.convert("RGBA")
        flattened.paste(alpha_ready, mask=alpha_ready.getchannel("A"))
        image_to_save = flattened
        final_extension = "jpg"
        save_format = "JPEG"
    elif requested_extension == "webp":
        image_to_save = image.convert("RGBA")
        final_extension = "webp"
        save_format = "WEBP"
    else:
        image_to_save = image.convert("RGBA")
        final_extension = "png"
        save_format = "PNG"

    filename = f"profile_{uuid.uuid4().hex}.{final_extension}"
    path = Path(output_dir) / filename
    image_to_save.save(path, format=save_format)
    return str(path).replace("\\", "/")
