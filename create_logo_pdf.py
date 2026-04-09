"""Create a high-resolution PDF with CloserAI logos drawn natively in reportlab."""
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

OUTPUT_PDF = r"D:\claude code\CloserAI\CloserAI-Logos.pdf"

# Brand colors
BRAND_DARK = HexColor("#1e3a5f")
BRAND_MID = HexColor("#2563eb")
BRAND_LIGHT = HexColor("#3b82f6")
YELLOW = HexColor("#fbbf24")
GRAY = HexColor("#64748b")
DARK_TEXT = HexColor("#0f172a")
LIGHT_GRAY = HexColor("#f3f4f6")


def draw_gradient_rect(c, x, y, w, h, steps=100, radius=0):
    """Draw a rounded rectangle with a linear gradient (dark -> mid -> light)."""
    # Save state
    c.saveState()

    # Create a clipping path for rounded corners
    if radius > 0:
        p = c.beginPath()
        p.moveTo(x + radius, y)
        p.lineTo(x + w - radius, y)
        p.arcTo(x + w - 2*radius, y, x + w, y + 2*radius, startAng=270, extent=90)
        p.lineTo(x + w, y + h - radius)
        p.arcTo(x + w - 2*radius, y + h - 2*radius, x + w, y + h, startAng=0, extent=90)
        p.lineTo(x + radius, y + h)
        p.arcTo(x, y + h - 2*radius, x + 2*radius, y + h, startAng=90, extent=90)
        p.lineTo(x, y + radius)
        p.arcTo(x, y, x + 2*radius, y + 2*radius, startAng=180, extent=90)
        p.close()
        c.clipPath(p, stroke=0, fill=0)

    # Draw gradient as many thin horizontal strips
    for i in range(steps):
        t = i / (steps - 1)
        # Interpolate: 0 -> BRAND_DARK, 0.5 -> BRAND_MID, 1 -> BRAND_LIGHT
        if t < 0.5:
            r = 0x1e + (0x25 - 0x1e) * (t * 2)
            g = 0x3a + (0x63 - 0x3a) * (t * 2)
            b = 0x5f + (0xeb - 0x5f) * (t * 2)
        else:
            tt = (t - 0.5) * 2
            r = 0x25 + (0x3b - 0x25) * tt
            g = 0x63 + (0x82 - 0x63) * tt
            b = 0xeb + (0xf6 - 0xeb) * tt

        c.setFillColorRGB(r / 255, g / 255, b / 255)
        strip_h = h / steps + 1  # +1 to avoid gaps
        c.rect(x, y + h - (i + 1) * (h / steps), w, strip_h, fill=1, stroke=0)

    c.restoreState()


def draw_square_logo(c, cx, cy, size):
    """Draw the square CloserAI logo centered at cx, cy with given size."""
    half = size / 2
    x = cx - half
    y = cy - half
    radius = size * 0.2

    # Gradient background
    draw_gradient_rect(c, x, y, size, size, steps=150, radius=radius)

    # White "C" letter - use thick stroke
    c.saveState()
    c.setStrokeColor(white)
    c.setLineWidth(size * 0.09)
    c.setLineCap(1)  # round

    # Draw the C as a text character instead - cleaner and reliable
    c.setFillColor(white)
    font_size = size * 0.78
    c.setFont("Helvetica-Bold", font_size)
    # Measure and center the C
    c_width = c.stringWidth("C", "Helvetica-Bold", font_size)
    c.drawString(cx - c_width/2 - size*0.02, cy - font_size * 0.32, "C")

    c.restoreState()

    # Yellow AI indicator dot (top-right of C)
    c.setFillColor(YELLOW)
    dot_r = size * 0.04
    c.circle(cx + size * 0.22, cy + size * 0.25, dot_r, fill=1, stroke=0)


def draw_horizontal_logo(c, cx, cy, total_width):
    """Draw the horizontal logo (icon + text) centered at cx, cy."""
    # Icon on left, text on right
    icon_size = total_width * 0.2
    icon_cx = cx - total_width * 0.35
    icon_cy = cy
    draw_square_logo(c, icon_cx, icon_cy, icon_size)

    # Text "Closer" + "AI"
    text_x = icon_cx + icon_size * 0.6
    text_y = cy - icon_size * 0.15
    font_size = icon_size * 0.5

    c.setFillColor(DARK_TEXT)
    c.setFont("Helvetica-Bold", font_size)
    c.drawString(text_x, text_y, "Closer")

    # Measure "Closer" width to position "AI" after it
    closer_width = c.stringWidth("Closer", "Helvetica-Bold", font_size)

    c.setFillColor(BRAND_MID)
    c.drawString(text_x + closer_width, text_y, "AI")

    # Tagline below
    c.setFillColor(GRAY)
    c.setFont("Helvetica", font_size * 0.18)
    c.drawString(text_x, text_y - font_size * 0.35, "AI-Powered Real Estate Lead Conversion")


