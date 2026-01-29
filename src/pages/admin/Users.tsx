import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Plus, Trash, Check, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import useUsers from '@/hooks/useUsers';

const Users = () => {
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const { users, loading, error, fetchUsers, deleteUser, createManager, demoteSupplier } = useUsers();
    const [showCreateManager, setShowCreateManager] = useState(false);
    const [managerForm, setManagerForm] = useState({ email: '', password: '' });
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user permanently?')) {
            await deleteUser(id);
        }
    };

    const handleDemote = async (id: string) => {
        if (window.confirm('Are you sure you want to demote this supplier back to a normal buyer? They will lose access to the supplier center.')) {
            await demoteSupplier(id);
        }
    };

    const handleCreateManager = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createManager(managerForm);
        if (result.success && result.key) {
            setGeneratedKey(result.key);
            setManagerForm({ email: '', password: '' }); // Clear form
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
                <Button onClick={() => setShowCreateManager(!showCreateManager)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Manager
                </Button>
            </div>

            {showCreateManager && (
                <Card className="mb-8 border-primary/50">
                    <CardHeader>
                        <CardTitle>Create New Manager</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {generatedKey ? (
                            <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-lg text-center">
                                <Check className="mx-auto h-12 w-12 text-green-600 mb-2" />
                                <h3 className="text-xl font-bold mb-2">Manager Created Successfully!</h3>
                                <p className="mb-4">Please share this unique Login Key with the manager.</p>
                                <div className="bg-background border p-4 rounded-md font-mono text-xl tracking-wider select-all">
                                    {generatedKey}
                                </div>
                                <Button className="mt-4" variant="outline" onClick={() => { setGeneratedKey(null); setShowCreateManager(false); }}>
                                    Close and Refresh
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateManager} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input
                                        type="email"
                                        required
                                        value={managerForm.email}
                                        onChange={e => setManagerForm({ ...managerForm, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Temporary Password</label>
                                    <Input
                                        type="text"
                                        required
                                        value={managerForm.password}
                                        onChange={e => setManagerForm({ ...managerForm, password: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" disabled={loading.createManager}>
                                    Generate Key & Create
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            )}

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
                                    <th className="px-6 py-3 text-left">Name</th>
                                    <th className="px-6 py-3 text-left">Email</th>
                                    <th className="px-6 py-3 text-left">Role</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{user.name}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${user.role === 'SUPERADMIN' ? 'bg-primary/10 text-primary' :
                                                    user.role === 'MANAGER' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                        user.role === 'SUPPLIER' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                            'bg-secondary/10 text-secondary'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${user.supplier_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    user.supplier_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {user.supplier_status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {user.role !== 'SUPERADMIN' && (
                                                    <div className="flex justify-end space-x-2">
                                                        {/* Demote Button (For Suppliers) */}
                                                        {user.role === 'SUPPLIER' && (
                                                            (currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'MANAGER') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                    onClick={() => handleDemote(user.id)}
                                                                    title="Demote to Buyer"
                                                                >
                                                                    <UserMinus size={16} />
                                                                </Button>
                                                            )
                                                        )}

                                                        {/* Delete Button (Only for Buyers or if Superadmin) */}
                                                        {user.role === 'BUYER' && (
                                                            (currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'MANAGER') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    onClick={() => handleDelete(user.id)}
                                                                    title="Delete User"
                                                                >
                                                                    <Trash size={16} />
                                                                </Button>
                                                            )
                                                        )}
                                                    </div>
                                                )}
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

export default Users;
