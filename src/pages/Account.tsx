import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Settings, Package, LogOut, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import useAuth from '@/hooks/useAuth';
import useOrders from '@/hooks/useOrders';
import { formatDate, formatPrice } from '@/lib/utils';

const Account = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    updateProfile,
    logout,
    getProfile,
    requestSupplierStatus,
    updateProfileLoading,
    updateProfileError,
    profileLoading
  } = useAuth();

  const { fetchOrders, orders, loading: ordersLoading, error: ordersError } = useOrders();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    business_name: '',
    gst_number: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [supplierRequestLoading, setSupplierRequestLoading] = useState(false);

  // Fetch profile data when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/account' } });
    } else if (!profileLoaded) {
      getProfile().then(() => setProfileLoaded(true));
    }
  }, [isAuthenticated, navigate, getProfile, profileLoaded]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      fetchOrders();
    }
  }, [activeTab, fetchOrders, isAuthenticated]);

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        business_name: user.business_name || '',
        gst_number: user.gst_number || '',
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

  const handleSupplierRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.business_name.trim()) errors.business_name = 'Business name is required';
    if (!formData.gst_number.trim()) errors.gst_number = 'GST number is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSupplierRequestLoading(true);
    const result = await requestSupplierStatus({
      business_name: formData.business_name,
      gst_number: formData.gst_number
    });
    setSupplierRequestLoading(false);

    if (result.success) {
      setUpdateSuccess(true);
    } else {
      alert(result.error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading state while fetching profile
  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Account</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 animate-pulse">
            <div className="bg-muted h-48 rounded-lg"></div>
          </div>
          <div className="md:col-span-3 animate-pulse">
            <div className="bg-muted h-96 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
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
                {user.role === 'SUPERADMIN' && (
                  <Badge className="mt-2 w-fit" variant="secondary">Admin</Badge>
                )}
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
                {user.role === 'BUYER' && (
                  <button onClick={() => setActiveTab('supplier')} className={`w-full flex items-center space-x-2 p-2 rounded-md text-left ${activeTab === 'supplier' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}>
                    <TrendingUp size={18} />
                    <span>Become Supplier</span>
                  </button>
                )}
                {(user.role === 'SUPERADMIN' || user.role === 'MANAGER') && (
                  <Link to="/admin/dashboard" className="w-full flex items-center space-x-2 p-2 rounded-md text-left hover:bg-muted">
                    <TrendingUp size={18} />
                    <span>Dashboard</span>
                  </Link>
                )}
                {user.role === 'SUPPLIER' && (
                  <Link to="/supplier/dashboard" className="w-full flex items-center space-x-2 p-2 rounded-md text-left hover:bg-muted">
                    <TrendingUp size={18} />
                    <span>Supplier Dashboard</span>
                  </Link>
                )}
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
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name"
                    />
                    {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                    {formErrors.email && <p className="text-xs text-destructive mt-1">{formErrors.email}</p>}
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>

                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">Current Password</label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Current Password"
                    />
                    {formErrors.currentPassword && <p className="text-xs text-destructive mt-1">{formErrors.currentPassword}</p>}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium mb-1">New Password</label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="New Password"
                    />
                    {formErrors.newPassword && <p className="text-xs text-destructive mt-1">{formErrors.newPassword}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                    />
                    {formErrors.confirmPassword && <p className="text-xs text-destructive mt-1">{formErrors.confirmPassword}</p>}
                  </div>

                  <Button type="submit" disabled={updateProfileLoading}>
                    {updateProfileLoading ? 'Updating...' : 'Update Profile'}
                  </Button>

                  {updateSuccess && (
                    <div className="bg-success/10 text-success p-3 rounded-md">
                      Profile updated successfully.
                    </div>
                  )}

                  {updateProfileError && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                      {updateProfileError}
                    </div>
                  )}

                  {formErrors.form && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                      {formErrors.form}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'supplier' && (
            <Card>
              <CardHeader>
                <CardTitle>Become a Supplier</CardTitle>
              </CardHeader>
              <CardContent>
                {user.supplier_status === 'APPROVED' ? (
                  <div className="text-center py-8">
                    <Badge variant="success" className="mb-4">Approved</Badge>
                    <h3 className="text-xl font-bold mb-2">You are a Supplier!</h3>
                    <p className="text-muted-foreground mb-6">You can now start adding and managing products.</p>
                    <Button asChild>
                      <Link to="/supplier/dashboard">Go to Supplier Dashboard</Link>
                    </Button>
                  </div>
                ) : user.supplier_status === 'PENDING' ? (
                  <div className="text-center py-8">
                    <Badge variant="secondary" className="mb-4">Under Review</Badge>
                    <h3 className="text-xl font-bold mb-2">Request Submitted</h3>
                    <p className="text-muted-foreground">Your request to become a supplier is being reviewed by our managers. We will notify you once it is approved.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSupplierRequest} className="space-y-4">
                    <p className="text-muted-foreground mb-6">
                      Register your business to start selling on ShopEase. Once approved, you can list products and manage orders.
                    </p>

                    <div>
                      <label htmlFor="business_name" className="block text-sm font-medium mb-1">Business Name</label>
                      <Input
                        id="business_name"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corporation"
                      />
                      {formErrors.business_name && <p className="text-xs text-destructive mt-1">{formErrors.business_name}</p>}
                    </div>

                    <div>
                      <label htmlFor="gst_number" className="block text-sm font-medium mb-1">GST/TAX Number</label>
                      <Input
                        id="gst_number"
                        name="gst_number"
                        value={formData.gst_number}
                        onChange={handleChange}
                        placeholder="Your GSTIN or Tax ID"
                      />
                      {formErrors.gst_number && <p className="text-xs text-destructive mt-1">{formErrors.gst_number}</p>}
                    </div>

                    <Button type="submit" disabled={supplierRequestLoading}>
                      {supplierRequestLoading ? 'Submitting...' : 'Submit Request'}
                    </Button>

                    {updateSuccess && (
                      <div className="bg-success/10 text-success p-3 rounded-md">
                        Request submitted successfully!
                      </div>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'orders' && (
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersError && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                    {ordersError}
                  </div>
                )}

                {ordersLoading ? (
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
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              order.status === 'DELIVERED' ? 'success' :
                                order.status === 'CANCELLED' ? 'destructive' : 'secondary'
                            }>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                            </Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/orders/${order.id}`}>View Details</Link>
                            </Button>
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

          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notification Preferences</h3>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Order updates</p>
                        <p className="text-sm text-muted-foreground">Receive updates about your orders</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Promotions and deals</p>
                        <p className="text-sm text-muted-foreground">Receive emails about new promotions</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Privacy Settings</h3>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Data sharing</p>
                        <p className="text-sm text-muted-foreground">Allow sharing your shopping preferences</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Account Actions</h3>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;