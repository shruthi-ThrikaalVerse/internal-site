/**
 * RESIGNATION WORKFLOW APIs
 * 
 * Workflow:
 * 1. Employee submits resignation via POST /api/resignations/apply
 *    → Admin sees on GET /api/resignations/admin/pending
 * 2. Admin approves employee resignation via PUT /api/resignations/admin/{id}/approve
 *    → Moves to Super Admin's pending list
 * 3. When Admin submits their own resignation via POST /api/resignations/apply
 *    → Goes directly to Super Admin's pending list
 * 4. Super Admin sees admin resignations on GET /api/resignations/admin/pending
 *    → Approves/rejects via PUT /api/resignations/admin/{id}/approve or reject
 */

// Helper function to convert date from mm/dd/yyyy to yyyy-MM-dd format
function convertDateFormat(dateString: string): string {
    if (!dateString || !dateString.includes('/')) {
        return dateString;
    }
    const [month, day, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
}

// Helper function to parse response as JSON or text
async function parseResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    // Try to parse as JSON first, fallback to text
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { message: text || 'Success' };
    }
}

// Get pending resignations (role-based by backend)
// For ADMIN: Returns employee resignations pending admin approval
// For SUPER_ADMIN: Returns admin resignations pending super admin approval
export async function getPendingResignations() {
    const response = await fetch('http://localhost:8085/api/resignations/admin/pending', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch pending resignations');
    const data = await parseResponse(response);
    return Array.isArray(data) ? data : [];
}

// Submit a resignation (by employee or admin)
// Endpoint: POST /api/resignations/apply
export async function submitResignation(formData: FormData) {
    // Convert date formats from mm/dd/yyyy to yyyy-MM-dd
    const resignationDate = formData.get('resignationDate');
    const lastWorkingDate = formData.get('lastWorkingDate');

    if (resignationDate && typeof resignationDate === 'string') {
        formData.set('resignationDate', convertDateFormat(resignationDate));
    }
    if (lastWorkingDate && typeof lastWorkingDate === 'string') {
        formData.set('lastWorkingDate', convertDateFormat(lastWorkingDate));
    }

    // Rename fields to match backend DTO
    // Frontend: personalEmail → Backend: contactEmail
    const personalEmail = formData.get('personalEmail');
    if (personalEmail) {
        formData.delete('personalEmail');
        formData.set('contactEmail', personalEmail as string);
    }

    // Frontend: contactNumber → Backend: contactPhone
    const contactNumber = formData.get('contactNumber');
    if (contactNumber) {
        formData.delete('contactNumber');
        formData.set('contactPhone', contactNumber as string);
    }

    const response = await fetch('http://localhost:8085/api/resignations/apply', {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });
    if (!response.ok) throw new Error('Failed to submit resignation');
    return await parseResponse(response);
}

// Approve a resignation (used by both Admin and Super Admin)
// Admin: Approves employee resignations (moves to super admin queue)
// Super Admin: Approves admin resignations (final approval)
export async function approveResignation(id: number) {
    const response = await fetch(`http://localhost:8085/api/resignations/admin/${id}/approve`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to approve resignation');
    return await parseResponse(response);
}

// Reject a resignation (used by both Admin and Super Admin)
export async function rejectResignation(id: number) {
    const response = await fetch(`http://localhost:8085/api/resignations/admin/${id}/reject`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to reject resignation');
    return await parseResponse(response);
}

// Deprecated: Use getPendingResignations instead
export async function getPendingAdminResignations() {
    return getPendingResignations();
}

// Deprecated: Use getPendingResignations instead
export async function getPendingSuperAdminResignations() {
    return getPendingResignations();
}

// Deprecated: Use approveResignation instead
export async function approveAdminResignation(id: number) {
    return approveResignation(id);
}

// Deprecated: Use rejectResignation instead
export async function rejectAdminResignation(id: number) {
    return rejectResignation(id);
}

// Deprecated: Use approveResignation instead
export async function approveSuperAdminResignation(id: number) {
    return approveResignation(id);
}

// Deprecated: Use rejectResignation instead
export async function rejectSuperAdminResignation(id: number) {
    return rejectResignation(id);
}
