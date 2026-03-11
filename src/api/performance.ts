import { apiClient } from '../utils/apiClient.ts';
import {
  PerformanceAnalyticsResponse
} from '../types.ts';

interface GetPerformanceParams {
  employeeId: string;
  periodType: 'monthly' | 'quarterly' | 'yearly';
  year: number;
  month?: number;
  quarter?: number;
}

// Performance Review Types
export interface Review {
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

export interface PerformanceResponse {
  reviews: Review[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface PerformanceFilters {
  periodType?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  period?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Fetches performance percentage analytics for a given employee.
 * The backend expects query parameters as specified by the user in the
 * postman examples provided in the issue description.
 */
export const getPerformancePercentage = (
  params: GetPerformanceParams
): Promise<PerformanceAnalyticsResponse> => {
  const query = new URLSearchParams({
    employeeId: params.employeeId,
    periodType: params.periodType,
    year: params.year.toString()
  });
  if (params.periodType === 'monthly' && params.month != null) {
    query.append('month', params.month.toString());
  }
  if (params.periodType === 'quarterly' && params.quarter != null) {
    query.append('quarter', params.quarter.toString());
  }
  const url = `/api/performance/percentage?${query.toString()}`;
  return apiClient.get<PerformanceAnalyticsResponse>(url);
};

/**
 * Get all reviews for the current employee
 */
export const getEmployeeReviews = async (filters?: PerformanceFilters): Promise<Review[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.periodType) queryParams.append('periodType', filters.periodType);
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);

    const endpoint = `/api/performance/reviews${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiClient.request<PerformanceResponse>(endpoint);
    return response.reviews || [];
  } catch (error) {
    console.error('Error fetching employee reviews:', error);
    throw error;
  }
};

/**
 * Get reviews for a specific employee (admin only)
 */
export const getEmployeeReviewsById = async (employeeId: string, filters?: PerformanceFilters): Promise<Review[]> => {
  try {
    const queryParams = new URLSearchParams({ employeeId });
    if (filters?.periodType) queryParams.append('periodType', filters.periodType);
    if (filters?.period) queryParams.append('period', filters.period);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);

    const endpoint = `/api/performance/reviews?${queryParams}`;
    const response = await apiClient.request<PerformanceResponse>(endpoint);
    return response.reviews || [];
  } catch (error) {
    console.error(`Error fetching reviews for employee ${employeeId}:`, error);
    throw error;
  }
};

/**
 * Get a single review by ID
 */
export const getReviewById = async (reviewId: number): Promise<Review> => {
  try {
    const response = await apiClient.request<Review>(`/api/performance/reviews/${reviewId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching review ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Submit a new performance review (admin only)
 */
export const submitReview = async (reviewData: {
  employeeId: string;
  feedback: string;
  strengths: string;
  areasOfImprovement: string;
  periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'POOR';
  period: string;
}): Promise<Review> => {
  try {
    const response = await apiClient.request<Review>(
      `/api/performance/reviews`,
      {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }
    );
    return response;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

/**
 * Update an existing review (admin only)
 */
export const updateReview = async (reviewId: number, updates: Partial<Review>): Promise<Review> => {
  try {
    const response = await apiClient.request<Review>(
      `/api/performance/reviews/${reviewId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
    return response;
  } catch (error) {
    console.error(`Error updating review ${reviewId}:`, error);
    throw error;
  }
};

/**
 * Delete a review (admin only)
 */
export const deleteReview = async (reviewId: number): Promise<void> => {
  try {
    await apiClient.request<void>(
      `/api/performance/reviews/${reviewId}`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error(`Error deleting review ${reviewId}:`, error);
    throw error;
  }
};
