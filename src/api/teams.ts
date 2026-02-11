export const API_BASE = 'http://localhost:8085/api/teams';

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

export const createTeam = async (payload: any) => {
  const resp = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const getTeams = async () => {
  const resp = await fetch(API_BASE, {
    headers: { Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const getTeam = async (teamId: string) => {
  const resp = await fetch(`${API_BASE}/${teamId}`, {
    headers: { Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const updateTeam = async (teamId: string, payload: any) => {
  const resp = await fetch(`${API_BASE}/${teamId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const deleteTeam = async (teamId: string) => {
  const resp = await fetch(`${API_BASE}/${teamId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};
