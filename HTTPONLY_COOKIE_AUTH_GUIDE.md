# HttpOnly Cookie Authentication Implementation

## Overview
The application now uses **HttpOnly cookies** for JWT authentication instead of storing tokens in localStorage. This provides enhanced security by preventing XSS attacks from stealing authentication tokens.

## Architecture

### How It Works
1. **Login** → User submits credentials
2. **Backend generates JWT** → Stored in an HttpOnly, Secure, SameSite cookie
3. **Frontend receives cookie** → Automatically included in all subsequent requests
4. **Protected requests** → Cookie sent automatically (credentials: 'include')
5. **Token expiration** → Server returns 401/403 → Redirects to login

## Security Benefits
- ✅ **HttpOnly flag** - Token cannot be accessed via JavaScript (prevents XSS attacks)
- ✅ **Secure flag** - Cookie only sent over HTTPS
- ✅ **SameSite attribute** - Prevents CSRF attacks
- ✅ **No localStorage exposure** - Token never stored in browser storage

## Implementation Details

### AuthContext (`src/context/AuthContext.tsx`)
The authentication context now:
- **Does NOT** store JWT tokens in localStorage
- **Does NOT** decode JWT tokens on the frontend
- **Only stores** user profile data in localStorage (name, email, role, avatar)
- Verifies session by calling `/api/users/me` endpoint
- 401/403 responses automatically redirect to login page

### API Client (`src/utils/apiClient.ts`)
New utility for making API requests with automatic:
- `credentials: 'include'` - Sends HttpOnly cookies
- 401/403 handling - Redirects to login on auth failure
- Error handling - Standard error messages

### Usage Example
```typescript
import { apiClient } from '@/utils/apiClient.ts';

// GET request
const userData = await apiClient.get('/api/users/me');

// POST request
const result = await apiClient.post('/api/tasks', { title: 'New Task' });

// PUT request
await apiClient.put('/api/users/profile', { name: 'John Doe' });

// DELETE request
await apiClient.delete('/api/tasks/123');
```

## Authentication Flow

### Login Flow
```
1. User enters credentials
2. POST /api/users/login
3. Backend validates & creates JWT
4. Backend sets HttpOnly cookie (Set-Cookie header)
5. Frontend calls verifySession()
6. Session endpoint validates cookie & returns user data
7. User redirected to dashboard
```

### Protected API Request Flow
```
1. Component calls apiClient.get('/api/resource')
2. Browser automatically includes HttpOnly cookie
3. Backend validates cookie
4. If valid: Process request, return data
5. If invalid (401/403): 
   - User data cleared from localStorage
   - Redirect to /login page
```

### Logout Flow
```
1. User clicks logout
2. POST /api/users/logout (with credentials: 'include')
3. Backend clears cookie
4. Frontend clears localStorage user data
5. Redirect to login page
```

## Backend Requirements

### Login Endpoint
Should return:
- ✅ User data (id, email, name, role, etc.)
- ✅ Set-Cookie header with HttpOnly JWT token
- ✅ No access token in response body

```json
// Response
{
  "id": "user123",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "admin",
  "avatar": "https://..."
}
```

### Cookie Setup
```
Set-Cookie: jwt=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
```

### Verify Session Endpoint (`/api/users/me`)
- Reads HttpOnly cookie automatically
- Returns user data if token valid (200)
- Returns 401 if token invalid/expired
- Returns 403 if token revoked

### Logout Endpoint (`/api/users/logout`)
- Receives request with HttpOnly cookie
- Invalidates the token
- Clears/expires the Set-Cookie header
- Returns success status

## Migration Notes

### From localStorage-based tokens to HttpOnly cookies:
1. ✅ Removed `authToken` and `refreshToken` from localStorage
2. ✅ Removed JWT decoding logic from frontend
3. ✅ Added `credentials: 'include'` to all fetch requests
4. ✅ Added global 401/403 handling
5. ✅ Keep only user profile data in localStorage

### Updating Existing API Calls
**Before (with token in header):**
```typescript
const response = await fetch('/api/resource', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});
```

**After (with HttpOnly cookie):**
```typescript
import { apiClient } from '@/utils/apiClient.ts';
const data = await apiClient.get('/api/resource');
```

## Testing Authentication

### Test Login with HttpOnly Cookie
```bash
# Login and receive HttpOnly cookie
curl -X POST http://localhost:8085/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies.txt

# Verify cookie is set
cat cookies.txt
```

### Test Protected Request
```bash
# Use the saved cookie
curl -X GET http://localhost:8085/api/users/me \
  -b cookies.txt
```

## Troubleshooting

### Issue: Cookies not being sent
**Solution:** Ensure `credentials: 'include'` is in fetch options (apiClient handles this)

### Issue: 401 errors on valid credentials
**Solution:** Check backend is setting HttpOnly cookie with correct domain/path

### Issue: Token not persisting between requests
**Solution:** Verify browser accepts cookies from API domain (CORS + credentials)

### Issue: Logout not clearing authentication
**Solution:** Ensure backend expires cookie with `Max-Age=0`

## Security Checklist

- [ ] Backend sets `HttpOnly` flag on cookie
- [ ] Backend sets `Secure` flag (HTTPS only)
- [ ] Backend sets `SameSite=Strict` or `SameSite=Lax`
- [ ] CORS credentials allowed: `Access-Control-Allow-Credentials: true`
- [ ] Token stored only in cookie, NOT in response body
- [ ] 401 responses clear frontend user data
- [ ] Logout clears cookie on server side
- [ ] HTTPS enforced in production
- [ ] No JWT decoding on frontend
- [ ] All API requests use apiClient utility
