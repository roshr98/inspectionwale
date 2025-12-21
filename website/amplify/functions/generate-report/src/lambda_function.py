"""
Professional Vehicle Inspection Report Generator - FINAL VERSION
- Vibrant colorful footer icons (red/green/blue)
- 2-column layout for efficient space
- Actual drawn star shapes (golden)
- Light blue background on all pages
- Square corners, no row borders
- Dark gray labels, dark black values
"""

import json
import boto3
import io
import base64
import math
import os
from datetime import datetime
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.graphics.shapes import Drawing, Polygon, String
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# REGISTER HINDI FONT
try:
    FONT_PATH = os.path.join(os.path.dirname(__file__), '..', 'fonts', 'NotoSansDevanagari-Regular.ttf')
    pdfmetrics.registerFont(TTFont('NotoSansHindi', FONT_PATH))
    HINDI_FONT_AVAILABLE = True
    print("✓ Hindi font loaded successfully")
except Exception as e:
    print(f"⚠ Warning: Could not load Hindi font: {e}")
    HINDI_FONT_AVAILABLE = False

# VIBRANT COLOR PALETTE
COLOR_PRIMARY = HexColor('#004a99')      # Primary blue
COLOR_TEXT = HexColor('#000000')         # Dark black for values
COLOR_LABEL = HexColor('#4a4a4a')        # Dark gray for labels
COLOR_META = HexColor('#555555')         # Meta
COLOR_FOOTER = HexColor('#666666')       # Footer
COLOR_PAGE_BG = HexColor('#e8f4f8')      # Light blue page background
COLOR_CARD_BG = HexColor('#ffffff')      # White card background
COLOR_BORDER = HexColor('#e0e0e0')       # Light border
COLOR_STAR_GOLD = HexColor('#fbbf24')    # Vibrant golden star

# EXACT FONT SIZES
FONT_FAMILY = 'Helvetica'
FONT_TITLE = 18 * 0.75       # 13.5pt
FONT_SECTION = 14 * 0.75     # 10.5pt  
FONT_BODY = 12 * 0.75        # 9pt
FONT_SMALL = 11 * 0.75       # 8.25pt

# PAGE SETUP
PAGE_MARGIN = 18 * mm
PAGE_WIDTH, PAGE_HEIGHT = A4
CONTENT_WIDTH = PAGE_WIDTH - (2 * PAGE_MARGIN)


def bilingual_text(english, hindi):
    """Create bilingual text: English / Hindi"""
    if HINDI_FONT_AVAILABLE and hindi:
        return f"{english} / {hindi}"
    return english


def compress_image(image_data, max_width=1200, max_height=1200, quality=85):
    """Compress large phone images"""
    try:
        img = Image.open(io.BytesIO(image_data))
        
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        
        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        compressed_data = output.getvalue()
        
        print(f"✅ Compressed: {len(image_data)/1024:.0f}KB → {len(compressed_data)/1024:.0f}KB")
        return compressed_data
        
    except Exception as e:
        print(f"⚠️ Compression failed: {e}")
        return image_data


def parse_multipart(event):
    """Parse multipart/form-data"""
    content_type = event['headers'].get('content-type') or event['headers'].get('Content-Type', '')
    body = base64.b64decode(event['body']) if event.get('isBase64Encoded') else event['body'].encode()
    boundary = content_type.split('boundary=')[1].encode()
    
    fields = {}
    files = {}
    
    parts = body.split(b'--' + boundary)
    
    for part in parts[1:-1]:
        if not part.strip():
            continue
            
        header_end = part.find(b'\r\n\r\n')
        if header_end == -1:
            continue
            
        headers = part[:header_end].decode('utf-8', errors='ignore')
        content = part[header_end+4:-2]
        
        if 'Content-Disposition' in headers:
            name_match = headers.split('name="')[1].split('"')[0] if 'name="' in headers else None
            
            if not name_match:
                continue
            
            if 'filename="' in headers:
                filename = headers.split('filename="')[1].split('"')[0]
                if any(ext in filename.lower() for ext in ['.jpg', '.jpeg', '.png', '.heic']):
                    content = compress_image(content)
                files[name_match] = {'filename': filename, 'content': content}
            else:
                fields[name_match] = content.decode('utf-8', errors='ignore')
    
    print(f"✅ Parsed {len(fields)} fields, {len(files)} files")
    return fields, files


