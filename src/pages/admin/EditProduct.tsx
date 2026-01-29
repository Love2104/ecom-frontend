import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import ProductForm from '@/components/admin/ProductForm';
import useProducts from '@/hooks/useProducts';
import { Product } from '@/types';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchProductById, updateProduct, loading } = useProducts();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user is an admin or supplier
  useEffect(() => {
    const isAuthorized = user?.role === 'SUPERADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPPLIER';
    if (!isAuthenticated || !isAuthorized) {
      navigate('/login', {
        state: {
          returnTo: location.pathname,
          message: 'You must be an admin or supplier to access this page'
        }
      });
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const result = await fetchProductById(id);
      if (result.success) {
        setProduct(result.product);
      } else {
        setError(result.error || 'Failed to fetch product');
      }
    };
    fetchData();
  }, [fetchProductById, id]);

  // Form submission handler
  const handleSubmit = async (formData: FormData) => {
    if (!id) return { success: false, error: 'Missing product ID' };
    setError(null);
    setSuccess(false);

    const result = await updateProduct(id, formData);
    if (result.success) {
      setSuccess(true);
      const redirectPath = user?.role === 'SUPPLIER' ? '/supplier' : '/admin/products';
      setTimeout(() => navigate(redirectPath), 2000);
    } else {
      setError(result.error || 'Failed to update product');
    }
    return result;
  };

  const isAuthorized = user?.role === 'SUPERADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPPLIER';

  // Don't render anything if not authorized
  if (!isAuthenticated || !isAuthorized) {
    return null;
  }

  // Render loading state
  if (loading.fetch && !product) {
    return <div className="text-center py-8">Loading product details...</div>;
  }

  // Render error state
  if (error && !product) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-xl mx-auto mt-8 text-center">
        {error}
      </div>
    );
  }

  // Product not found
  if (!product) {
    return <div className="text-center py-8">Product not found.</div>;
  }

  // Render the product form with initial data
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6">
          Product updated successfully! Redirecting...
        </div>
      )}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={loading.update}
      />
    </div>
  );
};

export default EditProduct;
