import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import ProductForm from '@/components/admin/ProductForm';
import useProducts from '@/hooks/useProducts';

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createProduct, loading } = useProducts();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get user and authentication status from Redux store
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Check if user is an admin or supplier
  useEffect(() => {
    const isAuthorized = user?.role === 'SUPERADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPPLIER';
    if (!isAuthenticated || !isAuthorized) {
      // Redirect unauthorized users
      navigate('/login', {
        state: {
          returnTo: location.pathname,
          message: 'You must be an admin or supplier to access this page'
        }
      });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);

    console.log('Submitting product data:', Object.fromEntries(formData.entries()));

    const result = await createProduct(formData);
    if (result.success) {
      setSuccess(true);
      // Redirect to appropriate product list after successful creation
      const redirectPath = user?.role === 'SUPPLIER' ? '/supplier' : '/admin/products';
      setTimeout(() => navigate(redirectPath), 2000);
    } else {
      setError(result.error || 'Unknown error');
    }
    return result;
  };

  const isAuthorized = user?.role === 'SUPERADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPPLIER';

  // Don't render anything if not authorized
  if (!isAuthenticated || !isAuthorized) {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Add New Product</h1>
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6">
          Product created successfully! Redirecting...
        </div>
      )}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      <ProductForm onSubmit={handleSubmit} isLoading={loading.create} />
    </div>
  );
};

export default AddProduct;