class FooterCanvas(canvas.Canvas):
    """Custom canvas with colorful icons and light blue background"""
    
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []
        
    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()
        
    def save(self):
        num_pages = len(self.pages)
        for page_num, page in enumerate(self.pages, 1):
            self.__dict__.update(page)
            self.draw_footer(page_num, num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)
    
    def _startPage(self):
        """Draw light blue background on EVERY page"""
        canvas.Canvas._startPage(self)
        self.setFillColor(COLOR_PAGE_BG)
        self.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    
    def draw_footer(self, page_num, total_pages):
        """Draw footer with achievement icons in single line"""
        footer_y = PAGE_MARGIN - 5 * mm
        
        # White footer box
        self.setFillColor(COLOR_CARD_BG)
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.rect(PAGE_MARGIN, footer_y - 3 * mm, 
                 PAGE_WIDTH - 2 * PAGE_MARGIN, 12 * mm, fill=1, stroke=1)
        
        # Logo/Brand on left
        self.setFont(f'{FONT_FAMILY}-Bold', 10)
        self.setFillColor(COLOR_PRIMARY)
        self.drawString(PAGE_MARGIN + 5 * mm, footer_y + 6 * mm, 'InspectionWale')
        
        # Achievement icons - single line
        center_start = PAGE_MARGIN + 50 * mm
        icon_y = footer_y + 5.5 * mm
        
        # Achievement 1: GREEN CHECK + "2000+ Cars inspected"
        icon_x = center_start
        self.setFillColor(HexColor('#22c55e'))
        self.circle(icon_x, icon_y, 2 * mm, fill=1, stroke=0)
        self.setStrokeColor(HexColor('#ffffff'))
        self.setLineWidth(1.2)
        self.line(icon_x - 1 * mm, icon_y, icon_x - 0.3 * mm, icon_y - 1 * mm)
        self.line(icon_x - 0.3 * mm, icon_y - 1 * mm, icon_x + 1.2 * mm, icon_y + 1 * mm)
        self.setFont(FONT_FAMILY, FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        self.drawString(icon_x + 3 * mm, footer_y + 5 * mm, '2000+ Cars inspected')
        
        # Achievement 2: DOCUMENT ICON + "Easy reports"
        icon_x = center_start + 50 * mm
        self.setFillColor(HexColor('#3b82f6'))
        self.roundRect(icon_x - 1.5 * mm, icon_y - 2 * mm, 3 * mm, 4 * mm, 0.3, fill=1, stroke=0)
        self.setFillColor(HexColor('#ffffff'))
        self.rect(icon_x - 1 * mm, icon_y + 0.5 * mm, 2 * mm, 0.3 * mm, fill=1, stroke=0)
        self.rect(icon_x - 1 * mm, icon_y - 0.3 * mm, 2 * mm, 0.3 * mm, fill=1, stroke=0)
        self.rect(icon_x - 1 * mm, icon_y - 1.1 * mm, 2 * mm, 0.3 * mm, fill=1, stroke=0)
        self.setFont(FONT_FAMILY, FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        self.drawString(icon_x + 3 * mm, footer_y + 5 * mm, 'Easy reports')
        
        # Achievement 3: RUPEE ICON + "Pricing"
        icon_x = center_start + 85 * mm
        self.setFillColor(HexColor('#f59e0b'))
        self.circle(icon_x, icon_y, 2 * mm, fill=1, stroke=0)
        self.setFont(f'{FONT_FAMILY}-Bold', 8)
        self.setFillColor(HexColor('#ffffff'))
        self.drawCentredString(icon_x, icon_y - 1 * mm, '₹')
        self.setFont(FONT_FAMILY, FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        self.drawString(icon_x + 3 * mm, footer_y + 5 * mm, 'Pricing')
        
        # Page number
        self.setFont(FONT_FAMILY, FONT_SMALL - 1)
        self.setFillColor(COLOR_META)
        self.drawCentredString(PAGE_WIDTH / 2, footer_y + 1 * mm, f'Page {page_num} of {total_pages}')
        
        # Contact info at bottom
        self.setFont(FONT_FAMILY, FONT_SMALL - 2)
        self.setFillColor(COLOR_LABEL)
        contact_text = 'hello@inspectionwale.com | 9167558998 | inspectionwale.com'
        self.drawCentredString(PAGE_WIDTH / 2, footer_y - 1.5 * mm, contact_text)


def create_header(data):
    """Create new header: Hassle-Free Car Buying Experience"""
    report_id = f"INS-{int(datetime.now().timestamp())}"
    report_date = datetime.now().strftime('%d %b %Y')
    location = data.get('inspection_location', 'Mumbai')
    inspector_name = data.get('inspector_name', 'Certified Inspector')
    
    # Main title
    title_style = ParagraphStyle(
        'HeaderTitle',
        fontSize=16,
        textColor=COLOR_PRIMARY,
        fontName=f'{FONT_FAMILY}-Bold',
        alignment=TA_CENTER,
        spaceAfter=2,
    )
    
    # Subtitle
    subtitle_style = ParagraphStyle(
        'HeaderSubtitle',
        fontSize=12,
        textColor=COLOR_PRIMARY,
        fontName=f'{FONT_FAMILY}-Bold',
        alignment=TA_CENTER,
        spaceAfter=3,
    )
    
    # Tagline
    tagline_style = ParagraphStyle(
        'HeaderTagline',
        fontSize=8,
        textColor=COLOR_LABEL,
        fontName=FONT_FAMILY,
        alignment=TA_CENTER,
        spaceAfter=0,
    )
    
    title = Paragraph("VEHICLE INSPECTION REPORT", title_style)
    subtitle = Paragraph("The Hassle-Free Car Buying Experience", subtitle_style)
    tagline = Paragraph("Repair Estimate | Price Advice | Neutral | Uncomplicated | Comprehensive", tagline_style)
    
    # Left side: Title, subtitle, tagline
    left_content = Table(
        [[title], [subtitle], [tagline]],
        colWidths=[120*mm]
    )
    left_content.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    
    # Right side: Inspection details
    meta_style = ParagraphStyle(
        'MetaLabel',
        fontSize=8,
        textColor=COLOR_LABEL,
        fontName=FONT_FAMILY,
        alignment=TA_RIGHT,
    )
    
    meta_value_style = ParagraphStyle(
        'MetaValue',
        fontSize=8,
        textColor=COLOR_TEXT,
        fontName=f'{FONT_FAMILY}-Bold',
        alignment=TA_RIGHT,
    )
    
    right_content = Table([
        [Paragraph("Inspection ID:", meta_style), Paragraph(report_id, meta_value_style)],
        [Paragraph("Date:", meta_style), Paragraph(report_date, meta_value_style)],
        [Paragraph("Location:", meta_style), Paragraph(location, meta_value_style)],
        [Paragraph("Inspector:", meta_style), Paragraph(inspector_name, meta_value_style)],
    ], colWidths=[25*mm, 25*mm])
    
    right_content.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))
    
    # Combine left and right
    header_table = Table([[left_content, right_content]], colWidths=[120*mm, 54*mm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEBELOW', (0, 0), (-1, -1), 2, COLOR_PRIMARY),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_CARD_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    return header_table, report_id


def create_section_header(title):
    """Section header with blue accent bar"""
    style = ParagraphStyle(
        'SectionHeader',
        fontSize=FONT_SECTION,
        textColor=COLOR_PRIMARY,
        fontName=f'{FONT_FAMILY}-Bold',
        spaceAfter=6,
        spaceBefore=8,
        leftIndent=8,
    )
    
    header_para = Paragraph(title, style)
    
    accent_bar = Table([['']], colWidths=[3])
    accent_bar.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), HexColor('#3b82f6')),
        ('LEFTPADDING', (0, 0), (0, 0), 0),
        ('RIGHTPADDING', (0, 0), (0, 0), 0),
    ]))
    
    header_table = Table([[accent_bar, header_para]], colWidths=[3, CONTENT_WIDTH - 3])
    header_table.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    return header_table


