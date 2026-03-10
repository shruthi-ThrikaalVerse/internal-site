export const API_BASE = 'http://localhost:8085/api/tasks';
const FETCH_TIMEOUT = 15000; // 15 seconds

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
    const resp = (await fetchWithTimeout(`${API_BASE}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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

export const createSelfTask = async (payload: any) => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/self`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The self-task creation request took too long. Please try again.');
    }
    throw err;
  }
};

export const getTasks = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/getAll`, {
      headers: { Accept: 'application/json' },
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
    const resp = (await fetchWithTimeout(`${API_BASE}/get/${taskId}`, {
      headers: { Accept: 'application/json' },
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
    const resp = (await fetchWithTimeout(`${API_BASE}/update/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
    const resp = (await fetchWithTimeout(`${API_BASE}/delete/${taskId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
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

// Delete a self-assigned task
export const deleteSelfTask = async (taskId: string) => {
  try {
    // Try DELETE /self/{taskId} (alternative pattern if /self/delete/{taskId} fails on backend)
    const url = `${API_BASE}/self/delete/${taskId}`;
    console.log('Deleting self-task:', { taskId, url });
    const resp = (await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The self-task deletion request took too long. Please try again.');
    }
    throw err;
  }
};

// Get tasks by employee ID
export const getTasksByEmployeeId = async (employeeId: string) => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/task/${employeeId}`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The employee tasks request took too long. Please try again.');
    }
    throw err;
  }
};

// Get my tasks (logged-in user)
export const getMyTasks = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/mytasks`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The my-tasks request took too long. Please try again.');
    }
    throw err;
  }
};

// Get all self-assigned tasks
export const getSelfTasks = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/selftasks`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The self-tasks request took too long. Please try again.');
    }
    throw err;
  }
};

// Add / Update review for task
export const addTaskReview = async (taskId: string, payload: any) => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/review/${taskId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The task review request took too long. Please try again.');
    }
    throw err;
  }
};

// Get my reviews (logged-in user)
export const getMyReviews = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/reviews`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The my-reviews request took too long. Please try again.');
    }
    throw err;
  }
};

// Get all reviews (admin)
export const getAllReviews = async () => {
  try {
    const resp = (await fetchWithTimeout(`${API_BASE}/allReviews`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })) as Response;
    await throwIfError(resp);
    return parseText(resp);
  } catch (err: any) {
    if (err.message === 'Request timeout') {
      throw new Error('The all-reviews request took too long. Please try again.');
    }
    throw err;
  }
};
