import io
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)

from SDGP.db import supabase

router = APIRouter()

# ─── COLORS ───────────────────────────────────────────────────────────────────

GREEN_DARK   = colors.HexColor("#27500a")
GREEN_MID    = colors.HexColor("#3b6d11")
GREEN_LIGHT  = colors.HexColor("#eaf3de")
GREEN_ACCENT = colors.HexColor("#639922")
AMBER        = colors.HexColor("#ba7517")
AMBER_LIGHT  = colors.HexColor("#faeeda")
RED_DARK     = colors.HexColor("#a32d2d")
RED_LIGHT    = colors.HexColor("#fcebeb")
GRAY_DARK    = colors.HexColor("#2c2c2a")
GRAY_MID     = colors.HexColor("#5f5e5a")
GRAY_LIGHT   = colors.HexColor("#f1efe8")
WHITE        = colors.white

# ─── STYLES ───────────────────────────────────────────────────────────────────

def make_styles():
    base = getSampleStyleSheet()

    styles = {
        "title": ParagraphStyle(
            "title",
            fontName="Helvetica-Bold",
            fontSize=22,
            textColor=WHITE,
            alignment=TA_CENTER,
            spaceAfter=4,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            fontName="Helvetica",
            fontSize=11,
            textColor=colors.HexColor("#c0dd97"),
            alignment=TA_CENTER,
            spaceAfter=2,
        ),
        "section": ParagraphStyle(
            "section",
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=GREEN_DARK,
            spaceBefore=14,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body",
            fontName="Helvetica",
            fontSize=10,
            textColor=GRAY_DARK,
            leading=15,
            spaceAfter=6,
        ),
        "small": ParagraphStyle(
            "small",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRAY_MID,
            alignment=TA_RIGHT,
        ),
        "kpi_label": ParagraphStyle(
            "kpi_label",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRAY_MID,
            alignment=TA_CENTER,
        ),
        "kpi_value": ParagraphStyle(
            "kpi_value",
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=GREEN_DARK,
            alignment=TA_CENTER,
        ),
        "kpi_unit": ParagraphStyle(
            "kpi_unit",
            fontName="Helvetica",
            fontSize=9,
            textColor=GREEN_MID,
            alignment=TA_CENTER,
        ),
        "alert": ParagraphStyle(
            "alert",
            fontName="Helvetica",
            fontSize=9,
            textColor=RED_DARK,
            leading=13,
        ),
        "tag_green": ParagraphStyle(
            "tag_green",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=GREEN_DARK,
            alignment=TA_CENTER,
        ),
    }
    return styles


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def safe(val, default="—", decimals=None):
    if val is None:
        return default
    if decimals is not None:
        try:
            return f"{float(val):.{decimals}f}"
        except Exception:
            return str(val)
    return str(val)


def risk_color(score):
    try:
        s = float(score)
        if s >= 70: return RED_DARK, RED_LIGHT
        if s >= 40: return AMBER, AMBER_LIGHT
        return GREEN_MID, GREEN_LIGHT
    except Exception:
        return GRAY_MID, GRAY_LIGHT


def section_header(text, styles):
    return [
        Paragraph(text, styles["section"]),
        HRFlowable(width="100%", thickness=1, color=GREEN_ACCENT, spaceAfter=6),
    ]


def kpi_table(items, styles):
    """items = list of (label, value, unit)"""
    cells = []
    for label, value, unit in items:
        cell = [
            Paragraph(label, styles["kpi_label"]),
            Paragraph(str(value), styles["kpi_value"]),
            Paragraph(unit, styles["kpi_unit"]),
        ]
        cells.append(cell)

    col_w = (A4[0] - 4 * cm) / len(cells)
    tbl = Table([cells], colWidths=[col_w] * len(cells))
    tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, -1), GREEN_LIGHT),
        ("ROUNDEDCORNERS", [6]),
        ("BOX",          (0, 0), (-1, -1), 0.5, GREEN_ACCENT),
        ("INNERGRID",    (0, 0), (-1, -1), 0.3, GREEN_ACCENT),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING",   (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 10),
    ]))
    return tbl


def data_table(headers, rows, styles, col_widths=None):
    """Generic styled data table."""
    header_row = [Paragraph(f"<b>{h}</b>", styles["body"]) for h in headers]
    body_rows  = []
    for row in rows:
        body_rows.append([Paragraph(safe(cell), styles["body"]) for cell in row])

    all_rows = [header_row] + body_rows
    page_w   = A4[0] - 4 * cm
    if col_widths is None:
        col_widths = [page_w / len(headers)] * len(headers)

    tbl = Table(all_rows, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  GREEN_MID),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  WHITE),
        ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [WHITE, GRAY_LIGHT]),
        ("GRID",          (0, 0), (-1, -1), 0.3, colors.HexColor("#b4b2a9")),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return tbl


# ─── COVER HEADER ─────────────────────────────────────────────────────────────

