import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")

# For backend operations: use SERVICE_ROLE_KEY to bypass RLS
# For frontend: use ANON_KEY which respects RLS
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("VITE_SUPABASE_KEY")

if not url or not key:
    raise RuntimeError(
        "Missing Supabase environment variables. Required:\n"
        "  - SUPABASE_URL (or VITE_SUPABASE_URL)\n"
        "  - SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY, or VITE_SUPABASE_KEY)\n"
        "\n"
        "For backend to bypass RLS, use SUPABASE_SERVICE_ROLE_KEY from Settings > API > Service Role Secret"
    )

supabase = create_client(url, key)
