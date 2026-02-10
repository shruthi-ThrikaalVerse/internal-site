export const API_BASE = 'http://localhost:8085/api/events';

const getAuthHeader = () => {
  const token =
    localStorage.getItem('ACCESS_TOKEN') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    '';
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  const resp = await fetch(API_BASE, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });

  await throwIfError(resp);
  return readBody(resp);
};

export const getEvent = async (id: string | number) => {
  const resp = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });

  await throwIfError(resp);
  return readBody(resp);
};

export const createEvent = async (payload: any) => {
  try {
    console.log('Creating event, payload:', payload);

    const resp = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const body = await resp.text();
    console.log('Create event response status:', resp.status, 'body:', body);

    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${body}`);

    if (!body) return '';
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  } catch (err) {
    console.error('createEvent failed:', err);
    throw err;
  }
};

export const updateEvent = async (id: string | number, payload: any) => {
  const resp = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  await throwIfError(resp);
  return readBody(resp);
};

export const deleteEvent = async (id: string | number) => {
  const url = `${API_BASE}/${id}`;
  console.log('Deleting event from URL:', url);

  const resp = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
    },
    credentials: 'include',
  });

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
};
