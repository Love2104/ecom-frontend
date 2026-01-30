import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import useApi from '@/hooks/useApi';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { fetchData, loading: isLoading } = useApi();
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
            body: { email },
            requireAuth: false
        });

        if (response && response.success) {
            setIsSubmitted(true);
            showToast('Reset link sent to your email', 'success');
        } else {
            showToast(response?.message || 'Failed to send reset link', 'error');
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we'll send you a link to reset your password
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {isSubmitted ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                <Mail size={32} />
                            </div>
                            <h3 className="font-semibold text-lg">Check your email</h3>
                            <p className="text-muted-foreground text-sm">
                                We have sent a password reset link to <strong>{email}</strong>
                            </p>
                            <Button onClick={() => setIsSubmitted(false)} variant="outline" className="mt-4">
                                Try another email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center">
                    <Link to="/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={14} className="mr-2" />
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ForgotPassword;
