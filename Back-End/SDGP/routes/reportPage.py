import io
import os
import boto3
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import time
from fpdf import FPDF
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from langchain_core.prompts import ChatPromptTemplate

router = APIRouter()
BUCKET_NAME = "ricevision"


def _s3():
    """Create an S3 client using env-var credentials (required on Render)."""
    return boto3.client(
        "s3",
        region_name=os.getenv("AWS_DEFAULT_REGION", "ap-southeast-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )


def sanitize(val):
    if isinstance(val, (np.integer, np.int64)): return int(val)
    if isinstance(val, (np.floating, np.float64)): return float(val)
    if isinstance(val, pd.Timestamp): return str(val)
    if isinstance(val, dict): return {k: sanitize(v) for k, v in val.items()}
    if isinstance(val, list): return [sanitize(v) for v in val]
    return val


def _check_s3_date_exists(client, date_str):
    prefix = f"SupabasePredictions/{date_str}/"
    resp = client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix, MaxKeys=1)
    return "Contents" in resp


def _get_csv_from_s3(client, key):
    try:
        obj = client.get_object(Bucket=BUCKET_NAME, Key=key)
        return pd.read_csv(io.BytesIO(obj["Body"].read()))
    except Exception:
        return None


# --- LLM for Summary ---
llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=os.getenv("GEMINI_API_KEY"))
report_prompt = ChatPromptTemplate.from_template("""
You are an agricultural analysis expert.
Generate a professional report summary based on the following data:
DATA: {data}
Keep it concise and professional.
""")

def generate_ai_report(data: dict) -> str:
    chain = report_prompt | llm
    response = chain.invoke({"data": data})
    return response.content


class UnifiedPDF(FPDF):
    def header(self):
        # ── HEADER (white background) ────────────────────────────────
        self.set_fill_color(255, 255, 255)
        self.rect(0, 0, 210, 40, 'F')
        # Dark green separator 
        self.set_fill_color(0, 100, 50)
        self.rect(0, 40, 210, 2, 'F')
        
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(15, 23, 42) # INK
        self.set_xy(0, 12)
        self.cell(210, 10, "YIELD ANALYTICS REPORT", ln=True, align="C")
        
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(15, 23, 42)
        gen_date = pd.Timestamp.now().strftime('%d %B %Y')
        self.set_xy(0, 22)
        self.cell(210, 10, f"Generated  {gen_date}", ln=True, align="C")

    def footer(self):
        self.set_y(-15)
        self.set_draw_color(226, 232, 240) # BORDER
        self.set_line_width(0.3)
        self.line(14, self.get_y(), 210 - 14, self.get_y())
        self.set_font("Helvetica", "", 6.5)
        self.set_text_color(148, 163, 184) # MUTED
        self.text(14, self.get_y() + 6, "RiceVision Analytics  |  Agricultural Intelligence Platform  |  Confidential")
        self.text(210 - 14 - 15, self.get_y() + 6, f"Page {self.page_no()}")

    def section_heading(self, label):
        self.ln(6)
        self.set_font("Helvetica", "B", 8)
        self.set_text_color(16, 185, 129) # GREEN
        self.cell(0, 8, label.upper(), ln=True)
        self.set_draw_color(16, 185, 129)
        self.set_line_width(0.4)
        self.line(14, self.get_y() - 1, 210 - 14, self.get_y() - 1)
        self.ln(2)

def _create_chart(predicted, historical):
    plt.figure(figsize=(4, 2.2))
    plt.style.use('default') # matching White background of PDF better or keeping brand dark? 
    # Frontend uses transparent on dark. Backend PDF is white. Let's use clean white chart.
    colors = ['#10b981', '#6366f1']
    plt.bar(['Predicted', 'Historical'], [predicted, historical], color=colors, width=0.5)
    plt.title("Yield Comparison (kg/ha)", fontsize=9, weight='bold')
    plt.gca().spines['top'].set_visible(False)
    plt.gca().spines['right'].set_visible(False)
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=120)
    plt.close()
    buf.seek(0)
    return buf

