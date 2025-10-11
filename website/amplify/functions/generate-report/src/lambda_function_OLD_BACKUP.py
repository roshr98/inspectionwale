"""
Professional Vehicle Inspection Report Generator - Python Lambda
Uses ReportLab for precise PDF generation matching template exactly
Handles large phone images (S23 Ultra) with Pillow compression
"""

import json
import boto3
import io
import base64
from datetime import datetime
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors as rlcolors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import cgi
import uuid

# AWS clients
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Environment variables
BUCKET_NAME = 'inspectionwale-reports'
TABLE_NAME = 'InspectionReports'

# EXACT TEMPLATE COLORS
COLOR_PRIMARY = HexColor('#004a99')      # Main blue - exact from template
COLOR_TEXT = HexColor('#222222')         # Body text
COLOR_LABEL = HexColor('#333333')        # Labels
COLOR_META = HexColor('#555555')         # Meta info
COLOR_FOOTER = HexColor('#666666')       # Footer text
COLOR_NOTE_BG = HexColor('#f7f9fc')      # Notes background
COLOR_BORDER = HexColor('#cccccc')       # Borders
COLOR_STAR_FILLED = HexColor('#f59e0b')  # Golden star (filled)
COLOR_STAR_EMPTY = HexColor('#d1d5db')   # Gray star (empty)

# EXACT TEMPLATE FONT SIZES (pt conversion: 1px ≈ 0.75pt)
FONT_TITLE = 18 * 0.75      # 13.5pt (18px)
FONT_HEADER = 14 * 0.75     # 10.5pt (14px)
FONT_BODY = 12 * 0.75       # 9pt (12px)
FONT_SMALL = 11 * 0.75      # 8.25pt (11px)

# EXACT TEMPLATE MARGINS (18mm all sides)
PAGE_MARGIN = 18 * mm

# A4 dimensions
PAGE_WIDTH, PAGE_HEIGHT = A4
CONTENT_WIDTH = PAGE_WIDTH - (2 * PAGE_MARGIN)  # 174mm usable width


def compress_image(image_data, max_width=1200, max_height=1200, quality=85):
    """
    Compress large phone images (S23 Ultra, iPhone Pro, etc.)
    Maintains aspect ratio and converts to JPEG
    """
    try:
        # Open image
        img = Image.open(io.BytesIO(image_data))
        
        # Convert RGBA to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        
        # Calculate new size maintaining aspect ratio
        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        compressed_data = output.getvalue()
        
        print(f"✅ Image compressed: {len(image_data)/1024:.0f}KB → {len(compressed_data)/1024:.0f}KB")
        return compressed_data
        
    except Exception as e:
        print(f"⚠️ Image compression failed: {e}, using original")
        return image_data


def parse_multipart(event):
    """Parse multipart/form-data from API Gateway event"""
    content_type = event['headers'].get('content-type') or event['headers'].get('Content-Type', '')
    
    # Decode body
    body = base64.b64decode(event['body']) if event.get('isBase64Encoded') else event['body'].encode()
    
    # Parse boundary
    boundary = content_type.split('boundary=')[1].encode()
    
    fields = {}
    files = {}
    
    # Split by boundary
    parts = body.split(b'--' + boundary)
    
    for part in parts[1:-1]:  # Skip first empty and last closing boundary
        if not part.strip():
            continue
            
        # Split headers and content
        header_end = part.find(b'\r\n\r\n')
        if header_end == -1:
            continue
            
        headers = part[:header_end].decode('utf-8', errors='ignore')
        content = part[header_end+4:-2]  # Remove \r\n at end
        
        # Parse Content-Disposition
        if 'Content-Disposition' in headers:
            # Extract field name
            name_match = headers.split('name="')[1].split('"')[0] if 'name="' in headers else None
            
            if not name_match:
                continue
            
            # Check if it's a file
            if 'filename="' in headers:
                filename = headers.split('filename="')[1].split('"')[0]
                # Compress if it's an image
                if any(ext in filename.lower() for ext in ['.jpg', '.jpeg', '.png', '.heic']):
                    content = compress_image(content)
                files[name_match] = {
                    'filename': filename,
                    'content': content
                }
            else:
                # Regular field
                fields[name_match] = content.decode('utf-8', errors='ignore')
    
    print(f"✅ Parsed {len(fields)} fields and {len(files)} files")
    return fields, files


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
        """Draw footer with contact details - HORIZONTAL LAYOUT, SMALL SIZE"""
        footer_y = PAGE_MARGIN - 5 * mm  # Position at bottom margin
        
        # Top border line
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.line(PAGE_MARGIN, footer_y + 8 * mm, PAGE_WIDTH - PAGE_MARGIN, footer_y + 8 * mm)
        
        # Contact details - HORIZONTAL, EXACT TEMPLATE FONT SIZE (11px = 8.25pt)
        self.setFont('Helvetica', FONT_SMALL)
        self.setFillColor(COLOR_FOOTER)
        
        # Email - LEFT
        self.drawString(PAGE_MARGIN, footer_y + 4 * mm, 'Email: hello@inspectionwale.com')
        
        # Mobile - CENTER
        self.drawCentredString(PAGE_WIDTH / 2, footer_y + 4 * mm, 'Mobile: 9167558998')
        
        # Website - RIGHT
        self.drawRightString(PAGE_WIDTH - PAGE_MARGIN, footer_y + 4 * mm, 'Web: inspectionwale.com')
        
        # Page number - CENTER, smaller
        self.setFont('Helvetica', FONT_SMALL - 1)
        self.drawCentredString(PAGE_WIDTH / 2, footer_y + 1 * mm, f'Page {page_num} of {total_pages}')
        
        # Disclaimer - VERY SMALL, CENTER
        self.setFont('Helvetica', FONT_SMALL - 2)
        self.drawCentredString(PAGE_WIDTH / 2, footer_y - 2 * mm, 
                               'Professional vehicle inspection report. Valid for 2 days or 20 km.')


