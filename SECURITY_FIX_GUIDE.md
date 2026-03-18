# Security Fix Guide - CORS & Authentication Issues

## Issues Fixed

### 1. **CORS Policy Error (Resolved)**
**Problem**: Frontend requests blocked with "No 'Access-Control-Allow-Origin' header"

**Root Cause**: 
- Fetch requests missing `credentials: 'include'` flag
- Backend CORS config requires credentials flag on client side

**Solution Applied**:
- ✅ Updated [src/api/apiFetch.js](src/api/apiFetch.js) to include `credentials: 'include'`
- ✅ This allows Authorization headers and cookies to be sent with cross-origin requests

### 2. **Missing JWT Validation (Resolved)**
**Problem**: Backend accepted any token without validation - security risk

**Root Cause**: 
- `auth.py` only checked if token exists, didn't validate it
- No JWT signature verification
- Invalid tokens could bypass authentication

**Solution Applied**:
- ✅ Updated [Back-End/SDGP/auth.py](../Back-End/SDGP/auth.py) with proper JWT validation
- ✅ Added token expiration checks
- ✅ Added proper error messages for different failure scenarios
- ✅ Extracts and returns user claims from token

### 3. **React Router v7 Warning (Resolved)**
**Problem**: "React Router will begin wrapping state updates in `React.startTransition`"

**Solution Applied**:
- ✅ Updated [src/router.jsx](src/router.jsx) with `v7_startTransition: true` future flag
- ✅ Prepares for React Router v7 compatibility

### 4. **CORS Configuration Improvements (Resolved)**
**Updates in Backend**:
- ✅ Added more specific HTTP methods list
- ✅ Added `expose_headers: ["*"]` for response header access
- ✅ Added `max_age: 600` for preflight caching
- ✅ Added localhost:3000 for testing flexibility
- ✅ Moved public routes BEFORE protected routes for clarity

## Setup Instructions

### Backend Setup

1. **Set Environment Variables** in `.env`:
```bash
# Supabase (get from your Supabase project)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anonymous-key

# JWT Secret (use Supabase JWT secret for validation)
JWT_SECRET=your-jwt-secret-from-supabase

# CORS Origins
CORS_ORIGINS=http://localhost:5173,https://app.ricevisionlanka.com
```

2. **Install Dependencies**:
```bash
cd Back-End
pip install -r requirements.txt  # Includes PyJWT already
```

3. **Run Backend**:
```bash
python -m uvicorn SDGP.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Verify Environment** `.env` includes:
```bash
VITE_API_BASE_URL=http://localhost:8000  # for dev
# OR
VITE_API_BASE_URL=https://ricevision-cakt.onrender.com  # for production
```

2. **No additional config needed** - `apiFetch.js` now handles credentials automatically

3. **Run Frontend**:
```bash
npm run dev
```

## Testing the Fix

### Test 1: Health Endpoint (Public - No Auth)
```bash
curl http://localhost:8000/health
# Expected response: {"status": "ok", "api": "RiceVision API"}
```

### Test 2: Protected Endpoint (Requires Auth)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/health-summary
# Should work with valid token
```

### Test 3: Browser Console
After logging in:
```javascript
// Should work now - no CORS errors
fetch('http://localhost:8000/health-summary', {
  credentials: 'include',
  headers: {'Authorization': 'Bearer ' + token}
}).then(r => r.json()).then(console.log)
```

## Security Checklist

- [x] CORS properly configured with specific origins
- [x] JWT tokens validated on every protected request
- [x] Token expiration checked
- [x] Bearer token required for protected endpoints
- [x] Public health endpoint for monitoring
- [x] Credentials included in CORS requests
- [x] Environment variables for secrets (not hardcoded)

## Future Improvements

1. **Add rate limiting** to prevent brute force attacks
2. **Implement refresh token rotation** for better security
3. **Add request logging** for audit trail
4. **Implement role-based access control (RBAC)**
5. **Add request signing** for sensitive operations
6. **Implement CSP headers** for frontend security
7. **Add API key authentication** for service-to-service calls

## Troubleshooting

### Still getting CORS errors?
1. Check browser console for exact error
2. Verify `credentials: 'include'` in fetch
3. Ensure backend CORS origins include your frontend URL
4. Check if backend is running on the correct port
5. Try with direct backend URL (not via proxy)

### Token validation errors?
1. Verify JWT_SECRET matches Supabase settings
2. Check token isn't expired in localStorage
3. Try logging in again to get fresh token
4. Check console logs for specific JWT error

### Protected endpoints returning 401?
1. Verify token is being sent in Authorization header
2. Check Authorization header format: `Bearer <token>`
3. Ensure token is still valid (not expired)
4. Clear localStorage and login again
