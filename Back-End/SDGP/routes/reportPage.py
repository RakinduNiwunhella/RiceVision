import io
import os
import boto3
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from fpdf import FPDF
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langchain_openai import ChatOpenAI
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


@router.get("/available-dates")
async def get_available_dates():
    """Return sorted list of dates that have prediction data in S3."""
    try:
        client = _s3()
        resp = client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix="SupabasePredictions/",
            Delimiter="/",
        )
        prefixes = resp.get("CommonPrefixes", [])
        dates = sorted(
            [p["Prefix"].split("/")[1] for p in prefixes if p.get("Prefix")],
            reverse=True,
        )
        return {"dates": dates}
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=503, detail=f"S3 error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/detailed-report")
async def get_detailed_report(date: str, district: str, season: str):
    try:
        client = _s3()

        if not _check_s3_date_exists(client, date):
            raise HTTPException(status_code=404, detail=f"No data for date {date} in S3.")

        df_yield = _get_csv_from_s3(client, f"SupabasePredictions/{date}/yieldPredictions.csv")
        if df_yield is None:
            raise HTTPException(status_code=404, detail="Prediction files missing for this date.")

        def norm(name): return str(name).strip().lower().replace("th", "t")
        target = norm(district)

        y_match = df_yield[
            (df_yield["districtname"].apply(norm) == target) &
            (df_yield["season"].str.lower() == season.lower())
        ]

        if y_match.empty:
            raise HTTPException(status_code=404, detail="No matching district/season record found.")

        row = y_match.iloc[0]

        return {
            "summary": {
                "yield":      float(row["predictedyield_kg_ha"]),
                "historical": float(row["historicalavg_kg_ha"]),
                "total_kg":   float(row["totalyield_kg"]),
                "gap":        float(row["yieldgap_kg_ha"]),
            },
            "categories": {
                "current_stage": str(row["most_common_stage"]),
                "health_status": "Normal" if float(row["severe_stress_pct"]) < 5 else "Action Required",
            },
            "metrics": {
                "stress_pct":   float(row["severe_stress_pct"]),
                "pest_count":   int(row["pest_attack_count"]),
                "risk_score":   float(row["risk_score"]),
                "harvest_date": str(row["est_harvest_date"]).split(" ")[0],
            },
            "raw_data": {
                "yield_csv": sanitize(row.to_dict()),
            },
        }

    except HTTPException:
        raise
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=503, detail=f"S3 error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
# Initialize LLM
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0
)

# Prompt template
report_prompt = ChatPromptTemplate.from_template("""
You are an agricultural analysis expert.

Generate a professional report based on the following data:

DATA:
{data}

Return the response in this format:

Title:
Summary:
Key Insights:
- point 1
- point 2
Recommendations:
""")

def generate_ai_report(data: dict) -> str:
    chain = report_prompt | llm
    response = chain.invoke({"data": data})
    return response.content


class UnifiedPDF(FPDF):
    def header(self):
        # Header background
        self.set_fill_color(255, 255, 255)
        self.rect(0, 0, 210, 40, 'F')
        
        # Brand Green Stripe
        self.set_fill_color(16, 185, 129)
        self.rect(0, 40, 210, 2, 'F')
        
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(15, 23, 42)
        self.cell(0, 20, "RICEVISION ANALYTICS REPORT", ln=True, align="C")
        
        self.set_font("Helvetica", "", 9)
        self.set_text_color(71, 85, 105)
        self.cell(0, -5, f"Generated: {pd.Timestamp.now().strftime('%d %B %Y')}", ln=True, align="C")
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, f"RiceVision Analytics | Confidential | Page {self.page_no()}", align="C")

    def section_title(self, label):
        self.ln(5)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(16, 185, 129)
        self.cell(0, 8, label.upper(), ln=True)
        self.set_draw_color(16, 185, 129)
        self.set_line_width(0.4)
        self.line(15, self.get_y(), 210 - 15, self.get_y())
        self.ln(4)

def _create_yield_chart(predicted, historical):
    """Creates a chart matching the Report.jsx style."""
    plt.figure(figsize=(4, 2))
    plt.style.use('dark_background')
    
    # Use hex colors matching the frontend
    colors = ['#10b981', '#6366f1']
    labels = ['Yield', 'Historical']
    values = [predicted, historical]
    
    bars = plt.bar(labels, values, color=colors, alpha=0.9, width=0.5)
    plt.title("Yield Comparison (kg/ha)", fontsize=10, color='white', weight='bold')
    plt.xticks(fontsize=8, color='white')
    plt.yticks(fontsize=8, color='white')
    
    # Remove borders
    plt.gca().spines['top'].set_visible(False)
    plt.gca().spines['right'].set_visible(False)
    plt.gca().spines['left'].set_color('gray')
    plt.gca().spines['bottom'].set_color('gray')
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', transparent=True, bbox_inches='tight', dpi=150)
    plt.close()
    buf.seek(0)
    return buf

