import { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { Button } from '../ui/Button';
import { Separator } from '../ui/Separator';
import useAuth from '@/hooks/useAuth';

const AdminLayout = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: location.pathname } });
    } else if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, location.pathname]);
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/orders', label: 'Orders', icon: <Package size={20} /> },
    { path: '/admin/products', label: 'Products', icon: <ShoppingBag size={20} /> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-card border-r border-border">
          <div className="p-6">
            <h2 className="text-lg font-bold text-primary">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Manage your store
            </p>
          </div>
          <Separator />
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </Button>
          </nav>
        </div>
        
        {/* Main content */}
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;