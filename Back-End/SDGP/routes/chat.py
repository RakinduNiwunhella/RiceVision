import os
import base64
from datetime import date as _date
from typing import List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

from db import supabase
from routes.reportPage import generate_report_for_district

router = APIRouter()

# ─── TOOLS ────────────────────────────────────────────────────────────────────

@tool
def get_reports(crop: Optional[str] = None, ndvi_threshold: Optional[float] = None):
    query = supabase.table("reports").select("*")

    if crop:
        query = query.eq("crop", crop)

    if ndvi_threshold:
        query = query.lt("ndvi", ndvi_threshold)

    result = query.execute()
    return result.data


@tool
def get_yield_summary(year: Optional[int] = None):
    """
    Returns an overview of districts including their predicted yield, 
    risk scores, and climate stress levels.
    """
    try:
        query = supabase.table("Final_Dataset_Yield").select("*")
        if year:
            query = query.eq("year", year)
        response = query.execute()
        return response.data
    except Exception as e:
        return f"Error fetching summary: {str(e)}"


@tool
def get_district_details(district_name: str, year: Optional[int] = None):
    """
    Returns specific agricultural data for a single district.
    """
    try:
        query = (
            supabase.table("Final_Dataset_Yield")
            .select("*")
            .ilike("districtname", district_name.strip())
        )
        if year:
            query = query.eq("year", year)

        response = query.execute()

        return response.data if response.data else (
            f"No data found for {district_name}" +
            (f" in year {year}" if year else "")
        )

    except Exception as e:
        return f"Error fetching details: {str(e)}"


@tool
def get_stress_analysis(year: Optional[int] = None):
    """
    Returns districts under severe stress.
    """
    try:
        query = supabase.table("Final_Dataset_Yield").select("*")
        if year:
            query = query.eq("year", year)

        response = query.execute()
        data = response.data

        high_stress = [
            d for d in data
            if d.get("severe_stress_pct", 0) > 30
            or d.get("health_index_z", 0) < -1
        ]

        return high_stress

    except Exception as e:
        return f"Error analyzing stress: {str(e)}"


@tool
def generate_agricultural_report(district: str, season: str = "", date: str = ""):
    """
    Generates a PDF report for a given Sri Lankan paddy district by calling
    the reportPage download_pdf_report pipeline directly.

    Use this tool whenever the user:
    - Asks for a 'report', 'PDF', or 'summary' for any district
    - Says things like 'give me the Galle report' or 'Ampara 2026 PDF'

    Arguments:
    - district: The district name (e.g., Ampara, Galle, Kurunegala). REQUIRED.
    - season: 'Maha' or 'Yala'. Auto-derived from current month if not provided.
              Maha = October–March. Yala = April–September.
    - date: Data date in YYYY-MM-DD format. Defaults to today.
    """
    try:
        # Auto-derive season from current month if not specified
        if not season:
            month = _date.today().month
            season = "Maha" if month >= 10 or month <= 3 else "Yala"

        # Default date to today if not specified
        if not date:
            date = _date.today().isoformat()

        # Call reportPage.py logic directly — no HTTP round-trip
        pdf_bytes = generate_report_for_district(date=date, district=district, season=season)

        # Encode PDF as base64 and embed a detectable marker for the chat route
        b64 = base64.b64encode(pdf_bytes).decode("utf-8")
        filename = f"RiceVision_{district.title()}_{season}_{date}.pdf"

        return (
            f"PDF_PAYLOAD:{b64}:{filename}\n\n"
            f"Your RiceVision Agricultural Intelligence Report for **{district.title()}** "
            f"({season} season, data as of {date}) is ready. "
            f"The PDF has been attached below."
        )
    except ValueError as e:
        return f"Could not generate report: {str(e)}"
    except Exception as e:
        return f"Error generating report: {str(e)}"


@tool
def get_field_stats():
    """
    Returns national summary metrics for all fields, including total yield 
    and health percentages (Normal vs Stress).
    """
    try:
        summary = supabase.table("field_summary_view").select("*").single().execute().data
        health = supabase.table("sri_lanka_paddy_health_summary").select("*").single().execute().data
        return {"summary": summary, "health_distribution": health}
    except Exception as e:
        return f"Error fetching field stats: {str(e)}"

@tool
def get_alerts_and_risks():
    """
    Returns active alerts, pest risks per district, and disaster risk overviews.
    """
    try:
        alerts = supabase.table("alerts").select("*").order("date", desc=True).limit(10).execute().data
        pest = supabase.table("pest_risk_view").select("*").execute().data
        disasters = supabase.table("disaster_risk_view").select("*").limit(10).execute().data
        return {"active_alerts": alerts, "pest_risks": pest, "disaster_risks": disasters}
    except Exception as e:
        return f"Error fetching alerts: {str(e)}"