def create_two_column_card_table(data_rows, card_padding=14):
    """2-COLUMN layout - NO BORDERS, SQUARE CORNERS"""
    table_data = []
    
    for i in range(0, len(data_rows), 2):
        row = []
        if i < len(data_rows):
            row.extend([data_rows[i][0], data_rows[i][1] or 'N/A'])
        
        if i + 1 < len(data_rows):
            row.extend([data_rows[i+1][0], data_rows[i+1][1] or 'N/A'])
        else:
            row.extend(['', ''])
        
        table_data.append(row)
    
    available_width = CONTENT_WIDTH - 2*card_padding
    col_widths = [
        available_width * 0.20,
        available_width * 0.30,
        available_width * 0.20,
        available_width * 0.30,
    ]
    
    table = Table(table_data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ('FONT', (0, 0), (0, -1), f'{FONT_FAMILY}-Bold', FONT_BODY),
        ('FONT', (1, 0), (1, -1), FONT_FAMILY, FONT_BODY),
        ('TEXTCOLOR', (0, 0), (0, -1), COLOR_LABEL),
        ('TEXTCOLOR', (1, 0), (1, -1), COLOR_TEXT),
        ('FONT', (2, 0), (2, -1), f'{FONT_FAMILY}-Bold', FONT_BODY),
        ('FONT', (3, 0), (3, -1), FONT_FAMILY, FONT_BODY),
        ('TEXTCOLOR', (2, 0), (2, -1), COLOR_LABEL),
        ('TEXTCOLOR', (3, 0), (3, -1), COLOR_TEXT),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (1, -1), 12),
        ('RIGHTPADDING', (2, 0), (3, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ]))
    
    card_data = [[table]]
    card_table = Table(card_data, colWidths=[CONTENT_WIDTH])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_CARD_BG),
        ('BOX', (0, 0), (0, 0), 1, COLOR_BORDER),
        ('LEFTPADDING', (0, 0), (0, 0), card_padding),
        ('RIGHTPADDING', (0, 0), (0, 0), card_padding),
        ('TOPPADDING', (0, 0), (0, 0), card_padding),
        ('BOTTOMPADDING', (0, 0), (0, 0), card_padding),
    ]))
    
    return card_table


