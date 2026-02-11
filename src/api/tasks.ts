export const API_BASE = 'http://localhost:8085/api/tasks';

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

export const createTask = async (payload: any) => {
  const resp = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const getTasks = async () => {
  const resp = await fetch(API_BASE, {
    headers: { Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const getTask = async (taskId: string) => {
  const resp = await fetch(`${API_BASE}/${taskId}`, {
    headers: { Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const updateTask = async (taskId: string, payload: any) => {
  const resp = await fetch(`${API_BASE}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const deleteTask = async (taskId: string) => {
  const resp = await fetch(`${API_BASE}/${taskId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};
