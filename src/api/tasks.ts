export const API_BASE = 'http://localhost:8085/api/tasks';
const FETCH_TIMEOUT = 15000; // 15 seconds

const getAuthHeader = () => {
  const token = localStorage.getItem('ACCESS_TOKEN') || localStorage.getItem('token') || localStorage.getItem('authToken') || '';
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

export const createTask = async (payload: any) => {
  try {
    const resp = (await fetchWithTimeout(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
      body: JSON.stringify(payload),
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The task creation request took too long. Please try again.');
    }
    throw err;
  }
};

export const getTasks = async () => {
  try {
    const resp = (await fetchWithTimeout(API_BASE, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The tasks request took too long. The server may be busy. Please try again later.');
    }
    throw err;
  }
};

export const getTask = async (taskId: string) => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/${taskId}`, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The task retrieval request took too long. Please try again.');
    }
    throw err;
  }
};

export const updateTask = async (taskId: string, payload: any) => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
      body: JSON.stringify(payload),
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The task update request took too long. Please try again.');
    }
    throw err;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/${taskId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The task deletion request took too long. Please try again.');
    }
    throw err;
  }
};
