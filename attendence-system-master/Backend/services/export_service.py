import csv
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ExportService:
    @staticmethod
    def to_csv(records, filepath):
        if not records:
            return
        keys = ["name", "roll", "department", "year", "date", "subject", "status"]
        with open(filepath, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=keys, extrasaction="ignore")
            writer.writeheader()
            for r in records:
                writer.writerow(r)

    @staticmethod
    def to_excel(records, filepath):
        if not records:
            return
        df = pd.DataFrame(records)
        # Select and rename columns for a professional presentation
        columns_to_keep = {
            "name": "Student Name",
            "roll": "Roll Number",
            "department": "Department",
            "year": "Year",
            "date": "Date",
            "subject": "Subject",
            "status": "Attendance Status"
        }
        df = df[list(columns_to_keep.keys())].rename(columns=columns_to_keep)
        
        # Write to excel using openpyxl engine
        with pd.ExcelWriter(filepath, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Attendance Report")

    @staticmethod
    def to_pdf(records, filepath):
        if not records:
            return
            
        doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        story = []
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            name='TitleStyle',
            parent=styles['Heading1'],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#4A5568'),
            alignment=1, # Center alignment
            spaceAfter=20
        )
        
        # Add Header Paragraph
        story.append(Paragraph("Student Attendance Report", title_style))
        story.append(Spacer(1, 10))
        
        # Build Table Data
        headers = ["Name", "Roll No", "Dept", "Year", "Date", "Subject", "Status"]
        table_data = [headers]
        
        for r in records:
            table_data.append([
                r.get("name", ""),
                r.get("roll", ""),
                r.get("department", ""),
                str(r.get("year", "")),
                r.get("date", ""),
                r.get("subject", ""),
                r.get("status", "")
            ])
            
        # Draw Table
        col_widths = [120, 70, 50, 40, 80, 100, 60]
        t = Table(table_data, colWidths=col_widths)
        
        # Table Styling
        t_style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667EEA')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E0')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
        ])
        
        # Highlight present vs absent in rows
        for idx, row in enumerate(records, start=1):
            if row.get("status") == "Present":
                t_style.add('TEXTCOLOR', (6, idx), (6, idx), colors.HexColor('#2F855A'))
            else:
                t_style.add('TEXTCOLOR', (6, idx), (6, idx), colors.HexColor('#C53030'))
                
            # Row alternating backgrounds
            if idx % 2 == 0:
                t_style.add('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#F7FAFC'))
                
        t.setStyle(t_style)
        story.append(t)
        
        # Build Document
        doc.build(story)
