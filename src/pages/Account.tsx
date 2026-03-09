import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import useOrders from '@/hooks/useOrders';
import { formatDate, formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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

  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/account' } });
    } else if (!profileLoaded) {
      getProfile().then(() => setProfileLoaded(true));
    }
  }, [isAuthenticated, navigate, getProfile, profileLoaded]);

  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      fetchOrders();
    }
  }, [activeTab, fetchOrders, isAuthenticated]);

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
    if (updateSuccess) setUpdateSuccess(false);
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

    const updateData: any = { name: formData.name, email: formData.email };
    if (formData.currentPassword && formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.password = formData.newPassword;
    }

    const result = await updateProfile(updateData);
    if (result.success) {
      setUpdateSuccess(true);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } else if (result.error) {
      setFormErrors(prev => ({ ...prev, form: result.error }));
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

    if (result.success) setUpdateSuccess(true);
    else alert(result.error);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (profileLoading || !profileLoaded) {
    return (
      <div className="bg-background-light font-display min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary/30" />
      </div>
    );
  }

  if (!user && isAuthenticated) {
    return (
      <div className="bg-background-light font-display min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-accent-red/10 text-accent-red p-4 rounded-xl font-bold">
          Failed to load user profile. Please try refreshing the page.
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background-light text-primary font-display min-h-screen">
      <div className="flex min-h-[calc(100vh-64px)] lg:flex-row flex-col">

        {/* Sidebar Navigation */}
        <aside className="lg:w-72 border-r border-primary/10 lg:flex lg:flex-col lg:sticky lg:top-16 bg-background-light z-10 shrink-0">
          <div className="p-6 lg:p-8 flex flex-col h-full">

            {/* User Profile with Avatar */}
            <div className="flex items-center gap-4 mb-8 lg:mb-10 p-3 rounded-xl bg-white border border-primary/5 shadow-sm">
              <div className="relative w-12 h-12 rounded-full shrink-0 group">
                <div className="w-12 h-12 rounded-full bg-accent-gold flex items-center justify-center text-white overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : user.name ? (
                    <span className="text-lg font-bold uppercase">{user.name.charAt(0)}</span>
                  ) : (
                    <span className="material-symbols-outlined">person</span>
                  )}
                </div>
                {/* Upload overlay */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 rounded-full bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Change profile picture"
                >
                  <span className="material-symbols-outlined text-white text-base">photo_camera</span>
                </label>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-primary text-sm font-bold truncate">{user.name}</h1>
                <p className="text-accent-gold text-xs font-bold uppercase tracking-widest mt-0.5">{user.role}</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-4 lg:pb-0 grow">
              <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-xl shrink-0 transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-primary/60 hover:bg-primary/5'}`}>
                <span className="material-symbols-outlined text-[20px]">person</span>
                <span className="text-sm font-bold">Profile</span>
              </button>
              <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-4 py-3 rounded-xl shrink-0 transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-primary/60 hover:bg-primary/5'}`}>
                <span className="material-symbols-outlined text-[20px]">package_2</span>
                <span className="text-sm font-bold">Orders</span>
              </button>
              <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl shrink-0 transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-primary/60 hover:bg-primary/5'}`}>
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span className="text-sm font-bold">Settings</span>
              </button>
              {user.role === 'BUYER' && (
                <button onClick={() => setActiveTab('supplier')} className={`flex items-center gap-3 px-4 py-3 rounded-xl shrink-0 transition-all ${activeTab === 'supplier' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-primary/60 hover:bg-primary/5'}`}>
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                  <span className="text-sm font-bold">Become Supplier</span>
                </button>
              )}
              {(user.role === 'SUPERADMIN' || user.role === 'MANAGER') && (
                <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl shrink-0 text-primary/60 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                  <span className="text-sm font-bold">Admin Dashboard</span>
                </Link>
              )}
              {user.role === 'SUPPLIER' && (
                <Link to="/supplier" className="flex items-center gap-3 px-4 py-3 rounded-xl shrink-0 text-primary/60 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                  <span className="text-sm font-bold">Supplier Dashboard</span>
                </Link>
              )}
            </nav>

            {/* Logout */}
            <div className="pt-6 border-t border-primary/10 hidden lg:block mt-auto">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent-red hover:bg-accent-red/5 transition-colors font-bold text-sm">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">

          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-primary mb-2 tracking-tight">Profile Settings</h1>
                <p className="text-primary/60 font-medium font-body">Manage your personal information and password.</p>
              </div>

              <div className="bg-white border border-primary/5 rounded-2xl p-8 shadow-sm">
                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 mb-8 border-b border-primary/10">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full bg-accent-gold flex items-center justify-center text-white overflow-hidden shadow-lg">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : user?.name ? (
                        <span className="text-4xl font-bold uppercase">{user.name.charAt(0)}</span>
                      ) : (
                        <span className="material-symbols-outlined text-4xl">person</span>
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload-main"
                      className="absolute inset-0 rounded-full bg-primary/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                    </label>
                    <input id="avatar-upload-main" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">{user?.name}</h3>
                    <p className="text-primary/50 text-sm mb-3">{user?.email}</p>
                    <label
                      htmlFor="avatar-upload-main"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-primary/5 hover:bg-primary/10 rounded-full font-bold text-sm text-primary cursor-pointer transition-colors border border-primary/10"
                    >
                      <span className="material-symbols-outlined text-base">upload</span>
                      Change Photo
                    </label>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group col-span-2 md:col-span-1">
                      <input
                        id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder=" "
                        className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-gold focus:ring-0 transition-colors"
                      />
                      <label htmlFor="name" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">Full Name</label>
                      {formErrors.name && <p className="text-xs text-accent-red font-bold px-2 mt-1">{formErrors.name}</p>}
                    </div>

                    <div className="relative group col-span-2 md:col-span-1">
                      <input
                        id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder=" "
                        className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-gold focus:ring-0 transition-colors"
                      />
                      <label htmlFor="email" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">Email Address</label>
                      {formErrors.email && <p className="text-xs text-accent-red font-bold px-2 mt-1">{formErrors.email}</p>}
                    </div>
                  </div>

                  <hr className="border-primary/10 my-8" />
                  <h3 className="text-xl font-bold mb-6">Change Password</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group col-span-2 md:col-span-1">
                      <input
                        id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} placeholder=" "
                        className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-gold focus:ring-0 transition-colors"
                      />
                      <label htmlFor="currentPassword" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">Current Password</label>
                      {formErrors.currentPassword && <p className="text-xs text-accent-red font-bold px-2 mt-1">{formErrors.currentPassword}</p>}
                    </div>

                    <div className="relative group col-span-2 md:col-span-1">
                      <input
                        id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder=" "
                        className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-gold focus:ring-0 transition-colors"
                      />
                      <label htmlFor="newPassword" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">New Password</label>
                      {formErrors.newPassword && <p className="text-xs text-accent-red font-bold px-2 mt-1">{formErrors.newPassword}</p>}
                    </div>

                    <div className="relative group col-span-2 md:col-span-1">
                      <input
                        id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder=" "
                        className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-gold focus:ring-0 transition-colors"
                      />
                      <label htmlFor="confirmPassword" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">Confirm Password</label>
                      {formErrors.confirmPassword && <p className="text-xs text-accent-red font-bold px-2 mt-1">{formErrors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row items-center gap-6">
                    <button
                      type="submit"
                      disabled={updateProfileLoading}
                      className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-bold tracking-widest uppercase rounded-xl hover:bg-primary/90 transition-all shadow-lg text-xs disabled:opacity-50"
                    >
                      {updateProfileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    {updateSuccess && (
                      <span className="text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-lg">Profile updated successfully.</span>
                    )}
                    {updateProfileError && (
                      <span className="text-accent-red font-bold text-sm bg-accent-red/10 px-4 py-2 rounded-lg">{updateProfileError}</span>
                    )}
                    {formErrors.form && (
                      <span className="text-accent-red font-bold text-sm bg-accent-red/10 px-4 py-2 rounded-lg">{formErrors.form}</span>
                    )}
                  </div>

                </form>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-primary mb-2 tracking-tight">Order History</h1>
                <p className="text-primary/60 font-medium font-body">Review and manage your curated purchases.</p>
              </div>

              {ordersError && (
                <div className="bg-accent-red/10 text-accent-red p-4 rounded-xl mb-8 font-bold text-sm">
                  {ordersError}
                </div>
              )}

              {ordersLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 size={48} className="animate-spin text-primary/30" />
                </div>
              ) : orders.length === 0 ? (
                <div className="mt-12 text-center p-12 border-2 border-dashed border-primary/10 rounded-2xl">
                  <span className="material-symbols-outlined text-4xl text-primary/20 mb-4">shopping_bag</span>
                  <p className="text-primary/50 font-medium font-body text-lg mb-6">You haven't placed any orders yet.</p>
                  <Link to="/products" className="inline-flex py-3 px-8 bg-primary text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors">Start Shopping</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-primary/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 rounded-xl bg-background-light flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl text-primary/30">inventory_2</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-primary">
                              {order.items && order.items.length > 0 ? `${order.items[0].product_name} ${order.items.length > 1 ? `+ ${order.items.length - 1} more` : ''}` : 'Order'}
                            </h3>
                            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mt-1">Order #{order.id.substring(0, 8)} • {formatPrice(order.total)}</p>
                          </div>
                        </div>
                        <div className={`
                          self-start px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                          ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                            order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              order.status === 'PROCESSING' ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' :
                                'bg-primary/10 text-primary border-primary/20'}
                        `}>
                          {order.status}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-primary/5 gap-4">
                        <p className="text-sm font-medium text-primary/60 font-body">
                          {order.status === 'DELIVERED' ? 'Delivered on' : 'Ordered on'} {formatDate(order.created_at)}
                        </p>
                        <div className="flex gap-3">
                          <Link to={`/order-confirmation/${order.id}`} className="flex-1 sm:flex-none px-5 py-2.5 text-center rounded-lg text-sm font-bold border border-primary/10 hover:bg-primary/5 transition-colors">
                            Invoice
                          </Link>
                          <Link to={`/orders/${order.id}`} className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            Details
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-primary mb-2 tracking-tight">Settings</h1>
                <p className="text-primary/60 font-medium font-body">Manage your account preferences.</p>
              </div>

              <div className="bg-white border border-primary/5 rounded-2xl p-8 shadow-sm space-y-8 font-body">
                <div>
                  <h3 className="text-lg font-bold text-primary mb-4 font-display">Notification Preferences</h3>
                  <div className="flex items-center justify-between py-4 border-b border-primary/5">
                    <div>
                      <p className="font-bold text-primary">Order updates</p>
                      <p className="text-sm text-primary/60 mt-1">Receive updates about your orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-primary/5">
                    <div>
                      <p className="font-bold text-primary">Promotions and deals</p>
                      <p className="text-sm text-primary/60 mt-1">Receive emails about new promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-primary mb-4 font-display">Privacy Settings</h3>
                  <div className="flex items-center justify-between py-4 border-b border-primary/5">
                    <div>
                      <p className="font-bold text-primary">Data sharing</p>
                      <p className="text-sm text-primary/60 mt-1">Allow sharing your shopping preferences</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-bold text-primary mb-4 font-display">Account Actions</h3>
                  <button className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'supplier' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-primary mb-2 tracking-tight">Become a Supplier</h1>
                <p className="text-primary/60 font-medium font-body">Partner with us to sell your luxury items.</p>
              </div>

              <div className="bg-white border border-primary/5 rounded-2xl p-8 shadow-sm">
                {user.supplier_status === 'APPROVED' ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-green-500 mb-4">verified</span>
                    <h3 className="text-2xl font-black mb-2 font-display">You are a Supplier!</h3>
                    <p className="text-primary/60 mb-8 font-body">You can now start adding and managing products.</p>
                    <Link to="/supplier/dashboard" className="inline-flex py-4 px-10 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors">
                      Go to Supplier Dashboard
                    </Link>
                  </div>
                ) : user.supplier_status === 'PENDING' ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-accent-gold mb-4">hourglass_top</span>
                    <h3 className="text-2xl font-black mb-2 font-display">Request Submitted</h3>
                    <p className="text-primary/60 font-body max-w-md mx-auto">Your request to become a supplier is being reviewed by our managers. We will notify you once it is approved.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSupplierRequest} className="space-y-6">
                    <p className="text-primary/70 mb-8 font-body">
                      Register your business to start selling on ShopEase. Once approved, you can list products and manage orders.
                    </p>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="relative group">
                        <input
                          id="business_name" name="business_name" type="text" value={formData.business_name} onChange={handleChange} placeholder=" "
                          className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-gold focus:ring-0 transition-colors"
                        />
                        <label htmlFor="business_name" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">Business Name</label>
                        {formErrors.business_name && <p className="text-xs text-accent-red font-bold px-2 mt-1">{formErrors.business_name}</p>}
                      </div>

                      <div className="relative group">
                        <input
                          id="gst_number" name="gst_number" type="text" value={formData.gst_number} onChange={handleChange} placeholder=" "
                          className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-gold focus:ring-0 transition-colors"
                        />
                        <label htmlFor="gst_number" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-gold pointer-events-none">GST/TAX Number</label>
                        {formErrors.gst_number && <p className="text-xs text-accent-red font-bold px-2 mt-1">{formErrors.gst_number}</p>}
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={supplierRequestLoading}
                        className="px-10 py-4 bg-primary text-white font-bold tracking-widest uppercase rounded-xl hover:bg-primary/90 transition-all shadow-lg text-xs disabled:opacity-50"
                      >
                        {supplierRequestLoading ? 'Submitting...' : 'Submit Request'}
                      </button>
                      {updateSuccess && (
                        <div className="mt-4 bg-green-50 text-green-700 p-4 rounded-xl font-bold text-sm">
                          Request submitted successfully!
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Mobile Logout Button (Visible only on small screens) */}
          <div className="lg:hidden mt-12 mb-6 text-center">
            <button onClick={handleLogout} className="inline-flex items-center gap-2 text-accent-red hover:text-red-700 font-bold transition-colors border border-accent-red/20 px-6 py-3 rounded-xl bg-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Account;