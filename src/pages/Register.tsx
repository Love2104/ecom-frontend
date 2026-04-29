import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Register = () => {
  const { register, registerLoading, registerError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    if (errors.form) {
      setErrors((prev) => ({ ...prev, form: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
      });

      // Redirect to verification page
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: formData.email } });
      }, 1500);
    } else {
      setErrors({
        form: result.error || 'Registration failed. Please try again.',
      });
    }
  };

  if (success) {
    return (
      <div className="bg-background-light font-display text-primary min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-[0_10px_30px_-10px_rgba(10,10,15,0.15)] border border-primary/5">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
          <h2 className="text-3xl font-extrabold mb-4 font-display">Registration Successful!</h2>
          <div className="bg-green-500/10 text-green-700 p-4 rounded-xl mb-8 font-bold text-sm">
            Account created! Please check your email for the verification code. Redirecting...
          </div>
          <Link to="/verify-otp" state={{ email: formData.email }} className="bg-primary text-white py-4 px-8 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all block text-center">
            Enter Code Manually
          </Link>
        </div>
      </div>
    );
  }

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
              <h2 className="text-6xl font-light text-white leading-tight">
                Join <span className="text-accent-gold italic font-medium">Us.</span><br/>
                Unlock <span className="text-accent-red italic font-medium">Luxury.</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-md font-body">Create an account to gain exclusive access to premium collections, personalized recommendations, and early access to drops.</p>
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
                <h3 className="text-2xl font-bold text-primary font-display">Create an Account</h3>
                <p className="text-primary/50 mt-1 font-body text-sm">Enter your information below</p>
              </div>

              {/* Toggle Login/Register */}
              <div className="flex p-1 bg-background-light rounded-xl mb-6">
                <Link to="/login" className="flex-1 py-2.5 text-sm font-semibold text-primary/50 hover:text-primary transition-all flex justify-center">Login</Link>
                <button className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-white shadow-sm text-primary transition-all">Register</button>
              </div>

              {(errors.form || registerError) && (
                <div className="bg-accent-red/10 text-accent-red text-sm font-bold p-3 rounded-xl mb-6">
                  {errors.form || registerError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative group">
                    <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      value={formData.name}
                      onChange={handleChange}
                      placeholder=" " 
                      className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-red focus:ring-0 focus:bg-white transition-all outline-none"
                    />
                    <label htmlFor="name" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-red pointer-events-none">Full Name</label>
                  </div>
                  {errors.name && <p className="text-xs text-accent-red font-bold px-2">{errors.name}</p>}

                  <div className="relative group">
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=" " 
                      className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-red focus:ring-0 focus:bg-white transition-all outline-none"
                    />
                    <label htmlFor="email" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-red pointer-events-none">Email</label>
                  </div>
                  {errors.email && <p className="text-xs text-accent-red font-bold px-2">{errors.email}</p>}

                  <div className="relative group">
                    <input 
                      id="password" 
                      name="password" 
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder=" " 
                      className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-red focus:ring-0 focus:bg-white transition-all outline-none"
                    />
                    <label htmlFor="password" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-red pointer-events-none">Password</label>
                    <button type="button" className="absolute right-4 top-4 text-primary/30 hover:text-accent-red" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-accent-red font-bold px-2">{errors.password}</p>}

                  <div className="relative group">
                    <input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder=" " 
                      className="peer block w-full px-4 pt-6 pb-2 text-primary font-body bg-zinc-50 border-0 border-b-2 border-primary/10 rounded-t-xl focus:border-accent-red focus:ring-0 focus:bg-white transition-all outline-none"
                    />
                    <label htmlFor="confirmPassword" className="absolute left-4 top-4 text-primary/50 text-xs font-bold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-accent-red pointer-events-none">Confirm Password</label>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-accent-red font-bold px-2">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start text-sm font-body pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="rounded text-accent-red focus:ring-accent-red/20 border-primary/20 bg-background-light w-4 h-4 cursor-pointer mt-0.5" 
                    />
                    <span className="text-primary/60 group-hover:text-primary transition-colors font-medium">
                      I agree to the <Link to="/terms" className="text-primary hover:underline font-bold">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline font-bold">Privacy Policy</Link>
                    </span>
                  </label>
                </div>
                {errors.agreeTerms && <p className="text-xs text-accent-red font-bold px-2">{errors.agreeTerms}</p>}

                <button 
                  type="submit" 
                  disabled={registerLoading}
                  className="w-full mt-4 py-4 bg-primary text-white font-bold tracking-widest uppercase rounded-xl hover:bg-primary/90 transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 text-xs disabled:opacity-50"
                >
                  {registerLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-primary/10"></div>
                <span className="flex-shrink mx-4 text-primary/30 text-[10px] font-bold uppercase tracking-widest">Or continue with</span>
                <div className="flex-grow border-t border-primary/10"></div>
              </div>

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={() => window.location.href = `${BACKEND_URL}/api/auth/google`}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-primary/10 hover:bg-primary/5 transition-colors font-display"
              >
                <img className="w-5 h-5" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                <span className="text-sm font-bold text-primary">Continue with Google</span>
              </button>
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

export default Register;
