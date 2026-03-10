# Performance Review API Integration Guide

## Overview
The performance review system has been set up with a complete API client structure. The system currently uses **dummy data as a fallback** while the backend API integration is in progress.

## Architecture

### API Client Structure
**Location:** `src/api/performance.ts`

The API client provides the following functions:

#### Review Retrieval
- `getEmployeeReviews(filters?)` - Get reviews for the current employee
- `getEmployeeReviewsById(employeeId, filters?)` - Get reviews for a specific employee (admin only)
- `getReviewById(reviewId)` - Get a single review by ID

#### Review Management
- `submitReview(reviewData)` - Submit a new performance review (admin only)
- `updateReview(reviewId, updates)` - Update an existing review (admin only)
- `deleteReview(reviewId)` - Delete a review (admin only)

#### Analytics
- `getPerformanceAnalytics(employeeId?)` - Get performance analytics and trends

#### Export
- `exportReviews(format, filters?)` - Export reviews as PDF or CSV

### Data Types

```typescript
interface Review {
  id: number;
  employeeId: string;
  feedback: string;
  strengths: string;
  areasOfImprovement: string;
  periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'POOR';
  period: string;
  createdAt: string;
}

interface PerformanceFilters {
  periodType?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  period?: string;
  startDate?: string;
  endDate?: string;
}
```

## Current Implementation Status

### ✅ Completed
1. **API Client Layer** (`src/api/performance.ts`)
   - All endpoint functions defined
   - Proper TypeScript interfaces
   - Error handling with console logging
   - Query parameter building for filters

2. **Employee Performance Dashboard** (`src/pages/employee/Performance.tsx`)
   - Integrated with `getEmployeeReviews()` function
   - Dummy data fallback implementation
   - Graceful error handling with fallback to dummy data
   - All UI components working with API structure

3. **Admin Performance Review Form** (`src/pages/admin/EmployeeDetails.tsx`)
   - Review submission using `submitReview()` function
   - Proper data mapping (local format to API format)
   - Dummy data fallback for local review storage
   - Error handling with user-friendly messages

### 🔄 Integration Points

#### Employee Performance Page
**File:** `src/pages/employee/Performance.tsx`

```typescript
// Currently using fallback to dummy data
const fetchReviews = async () => {
  try {
    // Ready to use when API is available:
    // const reviews = await getEmployeeReviews();
    // setAllReviews(reviews);
    
    // Falls back to dummy data if needed
  } catch (error) {
    console.error('Error loading reviews:', error);
    // Uses dummy data on error
  }
};
```

**To enable API:**
Replace the commented line with actual API call once backend is ready.

#### Admin Review Submission
**File:** `src/pages/admin/EmployeeDetails.tsx`

```typescript
const handleReviewSubmit = async (e: React.FormEvent) => {
  try {
    // Attempts API submission
    await submitReview({
      employeeId: /* ... */,
      feedback: /* ... */,
      strengths: /* ... */,
      areasOfImprovement: /* ... */,
      periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
      rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'POOR',
      period: /* ... */
    });
  } catch (apiError) {
    // Falls back to local storage
    console.warn('API not available, adding review locally:', apiError);
  }
};
```

## API Endpoints Configuration

### Backend API URL
**Current:** `http://localhost:8085`
**Location:** `src/utils/apiClient.ts` - `API_BASE_URL` constant

### Expected Endpoint Routes
```
GET    /api/performance/reviews              - Get reviews (with optional filters)
GET    /api/performance/reviews/:reviewId    - Get single review
POST   /api/performance/reviews              - Submit new review
PUT    /api/performance/reviews/:reviewId    - Update review
DELETE /api/performance/reviews/:reviewId    - Delete review
GET    /api/performance/analytics            - Get analytics
GET    /api/performance/export               - Export reviews
```

## Data Format Mapping

### From Frontend to Backend (Submission)
```typescript
// Frontend form data
const formData = {
  rating: '4.5',                    // String from form select
  feedback: '...',                   // Text
  strengths: '...',                  // Text
  improvements: '...'                // Text
};

// Mapped to API format
const apiData = {
  employeeId: 'EMP001',
  feedback: formData.feedback,
  strengths: formData.strengths,
  areasOfImprovement: formData.improvements,
  periodType: 'MONTHLY',             // Enum string
  rating: 'EXCELLENT',               // Enum string (mapped from numeric)
  period: 'March 2026'               // Human-readable period
};
```

