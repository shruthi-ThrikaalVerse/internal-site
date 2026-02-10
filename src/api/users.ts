export const API_BASE = 'http://localhost:8085/api/users';

const getAuthHeader = () => {
  const token = localStorage.getItem('ACCESS_TOKEN') || localStorage.getItem('token') || localStorage.getItem('authToken') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResp = async (resp: Response) => {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const throwIfError = async (resp: Response) => {
  if (!resp.ok) {
    const body = await resp.text();
    const err = new Error(`HTTP ${resp.status}: ${body}`);
    throw err;
  }
};

export const getAllEmployees = async () => {
  try {
    const url = `${API_BASE}/employees`;
    console.log('Fetching employees from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    });
    const text = await resp.text();
    console.log('getAllEmployees response status:', resp.status, 'body:', text);
    if (!resp.ok) {
      const err = new Error(`HTTP ${resp.status}: ${text}`);
      throw err;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error('getAllEmployees failed:', err);
    throw err;
  }
};

export const getDepartments = async () => {
  try {
    const url = `${API_BASE}/departments`;
    console.log('Fetching departments from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    });
    const text = await resp.text();
    console.log('getDepartments response status:', resp.status, 'body:', text);
    if (!resp.ok) {
      const err = new Error(`HTTP ${resp.status}: ${text}`);
      throw err;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error('getDepartments failed:', err);
    throw err;
  }
};
