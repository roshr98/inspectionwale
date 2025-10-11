"""
Professional Vehicle Inspection Report - FINAL VERSION with Light Blue Background
Implements exact template design with:
- Golden star ratings (★★★★★) with proper empty stars (☆)
- Light blue page background (#e8f4f8)
- White section boxes (like reference image)
- Icons in footer for visual appeal
- Consistent Arial font throughout
"""

import io
from datetime import datetime
from PIL import Image, ImageDraw
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage, KeepTogether, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.graphics.shapes import Drawing, Circle, Rect, String, Polygon
from reportlab.graphics import renderPDF

# EXACT TEMPLATE COLORS
COLOR_PRIMARY = HexColor('#004a99')      # Primary blue
COLOR_TEXT = HexColor('#263238')         # Body text (darker for better readability)
COLOR_LABEL = HexColor('#333333')        # Labels
COLOR_META = HexColor('#555555')         # Meta
COLOR_FOOTER = HexColor('#666666')       # Footer
COLOR_PAGE_BG = HexColor('#e8f4f8')      # Light blue page background (NEW!)
COLOR_CARD_BG = HexColor('#ffffff')      # White card background
COLOR_BORDER = HexColor('#e0e0e0')       # Light border
COLOR_NOTE_BG = HexColor('#f7f9fc')      # Notes background
COLOR_STAR_GOLD = HexColor('#f59e0b')    # Golden star (IMPORTANT!)
COLOR_STAR_EMPTY = HexColor('#d1d5db')   # Empty star gray

# EXACT FONT SIZES (Arial throughout for consistency!)
FONT_FAMILY = 'Helvetica'  # Arial equivalent in ReportLab
FONT_TITLE = 18 * 0.75       # 13.5pt
FONT_SECTION = 14 * 0.75     # 10.5pt  
FONT_BODY = 12 * 0.75        # 9pt
FONT_SMALL = 11 * 0.75       # 8.25pt

# PAGE SETUP
PAGE_MARGIN = 18 * mm
PAGE_WIDTH, PAGE_HEIGHT = A4
CONTENT_WIDTH = PAGE_WIDTH - (2 * PAGE_MARGIN)

# Sample data
sample_data = {
    'registrationNumber': 'MH04KD2255',
    'make': 'Maruti',
    'model': 'Brezza',
    'variant': 'VDi',
    'chassisNumber': 'MA3NYF81SKD535417',
    'engineNumber': 'D13A-5818272',
    'manufactureYear': '2019',
    'registrationDate': '2019-09-19',
    'fuelType': 'Diesel',
    'color': 'Pearl White',
    'odometerReading': '45320',
    'ownersCount': '2',
    'ownerName': 'Akshada Sondulkar',
    'ownerContact': '9876543210',
    'ownerEmail': 'akshada@example.com',
    'location': 'Byculla, Mumbai',
    'inspectorName': 'Prasad Kumar',
    'exteriorChecks': 'No major dents. Paint in good condition. Minor scratches on rear bumper.',
    'interiorChecks': 'Dashboard clean. All controls working. Seats show normal wear.',
    'engineChecks': 'Engine running smoothly. No oil leaks. Battery in good condition.'
}


