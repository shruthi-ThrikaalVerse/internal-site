export const API_BASE = 'http://localhost:8085/api/events';
const FETCH_TIMEOUT = 15000; // 15 seconds timeout

const getAuthHeader = () => {
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('ACCESS_TOKEN') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper to add timeout to fetch requests
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
};

const readBody = async (resp: Response) => {
  // Some DELETE endpoints return empty body, so handle safely
  const text = await resp.text();
  if (!text) return '';
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const throwIfError = async (resp: Response) => {
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${body}`);
  }
};

export const getEvents = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/getAll`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    })) as Response;

    await throwIfError(resp);
    return readBody(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The events request took too long. The server may be busy. Please try again later.');
    }
    throw err;
  }
};

export const getEvent = async (id: string | number) => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/getEvent/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    })) as Response;

    await throwIfError(resp);
    return readBody(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The event request took too long. Please try again later.');
    }
    throw err;
  }
};

export const createEvent = async (payload: any) => {
  try {
    console.log('Creating event, payload:', payload);
    const resp = (await fetchWithTimeout(`${API_BASE}/create`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })) as Response;

    const body = await resp.text();
    console.log('Create event response status:', resp.status, 'body:', body);

    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${body}`);

    if (!body) return '';
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      console.error('createEvent timeout');
      throw new Error('The event creation request took too long. Please try again.');
    }
    console.error('createEvent failed:', err);
    throw err;
  }
};

export const updateEvent = async (id: string | number, payload: any) => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/update/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })) as Response;

    await throwIfError(resp);
    return readBody(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The event update request took too long. Please try again.');
    }
    throw err;
  }
};

export const deleteEvent = async (id: string | number) => {
  const url = `${API_BASE}/deleteEvent/${id}`;
  console.log('Deleting event from URL:', url);

  try {
    const resp = (await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
    })) as Response;

    const body = await resp.text();
    console.log('Delete response status:', resp.status, 'body:', body);

    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${body}`);

    // DELETE can return empty string
    if (!body) return '';
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The event deletion request took too long. Please try again.');
    }
    throw err;
  }
};

// GET all events created by admin
export const getAllEvents = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/getAllEvents`, {
      method: 'GET',
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    })) as Response;

    await throwIfError(resp);
    return readBody(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The all-events request took too long. Please try again later.');
    }
    throw err;
  }
};

// GET events created by currently authenticated user
export const getMyEvents = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/getAllEvents`, {
      method: 'GET',
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    })) as Response;

    await throwIfError(resp);
    return readBody(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The my-events request took too long. Please try again later.');
    }
    throw err;
  }
};
