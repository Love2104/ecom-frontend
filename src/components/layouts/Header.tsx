import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingCart, Menu, X, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { RootState } from '@/store';
import { logout } from '@/store/authSlice';
import useCart from '@/hooks/useCart';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { itemCount, fetchCart } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    setSearchQuery(searchParam || '');
  }, [location.search]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Optional: Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 bg-background border-b border-border transition-shadow ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4 py-4 relative">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">ShopEase</Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-foreground hover:text-primary transition-colors ${location.pathname === '/' ? 'font-medium text-primary' : ''}`}>Home</Link>
            <Link to="/products" className={`text-foreground hover:text-primary transition-colors ${location.pathname.startsWith('/products') && !location.pathname.includes('/products/') ? 'font-medium text-primary' : ''}`}>Products</Link>
          </nav>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 text-muted-foreground">
                <Search size={18} />
              </button>
            </div>
          </form>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-foreground hover:text-primary transition-colors" />
              {itemCount > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {itemCount > 99 ? '99+' : itemCount}
                </Badge>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                {user?.role === 'admin' && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin">Admin</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                <Link to="/account">
                  <User className="h-6 w-6 text-foreground hover:text-primary transition-colors" />
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-foreground hover:text-primary transition-colors" aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-background border-t border-border shadow-md px-4 py-6 z-50">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative w-full">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 text-muted-foreground">
                  <Search size={18} />
                </button>
              </div>
            </form>

            <nav className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className={`text-foreground hover:text-primary transition-colors ${location.pathname === '/' ? 'font-medium text-primary' : ''}`}>
                Home
              </Link>
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className={`text-foreground hover:text-primary transition-colors ${location.pathname.startsWith('/products') && !location.pathname.includes('/products/') ? 'font-medium text-primary' : ''}`}>
                Products
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/account" onClick={() => setIsMenuOpen(false)} className="text-foreground hover:text-primary transition-colors">
                    My Account
                  </Link>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="text-foreground hover:text-primary transition-colors">
                    My Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-foreground hover:text-primary transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;