import { useState, useCallback } from 'react';
import useApi from './useApi';
import { User, ApiResponse } from '@/types';

interface UseUsersReturn {
    users: User[];
    loading: {
        fetch: boolean;
        delete: boolean;
        createManager: boolean;
    };
    error: string | null;
    fetchUsers: (role?: string) => Promise<void>;
    fetchSupplierRequests: () => Promise<void>;
    updateSupplierStatus: (id: string, status: string) => Promise<{ success: boolean; error?: string }>;
    deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
    demoteSupplier: (id: string) => Promise<{ success: boolean; error?: string }>;
    createManager: (data: { email: string; password: string }) => Promise<{ success: boolean; key?: string; error?: string }>;
}

const useUsers = (): UseUsersReturn => {
    const { fetchData, loading: apiLoading, error: apiError } = useApi<ApiResponse<User[]>>();
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = useCallback(async (role?: string) => {
        let url = '/users';
        if (role) url += `?role=${role}`;

        const response = await fetchData({ url, requireAuth: true });

        if (response && response.success && response.users) {
            setUsers(response.users);
        }
    }, [fetchData]);

    const fetchSupplierRequests = useCallback(async () => {
        const response = await fetchData({ url: '/users/supplier-requests', requireAuth: true });
        if (response && response.success && response.users) {
            setUsers(response.users);
        }
    }, [fetchData]);

    const updateSupplierStatus = async (id: string, status: string) => {
        const response = await fetchData({
            url: `/users/supplier-requests/${id}/status`,
            method: 'PATCH',
            body: { status },
            requireAuth: true
        });

        if (response && response.success) {
            setUsers(users.filter(u => u.id !== id));
            return { success: true };
        }
        return { success: false, error: response?.message || 'Failed to update status' };
    };

    const deleteUser = async (id: string) => {
        const response = await fetchData({
            url: `/users/${id}`,
            method: 'DELETE',
            requireAuth: true
        });

        if (response && response.success) {
            setUsers(users.filter(u => u.id !== id));
            return { success: true };
        }
        return { success: false, error: response?.message || 'Failed to delete user' };
    };

    const demoteSupplier = async (id: string) => {
        const response = await fetchData({
            url: `/users/${id}/demote`,
            method: 'PATCH',
            requireAuth: true
        });

        if (response && response.success) {
            fetchUsers();
            return { success: true };
        }
        return { success: false, error: response?.message || 'Failed to demote supplier' };
    };

    const createManager = async (data: { email: string; password: string }) => {
        const response = await fetchData({
            url: '/auth/manager/create',
            method: 'POST',
            body: data,
            requireAuth: true
        });

        if (response && response.success) {
            fetchUsers();
            return { success: true, key: response.key };
        }
        return { success: false, error: response?.message || 'Failed to create manager' };
    };

    return {
        users,
        loading: {
            fetch: apiLoading,
            delete: apiLoading,
            createManager: apiLoading
        },
        error: apiError,
        fetchUsers,
        fetchSupplierRequests,
        updateSupplierStatus,
        deleteUser,
        demoteSupplier,
        createManager
    };
};

export default useUsers;
