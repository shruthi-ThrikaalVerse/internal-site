// Get pending admin resignations
export async function getPendingAdminResignations() {
    const response = await fetch('http://localhost:8085/api/resignations/admin/pending', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Send HttpOnly cookies
    });
    if (!response.ok) throw new Error('Failed to fetch pending resignations');
    return await response.json();
}

// Approve admin resignation by ID
export async function approveAdminResignation(id: number) {
    const response = await fetch(`http://localhost:8085/api/resignations/admin/${id}/approve`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Send HttpOnly cookies
    });
    if (!response.ok) throw new Error('Failed to approve resignation');
    return await response.json();
}

// Reject admin resignation by ID
export async function rejectAdminResignation(id: number) {
    const response = await fetch(`http://localhost:8085/api/resignations/admin/${id}/reject`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Send HttpOnly cookies
    });
    if (!response.ok) throw new Error('Failed to reject resignation');
    return await response.json();
}

// Fetch pending super admin resignations
export async function getPendingSuperAdminResignations() {
    const response = await fetch('http://localhost:8085/api/resignations/admin/pending', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Send HttpOnly cookies
    });
    if (!response.ok) throw new Error('Failed to fetch pending super admin resignations');
    return await response.json();
}

// Approve super admin resignation by ID
export async function approveSuperAdminResignation(id: number) {
    const response = await fetch(`http://localhost:8085/api/resignations/admin/${id}/approve`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Send HttpOnly cookies
    });
    if (!response.ok) throw new Error('Failed to approve super admin resignation');
    return await response.json();
}

// Reject super admin resignation by ID
export async function rejectSuperAdminResignation(id: number) {
    const response = await fetch(`http://localhost:8085/api/resignations/admin/${id}/reject`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Send HttpOnly cookies
    });
    if (!response.ok) throw new Error('Failed to reject super admin resignation');
    return await response.json();
}
