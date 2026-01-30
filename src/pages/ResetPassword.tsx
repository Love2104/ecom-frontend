import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import useApi from '@/hooks/useApi';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { fetchData, loading } = useApi();

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
            body: { email, otp, password: newPassword },
            requireAuth: false
        });

        if (response && response.success) {
            showToast('Password reset successful. Please login.', 'success');
            navigate('/login');
        } else {
            showToast(response?.message || 'Password reset failed', 'error');
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Set New Password</CardTitle>
                    <CardDescription className="text-center">
                        Secure your account with a new password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleReset} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                readOnly={!!urlEmail}
                                className={urlEmail ? 'bg-muted' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Verification Code</label>
                            <Input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter code from email"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input
                                type="password"
                                placeholder="Min 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm New Password</label>
                            <Input
                                type="password"
                                placeholder="Repeat new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Processing...' : 'Reset Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