def create_star_shape(x, y, size):
    """Create 5-pointed star polygon"""
    points = []
    for i in range(10):
        angle = (i * 36 - 90) * math.pi / 180
        r = size if i % 2 == 0 else size * 0.4
        points.append(x + r * math.cos(angle))
        points.append(y + r * math.sin(angle))
    return points


def create_star_drawing(rating):
    """Draw actual star shapes"""
    full_stars = int(rating)
    half_star = (rating % 1) >= 0.5
    empty_stars = 5 - full_stars - (1 if half_star else 0)
    
    d = Drawing(120, 16)
    star_size = 6
    x_start = 0
    y_center = 8
    
    vibrant_gold = HexColor('#fbbf24')
    
    for i in range(full_stars):
        x = x_start + i * 14
        star = Polygon(create_star_shape(x + star_size, y_center, star_size))
        star.fillColor = vibrant_gold
        star.strokeColor = HexColor('#f59e0b')
        star.strokeWidth = 0.8
        d.add(star)
    
    if half_star:
        x = x_start + full_stars * 14
        star = Polygon(create_star_shape(x + star_size, y_center, star_size))
        star.fillColor = vibrant_gold
        star.strokeColor = HexColor('#f59e0b')
        star.strokeWidth = 0.8
        d.add(star)
    
    for i in range(empty_stars):
        x = x_start + (full_stars + (1 if half_star else 0) + i) * 14
        star = Polygon(create_star_shape(x + star_size, y_center, star_size))
        star.fillColor = HexColor('#f3f4f6')
        star.strokeColor = HexColor('#d1d5db')
        star.strokeWidth = 0.8
        d.add(star)
    
    text = String(75, 4, f'({rating}/5)', fontSize=8, fillColor=HexColor('#6b7280'))
    d.add(text)
    
    return d


def create_star_rating_table(label, rating):
    """Star rating with drawn stars"""
    star_drawing = create_star_drawing(rating)
    return [label, star_drawing]


