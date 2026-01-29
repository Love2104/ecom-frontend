import { useEffect } from 'react';
import { Check, X, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import useUsers from '@/hooks/useUsers';

const SupplierRequests = () => {
    const { users, loading, error, fetchSupplierRequests, updateSupplierStatus } = useUsers();

    useEffect(() => {
        fetchSupplierRequests();
    }, [fetchSupplierRequests]);

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) {
            await updateSupplierStatus(id, status);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Supplier Requests</h1>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                    {error}
                </div>
            )}

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted text-muted-foreground text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">User</th>
                                    <th className="px-6 py-3 text-left">Business Details</th>
                                    <th className="px-6 py-3 text-left">Requested At</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading.fetch ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                            Loading requests...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                            No pending supplier requests.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{u.name}</div>
                                                <div className="text-sm text-muted-foreground">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <Building2 size={16} className="text-muted-foreground" />
                                                    <span className="font-medium">{u.business_name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm mt-1">
                                                    <CreditCard size={16} className="text-muted-foreground" />
                                                    <span>GST: {u.gst_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {/* In a real app, you'd show updated_at or a specific request date */}
                                                Just now
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                        onClick={() => handleAction(u.id, 'APPROVED')}
                                                    >
                                                        <Check size={16} className="mr-1" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleAction(u.id, 'REJECTED')}
                                                    >
                                                        <X size={16} className="mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SupplierRequests;
