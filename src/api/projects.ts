export const API_BASE = 'http://localhost:8085/api/projects';

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

export const getProjectManagers = async () => {
  const url = `${API_BASE}/project-managers`;
  console.log('Calling getProjectManagers:', url);
  const resp = await fetch(url, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  console.log('getProjectManagers response status:', resp.status);
  await throwIfError(resp);
  const result = await handleResp(resp);
  console.log('getProjectManagers result:', result);
  // Ensure result is always an array - wrap single object if needed
  const managers = Array.isArray(result) ? result : [result];
  return managers;
};

export const getAllProjects = async () => {
  const url = `${API_BASE}/getall-projects`;
  const resp = await fetch(url, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  await throwIfError(resp);
  return await handleResp(resp);
};

export const createProject = async (project: any, files?: File[]) => {
  const url = `${API_BASE}/create`;
  const form = new FormData();
  form.append('project', JSON.stringify(project));
  if (files && files.length) {
    files.forEach((f) => form.append('files', f));
  }
  const resp = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  await throwIfError(resp);
  return await handleResp(resp);
};

export const deleteProject = async (code: string) => {
  const url = `${API_BASE}/delete/${code}`;
  const resp = await fetch(url, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  await throwIfError(resp);
  return await handleResp(resp);
};

export const updateProject = async (code: string, project: any) => {
  const url = `${API_BASE}/update/${code}`;
  const resp = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(project),
  });
  await throwIfError(resp);
  return handleResp(resp);
};

export const patchProject = async (code: string, update: any) => {
  const doPatch = async (c: string) => {
    const url = `${API_BASE}/update/${c}`;
    const resp = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(update),
    });
    if (!resp.ok && resp.status === 404) {
      // attempt a few normalized variants before giving up
      const variants: string[] = [];
      // remove hyphens
      if (c.includes('-')) variants.push(c.replace(/-/g, ''));
      // PROJ -> PRJ
      if (c.startsWith('PROJ')) variants.push(c.replace(/^PROJ/, 'PRJ'));
      for (const alt of variants) {
        console.warn(`patch returned 404 for ${c}, retrying with ${alt}`);
        try {
          return await doPatch(alt);
        } catch (e) {
          // swallow and try next variant
        }
      }
    }
    await throwIfError(resp);
    return await handleResp(resp);
  };
  return doPatch(code);
};