# ============ START PDF CREATION ============
c = canvas.Canvas(OUTPUT_PDF, pagesize=letter)
width, height = letter

# ============ PAGE 1: COVER ============
# Top gradient bar
for i in range(50):
    t = i / 49
    if t < 0.5:
        r = 0x1e + (0x25 - 0x1e) * (t * 2)
        g = 0x3a + (0x63 - 0x3a) * (t * 2)
        b = 0x5f + (0xeb - 0x5f) * (t * 2)
    else:
        tt = (t - 0.5) * 2
        r = 0x25 + (0x3b - 0x25) * tt
        g = 0x63 + (0x82 - 0x63) * tt
        b = 0xeb + (0xf6 - 0xeb) * tt
    c.setFillColorRGB(r / 255, g / 255, b / 255)
    bar_h = 2 * inch / 50
    c.rect(0, height - (i + 1) * bar_h, width, bar_h + 1, fill=1, stroke=0)

c.setFillColor(white)
c.setFont("Helvetica-Bold", 52)
c.drawCentredString(width/2, height - 1.1*inch, "CloserAI")
c.setFont("Helvetica", 16)
c.drawCentredString(width/2, height - 1.5*inch, "Official Brand Assets")

# Main logo in center
draw_horizontal_logo(c, width/2, height/2, 6*inch)

# Subtitle
c.setFillColor(GRAY)
c.setFont("Helvetica-Oblique", 13)
c.drawCentredString(width/2, 3*inch, "High-Resolution Vector Logo Package")

# Footer
c.setFillColor(BRAND_MID)
c.setFont("Helvetica-Bold", 14)
c.drawCentredString(width/2, 1.5*inch, "closerai-app.vercel.app")

c.setFillColor(GRAY)
c.setFont("Helvetica", 10)
c.drawCentredString(width/2, 1.2*inch, "AI-Powered Real Estate Lead Conversion Platform")
c.drawCentredString(width/2, 1*inch, "Brand Package v1.0")

c.showPage()

# ============ PAGE 2: SQUARE LOGO LARGE ============
c.setFillColor(DARK_TEXT)
c.setFont("Helvetica-Bold", 26)
c.drawString(1*inch, height - 1*inch, "Icon Logo")

c.setFillColor(GRAY)
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 1.3*inch, "For: app icons, social media avatars, favicons, watermarks")

# Large square logo (5 inch)
draw_square_logo(c, width/2, height - 5*inch, 4.5*inch)

# Size variants
c.setFillColor(DARK_TEXT)
c.setFont("Helvetica-Bold", 14)
c.drawString(1*inch, 2.8*inch, "Available Sizes:")

sizes_info = [
    (1.3*inch, "Large"),
    (1*inch, "Medium"),
    (0.7*inch, "Small"),
    (0.5*inch, "Tiny"),
]

x_pos = 1*inch
for size, label in sizes_info:
    draw_square_logo(c, x_pos + size/2, 1.8*inch, size)
    c.setFillColor(GRAY)
    c.setFont("Helvetica", 9)
    c.drawCentredString(x_pos + size/2, 1.8*inch - size/2 - 0.2*inch, label)
    x_pos += size + 0.4*inch

c.showPage()

# ============ PAGE 3: HORIZONTAL LOGO LARGE ============
c.setFillColor(DARK_TEXT)
c.setFont("Helvetica-Bold", 26)
c.drawString(1*inch, height - 1*inch, "Horizontal Logo")

c.setFillColor(GRAY)
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 1.3*inch, "For: email signatures, website headers, letterheads, invoices")

# Extra large horizontal logo
draw_horizontal_logo(c, width/2, height - 3*inch, 6.5*inch)

# Medium version
c.setFillColor(GRAY)
c.setFont("Helvetica", 10)
c.drawString(1*inch, height - 4.8*inch, "Medium size:")
draw_horizontal_logo(c, width/2, height - 5.5*inch, 5*inch)

# Small version
c.setFillColor(GRAY)
c.drawString(1*inch, height - 6.8*inch, "Small size:")
draw_horizontal_logo(c, width/2, height - 7.4*inch, 3.5*inch)

c.showPage()

# ============ PAGE 4: COLOR PALETTE ============
c.setFillColor(DARK_TEXT)
c.setFont("Helvetica-Bold", 26)
c.drawString(1*inch, height - 1*inch, "Brand Colors")

c.setFillColor(GRAY)
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 1.3*inch, "Use these exact colors for all CloserAI materials")