def generate_pdf_report_file(data: dict, ai_summary: str):
    """Generates a professional UNIFIED PDF report with embedded charts."""
    pdf = UnifiedPDF()
    pdf.add_page()
    
    # 1. District Hero Section
    pdf.set_fill_color(248, 250, 252)
    pdf.rect(0, 42, 210, 28, 'F')
    
    pdf.set_xy(15, 48)
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 8, f"{data.get('districtname', 'N/A').upper()}", ln=True)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 8, f"Season: {data.get('season', 'N/A')}  |  Satellite Data Segment: {data.get('year', 'N/A')}", ln=True)

    # 2. KPI Cards
    pdf.ln(12)
    y_start = pdf.get_y()
    
    def draw_card(pdf, x, y, title, val):
        pdf.set_fill_color(248, 250, 252)
        pdf.rounded_rect(x, y, 85, 25, 3, 'F')
        pdf.set_fill_color(16, 185, 129)
        pdf.rect(x, y, 2, 25, 'F')
        
        pdf.set_xy(x + 5, y + 5)
        pdf.set_font("Helvetica", "", 7)
        pdf.set_text_color(148, 163, 184)
        pdf.cell(0, 5, title.upper(), ln=True)
        
        pdf.set_xy(x + 5, y + 12)
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 8, val, ln=True)

    draw_card(pdf, 15, y_start, "Predicted Avg Yield", f"{data.get('predictedyield_kg_ha', 0):.0f} kg/ha")
    draw_card(pdf, 15 + 85 + 10, y_start, "Historical Baseline", f"{data.get('historicalavg_kg_ha', 0):.0f} kg/ha")
    
    # 3. Yield Comparison Chart
    pdf.ln(30)
    chart_buf = _create_yield_chart(data.get('predictedyield_kg_ha', 0), data.get('historicalavg_kg_ha', 0))
    # Temporarily save to /tmp to load in fpdf
    import time
    temp_img = f"/tmp/chart_{int(time.time())}.png"
    with open(temp_img, "wb") as f:
        f.write(chart_buf.getbuffer())
    
    pdf.image(temp_img, x=60, y=pdf.get_y(), w=90)
    pdf.ln(45)
    
    # Clean up temp
    if os.path.exists(temp_img): os.remove(temp_img)

    # 4. Field Overview Table
    pdf.section_title("Field Overview")
    
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(241, 245, 249)
    
    overview_data = [
        ("Growth Stage", str(data.get("most_common_stage", "N/A"))),
        ("Pest Incidents", f"{data.get('pest_attack_count', 0)}"),
        ("Risk Score", f"{data.get('risk_score', 0):.2f}"),
        ("Severe Stress Area", f"{data.get('severe_stress_pct', 0):.2f}%"),
    ]
    
    for label, val in overview_data:
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(45, 9, f"  {label}", border=1, fill=True)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(55, 9, f"  {val}", border=1, ln=True)

    # 5. AI Insights Section
    pdf.ln(5)
    pdf.section_title("AI-Powered Analysis & Insights")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(30, 41, 59)
    pdf.multi_cell(0, 7, ai_summary)
    
    # 6. Disclaimer
    pdf.ln(10)
    pdf.set_fill_color(254, 242, 242)
    pdf.rect(15, pdf.get_y(), 180, 22, 'F')
    pdf.set_fill_color(220, 38, 38)
    pdf.rect(15, pdf.get_y(), 2, 22, 'F')
    
    pdf.set_xy(20, pdf.get_y() + 4)
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(220, 38, 38)
    pdf.cell(0, 5, "DISCLAIMER", ln=True)
    pdf.set_font("Helvetica", "I", 7.5)
    pdf.set_text_color(153, 27, 27)
    pdf.multi_cell(170, 4.5, "This document contains predictions from satellite-derived machine learning models. Accuracy depends on cloud cover and sensor quality. Use alongside ground truth for critical decisions.")

    return pdf.output()


@router.get("/download-pdf")
async def download_pdf_report(date: str, district: str, season: str):
    """Endpoint to trigger PDF generation and download."""
    try:
        client = _s3()
        if not _check_s3_date_exists(client, date):
            raise HTTPException(status_code=404, detail="No data for this date.")

        df_yield = _get_csv_from_s3(client, f"SupabasePredictions/{date}/yieldPredictions.csv")
        if df_yield is None:
             raise HTTPException(status_code=404, detail="Prediction files missing.")

        def norm(name): return str(name).strip().lower().replace("th", "t")
        target = norm(district)
        y_match = df_yield[
            (df_yield["districtname"].apply(norm) == target) &
            (df_yield["season"].str.lower() == season.lower())
        ]
        if y_match.empty:
            raise HTTPException(status_code=404, detail="Match not found.")

        data_row = y_match.iloc[0].to_dict()
        ai_summary = generate_ai_report(data_row)
        pdf_bytes = generate_pdf_report_file(data_row, ai_summary)
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=RiceVision_Official_Report_{district}_{date}.pdf"}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))