def create_header(data):
    """Create header matching template exactly"""
    report_id = f"INS-{int(datetime.now().timestamp())}"
    report_date = datetime.now().strftime('%d %b %Y')
    
    # Header table with 3 columns: Logo/Brand | Title | Meta
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
        
        # No borders
        ('LINEBELOW', (0, 0), (-1, -1), 2, COLOR_PRIMARY),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    return header_table, report_id


def create_section_header(title):
    """Create section header matching template (14px, #004a99, 8px margin)"""
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
    """Create data table with label/value pairs matching template exactly"""
    # Convert rows to table format
    table_data = []
    for label, value in data_rows:
        table_data.append([label, value or 'N/A'])
    
    # 40% width for labels, 60% for values (template spec)
    col_widths = [CONTENT_WIDTH * 0.4, CONTENT_WIDTH * 0.6]
    
    table = Table(table_data, colWidths=col_widths)
    table.setStyle(TableStyle([
        # Font: 12px = 9pt
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', FONT_BODY),  # Labels bold
        ('FONT', (1, 0), (1, -1), 'Helvetica', FONT_BODY),       # Values normal
        
        # Colors from template
        ('TEXTCOLOR', (0, 0), (0, -1), COLOR_LABEL),  # Labels #333
        ('TEXTCOLOR', (1, 0), (1, -1), COLOR_TEXT),   # Values #222
        
        # Padding: 6px from template
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        
        # Alignment
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        
        # Border
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, COLOR_BORDER),
    ]))
    
    return table


def create_image_grid(image_files, captions):
    """Create 3-column image grid matching template (90px height, 6px gap)"""
    if not image_files:
        return None
    
    elements = []
    images_per_row = 3
    image_width = (CONTENT_WIDTH - (2 * 6)) / 3  # 6px gap between images
    image_height = 90 * 0.75  # 90px = 67.5pt
    
    row_data = []
    for i, (field_name, img_data) in enumerate(image_files.items()):
        # Create image
        img_obj = io.BytesIO(img_data['content'])
        img = RLImage(img_obj, width=image_width, height=image_height)
        
        # Caption
        caption = captions[i] if i < len(captions) else field_name.replace('_', ' ').title()
        
        # Cell with image and caption
        cell_data = [[img], [caption]]
        cell_table = Table(cell_data, colWidths=[image_width])
        cell_table.setStyle(TableStyle([
            ('FONT', (0, 1), (0, 1), 'Helvetica', FONT_SMALL),
            ('TEXTCOLOR', (0, 1), (0, 1), COLOR_FOOTER),
            ('ALIGN', (0, 0), (0, 1), 'CENTER'),
            ('VALIGN', (0, 0), (0, 0), 'TOP'),
        ]))
        
        row_data.append(cell_table)
        
        # Complete row of 3
        if len(row_data) == images_per_row or i == len(image_files) - 1:
            # Pad row if needed
            while len(row_data) < images_per_row:
                row_data.append('')
            
            # Create row table
            row_table = Table([row_data], colWidths=[image_width] * images_per_row)
            row_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            elements.append(row_table)
            elements.append(Spacer(1, 6))  # 6px gap between rows
            row_data = []
    
    return elements


