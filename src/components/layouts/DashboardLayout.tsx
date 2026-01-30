import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { UserRole } from '@/types';
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
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import useAuth from '@/hooks/useAuth';

interface DashboardLayoutProps {
    allowedRoles: UserRole[];
    title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ allowedRoles, title }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { returnTo: location.pathname } });
            return;
        }

        if (user && !allowedRoles.includes(user.role as UserRole)) {
            // Redirect based on actual role
            if (user.role === UserRole.SUPERADMIN) navigate('/admin');
            else if (user.role === UserRole.MANAGER) navigate('/manager');
            else if (user.role === UserRole.SUPPLIER) navigate('/supplier');
            else navigate('/');
        }
    }, [isAuthenticated, user, navigate, location.pathname, allowedRoles]);

    if (!isAuthenticated || (user && !allowedRoles.includes(user.role as UserRole))) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Define navigation based on role
    const getNavItems = () => {
        const role = user?.role as UserRole;
        if (role === UserRole.SUPERADMIN || role === UserRole.MANAGER) {
            const prefix = role === UserRole.SUPERADMIN ? '/admin' : '/manager';
            return [
                { path: prefix, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                { path: `${prefix}/orders`, label: 'All Orders', icon: <Package size={20} /> },
                { path: `${prefix}/products`, label: 'All Products', icon: <ShoppingBag size={20} /> },
                { path: `${prefix}/users`, label: 'Users', icon: <Users size={20} /> },
                { path: `${prefix}/supplier-requests`, label: 'Supplier Requests', icon: <Users size={20} /> },
            ];
        } else if (role === UserRole.SUPPLIER) {
            return [
                { path: '/supplier', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                { path: '/supplier/orders', label: 'My Orders', icon: <ShoppingBag size={20} /> },
                { path: '/supplier/products', label: 'My Products', icon: <Package size={20} /> },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow flex">
                {/* Sidebar */}
                <div className="hidden md:block w-64 bg-card border-r border-border">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-primary">{title || 'Dashboard'}</h2>
                        <p className="text-sm text-muted-foreground">
                            {user?.name}
                        </p>
                    </div>
                    <Separator />
                    <nav className="p-4">
                        <ul className="space-y-2">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${location.pathname === item.path
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

export default DashboardLayout;