class FooterCanvas(canvas.Canvas):
    """Custom canvas with footer and light blue background"""
    
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
    
    def draw_page_background(self):
        """Draw light blue background BEFORE content - called at page start"""
        self.setFillColor(COLOR_PAGE_BG)
        self.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
        
    def _startPage(self):
        """Override to draw background first on EVERY page"""
        canvas.Canvas._startPage(self)
        # Draw background on every page
        self.setFillColor(COLOR_PAGE_BG)
        self.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    
    def draw_footer(self, page_num, total_pages):
        """Draw footer with COLORFUL ICONS - HORIZONTAL layout, SQUARE CORNERS"""
        footer_y = PAGE_MARGIN - 5 * mm
        
        # White footer background box - SQUARE CORNERS
        self.setFillColor(COLOR_CARD_BG)
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.rect(PAGE_MARGIN, footer_y - 3 * mm, 
                 PAGE_WIDTH - 2 * PAGE_MARGIN, 12 * mm, 
                 fill=1, stroke=1)
        
        # Email - LEFT with VIBRANT RED ENVELOPE ICON
        icon_x = PAGE_MARGIN + 3 * mm
        icon_y = footer_y + 5.5 * mm
        # Red envelope background
        self.setFillColor(HexColor('#ef4444'))
        self.rect(icon_x - 2, icon_y - 1.5, 4 * mm, 3 * mm, fill=1, stroke=0)
        # Envelope outline
        self.setStrokeColor(HexColor('#dc2626'))
        self.setLineWidth(0.8)
        self.rect(icon_x - 1.5, icon_y - 1, 3 * mm, 2 * mm, fill=0, stroke=1)
        # Envelope flap
        self.line(icon_x - 1.5, icon_y + 1, icon_x, icon_y - 0.2)
        self.line(icon_x + 1.5, icon_y + 1, icon_x, icon_y - 0.2)
        # Text
        self.setFont(FONT_FAMILY, FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        self.drawString(icon_x + 3 * mm, footer_y + 5 * mm, 'hello@inspectionwale.com')
        
        # Mobile - CENTER with VIBRANT GREEN PHONE ICON
        center_x = PAGE_WIDTH / 2
        icon_x = center_x - 30 * mm
        # Green phone background
        self.setFillColor(HexColor('#22c55e'))
        self.circle(icon_x, icon_y, 2 * mm, fill=1, stroke=0)
        # Phone shape
        self.setFillColor(HexColor('#ffffff'))
        self.roundRect(icon_x - 1 * mm, icon_y - 1.2 * mm, 2 * mm, 2.4 * mm, 0.3, fill=1, stroke=0)
        # Phone speaker
        self.setFillColor(HexColor('#16a34a'))
        self.rect(icon_x - 0.5 * mm, icon_y + 0.7 * mm, 1 * mm, 0.3 * mm, fill=1, stroke=0)
        # Text
        self.setFont(FONT_FAMILY, FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        self.drawString(icon_x + 3 * mm, footer_y + 5 * mm, '9167558998')
        
        # Website - RIGHT with VIBRANT BLUE GLOBE ICON
        icon_x = PAGE_WIDTH - PAGE_MARGIN - 55 * mm
        # Blue globe background
        self.setFillColor(HexColor('#3b82f6'))
        self.circle(icon_x, icon_y, 2 * mm, fill=1, stroke=0)
        # Globe details
        self.setStrokeColor(HexColor('#ffffff'))
        self.setLineWidth(0.6)
        # Globe circle outline
        self.circle(icon_x, icon_y, 1.3 * mm, fill=0, stroke=1)
        # Vertical line
        self.line(icon_x, icon_y - 1.3 * mm, icon_x, icon_y + 1.3 * mm)
        # Horizontal line
        self.line(icon_x - 1.3 * mm, icon_y, icon_x + 1.3 * mm, icon_y)
        # Text
        self.setFont(FONT_FAMILY, FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        self.drawString(icon_x + 3 * mm, footer_y + 5 * mm, 'inspectionwale.com')
        
        # Page number
        self.setFont(FONT_FAMILY, FONT_SMALL - 1)
        self.setFillColor(COLOR_META)
        self.drawCentredString(PAGE_WIDTH / 2, footer_y + 1 * mm, f'Page {page_num} of {total_pages}')
        
        # Disclaimer
        self.setFont(FONT_FAMILY, FONT_SMALL - 2)
        self.setFillColor(COLOR_META)
        self.drawCentredString(PAGE_WIDTH / 2, footer_y - 1.5 * mm, 
                               'Professional vehicle inspection report. Valid for 2 days or 20 km.')


def create_card_background(width, height):
    """Create white card with shadow effect"""
    d = Drawing(width, height)
    
    # Shadow (slightly offset)
    shadow = Rect(2, -2, width, height, fillColor=HexColor('#00000010'), strokeColor=None)
    d.add(shadow)
    
    # White card
    card = Rect(0, 0, width, height, fillColor=COLOR_CARD_BG, 
                strokeColor=COLOR_BORDER, strokeWidth=0.5, rx=8, ry=8)
    d.add(card)
    
    return d


def create_header():
    """Create header with proper 3-column layout in WHITE BOX"""
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
        # Vibrant blue bottom border (thicker and more visible)
        ('LINEBELOW', (0, 0), (-1, -1), 3, HexColor('#3b82f6')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        # White background with SQUARE corners
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_CARD_BG),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_BORDER),
        # SQUARE CORNERS - removed rounded corners
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    return header_table


def create_section_header(title):
    """Section header with vibrant blue accent bar"""
    style = ParagraphStyle(
        'SectionHeader',
        fontSize=FONT_SECTION,
        textColor=COLOR_PRIMARY,
        fontName=f'{FONT_FAMILY}-Bold',
        spaceAfter=6,
        spaceBefore=8,
        leftIndent=8,  # Space for accent bar
    )
    
    # Create header with colored accent bar on left
    header_para = Paragraph(title, style)
    
    # Create table with accent bar
    accent_bar = Table([['']], colWidths=[3])
    accent_bar.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), HexColor('#3b82f6')),  # Vibrant blue bar
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