def generate_pdf(form_data, image_files):
    """Generate PDF matching template exactly with ReportLab"""
    
    buffer = io.BytesIO()
    
    # Create PDF with custom footer canvas
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=PAGE_MARGIN,
        rightMargin=PAGE_MARGIN,
        topMargin=PAGE_MARGIN,
        bottomMargin=PAGE_MARGIN + 15*mm,  # Extra space for footer
        title=f"Vehicle Inspection Report - {form_data.get('registrationNumber', 'Unknown')}"
    )
    
    # Story elements
    story = []
    
    # HEADER
    header, report_id = create_header(form_data)
    story.append(header)
    story.append(Spacer(1, 10))  # 10px margin after header
    
    # VEHICLE REGISTRATION DETAILS
    story.append(create_section_header('Vehicle Registration Details'))
    
    vehicle_data = [
        ('Vehicle Number', form_data.get('registrationNumber')),
        ('Make / Model', f"{form_data.get('make')} {form_data.get('model')}"),
        ('Variant', form_data.get('variant')),
        ('Chassis Number', form_data.get('chassisNumber')),
        ('Engine Number', form_data.get('engineNumber')),
        ('Manufacture Year', form_data.get('manufactureYear')),
        ('Registration Date', form_data.get('registrationDate')),
        ('Fuel Type', form_data.get('fuelType')),
        ('Color', form_data.get('color')),
        ('Odometer Reading', f"{form_data.get('odometerReading')} km"),
        ('Number of Owners', form_data.get('ownersCount')),
    ]
    
    story.append(create_data_table(vehicle_data))
    story.append(Spacer(1, 10))  # 10px between sections
    
    # CURRENT OWNER DETAILS
    story.append(create_section_header('Current Owner Details'))
    
    owner_data = [
        ('Owner Name', form_data.get('ownerName')),
        ('Contact Number', form_data.get('ownerContact')),
        ('Email Address', form_data.get('ownerEmail')),
        ('Inspection Location', form_data.get('location')),
    ]
    
    story.append(create_data_table(owner_data))
    story.append(Spacer(1, 10))
    
    # INSPECTION DETAILS
    story.append(create_section_header('Inspection Details'))
    
    inspector_data = [
        ('Inspector Name', form_data.get('inspectorName')),
        ('Inspection Date', datetime.now().strftime('%d %b %Y')),
    ]
    
    story.append(create_data_table(inspector_data))
    story.append(Spacer(1, 10))
    
    # KEY HIGHLIGHTS (if provided)
    if any(form_data.get(f) for f in ['exteriorChecks', 'interiorChecks', 'engineChecks']):
        story.append(create_section_header('Key Highlights'))
        
        # Create notes paragraph with background color
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
        <b>Exterior:</b> {form_data.get('exteriorChecks', 'N/A')}<br/>
        <b>Interior:</b> {form_data.get('interiorChecks', 'N/A')}<br/>
        <b>Engine:</b> {form_data.get('engineChecks', 'N/A')}
        """
        
        story.append(Paragraph(highlights_text, notes_style))
        story.append(Spacer(1, 10))
    
    # VEHICLE PHOTOS (3-column grid, 90px height, 6px gap)
    if image_files:
        story.append(create_section_header('Vehicle Photos'))
        
        # Organize images by category
        doc_images = {k: v for k, v in image_files.items() if 'rc' in k.lower() or 'chassis' in k.lower() or 'odometer' in k.lower()}
        other_images = {k: v for k, v in image_files.items() if k not in doc_images}
        
        # Documents section
        if doc_images:
            doc_captions = ['RC Book', 'Chassis Plate', 'Odometer Reading']
            doc_grid = create_image_grid(doc_images, doc_captions)
            if doc_grid:
                for element in doc_grid:
                    story.append(element)
                story.append(Spacer(1, 10))
        
        # Other photos
        if other_images:
            photo_captions = [k.replace('_', ' ').title() for k in other_images.keys()]
            photo_grid = create_image_grid(other_images, photo_captions)
            if photo_grid:
                for element in photo_grid:
                    story.append(element)
                story.append(Spacer(1, 10))
    
    # Build PDF with custom footer canvas
    doc.build(story, canvasmaker=FooterCanvas)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes, report_id


def lambda_handler(event, context):
    """AWS Lambda handler"""
    print("🚀 Starting Python PDF generation...")
    
    try:
        # Parse multipart form data
        fields, files = parse_multipart(event)
        
        print(f"✅ Received {len(files)} images")
        
        # Generate PDF with exact template styling
        pdf_bytes, report_id = generate_pdf(fields, files)
        
        print(f"✅ PDF generated: {len(pdf_bytes)/1024:.2f}KB")
        
        # Upload to S3
        pdf_key = f"reports/{fields.get('registrationNumber', 'unknown')}_{int(datetime.now().timestamp())}.pdf"
        
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=pdf_key,
            Body=pdf_bytes,
            ContentType='application/pdf'
        )
        
        pdf_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{pdf_key}"
        print(f"✅ PDF uploaded: {pdf_url}")
        
        # Save metadata to DynamoDB
        table = dynamodb.Table(TABLE_NAME)
        table.put_item(
            Item={
                'reportId': report_id,
                'vehicleNumber': fields.get('registrationNumber'),
                'inspectorName': fields.get('inspectorName'),
                'createdAt': datetime.now().isoformat(),
                'pdfUrl': pdf_url,
                'photoCount': len(files)
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Report generated successfully',
                'pdfUrl': pdf_url,
                'reportId': report_id,
                'photoCount': len(files)
            })
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }
