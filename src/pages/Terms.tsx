import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-16 px-6 font-body">
      <div className="max-w-3xl w-full bg-white p-10 rounded-2xl shadow-sm border border-primary/5">
        <h1 className="text-4xl font-display font-bold text-primary mb-6">Terms of Service</h1>
        <p className="text-primary/60 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-primary/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using ShopEase, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">2. User Accounts</h2>
            <p>
              When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">3. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of ShopEase and its licensors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">4. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-primary/10">
          <Link to="/register" className="text-accent-red font-bold hover:underline">
            &larr; Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
