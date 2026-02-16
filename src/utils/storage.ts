// src/utils/storage.ts

/**
 * Get user-specific key for localStorage
 * @param baseKey The base key name (e.g., 'attendance_records')
 * @param userId The user's ID. If not provided, falls back to current user in localStorage
 * @returns Scoped key in format: u_${userId}_${baseKey}
 */
export const getUserSpecificKey = (baseKey: string, userId?: string): string => {
    let id = userId;
    
    // Fallback: read from localStorage if userId not provided
    if (!id) {
        const userJson = localStorage.getItem('user');
        if (!userJson) return baseKey;
        try {
            const user = JSON.parse(userJson);
            id = user.id;
        } catch (e) {
            console.error('Failed to parse user data for key generation', e);
            return baseKey;
        }
    }
    
    return id ? `u_${id}_${baseKey}` : baseKey;
};

export const getUserData = () => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;

    try {
        return JSON.parse(userJson);
    } catch (e) {
        console.error('Failed to parse user data', e);
        return null;
    }
};

/**
 * Get item from user-specific storage
 */
export const getUserItem = <T>(key: string, defaultValue: T): T => {
    const userKey = getUserSpecificKey(key);
    try {
        const item = localStorage.getItem(userKey);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key}:`, error);
        return defaultValue;
    }
};

/**
 * Set item to user-specific storage
 */
export const setUserItem = <T>(key: string, value: T): void => {
    const userKey = getUserSpecificKey(key);
    try {
        localStorage.setItem(userKey, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
    }
};

/**
 * Remove user-specific item
 */
export const removeUserItem = (key: string): void => {
    const userKey = getUserSpecificKey(key);
    localStorage.removeItem(userKey);
};

/**
 * Clear all user-specific data
 */
export const clearUserData = (userId?: string): void => {
    // Use provided userId or try to get from localStorage
    let userIdToClear = userId;
    
    if (!userIdToClear) {
        const user = getUserData();
        userIdToClear = user?.id;
    }
    
    if (userIdToClear) {
        const prefix = `_${userIdToClear}`;
        // Get all keys before iteration to avoid issues during deletion
        const keysToClear = Object.keys(localStorage).filter(key => key.endsWith(prefix));
        keysToClear.forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

/**
 * Initialize user data on login
 */
export const initializeUserData = (userId: string): void => {
    // Initialize documents if not exists
    const docsKey = `user_documents_v6_${userId}`;
    if (!localStorage.getItem(docsKey)) {
        const defaultDocs = [
            { 
                id: 'doc-1', 
                name: 'Employee_Contract_2024.pdf', 
                category: 'Employment', 
                subCategory: 'Contracts', 
                type: 'PDF', 
                size: '2.4 MB', 
                uploaded: '2024-01-15', 
                status: 'Verified', 
                access: 'HR', 
                notes: 'Digitally signed with company seal. Valid until Dec 2025.', 
                color: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20' 
            },
        ];
        localStorage.setItem(docsKey, JSON.stringify(defaultDocs));
    }

    // Initialize attendance records if not exists
    const attendanceKey = `attendance_records_${userId}`;
    if (!localStorage.getItem(attendanceKey)) {
        localStorage.setItem(attendanceKey, JSON.stringify([]));
    }

    // Initialize leave requests if not exists
    const leaveKey = `leave_requests_${userId}`;
    if (!localStorage.getItem(leaveKey)) {
        localStorage.setItem(leaveKey, JSON.stringify([]));
    }

    // Initialize notifications if not exists
    const notifKey = `user_notifications_v1_${userId}`;
    if (!localStorage.getItem(notifKey)) {
        const defaultNotif = [
            { 
                id: 'n1', 
                title: 'System Handshake', 
                msg: 'Welcome to the Corporate HR Management Portal. Your account is fully synchronized.', 
                time: new Date().toISOString(), 
                icon: 'Shield', 
                color: 'text-blue-500 bg-blue-50', 
                read: false, 
                type: 'info' 
            },
        ];
        localStorage.setItem(notifKey, JSON.stringify(defaultNotif));
    }
};

/**
 * Migrate existing global data to user-specific
 */
export const migrateToUserStorage = (userId: string): void => {
    const keysToMigrate = [
        'user_documents_v6',
        'attendance_records',
        'leave_requests',
        'user_notifications_v1'
    ];

    keysToMigrate.forEach(key => {
        const globalData = localStorage.getItem(key);
        if (globalData) {
            // Copy to user-specific storage
            const userKey = `${key}_${userId}`;
            localStorage.setItem(userKey, globalData);
            // Keep global data for backward compatibility
        }
    });
};