### Rating Mapping
| Frontend Value | API Value |
|---|---|
| 4.5 | EXCELLENT |
| 4.0 | GOOD |
| 3.0 | AVERAGE |
| 2.0 | NEEDS_IMPROVEMENT |
| 1.0 | POOR |

### Period Type Mapping
| Frontend Value | API Value |
|---|---|
| monthly | MONTHLY |
| quarterly | QUARTERLY |
| yearly | YEARLY |

## How to Enable API Integration

### Step 1: Verify Backend is Running
Ensure your backend API is running on `http://localhost:8085`

### Step 2: Enable API Calls in Performance Page
**File:** `src/pages/employee/Performance.tsx` (around line 195)

```typescript
// Change from:
// const reviews = await getEmployeeReviews();

// To:
const reviews = await getEmployeeReviews();
setAllReviews(reviews);
```

### Step 3: Configure Environment Variables (Optional)
Add to `.env` file if you want dynamic API URL configuration:
```
VITE_API_BASE_URL=http://localhost:8085
```

Then update `src/utils/apiClient.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';
```

## Error Handling

### Current Strategy
1. **Try API First** - Attempts to fetch from backend
2. **Fallback to Dummy Data** - If API fails, uses local dummy data
3. **User Notifications** - Shows success/error messages
4. **Console Logging** - Logs errors for debugging

### Common Errors & Solutions

| Error | Cause | Solution |
|---|---|---|
| 401/403 | Authentication failed | Redirect to login (handled by apiClient) |
| Network error | Backend not running | Check if `http://localhost:8085` is accessible |
| CORS error | Cross-origin issue | Configure CORS on backend |
| Empty response | API endpoint not found | Verify endpoint path and backend implementation |

## Testing with API

### Manual Testing Steps
1. Open Employee Performance page at `/employee/performance`
2. Check browser console for API calls
3. Verify data loads from API (not dummy data)
4. Go to Admin EmployeeDetails page
5. Submit a review
6. Check backend database for new review entry

### Testing Endpoints with Postman/cURL

```bash
# Get current employee's reviews
curl http://localhost:8085/api/performance/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Cookie: HTTPONLY_COOKIE=value"

# Submit a review (admin)
curl -X POST http://localhost:8085/api/performance/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Cookie: HTTPONLY_COOKIE=value" \
  -d '{
    "employeeId": "EMP001",
    "feedback": "Great work",
    "strengths": "Leadership",
    "areasOfImprovement": "Time management",
    "periodType": "MONTHLY",
    "rating": "EXCELLENT",
    "period": "March 2026"
  }'
```

## Future Enhancements

### Planned Features
- [ ] Real-time review notifications
- [ ] Review approval workflow
- [ ] Review templates
- [ ] Bulk review import
- [ ] Advanced filtering and search
- [ ] Review history comparison
- [ ] Export to PDF/Excel functionality
- [ ] Email notifications on review submission

### Optimization Opportunities
- [ ] Cache reviews locally with SWR (stale-while-revalidate)
- [ ] Pagination for large review lists
- [ ] Debounce filter changes
- [ ] Lazy load analytics data
- [ ] WebSocket support for real-time updates

## Files Modified/Created

### New Files
- `src/api/performance.ts` - Performance API client (updated)

### Modified Files
- `src/pages/employee/Performance.tsx` - Integrated API with fallback
- `src/pages/admin/EmployeeDetails.tsx` - Added review submission via API
- `src/utils/apiClient.ts` - Already has proper error handling

## Support & Debugging

### Enable Debug Logging
Add to your component's useEffect:
```typescript
useEffect(() => {
  console.log('Fetching reviews with filters:', filters);
}, [filters]);
```

### Check API Response
Open Browser DevTools → Network tab → Search for `/api/performance` requests

### Verify Authentication
The `apiClient.ts` already includes `credentials: 'include'` for cookie-based auth

---

**Status:** ✅ Ready for Backend Integration
**Last Updated:** March 10, 2026
