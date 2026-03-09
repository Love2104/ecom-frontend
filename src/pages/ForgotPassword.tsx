import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import useApi from '@/hooks/useApi';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { fetchData, loading: isLoading } = useApi({ requireAuth: false });
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            showToast('Please enter your email address', 'error');
            return;
        }

        const response = await fetchData({
            url: '/auth/forgot-password',
            method: 'POST',
            body: { email }
        });

        if (response && response.success) {
            setIsSubmitted(true);
            showToast('Reset link sent to your email', 'success');
        } else {
            showToast(response?.message || 'Failed to send reset link', 'error');
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
                            <span className="material-symbols-outlined text-white text-5xl">lock_reset</span>
                        </div>
                        <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Reset Your Password</h1>
                        <p className="text-white/60 font-sans text-lg leading-relaxed">
                            Don't worry, it happens to the best of us. Let's get you back into your account.
                        </p>
                    </div>
                    
                    <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent-gold/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                {/* Form Right Side */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-cream px-6 py-12 relative">
                    <div className="max-w-md w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        
                        {isSubmitted ? (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-4xl text-success">mark_email_unread</span>
                                </div>
                                <h2 className="text-3xl font-extrabold tracking-tight mb-3">Check Your Email</h2>
                                <p className="font-sans text-primary/60 mb-8 leading-relaxed">
                                    We've sent a password reset link to <br/>
                                    <strong className="text-primary">{email}</strong>
                                </p>
                                <button 
                                    onClick={() => setIsSubmitted(false)} 
                                    className="w-full bg-primary/5 text-primary font-sans font-bold py-4 rounded-xl hover:bg-primary/10 transition-all active:scale-[0.98] mb-6"
                                >
                                    Try Another Email
                                </button>
                                <Link to="/login" className="text-sm font-bold text-primary hover:text-accent-red transition-colors inline-flex items-center">
                                    <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
                                    Back to Login
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="mb-10 text-center">
                                    <h2 className="text-3xl font-extrabold tracking-tight mb-3">Forgot Password?</h2>
                                    <p className="font-sans text-primary/60">
                                        Enter your email address to receive a secure password reset link.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="relative group">
                                        <input 
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="peer w-full bg-transparent border-b border-primary/20 pb-2 pt-6 font-sans text-lg text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-transparent"
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

                                    <button 
                                        type="submit" 
                                        disabled={isLoading || !email.trim()}
                                        className="w-full bg-primary text-white font-sans font-bold py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-8"
                                    >
                                        {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                                    </button>
                                </form>

                                <div className="mt-10 text-center font-sans">
                                    <Link to="/login" className="text-sm font-bold text-primary hover:text-accent-red transition-colors inline-flex items-center">
                                        <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
                                        Remembered your password? Login
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;