def generate_pdf_report_file(data: dict, ai_summary: str, date_str: str):
    pdf = UnifiedPDF()
    pdf.add_page()
    M = 14
    PW = 210
    
    # ── DISTRICT ROW ──────────────────────────────────────────────
    pdf.set_fill_color(248, 250, 252) # OFFWH
    pdf.rect(0, 42, PW, 20, 'F')
    pdf.set_draw_color(226, 232, 240) # BORDER
    pdf.line(0, 62, PW, 62)
    
    pdf.set_xy(M, 48)
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 8, f"{data.get('districtname', 'N/A')}", ln=True)
    
    pdf.set_font("Helvetica", "", 7)
    pdf.set_text_color(71, 85, 105) # SUBTEXT
    pdf.set_xy(M, 55)
    pdf.cell(0, 5, "Sri Lanka  ·  District Yield Forecast", ln=True)
    
    # Season & Date Chips (Simulated)
    pdf.set_xy(PW - M - 60, 48)
    pdf.set_font("Helvetica", "B", 6.5)
    pdf.cell(28, 6, f"{data.get('season', 'N/A')} Season", border=1, align="C")
    pdf.set_x(PW - M - 30)
    pdf.cell(28, 6, date_str, border=1, align="C")

    # ── KPI SUMMARY CARDS ─────────────────────────────────────────
    pdf.ln(12)
    y_kpi = pdf.get_y()
    
    def stat_card(pdf, x, y, label, val, sub, accent=(16, 185, 129)):
        pdf.set_fill_color(248, 250, 252)
        pdf.rounded_rect(x, y, 88, 25, 2.5, 'F')
        pdf.set_fill_color(*accent)
        pdf.rounded_rect(x, y, 3, 25, 1.5, 'F')
        pdf.set_xy(x + 7, y + 5)
        pdf.set_font("Helvetica", "", 6.5)
        pdf.set_text_color(148, 163, 184)
        pdf.cell(0, 4, label.upper(), ln=True)
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(15, 23, 42)
        pdf.set_xy(x + 7, y + 12)
        pdf.cell(0, 6, val, ln=True)
        if sub:
            pdf.set_font("Helvetica", "", 6)
            pdf.set_text_color(71, 85, 105)
            pdf.set_xy(x + 7, y + 18)
            pdf.cell(0, 4, sub, ln=True)

    yield_val = f"{int(data.get('predictedyield_kg_ha', 0)):,} kg/ha"
    hist_val = f"{int(data.get('historicalavg_kg_ha', 0)):,} kg/ha"
    
    stat_card(pdf, M, y_kpi, "PREDICTED AVG YIELD", yield_val, "Satellite-derived ML forecast")
    stat_card(pdf, M + 92, y_kpi, "HISTORICAL BASELINE", hist_val, "Long-term district average")
    
    # ── CHART ─────────────────────────────────────────────────────
    pdf.ln(32)
    chart_buf = _create_chart(data.get('predictedyield_kg_ha', 0), data.get('historicalavg_kg_ha', 0))
    temp_img = f"/tmp/pdf_chart_{int(time.time())}.png"
    with open(temp_img, "wb") as f: f.write(chart_buf.getbuffer())
    pdf.image(temp_img, x=PW/2 - 45, y=pdf.get_y(), w=90)
    pdf.ln(50)
    if os.path.exists(temp_img): os.remove(temp_img)

    # ── FIELD OVERVIEW ────────────────────────────────────────────
    pdf.section_heading("Field Overview")
    pdf.set_font("Helvetica", "", 8)
    
    rows = [
        ["Growth Stage", data.get("most_common_stage", "N/A"), "Health Status", "Normal" if data.get("severe_stress_pct", 0) < 5 else "Action Req"],
        ["Pest Incidents", str(data.get("pest_attack_count", 0)), "Risk Score", f"{data.get('risk_score', 0):.2f}/10"],
        ["Severe Stress", f"{data.get('severe_stress_pct', 0):.2f}%", "Est. Harvest", str(data.get("est_harvest_date", "N/A")).split(" ")[0]],
    ]
    
    for row in rows:
        pdf.set_font("Helvetica", "B", 7.5); pdf.set_text_color(71, 85, 105)
        pdf.cell(42, 8, f"  {row[0]}", border=1)
        pdf.set_font("Helvetica", "", 7.5); pdf.set_text_color(15, 23, 42)
        pdf.cell(48, 8, f"  {row[1]}", border=1)
        pdf.set_font("Helvetica", "B", 7.5); pdf.set_text_color(71, 85, 105)
        pdf.cell(42, 8, f"  {row[2]}", border=1)
        pdf.set_font("Helvetica", "", 7.5); pdf.set_text_color(15, 23, 42)
        pdf.cell(48, 8, f"  {row[3]}", border=1, ln=True)

    # ── YIELD BREAKDOWN ───────────────────────────────────────────
    pdf.section_heading("Yield Forecast Breakdown")
    pdf.set_font("Helvetica", "B", 7.5); pdf.set_fill_color(16, 185, 129); pdf.set_text_color(255, 255, 255)
    pdf.cell(60, 8, "  Metric", border=1, fill=True)
    pdf.cell(40, 8, "  Value", border=1, fill=True)
    pdf.cell(30, 8, "  Unit", border=1, fill=True)
    pdf.cell(52, 8, "  Notes", border=1, fill=True, ln=True)
    
    pdf.set_text_color(15, 23, 42); pdf.set_font("Helvetica", "", 7.5)
    breakdown = [
        ["Predicted Average Yield", f"{int(data.get('predictedyield_kg_ha', 0)):,}", "kg/ha", "ML forecast"],
        ["Historical Average Yield", f"{int(data.get('historicalavg_kg_ha', 0)):,}", "kg/ha", "Baseline"],
        ["Total Est. Production", f"{int(data.get('totalyield_kg', 0)):,}", "kg", "District total"],
        ["Yield Gap", f"{int(data.get('yieldgap_kg_ha', 0)):,}", "kg/ha", "Performance vs baseline"],
    ]
    for b in breakdown:
        pdf.cell(60, 8, f"  {b[0]}", border=1)
        pdf.cell(40, 8, f"  {b[1]}", border=1, align="R")
        pdf.cell(30, 8, f"  {b[2]}", border=1, align="C")
        pdf.cell(52, 8, f"  {b[3]}", border=1, ln=True)

    # ── RISK BAR & AI ANALYSIS ────────────────────────────────────
    pdf.section_heading("Risk & Health Assessment")
    risk = data.get('risk_score', 0)
    pdf.set_fill_color(241, 245, 249)
    pdf.rounded_rect(M, pdf.get_y()+2, 182, 6, 1.5, 'F')
    pdf.set_fill_color(16, 185, 129) if risk < 1 else pdf.set_fill_color(217, 119, 6) if risk < 4 else pdf.set_fill_color(220, 38, 38)
    pdf.rounded_rect(M, pdf.get_y()+2, max(5, 182 * (risk/10)), 6, 1.5, 'F')
    pdf.ln(10)
    
    pdf.set_font("Helvetica", "B", 8); pdf.set_text_color(16, 185, 129)
    pdf.cell(0, 6, "AI-Powered Analysis & Insights:", ln=True)
    pdf.set_font("Helvetica", "", 8); pdf.set_text_color(30, 41, 59)
    pdf.multi_cell(0, 5, ai_summary)

    # ── DISCLAIMER ────────────────────────────────────────────────
    pdf.ln(5)
    pdf.set_fill_color(254, 242, 242)
    pdf.rect(M, pdf.get_y(), 182, 18, 'F')
    pdf.set_fill_color(220, 38, 38); pdf.rect(M, pdf.get_y(), 2, 18, 'F')
    pdf.set_xy(M+5, pdf.get_y()+3)
    pdf.set_font("Helvetica", "B", 6.5); pdf.set_text_color(220, 38, 38); pdf.cell(0, 4, "DISCLAIMER", ln=True)
    pdf.set_font("Helvetica", "I", 6); pdf.set_text_color(153, 27, 27)
    pdf.multi_cell(175, 3.5, "This report is generated from satellite imagery and machine-learning models. Data is indicative only — please use alongside on-ground verification. RiceVision assumes no liability for decisions made solely on the basis of this report.")

    return pdf.output()


