import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_KEY") or os.getenv("VITE_SUPABASE_KEY")

if not url or not key:
    raise RuntimeError("Missing Supabase environment variables: SUPABASE_URL or SUPABASE_KEY")

supabase = create_client(url, key)