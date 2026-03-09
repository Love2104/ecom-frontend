import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import useApi from '@/hooks/useApi';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { fetchData, loading } = useApi({ requireAuth: false });

    const urlEmail = searchParams.get('email') || '';
    const urlCode = searchParams.get('code') || '';

    const [email, setEmail] = useState(urlEmail);
    const [otp, setOtp] = useState(urlCode);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !otp) {
            showToast('Email and reset code are required', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        const response = await fetchData({
            url: '/auth/reset-password',
            method: 'POST',
            body: { email, otp, password: newPassword }
        });

        if (response && response.success) {
            showToast('Password reset successful. Please login.', 'success');
            navigate('/login');
        } else {
            showToast(response?.message || 'Password reset failed', 'error');
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
                            <span className="material-symbols-outlined text-white text-5xl">key</span>
                        </div>
                        <h1 className="text-white text-5xl font-extrabold tracking-tight mb-6">Create New Password</h1>
                        <p className="text-white/60 font-sans text-lg leading-relaxed">
                            Your new password must be unique and different from passwords you've used before.
                        </p>
                    </div>
                    
                    <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent-gold/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                {/* Form Right Side */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-cream px-6 py-12 relative overflow-y-auto">
                    <div className="max-w-md w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 my-auto">
                        
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Set Password</h2>
                            <p className="font-sans text-primary/60">
                                Secure your account with a fresh password.
                            </p>
                        </div>

                        <form onSubmit={handleReset} className="space-y-6">
                            
                            <div className="relative group">
                                <input 
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    readOnly={!!urlEmail}
                                    className={`peer w-full bg-transparent border-b border-primary/20 pb-2 pt-6 font-sans text-lg text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-transparent ${urlEmail ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    placeholder="name@example.com"
                                    required
                                />
                                <label 
                                    htmlFor="email"
                                    className="absolute left-0 top-4 font-sans text-primary/40 text-sm font-bold uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:text-primary peer-focus:text-xs peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-primary peer-not-placeholder-shown:text-xs"
                                >
                                    Email Address
                                </label>
                            </div>

                            <div className="relative group">
                                <input 
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-primary/20 pb-2 pt-6 font-sans text-lg text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-transparent tracking-[0.25em]"
                                    placeholder="000000"
                                    required
                                />
                                <label 
                                    htmlFor="otp"
                                    className="absolute left-0 top-4 font-sans text-primary/40 text-sm font-bold uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:text-primary peer-focus:text-xs peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-primary peer-not-placeholder-shown:text-xs"
                                >
                                    Verification Code
                                </label>
                            </div>

                            <div className="relative group">
                                <input 
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-primary/20 pb-2 pt-6 font-sans text-lg text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-transparent"
                                    placeholder="••••••••"
                                    required
                                />
                                <label 
                                    htmlFor="newPassword"
                                    className="absolute left-0 top-4 font-sans text-primary/40 text-sm font-bold uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:text-primary peer-focus:text-xs peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-primary peer-not-placeholder-shown:text-xs"
                                >
                                    New Password
                                </label>
                            </div>

                            <div className="relative group">
                                <input 
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="peer w-full bg-transparent border-b border-primary/20 pb-2 pt-6 font-sans text-lg text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-transparent"
                                    placeholder="••••••••"
                                    required
                                />
                                <label 
                                    htmlFor="confirmPassword"
                                    className="absolute left-0 top-4 font-sans text-primary/40 text-sm font-bold uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:text-primary peer-focus:text-xs peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-primary peer-not-placeholder-shown:text-xs"
                                >
                                    Confirm New Password
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || !email || !otp || !newPassword || !confirmPassword}
                                className="w-full bg-primary text-white font-sans font-bold py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-8"
                            >
                                {loading ? 'Processing...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResetPassword;
