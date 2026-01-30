import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
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
        <div className="container mx-auto px-4 py-16 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Verify Your Email</CardTitle>
                    <CardDescription className="text-center">
                        We have sent a 6-digit verification code to <strong>{email}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Verification Code</label>
                            <Input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                type="text"
                                maxLength={6}
                                className="text-center text-lg letter-spacing-2"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={api.loading}>
                            {api.loading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyOtp;
