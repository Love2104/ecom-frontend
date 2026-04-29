import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-16 px-6 font-body">
      <div className="max-w-3xl w-full bg-white p-10 rounded-2xl shadow-sm border border-primary/5">
        <h1 className="text-4xl font-display font-bold text-primary mb-6">Privacy Policy</h1>
        <p className="text-primary/60 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-primary/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">1. Information We Collect</h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our Service to you, including: Personal Data (such as email address, name, phone number) and Usage Data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">2. Use of Data</h2>
            <p>
              ShopEase uses the collected data for various purposes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To provide customer support</li>
              <li>To monitor the usage of our Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">3. Security of Data</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
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

export default Privacy;