def create_ratings_card(data):
    """Ratings card with actual drawn stars and bilingual labels"""
    ratings_data = [
        create_star_rating_table(
            bilingual_text('Interior', 'आंतरिक'),
            float(data.get('rating_interior', 0))
        ),
        create_star_rating_table(
            bilingual_text('Exterior', 'बाहरी'),
            float(data.get('rating_exterior', 0))
        ),
        create_star_rating_table(
            bilingual_text('Engine', 'इंजन'),
            float(data.get('rating_engine', 0))
        ),
        create_star_rating_table(
            bilingual_text('Structure', 'संरचना'),
            float(data.get('rating_structure', 0))
        ),
        create_star_rating_table(
            bilingual_text('Test Drive', 'टेस्ट ड्राइव'),
            float(data.get('rating_test_drive', 0))
        ),
        create_star_rating_table(
            bilingual_text('Electrical', 'विद्युतीय'),
            float(data.get('rating_electrical', 0))
        ),
    ]
    
    col_widths = [(CONTENT_WIDTH - 28) * 0.36, (CONTENT_WIDTH - 28) * 0.64]
    
    table = Table(ratings_data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ('FONT', (0, 0), (0, -1), f'{FONT_FAMILY}-Bold', FONT_BODY),
        ('TEXTCOLOR', (0, 0), (0, -1), COLOR_LABEL),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    card_data = [[table]]
    card_table = Table(card_data, colWidths=[CONTENT_WIDTH])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_CARD_BG),
        ('BOX', (0, 0), (0, 0), 1, COLOR_BORDER),
        ('LEFTPADDING', (0, 0), (0, 0), 14),
        ('RIGHTPADDING', (0, 0), (0, 0), 14),
        ('TOPPADDING', (0, 0), (0, 0), 14),
        ('BOTTOMPADDING', (0, 0), (0, 0), 14),
    ]))
    
    return card_table


def create_notes_card(content):
    """Notes card - square corners"""
    style = ParagraphStyle(
        'Notes',
        fontSize=FONT_BODY,
        fontName=FONT_FAMILY,
        textColor=COLOR_TEXT,
        leading=14
    )
    
    notes_para = Paragraph(content, style)
    
    card_data = [[notes_para]]
    card_table = Table(card_data, colWidths=[CONTENT_WIDTH])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_CARD_BG),
        ('BOX', (0, 0), (0, 0), 1, COLOR_BORDER),
        ('LEFTPADDING', (0, 0), (0, 0), 14),
        ('RIGHTPADDING', (0, 0), (0, 0), 14),
        ('TOPPADDING', (0, 0), (0, 0), 14),
        ('BOTTOMPADDING', (0, 0), (0, 0), 14),
    ]))
    
    return card_table


def create_image_grid(image_files, captions):
    """3-column image grid"""
    if not image_files:
        return None
    
    elements = []
    image_width = (CONTENT_WIDTH - 24) / 3
    image_height = 90 * 0.75
    
    row_data = []
    for i, (field_name, img_data) in enumerate(image_files.items()):
        img_obj = io.BytesIO(img_data['content'])
        img = RLImage(img_obj, width=image_width, height=image_height)
        
        caption = captions[i] if i < len(captions) else field_name.replace('_', ' ').title()
        
        caption_style = ParagraphStyle(
            'Caption',
            fontSize=FONT_SMALL,
            fontName=FONT_FAMILY,
            textColor=COLOR_LABEL,
            alignment=1
        )
        caption_para = Paragraph(caption, caption_style)
        
        cell_data = [[caption_para], [img]]
        cell_table = Table(cell_data, colWidths=[image_width])
        cell_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 1), COLOR_CARD_BG),
            ('BOX', (0, 0), (0, 1), 1, COLOR_BORDER),
            ('ALIGN', (0, 0), (0, 1), 'CENTER'),
            ('VALIGN', (0, 0), (0, 1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (0, 0), 10),
            ('BOTTOMPADDING', (0, 0), (0, 0), 6),
            ('TOPPADDING', (0, 1), (0, 1), 6),
            ('BOTTOMPADDING', (0, 1), (0, 1), 10),
        ]))


