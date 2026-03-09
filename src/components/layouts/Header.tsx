import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/authSlice';
import useCart from '@/hooks/useCart';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 frosted-glass border-b border-primary/5 transition-all ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            </div>
            <Link to="/" className="font-display text-2xl font-extrabold tracking-tight">ShopEase</Link>
          </div>
          
          {/* Links */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/products?category=men" className="font-sans text-sm font-bold hover:text-accent-red transition-colors">Men</Link>
            <Link to="/products?category=women" className="font-sans text-sm font-bold hover:text-accent-red transition-colors">Women</Link>
            <Link to="/products?category=electronics" className="font-sans text-sm font-bold hover:text-accent-red transition-colors">Electronics</Link>
            <Link to="/products?category=home" className="font-sans text-sm font-bold hover:text-accent-red transition-colors">Home</Link>
          </div>
          
          {/* Search + Cart + Buttons */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-primary/5 rounded-full px-4 py-2 border border-primary/10">
              <span className="material-symbols-outlined text-primary/40 text-xl">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-40 placeholder:text-primary/40 focus:outline-none ml-2" 
                placeholder="Search products..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Link to="/cart" className="relative p-2 hover:bg-primary/5 rounded-full">
              <span className="material-symbols-outlined">shopping_cart</span>
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-accent-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-4">
                <Link to="/account" className="relative hover:opacity-80 transition-opacity" title="My Account">
                  <div className="w-9 h-9 rounded-full bg-accent-gold flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : user?.name ? (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    ) : (
                      <span className="material-symbols-outlined text-lg">person</span>
                    )}
                  </div>
                </Link>
                <button onClick={handleLogout} className="px-6 py-2.5 bg-primary/5 text-primary font-sans font-bold text-sm rounded-full hover:bg-primary/10 transition-all">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block px-6 py-2.5 bg-primary text-white font-sans font-bold text-sm rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">
                Login
              </Link>
            )}

            <button className="md:hidden p-2 hover:bg-primary/5 rounded-full" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
               <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-background-light border-b border-primary/5 p-6 space-y-4 shadow-xl">
             <form onSubmit={handleSearch} className="flex items-center bg-primary/5 rounded-full px-4 py-3 border border-primary/10">
              <span className="material-symbols-outlined text-primary/40 text-xl">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-primary/40 focus:outline-none ml-2" 
                placeholder="Search products..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="flex flex-col space-y-4">
              <Link to="/products?category=men" className="font-sans font-bold text-lg">Men</Link>
              <Link to="/products?category=women" className="font-sans font-bold text-lg">Women</Link>
              <Link to="/products?category=electronics" className="font-sans font-bold text-lg">Electronics</Link>
              <Link to="/products?category=home" className="font-sans font-bold text-lg">Home</Link>
            </div>
            {!isAuthenticated && (
              <Link to="/login" className="block w-full text-center px-6 py-3 bg-primary text-white font-sans font-bold text-sm rounded-full">
                Login / Register
              </Link>
            )}
            {isAuthenticated && (
               <Link to="/account" className="block w-full text-center px-6 py-3 bg-primary/10 text-primary font-sans font-bold text-sm rounded-full">
                My Account
              </Link>
            )}
          </div>
        )}
      </nav>
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-20"></div>
    </>
  );
};

export default Header;