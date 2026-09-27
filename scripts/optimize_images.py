#!/usr/bin/env python3
"""
Generates, for every images/**/*.jpg:
  - a full-size .webp (for the lightbox / hero use — same pixel size, q=82)
  - a "display" .webp capped at 1000px on the long edge (for grid/thumbnail
    use where the photo never renders larger than that — q=80)
Writes images/manifest.json describing every derived asset + its intrinsic
width/height so the page builder can emit correct <picture>/<img> markup
(avoids layout shift) and point thumbnails at the lighter file.
Originals are left untouched as the universal fallback.
"""
import json
import os
from PIL import Image

SRC_ROOT = "images"
DISPLAY_MAX = 1000  # px, long edge, for anything not opened full-size


def save_webp(im, path, quality):
    im.convert("RGB").save(path, "WEBP", quality=quality, method=6)


def main():
    manifest = {}
    for root, _dirs, files in os.walk(SRC_ROOT):
        for f in sorted(files):
            if not f.lower().endswith(".jpg"):
                continue
            src = os.path.join(root, f)
            stem, _ext = os.path.splitext(src)
            full_webp = stem + ".webp"
            display_webp = stem + "@display.webp"

            im = Image.open(src)
            w, h = im.size

            if not os.path.exists(full_webp):
                save_webp(im, full_webp, quality=82)

            if not os.path.exists(display_webp):
                if max(w, h) > DISPLAY_MAX:
                    scale = DISPLAY_MAX / max(w, h)
                    disp = im.resize(
                        (round(w * scale), round(h * scale)), Image.LANCZOS
                    )
                else:
                    disp = im
                save_webp(disp, display_webp, quality=80)

            dw, dh = Image.open(display_webp).size if os.path.exists(display_webp) else (w, h)

            manifest[src.replace("\\", "/")] = {
                "w": w, "h": h,
                "full_webp": full_webp.replace("\\", "/"),
                "display_webp": display_webp.replace("\\", "/"),
                "display_w": dw, "display_h": dh,
            }

    with open(os.path.join(SRC_ROOT, "manifest.json"), "w") as fh:
        json.dump(manifest, fh, indent=2)

    total_before = sum(os.path.getsize(k) for k in manifest)
    total_after = sum(
        os.path.getsize(v["display_webp"]) for v in manifest.values()
    )
    print(f"{len(manifest)} images processed")
    print(f"original jpg total:      {total_before/1024:.0f} KB")
    print(f"display-webp total:      {total_after/1024:.0f} KB")


if __name__ == "__main__":
    main()