def build_cover(district, season, date, styles):
    """Returns the green cover header block as a Table."""
    generated = datetime.now().strftime("%d %B %Y, %H:%M")

    title_cell = [
        Spacer(1, 0.3 * cm),
        Paragraph("🌾  RiceVision", styles["subtitle"]),
        Paragraph("Agricultural Intelligence Report", styles["title"]),
        Spacer(1, 0.2 * cm),
        Paragraph(
            f"District: <b>{district.title()}</b>  &nbsp;|&nbsp;  Season: <b>{season}</b>  &nbsp;|&nbsp;  Data Date: <b>{date}</b>",
            styles["subtitle"],
        ),
        Paragraph(f"Generated: {generated}", styles["subtitle"]),
        Spacer(1, 0.3 * cm),
    ]

    cover = Table([[title_cell]], colWidths=[A4[0] - 4 * cm])
    cover.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), GREEN_DARK),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING",   (0, 0), (-1, -1), 20),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 20),
    ]))
    return cover


# ─── DATA FETCHERS ────────────────────────────────────────────────────────────

def fetch_district_yield(district: str, year: Optional[int]):
    try:
        q = (
            supabase.table("Final_Dataset_Yield")
            .select("*")
            .ilike("districtname", district.strip())
        )
        if year:
            q = q.eq("year", year)
        return q.execute().data or []
    except Exception:
        return []


def fetch_reports(district: str):
    try:
        return (
            supabase.table("reports")
            .select("*")
            .ilike("district", f"%{district}%")
            .order("created_at", desc=True)
            .limit(10)
            .execute()
            .data or []
        )
    except Exception:
        return []


def fetch_alerts(district: str):
    try:
        return (
            supabase.table("alerts")
            .select("*")
            .ilike("district", f"%{district}%")
            .order("date", desc=True)
            .limit(5)
            .execute()
            .data or []
        )
    except Exception:
        return []


def fetch_field_stats():
    try:
        summary = supabase.table("field_summary_view").select("*").single().execute().data
        health  = supabase.table("sri_lanka_paddy_health_summary").select("*").single().execute().data
        return summary, health
    except Exception:
        return {}, {}


def fetch_growth_stages():
    try:
        return supabase.table("stage_name_counts_view").select("*").execute().data or []
    except Exception:
        return []


def fetch_pest_risks(district: str):
    try:
        return (
            supabase.table("pest_risk_view")
            .select("*")
            .ilike("district", f"%{district}%")
            .execute()
            .data or []
        )
    except Exception:
        return []


# ─── PDF BUILDER ──────────────────────────────────────────────────────────────

