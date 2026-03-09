import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

// Confetti particle component
const ConfettiParticle = ({ delay, color, left }: { delay: number; color: string; left: number }) => (
  <div
    className="fixed top-0 pointer-events-none z-50 w-2 h-2 rounded-full opacity-0"
    style={{
      left: `${left}%`,
      backgroundColor: color,
      animation: `confettiFall 3s ease-in ${delay}ms forwards`,
    }}
  />
);

const CONFETTI_COLORS = ['#E63946', '#F4A261', '#2A9D8F', '#E9C46A', '#264653', '#A8DADC'];
const confettiItems = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  delay: Math.random() * 2000,
  color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  left: Math.random() * 100,
}));

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const token = useSelector((state: RootState) => state.auth.token);
  const [order, setOrder] = useState<Order | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !token) return;

    // AbortController ensures React 18 Strict Mode double-mount
    // aborts the first redundant request cleanly
    const controller = new AbortController();

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`, {
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();

        if (data?.success && data?.order) {
          setOrder(data.order);
          setShowConfetti(true);
          setTimeout(() => setAnimationStage(1), 100);
          setTimeout(() => setAnimationStage(2), 600);
          setTimeout(() => setAnimationStage(3), 1000);
          setTimeout(() => setShowConfetti(false), 4000);
        } else {
          setError('Order not found');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return; // Cancelled — not an error
        setError(err.message ?? 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Cleanup: abort the inflight request if component unmounts or orderId changes
    return () => controller.abort();
  }, [orderId, token]); // Only stable primitive values in deps — no function refs

  if (loading || !order) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background-light flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-primary/5 border-b-accent-gold animate-spin animate-reverse" />
        </div>
        <p className="font-display font-bold text-primary/40 animate-pulse">Confirming your order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background-light flex items-center justify-center p-6">
        <div className="bg-white border border-primary/5 rounded-2xl p-10 max-w-lg w-full text-center shadow-lg">
          <span className="material-symbols-outlined text-accent-red text-5xl mb-4">error</span>
          <h1 className="font-display font-bold text-2xl text-primary mb-2">Order Not Found</h1>
          <p className="text-primary/60 mb-8">{error}</p>
          <Link to="/products" className="inline-block bg-primary text-white font-sans font-bold text-sm px-8 py-3 rounded-full hover:bg-primary/90 transition-all">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light font-display text-primary min-h-[calc(100vh-64px)] relative overflow-hidden pb-20">

      {/* Confetti */}
      {showConfetti && confettiItems.map(p => (
        <ConfettiParticle key={p.id} delay={p.delay} color={p.color} left={p.left} />
      ))}

      {/* Animated success background ring */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 transition-all duration-1000 ease-out pointer-events-none z-0 ${animationStage >= 1 ? 'w-[200vw] h-[200vw] opacity-100' : 'w-0 h-0 opacity-0'}`}
      />

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes scaleBounce {
          0% { transform: scale(0); }
          60% { transform: scale(1.15); }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-scale-bounce { animation: scaleBounce 0.7s ease forwards; }
        .animate-slide-up-1 { animation: slideUp 0.5s ease 0.3s forwards; opacity: 0; }
        .animate-slide-up-2 { animation: slideUp 0.5s ease 0.6s forwards; opacity: 0; }
        .animate-slide-up-3 { animation: slideUp 0.5s ease 0.9s forwards; opacity: 0; }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 pt-16 md:pt-24 relative z-10">

        {/* Success Header with animated checkmark */}
        <div className={`text-center mb-12 transition-all duration-700 ${animationStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Animated check circle */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className={`w-28 h-28 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 ${animationStage >= 1 ? 'animate-scale-bounce' : ''}`}>
              <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none">
                <polyline
                  points="20,50 42,72 80,28"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="100"
                  strokeDashoffset={animationStage >= 1 ? 0 : 100}
                  style={{ transition: 'stroke-dashoffset 0.7s ease 0.4s' }}
                />
              </svg>
            </div>
            {/* Pulse rings */}
            <div className={`absolute inset-0 rounded-full border-2 border-primary/20 ${animationStage >= 1 ? 'animate-ping' : ''}`} style={{ animationDuration: '2s' }} />
          </div>

          <div className="animate-slide-up-1">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 font-sans font-bold text-xs uppercase tracking-widest rounded-full mb-4">
              Payment Confirmed ✓
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4 animate-slide-up-1">
            Thank you for <br />your purchase!
          </h1>
          <p className="font-sans text-primary/60 max-w-md mx-auto animate-slide-up-2">
            Your order has been placed and is now being prepared. We've sent a confirmation to your email.
          </p>
        </div>

        {/* Order Number Banner */}
        <div className="bg-primary text-white rounded-2xl px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 animate-slide-up-2">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-1">Order Number</p>
            <p className="font-display font-bold text-lg tracking-wide">{order.id.substring(0, 12).toUpperCase()}...</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-1">Status</p>
            <span className="inline-block bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white">
              {order.status}
            </span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-primary/5 rounded-3xl p-6 sm:p-10 shadow-sm animate-slide-up-2">
          <h2 className="font-display font-bold text-xl mb-6 pb-4 border-b border-primary/10">Order Summary</h2>

          <div className="space-y-4 mb-8">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 items-center group">
                <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-primary/30">package_2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{item.product_name || 'Product'}</h3>
                  <p className="font-sans text-sm text-primary/50">Qty: {item.quantity}</p>
                </div>
                <div className="font-bold text-sm">
                  {formatPrice(item.price_at_purchase * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-primary/10 pt-6 space-y-3">
            <div className="flex justify-between text-sm text-primary/60 font-sans">
              <span>Subtotal</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-primary/60 font-sans">
              <span>Shipping</span>
              <span className="text-green-600 font-bold">Free</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-primary/10">
              <span>Total Paid</span>
              <span className="text-2xl font-display">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6 animate-slide-up-3">
          <div className="bg-white border border-primary/5 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
            </div>
            <div>
              <p className="font-bold text-sm">Estimated Delivery</p>
              <p className="text-primary/50 text-sm font-sans">3–5 business days</p>
            </div>
          </div>
          <div className="bg-white border border-primary/5 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">mail</span>
            </div>
            <div>
              <p className="font-bold text-sm">Confirmation Email</p>
              <p className="text-primary/50 text-sm font-sans">Check your inbox</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-3">
          <Link
            to="/products"
            className="bg-primary text-white font-sans font-bold text-sm px-10 py-4 rounded-full hover:bg-primary/90 transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-sm">shopping_bag</span>
            Continue Shopping
          </Link>
          <Link
            to="/account"
            state={{ tab: 'orders' }}
            className="bg-primary/5 text-primary font-sans font-bold text-sm px-10 py-4 rounded-full hover:bg-primary/10 transition-all text-center border border-primary/10"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
