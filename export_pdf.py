"""Convert a markdown report to PDF using reportlab."""
from __future__ import annotations
import sys
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def md_to_pdf(md_path: str, pdf_path: str):
    md = Path(md_path).read_text(encoding="utf-8")
    lines = md.splitlines()

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )

    styles = getSampleStyleSheet()

    h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=18, spaceAfter=12,
                        textColor=colors.HexColor("#1a1a2e"))
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=13, spaceBefore=16,
                        spaceAfter=6, textColor=colors.HexColor("#16213e"))
    body = ParagraphStyle("Body", parent=styles["Normal"], fontSize=9.5,
                          spaceAfter=4, leading=14)
    bullet = ParagraphStyle("Bullet", parent=styles["Normal"], fontSize=9,
                             spaceAfter=3, leftIndent=12, leading=13,
                             textColor=colors.HexColor("#2d2d2d"))

    story = []

    for line in lines:
        line = line.strip()
        if not line:
            story.append(Spacer(1, 6))
            continue

        # Escape special chars for reportlab
        safe = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

        if safe.startswith("# "):
            story.append(Paragraph(safe[2:], h1))
            story.append(HRFlowable(width="100%", thickness=1,
                                    color=colors.HexColor("#e63946"), spaceAfter=8))
        elif safe.startswith("## "):
            story.append(Paragraph(safe[3:], h2))
        elif safe.startswith("- "):
            story.append(Paragraph(f"• {safe[2:]}", bullet))
        else:
            story.append(Paragraph(safe, body))

    doc.build(story)
    print(f"PDF oluşturuldu: {pdf_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Kullanım: python export_pdf.py <input.md> <output.pdf>")
    md_to_pdf(sys.argv[1], sys.argv[2])