def create_card_table(data_rows, card_padding=14):
    """Create data table inside a white card - NO BORDERS, SQUARE CORNERS"""
    # Card content
    table_data = []
    for label, value in data_rows:
        table_data.append([label, value or 'N/A'])
    
    col_widths = [(CONTENT_WIDTH - 2*card_padding) * 0.36, (CONTENT_WIDTH - 2*card_padding) * 0.64]
    
    table = Table(table_data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ('FONT', (0, 0), (0, -1), f'{FONT_FAMILY}-Bold', FONT_BODY),
        ('FONT', (1, 0), (1, -1), FONT_FAMILY, FONT_BODY),
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#4a4a4a')),  # Dark gray for labels
        ('TEXTCOLOR', (1, 0), (1, -1), HexColor('#000000')),  # Dark black for values
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        # NO BORDER LINES between rows!
    ]))
    
    # Wrap table in card - SQUARE CORNERS
    card_data = [[table]]
    card_table = Table(card_data, colWidths=[CONTENT_WIDTH])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_CARD_BG),
        ('BOX', (0, 0), (0, 0), 1, COLOR_BORDER),
        # SQUARE CORNERS - no rounded corners
        ('LEFTPADDING', (0, 0), (0, 0), card_padding),
        ('RIGHTPADDING', (0, 0), (0, 0), card_padding),
        ('TOPPADDING', (0, 0), (0, 0), card_padding),
        ('BOTTOMPADDING', (0, 0), (0, 0), card_padding),
    ]))
    
    return card_table


def create_two_column_card_table(data_rows, card_padding=14):
    """Create 2-COLUMN data table to use space efficiently - NO BORDERS, SQUARE CORNERS"""
    # Arrange data in 2 columns: [Label1, Value1, Label2, Value2]
    table_data = []
    
    for i in range(0, len(data_rows), 2):
        row = []
        # Left column (first item)
        if i < len(data_rows):
            row.extend([data_rows[i][0], data_rows[i][1] or 'N/A'])
        
        # Right column (second item)
        if i + 1 < len(data_rows):
            row.extend([data_rows[i+1][0], data_rows[i+1][1] or 'N/A'])
        else:
            # If odd number of items, fill right side
            row.extend(['', ''])
        
        table_data.append(row)
    
    # Calculate widths: Label (20%) | Value (30%) | Label (20%) | Value (30%)
    # More balanced distribution to prevent wrapping
    available_width = CONTENT_WIDTH - 2*card_padding
    col_widths = [
        available_width * 0.20,  # Left label (WIDER for long labels)
        available_width * 0.30,  # Left value
        available_width * 0.20,  # Right label (WIDER for long labels)
        available_width * 0.30,  # Right value
    ]
    
    table = Table(table_data, colWidths=col_widths)
    table.setStyle(TableStyle([
        # Left column styling - DARK GRAY labels, DARK BLACK values
        ('FONT', (0, 0), (0, -1), f'{FONT_FAMILY}-Bold', FONT_BODY),
        ('FONT', (1, 0), (1, -1), FONT_FAMILY, FONT_BODY),
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#4a4a4a')),  # Dark gray for labels
        ('TEXTCOLOR', (1, 0), (1, -1), HexColor('#000000')),  # Dark black for values
        # Right column styling - DARK GRAY labels, DARK BLACK values
        ('FONT', (2, 0), (2, -1), f'{FONT_FAMILY}-Bold', FONT_BODY),
        ('FONT', (3, 0), (3, -1), FONT_FAMILY, FONT_BODY),
        ('TEXTCOLOR', (2, 0), (2, -1), HexColor('#4a4a4a')),  # Dark gray for labels
        ('TEXTCOLOR', (3, 0), (3, -1), HexColor('#000000')),  # Dark black for values
        # Spacing
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (1, -1), 12),  # More space between left and right columns
        ('RIGHTPADDING', (2, 0), (3, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),  # Labels left aligned
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),  # Values left aligned
        ('ALIGN', (2, 0), (2, -1), 'LEFT'),  # Labels left aligned
        ('ALIGN', (3, 0), (3, -1), 'LEFT'),  # Values left aligned
        # NO BORDER LINES between rows!
    ]))
    
    # Wrap in card - SQUARE CORNERS, NO ROUNDED
    card_data = [[table]]
    card_table = Table(card_data, colWidths=[CONTENT_WIDTH])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_CARD_BG),
        ('BOX', (0, 0), (0, 0), 1, COLOR_BORDER),
        # SQUARE CORNERS - removed ROUNDEDCORNERS
        ('LEFTPADDING', (0, 0), (0, 0), card_padding),
        ('RIGHTPADDING', (0, 0), (0, 0), card_padding),
        ('TOPPADDING', (0, 0), (0, 0), card_padding),
        ('BOTTOMPADDING', (0, 0), (0, 0), card_padding),
    ]))
    
    return card_table


