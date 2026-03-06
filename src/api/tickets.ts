export const API_BASE = 'http://localhost:8085/tickets';

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

// Get all employee tickets (admin view)
export const getEmployeeTickets = async () => {
  try {
    const url = `${API_BASE}/admin/employee-tickets`;
    console.log('Fetching employee tickets from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    });
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    console.error('getEmployeeTickets failed:', err);
    throw err;
  }
};

// Update ticket status
export const updateTicketStatus = async (ticketId: string, status: string) => {
  try {
    const url = `${API_BASE}/update/status/${ticketId}?status=${encodeURIComponent(status)}`;
    console.log('Updating ticket status at:', url, 'to:', status);
    const resp = await fetch(url, {
      method: 'PUT',
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    });
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    console.error('updateTicketStatus failed:', err);
    throw err;
  }
};
