// src/pages/Account.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Settings, Package, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import useAuth from '@/hooks/useAuth';
import useCart from '@/hooks/useCart';
import { formatDate, formatPrice } from '@/lib/utils';
import { Order } from '@/types';

const Account = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    updateProfile,
    logout,
    getProfile,
    updateProfileLoading,
    updateProfileError,
    profileLoading
  } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    setOrderError(null);

    try {
      const { getMyOrders } = useCart();
      const result = await getMyOrders();

      if (result.success && Array.isArray(result.orders)) {
        setOrders(result.orders);
      }  else if (result.success && result.orders) {
  setOrders(result.orders);
      } else {
        setOrderError(result.error || 'Failed to load orders');
      }
    } catch (err) {
      setOrderError('An error occurred while fetching orders');
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/account' } });
    } else {
      getProfile();
    }
  }, [isAuthenticated, navigate, getProfile]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (updateSuccess) {
      setUpdateSuccess(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';

    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) errors.currentPassword = 'Current password is required';
      if (formData.newPassword && formData.newPassword.length < 6)
        errors.newPassword = 'New password must be at least 6 characters';
      if (formData.newPassword !== formData.confirmPassword)
        errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const updateData: any = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.currentPassword && formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.password = formData.newPassword;
    }

    const result = await updateProfile(updateData);

    if (result.success) {
      setUpdateSuccess(true);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } else if (result.error) {
      setFormErrors(prev => ({
        ...prev,
        form: result.error
      }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (profileLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!user && isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Account</h1>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Failed to load user profile. Please try refreshing the page.
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-1 mb-6">
                <span className="text-lg font-medium">{user.name}</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              <nav className="space-y-2">
                <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-2 p-2 rounded-md text-left ${activeTab === 'profile' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}>
                  <User size={18} />
                  <span>Profile</span>
                </button>
                <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center space-x-2 p-2 rounded-md text-left ${activeTab === 'orders' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}>
                  <Package size={18} />
                  <span>Orders</span>
                </button>
                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-2 p-2 rounded-md text-left ${activeTab === 'settings' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}>
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                <Separator className="my-4" />
                <button onClick={handleLogout} className="w-full flex items-center space-x-2 p-2 rounded-md text-left text-destructive hover:bg-destructive/10">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <Input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
                  <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                  <Input name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} placeholder="Current Password" />
                  <Input name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder="New Password" />
                  <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" />
                  <Button type="submit" disabled={updateProfileLoading}>
                    {updateProfileLoading ? 'Updating...' : 'Update Profile'}
                  </Button>
                  {updateSuccess && <p className="text-green-600">Profile updated successfully.</p>}
                  {updateProfileError && <p className="text-red-600">{updateProfileError}</p>}
                  {formErrors.form && <p className="text-red-600">{formErrors.form}</p>}
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'orders' && (
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orderError && <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">{orderError}</div>}
                {loadingOrders ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-12 bg-muted rounded mb-2"></div>
                        <div className="h-24 bg-muted/50 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                    <Button asChild className="mt-4">
                      <Link to="/products">Start Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-muted p-4 flex justify-between items-center">
                          <div>
                            <div className="text-sm text-muted-foreground">Order #{order.id.substring(0, 8)}</div>
                            <div className="font-medium">{formatDate(order.created_at)}</div>
                          </div>
                          <div>
                            <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="mb-4">
                            <div className="text-sm text-muted-foreground mb-1">Items</div>
                           {order.items?.map((item) => (
                              <div key={item.id} className="flex justify-between py-1">
                                <div>{item.product_name} x {item.quantity}</div>
                                <div>{formatPrice(item.price * item.quantity)}</div>
                              </div>
                            ))}
                          </div>
                          <Separator className="my-4" />
                          <div className="flex justify-between font-medium">
                            <div>Total</div>
                            <div>{formatPrice(order.total)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