def generate_pdf(district: str, season: str, date: str) -> bytes:
    buf    = io.BytesIO()
    styles = make_styles()

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title=f"RiceVision Report — {district} {season}",
        author="RiceVision AI",
    )

    # Parse year from date if possible
    year = None
    try:
        year = int(date.split("-")[0])
    except Exception:
        pass

    # ── Fetch all data ────────────────────────────────────────────────────────
    yield_data   = fetch_district_yield(district, year)
    reports_data = fetch_reports(district)
    alerts_data  = fetch_alerts(district)
    field_sum, health_data = fetch_field_stats()
    growth_data  = fetch_growth_stages()
    pest_data    = fetch_pest_risks(district)

    row = yield_data[0] if yield_data else {}

    # ── Story ─────────────────────────────────────────────────────────────────
    story = []

    # Cover
    story.append(build_cover(district, season, date, styles))
    story.append(Spacer(1, 0.5 * cm))

    # ── KPI Summary ───────────────────────────────────────────────────────────
    story += section_header("Key Performance Indicators", styles)

    predicted_yield = safe(row.get("predicted_yield_kg_per_ha"), "N/A", 1)
    risk_score      = safe(row.get("risk_score"), "N/A", 1)
    health_z        = safe(row.get("health_index_z"), "N/A", 2)
    stress_pct      = safe(row.get("severe_stress_pct"), "N/A", 1)

    story.append(kpi_table([
        ("Predicted Yield",    predicted_yield, "kg / ha"),
        ("Risk Score",         risk_score,      "/ 100"),
        ("Health Index (Z)",   health_z,        "z-score"),
        ("Severe Stress",      stress_pct,      "%"),
    ], styles))
    story.append(Spacer(1, 0.4 * cm))

    # ── District Yield Details ─────────────────────────────────────────────────
    if yield_data:
        story += section_header("District Yield Analysis", styles)

        headers = ["District", "Year", "Season", "Pred. Yield (kg/ha)", "Risk Score", "Stress %", "Health Z"]
        rows = []
        for d in yield_data[:10]:
            rows.append([
                d.get("districtname", "—"),
                safe(d.get("year")),
                safe(d.get("season", season)),
                safe(d.get("predicted_yield_kg_per_ha"), decimals=1),
                safe(d.get("risk_score"), decimals=1),
                safe(d.get("severe_stress_pct"), decimals=1),
                safe(d.get("health_index_z"), decimals=2),
            ])

        page_w  = A4[0] - 4 * cm
        col_ws  = [page_w * w for w in [0.18, 0.08, 0.12, 0.18, 0.12, 0.12, 0.12, 0.08]]
        story.append(KeepTogether([data_table(headers, rows, styles)]))
        story.append(Spacer(1, 0.3 * cm))

    # ── Field & Health Summary ────────────────────────────────────────────────
    if field_sum or health_data:
        story += section_header("National Field & Health Summary", styles)

        info_rows = []
        if field_sum:
            for k, v in field_sum.items():
                info_rows.append([k.replace("_", " ").title(), safe(v)])
        if health_data:
            for k, v in health_data.items():
                info_rows.append([k.replace("_", " ").title(), safe(v)])

        if info_rows:
            tbl = data_table(["Metric", "Value"], info_rows, styles,
                             col_widths=[A4[0] * 0.35, A4[0] * 0.35])
            story.append(tbl)
            story.append(Spacer(1, 0.3 * cm))

    # ── Pest Risk ─────────────────────────────────────────────────────────────
    if pest_data:
        story += section_header("Pest Risk Assessment", styles)
        headers = ["District", "Pest Type", "Risk Level", "Affected Area", "Recommendation"]
        rows = [
            [
                d.get("district", "—"),
                d.get("pest_type", "—"),
                d.get("risk_level", "—"),
                safe(d.get("affected_area_ha"), decimals=1),
                d.get("recommendation", "—"),
            ]
            for d in pest_data[:8]
        ]
        story.append(KeepTogether([data_table(headers, rows, styles)]))
        story.append(Spacer(1, 0.3 * cm))

    # ── Growth Stages ─────────────────────────────────────────────────────────
    if growth_data:
        story += section_header("Crop Growth Stage Distribution", styles)
        headers = ["Growth Stage", "Count / Area"]
        rows = [[d.get("stage_name", "—"), safe(d.get("count", d.get("area", "—")))]
                for d in growth_data]
        story.append(
            data_table(headers, rows, styles,
                       col_widths=[A4[0] * 0.35, A4[0] * 0.25])
        )
        story.append(Spacer(1, 0.3 * cm))

    # ── Reports Table ─────────────────────────────────────────────────────────
    if reports_data:
        story += section_header("Field Reports", styles)
        headers = ["Crop", "NDVI", "Status", "Date", "Notes"]
        rows = [
            [
                d.get("crop", "—"),
                safe(d.get("ndvi"), decimals=3),
                d.get("status", "—"),
                safe(d.get("created_at", d.get("date", "—")))[:10],
                d.get("notes", d.get("remarks", "—")),
            ]
            for d in reports_data[:10]
        ]
        story.append(KeepTogether([data_table(headers, rows, styles)]))
        story.append(Spacer(1, 0.3 * cm))

    # ── Alerts ────────────────────────────────────────────────────────────────
    if alerts_data:
        story += section_header("Active Alerts", styles)
        for alert in alerts_data:
            msg   = alert.get("message", alert.get("description", "No details"))
            adate = safe(alert.get("date", ""))[:10]
            level = alert.get("severity", alert.get("level", "Info"))

            _, bg = risk_color(80 if str(level).lower() in ("high", "critical") else 30)

            cell = Table(
                [[Paragraph(f"<b>[{level}]</b>  {msg}  <i>({adate})</i>", styles["alert"])]],
                colWidths=[A4[0] - 4 * cm],
            )
            cell.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, -1), RED_LIGHT),
                ("TOPPADDING",    (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING",   (0, 0), (-1, -1), 10),
                ("BOX",           (0, 0), (-1, -1), 0.5, RED_DARK),
            ]))
            story.append(cell)
            story.append(Spacer(1, 0.2 * cm))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=GREEN_ACCENT))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        f"RiceVision AI  ·  Confidential Agricultural Report  ·  {district.title()} / {season}  ·  {date}",
        styles["small"],
    ))

    doc.build(story)
    buf.seek(0)
    return buf.read()


# ─── ROUTE ────────────────────────────────────────────────────────────────────

@router.get("/download-pdf")
async def download_pdf(
    date:     str = Query(..., description="Date in YYYY-MM-DD format"),
    district: str = Query(..., description="District name"),
    season:   str = Query(..., description="Season: Maha or Yala"),
):
    """
    Generate and stream a PDF agricultural report for the given
    district, season, and date. Called by the chatbot agent via
    get_prediction_report tool.
    """
    if not date or not district or not season:
        raise HTTPException(status_code=400, detail="date, district, and season are required.")

    try:
        pdf_bytes = generate_pdf(district, season, date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    filename = f"RiceVision_{district.title()}_{season}_{date}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )
