import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
import google.generativeai as genai

router = APIRouter()

SYSTEM_PROMPT = """
You are an expert agricultural data analyst assistant for a crop yield dashboard.
You have access to real data from the table "Final_Dataset_Yield".

COLUMNS:
- districtname         : Name of the district
- predictedyield_kg_ha : Predicted crop yield in kg per hectare
- historicalavg_kg_ha  : Historical average yield in kg per hectare
- totalyield_kg        : Total yield in kg for the district
- yieldgap_kg_ha       : Gap between historical average and predicted yield (kg/ha)
- percent_change       : % change compared to historical average
- health_index_z       : Crop health index (z-score; higher = healthier)
- climate_stress_index : Climate stress level (higher = more stress)
- total_pixels         : Number of satellite pixels analysed
- severe_stress_pct    : Percentage of area under severe stress
- pest_attack_count    : Number of recorded pest attack incidents
- most_common_stage    : Most common crop growth stage in the district
- risk_score           : Overall risk score for the district
- est_harvest_date     : Estimated harvest date
- season               : Crop season (e.g. Kharif, Rabi)

RULES:
- Only answer based on the data given. Never fabricate numbers.
- Be concise, specific, and conversational.
- When listing districts, rank them if it makes sense.
- Format numbers to 2 decimal places where appropriate.
- If the user asks something you can't derive from the data, say so honestly.
- You can draw comparisons, spot trends, highlight risks, and suggest insights.
"""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    yieldData: list[Any]
    chatHistory: list[ChatMessage]


@router.post("/api/chat")
def chat(req: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash-lite")

    history = "\n".join(
        f"{'User' if m.role == 'user' else 'Assistant'}: {m.content}"
        for m in req.chatHistory
    )

    import json
    prompt = f"""{SYSTEM_PROMPT}

--- LIVE DATA ({len(req.yieldData)} districts) ---
{json.dumps(req.yieldData, indent=2)}

--- CONVERSATION HISTORY ---
{history or "None yet."}

--- NEW QUESTION ---
User: {req.question}

Answer:"""

    response = model.generate_content(prompt)
    return {"reply": response.text}
