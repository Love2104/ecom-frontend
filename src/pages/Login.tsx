import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Login = () => {
  const { login, managerLogin, loginLoading, loginError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isManagerLogin, setIsManagerLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keyCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    location.search.includes('error=google_failed') ? 'Google sign-in failed. Please try again.' : ''
  );

  const returnTo = location.state?.returnTo || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo);
    }
  }, [isAuthenticated, navigate, returnTo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isManagerLogin) {
      if (!formData.keyCode.trim()) {
        setError('Please enter your Manager Access Key');
        return;
      }
      const result = await managerLogin({
        key_code: formData.keyCode.trim(),
        password: formData.password
      });
      if (result.success) {
        navigate(returnTo);
      } else {
        setError(result.error || 'Invalid Manager Key');
      }
      return;
    }

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    const result = await login({
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      navigate(returnTo);
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  return (
    <div className="bg-background-light font-display text-primary min-h-screen overflow-hidden">
      <div className="flex min-h-screen">
        
        {/* Left Side: Dark Ink Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center px-12">
          {/* Decorative Elements */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-red/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 w-full max-w-lg">
            <Link to="/" className="flex items-center gap-3 mb-12 hover:opacity-90 transition-opacity inline-flex">
              <div className="w-12 h-12 bg-accent-gold rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary font-bold">shopping_bag</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">ShopEase</h1>
            </Link>
            
            <div className="space-y-8">
              <h2 className="text-6xl font-extrabold text-white leading-tight font-display">
                Shop <span className="text-accent-gold italic">Smarter.</span><br/>
                Live <span className="text-accent-red italic">Better.</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-md font-body">Experience the pinnacle of curated commerce. Our AI-driven platform matches your lifestyle with the world's finest essentials.</p>
            </div>
            
            {/* Floating Product Cards Simulation */}
            <div className="mt-16 grid grid-cols-2 gap-6 opacity-80">
              <div className="transition-transform hover:-translate-y-1 duration-300 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-full h-32 rounded-lg bg-zinc-800 mb-4 overflow-hidden">
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop" alt="Headphones" />
                </div>
                <div className="h-2 w-2/3 bg-white/20 rounded"></div>
                <div className="mt-2 h-2 w-1/3 bg-accent-gold/40 rounded"></div>
              </div>
              <div className="transition-transform hover:-translate-y-1 duration-300 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm mt-8">
                <div className="w-full h-32 rounded-lg bg-zinc-800 mb-4 overflow-hidden">
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop" alt="Watch" />
                </div>
                <div className="h-2 w-2/3 bg-white/20 rounded"></div>
                <div className="mt-2 h-2 w-1/3 bg-accent-red/40 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Cream Auth Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-cream px-6 py-12">
          <div className="w-full max-w-md">
            
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link to="/" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-red text-3xl">shopping_bag</span>
                <span className="text-2xl font-black text-primary tracking-tighter">ShopEase</span>
              </Link>
            </div>

            {/* Card Container */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_10px_30px_-10px_rgba(10,10,15,0.15)] border border-primary/5">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-primary font-display">Welcome Back</h3>
                <p className="text-primary/50 mt-1 font-body text-sm">Please enter your details to continue</p>
              </div>

              {/* Toggle Login/Register */}
              <div className="flex p-1 bg-background-light rounded-xl mb-6">
                <button className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-white shadow-sm text-primary transition-all">Login</button>
                <Link to="/register" className="flex-1 py-2.5 text-sm font-semibold text-primary/50 hover:text-primary transition-all flex justify-center">Register</Link>
              </div>

              {(error || loginError) && (
                <div className="bg-accent-red/10 text-accent-red text-sm font-bold p-3 rounded-xl mb-6">
                  {error || loginError}
                </div>
              )}

              {/* Manager Toggle */}
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsManagerLogin(!isManagerLogin);
                    setError('');
                    setFormData({ email: '', password: '', keyCode: '' });
                  }}
                  className="text-xs text-primary/50 font-bold hover:text-primary transition-colors underline underline-offset-4"
                >
                  {isManagerLogin ? 'Switch to Standard Login' : 'Login as Manager'}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {isManagerLogin ? (
                  <>
                    <div className="relative group">
                      <input 
                        id="keyCode" 
                        name="keyCode" 
                        type={showPassword ? 'text' : 'password'}
                        value={formData.keyCode}
                        onChange={handleChange}
                        placeholder=" " 
                        className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-red focus:ring-0 focus:bg-white transition-all outline-none"
                        required 
                      />
                      <label htmlFor="keyCode" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-red pointer-events-none">Manager Key</label>
                      <button type="button" className="absolute right-4 top-4 text-primary/30 hover:text-accent-red" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="relative group">
                      <input 
                        id="password" 
                        name="password" 
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder=" " 
                        className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-red focus:ring-0 focus:bg-white transition-all outline-none"
                        required 
                      />
                      <label htmlFor="password" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-red pointer-events-none">Manager Password</label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative group">
                      <input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email}
                        onChange={handleChange}
                        placeholder=" " 
                        className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-red focus:ring-0 focus:bg-white transition-all outline-none"
                        required 
                      />
                      <label htmlFor="email" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-red pointer-events-none">Email Address</label>
                    </div>

                    <div className="relative group">
                      <input 
                        id="password" 
                        name="password" 
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder=" " 
                        className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-red focus:ring-0 focus:bg-white transition-all outline-none"
                        required 
                      />
                      <label htmlFor="password" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-red pointer-events-none">Password</label>
                      <button type="button" className="absolute right-4 top-4 text-primary/30 hover:text-accent-red" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </>
                )}

                {!isManagerLogin && (
                  <div className="flex items-center justify-between text-sm font-body">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="rounded text-accent-red focus:ring-accent-red/20 border-primary/20 bg-background-light w-4 h-4 cursor-pointer" />
                      <span className="text-primary/60 group-hover:text-primary transition-colors font-medium">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-accent-red font-bold hover:underline">Forgot password?</Link>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loginLoading}
                  className="w-full py-4 bg-primary text-white font-bold tracking-widest uppercase rounded-xl hover:bg-primary/90 transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 text-xs disabled:opacity-50"
                >
                  {loginLoading ? 'Signing in...' : (isManagerLogin ? 'Access Dashboard' : 'Sign In')}
                </button>
              </form>

              {!isManagerLogin && (
                <>
                  <div className="relative flex items-center my-8">
                    <div className="flex-grow border-t border-primary/10"></div>
                    <span className="flex-shrink mx-4 text-primary/30 text-[10px] font-bold uppercase tracking-widest">Or with email</span>
                    <div className="flex-grow border-t border-primary/10"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/10 hover:bg-primary/5 transition-colors font-display"
                      onClick={() => window.location.href = `${BACKEND_URL}/api/auth/google`}
                    >
                      <img className="w-5 h-5" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                      <span className="text-sm font-bold text-primary">Google</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/10 hover:bg-primary/5 transition-colors font-display" onClick={() => alert("Apple Login needs configuration")}>
                      <svg className="w-5 h-5 text-primary" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                      <span className="text-sm font-bold text-primary">Apple</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer Links */}
            <div className="mt-12 flex justify-center gap-6 text-xs text-primary/40 font-bold uppercase tracking-widest">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/support" className="hover:text-primary transition-colors">Help</Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;