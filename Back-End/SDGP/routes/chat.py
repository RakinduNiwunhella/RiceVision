import os
import base64
from datetime import date as _date
from typing import List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import tool


from ..db import supabase

router = APIRouter()

# ─── TOOLS ────────────────────────────────────────────────────────────────────

@tool
def get_reports(crop: Optional[str] = None, ndvi_threshold: Optional[float] = None):
    """
    Fetches reports from the database, optionally filtered by crop or NDVI threshold.
    """
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
    get_field_stats,
    get_alerts_and_risks,
    get_growth_stages,
    get_faq_answer,
    get_reports
]

# ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are RiceVision's agricultural intelligence analyst for Sri Lanka. You have full access to the agricultural database.

CRITICAL RULES:
1. LOCATION EXTRACTION: Any time a user mentions a Sri Lankan district name (e.g., Ampara, Galle, Kurunegala, Anuradhapura, Colombo, Kandy, etc.), treat that as the 'district' and use the appropriate data tools to provide insights.
2. AUTO-SEASON: You do NOT need the user to specify the season. Use current date if not specified.
3. AUTO-DATE: You do NOT need the user to specify a date. Defaults to today.

INTERACTIVE CHIPS:
- Always append [SUGGEST: X] chips at the end of your message when prompting for a value.
- Season chips: [SUGGEST: Maha] [SUGGEST: Yala]
- District chips: [SUGGEST: Ampara] [SUGGEST: Anuradhapura] [SUGGEST: Colombo] [SUGGEST: Kandy] [SUGGEST: Galle]

QUERY HANDLING:
- For data-only queries, use the appropriate data tools.
- Always back data responses with real metrics from tools — no plain text summaries.
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
        from langgraph.prebuilt import create_react_agent
        
        # LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0
        )

        # Agent
        agent = create_react_agent(
            llm,
            tools=tools
        )

        # Convert chat history
        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
        
        history_msgs = [SystemMessage(content=SYSTEM_PROMPT)]
        for m in req.chatHistory:
            if m.role == "user":
                history_msgs.append(HumanMessage(content=m.content))
            else:
                history_msgs.append(AIMessage(content=m.content))

        # Run agent
        result = agent.invoke({
            "messages": history_msgs + [HumanMessage(content=req.question)]
        })

        # Extract intermediate steps (tool usage)
        intermediate_steps = []

        for msg in result["messages"]:
            # Capture tool_calls for display
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    intermediate_steps.append({
                        "tool": tc["name"],
                        "input": tc["args"]
                    })

        # Final response
        final_message = result["messages"][-1]
        reply_text = final_message.content

        response = {
            "reply": reply_text,
            "intermediate_steps": intermediate_steps,
        }

        return response

    except Exception as e:
        print(f"Agent Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")