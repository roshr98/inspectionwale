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
from datetime import datetime
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.graphics.shapes import Drawing, Polygon, String

# AWS clients
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Environment variables
BUCKET_NAME = 'inspectionwale-reports'
TABLE_NAME = 'InspectionReports'

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
        """Draw footer with COLORFUL ICONS"""
        footer_y = PAGE_MARGIN - 5 * mm
        
        # White footer box
        self.setFillColor(COLOR_CARD_BG)
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.rect(PAGE_MARGIN, footer_y - 3 * mm, 
                 PAGE_WIDTH - 2 * PAGE_MARGIN, 12 * mm, fill=1, stroke=1)
        
        # RED ENVELOPE ICON
        icon_x = PAGE_MARGIN + 3 * mm
        icon_y = footer_y + 5.5 * mm
        self.setFillColor(HexColor('#ef4444'))
        self.rect(icon_x - 2, icon_y - 1.5, 4 * mm, 3 * mm, fill=1, stroke=0)
        self.setStrokeColor(HexColor('#dc2626'))
        self.setLineWidth(0.8)
        self.rect(icon_x - 1.5, icon_y - 1, 3 * mm, 2 * mm, fill=0, stroke=1)
        self.line(icon_x - 1.5, icon_y + 1, icon_x, icon_y - 0.2)
        self.line(icon_x + 1.5, icon_y + 1, icon_x, icon_y - 0.2)
        self.setFont(FONT_FAMILY, FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        self.drawString(icon_x + 3 * mm, footer_y + 5 * mm, 'hello@inspectionwale.com')
        
        # GREEN PHONE ICON
        center_x = PAGE_WIDTH / 2
        icon_x = center_x - 30 * mm
        self.setFillColor(HexColor('#22c55e'))
        self.circle(icon_x, icon_y, 2 * mm, fill=1, stroke=0)
        self.setFillColor(HexColor('#ffffff'))
        self.roundRect(icon_x - 1 * mm, icon_y - 1.2 * mm, 2 * mm, 2.4 * mm, 0.3, fill=1, stroke=0)
        self.setFillColor(HexColor('#16a34a'))
        self.rect(icon_x - 0.5 * mm, icon_y + 0.7 * mm, 1 * mm, 0.3 * mm, fill=1, stroke=0)
        self.setFont(FONT_FAMILY, FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        self.drawString(icon_x + 3 * mm, footer_y + 5 * mm, '9167558998')
        
        # BLUE GLOBE ICON
        icon_x = PAGE_WIDTH - PAGE_MARGIN - 55 * mm
        self.setFillColor(HexColor('#3b82f6'))
        self.circle(icon_x, icon_y, 2 * mm, fill=1, stroke=0)
        self.setStrokeColor(HexColor('#ffffff'))
        self.setLineWidth(0.6)
        self.circle(icon_x, icon_y, 1.3 * mm, fill=0, stroke=1)
        self.line(icon_x, icon_y - 1.3 * mm, icon_x, icon_y + 1.3 * mm)
        self.line(icon_x - 1.3 * mm, icon_y, icon_x + 1.3 * mm, icon_y)
        self.setFont(FONT_FAMILY, FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        self.drawString(icon_x + 3 * mm, footer_y + 5 * mm, 'inspectionwale.com')
        
        # Page number
        self.setFont(FONT_FAMILY, FONT_SMALL - 1)
        self.setFillColor(COLOR_META)
        self.drawCentredString(PAGE_WIDTH / 2, footer_y + 1 * mm, f'Page {page_num} of {total_pages}')
        
        # Disclaimer
        self.setFont(FONT_FAMILY, FONT_SMALL - 2)
        self.drawCentredString(PAGE_WIDTH / 2, footer_y - 1.5 * mm, 
                               'Professional vehicle inspection report. Valid for 2 days or 20 km.')


def create_header(data):
    """Create header with vibrant blue border"""
    report_id = f"INS-{int(datetime.now().timestamp())}"
    report_date = datetime.now().strftime('%d %b %Y')
    
    header_data = [
        ['InspectionWale\nRebranded from Whizzcheck', 
         'Vehicle Inspection Report', 
         f'Inspection ID:\n{report_id}\n\nDate:\n{report_date}']
    ]
    
    header_table = Table(header_data, colWidths=[60*mm, 80*mm, 34*mm])
    header_table.setStyle(TableStyle([
        ('FONT', (0, 0), (0, 0), f'{FONT_FAMILY}-Bold', FONT_TITLE),
        ('TEXTCOLOR', (0, 0), (0, 0), COLOR_PRIMARY),
        ('VALIGN', (0, 0), (0, 0), 'TOP'),
        ('FONT', (1, 0), (1, 0), f'{FONT_FAMILY}-Bold', FONT_TITLE),
        ('TEXTCOLOR', (1, 0), (1, 0), COLOR_PRIMARY),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('VALIGN', (1, 0), (1, 0), 'MIDDLE'),
        ('FONT', (2, 0), (2, 0), FONT_FAMILY, FONT_SMALL),
        ('TEXTCOLOR', (2, 0), (2, 0), COLOR_META),
        ('ALIGN', (2, 0), (2, 0), 'RIGHT'),
        ('VALIGN', (2, 0), (2, 0), 'TOP'),
        ('LINEBELOW', (0, 0), (-1, -1), 3, HexColor('#3b82f6')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
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


def create_ratings_card():
    """Ratings card with actual drawn stars"""
    ratings_data = [
        create_star_rating_table('Interior', 4.0),
        create_star_rating_table('Exterior / Body', 4.5),
        create_star_rating_table('Engine', 4.0),
        create_star_rating_table('Structure', 5.0),
        create_star_rating_table('Test Drive', 4.5),
        create_star_rating_table('Electrical', 4.0),
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
        ('Vehicle Number', data.get('registrationNumber')),
        ('Make / Model', f"{data.get('make', '')} {data.get('model', '')}"),
        ('Variant', data.get('variant')),
        ('Chassis Number', data.get('chassisNumber') or data.get('vinNumber')),
        ('Engine Number', data.get('engineNumber')),
        ('Manufacture Year', data.get('manufactureYear')),
        ('Registration Date', data.get('registrationDate')),
        ('Fuel Type', data.get('fuelType')),
        ('Color', data.get('color')),
        ('Odometer Reading', f"{data.get('odometerReading', '')} km"),
        ('Number of Owners', data.get('ownersCount')),
    ]
    story.append(create_two_column_card_table(vehicle_data))
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
    story.append(Spacer(1, 12))
    
    # KEY HIGHLIGHTS
    story.append(create_section_header('Key Highlights'))
    highlights = data.get('highlights', 'No highlights provided.')
    highlights_text = f'<font face="Helvetica">{highlights}</font>'
    story.append(create_notes_card(highlights_text))
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
        
        # Upload to S3
        pdf_key = f"reports/{report_id}.pdf"
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=pdf_key,
            Body=pdf_data,
            ContentType='application/pdf'
        )
        
        pdf_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{pdf_key}"
        
        print(f"✅ PDF uploaded: {pdf_url}")
        
        # Save to DynamoDB
        table = dynamodb.Table(TABLE_NAME)
        table.put_item(
            Item={
                'reportId': report_id,
                'registrationNumber': fields.get('registrationNumber', 'UNKNOWN'),
                'ownerName': fields.get('ownerName', 'UNKNOWN'),
                'inspectorName': fields.get('inspectorName', 'UNKNOWN'),
                'createdAt': datetime.now().isoformat(),
                'pdfUrl': pdf_url,
                'status': 'completed'
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'reportId': report_id,
                'pdfUrl': pdf_url,
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
