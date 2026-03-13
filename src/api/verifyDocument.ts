// API call to verify a document
export const verifyDocument = async (employeeId: string, documentId: number) => {
    const resp = await fetch(`http://localhost:8085/api/documents/verify/${employeeId}/${documentId}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
    });
    if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${txt}`);
    }
    return resp.text();
};