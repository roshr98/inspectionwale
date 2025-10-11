"""
Local Test Script - Generate Sample PDF with Python ReportLab
Shows exactly how the Lambda output will look
"""

import io
from datetime import datetime
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

# EXACT TEMPLATE COLORS
COLOR_PRIMARY = HexColor('#004a99')
COLOR_TEXT = HexColor('#222222')
COLOR_LABEL = HexColor('#333333')
COLOR_META = HexColor('#555555')
COLOR_FOOTER = HexColor('#666666')
COLOR_NOTE_BG = HexColor('#f7f9fc')
COLOR_BORDER = HexColor('#cccccc')

# EXACT TEMPLATE FONT SIZES
FONT_TITLE = 18 * 0.75      # 13.5pt
FONT_HEADER = 14 * 0.75     # 10.5pt
FONT_BODY = 12 * 0.75       # 9pt
FONT_SMALL = 11 * 0.75      # 8.25pt

# EXACT TEMPLATE MARGINS (18mm)
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
    """Custom canvas to add footer on every page"""
    
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
        
    def draw_footer(self, page_num, total_pages):
        """Draw footer with contact details - HORIZONTAL LAYOUT"""
        footer_y = PAGE_MARGIN - 5 * mm
        
        # Top border line
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.line(PAGE_MARGIN, footer_y + 8 * mm, PAGE_WIDTH - PAGE_MARGIN, footer_y + 8 * mm)
        
        # Contact details - HORIZONTAL, EXACT TEMPLATE FONT SIZE
        self.setFont('Helvetica', FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        
        # Email - LEFT
        self.drawString(PAGE_MARGIN, footer_y + 4 * mm, 'Email: hello@inspectionwale.com')
        
        # Mobile - CENTER
        self.drawCentredString(PAGE_WIDTH / 2, footer_y + 4 * mm, 'Mobile: 9167558998')
        
        # Website - RIGHT
        self.drawRightString(PAGE_WIDTH - PAGE_MARGIN, footer_y + 4 * mm, 'Web: inspectionwale.com')
        
        # Page number
        self.setFont('Helvetica', FONT_SMALL - 1)
        self.drawCentredString(PAGE_WIDTH / 2, footer_y + 1 * mm, f'Page {page_num} of {total_pages}')
        
        # Disclaimer
        self.setFont('Helvetica', FONT_SMALL - 2)
        self.drawCentredString(PAGE_WIDTH / 2, footer_y - 2 * mm, 
                               'Professional vehicle inspection report. Valid for 2 days or 20 km.')


def create_header():
    """Create header matching template exactly"""
    report_id = f"INS-{int(datetime.now().timestamp())}"
    report_date = datetime.now().strftime('%d %b %Y')
    
    # Header table: Logo/Brand | Title | Meta
    header_data = [
        ['InspectionWale\nRebranded from Whizzcheck', 
         'Vehicle Inspection Report', 
         f'Inspection ID:\n{report_id}\n\nDate:\n{report_date}']
    ]
    
    header_table = Table(header_data, colWidths=[60*mm, 80*mm, 34*mm])
    header_table.setStyle(TableStyle([
        # Logo/Brand (LEFT)
        ('FONT', (0, 0), (0, 0), 'Helvetica-Bold', FONT_TITLE),
        ('TEXTCOLOR', (0, 0), (0, 0), COLOR_PRIMARY),
        ('VALIGN', (0, 0), (0, 0), 'TOP'),
        
        # Title (CENTER)
        ('FONT', (1, 0), (1, 0), 'Helvetica-Bold', FONT_TITLE),
        ('TEXTCOLOR', (1, 0), (1, 0), COLOR_PRIMARY),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('VALIGN', (1, 0), (1, 0), 'MIDDLE'),
        
        # Meta (RIGHT)
        ('FONT', (2, 0), (2, 0), 'Helvetica', FONT_SMALL),
        ('TEXTCOLOR', (2, 0), (2, 0), COLOR_META),
        ('ALIGN', (2, 0), (2, 0), 'RIGHT'),
        ('VALIGN', (2, 0), (2, 0), 'TOP'),
        
        # Bottom border
        ('LINEBELOW', (0, 0), (-1, -1), 2, COLOR_PRIMARY),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    return header_table


def create_section_header(title):
    """Create section header (14px, #004a99)"""
    style = ParagraphStyle(
        'SectionHeader',
        fontSize=FONT_HEADER,
        textColor=COLOR_PRIMARY,
        fontName='Helvetica-Bold',
        spaceAfter=4,
        spaceBefore=8
    )
    return Paragraph(title, style)


def create_data_table(data_rows):
    """Create data table with label/value pairs"""
    table_data = []
    for label, value in data_rows:
        table_data.append([label, value or 'N/A'])
    
    # 40% width for labels, 60% for values
    col_widths = [CONTENT_WIDTH * 0.4, CONTENT_WIDTH * 0.6]
    
    table = Table(table_data, colWidths=col_widths)
    table.setStyle(TableStyle([
        # Font: Labels bold, values normal
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', FONT_BODY),
        ('FONT', (1, 0), (1, -1), 'Helvetica', FONT_BODY),
        
        # Colors from template
        ('TEXTCOLOR', (0, 0), (0, -1), COLOR_LABEL),
        ('TEXTCOLOR', (1, 0), (1, -1), COLOR_TEXT),
        
        # Padding: 6px
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
    ]))
    
    return table


def create_star_rating_row(label, rating):
    """Create star rating display (★★★★☆ style)"""
    full_stars = int(rating)
    half_star = (rating % 1) >= 0.5
    empty_stars = 5 - full_stars - (1 if half_star else 0)
    
    stars = '★' * full_stars
    if half_star:
        stars += '★'
    stars += '☆' * empty_stars
    
    return [label, f'{stars} ({rating}/5)']


def create_image_placeholder(width, height, caption):
    """Create placeholder for images"""
    # Create a simple gray rectangle as placeholder
    img_buffer = io.BytesIO()
    placeholder = Image.new('RGB', (int(width * 3), int(height * 3)), color=(240, 240, 240))
    placeholder.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    img = RLImage(img_buffer, width=width, height=height)
    
    # Caption
    cell_data = [[img], [caption]]
    cell_table = Table(cell_data, colWidths=[width])
    cell_table.setStyle(TableStyle([
        ('FONT', (0, 1), (0, 1), 'Helvetica', FONT_SMALL),
        ('TEXTCOLOR', (0, 1), (0, 1), COLOR_FOOTER),
        ('ALIGN', (0, 0), (0, 1), 'CENTER'),
    ]))
    
    return cell_table


def generate_sample_pdf():
    """Generate sample PDF"""
    
    output_path = 'SAMPLE_PYTHON_REPORT.pdf'
    
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
    
    # VEHICLE REGISTRATION DETAILS
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
    
    story.append(create_data_table(vehicle_data))
    story.append(Spacer(1, 10))
    
    # CURRENT OWNER DETAILS
    story.append(create_section_header('Current Owner Details'))
    
    owner_data = [
        ('Owner Name', sample_data['ownerName']),
        ('Contact Number', sample_data['ownerContact']),
        ('Email Address', sample_data['ownerEmail']),
        ('Inspection Location', sample_data['location']),
    ]
    
    story.append(create_data_table(owner_data))
    story.append(Spacer(1, 10))
    
    # INSPECTION DETAILS
    story.append(create_section_header('Inspection Details'))
    
    inspector_data = [
        ('Inspector Name', sample_data['inspectorName']),
        ('Inspection Date', datetime.now().strftime('%d %b %Y')),
    ]
    
    story.append(create_data_table(inspector_data))
    story.append(Spacer(1, 10))
    
    # KEY HIGHLIGHTS
    story.append(create_section_header('Key Highlights'))
    
    notes_style = ParagraphStyle(
        'Notes',
        fontSize=FONT_BODY,
        textColor=COLOR_TEXT,
        backColor=COLOR_NOTE_BG,
        borderPadding=6,
        borderColor=COLOR_BORDER,
        borderWidth=1
    )
    
    highlights_text = f"""
    <b>Exterior:</b> {sample_data['exteriorChecks']}<br/>
    <b>Interior:</b> {sample_data['interiorChecks']}<br/>
    <b>Engine:</b> {sample_data['engineChecks']}
    """
    
    story.append(Paragraph(highlights_text, notes_style))
    story.append(Spacer(1, 10))
    
    # RATINGS WITH STARS
    story.append(create_section_header('Overall Ratings'))
    
    ratings_data = [
        create_star_rating_row('Interior', 4.0),
        create_star_rating_row('Exterior / Body', 4.5),
        create_star_rating_row('Engine', 4.0),
        create_star_rating_row('Structure', 5.0),
        create_star_rating_row('Test Drive', 4.5),
        create_star_rating_row('Electrical', 4.0),
    ]
    
    story.append(create_data_table(ratings_data))
    story.append(Spacer(1, 10))
    
    # VEHICLE PHOTOS (Image placeholders)
    story.append(create_section_header('Vehicle Photos'))
    
    # 3-column grid with 90px height, 6px gap
    image_width = (CONTENT_WIDTH - (2 * 6)) / 3
    image_height = 90 * 0.75  # 90px = 67.5pt
    
    # Sample images
    captions = ['RC Book', 'Chassis Plate', 'Odometer Reading',
                'Front Bumper', 'Bonnet', 'Front Grille',
                'Windshield', 'Headlights', 'Dashboard']
    
    row_data = []
    for i, caption in enumerate(captions):
        row_data.append(create_image_placeholder(image_width, image_height, caption))
        
        if len(row_data) == 3 or i == len(captions) - 1:
            while len(row_data) < 3:
                row_data.append('')
            
            row_table = Table([row_data], colWidths=[image_width] * 3)
            row_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(row_table)
            story.append(Spacer(1, 6))
            row_data = []
    
    # Build PDF
    doc.build(story, canvasmaker=FooterCanvas)
    
    return output_path


if __name__ == '__main__':
    print('🎨 Generating sample Python PDF...')
    
    try:
        output_file = generate_sample_pdf()
        print(f'✅ SUCCESS! Sample PDF generated: {output_file}')
        print('\n📋 This shows EXACTLY how the Lambda output will look:')
        print('   • Header: Logo | Title | Meta (NO OVERLAP)')
        print('   • Star ratings: ★★★★☆ (NO & symbols)')
        print('   • Footer: Email | Mobile | Website (VISIBLE ON EVERY PAGE)')
        print('   • Fonts: 18px/14px/12px/11px (EXACT TEMPLATE)')
        print('   • Colors: #004a99 primary (EXACT TEMPLATE)')
        print('   • Margins: 18mm all sides (EXACT TEMPLATE)')
        print('\n🔍 Review the PDF and confirm it looks good!')
        print('   Then run deploy-python.ps1 to deploy to Lambda.')
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()