def create_highlights_card(data):
    """Create Key Highlights card with bilingual labels"""
    highlights_data = [
        (bilingual_text('Is car Accidental', 'क्या कार दुर्घटनाग्रस्त है'), data.get('isAccidental', 'No')),
        (bilingual_text('Flood Damage', 'बाढ़ क्षति'), data.get('floodDamage', 'No')),
        (bilingual_text('RC & Chassis Match', 'आरसी और चेसिस मेल'), data.get('rcChassisMatch', 'Yes')),
        (bilingual_text('Fire Damage', 'आग क्षति'), data.get('fireDamage', 'No')),
        (bilingual_text('Service Log Available', 'सर्विस लॉग'), data.get('serviceLogAvailable', 'No')),
        (bilingual_text('Insurance Type', 'बीमा प्रकार'), data.get('insuranceType', 'Comprehensive')),
        (bilingual_text('Insurance Validity', 'बीमा वैधता'), data.get('insuranceValidity', 'N/A')),
    ]
    return create_two_column_card_table(highlights_data)


def create_additional_comments_card(data):
    """Create Additional Comments card with bilingual section headers"""
    comments_sections = [
        (bilingual_text('Engine Comment', 'इंजन टिप्पणी'), data.get('engineComment', '')),
        (bilingual_text('Structure Comment', 'संरचना टिप्पणी'), data.get('structureComment', '')),
        (bilingual_text('Test Drive Comment', 'टेस्ट ड्राइव टिप्पणी'), data.get('testDriveComment', '')),
        (bilingual_text('Exterior Comment', 'बाहरी टिप्पणी'), data.get('exteriorComment', '')),
        (bilingual_text('Interior Comment', 'आंतरिक टिप्पणी'), data.get('interiorComment', '')),
    ]
    
    # Filter out empty comments
    comments_data = [(label, comment) for label, comment in comments_sections if comment]
    
    if not comments_data:
        return None
    
    return create_two_column_card_table(comments_data)


def create_document_images_grid(image_files):
    """Create 2x2 grid for document images with bilingual captions"""
    if not image_files:
        return None
    
    # Define document image fields with bilingual captions
    doc_fields = [
        ('doc_rhs_apron', bilingual_text('RHS Apron', 'दाहिनी एप्रन')),
        ('doc_lhs_apron', bilingual_text('LHS Apron', 'बाईं एप्रन')),
        ('doc_chassis_plate', bilingual_text('Chassis Plate', 'चेसिस प्लेट')),
        ('doc_cng_plate', bilingual_text('CNG Plate', 'सीएनजी प्लेट')),
    ]
    
    image_width = (CONTENT_WIDTH - 12) / 2
    image_height = 65 * mm
    
    rows = []
    row_data = []
    
    for field_name, caption in doc_fields:
        if field_name in image_files:
            img_obj = io.BytesIO(image_files[field_name]['content'])
            img = RLImage(img_obj, width=image_width, height=image_height)
            
            caption_style = ParagraphStyle(
                'DocCaption',
                fontSize=FONT_BODY,
                fontName=f'{FONT_FAMILY}-Bold',
                textColor=COLOR_LABEL,
                alignment=TA_CENTER
            )
            caption_para = Paragraph(caption, caption_style)
            
            cell_data = [[caption_para], [img]]
            cell_table = Table(cell_data, colWidths=[image_width])
            cell_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, 1), COLOR_CARD_BG),
                ('BOX', (0, 0), (0, 1), 1, COLOR_BORDER),
                ('ALIGN', (0, 0), (0, 1), 'CENTER'),
                ('VALIGN', (0, 0), (0, 1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (0, 0), 8),
                ('BOTTOMPADDING', (0, 0), (0, 0), 6),
                ('TOPPADDING', (0, 1), (0, 1), 6),
                ('BOTTOMPADDING', (0, 1), (0, 1), 8),
            ]))
            
            row_data.append(cell_table)
            
            # Create row every 2 images
            if len(row_data) == 2:
                rows.append(row_data)
                row_data = []
    
    # Add remaining images if any
    if row_data:
        while len(row_data) < 2:
            row_data.append('')  # Empty cell
        rows.append(row_data)
    
    if not rows:
        return None
    
    grid_table = Table(rows, colWidths=[image_width, image_width])
    grid_table.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    return grid_table
        
        row_data.append(cell_table)
        
        if len(row_data) == 3 or i == len(image_files) - 1:
            while len(row_data) < 3:
                row_data.append('')
            
            row_table = Table([row_data], colWidths=[image_width] * 3)
            row_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(row_table)
            elements.append(Spacer(1, 12))
            row_data = []
    
    return elements