def create_star_shape(x, y, size, filled=True):
    """Create a 5-pointed star polygon"""
    import math
    points = []
    for i in range(10):
        angle = (i * 36 - 90) * math.pi / 180  # 36 degrees between points
        if i % 2 == 0:
            # Outer point
            r = size
        else:
            # Inner point
            r = size * 0.4
        points.append(x + r * math.cos(angle))
        points.append(y + r * math.sin(angle))
    return points


def create_star_drawing(rating):
    """Create a drawing with actual star shapes in VIBRANT GOLDEN color"""
    full_stars = int(rating)
    half_star = (rating % 1) >= 0.5
    empty_stars = 5 - full_stars - (1 if half_star else 0)
    
    # Drawing size: 5 stars + spacing + text
    d = Drawing(120, 16)
    
    star_size = 6
    x_start = 0
    y_center = 8
    
    # Vibrant golden color for filled stars
    vibrant_gold = HexColor('#fbbf24')  # Brighter, more vibrant gold
    
    # Draw filled stars
    for i in range(full_stars):
        x = x_start + i * 14
        star = Polygon(create_star_shape(x + star_size, y_center, star_size))
        star.fillColor = vibrant_gold
        star.strokeColor = HexColor('#f59e0b')  # Darker gold border
        star.strokeWidth = 0.8
        d.add(star)
    
    # Draw half star if needed
    if half_star:
        x = x_start + full_stars * 14
        star = Polygon(create_star_shape(x + star_size, y_center, star_size))
        star.fillColor = vibrant_gold
        star.strokeColor = HexColor('#f59e0b')
        star.strokeWidth = 0.8
        d.add(star)
    
    # Draw empty stars with light gray
    for i in range(empty_stars):
        x = x_start + (full_stars + (1 if half_star else 0) + i) * 14
        star = Polygon(create_star_shape(x + star_size, y_center, star_size))
        star.fillColor = HexColor('#f3f4f6')  # Very light gray fill
        star.strokeColor = HexColor('#d1d5db')  # Light gray border
        star.strokeWidth = 0.8
        d.add(star)
    
    # Add rating text in darker color
    text = String(75, 4, f'({rating}/5)', fontSize=8, fillColor=HexColor('#6b7280'))
    d.add(text)
    
    return d


def create_star_rating_table(label, rating):
    """Create star rating display with ACTUAL drawn stars"""
    star_drawing = create_star_drawing(rating)
    return [label, star_drawing]


def create_ratings_card():
    """Create professional ratings card - NO BORDERS, SQUARE CORNERS"""
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
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor('#4a4a4a')),  # Dark gray for labels
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        # NO BORDER LINES between rows!
    ]))
    
    # Wrap in card - SQUARE CORNERS
    card_data = [[table]]
    card_table = Table(card_data, colWidths=[CONTENT_WIDTH])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_CARD_BG),
        ('BOX', (0, 0), (0, 0), 1, COLOR_BORDER),
        # SQUARE CORNERS - no rounded corners
        ('LEFTPADDING', (0, 0), (0, 0), 14),
        ('RIGHTPADDING', (0, 0), (0, 0), 14),
        ('TOPPADDING', (0, 0), (0, 0), 14),
        ('BOTTOMPADDING', (0, 0), (0, 0), 14),
    ]))
    
    return card_table


