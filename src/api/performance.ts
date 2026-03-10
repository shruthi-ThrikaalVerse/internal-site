import { apiClient } from '../utils/apiClient';
import {
  PerformanceAnalyticsResponse
} from '../types.tsx';

interface GetPerformanceParams {
  employeeId: string;
  periodType: 'monthly' | 'quarterly' | 'yearly';
  year: number;
  month?: number;
  quarter?: number;
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
