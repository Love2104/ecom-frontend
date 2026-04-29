import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import useAuth from '@/hooks/useAuth';

const RESEND_COOLDOWN = 30;

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { verifyOtp, resendOtp } = useAuth();

    const email = location.state?.email;
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            showToast('No email found to verify. Please register again.', 'error');
            navigate('/register');
        }
    }, [email]);

    // Countdown timer for resend button
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // only digits
        const updated = [...digits];
        updated[index] = value.slice(-1); // one char per box
        setDigits(updated);
        // auto-focus next
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const updated = Array(6).fill('');
        pasted.split('').forEach((char, i) => { updated[i] = char; });
        setDigits(updated);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const otp = digits.join('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
            showToast('Please enter all 6 digits', 'error');
            return;
        }
        setLoading(true);
        const result = await verifyOtp(email, otp);
        setLoading(false);

        if (result.success) {
            showToast('Account verified! Welcome to ShopEase 🎉', 'success');
            navigate('/');
        } else {
            showToast(result.error || 'Verification failed', 'error');
            // Clear digits on error
            setDigits(Array(6).fill(''));
            inputRefs.current[0]?.focus();
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || resendLoading) return;
        setResendLoading(true);
        const result = await resendOtp(email);
        setResendLoading(false);
        if (result.success) {
            showToast('OTP resent! Please check your email.', 'success');
            setCooldown(RESEND_COOLDOWN);
        } else {
            showToast(result.error || 'Failed to resend OTP', 'error');
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
                        <h1 className="text-white text-5xl font-extrabold tracking-tight mb-6">Check Your Email</h1>
                        <p className="text-white/60 font-sans text-lg leading-relaxed">
                            We sent a 6-digit code to<br/>
                            <strong className="text-white">{email}</strong>
                        </p>
                    </div>
                    <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent-gold/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                {/* Verification Form Right Side */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-cream px-6 py-12 relative">
                    <div className="max-w-md w-full z-10">

                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Enter Code</h2>
                            <p className="font-sans text-primary/60 text-sm">
                                Please enter the 6-digit code sent to<br/>
                                <strong className="text-primary">{email}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-8">
                            {/* 6-Box OTP Input */}
                            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                                {digits.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-white text-primary outline-none transition-all
                                            ${digit ? 'border-primary' : 'border-primary/20'}
                                            focus:border-accent-red focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]`}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-primary text-white font-sans font-bold py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Verifying...
                                    </span>
                                ) : 'Verify Account'}
                            </button>
                        </form>

                        {/* Resend OTP */}
                        <div className="mt-8 text-center font-sans">
                            <p className="text-primary/60 text-sm mb-3">Didn't receive the code?</p>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={cooldown > 0 || resendLoading}
                                className="text-sm font-bold text-primary hover:text-accent-red transition-colors disabled:text-primary/40 disabled:cursor-not-allowed"
                            >
                                {resendLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/register" className="text-xs font-bold text-primary/40 hover:text-primary transition-colors inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Register
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
