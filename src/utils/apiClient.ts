/**
 * API Client utility that handles:
 * - Automatic inclusion of HttpOnly cookies via credentials: 'include'
 * - 401/403 response handling (redirects to login)
 * - Standard error handling
 */

const API_BASE_URL = 'http://localhost:8085';

interface FetchOptions extends RequestInit {
    skipErrorHandling?: boolean;
}

class ApiClient {
    async request<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const { skipErrorHandling = false, ...fetchOptions } = options;

        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

        const defaultOptions: RequestInit = {
            credentials: 'include', // Automatically send HttpOnly cookies
            headers: {
                'Content-Type': 'application/json',
                ...(fetchOptions.headers || {}),
            },
        };

        const response = await fetch(url, { ...defaultOptions, ...fetchOptions });

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
            console.warn('Authentication failed - redirecting to login');
            // Clear user data from localStorage
            try { localStorage.removeItem('user'); } catch { }
            // Redirect to login page
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok && !skipErrorHandling) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API error: ${response.statusText}`);
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return {} as T;
        }

        return response.json().catch(() => ({} as T));
    }

    get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    put<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    patch<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
