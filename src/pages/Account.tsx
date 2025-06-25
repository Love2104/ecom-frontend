import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Package, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import useAuth from '@/hooks/useAuth';

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
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/account' } });
    } else {
      // Fetch the latest user profile
      getProfile();
    }
  }, [isAuthenticated, navigate, getProfile]);
  
  // Set initial form data from user
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
    
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear success message when making changes
    if (updateSuccess) {
      setUpdateSuccess(false);
    }
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Only validate password fields if any of them has a value
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Current password is required to change password';
      }
      
      if (formData.newPassword && formData.newPassword.length < 6) {
        errors.newPassword = 'New password must be at least 6 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare update data
    const updateData: any = {
      name: formData.name,
      email: formData.email,
    };
    
    // Only include password if changing it
    if (formData.currentPassword && formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.password = formData.newPassword;
    }
    
    const result = await updateProfile(updateData);
    
    if (result.success) {
      setUpdateSuccess(true);
      // Clear password fields
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
  
  const navigateToOrders = () => {
    navigate('/orders');
  };
  
  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Account</h1>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="md:col-span-3">
              <div className="h-96 bg-muted rounded"></div>
            </div>
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
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-1 mb-6">
                <span className="text-lg font-medium">{user.name}</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-2 p-2 rounded-md text-left ${
                    activeTab === 'profile' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <User size={18} />
                  <span>Profile</span>
                </button>
                
                <button
                  onClick={() => navigateToOrders()}
                  className={`w-full flex items-center space-x-2 p-2 rounded-md text-left hover:bg-muted`}
                >
                  <Package size={18} />
                  <span>Orders</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-2 p-2 rounded-md text-left ${
                    activeTab === 'settings' 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                
                <Separator className="my-4" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 p-2 rounded-md text-left text-destructive hover:bg-destructive/10"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                {updateSuccess && (
                  <div className="bg-success/10 text-success p-4 rounded-md mb-6">
                    Your profile has been updated successfully.
                  </div>
                )}
                
                {(formErrors.form || updateProfileError) && (
                  <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                    {formErrors.form || updateProfileError}
                  </div>
                )}
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-destructive mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="currentPassword" className="text-sm font-medium">
                          Current Password
                        </label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleChange}
                        />
                        {formErrors.currentPassword && (
                          <p className="text-sm text-destructive mt-1">{formErrors.currentPassword}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-medium">
                          New Password
                        </label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleChange}
                        />
                        {formErrors.newPassword && (
                          <p className="text-sm text-destructive mt-1">{formErrors.newPassword}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                          Confirm New Password
                        </label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                        {formErrors.confirmPassword && (
                          <p className="text-sm text-destructive mt-1">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateProfileLoading}>
                      {updateProfileLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
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
                    <h3 className="text-lg font-medium mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order updates</p>
                          <p className="text-sm text-muted-foreground">
                            Receive emails about your orders
                          </p>
                        </div>
                        <div className="flex items-center h-6">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            defaultChecked
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Promotional emails</p>
                          <p className="text-sm text-muted-foreground">
                            Receive emails about new products and deals
                          </p>
                        </div>
                        <div className="flex items-center h-6">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Privacy</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Use data to improve services</p>
                          <p className="text-sm text-muted-foreground">
                            Allow us to use your browsing data to improve our services
                          </p>
                        </div>
                        <div className="flex items-center h-6">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            defaultChecked
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Danger Zone</h3>
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