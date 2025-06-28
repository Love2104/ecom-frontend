import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import ProductForm from '@/components/admin/ProductForm';
import useProducts from '@/hooks/useProducts';

const AddProduct = () => {
  const navigate = useNavigate();
  const { createProduct, loading } = useProducts();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get user and authentication status from Redux store
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Check if user is an admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      // Redirect non-admin users
      navigate('/login', { 
        state: { 
          returnTo: '/admin/products/add', 
          message: 'You must be an admin to access this page' 
        } 
      });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);
    const result = await createProduct(formData);
    if (result.success) {
      setSuccess(true);
      // Redirect to product list after successful creation
      setTimeout(() => navigate('/admin/products'), 2000);
    } else {
      setError(result.error || 'Unknown error');
    }
    return result;
  };

  // Don't render anything if not an admin
  if (!isAuthenticated || user?.role !== 'admin') {
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