def create_notes_card(title, content):
    """Create notes card - SQUARE CORNERS"""
    style = ParagraphStyle(
        'Notes',
        fontSize=FONT_BODY,
        fontName=FONT_FAMILY,
        textColor=HexColor('#000000'),  # Dark black for content
        leading=14
    )
    
    notes_para = Paragraph(content, style)
    
    card_data = [[notes_para]]
    card_table = Table(card_data, colWidths=[CONTENT_WIDTH])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_CARD_BG),
        ('BOX', (0, 0), (0, 0), 1, COLOR_BORDER),
        # SQUARE CORNERS - no rounded corners
        ('LEFTPADDING', (0, 0), (0, 0), 14),
        ('RIGHTPADDING', (0, 0), (0, 0), 14),
        ('TOPPADDING', (0, 0), (0, 0), 14),
        ('BOTTOMPADDING', (0, 0), (0, 0), 14),
    ]))
    
    return card_table


def create_image_placeholder(width, height, caption):
    """Create image placeholder - SQUARE CORNERS"""
    # Create placeholder image
    img_buffer = io.BytesIO()
    placeholder = Image.new('RGB', (int(width * 3), int(height * 3)), color=(248, 249, 250))
    
    # Add border
    draw = ImageDraw.Draw(placeholder)
    draw.rectangle([0, 0, int(width * 3)-1, int(height * 3)-1], outline=(220, 220, 220), width=3)
    
    # Add "PHOTO" text
    from PIL import ImageFont
    try:
        font = ImageFont.truetype("arial.ttf", 60)
    except:
        font = ImageFont.load_default()
    
    text = "PHOTO"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((int(width * 3) - text_width) / 2, (int(height * 3) - text_height) / 2)
    draw.text(position, text, fill=(180, 180, 180), font=font)
    
    placeholder.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    img = RLImage(img_buffer, width=width, height=height)
    
    # Caption with consistent font - DARK GRAY
    caption_style = ParagraphStyle(
        'Caption',
        fontSize=FONT_SMALL,
        fontName=FONT_FAMILY,
        textColor=HexColor('#4a4a4a'),  # Dark gray
        alignment=1  # Center
    )
    caption_para = Paragraph(caption, caption_style)
    
    # Card with caption bar - SQUARE CORNERS
    cell_data = [[caption_para], [img]]
    cell_table = Table(cell_data, colWidths=[width])
    cell_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), COLOR_CARD_BG),
        ('BACKGROUND', (0, 1), (0, 1), COLOR_CARD_BG),
        ('BOX', (0, 0), (0, 1), 1, COLOR_BORDER),
        # SQUARE CORNERS - no rounded corners
        ('ALIGN', (0, 0), (0, 1), 'CENTER'),
        ('VALIGN', (0, 0), (0, 1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (0, 0), 10),
        ('BOTTOMPADDING', (0, 0), (0, 0), 6),
        ('TOPPADDING', (0, 1), (0, 1), 6),
        ('BOTTOMPADDING', (0, 1), (0, 1), 10),
    ]))
    
    return cell_table


