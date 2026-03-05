const API_BASE = 'http://localhost:8085/leave-requests';
const FETCH_TIMEOUT = 15000; // 15 seconds

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('ACCESS_TOKEN') || localStorage.getItem('token') || localStorage.getItem('authToken') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseText = async (resp: Response) => {
  const text = await resp.text();
  try { return JSON.parse(text); } catch { return text; }
};

const throwIfError = async (resp: Response) => {
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${body}`);
  }
};

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
};

// Get all PENDING leave requests
export const getPendingLeaveRequests = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/pending`, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The pending leave requests took too long. Please try again.');
    }
    throw err;
  }
};

// Get all NON-PENDING leave requests (approved/rejected/etc.)
export const getNonPendingLeaveRequests = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/non-pending`, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The non-pending leave requests took too long. Please try again.');
    }
    throw err;
  }
};

// Delete leave request by leaveId
export const deleteLeaveRequest = async (leaveId: number) => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/delete/${leaveId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The delete request took too long. Please try again.');
    }
    throw err;
  }
};

// Update leave request status (existing endpoint)
export const updateLeaveStatus = async (leaveId: string | number, status: 'approved' | 'rejected' | 'pending') => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/update-status/${encodeURIComponent(leaveId)}?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { Accept: 'application/json', ...getAuthHeader() },
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The status update took too long. Please try again.');
    }
    throw err;
  }
};

// Get leave balances
export const getLeaveBalances = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/leave-balance`, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The leave balance request took too long. Please try again.');
    }
    throw err;
  }
};
