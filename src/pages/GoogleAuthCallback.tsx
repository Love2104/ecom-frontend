import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '@/store/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      navigate('/login?error=google_failed');
      return;
    }

    // Fetch the user profile using the Google-issued JWT
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.success && data.user) {
          dispatch(loginAction({ token, user: data.user }));
          navigate('/');
        } else {
          navigate('/login?error=google_failed');
        }
      } catch {
        navigate('/login?error=google_failed');
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center flex-col gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="font-display text-primary font-bold tracking-widest text-sm uppercase">
        Signing you in with Google...
      </p>
    </div>
  );
};

export default GoogleAuthCallback;