# ─── PUBLIC HELPER FOR CHATBOT TOOL ─────────────────────────────────────────

def generate_report_for_district(date: str, district: str, season: str) -> bytes:
    """
    Full pipeline: fetch data from S3, run AI summary, build PDF.
    Returns raw PDF bytes.  Raises ValueError if data is missing.
    Imported and called directly by the chat.py tool — no HTTP round-trip.
    """
    client = _s3()
    df_yield = _get_csv_from_s3(client, f"SupabasePredictions/{date}/yieldPredictions.csv")
    
    if df_yield is None:
        try:
            resp = client.list_objects_v2(Bucket=BUCKET_NAME, Prefix="SupabasePredictions/", Delimiter="/")
            folders = [p.get("Prefix").split("/")[-2] for p in resp.get("CommonPrefixes", [])]
            if folders:
                latest_date = sorted(folders)[-1]
                df_yield = _get_csv_from_s3(client, f"SupabasePredictions/{latest_date}/yieldPredictions.csv")
                date = latest_date
        except Exception:
            pass
            
    if df_yield is None:
        raise ValueError(f"No prediction data found on S3 for date '{date}' or any fallback.")

    def norm(name):
        return str(name).strip().lower().replace("th", "t")

    target = norm(district)
    y_match = df_yield[
        (df_yield["districtname"].apply(norm) == target) &
        (df_yield["season"].str.lower() == season.lower())
    ]
    if y_match.empty:
        raise ValueError(
            f"No data found for district '{district}' / season '{season}' on date '{date}'."
        )

    data_row = y_match.iloc[0].to_dict()
    ai_summary = generate_ai_report(data_row)
    pdf_bytes = generate_pdf_report_file(data_row, ai_summary, date)
    return bytes(pdf_bytes)


@router.get("/download-pdf")
async def download_pdf_report(date: str, district: str, season: str):
    try:
        client = _s3()
        df_yield = _get_csv_from_s3(client, f"SupabasePredictions/{date}/yieldPredictions.csv")
        if df_yield is None: raise HTTPException(status_code=404, detail="Prediction data missing.")
        
        def norm(name): return str(name).strip().lower().replace("th", "t")
        target = norm(district)
        y_match = df_yield[(df_yield["districtname"].apply(norm) == target) & (df_yield["season"].str.lower() == season.lower())]
        if y_match.empty: raise HTTPException(status_code=404, detail="No matching data found.")

        data_row = y_match.iloc[0].to_dict()
        ai_summary = generate_ai_report(data_row)
        pdf_bytes = generate_pdf_report_file(data_row, ai_summary, date)
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Yield_Analytics_Report_{district}_{date}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))