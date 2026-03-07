export const API_BASE = 'http://localhost:8085/api/notifications';

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

// GET all notifications
export const getNotifications = async () => {
  try {
    const url = `${API_BASE}/getAll`;
    console.log('Fetching notifications from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    await throwIfError(resp);
    return await handleResp(resp);
  } catch (err: any) {
    console.error('getNotifications failed:', err);
    throw err;
  }
};

// GET single notification by ID
export const getNotification = async (id: number) => {
  try {
    const url = `${API_BASE}/get/${id}`;
    console.log('Fetching notification from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    await throwIfError(resp);
    return await handleResp(resp);
  } catch (err: any) {
    console.error('getNotification failed:', err);
    throw err;
  }
};

// POST create notification
export const createNotification = async (payload: any) => {
  try {
    const url = `${API_BASE}/create`;
    console.log('Creating notification at:', url, 'payload:', payload);
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    console.log('createNotification response status:', resp.status, 'body:', text);
    await throwIfError(resp);
    // Return parsed JSON when possible, otherwise return text
    try { return JSON.parse(text); } catch { return text; }
  } catch (err: any) {
    console.error('createNotification failed:', err);
    throw err;
  }
};

// PUT update notification
export const updateNotification = async (id: number, payload: any) => {
  try {
    const url = `${API_BASE}/update/${id}`;
    console.log('Updating notification at:', url, 'payload:', payload);
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    console.log('updateNotification response status:', resp.status, 'body:', text);
    await throwIfError(resp);
    try { return JSON.parse(text); } catch { return text; }
  } catch (err: any) {
    console.error('updateNotification failed:', err);
    throw err;
  }
};

// DELETE notification
export const deleteNotification = async (id: number) => {
  try {
    const url = `${API_BASE}/delete/${id}`;
    console.log('Deleting notification at:', url);
    const resp = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    const text = await resp.text();
    console.log('deleteNotification response status:', resp.status, 'body:', text);
    await throwIfError(resp);
    try { return JSON.parse(text); } catch { return text; }
  } catch (err: any) {
    console.error('deleteNotification failed:', err);
    throw err;
  }
};

// GET per-user read status for a notification
export const getNotificationUsers = async (id: number) => {
  try {
    const url = `${API_BASE}/users/${id}`;
    console.log('Fetching notification users from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    await throwIfError(resp);
    return await handleResp(resp);
  } catch (err: any) {
    console.error('getNotificationUsers failed:', err);
    throw err;
  }
};

// GET notifications for currently authenticated user (if backend supports /my)
// GET notifications for currently authenticated user
export const getMyNotifications = async () => {
  try {
    const url = `${API_BASE}/getMyNotifications`;
    console.log('Fetching my notifications from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    await throwIfError(resp);
    return await handleResp(resp);
  } catch (err: any) {
    console.error('getMyNotifications failed:', err);
    throw err;
  }
};