def generate_pdf(data, image_files):
    """Generate PDF with final design"""
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=PAGE_MARGIN,
        rightMargin=PAGE_MARGIN,
        topMargin=PAGE_MARGIN,
        bottomMargin=PAGE_MARGIN + 15*mm,
        title=f"Vehicle Inspection Report - {data.get('registrationNumber', 'UNKNOWN')}"
    )
    
    story = []
    
    # HEADER
    header_table, report_id = create_header(data)
    story.append(header_table)
    story.append(Spacer(1, 10))
    
    # VEHICLE DETAILS - 2 COLUMN
    story.append(create_section_header('Vehicle Registration Details'))
    vehicle_data = [
        (bilingual_text('Vehicle Number', 'गाड़ी नंबर'), data.get('registrationNumber')),
        (bilingual_text('Make / Model', 'कंपनी / मॉडल'), f"{data.get('make', '')} {data.get('model', '')}"),
        (bilingual_text('Variant', 'वेरिएंट'), data.get('variant')),
        (bilingual_text('Chassis Number', 'चेसिस नंबर'), data.get('chassisNumber') or data.get('vinNumber')),
        (bilingual_text('Engine Number', 'इंजन नंबर'), data.get('engineNumber')),
        (bilingual_text('Manufacturing Date', 'वाहन निर्माण की तारीख'), data.get('manufactureYear')),
        (bilingual_text('Registration Date', 'वाहन पंजीकरण तारीख'), data.get('registrationDate')),
        (bilingual_text('Fuel Type', 'ईंधन प्रकार'), data.get('fuelType')),
        (bilingual_text('Color', 'रंग'), data.get('color')),
        (bilingual_text('Odometer Reading', 'ओडोमीटर रीडिंग'), f"{data.get('odometerReading', '')} km"),
        (bilingual_text('Number of Owners', 'मालिकों की संख्या'), data.get('ownersCount')),
        (bilingual_text('RC Type', 'आर सी प्रकार'), data.get('rcType', 'Individual')),
        (bilingual_text('Hypothecation', 'लोन'), data.get('hypothecation', 'No')),
    ]
    
    # Add CNG details if applicable
    if data.get('fuelType', '').upper() in ['CNG', 'CNG+PETROL', 'PETROL+CNG']:
        vehicle_data.extend([
            (bilingual_text('CNG Fitment Type', 'CNG फिटमेंट प्रकार'), data.get('cng_fitment_type', 'N/A')),
            (bilingual_text('CNG Validity Date', 'CNG वैधता तिथि'), data.get('cng_validity_date', 'N/A')),
            (bilingual_text('CNG Endorsed on RC', 'RC पर CNG endorsed'), data.get('cng_endorsed_rc', 'N/A')),
        ])
    
    story.append(create_two_column_card_table(vehicle_data))
    story.append(Spacer(1, 12))
    
    # RATINGS SECTION
    story.append(create_section_header('Overall Ratings'))
    story.append(create_ratings_card(data))
    story.append(Spacer(1, 12))
    
    # OWNER DETAILS - 2 COLUMN
    story.append(create_section_header('Current Owner Details'))
    owner_data = [
        ('Owner Name', data.get('ownerName')),
        ('Contact Number', data.get('ownerContact')),
        ('Email Address', data.get('ownerEmail')),
        ('Inspection Location', data.get('location')),
    ]
    story.append(create_two_column_card_table(owner_data))
    story.append(Spacer(1, 12))
    
    # INSPECTOR DETAILS - 2 COLUMN
    story.append(create_section_header('Inspection Details'))
    inspector_data = [
        ('Inspector Name', data.get('inspectorName')),
        ('Inspection Date', datetime.now().strftime('%d %b %Y')),
    ]
    story.append(create_two_column_card_table(inspector_data))
    
    # PAGE BREAK BEFORE PAGE 2
    story.append(PageBreak())
    
    # PAGE 2: KEY HIGHLIGHTS + DOCUMENTS
    story.append(create_section_header('Key Highlights'))
    story.append(create_highlights_card(data))
    story.append(Spacer(1, 12))
    
    # ADDITIONAL COMMENTS
    comments_card = create_additional_comments_card(data)
    if comments_card:
        story.append(create_section_header('Additional Comments'))
        story.append(comments_card)
        story.append(Spacer(1, 12))
    
    # DOCUMENT IMAGES (2x2 grid)
    doc_images_grid = create_document_images_grid(image_files)
    if doc_images_grid:
        story.append(create_section_header('Important Documents'))
        story.append(doc_images_grid)
        story.append(Spacer(1, 12))
    
    # DETAILED NOTES
    if data.get('paintNotes') or data.get('interiorNotes') or data.get('engineNotes'):
        story.append(create_section_header('Detailed Inspection Notes'))
        notes_text = ""
        if data.get('paintNotes'):
            notes_text += f"<b>Exterior/Paint:</b> {data.get('paintNotes')}<br/><br/>"
        if data.get('interiorNotes'):
            notes_text += f"<b>Interior:</b> {data.get('interiorNotes')}<br/><br/>"
        if data.get('engineNotes'):
            notes_text += f"<b>Engine:</b> {data.get('engineNotes')}<br/><br/>"
        if data.get('tiresNotes'):
            notes_text += f"<b>Tires & Wheels:</b> {data.get('tiresNotes')}<br/><br/>"
        if data.get('structureNotes'):
            notes_text += f"<b>Structure:</b> {data.get('structureNotes')}<br/><br/>"
        if data.get('testDriveNotes'):
            notes_text += f"<b>Test Drive:</b> {data.get('testDriveNotes')}<br/><br/>"
        story.append(create_notes_card(f'<font face="Helvetica">{notes_text.rstrip("<br/><br/>")}</font>'))
        story.append(Spacer(1, 12))
    
    # ISSUES & RECOMMENDATIONS
    if data.get('issuesFound') or data.get('recommendations'):
        story.append(create_section_header('Issues & Recommendations'))
        issues_text = ""
        if data.get('issuesFound'):
            issues_text += f"<b>Issues Found:</b><br/>{data.get('issuesFound')}<br/><br/>"
        if data.get('recommendations'):
            issues_text += f"<b>Recommendations:</b><br/>{data.get('recommendations')}"
        story.append(create_notes_card(f'<font face="Helvetica">{issues_text}</font>'))
        story.append(Spacer(1, 12))
    
    # RATINGS - Keep together
    ratings_section = [
        create_section_header('Overall Ratings'),
        create_ratings_card()
    ]
    story.append(KeepTogether(ratings_section))
    story.append(Spacer(1, 16))
    
    # PHOTOS
    if image_files:
        story.append(create_section_header('Vehicle Photos'))
        captions = ['RC Book', 'Chassis Plate', 'Odometer', 'Front Bumper', 'Bonnet', 
                   'Grille', 'Dashboard', 'Seats', 'Engine Bay']
        image_elements = create_image_grid(image_files, captions)
        if image_elements:
            for elem in image_elements:
                story.append(elem)
    
    # Build PDF
    doc.build(story, canvasmaker=FooterCanvas)
    
    pdf_data = buffer.getvalue()
    buffer.close()
    
    return pdf_data, report_id


def lambda_handler(event, context):
    """Main Lambda handler"""
    try:
        # Handle OPTIONS request for CORS preflight
        if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '86400'
                },
                'body': ''
            }
        
        print("📄 Starting PDF generation...")
        print(f"Event keys: {event.keys()}")
        print(f"Request method: {event.get('requestContext', {}).get('http', {}).get('method')}")
        
        # Parse form data
        fields, files = parse_multipart(event)
        
        # Generate PDF
        pdf_data, report_id = generate_pdf(fields, files)
        
        # Return PDF as base64-encoded data
        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        
        print(f"✅ PDF generated successfully, size: {len(pdf_data)} bytes")
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'reportId': report_id,
                'pdfData': pdf_base64,
                'filename': f'Inspection_Report_{report_id}.pdf',
                'message': 'Report generated successfully!'
            })
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Print full event for debugging
        print(f"Full event: {json.dumps(event, default=str)}")
        
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'traceback': traceback.format_exc()
            })
        }
