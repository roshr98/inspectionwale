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
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage, KeepTogether, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.graphics.shapes import Drawing, Polygon, String
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


def create_single_image_card(image_field, image_files, title, content_fields=None, data=None):
    """Create ONE card: image LEFT (48%), content RIGHT (48%)
    This is the function used for ALL images to ensure individual cards"""
    from reportlab.platypus import KeepTogether
    
    if image_field not in image_files:
        return None
    
    # Image dimensions
    image_width = CONTENT_WIDTH * 0.48
    content_right_width = CONTENT_WIDTH * 0.48
    image_height = 95 * mm
    
    img_obj = io.BytesIO(image_files[image_field]['content'])
    img = RLImage(img_obj, width=image_width, height=image_height)
    
    # If content fields provided, create content table
    if content_fields and data:
        content_data = []
        for label, field in content_fields:
            value = data.get(field, 'N/A')
            content_data.append([label, value])
        
        content_table = Table(content_data, colWidths=[content_right_width * 0.58, content_right_width * 0.42])
        content_table.setStyle(TableStyle([
            ('FONT', (0, 0), (0, -1), f'{FONT_FAMILY}-Bold', FONT_SMALL),
            ('FONT', (1, 0), (1, -1), FONT_FAMILY, FONT_SMALL),
            ('TEXTCOLOR', (0, 0), (0, -1), COLOR_LABEL),
            ('TEXTCOLOR', (1, 0), (1, -1), COLOR_TEXT),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        card_content = [[img, content_table]]
    else:
        # Just image with title centered below
        title_style = ParagraphStyle(
            'ImageTitle',
            fontSize=FONT_BODY,
            fontName=f'{FONT_FAMILY}-Bold',
            textColor=COLOR_LABEL,
            alignment=TA_CENTER
        )
        title_para = Paragraph(title, title_style)
        
        # Center the image with title below
        image_cell = [[img], [Spacer(1, 6)], [title_para]]
        image_table = Table(image_cell, colWidths=[image_width])
        image_table.setStyle(TableStyle([
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ]))
        
        card_content = [[image_table]]
    
    card_table = Table(card_content, colWidths=[image_width, content_right_width] if content_fields else [CONTENT_WIDTH])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    return KeepTogether([card_table])


def create_document_images_individual_cards(image_files):
    """Create INDIVIDUAL CARDS for each document image (not grid)"""
    if not image_files:
        return []
    
    # Define document image fields with bilingual captions
    doc_fields = [
        ('doc_rhs_apron', bilingual_text('RHS Apron', 'दाहिनी एप्रन')),
        ('doc_lhs_apron', bilingual_text('LHS Apron', 'बाईं एप्रन')),
        ('doc_chassis_plate', bilingual_text('Chassis Plate', 'चेसिस प्लेट')),
        ('doc_cng_plate', bilingual_text('CNG Plate', 'सीएनजी प्लेट')),
    ]
    
    elements = []
    for field_name, caption in doc_fields:
        if field_name in image_files:
            card = create_single_image_card(field_name, image_files, caption)
            if card:
                elements.append(card)
                elements.append(Spacer(1, 8))
    
    return elements


def create_exterior_page(page_title, image_field, data_fields, image_files, data):
    """Create ONE integrated card: image LEFT, content RIGHT and BOTTOM"""
    from reportlab.platypus import KeepTogether
    
    elements = []
    
    # Page title
    if page_title:
        title = create_section_header(page_title)
        elements.append(title)
        elements.append(Spacer(1, 8))
    
    # Check if image exists
    has_image = image_field in image_files
    
    if has_image:
        # Image dimensions - BIG image on left
        image_width = CONTENT_WIDTH * 0.48
        content_right_width = CONTENT_WIDTH * 0.48
        gap = 8  # Gap between image and content
        image_height = 95 * mm
        
        img_obj = io.BytesIO(image_files[image_field]['content'])
        img = RLImage(img_obj, width=image_width, height=image_height)
        
        # Upper right content (first half of fields)
        split_point = len(data_fields) // 2
        upper_fields = data_fields[:split_point]
        upper_data = []
        for label, field in upper_fields:
            value = data.get(field, 'N/A')
            upper_data.append([label, value])
        
        upper_table = Table(upper_data, colWidths=[content_right_width * 0.58, content_right_width * 0.42])
        upper_table.setStyle(TableStyle([
            ('FONT', (0, 0), (0, -1), f'{FONT_FAMILY}-Bold', FONT_SMALL),
            ('FONT', (1, 0), (1, -1), FONT_FAMILY, FONT_SMALL),
            ('TEXTCOLOR', (0, 0), (0, -1), COLOR_LABEL),
            ('TEXTCOLOR', (1, 0), (1, -1), COLOR_TEXT),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        # Lower right content (second half of fields)
        lower_fields = data_fields[split_point:]
        lower_data = []
        for label, field in lower_fields:
            value = data.get(field, 'N/A')
            lower_data.append([label, value])
        
        lower_table = Table(lower_data, colWidths=[content_right_width * 0.58, content_right_width * 0.42])
        lower_table.setStyle(TableStyle([
            ('FONT', (0, 0), (0, -1), f'{FONT_FAMILY}-Bold', FONT_SMALL),
            ('FONT', (1, 0), (1, -1), FONT_FAMILY, FONT_SMALL),
            ('TEXTCOLOR', (0, 0), (0, -1), COLOR_LABEL),
            ('TEXTCOLOR', (1, 0), (1, -1), COLOR_TEXT),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        # Stack upper and lower content vertically on right side
        right_content = [[upper_table], [Spacer(1, 6)], [lower_table]]
        right_stack = Table(right_content, colWidths=[content_right_width])
        right_stack.setStyle(TableStyle([
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        # ONE INTEGRATED CARD: Image LEFT + Content RIGHT
        card_content = [[img, right_stack]]
        card_table = Table(card_content, colWidths=[image_width, content_right_width])
        card_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), COLOR_CARD_BG),
            ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        elements.append(card_table)
    else:
        # No image, just show details in 2 columns
        details_data = [(label, data.get(field, 'N/A')) for label, field in data_fields]
        details_card = create_two_column_card_table(details_data)
        elements.append(details_card)
    
    # Wrap in KeepTogether to prevent page splits
    if elements:
        return [KeepTogether(elements)]
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
    
    # DOCUMENT IMAGES - Individual cards (not grid)
    doc_image_cards = create_document_images_individual_cards(image_files)
    if doc_image_cards:
        story.append(create_section_header('Important Documents'))
        story.extend(doc_image_cards)
    
    # PAGE 3: FRONT EXTERIOR
    story.append(PageBreak())
    front_fields = [
        (bilingual_text('Front Bumper Condition', 'सामने बम्पर की स्थिति'), 'front_bumper_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_front_bumper'),
        (bilingual_text('Is Repainted', 'क्या फिर से रंगा गया'), 'is_front_bumper_repainted'),
        (bilingual_text('Hood/Bonnet Condition', 'बोनट की स्थिति'), 'hood_condition'),
        (bilingual_text('Bonnet Paint Depth (µm)', 'बोनट पेंट की गहराई'), 'paint_depth_hood'),
        (bilingual_text('Is Bonnet Repainted', 'क्या बोनट फिर से रंगा गया'), 'is_hood_repainted'),
        (bilingual_text('Is Bonnet Company Fitted', 'क्या कंपनी फिटेड है'), 'is_hood_company_fitted'),
        (bilingual_text('Front Grill Condition', 'सामने ग्रिल'), 'front_grill_condition'),
        (bilingual_text('Is Front Windshield Original', 'क्या विंडशील्ड मूल है'), 'is_front_windshield_original'),
        (bilingual_text('Front Windshield Condition', 'विंडशील्ड की स्थिति'), 'front_windshield_condition'),
        (bilingual_text('Headlight Condition', 'हेडलाइट की स्थिति'), 'headlight_condition'),
    ]
    story.extend(create_exterior_page('Front Exterior', 'photo_front', front_fields, image_files, data))
    
    # PAGE 4: RHS EXTERIOR
    story.append(PageBreak())
    rhs_fields = [
        (bilingual_text('RHS Fender Condition', 'दाएं फेंडर'), 'rhs_fender_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_rhs_fender'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_rhs_fender_repainted'),
        (bilingual_text('RHS Front Door Condition', 'दाएं सामने दरवाज़ा'), 'rhs_front_door_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_rhs_front_door'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_rhs_front_door_repainted'),
        (bilingual_text('Is Company Fitted', 'कंपनी फिटेड'), 'is_rhs_front_door_company_fitted'),
        (bilingual_text('RHS Quarter Panel Condition', 'क्वार्टर पैनल'), 'rhs_quarter_panel_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_rhs_quarter'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_rhs_quarter_repainted'),
        (bilingual_text('RHS Rear Door Condition', 'पीछे दरवाज़ा'), 'rhs_rear_door_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_rhs_rear_door'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_rhs_rear_door_repainted'),
        (bilingual_text('Is Company Fitted', 'कंपनी फिटेड'), 'is_rhs_rear_door_company_fitted'),
        (bilingual_text('RHS Windows Original', 'विंडोज़ मूल'), 'is_rhs_windows_company_fitted'),
        (bilingual_text('RHS Side Mirror Condition', 'साइड मिरर'), 'rhs_side_mirror_condition'),
    ]
    story.extend(create_exterior_page('Right Side (RHS) Exterior', 'photo_rhs', rhs_fields, image_files, data))
    
    # PAGE 5: LHS EXTERIOR
    story.append(PageBreak())
    lhs_fields = [
        (bilingual_text('LHS Fender Condition', 'बाएं फेंडर'), 'lhs_fender_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_lhs_fender'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_lhs_fender_repainted'),
        (bilingual_text('LHS Front Door Condition', 'बाएं सामने दरवाज़ा'), 'lhs_front_door_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_lhs_front_door'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_lhs_front_door_repainted'),
        (bilingual_text('Is Company Fitted', 'कंपनी फिटेड'), 'is_lhs_front_door_company_fitted'),
        (bilingual_text('LHS Quarter Panel Condition', 'क्वार्टर पैनल'), 'lhs_quarter_panel_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_lhs_quarter'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_lhs_quarter_repainted'),
        (bilingual_text('LHS Rear Door Condition', 'पीछे दरवाज़ा'), 'lhs_rear_door_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_lhs_rear_door'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_lhs_rear_door_repainted'),
        (bilingual_text('Is Company Fitted', 'कंपनी फिटेड'), 'is_lhs_rear_door_company_fitted'),
        (bilingual_text('LHS Windows Original', 'विंडोज़ मूल'), 'is_lhs_windows_company_fitted'),
        (bilingual_text('LHS Side Mirror Condition', 'साइड मिरर'), 'lhs_side_mirror_condition'),
    ]
    story.extend(create_exterior_page('Left Side (LHS) Exterior', 'photo_lhs', lhs_fields, image_files, data))
    
    # PAGE 6: REAR EXTERIOR
    story.append(PageBreak())
    rear_fields = [
        (bilingual_text('Rear Bumper Condition', 'पीछे बम्पर'), 'rear_bumper_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_rear_bumper'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_rear_bumper_repainted'),
        (bilingual_text('Rear Windshield Condition', 'पीछे विंडशील्ड'), 'rear_windshield_condition'),
        (bilingual_text('Is Original', 'मूल है'), 'is_rear_windshield_original'),
        (bilingual_text('Tail Gate Condition', 'टेल गेट'), 'tail_gate_condition'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_tail_gate'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_tail_gate_repainted'),
        (bilingual_text('Is Original', 'मूल है'), 'is_tail_gate_company_fitted'),
        (bilingual_text('Tail Lights Condition', 'टेल लाइट्स'), 'tail_lights_condition'),
        (bilingual_text('Roof Top Condition', 'छत'), 'roof_top_condition'),
        (bilingual_text('Roof Type', 'छत प्रकार'), 'roof_type'),
        (bilingual_text('Paint Depth (µm)', 'पेंट की गहराई'), 'paint_depth_roof'),
        (bilingual_text('Is Repainted', 'फिर से रंगा गया'), 'is_roof_repainted'),
    ]
    story.extend(create_exterior_page('Rear Exterior', 'photo_rear', rear_fields, image_files, data))
    
    # PAGES 7-8: INTERIOR
    story.append(PageBreak())
    dashboard_fields = [
        (bilingual_text('Is MIL Light On', 'MIL लाइट चालू है'), 'is_mil_light_on'),
        (bilingual_text('Dashboard Condition', 'डैशबोर्ड'), 'dashboard_condition'),
        (bilingual_text('Music System Working', 'म्यूजिक सिस्टम'), 'music_system_working'),
        (bilingual_text('Steering Controls', 'स्टीयरिंग कंट्रोल'), 'steering_controls_working'),
        (bilingual_text('Paddle Shifters', 'पैडल शिफ्टर्स'), 'paddle_shifters_working'),
        (bilingual_text('Hand Brake', 'हैंड ब्रेक'), 'hand_brake_working'),
        (bilingual_text('Speakers', 'स्पीकर'), 'speakers_working'),
        (bilingual_text('AC Vents', 'AC वेंट'), 'ac_vents_condition'),
        (bilingual_text('Is AC Working', 'AC काम कर रहा है'), 'is_ac_working'),
        (bilingual_text('Steering Type', 'स्टीयरिंग प्रकार'), 'steering_type'),
        (bilingual_text('Cruise Control', 'क्रूज़ कंट्रोल'), 'cruise_control_available'),
        (bilingual_text('Navigation System', 'नेविगेशन'), 'navigation_system_working'),
        (bilingual_text('Glove Box', 'ग्लव बॉक्स'), 'glove_box_condition'),
        (bilingual_text('Cabin Lights', 'केबिन लाइट'), 'cabin_lights_working'),
        (bilingual_text('Headlights', 'हेडलाइट्स'), 'headlights_working'),
        (bilingual_text('Wipers', 'वाइपर्स'), 'wipers_working'),
        (bilingual_text('Trip Switch', 'ट्रिप स्विच'), 'trip_switch_working'),
        (bilingual_text('Boot Lever', 'बूट लीवर'), 'boot_lever_working'),
        (bilingual_text('Indicators', 'इंडिकेटर्स'), 'indicators_working'),
        (bilingual_text('Central Lock', 'सेंट्रल लॉक'), 'central_lock_working'),
        (bilingual_text('Rear Wiper', 'पीछे वाइपर'), 'rear_wiper_working'),
        (bilingual_text('Rear View Mirror', 'रियर व्यू मिरर'), 'rear_view_mirror_working'),
        (bilingual_text('Bonnet Lever', 'बोनट लीवर'), 'bonnet_lever_working'),
        (bilingual_text('Side Mirror Adjust', 'साइड मिरर'), 'side_mirror_adjustments_working'),
        (bilingual_text('Fuel Lid Lever', 'फ्यूल लीवर'), 'fuel_lid_lever_working'),
        (bilingual_text('Power Windows', 'पावर विंडोज़'), 'power_windows_working'),
    ]
    story.append(create_section_header('Interior - Dashboard & Controls'))
    story.extend(create_exterior_page('', 'photo_dashboard', dashboard_fields, image_files, data))
    
    story.append(Spacer(1, 12))
    story.append(PageBreak())
    cabin_fields = [
        (bilingual_text('Front Seat Condition', 'सामने सीट'), 'front_seat_condition'),
        (bilingual_text('Seat Adjustment Type', 'सीट एडजस्टमेंट'), 'seat_adjustment_type'),
        (bilingual_text('Seat Adjustments', 'एडजस्टमेंट काम'), 'seat_adjustments_working'),
        (bilingual_text('Seat Belts', 'सीट बेल्ट'), 'seat_belts_working'),
        (bilingual_text('Front RHS Panel', 'दाईं पैनल'), 'front_rhs_interior_panel'),
        (bilingual_text('Arm Rest', 'आर्म रेस्ट'), 'arm_rest_condition'),
        (bilingual_text('Front LHS Panel', 'बाईं पैनल'), 'front_lhs_interior_panel'),
        (bilingual_text('Rear Seat Condition', 'पीछे सीट'), 'rear_seat_condition'),
        (bilingual_text('Rear Seatbelts', 'सीटबेल्ट'), 'rear_seatbelts_working'),
        (bilingual_text('Rear Arm-rest', 'आर्म-रेस्ट'), 'rear_arm_rest_condition'),
        (bilingual_text('Rear RHS Panel', 'दाईं पैनल'), 'rear_rhs_interior_panel'),
        (bilingual_text('Rear AC Vent', 'पीछे AC वेंट'), 'rear_ac_vent'),
        (bilingual_text('Rear LHS Panel', 'बाईं पैनल'), 'rear_lhs_interior_panel'),
        (bilingual_text('Boot Condition', 'बूट'), 'boot_condition'),
        (bilingual_text('Jack & Car Kit', 'जैक किट'), 'jack_car_kit_available'),
    ]
    story.append(create_section_header('Interior - Seats & Cabin'))
    story.extend(create_exterior_page('', 'photo_cabin', cabin_fields, image_files, data))
    
    # PAGE 9: ENGINE
    story.append(Spacer(1, 12))
    story.append(PageBreak())
    engine_fields = [
        (bilingual_text('Oil Leaks', 'तेल रिसाव'), 'engine_oil_leaks'),
        (bilingual_text('Battery Condition', 'बैटरी'), 'battery_condition'),
        (bilingual_text('Hose Pipes', 'होज़ पाइप'), 'hose_pipes_condition'),
        (bilingual_text('Engine Oil', 'इंजन ऑयल'), 'engine_oil_condition'),
        (bilingual_text('Wiring', 'वायरिंग'), 'wiring_condition'),
        (bilingual_text('Engine Mounting', 'इंजन माउंटिंग'), 'engine_mounting'),
        (bilingual_text('Brake Oil Level', 'ब्रेक ऑयल'), 'brake_oil_level'),
        (bilingual_text('Coolant Level', 'कूलेंट'), 'coolant_level'),
        (bilingual_text('Belts', 'बेल्ट'), 'belts_condition'),
        (bilingual_text('Firewall Rust Free', 'फायरवॉल जंग मुक्त'), 'firewall_rust_free'),
        (bilingual_text('Repair Cost (₹)', 'मरम्मत लागत'), 'engine_repair_cost'),
    ]
    story.append(create_section_header('Engine Inspection'))
    story.extend(create_exterior_page('', 'photo_engine', engine_fields, image_files, data))
    
    # PAGE 10: TIRES/WHEELS - 5 INDIVIDUAL CARDS (ONE PER TIRE)
    story.append(Spacer(1, 12))
    story.append(PageBreak())
    story.append(create_section_header('Tires & Wheels / टायर और पहिए'))
    
    # Each tire gets its OWN card with image LEFT and content RIGHT
    tire_specs = [
        ('Front RHS Tire', 'photo_tire_front_rhs', [
            (bilingual_text('Tire Brand', 'टायर ब्रांड'), 'tire_brand_front_rhs'),
            (bilingual_text('Wheel Type', 'व्हील प्रकार'), 'wheel_type_front_rhs'),
            (bilingual_text('Remaining Life (%)', 'शेष जीवन'), 'tire_life_front_rhs'),
            (bilingual_text('Replacement Cost (₹)', 'प्रतिस्थापन लागत'), 'tire_cost_front_rhs'),
        ]),
        ('Rear RHS Tire', 'photo_tire_rear_rhs', [
            (bilingual_text('Tire Brand', 'टायर ब्रांड'), 'tire_brand_rear_rhs'),
            (bilingual_text('Wheel Type', 'व्हील प्रकार'), 'wheel_type_rear_rhs'),
            (bilingual_text('Remaining Life (%)', 'शेष जीवन'), 'tire_life_rear_rhs'),
            (bilingual_text('Replacement Cost (₹)', 'प्रतिस्थापन लागत'), 'tire_cost_rear_rhs'),
        ]),
        ('Front LHS Tire', 'photo_tire_front_lhs', [
            (bilingual_text('Tire Brand', 'टायर ब्रांड'), 'tire_brand_front_lhs'),
            (bilingual_text('Wheel Type', 'व्हील प्रकार'), 'wheel_type_front_lhs'),
            (bilingual_text('Remaining Life (%)', 'शेष जीवन'), 'tire_life_front_lhs'),
            (bilingual_text('Replacement Cost (₹)', 'प्रतिस्थापन लागत'), 'tire_cost_front_lhs'),
        ]),
        ('Rear LHS Tire', 'photo_tire_rear_lhs', [
            (bilingual_text('Tire Brand', 'टायर ब्रांड'), 'tire_brand_rear_lhs'),
            (bilingual_text('Wheel Type', 'व्हील प्रकार'), 'wheel_type_rear_lhs'),
            (bilingual_text('Remaining Life (%)', 'शेष जीवन'), 'tire_life_rear_lhs'),
            (bilingual_text('Replacement Cost (₹)', 'प्रतिस्थापन लागत'), 'tire_cost_rear_lhs'),
        ]),
        ('Spare Tire', 'photo_tire_spare', [
            (bilingual_text('Tire Brand', 'टायर ब्रांड'), 'tire_brand_spare'),
            (bilingual_text('Wheel Type', 'व्हील प्रकार'), 'wheel_type_spare'),
            (bilingual_text('Remaining Life (%)', 'शेष जीवन'), 'tire_life_spare'),
            (bilingual_text('Replacement Cost (₹)', 'प्रतिस्थापन लागत'), 'tire_cost_spare'),
        ]),
    ]
    
    # Create individual card for EACH tire
    for tire_title, tire_image_field, tire_fields in tire_specs:
        card = create_single_image_card(tire_image_field, image_files, tire_title, tire_fields, data)
        if card:
            story.append(card)
            story.append(Spacer(1, 10))
        else:
            # If no image, show as simple data card
            tire_data = [(label, data.get(field, 'N/A')) for label, field in tire_fields]
            story.append(create_section_header(tire_title))
            story.append(create_two_column_card_table(tire_data))
            story.append(Spacer(1, 10))
    
    # PAGE 11: STRUCTURE
    story.append(PageBreak())
    story.append(create_section_header('Structure Inspection'))
    
    structure_fields = [
        (bilingual_text('Upper Member', 'ऊपरी सदस्य'), 'structure_upper_member'),
        (bilingual_text('LHS Apron', 'बाईं एप्रन'), 'structure_lhs_apron'),
        (bilingual_text('RHS Apron', 'दाईं एप्रन'), 'structure_rhs_apron'),
        (bilingual_text('RHS A Pillar', 'RHS A पिलर'), 'structure_rhs_a_pillar'),
        (bilingual_text('LHS A Pillar', 'LHS A पिलर'), 'structure_lhs_a_pillar'),
        (bilingual_text('RHS B Pillar', 'RHS B पिलर'), 'structure_rhs_b_pillar'),
        (bilingual_text('LHS B Pillar', 'LHS B पिलर'), 'structure_lhs_b_pillar'),
        (bilingual_text('RHS C Pillar', 'RHS C पिलर'), 'structure_rhs_c_pillar'),
        (bilingual_text('LHS C Pillar', 'LHS C पिलर'), 'structure_lhs_c_pillar'),
        (bilingual_text('Tail Gate/Boot Frame', 'टेल गेट फ्रेम'), 'structure_tail_gate_frame'),
        (bilingual_text('RHS Fender Wall', 'दाईं फेंडर वॉल'), 'structure_rhs_fender_wall'),
        (bilingual_text('LHS Fender Wall', 'बाईं फेंडर वॉल'), 'structure_lhs_fender_wall'),
        (bilingual_text('Lower Member', 'निचला सदस्य'), 'structure_lower_member'),
        (bilingual_text('Cross Member', 'क्रॉस सदस्य'), 'structure_cross_member'),
        (bilingual_text('Dicky Tub', 'डिकी टब'), 'structure_dicky_tub'),
    ]
    
    structure_card = create_two_column_card_table(structure_fields)
    story.append(structure_card)
    story.append(Spacer(1, 12))
    
    # PAGE 12: TEST DRIVE
    story.append(PageBreak())
    story.append(create_section_header('Test Drive Assessment'))
    
    test_drive_fields = [
        (bilingual_text('Steering Performance', 'स्टीयरिंग प्रदर्शन'), 'test_steering_performance'),
        (bilingual_text('Steering Alignment', 'स्टीयरिंग संरेखण'), 'test_steering_alignment'),
        (bilingual_text('Ignition', 'इग्निशन'), 'test_ignition'),
        (bilingual_text('Clutch Performance', 'क्लच'), 'test_clutch_performance'),
        (bilingual_text('Brake Performance', 'ब्रेक'), 'test_brake_performance'),
        (bilingual_text('Gear Shifting', 'गियर शिफ्टिंग'), 'test_gear_shifting'),
        (bilingual_text('Acceleration', 'त्वरण'), 'test_acceleration'),
        (bilingual_text('CNG Mode', 'CNG मोड'), 'test_cng_mode'),
        (bilingual_text('Suspension', 'सस्पेंशन'), 'test_suspension'),
        (bilingual_text('Engine Noise', 'इंजन शोर'), 'test_engine_noise'),
        (bilingual_text('Wheel Alignment', 'व्हील संरेखण'), 'test_wheel_alignment'),
        (bilingual_text('Repair Cost (₹)', 'मरम्मत लागत'), 'test_drive_repair_cost'),
    ]
    
    test_drive_card = create_two_column_card_table(test_drive_fields)
    story.append(test_drive_card)
    story.append(Spacer(1, 12))
    
    # PAGE 13: DISCLAIMER - Place only once at the end
    story.append(PageBreak())
    story.append(create_section_header('Disclaimer / अस्वीकरण'))
    
    disclaimer_english = """inspectionwale.com offers comprehensive vehicle information based on visual inspections conducted on certain parameters. However, we do not guarantee the condition of the engine or any other mechanical components post-inspection. We recommend referencing the vehicle's service history to confirm meter tampering and conducting an OBD scan to identify major engine issues.

Please note that our inspection reports do not serve as guarantees or warranties. Additionally, these reports are valid for two days or 20 kilometers after the inspection. Any alterations made to the vehicle by the seller or dealer after our inspection are not within our purview.

By availing of our services, you acknowledge and accept these terms and conditions. inspectionwale.com shall not be held liable for any discrepancies or damages arising post-inspection."""

    disclaimer_hindi = """inspectionwale.com कुछ मापदंडों पर किए गए दृश्य निरीक्षण के आधार पर व्यापक वाहन जानकारी प्रदान करता है। हालांकि, हम निरीक्षण के बाद इंजन या किसी अन्य यांत्रिक घटक की स्थिति की गारंटी नहीं देते हैं। हम मीटर से छेड़छाड़ की पुष्टि करने के लिए वाहन के सेवा इतिहास का संदर्भ लेने और प्रमुख इंजन समस्याओं की पहचान करने के लिए OBD स्कैन करने की सलाह देते हैं।

कृपया ध्यान दें कि हमारी निरीक्षण रिपोर्ट गारंटी या वारंटी के रूप में काम नहीं करती हैं। साथ ही, ये रिपोर्ट निरीक्षण के बाद दो दिन या 20 किलोमीटर तक वैध होती हैं। हमारे निरीक्षण के बाद विक्रेता या डीलर द्वारा वाहन में किया गया कोई भी बदलाव हमारे दायरे में नहीं है।

हमारी सेवाओं का लाभ उठाकर, आप इन नियमों और शर्तों को स्वीकार करते हैं। निरीक्षण के बाद उत्पन्न होने वाली किसी भी विसंगति या क्षति के लिए inspectionwale.com को उत्तरदायी नहीं ठहराया जाएगा।"""
    
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        fontSize=FONT_SMALL - 1,
        fontName=FONT_FAMILY,
        textColor=COLOR_TEXT,
        leading=14,
        alignment=TA_JUSTIFY,
        spaceAfter=8
    )
    
    disclaimer_hindi_style = ParagraphStyle(
        'DisclaimerHindi',
        fontSize=FONT_SMALL - 1,
        fontName='NotoSansHindi' if HINDI_FONT_AVAILABLE else FONT_FAMILY,
        textColor=COLOR_TEXT,
        leading=16,
        alignment=TA_JUSTIFY
    )
    
    disclaimer_card_data = [
        [Paragraph(disclaimer_english, disclaimer_style)],
        [Spacer(1, 8)],
        [Paragraph(disclaimer_hindi, disclaimer_hindi_style)]
    ]
    
    disclaimer_table = Table(disclaimer_card_data, colWidths=[CONTENT_WIDTH])
    disclaimer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), COLOR_CARD_BG),
        ('BOX', (0, 0), (0, -1), 1, COLOR_BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (0, 0), 12),
        ('BOTTOMPADDING', (0, -1), (0, -1), 12),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    story.append(disclaimer_table)
    
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