@tool
def get_growth_stages():
    """
    Returns the distribution of crop growth stages (Seedling, Tillering, Heading, etc.) 
    across all monitored areas.
    """
    try:
        data = supabase.table("stage_name_counts_view").select("*").execute().data
        return data
    except Exception as e:
        return f"Error fetching growth stages: {str(e)}"

@tool
def get_faq_answer(query: str):
    """
    Searches the FAQ/Help database for answers to user questions about the platform.
    """
    try:
        data = supabase.table("faq").select("question, answer").ilike("question", f"%{query}%").execute().data
        return data if data else "No matching FAQ found. Rephrase or ask for general help."
    except Exception as e:
        return f"Error searching FAQs: {str(e)}"

tools = [
    get_yield_summary,
    get_district_details,
    get_stress_analysis,
    generate_agricultural_report,
    get_field_stats,
    get_alerts_and_risks,
    get_growth_stages,
    get_faq_answer,
    get_reports
]

# ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are RiceVision's agricultural intelligence analyst for Sri Lanka. You have full access to the agricultural database and can generate downloadable PDF reports.

CRITICAL REPORT GENERATION RULES:
1. LOCATION EXTRACTION: Any time a user mentions a Sri Lankan district name (e.g., Ampara, Galle, Kurunegala, Anuradhapura, Colombo, Kandy, etc.), treat that as the 'district' for a report.
2. IMMEDIATE REPORT TRIGGER: If the user's query contains a district name AND asks for a report, PDF, summary, or analysis — call 'generate_agricultural_report' IMMEDIATELY with that district.
3. AUTO-SEASON: You do NOT need the user to specify the season. The tool will auto-derive it from today's date.
4. AUTO-DATE: You do NOT need the user to specify a date. The tool will default to today.
5. So for a query like "give me the Ampara report" — call generate_agricultural_report(district="Ampara") right away.

MISSING DISTRICT ONLY:
- If the user asks for a report but does NOT name a district, ask which district using [SUGGEST:] chips:
  Example: "Which district would you like a report for? [SUGGEST: Ampara] [SUGGEST: Colombo] [SUGGEST: Kandy] [SUGGEST: Galle] [SUGGEST: Kurunegala]"

INTERACTIVE CHIPS:
- Always append [SUGGEST: X] chips at the end of your message when prompting for a value.
- Season chips: [SUGGEST: Maha] [SUGGEST: Yala]
- District chips: [SUGGEST: Ampara] [SUGGEST: Anuradhapura] [SUGGEST: Colombo] [SUGGEST: Kandy] [SUGGEST: Galle]

QUERY HANDLING:
- For data-only queries (no report request), use the appropriate data tools.
- Always back data responses with real metrics from tools — no plain text summaries.
- After showing data, offer the report: "Want the full PDF report? [SUGGEST: Download PDF]"
"""

# ─── REQUEST MODELS ───────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    yieldData: Optional[List[Any]] = None
    chatHistory: List[ChatMessage]


# ─── ROUTE ────────────────────────────────────────────────────────────────────

@router.post("/chat")
async def chat(req: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    try:
        # LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=api_key,
            temperature=0
        )

        # Agent
        agent = create_react_agent(
            llm,
            tools=tools,
            state_modifier=SYSTEM_PROMPT
        )

        # Convert chat history
        history_msgs = []
        for m in req.chatHistory:
            if m.role == "user":
                history_msgs.append(HumanMessage(content=m.content))
            else:
                history_msgs.append(AIMessage(content=m.content))

        # Run agent
        result = agent.invoke({
            "messages": history_msgs + [HumanMessage(content=req.question)]
        })

        # Extract intermediate steps (tool usage) + detect PDF payload
        intermediate_steps = []
        pdf_base64 = None
        pdf_filename = None

        for msg in result["messages"]:
            # Capture tool_calls for display
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    intermediate_steps.append({
                        "tool": tc["name"],
                        "input": tc["args"]
                    })
            # Detect PDF payload embedded by the generate_agricultural_report tool
            if hasattr(msg, "content") and isinstance(msg.content, str):
                if msg.content.startswith("PDF_PAYLOAD:"):
                    parts = msg.content.split(":", 2)
                    if len(parts) >= 3:
                        pdf_base64 = parts[1]
                        pdf_filename = parts[2].split("\n")[0]

        # Final response
        final_message = result["messages"][-1]
        reply_text = final_message.content

        # Strip the PDF_PAYLOAD line from final reply if it leaked through
        if reply_text.startswith("PDF_PAYLOAD:"):
            reply_text = reply_text.split("\n", 2)[-1].strip()

        response = {
            "reply": reply_text,
            "intermediate_steps": intermediate_steps,
        }
        if pdf_base64:
            response["pdf_base64"] = pdf_base64
            response["pdf_filename"] = pdf_filename

        return response

    except Exception as e:
        print(f"Agent Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")