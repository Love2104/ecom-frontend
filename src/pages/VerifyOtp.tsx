import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import useApi from '@/hooks/useApi';
import { useDispatch } from 'react-redux';
import { login } from '@/store/authSlice';

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const dispatch = useDispatch();
    const api = useApi();

    // Get email from router state (passed from register page)
    const email = location.state?.email;
    const [otp, setOtp] = useState('');

    useEffect(() => {
        if (!email) {
            showToast('No email found to verify. Please register again.', 'error');
            navigate('/register');
        }
    }, [email, navigate, showToast]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length < 6) {
            showToast('Please enter a valid 6-digit code', 'error');
            return;
        }

        const response = await api.fetchData({
            url: '/auth/verify-otp',
            method: 'POST',
            body: { email, otp }
        });

        if (response && response.success) {
            showToast('Account verified successfully!', 'success');
            // Auto login logic
            dispatch(login({
                user: response.user,
                token: response.token,
            }));
            navigate('/');
        } else {
            showToast(response?.error?.message || 'Verification failed', 'error');
        }
    };

    return (
        <div className="bg-background-light font-display text-primary min-h-screen">
            <div className="flex min-h-screen">
                
                {/* Visual Left Sidebar */}
                <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center px-12">
                    <div className="absolute top-0 left-0 w-full h-full bg-hero-grid-texture opacity-20"></div>
                    <div className="absolute top-10 left-10 flex items-center gap-2 z-10">
                        <div className="bg-white text-primary p-2 rounded-xl">
                            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                        </div>
                        <span className="text-white font-extrabold text-2xl tracking-tighter">ShopEase</span>
                    </div>

                    <div className="relative z-10 max-w-lg text-center">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/20">
                            <span className="material-symbols-outlined text-white text-5xl">mark_email_read</span>
                        </div>
                        <h1 className="text-white text-5xl font-extrabold tracking-tight mb-6">Verify Your Email</h1>
                        <p className="text-white/60 font-sans text-lg leading-relaxed">
                            We've sent a 6-digit code to securely confirm your new account.
                        </p>
                    </div>
                    
                    <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent-gold/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                {/* Verification Form Right Side */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-cream px-6 py-12 relative">
                    <div className="max-w-md w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Enter Code</h2>
                            <p className="font-sans text-primary/60">
                                Please enter the verification code sent to <br/>
                                <strong className="text-primary">{email}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="relative group">
                                <input 
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="peer w-full bg-transparent border-b-2 border-primary/20 pb-2 pt-6 text-2xl tracking-[1em] text-center font-bold text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-transparent"
                                    placeholder="000000"
                                    required
                                />
                                <label 
                                    htmlFor="otp"
                                    className="absolute left-1/2 -translate-x-1/2 top-4 font-sans text-primary/40 text-sm font-bold uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:text-primary peer-focus:text-xs peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-primary peer-not-placeholder-shown:text-xs"
                                >
                                    6-Digit Code
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={api.loading || otp.length < 6}
                                className="w-full bg-primary text-white font-sans font-bold py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-8"
                            >
                                {api.loading ? 'Verifying...' : 'Verify Account'}
                            </button>
                        </form>

                        <div className="mt-10 text-center font-sans">
                            <p className="text-primary/60 text-sm mb-4">
                                Didn't receive the code?
                            </p>
                            <Link to="/register" className="text-sm font-bold text-primary hover:text-accent-red transition-colors inline-flex items-center">
                                <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
                                Go Back & Try Again
                            </Link>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default VerifyOtp;
