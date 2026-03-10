# Quick Start: Performance Review API Integration

## Current Status
✅ **API Client Ready** - All endpoint functions defined and tested  
✅ **Frontend Ready** - Components integrated with API structure  
⚠️ **Dummy Data Active** - System gracefully falls back to dummy data

## One-Liner: Enable API Integration

When your backend is ready, uncomment **one line** in `src/pages/employee/Performance.tsx` (line ~195):

```typescript
// Change from:
// const reviews = await getEmployeeReviews();

// To:
const reviews = await getEmployeeReviews();
setAllReviews(reviews);
```

That's it! The system will now fetch real reviews from your backend instead of using dummy data.

## What's Already Set Up

### API Client (`src/api/performance.ts`)
- ✅ `getEmployeeReviews()` - Fetch employee reviews
- ✅ `getEmployeeReviewsById()` - Fetch specific employee reviews (admin)
- ✅ `submitReview()` - Submit new review (admin)
- ✅ `updateReview()` - Update review
- ✅ `deleteReview()` - Delete review
- ✅ All with proper error handling and fallback

### Pages Integrated
- ✅ **Employee Performance** (`/employee/performance`) - Ready to load reviews
- ✅ **Admin Employee Details** (`/admin/employees/:id`) - Ready to submit reviews

### Authentication
- ✅ **HttpOnly Cookies** - Automatically included via `credentials: 'include'`
- ✅ **401/403 Handling** - Auto-redirects to login on auth failure

## Backend Requirements

Your backend should implement these endpoints:

### 1. GET `/api/performance/reviews`
**Purpose:** Get reviews for current employee

**Query Parameters:**
- `periodType` (optional): MONTHLY, QUARTERLY, YEARLY
- `period` (optional): Specific period string
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
{
  "reviews": [
    {
      "id": 1,
      "employeeId": "EMP001",
      "feedback": "Excellent work...",
      "strengths": "Good leader...",
      "areasOfImprovement": "Time management...",
      "periodType": "MONTHLY",
      "rating": "EXCELLENT",
      "period": "March 2026",
      "createdAt": "2026-03-09T10:00:00"
    }
  ],
  "total": 5
}
```

### 2. POST `/api/performance/reviews`
**Purpose:** Submit new performance review (admin only)

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "feedback": "Excellent work this month...",
  "strengths": "Strong technical skills...",
  "areasOfImprovement": "Time management...",
  "periodType": "MONTHLY",
  "rating": "EXCELLENT",
  "period": "March 2026"
}
```

**Response:** Same as review object above

### 3. Other Endpoints (Optional for Phase 2)
- `GET /api/performance/reviews/:reviewId` - Get single review
- `PUT /api/performance/reviews/:reviewId` - Update review
- `DELETE /api/performance/reviews/:reviewId` - Delete review

## Testing

### Step 1: Start Your Backend
```bash
# Your backend should be running on:
http://localhost:8085
```

### Step 2: Enable API in Frontend
Uncomment the API call in `src/pages/employee/Performance.tsx`

### Step 3: Test with Network Tab
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Navigate to `/employee/performance`
4. You should see requests to `/api/performance/reviews`
5. Check response contains your review data

### Step 4: Verify Review Submissions
1. Go to `/admin/employees/[id]` 
2. Go to Performance Metrics tab
3. Fill out and submit a review
4. Check browser console for success message
5. Check your database for new review entry

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Network error** | Ensure backend is running on `http://localhost:8085` |
| **CORS error** | Add CORS headers to backend responses |
| **401 error** | Check authentication token/cookie is valid |
| **Empty response** | Verify backend endpoint returns correct JSON format |
| **Still using dummy data** | Make sure you uncommented the API call |

## Fallback Behavior

The system is designed to work even if the backend is unavailable:
- Frontend automatically uses dummy data if API fails
- Users see the same UI experience
- Error messages are logged to console
- Perfect for development without a fully functional backend

## Next Steps

1. **Implement Backend Endpoints** - Create the `/api/performance/*` endpoints
2. **Test with Postman** - Verify your API responses match expected format
3. **Enable API Call** - Uncomment the one line in Performance.tsx
4. **Monitor Console** - Watch for any errors during API calls
5. **Test End-to-End** - Submit reviews and verify they appear in the dashboard

## Need More Details?

See `API_INTEGRATION_STATUS.md` for comprehensive documentation including:
- Complete data type definitions
- All available API functions
- Data format mappings
- Advanced configuration options
- Future enhancement plans

---

**Ready to go!** Your frontend is ready to connect to the backend whenever you're done with the API implementation. 🚀
