export interface AuditQuery {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

import { mockAuditLogs } from '../mockData.ts';

export const fetchAuditLogs = async (q: AuditQuery) => {
    const params = new URLSearchParams();
    // Backend expects page starting from 0 and 'size' instead of 'limit'
    if (q.page !== undefined) params.set('page', String(Math.max(0, (q.page - 1)))); // Convert 1-based to 0-based
    if (q.limit) params.set('size', String(q.limit)); // Backend uses 'size' not 'limit'
    if (q.search) params.set('search', q.search);
    if (q.level) params.set('level', q.level);
    if (q.startDate) params.set('startDate', q.startDate);
    if (q.endDate) params.set('endDate', q.endDate);

    try {
        const res = await fetch(`http://localhost:8085/api/audit-log/admin?${params.toString()}`, {
            method: 'GET',
            credentials: 'include'
        });
        // Parse commonly used response shapes so different backends work without breaking the UI
        const parsed = await res.json().catch(() => null);
        if (parsed) {
            if (Array.isArray(parsed)) return { logs: parsed, total: parsed.length };
            // Spring Data Page format: { content: [...], totalElements: N, ... }
            if (parsed.content && Array.isArray(parsed.content)) {
                return { 
                    logs: parsed.content || [], 
                    total: parsed.totalElements || 0
                };
            }
            if (parsed.logs && Array.isArray(parsed.logs)) return { logs: parsed.logs, total: parsed.total || parsed.logs.length || 0 };
            if (parsed.data && parsed.data.logs && Array.isArray(parsed.data.logs)) return { logs: parsed.data.logs, total: parsed.data.total || parsed.data.logs.length || 0 };
            if (parsed.items && Array.isArray(parsed.items)) return { logs: parsed.items, total: parsed.count || parsed.items.length || 0 };
            if (parsed.results && Array.isArray(parsed.results)) return { logs: parsed.results, total: parsed.total || parsed.results.length || 0 };
            // Unexpected shape
            console.warn('fetchAuditLogs: unexpected response shape', parsed);
            if (res.ok) return { logs: [], total: 0 };
        } else if (!res.ok) {
            console.warn('fetchAuditLogs: network response not ok, using local mock fallback. status=', res.status);
        }
    } catch (e) {
        console.warn('fetchAuditLogs: request failed, using mock fallback', e);
    }

    // Fallback: return sample mock data for local/dev when backend is not available or response was unexpected
    try {
        const total = mockAuditLogs.length;
        const pageNum = q.page || 1;
        const lim = q.limit || 50;
        const start = (pageNum - 1) * lim;
        const logs = mockAuditLogs.slice(start, start + lim);
        return { logs, total, fromMock: true };
    } catch {
        return { logs: [], total: 0, fromMock: true };
    }
};

export const exportAuditLogs = async (q: { startDate?: string; endDate?: string; level?: string; search?: string }, fmt: 'csv' | 'json') => {
    const params = new URLSearchParams();
    if (q.startDate) params.set('startDate', q.startDate);
    if (q.endDate) params.set('endDate', q.endDate);
    if (q.level) params.set('level', q.level);
    if (q.search) params.set('search', q.search || '');
    // Expect backend to return a blob for export
    try {
        // Note: Export endpoint may differ; adjust if needed based on your backend
        const res = await fetch(`http://localhost:8085/api/audit-log/admin/export?${params.toString()}&fmt=${fmt}`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        return blob;
    } catch (e) {
        console.warn('exportAuditLogs: export failed, creating local fallback blob', e);
        // In dev, create a small blob to allow download
        const content = JSON.stringify({ logs: [], note: 'No backend available' });
        return new Blob([content], { type: fmt === 'csv' ? 'text/csv' : 'application/json' });
    }
};
