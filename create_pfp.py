"""Create Gmail PFP-sized logo PNG with gradient using Pillow."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import math

OUTPUT_DIR = r"D:\claude code\CloserAI\public"

# Gmail recommends at least 250x250, Google uses up to 512x512
SIZES = [
    (512, "logo-pfp-512.png"),   # High-res for Gmail
    (250, "logo-pfp-250.png"),   # Gmail minimum
    (400, "logo-pfp-400.png"),   # Sweet spot for most uses
]

# Brand colors (RGB)
BRAND_DARK = (30, 58, 95)      # #1E3A5F
BRAND_MID = (37, 99, 235)      # #2563EB
BRAND_LIGHT = (59, 130, 246)   # #3B82F6
YELLOW = (251, 191, 36)        # #FBBF24
WHITE = (255, 255, 255)


def lerp_color(c1, c2, t):
    """Linear interpolate between two RGB tuples."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def get_gradient_color(t):
    """Get color at position t (0-1) along the brand gradient."""
    if t < 0.5:
        return lerp_color(BRAND_DARK, BRAND_MID, t * 2)
    else:
        return lerp_color(BRAND_MID, BRAND_LIGHT, (t - 0.5) * 2)


def create_logo(size, filename):
    """Create a high-quality logo PNG at given size."""
    # Create with transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Create gradient background (diagonal)
    # Since we want a 135-degree gradient, we need to paint along that axis
    gradient = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    grad_draw = ImageDraw.Draw(gradient)

    # Draw gradient by calculating color for each pixel based on diagonal position
    for y in range(size):
        for x in range(size):
            # 135-degree gradient: t varies with (x + y)
            t = (x + y) / (2 * size - 2)
            color = get_gradient_color(t)
            grad_draw.point((x, y), fill=color + (255,))

    # Create rounded square mask
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    radius = int(size * 0.22)
    mask_draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)

    # Apply mask to gradient
    rounded_bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rounded_bg.paste(gradient, (0, 0), mask)

    # Paste rounded gradient onto main image
    img.paste(rounded_bg, (0, 0), rounded_bg)
    draw = ImageDraw.Draw(img)

    # Draw the "C" letter in white
    # Use a large bold font
    font_size = int(size * 0.62)
    try:
        # Try to find a bold font
        font_paths = [
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/Arial Bold.ttf",
            "C:/Windows/Fonts/calibrib.ttf",
            "C:/Windows/Fonts/segoeuib.ttf",
        ]
        font = None
        for fp in font_paths:
            if os.path.exists(fp):
                font = ImageFont.truetype(fp, font_size)
                break
        if font is None:
            font = ImageFont.load_default()
    except Exception as e:
        print(f"Font error: {e}")
        font = ImageFont.load_default()

    # Get text bounding box to center it
    bbox = draw.textbbox((0, 0), "C", font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    # Center the text
    text_x = (size - text_w) / 2 - bbox[0]
    text_y = (size - text_h) / 2 - bbox[1]
    # Slight adjustment for visual centering (C looks better slightly left)
    text_x -= size * 0.02

    draw.text((text_x, text_y), "C", fill=WHITE, font=font)

    # Add yellow AI indicator dot (top-right area of the C)
    dot_r = int(size * 0.055)
    dot_cx = int(size * 0.73)
    dot_cy = int(size * 0.27)
    draw.ellipse(
        (dot_cx - dot_r, dot_cy - dot_r, dot_cx + dot_r, dot_cy + dot_r),
        fill=YELLOW + (255,),
    )

    # Save
    output_path = os.path.join(OUTPUT_DIR, filename)
    img.save(output_path, "PNG", optimize=True)
    print(f"Created: {filename} ({size}x{size})")
    return output_path


if __name__ == "__main__":
    for size, filename in SIZES:
        create_logo(size, filename)
    print("\nAll PFP logos created successfully!")