def generate_professional_pdf():
    """Generate professional PDF with card-based design"""
    
    output_path = 'SAMPLE_PROFESSIONAL_V2.pdf'
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=PAGE_MARGIN,
        rightMargin=PAGE_MARGIN,
        topMargin=PAGE_MARGIN,
        bottomMargin=PAGE_MARGIN + 15*mm,
        title=f"Vehicle Inspection Report - {sample_data['registrationNumber']}"
    )
    
    story = []
    
    # HEADER
    story.append(create_header())
    story.append(Spacer(1, 10))
    
    # VEHICLE REGISTRATION DETAILS CARD - 2 COLUMN LAYOUT
    story.append(create_section_header('Vehicle Registration Details'))
    
    vehicle_data = [
        ('Vehicle Number', sample_data['registrationNumber']),
        ('Make / Model', f"{sample_data['make']} {sample_data['model']}"),
        ('Variant', sample_data['variant']),
        ('Chassis Number', sample_data['chassisNumber']),
        ('Engine Number', sample_data['engineNumber']),
        ('Manufacture Year', sample_data['manufactureYear']),
        ('Registration Date', sample_data['registrationDate']),
        ('Fuel Type', sample_data['fuelType']),
        ('Color', sample_data['color']),
        ('Odometer Reading', f"{sample_data['odometerReading']} km"),
        ('Number of Owners', sample_data['ownersCount']),
    ]
    
    story.append(create_two_column_card_table(vehicle_data))
    story.append(Spacer(1, 12))
    
    # CURRENT OWNER DETAILS CARD - 2 COLUMN LAYOUT
    story.append(create_section_header('Current Owner Details'))
    
    owner_data = [
        ('Owner Name', sample_data['ownerName']),
        ('Contact Number', sample_data['ownerContact']),
        ('Email Address', sample_data['ownerEmail']),
        ('Inspection Location', sample_data['location']),
    ]
    
    story.append(create_two_column_card_table(owner_data))
    story.append(Spacer(1, 12))
    
    # INSPECTION DETAILS CARD - 2 COLUMN LAYOUT
    story.append(create_section_header('Inspection Details'))
    
    inspector_data = [
        ('Inspector Name', sample_data['inspectorName']),
        ('Inspection Date', datetime.now().strftime('%d %b %Y')),
    ]
    
    story.append(create_two_column_card_table(inspector_data))
    story.append(Spacer(1, 12))
    
    # KEY HIGHLIGHTS CARD
    story.append(create_section_header('Key Highlights'))
    
    highlights_text = f"""
    <font face="Helvetica"><b>Exterior:</b> {sample_data['exteriorChecks']}<br/>
    <b>Interior:</b> {sample_data['interiorChecks']}<br/>
    <b>Engine:</b> {sample_data['engineChecks']}</font>
    """
    
    story.append(create_notes_card('Key Highlights', highlights_text))
    story.append(Spacer(1, 12))
    
    # RATINGS CARD - Keep header and content together on same page
    ratings_section = [
        create_section_header('Overall Ratings'),
        create_ratings_card()
    ]
    story.append(KeepTogether(ratings_section))
    story.append(Spacer(1, 16))
    
    # VEHICLE PHOTOS
    story.append(create_section_header('Vehicle Photos'))
    
    # 3-column grid
    image_width = (CONTENT_WIDTH - 24) / 3
    image_height = 90 * 0.75
    
    captions = ['RC Book', 'Chassis Plate', 'Odometer',
                'Front Bumper', 'Bonnet', 'Grille',
                'Dashboard', 'Seats', 'Engine Bay']
    
    row_images = []
    for i, caption in enumerate(captions):
        row_images.append(create_image_placeholder(image_width, image_height, caption))
        
        if len(row_images) == 3 or i == len(captions) - 1:
            while len(row_images) < 3:
                row_images.append('')
            
            row_table = Table([row_images], colWidths=[image_width] * 3)
            row_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(row_table)
            story.append(Spacer(1, 12))
            row_images = []
    
    # Build PDF
    doc.build(story, canvasmaker=FooterCanvas)
    
    return output_path


if __name__ == '__main__':
    print('🎨 Generating PROFESSIONAL PDF with Vibrant Colors...')
    
    try:
        output_file = generate_professional_pdf()
        print(f'\n✅ SUCCESS! Professional PDF generated: {output_file}')
        print('\n🌈 VIBRANT COLOR FEATURES:')
        print('   ✓ RED envelope icon 📧 (vibrant #ef4444)')
        print('   ✓ GREEN phone icon 📱 (vibrant #22c55e)')
        print('   ✓ BLUE globe icon 🌐 (vibrant #3b82f6)')
        print('   ✓ GOLDEN stars ⭐ (vibrant #fbbf24)')
        print('   ✓ Blue accent bars on section headers')
        print('   ✓ Vibrant blue header border (3pt thick)')
        print('   ✓ Clean, professional layout with subtle colors')
        print('   ✓ 2-column layout, NO text overlap')
        print('   ✓ Light blue page background')
        print('\n🔍 Review - Colorful, glossy, yet professional!')
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()
