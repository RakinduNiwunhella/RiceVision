import os
from typing import List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

from ..db import supabase

router = APIRouter()

# ─── TOOLS ────────────────────────────────────────────────────────────────────

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
async def get_prediction_report(date: str, district: str, season: str):
    """
    Generates and provides a download link for a detailed agricultural PDF report.
    Required: date (YYYY-MM-DD), district, and season (Maha/Yala).
    """
    try:
        # Determine base URL (default to Render, fallback to local if context suggests)
        # In a real app, this might come from a config or env
        base_url = os.getenv("BACKEND_URL", "https://ricevision-cakt.onrender.com")
        
        download_url = f"{base_url}/api/download-pdf?date={date}&district={district}&season={season}"
        
        return (
            f"I have generated the detailed report for {district} ({season} season) based on data from {date}. "
            f"You can download it here: [Download PDF Report]({download_url})"
        )
    except Exception as e:
        return f"Error preparing report link: {str(e)}"


tools = [
    get_yield_summary,
    get_district_details,
    get_stress_analysis,
    get_prediction_report
]

# ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are an expert agricultural data analyst for a crop yield dashboard.

CRITICAL INSTRUCTIONS:
1. ALWAYS use tools to fetch data.
2. If a user mentions a year, pass it into tool calls.
3. PROACTIVELY offer the 'get_prediction_report' tool if the user asks for detailed analysis per district.
4. If a user asks for a "report" or "PDF" or "download", MUST use the get_prediction_report tool.
   Example: "Can I have a report for Ampara for Maha 2024-03-01?"
5. Format answers as professional reports.
6. If no data is found, say it clearly.
7. NEVER hallucinate values.
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
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0
        )

        # Agent
        agent = create_react_agent(
            llm,
            tools,
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

        # Extract intermediate steps (tool usage)
        intermediate_steps = []
        for msg in result["messages"]:
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    intermediate_steps.append({
                        "tool": tc["name"],
                        "input": tc["args"]
                    })

        # Final response
        final_message = result["messages"][-1]

        return {
            "reply": final_message.content,
            "intermediate_steps": intermediate_steps
        }

    except Exception as e:
        print(f"Agent Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")