color_data = [
    ("Brand Navy", BRAND_DARK, "#1E3A5F", "30, 58, 95", "Primary dark"),
    ("Brand Blue", BRAND_MID, "#2563EB", "37, 99, 235", "Primary accent"),
    ("Brand Light Blue", BRAND_LIGHT, "#3B82F6", "59, 130, 246", "Highlights"),
    ("Accent Yellow", YELLOW, "#FBBF24", "251, 191, 36", "AI indicator"),
    ("Text Gray", GRAY, "#64748B", "100, 116, 139", "Body text"),
    ("Dark Text", DARK_TEXT, "#0F172A", "15, 23, 42", "Headlines"),
]

y_start = height - 2.2*inch
for i, (name, color, hex_code, rgb, desc) in enumerate(color_data):
    y_pos = y_start - (i * 1.1*inch)

    # Color swatch
    c.setFillColor(color)
    c.roundRect(1*inch, y_pos - 0.7*inch, 1.7*inch, 0.9*inch, 6, fill=1, stroke=0)

    # Info
    c.setFillColor(DARK_TEXT)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(3*inch, y_pos - 0.1*inch, name)

    c.setFillColor(GRAY)
    c.setFont("Helvetica", 11)
    c.drawString(3*inch, y_pos - 0.3*inch, f"HEX: {hex_code}")
    c.drawString(3*inch, y_pos - 0.47*inch, f"RGB: {rgb}")

    c.setFillColor(BRAND_MID)
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(3*inch, y_pos - 0.65*inch, desc)

c.showPage()

# ============ PAGE 5: USAGE GUIDE ============
c.setFillColor(DARK_TEXT)
c.setFont("Helvetica-Bold", 26)
c.drawString(1*inch, height - 1*inch, "Usage Guide")

c.setFillColor(GRAY)
c.setFont("Helvetica", 12)
c.drawString(1*inch, height - 1.3*inch, "Where and how to use each logo variant")

usage = [
    ("Email Signature", "Horizontal", "Paste the horizontal logo below your name. Ideal width: 200px."),
    ("Website Header", "Horizontal", "Top-left corner of your site. Use at 150-250px wide."),
    ("Social Media Profile", "Icon (Square)", "LinkedIn, Twitter, Instagram, Facebook profile picture."),
    ("Browser Favicon", "Icon (Square)", "Auto-applied to your website browser tab."),
    ("Business Cards", "Both", "Horizontal on front, Icon on back."),
    ("Letterhead", "Horizontal", "Top of professional documents at 2 inches wide."),
    ("Invoices", "Horizontal", "Header of invoices and receipts."),
    ("Mobile App Icon", "Icon (Square)", "iOS/Android store app icon."),
    ("Presentation Slides", "Horizontal", "Title slide or footer of each slide."),
    ("Marketing Ads", "Both", "Horizontal for banners, Icon for square posts."),
    ("Print Materials", "Horizontal", "Flyers, brochures, posters."),
    ("Video Watermark", "Icon", "Corner of promotional videos."),
]

y_pos = height - 2*inch
c.setFont("Helvetica", 10)
for use_case, logo_type, description in usage:
    c.setFillColor(BRAND_DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1*inch, y_pos, use_case)

    c.setFillColor(BRAND_MID)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(3*inch, y_pos, logo_type)

    c.setFillColor(GRAY)
    c.setFont("Helvetica", 9)
    c.drawString(4.5*inch, y_pos, description)

    y_pos -= 0.4*inch

# Footer with tips
y_pos = 1.5*inch
c.setFillColor(BRAND_DARK)
c.setFont("Helvetica-Bold", 12)
c.drawString(1*inch, y_pos, "Logo Rules:")

rules = [
    "• Never stretch, rotate, or distort the logo",
    "• Maintain clear space around the logo equal to the 'C' height",
    "• Always use on contrasting backgrounds for readability",
    "• Do not change the colors or add effects",
    "• Minimum size: 100px wide for digital, 0.75 inch for print",
]

c.setFillColor(GRAY)
c.setFont("Helvetica", 9)
y_pos -= 0.3*inch
for rule in rules:
    c.drawString(1*inch, y_pos, rule)
    y_pos -= 0.2*inch

# Bottom bar
c.setFillColor(BRAND_DARK)
c.rect(0, 0, width, 0.5*inch, fill=1, stroke=0)
c.setFillColor(white)
c.setFont("Helvetica-Bold", 10)
c.drawCentredString(width/2, 0.25*inch, "CloserAI | closerai-app.vercel.app | AI-Powered Real Estate Lead Conversion")

c.save()

print(f"PDF created successfully: {OUTPUT_PDF}")
print(f"File size: {os.path.getsize(OUTPUT_PDF)} bytes")
