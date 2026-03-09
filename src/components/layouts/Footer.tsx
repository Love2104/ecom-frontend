import { Link } from 'react-router-dom';
import { useState } from 'react';

// Policy Modal Component
const PolicyModal = ({ title, content, onClose }: { title: string; content: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 md:p-12">
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 hover:bg-primary/10 transition-colors">
        <span className="material-symbols-outlined text-primary text-xl">close</span>
      </button>
      <h2 className="font-display font-extrabold text-2xl mb-6 text-primary">{title}</h2>
      <div className="font-body text-primary/70 space-y-4 text-sm leading-relaxed">
        {content}
      </div>
    </div>
  </div>
);

const Footer = () => {
  const [activeModal, setActiveModal] = useState<'shipping' | 'returns' | 'contact' | null>(null);

  return (
    <>
      <footer className="bg-primary text-white mt-24">
        {/* Top section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand Column */}
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-gold rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary font-bold">shopping_bag</span>
                </div>
                <span className="font-display font-extrabold text-xl">ShopEase</span>
              </Link>
              <p className="text-white/50 font-body text-sm leading-relaxed max-w-xs">
                Curated luxury and everyday essentials. India's premium shopping destination since 2024.
              </p>
              <div className="flex gap-3">
                {['photo_camera', 'tag', 'thumb_up'].map((icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-accent-gold hover:border-accent-gold transition-all">
                    <span className="material-symbols-outlined text-white text-sm">{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-6 text-white/40">Shop</h4>
              <ul className="space-y-3 text-sm font-body">
                {[
                  { label: 'All Products', to: '/products' },
                  { label: 'Men', to: '/products?category=men' },
                  { label: 'Women', to: '/products?category=women' },
                  { label: 'Electronics', to: '/products?category=electronics' },
                  { label: 'Home & Decor', to: '/products?category=home' },
                ].map(item => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-white/50 hover:text-white transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-6 text-white/40">Account</h4>
              <ul className="space-y-3 text-sm font-body">
                {[
                  { label: 'My Profile', to: '/account' },
                  { label: 'My Orders', to: '/account' },
                  { label: 'Cart', to: '/cart' },
                  { label: 'Login', to: '/login' },
                ].map(item => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-white/50 hover:text-white transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Policies */}
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-widest mb-6 text-white/40">Help & Support</h4>
              <ul className="space-y-3 text-sm font-body">
                <li>
                  <button onClick={() => setActiveModal('contact')} className="text-white/50 hover:text-accent-gold transition-colors text-left flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">chat</span> Contact Us
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('shipping')} className="text-white/50 hover:text-accent-gold transition-colors text-left flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">local_shipping</span> Shipping Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveModal('returns')} className="text-white/50 hover:text-accent-gold transition-colors text-left flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">sync</span> Returns & Exchanges
                  </button>
                </li>
                <li>
                  <a href="mailto:support@shopease.in" className="text-white/50 hover:text-white transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">mail</span> support@shopease.in
                  </a>
                </li>
                <li>
                  <a href="tel:+918001234567" className="text-white/50 hover:text-white transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">call</span> +91 800 123 4567
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs font-body">© {new Date().getFullYear()} ShopEase. All rights reserved. Made with ❤️ in India.</p>
            <div className="flex items-center gap-3 text-white/30 text-xs">
              <span className="material-symbols-outlined text-sm">lock</span> 256-bit SSL Secured Payments
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Modals */}
      {activeModal === 'contact' && (
        <PolicyModal
          title="Contact Us"
          onClose={() => setActiveModal(null)}
          content={
            <>
              <p className="font-bold text-primary text-base">We're here to help you 24/7!</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <div className="bg-primary/5 rounded-2xl p-4">
                  <p className="font-bold text-primary mb-1 flex items-center gap-2"><span className="material-symbols-outlined text-sm">mail</span> Email Support</p>
                  <a href="mailto:support@shopease.in" className="text-accent-red font-bold">support@shopease.in</a>
                  <p className="text-xs mt-1">Response within 24 hours</p>
                </div>
                <div className="bg-primary/5 rounded-2xl p-4">
                  <p className="font-bold text-primary mb-1 flex items-center gap-2"><span className="material-symbols-outlined text-sm">call</span> Phone Support</p>
                  <a href="tel:+918001234567" className="text-accent-red font-bold">+91 800 123 4567</a>
                  <p className="text-xs mt-1">Mon–Sat, 9AM–7PM IST</p>
                </div>
              </div>
              <p>For order tracking, visit <strong>Account → Orders</strong>. Include your Order ID in all email queries for faster resolution.</p>
            </>
          }
        />
      )}

      {activeModal === 'shipping' && (
        <PolicyModal
          title="Shipping Policy"
          onClose={() => setActiveModal(null)}
          content={
            <>
              <p><strong>Free Standard Shipping</strong> on all orders above ₹999. Orders below ₹999 attract a flat ₹49 shipping fee.</p>
              <p><strong>Delivery Timeframes:</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Metro cities (Delhi, Mumbai, Bangalore, Chennai): 2–4 business days</li>
                <li>Tier-2 cities: 4–6 business days</li>
                <li>Remote areas: 6–10 business days</li>
              </ul>
              <p><strong>Express Delivery</strong> available at checkout for ₹149 (1–2 business days in metro cities).</p>
              <p>All orders dispatched within 24 hours of payment confirmation. You'll receive a tracking link via email and SMS once dispatched.</p>
            </>
          }
        />
      )}

      {activeModal === 'returns' && (
        <PolicyModal
          title="Returns & Exchanges"
          onClose={() => setActiveModal(null)}
          content={
            <>
              <p>We offer a <strong>30-day hassle-free return and exchange policy</strong> for most items.</p>
              <p><strong>Conditions for Return:</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Item must be in original condition with tags attached</li>
                <li>Original packaging must be intact</li>
                <li>Proof of purchase (order ID) required</li>
                <li>Perishables, undergarments, and customised products are non-returnable</li>
              </ul>
              <p><strong>How to Initiate a Return:</strong></p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                <li>Go to <strong>Account → Orders</strong></li>
                <li>Select the order and click "Return / Exchange"</li>
                <li>Choose your reason and submit</li>
                <li>Our team schedules a pickup within 48 hours</li>
              </ol>
              <p><strong>Refunds</strong> are processed within 5–7 business days to the original payment method after the item is received and inspected.</p>
            </>
          }
        />
      )}
    </>
  );
};

export default Footer;